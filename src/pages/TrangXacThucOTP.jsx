import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import '../styles/login.css';

export default function TrangXacThucOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location.state?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3500);
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

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const resp = await api.post('/api/DangKy/xac-thuc-otp', {
        Email: email,
        MaOTP: otp,
      });
      const data = resp.data;
      const success = data?.Success ?? data?.success ?? (resp.status >= 200 && resp.status < 300);

      if (success) {
        setMessage({ type: 'success', text: data?.Message ?? 'Xác thực thành công. Chuyển đến đăng nhập...' });
        setTimeout(() => navigate('/login'), 1200);
      } else {
        setMessage({ type: 'error', text: data?.Message ?? 'Xác thực thất bại.' });
      }
    } catch (err) {
      console.error('OTP verify error:', err);
      const resp = err?.response;
      const serverMsg = resp?.data?.Message ?? resp?.data?.message ?? (resp?.data ? JSON.stringify(resp.data) : null);
      if (resp?.status === 400 || resp?.status === 401) {
        setMessage({ type: 'error', text: serverMsg ?? 'Mã OTP không đúng hoặc đã hết hạn.' });
      } else {
        setMessage({ type: 'error', text: serverMsg ?? 'Lỗi khi gọi API. Vui lòng thử lại.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Cần nhập email để gửi lại OTP.' });
      return;
    }
    setLoading(true);
    try {
      const resp = await api.post('/api/DangKy/gui-lai-otp', { Email: email });
      const data = resp.data;
      setMessage({ 
        type: data?.Success ? 'success' : 'error', 
        text: data?.Message ?? (data?.Success ? 'Đã gửi lại OTP.' : 'Không thể gửi lại OTP.') 
      });
    } catch (err) {
      console.error('Resend OTP error:', err);
      setMessage({ type: 'error', text: 'Lỗi khi gửi lại OTP.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Xác thực tài khoản</h1>
        <p className="login-subtitle">Nhập mã OTP được gửi tới email của bạn để kích hoạt tài khoản.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mã OTP</label>
            <input
              type="text"
              className="form-input otp-input"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="123456"
              maxLength="6"
              inputMode="numeric"
              pattern="\d*"
              autoFocus
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Xác thực'}
          </button>

          <button 
            type="button" 
            className="btn-secondary" 
            onClick={handleResend} 
            disabled={loading}
          >
            Gửi lại OTP
          </button>
        </form>

        <div className="signup-link">
          <Link to="/login">Quay về đăng nhập</Link>
        </div>

        <div className="form-footer">
          <small className="footer-text">
            Mã OTP có hiệu lực trong 5 phút. Kiểm tra cả thư mục Spam nếu không thấy email.
          </small>
        </div>
      </div>

      {message && (
        <div className={`toast-message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}