import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TrangAdmin() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Giao diện Quản trị</h1>
      <p>Quản lý hệ thống, người dùng, báo cáo ...</p>
      <button onClick={logout}>Đăng xuất</button>
      {/* TODO: thêm menu / component con riêng cho admin ở đây */}
    </div>
  );
}