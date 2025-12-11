import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import TrangKhachHang from './pages/TrangKhachHang';
import TrangAdmin from './pages/TrangAdmin';
import TrangLeTan from './pages/TrangLeTan';
import TrangDangKy from './pages/TrangDangKy';
import TrangQuenMatKhau from './pages/TrangQuenMatKhau';
import TrangXacThucOTP from './pages/TrangXacThucOTP';
import TrangXacThucOTPQuenMK from './pages/TrangXacThucOTPQuenMK';
import TrangDatLaiMatKhau from './pages/TrangDatLaiMatKhau';
// ✅ IMPORT TRANG QUẢN LÝ TÀI KHOẢN
import TrangQuanLyTaiKhoan from './pages/TrangQuanLyTaiKhoan';
import ChiTietLoaiPhong from './pages/ChiTietLoaiPhong';
import './styles/main.css';
import './styles/admin.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========== PUBLIC ROUTES ========== */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/quen-mat-khau" element={<TrangQuenMatKhau />} />
        <Route path="/quen-mat-khau/xac-thuc-otp" element={<TrangXacThucOTPQuenMK />} />
        <Route path="/quen-mat-khau/dat-lai" element={<TrangDatLaiMatKhau />} />
        <Route path="/register" element={<TrangDangKy />} />
        <Route path="/xac-thuc-otp" element={<TrangXacThucOTP />} />

        {/* ========== CUSTOMER ROUTES ========== */}
        <Route path="/customer" element={<TrangKhachHang />} />
        <Route path="/loai-phong/:id" element={<ChiTietLoaiPhong />} />
        {/* ✅ ROUTE QUẢN LÝ TÀI KHOẢN */}
        <Route path="/account" element={<TrangQuanLyTaiKhoan />} />
        <Route path="/bookings" element={<div>Đặt phòng của tôi (Đang phát triển)</div>} />

        {/* ========== ADMIN ROUTES ========== */}
        <Route path="/admin" element={<TrangAdmin />} />
        
        {/* ========== RECEPTION ROUTES ========== */}
        <Route path="/reception" element={<TrangLeTan />} />

        {/* ========== 404 NOT FOUND ========== */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;