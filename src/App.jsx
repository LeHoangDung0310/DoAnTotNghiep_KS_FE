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
import './styles/main.css';
import './styles/admin.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/quen-mat-khau" element={<TrangQuenMatKhau />} />
        <Route path="/quen-mat-khau/xac-thuc-otp" element={<TrangXacThucOTPQuenMK />} />
        <Route path="/quen-mat-khau/dat-lai" element={<TrangDatLaiMatKhau />} />
        <Route path="/register" element={<TrangDangKy />} />
        <Route path="/xac-thuc-otp" element={<TrangXacThucOTP />} />
        <Route path="/customer" element={<TrangKhachHang />} />
        <Route path="/admin" element={<TrangAdmin />} />
        <Route path="/reception" element={<TrangLeTan />} />
        {/* thêm route bảo vệ (private) nếu cần */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;