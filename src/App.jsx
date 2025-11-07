import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
// import DashboardCustomer from './pages/DashboardCustomer';
import TrangKhachHang from './pages/TrangKhachHang';
import TrangAdmin from './pages/TrangAdmin';
import TrangLeTan from './pages/TrangLeTan';
import TrangDangKy from './pages/TrangDangKy';
import TrangXacThucOTP from './pages/TrangXacThucOTP';
import './styles/main.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
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