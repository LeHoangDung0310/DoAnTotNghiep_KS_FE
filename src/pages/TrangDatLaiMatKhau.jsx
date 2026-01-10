import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import '../styles/login.css';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaKey, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3800);
      return () => clearTimeout(t);
    }
  }, [message]);

  const validate = () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Email không được để trống.' });
      return false;
    }
    if (!maOtp) {
      setMessage({ type: 'error', text: 'Mã OTP không được để trống.' });
      return false;
    }
    if (!matKhauMoi || matKhauMoi.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới tối thiểu 6 ký tự.' });
      return false;
    }
    if (matKhauMoi !== xacNhan) {
      setMessage({ type: 'error', text: 'Xác nhận mật khẩu không khớp.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        Email: email,
        MaOTP: maOtp,
        MatKhauMoi: matKhauMoi,
        XacNhanMatKhau: xacNhan
      };
      const resp = await api.post('/api/QuenMatKhau/dat-lai-mat-khau', payload);
      const data = resp.data;
      const success = data?.Success ?? data?.success ?? false;

      if (success) {
        setMessage({
          type: 'success',
          text: data?.Message ?? 'Đặt lại mật khẩu thành công!'
        });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage({
          type: 'error',
          text: data?.Message ?? 'Không thể đặt lại mật khẩu.'
        });
      }
    } catch (err) {
      console.error('Dat lai mat khau error:', err);
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

            <div className="auth-header-centered">
              <div className="brand-logo-small">
                <FaShieldAlt />
              </div>
              <h2 className="auth-v2-title">Đặt lại mật khẩu</h2>
              <p className="auth-v2-subtitle">Nhập mã OTP và mật khẩu mới để bảo vệ tài khoản của bạn.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* Email (Read Only) */}
              <div className="form-v2-group">
                <label className="form-v2-label">Email Tài Khoản</label>
                <div className="input-v2-wrapper">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="form-input-readonly"
                    style={{ background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                  />
                  <FaCheckCircle style={{ position: 'absolute', right: '16px', color: '#10b981' }} />
                </div>
              </div>

              {/* OTP Code */}
              <div className="form-v2-group">
                <label className="form-v2-label">Mã Xác Thực (OTP)</label>
                <div className="input-v2-wrapper">
                  <input
                    type="text"
                    value={maOtp}
                    onChange={e => setMaOtp(e.target.value)}
                    placeholder="Nhập mã 6 số"
                    className="input-otp"
                    maxLength={6}
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="form-v2-group">
                <label className="form-v2-label">Mật khẩu mới</label>
                <div className="input-v2-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={matKhauMoi}
                    onChange={e => setMatKhauMoi(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                  />
                  <button
                    type="button"
                    className="btn-toggle-pw"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-v2-group">
                <label className="form-v2-label">Xác nhận mật khẩu</label>
                <div className="input-v2-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={xacNhan}
                    onChange={e => setXacNhan(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    className="btn-toggle-pw"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-v2-submit" disabled={loading}>
                {loading ? (
                  <span className="loading-spinner-small"></span>
                ) : 'Xác nhận đổi mật khẩu'}
              </button>

              <div className="auth-v2-footer">
                <Link to="/login" className="link-v2-back">
                  <FaArrowLeft />
                  <span>Quay lại đăng nhập</span>
                </Link>
              </div>
            </form>
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