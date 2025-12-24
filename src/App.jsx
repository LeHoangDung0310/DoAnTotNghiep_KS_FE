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
import TrangLichSuDP from './pages/TrangLichSuDP';
import ChiTietLoaiPhong from './pages/ChiTietLoaiPhong';
import Home from './pages/Home';
import MainLayout from './layouts/MainLayout';
import './styles/main.css';
import './styles/admin.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========== ROUTES WITH PERSISTENT LAYOUT ========== */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/customer" element={<TrangKhachHang />} />
          <Route path="/loai-phong/:id" element={<ChiTietLoaiPhong />} />
          <Route path="/account" element={<TrangQuanLyTaiKhoan />} />
          <Route path="/bookings" element={<TrangLichSuDP />} />
          <Route path="/rooms" element={<div>Trang Phòng</div>} />
          <Route path="/services" element={<div>Trang Dịch vụ</div>} />
          <Route path="/about" element={<div>Trang Giới thiệu</div>} />
          <Route path="/contact" element={<div>Trang Liên hệ</div>} />
        </Route>

        {/* ========== AUTH/PUBLIC ROUTES (WITHOUT MAIN LAYOUT) ========== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<TrangDangKy />} />
        <Route path="/quen-mat-khau" element={<TrangQuenMatKhau />} />
        <Route path="/quen-mat-khau/xac-thuc-otp" element={<TrangXacThucOTPQuenMK />} />
        <Route path="/quen-mat-khau/dat-lai" element={<TrangDatLaiMatKhau />} />
        <Route path="/xac-thuc-otp" element={<TrangXacThucOTP />} />

        {/* ========== ADMIN/RECEPTION ROUTES ========== */}
        <Route path="/admin" element={<TrangAdmin />} />
        <Route path="/reception" element={<TrangLeTan />} />

        {/* ========== 404 NOT FOUND ========== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;