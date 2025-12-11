import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load user info
  useEffect(() => {
    loadUserInfo();
    
    // Listen for avatar update
    const handleAvatarUpdate = () => {
      loadUserInfo();
    };
    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    };
  }, []);

  const loadUserInfo = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      
      const resp = await api.get('/api/NguoiDung/Profile/Me');
      const data = resp.data?.data || resp.data;
      setUserInfo(data);
    } catch (err) {
      console.error('Load user info error:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: '🏠 Trang chủ', icon: '🏠' },
    { path: '/rooms', label: '🏨 Phòng', icon: '🛏️' },
    { path: '/services', label: '✨ Dịch vụ', icon: '✨' },
    { path: '/about', label: 'ℹ️ Giới thiệu', icon: 'ℹ️' },
    { path: '/contact', label: '📞 Liên hệ', icon: '📞' },
  ];

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <div className="logo-icon">🏖️</div>
          <div className="logo-text">
            <h1>Da Nang Bay</h1>
            <p>Luxury Hotel & Resort</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{link.icon}</span>
              <span>{link.label.replace(/^[^\s]+\s/, '')}</span>
            </Link>
          ))}
        </nav>

        {/* User Menu */}
        <div className="header-actions">
          {userInfo ? (
            <div className="user-menu">
              <button
                className="user-menu-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                {userInfo.anhDaiDien ? (
                  <img
                    src={`${api.defaults.baseURL}${userInfo.anhDaiDien}`}
                    alt="Avatar"
                    className="user-avatar"
                  />
                ) : (
                  <div className="user-avatar-placeholder">
                    {userInfo.hoTen?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="user-info">
                  <span className="user-name">{userInfo.hoTen || 'User'}</span>
                  <span className="user-role">{userInfo.vaiTro || 'Khách'}</span>
                </div>
                <span className="dropdown-arrow">▼</span>
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <Link to="/account" className="dropdown-item">
                    <span className="dropdown-icon">👤</span>
                    Tài khoản của tôi
                  </Link>
                  <Link to="/bookings" className="dropdown-item">
                    <span className="dropdown-icon">📋</span>
                    Đặt phòng của tôi
                  </Link>
                  {userInfo.vaiTro === 'Admin' && (
                    <Link to="/admin" className="dropdown-item">
                      <span className="dropdown-icon">⚙️</span>
                      Quản trị
                    </Link>
                  )}
                  <div className="dropdown-divider"></div>
                  <button onClick={logout} className="dropdown-item logout">
                    <span className="dropdown-icon">🚪</span>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn-register">
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="mobile-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon">{link.icon}</span>
              <span>{link.label.replace(/^[^\s]+\s/, '')}</span>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}