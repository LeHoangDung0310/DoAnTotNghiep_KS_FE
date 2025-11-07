import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import '../styles/forgot.css';

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
    if (!email) { setMessage({ type: 'error', text: 'Vui lòng nhập email.' }); return false; }
    if (!otp) { setMessage({ type: 'error', text: 'Vui lòng nhập mã OTP.' }); return false; }
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
      setMessage({ type: success ? 'success' : 'error', text: data?.Message ?? (success ? 'OTP hợp lệ.' : 'OTP không hợp lệ.') });
      if (success) navigate('/quen-mat-khau/dat-lai', { state: { email, maOtp: otp } });
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
    if (!email) { setMessage({ type: 'error', text: 'Cần email để gửi lại OTP.' }); return; }
    setLoading(true);
    try {
      const resp = await api.post('/api/QuenMatKhau/gui-otp', { Email: email });
      const data = resp.data;
      setMessage({ type: data?.Success ? 'success' : 'error', text: data?.Message ?? 'Đã gửi lại OTP.' });
    } catch (err) {
      console.error('Resend OTP error:', err);
      setMessage({ type: 'error', text: 'Lỗi khi gửi lại OTP.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fm-wrap">
      <div className="fm-card narrow">
        <header className="fm-header">
          <h1>Xác thực OTP</h1>
          <p className="muted">Nhập mã OTP đã gửi đến email để tiếp tục.</p>
        </header>

        <form className="fm-form" onSubmit={handleSubmit} noValidate>
          <label className="fm-field">
            <span className="fm-label">Email</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </label>

          <label className="fm-field">
            <span className="fm-label">Mã OTP</span>
            <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" />
          </label>

          <div className="fm-actions">
            <button type="submit" className="btn primary lg" disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
            </button>
            <button type="button" className="btn ghost" onClick={handleResend} disabled={loading}>Gửi lại OTP</button>
          </div>
        </form>

        <footer className="fm-footer">
          <small className="muted">Mã OTP có hiệu lực trong thời gian ngắn. Nếu hết hạn, hãy gửi lại.</small>
        </footer>
      </div>

      {message && <div className={`toast ${message.type}`}>{message.text}</div>}
    </div>
  );
}