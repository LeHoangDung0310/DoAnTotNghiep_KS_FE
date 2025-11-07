import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../utils/api';

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
    const e = {};
    if (!email) e.email = 'Vui lòng nhập email.';
    if (!otp) e.otp = 'Vui lòng nhập mã OTP.';
    setMessage(null);
    if (Object.keys(e).length > 0) {
      setMessage({ type: 'error', text: Object.values(e).join(' ') });
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
      setMessage({ type: data?.Success ? 'success' : 'error', text: data?.Message ?? (data?.Success ? 'Đã gửi lại OTP.' : 'Không thể gửi lại OTP.') });
    } catch (err) {
      console.error('Resend OTP error:', err);
      setMessage({ type: 'error', text: 'Lỗi khi gửi lại OTP.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-card" role="main" aria-labelledby="otp-title">
        <header className="otp-header">
          <div className="logo">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="2" y="5" width="20" height="14" rx="3" fill="#6C5CE7"/>
              <path d="M7 10h10v1H7z" fill="#FFFFFF" opacity="0.9"/>
              <path d="M7 13h6v1H7z" fill="#FFFFFF" opacity="0.6"/>
            </svg>
          </div>
          <div>
            <h2 id="otp-title">Xác thực tài khoản</h2>
            <p className="sub">Nhập mã OTP được gửi tới email của bạn để kích hoạt tài khoản.</p>
          </div>
        </header>

        <form className="otp-form" onSubmit={handleSubmit} noValidate>
          <label className="input-group">
            <span className="label">Email</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="input-group">
            <span className="label">Mã OTP</span>
            <input
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="123456"
              inputMode="numeric"
              pattern="\d*"
              required
              autoFocus
            />
          </label>

          <div className="actions">
            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Xác thực'}
            </button>

            <button type="button" className="btn ghost" onClick={handleResend} disabled={loading}>
              Gửi lại OTP
            </button>
          </div>

          <div className="links">
            <Link to="/login">Quay về Đăng nhập</Link>
          </div>
        </form>
      </div>

      {message && (
        <div className={`toast ${message.type}`} role="status" aria-live="polite">
          {message.text}
        </div>
      )}
    </div>
  );
}