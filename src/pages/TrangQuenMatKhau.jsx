import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/forgot.css';

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
    if (!email) { setMessage({ type: 'error', text: 'Vui lòng nhập email.' }); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMessage({ type: 'error', text: 'Email không hợp lệ.' }); return false; }
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
      setMessage({ type: success ? 'success' : 'error', text: data?.Message ?? (success ? 'Đã gửi OTP tới email.' : 'Không thể gửi OTP.') });
      if (success) navigate('/quen-mat-khau/xac-thuc-otp', { state: { email } });
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
    <div className="fm-wrap">
      <div className="fm-card">
        <header className="fm-header">
          <h1>Quên mật khẩu</h1>
          <p className="muted">Nhập email để nhận mã OTP đặt lại mật khẩu.</p>
        </header>

        <form className="fm-form" onSubmit={handleSubmit} noValidate>
          <label className="fm-field">
            <span className="fm-label">Email</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <div className="fm-actions">
            <button type="submit" className="btn primary lg" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>
            <button type="button" className="btn ghost" onClick={() => navigate('/login')}>Hủy</button>
          </div>
        </form>

        <footer className="fm-footer">
          <small className="muted">Không nhận được email? Kiểm tra mục Spam hoặc thử lại sau.</small>
        </footer>
      </div>

      {message && <div className={`toast ${message.type}`}>{message.text}</div>}
    </div>
  );
}