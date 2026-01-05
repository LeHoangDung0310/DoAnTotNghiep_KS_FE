import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import '../styles/login.css';
import { FaEnvelope, FaHotel, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

export default function TrangQuenMatKhau() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3800);
      return () => clearTimeout(t);
    }
  }, [message]);

  const validate = () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Vui lòng nhập email.' });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: 'error', text: 'Email không hợp lệ.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const resp = await api.post('/api/QuenMatKhau/gui-otp', { Email: email });
      const data = resp.data;
      const success = data?.Success ?? data?.success ?? false;
      setMessage({
        type: success ? 'success' : 'error',
        text: data?.Message ?? (success ? 'Đã gửi mã OTP tới email.' : 'Không thể gửi OTP.')
      });
      if (success) {
        setTimeout(() => {
          navigate('/quen-mat-khau/xac-thuc-otp', { state: { email } });
        }, 1200);
      }
    } catch (err) {
      console.error('Gui OTP error:', err);
      const resp = err?.response;
      const text = resp?.data?.Message ?? resp?.data?.message ?? 'Lỗi khi gọi API.';
      setMessage({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-v2-container">
      <div className="auth-v2-overlay"></div>

      <div className="auth-v2-card centered-card">
        <div className="auth-v2-right">
          <div className="auth-v2-form-box">
            <div className="brand-logo-small" style={{ marginBottom: '24px', textAlign: 'center' }}>
              <div style={{
                width: '48px', height: '48px', background: 'var(--primary-v2)',
                borderRadius: '12px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 16px', color: 'white', fontSize: '24px'
              }}>
                <FaHotel />
              </div>
            </div>
            <h2 className="auth-v2-title" style={{ textAlign: 'center' }}>Quên mật khẩu</h2>
            <p className="auth-v2-subtitle" style={{ textAlign: 'center' }}>
              Nhập email để nhận mã OTP đặt lại mật khẩu của bạn.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-v2-group">
                <label className="form-v2-label">Địa chỉ Email</label>
                <div className="input-v2-wrapper">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                  />
                </div>
              </div>

              <button type="submit" className="btn-v2-submit" disabled={loading}>
                {loading ? (
                  <span className="loading-spinner-small"></span>
                ) : (
                  <>
                    <span>Gửi Mã OTP</span>
                    <FaArrowRight />
                  </>
                )}
              </button>
            </form>

            <div className="auth-v2-footer">
              <Link to="/login" className="link-v2-back" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                color: 'var(--text-muted-v2)', textDecoration: 'none', fontSize: '14px'
              }}>
                <FaArrowLeft />
                <span>Quay lại đăng nhập</span>
              </Link>
              <p style={{ marginTop: '24px', fontSize: '12px', fontStyle: 'italic' }}>
                Không nhận được email? Vui lòng kiểm tra mục Spam.
              </p>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`toast-v2 ${message.type}`}>
          <div className="toast-v2-content">
            <span className="toast-v2-icon">
              {message.type === 'success' ? '✅' : '❌'}
            </span>
            <span className="toast-v2-text">{message.text}</span>
          </div>
          <div className="toast-v2-progress"></div>
        </div>
      )}
    </div>
  );
}