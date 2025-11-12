import React, { useEffect, useState } from 'react';
import '../styles/login.css';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => localStorage.getItem('savedEmail') || '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => !!localStorage.getItem('savedEmail'));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3500);
      return () => clearTimeout(t);
    }
  }, [message]);

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Vui lòng nhập email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email không hợp lệ.';
    if (!password) e.password = 'Vui lòng nhập mật khẩu.';
    else if (password.length < 6) e.password = 'Mật khẩu ít nhất 6 ký tự.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const extractRole = (obj) => {
    if (!obj) return undefined;
    const payload = obj?.Data ?? obj?.data ?? obj;
    const candidates = [
      payload?.UserInfo?.VaiTro, payload?.UserInfo?.Role,
      payload?.userInfo?.vaiTro, payload?.userInfo?.role,
      payload?.VaiTro, payload?.vaiTro, payload?.Role, payload?.role,
      payload?.Roles
    ];
    for (const c of candidates) {
      if (!c) continue;
      if (typeof c === 'string' && c.trim()) return c;
      if (Array.isArray(c) && c.length) {
        const first = c[0];
        if (typeof first === 'string' && first.trim()) return first;
      }
    }
    return undefined;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const payload = { Email: email, MatKhau: password };
      const resp = await api.post('/api/Login/login', payload);
      const data = resp.data;
      console.log('Login response:', data);
      const success = data?.Success ?? data?.success ?? false;

      if (success) {
        const token = data?.Data?.AccessToken ?? data?.AccessToken ?? data?.accessToken ?? data?.token;
        const refresh = data?.Data?.RefreshToken ?? data?.RefreshToken ?? data?.refreshToken;
        if (token) {
          localStorage.setItem('accessToken', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        if (refresh) localStorage.setItem('refreshToken', refresh);
        if (remember) localStorage.setItem('savedEmail', email);
        else localStorage.removeItem('savedEmail');

        const role = extractRole(data);
        if (role) localStorage.setItem('userRole', typeof role === 'string' ? role : JSON.stringify(role));
        setMessage({ type: 'success', text: data?.Message ?? 'Đăng nhập thành công!' });

        setTimeout(() => {
          const r = (typeof role === 'string' ? role : (Array.isArray(role) && role[0]) ? role[0] : '')?.toLowerCase() ?? '';
          if (r.includes('admin')) navigate('/admin');
          else if (r.includes('le') || r.includes('lễ') || r.includes('reception') || r.includes('receptionist')) navigate('/reception');
          else navigate('/customer');
        }, 1000);
      } else {
        setMessage({ type: 'error', text: data?.Message ?? 'Email hoặc mật khẩu không chính xác.' });
      }
    } catch (err) {
      console.error('Login error:', err);
      const resp = err?.response;
      if (resp?.status === 401 || resp?.status === 400) {
        setMessage({ type: 'error', text: 'Email hoặc mật khẩu không chính xác.' });
      } else {
        setMessage({ type: 'error', text: 'Đã xảy ra lỗi. Vui lòng thử lại!' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Đăng Nhập</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="lehoangdung@gmail.com"
              autoComplete="username"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              autoComplete="current-password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>

            <Link to="/quen-mat-khau" className="forgot-link">
              Quên mật khẩu?
            </Link>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>

        <p className="signup-text">
          Chưa có tài khoản? <Link to="/register" className="signup-link-inline">Đăng ký ngay</Link>
        </p>
      </div>

      {message && (
        <div className={`toast-message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}