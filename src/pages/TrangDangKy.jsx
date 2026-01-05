import React, { useEffect, useState } from 'react';
import '../styles/login.css';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaHotel } from 'react-icons/fa';

export default function TrangDangKy() {
  const navigate = useNavigate();
  const [hoTen, setHoTen] = useState('');
  const [email, setEmail] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
        setMessage({ type: 'success', text: data?.Message ?? 'Đăng ký thành công. Vui lòng kiểm tra email để lấy số OTP.' });
        setTimeout(() => {
          navigate('/xac-thuc-otp', { state: { email } });
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data?.Message ?? 'Đăng ký không thành công.' });
      }
    } catch (err) {
      console.error('Register error:', err);
      const resp = err?.response;
      const serverMsg = resp?.data?.Message ?? resp?.data?.message ?? (resp?.data ? JSON.stringify(resp.data) : null);
      setMessage({ type: 'error', text: serverMsg ?? 'Lỗi khi gọi API. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-v2-container">
      <div className="auth-v2-overlay"></div>

      <div className="auth-v2-card wide-form">
        <div className="auth-v2-left">
          <div className="brand-zone">
            <div className="brand-logo-large">
              <FaHotel />
            </div>
            <h1>Luxurious Hotel</h1>
            <p>Gia nhập cộng đồng thành viên để nhận những ưu đãi đặc quyền và trải nghiệm dịch vụ cá nhân hóa.</p>
          </div>
          <div className="auth-v2-info">
            <div className="info-item">
              <span className="dot"></span>
              <span>Đăng ký nhanh chóng, bảo mật</span>
            </div>
            <div className="info-item">
              <span className="dot"></span>
              <span>Tích lũy điểm thưởng cho mỗi kỳ nghỉ</span>
            </div>
          </div>
        </div>

        <div className="auth-v2-right">
          <div className="auth-v2-form-box">
            <h2 className="auth-v2-title">Tạo tài khoản</h2>
            <p className="auth-v2-subtitle">Khởi đầu hành trình nghỉ dưỡng của bạn</p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-v2-group">
                <label className="form-v2-label">Họ và tên</label>
                <div className={`input-v2-wrapper ${errors.hoTen ? 'has-error' : ''}`}>
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    value={hoTen}
                    onChange={(e) => setHoTen(e.target.value)}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                {errors.hoTen && <span className="error-v2-text">{errors.hoTen}</span>}
              </div>

              <div className="form-v2-group">
                <label className="form-v2-label">Địa chỉ Email</label>
                <div className={`input-v2-wrapper ${errors.email ? 'has-error' : ''}`}>
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                  />
                </div>
                {errors.email && <span className="error-v2-text">{errors.email}</span>}
              </div>

              <div className="form-v2-group">
                <label className="form-v2-label">Số điện thoại</label>
                <div className="input-v2-wrapper">
                  <FaPhone className="input-icon" />
                  <input
                    type="tel"
                    value={soDienThoai}
                    onChange={(e) => setSoDienThoai(e.target.value)}
                    placeholder="0909xxxxxx"
                  />
                </div>
              </div>

              <div className="form-v2-group">
                <label className="form-v2-label">Mật khẩu</label>
                <div className={`input-v2-wrapper ${errors.password ? 'has-error' : ''}`}>
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="btn-toggle-pw"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <span className="error-v2-text">{errors.password}</span>}
              </div>

              <div className="form-v2-group">
                <label className="form-v2-label">Xác nhận mật khẩu</label>
                <div className={`input-v2-wrapper ${errors.confirm ? 'has-error' : ''}`}>
                  <FaLock className="input-icon" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="btn-toggle-pw"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirm && <span className="error-v2-text">{errors.confirm}</span>}
              </div>

              <button type="submit" className="btn-v2-submit" disabled={loading} style={{ marginTop: '10px' }}>
                {loading ? (
                  <span className="loading-spinner-small"></span>
                ) : (
                  <>
                    <span>Đăng Ký Ngay</span>
                    <FaArrowRight />
                  </>
                )}
              </button>
            </form>

            <div className="auth-v2-footer">
              <p>Bạn đã có tài khoản?</p>
              <Link to="/login" className="link-v2-signup">Đăng nhập ngay</Link>
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