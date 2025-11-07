import React, { useEffect, useState } from 'react';
import '../styles/login.css';
import '../styles/register.css';
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
        // chuyển sang trang xác thực OTP kèm email
        navigate('/xac-thuc-otp', { state: { email } });
      } else {
        setMessage({ type: 'error', text: data?.Message ?? 'Đăng ký không thành công.' });
      }
    } catch (err) {
      console.error('Register error full:', err);
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
    <div className="auth-wrap register-wrap">
      <div className="auth-inner register-inner">
        <aside className="auth-brand">
          <div className="brand-logo">
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect width="24" height="24" rx="6" fill="rgba(255,255,255,0.04)"/>
              <path d="M6 14c1.5-3 4.5-5 8-5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h1>Da Nang Bay</h1>
            <p className="tag">Tạo tài khoản — Bắt đầu trải nghiệm</p>
          </div>

          <div className="brand-features">
            <div>🔐 Bảo mật</div>
            <div>⏱️ Nhanh chóng</div>
            <div>📱 Tương thích</div>
          </div>
        </aside>

        <main className="auth-card register-card" role="main" aria-labelledby="register-title">
          <form onSubmit={handleSubmit} className="register-form" noValidate>
            <h2 id="register-title">Đăng ký tài khoản</h2>
            <p className="form-sub">Nhập thông tin để tạo tài khoản mới</p>

            <div className={`field ${errors.hoTen ? 'has-error' : ''}`}>
              <label className="label">Họ và tên</label>
              <input value={hoTen} onChange={e => setHoTen(e.target.value)} placeholder="Nguyễn Văn A" />
              {errors.hoTen && <div className="field-error">{errors.hoTen}</div>}
            </div>

            <div className={`field ${errors.email ? 'has-error' : ''}`}>
              <label className="label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            <div className="field">
              <label className="label">Số điện thoại (tùy chọn)</label>
              <input value={soDienThoai} onChange={e => setSoDienThoai(e.target.value)} placeholder="0909123456" />
            </div>

            <div className={`field ${errors.password ? 'has-error' : ''}`}>
              <label className="label">Mật khẩu</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Ít nhất 6 ký tự" autoComplete="new-password" />
              {errors.password && <div className="field-error">{errors.password}</div>}
            </div>

            <div className={`field ${errors.confirm ? 'has-error' : ''}`}>
              <label className="label">Xác nhận mật khẩu</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Nhập lại mật khẩu" />
              {errors.confirm && <div className="field-error">{errors.confirm}</div>}
            </div>

            <button className="btn primary lg" type="submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
            </button>

            <div className="divider"><span>hoặc</span></div>

            <div className="socials">
              <button type="button" className="btn social google" onClick={() => setMessage({ type: 'info', text: 'Đăng ký bằng Google (demo).' })}>Google</button>
              <button type="button" className="btn social fb" onClick={() => setMessage({ type: 'info', text: 'Đăng ký bằng Facebook (demo).' })}>Facebook</button>
            </div>

            <p className="signup">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </form>
        </main>
      </div>

      {message && (
        <div className={`toast ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}