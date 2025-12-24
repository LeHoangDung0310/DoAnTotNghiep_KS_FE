import React from 'react';
import QuanLyTaiKhoan from '../components/Admin/QuanLyTaiKhoan';

/**
 * Trang Quản Lý Tài Khoản
 * - Sử dụng MainLayout để có Header/Footer đẹp
 * - Render component QuanLyTaiKhoan bên trong
 */
export default function TrangQuanLyTaiKhoan() {
  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '40px 24px',
      minHeight: 'calc(100vh - 80px - 400px)' // Đủ cao để không bị footer đè lên
    }}>
      <QuanLyTaiKhoan />
    </div>
  );
}