import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/payment-result.css';

export default function PaymentResult() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const status = searchParams.get('status');
    const message = searchParams.get('message');

    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const paymentStatus = searchParams.get('status');
        const maDatPhong = searchParams.get('maDatPhong');
        const pendingMaDatPhong = localStorage.getItem('pendingMaDatPhong');
        const pendingCartId = localStorage.getItem('pendingCartId');

        if (paymentStatus === 'success') {
            // Clean up cart if this was a cart checkout
            if (pendingMaDatPhong === maDatPhong && pendingCartId) {
                const email = localStorage.getItem('userEmail');
                const cartKey = email ? `cart_${email}` : 'cart_guest';
                const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
                const updatedCart = cart.filter(item => String(item.cartId) !== String(pendingCartId));
                localStorage.setItem(cartKey, JSON.stringify(updatedCart));

                // Clear pending info
                localStorage.removeItem('pendingMaDatPhong');
                localStorage.removeItem('pendingCartId');

                // Trigger event for Header
                window.dispatchEvent(new Event('cartUpdated'));
            }
        }
    }, [searchParams]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        if (countdown === 0) {
            navigate('/customer');
        }

        return () => clearInterval(timer);
    }, [countdown, navigate]);

    return (
        <div className="payment-result-container">
            <div className={`result-card ${status}`}>
                <div className="result-icon">
                    {status === 'success' ? '✅' : '❌'}
                </div>
                <h1 className="result-title">
                    {status === 'success' ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
                </h1>
                <p className="result-message">{message}</p>
                <div className="redirect-info">
                    Hệ thống sẽ tự động chuyển về trang chủ sau <strong>{countdown}</strong> giây...
                </div>
                <button className="btn-back-home" onClick={() => navigate('/customer')}>
                    Quay lại trang chủ ngay
                </button>
            </div>
        </div>
    );
}
