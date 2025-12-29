import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/cart.css';

export default function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadCart();
        window.addEventListener('cartUpdated', loadCart);
        return () => window.removeEventListener('cartUpdated', loadCart);
    }, []);

    const getCartKey = () => {
        const email = localStorage.getItem('userEmail');
        return email ? `cart_${email}` : 'cart_guest';
    };

    const loadCart = () => {
        const cart = JSON.parse(localStorage.getItem(getCartKey()) || '[]');
        setCartItems(cart);
    };

    const removeFromCart = (cartId) => {
        const updatedCart = cartItems.filter(item => item.cartId !== cartId);
        localStorage.setItem(getCartKey(), JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const handleCheckout = async (item) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('Vui lòng đăng nhập để thanh toán!');
            navigate('/login');
            return;
        }

        try {
            const bookingData = {
                ngayNhanPhong: item.ngayNhanPhong,
                ngayTraPhong: item.ngayTraPhong,
                danhSachPhong: [
                    {
                        maPhong: item.maPhong,
                        soNguoi: 2
                    }
                ]
            };

            const resBooking = await api.post('/api/DatPhong', bookingData);

            if (resBooking.data?.success) {
                const maDatPhong = resBooking.data.data.maDatPhong;
                localStorage.setItem('pendingMaDatPhong', maDatPhong);
                localStorage.setItem('pendingCartId', item.cartId);

                const soNgay = Math.max(1, (new Date(item.ngayTraPhong) - new Date(item.ngayNhanPhong)) / (1000 * 60 * 60 * 24));
                const soTien = item.giaMoiDem * soNgay;

                const resVNPay = await api.post('/api/ThanhToan/create-vnpay-url', {
                    maDatPhong,
                    soTien
                });

                if (resVNPay.data?.success) {
                    window.location.href = resVNPay.data.data;
                } else {
                    alert('Không thể tạo liên kết thanh toán.');
                }
            } else {
                alert(resBooking.data?.message || 'Có lỗi xảy ra khi đặt phòng');
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Lỗi hệ thống');
        }
    };

    const formatPrice = (price) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    return (
        <div className="cart-page-wrapper">
            <div className="cart-container">
                <div className="cart-header-section">
                    <h1 className="cart-title">Giỏ hàng của bạn</h1>
                    <div className="cart-stepper">
                        <div className="step active">
                            <span className="step-num">1</span>
                            <span>Giỏ hàng</span>
                        </div>
                        <div className="step-line"></div>
                        <div className="step">
                            <span className="step-num">2</span>
                            <span>Thanh toán</span>
                        </div>
                        <div className="step-line"></div>
                        <div className="step">
                            <span className="step-num">3</span>
                            <span>Hoàn tất</span>
                        </div>
                    </div>
                </div>

                {cartItems.length === 0 ? (
                    <div className="empty-cart-premium">
                        <div className="empty-cart-vis">🛍️</div>
                        <h2>Giỏ hàng đang trống!</h2>
                        <p>Dường như bạn chưa chọn được căn phòng ưng ý cho chuyến đi sắp tới.</p>
                        <button className="btn-explore-now" onClick={() => navigate('/customer')}>
                            Khám phá ngay
                        </button>
                    </div>
                ) : (
                    <div className="cart-list">
                        {cartItems.map((item) => {
                            const soNgay = Math.max(1, (new Date(item.ngayTraPhong) - new Date(item.ngayNhanPhong)) / (1000 * 60 * 60 * 24));
                            const tongTien = item.giaMoiDem * soNgay;

                            return (
                                <div key={item.cartId} className="cart-item-card">
                                    <img
                                        src={`${api.defaults.baseURL}${item.hinhAnh}`}
                                        alt={item.tenLoaiPhong}
                                        className="cart-item-image"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/240x160?text=Hotel+Room'; }}
                                    />

                                    <div className="cart-item-content">
                                        <div className="cart-item-header">
                                            <h3 className="cart-item-title">{item.tenLoaiPhong} - Phòng {item.soPhong}</h3>
                                            <button className="btn-remove-item" onClick={() => removeFromCart(item.cartId)} title="Xóa khỏi giỏ hàng">
                                                ✕
                                            </button>
                                        </div>

                                        <div className="cart-item-details">
                                            <div className="detail-pill"><span>📅</span> Nhận: {new Date(item.ngayNhanPhong).toLocaleDateString('vi-VN')}</div>
                                            <div className="detail-pill"><span>📅</span> Trả: {new Date(item.ngayTraPhong).toLocaleDateString('vi-VN')}</div>
                                            <div className="detail-pill"><span>💰</span> {formatPrice(item.giaMoiDem)}/đêm</div>
                                            <div className="detail-pill"><span>⏳</span> {soNgay} đêm</div>
                                        </div>

                                        <div className="cart-item-footer">
                                            <div className="item-total-price">
                                                {formatPrice(tongTien)}
                                            </div>
                                            <button className="btn-checkout-item" onClick={() => handleCheckout(item)}>
                                                Thanh toán ngay →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
