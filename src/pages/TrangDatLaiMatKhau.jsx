import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import '../styles/forgot.css';

export default function TrangDatLaiMatKhau() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location.state?.email || '';
  const initialMaOtp = location.state?.maOtp || '';
  const [email, setEmail] = useState(initialEmail);
  const [maOtp, setMaOtp] = useState(initialMaOtp);
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [xacNhan, setXacNhan] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3800);
      return () => clearTimeout(t);
    }
  }, [message]);

  const validate = () => {
    if (!email) { setMessage({ type: 'error', text: 'Email không được để trống.' }); return false; }
    if (!maOtp) { setMessage({ type: 'error', text: 'Mã OTP không được để trống.' }); return false; }
    if (!matKhauMoi || matKhauMoi.length < 6) { setMessage({ type: 'error', text: 'Mật khẩu mới tối thiểu 6 ký tự.' }); return false; }
    if (matKhauMoi !== xacNhan) { setMessage({ type: 'error', text: 'Xác nhận mật khẩu không khớp.' }); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { Email: email, MaOTP: maOtp, MatKhauMoi: matKhauMoi, XacNhanMatKhau: xacNhan };
      const resp = await api.post('/api/QuenMatKhau/dat-lai-mat-khau', payload);
      const data = resp.data;
      const success = data?.Success ?? data?.success ?? false;
      setMessage({ type: success ? 'success' : 'error', text: data?.Message ?? (success ? 'Đặt lại mật khẩu thành công.' : 'Không thể đặt lại mật khẩu.') });
      if (success) setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      console.error('Dat lai mk error:', err);
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
          <h1>Đặt lại mật khẩu</h1>
          <p className="muted">Nhập mật khẩu mới để hoàn tất.</p>
        </header>

        <form className="fm-form" onSubmit={handleSubmit} noValidate>
          <label className="fm-field">
            <span className="fm-label">Email</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </label>

          <label className="fm-field">
            <span className="fm-label">Mã OTP</span>
            <input value={maOtp} onChange={e => setMaOtp(e.target.value)} placeholder="123456" />
          </label>

          <label className="fm-field">
            <span className="fm-label">Mật khẩu mới</span>
            <input type="password" value={matKhauMoi} onChange={e => setMatKhauMoi(e.target.value)} placeholder="Ít nhất 6 ký tự" />
          </label>

          <label className="fm-field">
            <span className="fm-label">Xác nhận mật khẩu</span>
            <input type="password" value={xacNhan} onChange={e => setXacNhan(e.target.value)} />
          </label>

          <div className="fm-actions">
            <button className="btn primary lg" type="submit" disabled={loading}>{loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}</button>
            <button type="button" className="btn ghost" onClick={() => navigate('/login')}>Hủy</button>
          </div>
        </form>
      </div>

      {message && <div className={`toast ${message.type}`}>{message.text}</div>}
    </div>
  );
}