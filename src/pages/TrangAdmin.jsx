import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuanLyPhong from '../components/Admin/QuanLyPhong';
import QuanLyLoaiPhong from '../components/Admin/QuanLyLoaiPhong';
import QuanLyHinhAnhLP from '../components/Admin/QuanLyHinhAnhLP';
import QuanLyTang from '../components/Admin/QuanLyTang';
import QuanLyTienNghi from '../components/Admin/QuanLyTienNghi';
import QuanLyNguoiDung from '../components/Admin/QuanLyNguoiDung';
import QuanLyTaiKhoan from '../components/Admin/QuanLyTaiKhoan';
import QuanLyDsHoanTien from '../components/Admin/QuanLyDsHoanTien';
import api from '../utils/api';

export default function TrangAdmin() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('rooms');
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

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
  const userRole = userInfo?.vaiTro || localStorage.getItem('userRole') || 'Admin';
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
      case 'rooms':
        return <QuanLyPhong />;
      case 'room-types':
        return <QuanLyLoaiPhong />;
      case 'room-images':
        return <QuanLyHinhAnhLP />;
      case 'floors':
        return <QuanLyTang />;
      case 'amenities':
        return <QuanLyTienNghi />;
      case 'users':
        return <QuanLyNguoiDung />;
      case 'hoan-tien':
        return <QuanLyDsHoanTien />;
      case 'account':
        return <QuanLyTaiKhoan />;
      case 'dashboard':
        return <div className="admin-card">Trang tổng quan (chưa triển khai).</div>;
      default:
        return null;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar bên trái */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">Hotel Admin</div>

        <div className="admin-sidebar-menu">
          <div className="admin-menu-section-title">Tổng quan</div>
          <div
            className={`admin-menu-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveMenu('dashboard')}
          >
            <span>📊</span>
            <span>Dashboard</span>
          </div>

          <div className="admin-menu-section-title">Quản lý</div>
          <div
            className={`admin-menu-item ${activeMenu === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveMenu('rooms')}
          >
            <span>🏨</span>
            <span>Quản lý phòng</span>
          </div>

          <div
            className={`admin-menu-item ${activeMenu === 'room-types' ? 'active' : ''}`}
            onClick={() => setActiveMenu('room-types')}
          >
            <span>🏷️</span>
            <span>Quản lý loại phòng</span>
          </div>

          <div
            className={`admin-menu-item ${activeMenu === 'room-images' ? 'active' : ''}`}
            onClick={() => setActiveMenu('room-images')}
          >
            <span>🖼️</span>
            <span>Hình ảnh loại phòng</span>
          </div>

          <div
            className={`admin-menu-item ${activeMenu === 'floors' ? 'active' : ''}`}
            onClick={() => setActiveMenu('floors')}
          >
            <span>🧱</span>
            <span>Quản lý tầng</span>
          </div>

          <div
            className={`admin-menu-item ${activeMenu === 'amenities' ? 'active' : ''}`}
            onClick={() => setActiveMenu('amenities')}
          >
            <span>🧺</span>
            <span>Quản lý tiện nghi</span>
          </div>

          <div
            className={`admin-menu-item ${activeMenu === 'users' ? 'active' : ''}`}
            onClick={() => setActiveMenu('users')}
          >
            <span>👤</span>
            <span>Quản lý người dùng</span>
          </div>

          <div
            className={`admin-menu-item ${activeMenu === 'hoan-tien' ? 'active' : ''}`}
            onClick={() => setActiveMenu('hoan-tien')}
          >
            <span>💸</span>
            <span>Danh sách hoàn tiền</span>
          </div>
        </div>
      </aside>

      {/* Nội dung bên phải */}
      <main className="admin-content">
        <header className="admin-content-header">
          <div className="admin-page-title">
            {activeMenu === 'dashboard' && 'Tổng quan'}
            {activeMenu === 'rooms' && 'Quản lý phòng'}
            {activeMenu === 'room-types' && 'Quản lý loại phòng'}
            {activeMenu === 'room-images' && 'Hình ảnh loại phòng'}
            {activeMenu === 'floors' && 'Quản lý tầng'}
            {activeMenu === 'amenities' && 'Quản lý tiện nghi'}
            {activeMenu === 'users' && 'Quản lý người dùng'}
            {activeMenu === 'hoan-tien' && 'Danh sách hoàn tiền'}
            {activeMenu === 'account' && 'Quản lý tài khoản'}
          </div>

          {/* Khu vực user info */}
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
                <span>{userRole}</span>
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

        <div className="admin-content-body">{renderContent()}</div>
      </main>
    </div>
  );
}