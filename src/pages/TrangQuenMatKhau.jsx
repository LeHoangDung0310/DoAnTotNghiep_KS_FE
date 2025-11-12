import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import '../styles/login.css';

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
        text: data?.Message ?? (success ? 'Đã gửi OTP tới email.' : 'Không thể gửi OTP.') 
      });
      if (success) {
        setTimeout(() => {
          navigate('/quen-mat-khau/xac-thuc-otp', { state: { email } });
        }, 1000);
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
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Quên mật khẩu</h1>
        <p className="login-subtitle">Nhập email để nhận mã OTP đặt lại mật khẩu.</p>

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

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
          </button>
        </form>

        <p className="back-to-login">
          <Link to="/login">Quay lại đăng nhập</Link>
        </p>

        <div className="form-footer">
          <small className="footer-text">
            Không nhận được email? Kiểm tra mục Spam hoặc thử lại sau.
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