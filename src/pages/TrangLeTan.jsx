import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuanLyKhachHangLT from '../components/LeTan/QuanLyKhachHangLT';
import QuanLyDatPhongLT from '../components/LeTan/QuanLyDatPhongLT';
import QuanLyHuyDatPhong from '../components/LeTan/QuanLyHuyDatPhong';
import QuanLyTaiKhoan from '../components/Admin/QuanLyTaiKhoan';
import api from '../utils/api';

// Import CSS
import '../styles/admin.css';
import '../styles/letan.css';

export default function TrangLeTan() {
  const [activeMenu, setActiveMenu] = useState('dat-phong');
  const [userInfo, setUserInfo] = useState(null);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserInfo();
    
    const handleAvatarUpdate = () => {
      console.log('Avatar updated event received');
      loadUserInfo();
    };
    
    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    };
  }, []);

  const loadUserInfo = async () => {
    try {
      const resp = await api.get('/api/NguoiDung/Profile/Me');
      const data = resp.data?.data || resp.data;
      setUserInfo(data);
      
      if (data.email) localStorage.setItem('email', data.email);
      if (data.vaiTro) localStorage.setItem('userRole', data.vaiTro);
      if (data.hoTen) localStorage.setItem('hoTen', data.hoTen);
      if (data.anhDaiDien) localStorage.setItem('anhDaiDien', data.anhDaiDien);
    } catch (err) {
      console.error('Load user info error:', err);
    }
  };

  const email = userInfo?.email || localStorage.getItem('email') || 'user@example.com';
  const userRole = userInfo?.vaiTro || localStorage.getItem('userRole') || 'LeTan';
  const hoTen = userInfo?.hoTen || localStorage.getItem('hoTen') || '';
  const anhDaiDien = userInfo?.anhDaiDien || localStorage.getItem('anhDaiDien') || '';
  const avatarLetter = hoTen?.charAt(0)?.toUpperCase() || email.charAt(0).toUpperCase();

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('email');
    localStorage.removeItem('hoTen');
    localStorage.removeItem('anhDaiDien');
    navigate('/login');
  };

  const goToAccount = () => {
    setActiveMenu('account');
    setOpenUserMenu(false);
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dat-phong':
        return <QuanLyDatPhongLT />;
      case 'khach-hang':
        return <QuanLyKhachHangLT />;
      case 'huy-dat-phong':
        return <QuanLyHuyDatPhong />;
      case 'account':
        return <QuanLyTaiKhoan />;
      case 'dashboard':
        return <div className="admin-card">Trang tổng quan (chưa triển khai).</div>;
      default:
        return <QuanLyDatPhongLT />;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        {/* Logo/Brand */}
        <div className="admin-sidebar-header">
          🏨 Lễ Tân
        </div>

        {/* Menu */}
        <div className="admin-sidebar-menu">
          <div className="admin-menu-section-title">TỔNG QUAN</div>
          <div
            className={`admin-menu-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveMenu('dashboard')}
          >
            <span>📊</span>
            <span>Dashboard</span>
          </div>

          <div className="admin-menu-section-title">QUẢN LÝ</div>
          
          <div
            className={`admin-menu-item ${activeMenu === 'dat-phong' ? 'active' : ''}`}
            onClick={() => setActiveMenu('dat-phong')}
          >
            <span>📅</span>
            <span>Quản lý đặt phòng</span>
          </div>

          <div
            className={`admin-menu-item ${activeMenu === 'khach-hang' ? 'active' : ''}`}
            onClick={() => setActiveMenu('khach-hang')}
          >
            <span>👥</span>
            <span>Quản lý khách hàng</span>
          </div>

          <div
            className={`admin-menu-item ${activeMenu === 'huy-dat-phong' ? 'active' : ''}`}
            onClick={() => setActiveMenu('huy-dat-phong')}
          >
            <span>🚫</span>
            <span>Quản lý hủy đặt phòng</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-content">
        {/* Top Bar */}
        <header className="admin-content-header">
          <div className="admin-page-title">
            {activeMenu === 'dashboard' && 'Tổng quan'}
            {activeMenu === 'dat-phong' && 'Quản lý đặt phòng'}
            {activeMenu === 'khach-hang' && 'Quản lý khách hàng'}
            {activeMenu === 'huy-dat-phong' && 'Quản lý hủy đặt phòng'}
            {activeMenu === 'account' && 'Quản lý tài khoản'}
          </div>

          {/* Khu vực user info - GIỐNG ADMIN */}
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {anhDaiDien ? (
                <img 
                  src={`${api.defaults.baseURL}${anhDaiDien}`} 
                  alt="Avatar" 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div style={{ display: anhDaiDien ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                {avatarLetter}
              </div>
            </div>
            <div className="admin-user-email-role">
              <div className="admin-user-email">{email}</div>
              <div className="admin-user-role">
                <span>●</span>
                <span>{userRole === 'LeTan' ? 'Lễ Tân' : userRole}</span>
              </div>
            </div>
            <div className="admin-user-menu">
              <button
                className="admin-user-menu-toggle"
                onClick={() => setOpenUserMenu((prev) => !prev)}
              >
                <span>▾</span>
              </button>
              {openUserMenu && (
                <div className="admin-user-menu-dropdown">
                  <div className="admin-user-menu-item" onClick={goToAccount}>
                    <span>⚙️</span>
                    <span>Quản lý tài khoản</span>
                  </div>
                  <div className="admin-user-menu-item danger" onClick={logout}>
                    <span>🔓</span>
                    <span>Đăng xuất</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}