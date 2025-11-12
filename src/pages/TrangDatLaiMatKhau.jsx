import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import '../styles/login.css';

export default function TrangDatLaiMatKhau() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = location.state?.email || '';
  const initialMaOtp = location.state?.maOtp || '';
  const [email, setEmail] = useState(initialEmail);
  const [maOtp, setMaOtp] = useState(initialMaOtp);
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [xacNhan, setXacNhan] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3800);
      return () => clearTimeout(t);
    }
  }, [message]);

  const validate = () => {
    if (!email) { 
      setMessage({ type: 'error', text: 'Email không được để trống.' }); 
      return false; 
    }
    if (!maOtp) { 
      setMessage({ type: 'error', text: 'Mã OTP không được để trống.' }); 
      return false; 
    }
    if (!matKhauMoi || matKhauMoi.length < 6) { 
      setMessage({ type: 'error', text: 'Mật khẩu mới tối thiểu 6 ký tự.' }); 
      return false; 
    }
    if (matKhauMoi !== xacNhan) { 
      setMessage({ type: 'error', text: 'Xác nhận mật khẩu không khớp.' }); 
      return false; 
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { 
        Email: email, 
        MaOTP: maOtp, 
        MatKhauMoi: matKhauMoi, 
        XacNhanMatKhau: xacNhan 
      };
      const resp = await api.post('/api/QuenMatKhau/dat-lai-mat-khau', payload);
      const data = resp.data;
      const success = data?.Success ?? data?.success ?? false;
      setMessage({ 
        type: success ? 'success' : 'error', 
        text: data?.Message ?? (success ? 'Đặt lại mật khẩu thành công!' : 'Không thể đặt lại mật khẩu.') 
      });
      if (success) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      console.error('Dat lai mat khau error:', err);
      const resp = err?.response;
      const text = resp?.data?.Message ?? resp?.data?.message ?? 'Lỗi khi gọi API.';
      setMessage({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Đặt lại mật khẩu</h1>
        <p className="login-subtitle">Nhập mật khẩu mới để hoàn tất.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              readOnly
              style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mã OTP</label>
            <input
              type="text"
              className="form-input"
              value={maOtp}
              onChange={e => setMaOtp(e.target.value)}
              placeholder="123456"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu mới</label>
            <input
              type="password"
              className="form-input"
              value={matKhauMoi}
              onChange={e => setMatKhauMoi(e.target.value)}
              placeholder="Ít nhất 6 ký tự"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Xác nhận mật khẩu</label>
            <input
              type="password"
              className="form-input"
              value={xacNhan}
              onChange={e => setXacNhan(e.target.value)}
              placeholder="Nhập lại mật khẩu"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>

          <button 
            type="button" 
            className="btn-secondary" 
            onClick={() => navigate('/login')}
          >
            Hủy
          </button>
        </form>
      </div>

      {message && (
        <div className={`toast-message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}