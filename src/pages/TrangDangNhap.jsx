import React, { useEffect, useState } from 'react';
import '../styles/login.css';
import api from '../utils/api';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaHotel } from 'react-icons/fa';

export default function TrangDangNhap() {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState(() => localStorage.getItem('savedEmail') || '');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(() => !!localStorage.getItem('savedEmail'));
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('expired') === '1') {
            setMessage({
                type: 'error',
                text: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
            });
            const clean = location.pathname;
            window.history.replaceState(null, '', clean);
        }
    }, [location]);

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
        <div className="auth-v2-container">
            <div className="auth-v2-overlay"></div>

            <div className="auth-v2-card">
                <div className="auth-v2-left">
                    <div className="brand-zone">
                        <div className="brand-logo-large">
                            <FaHotel />
                        </div>
                        <h1>Da Nang Bay</h1>
                        <p>Thiên đường nghỉ dưỡng đẳng cấp sạng trọng bậc nhất. Hành trình của bạn bắt đầu từ đây.</p>
                    </div>
                    <div className="auth-v2-info">
                        <div className="info-item">
                            <span className="dot"></span>
                            <span>Hệ thống quản lý thông minh</span>
                        </div>
                        <div className="info-item">
                            <span className="dot"></span>
                            <span>Dịch vụ hỗ trợ 24/7</span>
                        </div>
                    </div>
                </div>

                <div className="auth-v2-right">
                    <div className="auth-v2-form-box">
                        <h2 className="auth-v2-title">Chào mừng trở lại</h2>
                        <p className="auth-v2-subtitle">Vui lòng đăng nhập để tiếp tục hành trình</p>

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-v2-group">
                                <label className="form-v2-label">Địa chỉ Email</label>
                                <div className={`input-v2-wrapper ${errors.email ? 'has-error' : ''}`}>
                                    <FaEnvelope className="input-icon" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@gmail.com"
                                        autoComplete="username"
                                    />
                                </div>
                                {errors.email && <span className="error-v2-text">{errors.email}</span>}
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
                                        autoComplete="current-password"
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

                            <div className="form-v2-options">
                                <label className="checkbox-v2-container">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={e => setRemember(e.target.checked)}
                                    />
                                    <span className="checkmark"></span>
                                    <span className="label-text">Ghi nhớ tôi</span>
                                </label>

                                <Link to="/quen-mat-khau" className="link-v2-forgot">
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            <button type="submit" className="btn-v2-submit" disabled={loading}>
                                {loading ? (
                                    <span className="loading-spinner-small"></span>
                                ) : (
                                    <>
                                        <span>Đăng Nhập Ngay</span>
                                        <FaArrowRight />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-v2-footer">
                            <p>Bạn chưa có tài khoản?</p>
                            <Link to="/register" className="link-v2-signup">Đăng ký thành viên mới</Link>
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
