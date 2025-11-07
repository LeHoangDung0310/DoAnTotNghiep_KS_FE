import React, { useEffect, useState } from 'react';
import '../styles/login.css';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => localStorage.getItem('savedEmail') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(() => !!localStorage.getItem('savedEmail'));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error' | 'info', text }

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
        setMessage({ type: 'success', text: data?.Message ?? 'Đăng nhập thành công. Chuyển hướng...' });

        const r = (typeof role === 'string' ? role : (Array.isArray(role) && role[0]) ? role[0] : '')?.toLowerCase() ?? '';
        if (r.includes('admin')) navigate('/admin');
        else if (r.includes('le') || r.includes('lễ') || r.includes('reception') || r.includes('receptionist')) navigate('/reception');
        else navigate('/customer');
      } else {
        const srvMsg = (data?.Message ?? data?.message ?? '').toString().toLowerCase();
        const credKeywords = ['mật khẩu', 'mat khau', 'email', 'không đúng', 'sai', 'không tồn tại', 'invalid', 'incorrect', 'not found'];
        const looksLikeCredError = credKeywords.some(k => srvMsg.includes(k));
        setMessage({
          type: 'error',
          text: looksLikeCredError ? 'Email hoặc mật khẩu không chính xác.' : (data?.Message ?? 'Đăng nhập thất bại.')
        });
      }
    } catch (err) {
      console.error('Login error full:', err);
      const resp = err?.response;
      if (resp?.data) console.error('Server response data:', resp.data);
      if (resp?.status === 401 || resp?.status === 400) {
        setMessage({ type: 'error', text: 'Email hoặc mật khẩu không chính xác.' });
        setLoading(false);
        return;
      }
      let serverMessage;
      if (resp?.data?.errors && typeof resp.data.errors === 'object') {
        serverMessage = Object.entries(resp.data.errors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
      } else {
        serverMessage = resp?.data?.Message ?? resp?.data?.message;
      }
      const status = resp?.status;
      const msg = serverMessage || err?.message || `Lỗi khi gọi API (status ${status})`;
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = (provider) => {
    setMessage({ type: 'info', text: `Đăng nhập bằng ${provider} (demo).` });
  };

  return (
    <div className="auth-wrap">
      <div className="auth-inner">
        <aside className="auth-brand">
          <div className="brand-logo" aria-hidden>
            <svg width="54" height="54" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="6" fill="rgba(255,255,255,0.06)"/>
              <path d="M6 14c1.5-3 4.5-5 8-5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h1>Da Nang Bay</h1>
            <p className="tag">Quản lý đặt phòng — Năng suất & Thẩm mỹ</p>
          </div>

          <div className="visual-deco" aria-hidden>
            <div className="floating-circle c1"></div>
            <div className="floating-circle c2"></div>
            <div className="floating-ill"></div>
          </div>

          <div className="brand-features">
            <div>🔒 Bảo mật</div>
            <div>⚡ Nhanh & nhẹ</div>
            <div>📱 Responsive</div>
          </div>
        </aside>

        <main className="auth-card" role="main" aria-labelledby="login-title">
          <form onSubmit={handleSubmit} noValidate className="form">
            <h2 id="login-title">Chào mừng trở lại</h2>
            <p className="form-sub">Đăng nhập để quản lý hoặc đặt phòng</p>

            <div className={`field ${errors.email ? 'has-error' : ''}`}>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                autoComplete="username"
              />
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>

            <div className={`field ${errors.password ? 'has-error' : ''}`}>
              <label className="label">Mật khẩu</label>
              <div className="pw-row">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" className="btn-eye" onClick={() => setShowPassword(s => !s)} aria-label="Hiện/ẩn mật khẩu">
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && <div className="field-error">{errors.password}</div>}
            </div>

            <div className="form-row">
              <label className="checkbox">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                <span>Ghi nhớ</span>
              </label>

              <Link to="/quen-mat-khau" state={{ email }} className="link-forgot" onClick={() => setMessage(null)}>
                Quên mật khẩu?
              </Link>
            </div>

            <button className="btn primary lg" type="submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>

            <div className="divider"><span>hoặc</span></div>

            <div className="socials">
              <button type="button" className="btn social google" onClick={() => handleSocial('Google')}>Google</button>
              <button type="button" className="btn social fb" onClick={() => handleSocial('Facebook')}>Facebook</button>
            </div>

            <p className="signup">
              Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
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