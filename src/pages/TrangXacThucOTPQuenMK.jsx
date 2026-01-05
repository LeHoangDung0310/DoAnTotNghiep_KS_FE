import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import '../styles/login.css';
import { FaEnvelope, FaKey, FaHotel, FaArrowRight, FaRedo } from 'react-icons/fa';

export default function TrangXacThucOTPQuenMK() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location.state?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
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
    if (!otp) {
      setMessage({ type: 'error', text: 'Vui lòng nhập mã OTP.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const resp = await api.post('/api/QuenMatKhau/xac-thuc-otp', { Email: email, MaOTP: otp });
      const data = resp.data;
      const success = data?.Success ?? data?.success ?? false;

      if (success) {
        setMessage({ type: 'success', text: 'Mã OTP chính xác. Vui lòng đặt mật khẩu mới.' });
        setTimeout(() => {
          navigate('/quen-mat-khau/dat-lai', { state: { email, maOtp: otp } });
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data?.Message ?? 'Mã OTP không hợp lệ.' });
      }
    } catch (err) {
      console.error('Xac thuc OTP error:', err);
      const resp = err?.response;
      const text = resp?.data?.Message ?? resp?.data?.message ?? 'Lỗi khi gọi API.';
      setMessage({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Cần email để gửi lại OTP.' });
      return;
    }
    setLoading(true);
    try {
      const resp = await api.post('/api/QuenMatKhau/gui-otp', { Email: email });
      const data = resp.data;
      setMessage({
        type: data?.Success ? 'success' : 'error',
        text: data?.Message ?? 'Đã gửi lại mã OTP mới.'
      });
    } catch (err) {
      console.error('Resend OTP error:', err);
      setMessage({ type: 'error', text: 'Lỗi khi gửi lại OTP.' });
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
            <div className="auth-header-centered">
              <div className="brand-logo-small">
                <FaHotel />
              </div>
              <h2 className="auth-v2-title">Xác thực OTP</h2>
              <p className="auth-v2-subtitle">Bước cuối cùng để khôi phục mật khẩu</p>
            </div>

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

              <div className="form-v2-group">
                <label className="form-v2-label">Mã OTP (6 chữ số)</label>
                <div className="input-v2-wrapper">
                  <FaKey className="input-icon" />
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength="6"
                    className="input-otp"
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" className="btn-v2-submit" disabled={loading}>
                {loading ? (
                  <span className="loading-spinner-small"></span>
                ) : (
                  <>
                    <span>Tiếp Theo</span>
                    <FaArrowRight />
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn-v2-secondary"
                onClick={handleResend}
                disabled={loading}
              >
                <FaRedo />
                <span>Gửi lại mã OTP</span>
              </button>
            </form>

            <div className="auth-v2-footer">
              <Link to="/login" className="link-v2-signup"> Quay về đăng nhập</Link>
              <p style={{ marginTop: '24px', fontSize: '12px' }}>
                Nếu không nhận được mã, vui lòng kiểm tra kỹ email hoặc nhấn gửi lại.
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