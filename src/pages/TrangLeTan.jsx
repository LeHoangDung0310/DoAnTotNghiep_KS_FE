import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TrangLeTan() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Giao diện Lễ tân</h1>
      <p>Quản lý check-in / check-out, thông tin khách hàng tại quầy.</p>
      <button onClick={logout}>Đăng xuất</button>
    </div>
  );
}