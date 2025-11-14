import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuanLyPhong from '../components/Admin/QuanLyPhong';
import QuanLyTang from '../components/Admin/QuanLyTang';
import QuanLyTienNghi from '../components/Admin/QuanLyTienNghi';
import QuanLyNguoiDung from '../components/Admin/QuanLyNguoiDung';

export default function TrangAdmin() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('rooms');
  const [openUserMenu, setOpenUserMenu] = useState(false);

  const email = localStorage.getItem('email') || 'tidusmang7890@gmail.com';
  const userRole = localStorage.getItem('userRole') || 'ADMIN';
  const avatarLetter = email.charAt(0).toUpperCase();

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('email');
    navigate('/login');
  };

  const goToAccount = () => {
    // sau này có thể điều hướng đến /account
    alert('Chức năng quản lý tài khoản sẽ được bổ sung sau.');
    setOpenUserMenu(false);
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'rooms':
        return <QuanLyPhong />;
      case 'floors':
        return <QuanLyTang />;
      case 'amenities':
        return <QuanLyTienNghi />;
      case 'users':
        return <QuanLyNguoiDung />;
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
        </div>
      </aside>

      {/* Nội dung bên phải */}
      <main className="admin-content">
        <header className="admin-content-header">
          <div className="admin-page-title">
            {activeMenu === 'dashboard' && 'Tổng quan'}
            {activeMenu === 'rooms' && 'Quản lý phòng'}
            {activeMenu === 'floors' && 'Quản lý tầng'}
            {activeMenu === 'amenities' && 'Quản lý tiện nghi'}
            {activeMenu === 'users' && 'Quản lý người dùng'}
          </div>

          {/* Khu vực user info mới */}
          <div className="admin-user-info">
            <div className="admin-user-avatar">{avatarLetter}</div>
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