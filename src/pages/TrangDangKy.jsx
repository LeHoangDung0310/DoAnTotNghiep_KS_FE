import React, { useEffect, useState } from 'react';
import '../styles/login.css';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';

export default function TrangDangKy() {
  const navigate = useNavigate();
  const [hoTen, setHoTen] = useState('');
  const [email, setEmail] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
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
    if (!hoTen) e.hoTen = 'Vui lòng nhập họ tên.';
    if (!email) e.email = 'Vui lòng nhập email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email không hợp lệ.';
    if (!password) e.password = 'Vui lòng nhập mật khẩu.';
    else if (password.length < 6) e.password = 'Mật khẩu ít nhất 6 ký tự.';
    if (password !== confirm) e.confirm = 'Xác nhận mật khẩu không khớp.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const payload = {
        HoTen: hoTen,
        Email: email,
        MatKhau: password,
        SoDienThoai: soDienThoai
      };

      const resp = await api.post('/api/DangKy/dang-ky', payload);
      const data = resp.data;
      const success = data?.Success ?? data?.success ?? false;

      if (success) {
        setMessage({ type: 'success', text: data?.Message ?? 'Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP.' });
        navigate('/xac-thuc-otp', { state: { email } });
      } else {
        setMessage({ type: 'error', text: data?.Message ?? 'Đăng ký không thành công.' });
      }
    } catch (err) {
      console.error('Register error:', err);
      const resp = err?.response;
      const serverMsg = resp?.data?.Message ?? resp?.data?.message ?? (resp?.data ? JSON.stringify(resp.data) : null);
      if (resp?.status === 400) {
        setMessage({ type: 'error', text: serverMsg ?? 'Dữ liệu không hợp lệ hoặc email đã tồn tại.' });
      } else {
        setMessage({ type: 'error', text: serverMsg ?? 'Lỗi khi gọi API. Vui lòng thử lại.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box register-box">
        <h1 className="login-title">Đăng Ký</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Họ và tên</label>
            <input
              type="text"
              className={`form-input ${errors.hoTen ? 'error' : ''}`}
              value={hoTen}
              onChange={(e) => setHoTen(e.target.value)}
              placeholder="Nguyễn Văn A"
              autoComplete="name"
            />
            {errors.hoTen && <span className="error-text">{errors.hoTen}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Số điện thoại (tùy chọn)</label>
            <input
              type="tel"
              className="form-input"
              value={soDienThoai}
              onChange={(e) => setSoDienThoai(e.target.value)}
              placeholder="0909123456"
              autoComplete="tel"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ít nhất 6 ký tự"
              autoComplete="new-password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Xác nhận mật khẩu</label>
            <input
              type="password"
              className={`form-input ${errors.confirm ? 'error' : ''}`}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
            />
            {errors.confirm && <span className="error-text">{errors.confirm}</span>}
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng Ký'}
          </button>
        </form>

        <div className="signup-link">
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
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