import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TrangKhachHang() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Giao diện Khách hàng</h1>
      <p>Chào mừng khách hàng — bạn có thể xem/đặt phòng ở đây.</p>
      <button onClick={logout}>Đăng xuất</button>
    </div>
  );
}