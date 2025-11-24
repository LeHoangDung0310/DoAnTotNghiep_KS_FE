import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import '../../styles/quanlytaikhoan.css';

export default function QuanLyTaiKhoan() {
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Thông tin người dùng
  const [userInfo, setUserInfo] = useState({
    maNguoiDung: 0,
    email: '',
    hoTen: '',
    soDienThoai: '',
    diaChiChiTiet: '',
    maPhuongXa: null,
    tenPhuongXa: '',
    tenHuyen: '',
    tenTinh: '',
    maTinh: null,
    maHuyen: null,
    anhDaiDien: '',
    vaiTro: '',
    trangThai: '',
    ngayTao: ''
  });

  // Form cập nhật thông tin
  const [formInfo, setFormInfo] = useState({
    hoTen: '',
    soDienThoai: '',
    diaChiChiTiet: '',
    maPhuongXa: null
  });

  // Form đổi mật khẩu
  const [formPassword, setFormPassword] = useState({
    matKhauCu: '',
    matKhauMoi: '',
    xacNhanMatKhau: ''
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Upload avatar
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Danh sách địa chỉ
  const [tinhs, setTinhs] = useState([]);
  const [huyens, setHuyens] = useState([]);
  const [phuongXas, setPhuongXas] = useState([]);
  const [selectedTinh, setSelectedTinh] = useState(null);
  const [selectedHuyen, setSelectedHuyen] = useState(null);

  useEffect(() => {
    loadUserInfo();
    loadTinhs();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadUserInfo = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Access token:', token ? 'exists' : 'missing');
      
      const resp = await api.get('/api/NguoiDung/Profile/Me');
      const data = resp.data?.data || resp.data;
      
      console.log('User info loaded:', data);
      
      setUserInfo({
        maNguoiDung: data.maNguoiDung || 0,
        email: data.email || '',
        hoTen: data.hoTen || '',
        soDienThoai: data.soDienThoai || '',
        diaChiChiTiet: data.diaChiChiTiet || '',
        maPhuongXa: data.maPhuongXa || null,
        tenPhuongXa: data.tenPhuongXa || '',
        tenHuyen: data.tenHuyen || '',
        tenTinh: data.tenTinh || '',
        maTinh: data.maTinh || null,
        maHuyen: data.maHuyen || null,
        anhDaiDien: data.anhDaiDien || '',
        vaiTro: data.vaiTro || '',
        trangThai: data.trangThai || '',
        ngayTao: data.ngayTao || ''
      });

      setFormInfo({
        hoTen: data.hoTen || '',
        soDienThoai: data.soDienThoai || '',
        diaChiChiTiet: data.diaChiChiTiet || '',
        maPhuongXa: data.maPhuongXa || null
      });

      if (data.maTinh) {
        setSelectedTinh(data.maTinh);
        await loadHuyens(data.maTinh);
      }
      if (data.maHuyen) {
        setSelectedHuyen(data.maHuyen);
        await loadPhuongXas(data.maHuyen);
      }
    } catch (err) {
      console.error('Load user info error:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 401) {
        setMessage({ type: 'error', text: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      setMessage({ type: 'error', text: 'Không thể tải thông tin người dùng' });
    }
  };

  const loadTinhs = async () => {
    try {
      const resp = await api.get('/api/DiaChi/Tinh');
      const data = resp.data?.data || resp.data;
      setTinhs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Load tinhs error:', err);
    }
  };

  const loadHuyens = async (maTinh) => {
    try {
      const resp = await api.get(`/api/DiaChi/Huyen?maTinh=${maTinh}`);
      const data = resp.data?.data || resp.data;
      setHuyens(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Load huyens error:', err);
    }
  };

  const loadPhuongXas = async (maHuyen) => {
    try {
      const resp = await api.get(`/api/DiaChi/PhuongXa?maHuyen=${maHuyen}`);
      const data = resp.data?.data || resp.data;
      setPhuongXas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Load phuongxas error:', err);
    }
  };

  const handleTinhChange = async (e) => {
    const maTinh = parseInt(e.target.value);
    setSelectedTinh(maTinh);
    setSelectedHuyen(null);
    setFormInfo({ ...formInfo, maPhuongXa: null });
    setHuyens([]);
    setPhuongXas([]);
    if (maTinh) {
      await loadHuyens(maTinh);
    }
  };

  const handleHuyenChange = async (e) => {
    const maHuyen = parseInt(e.target.value);
    setSelectedHuyen(maHuyen);
    setFormInfo({ ...formInfo, maPhuongXa: null });
    setPhuongXas([]);
    if (maHuyen) {
      await loadPhuongXas(maHuyen);
    }
  };

  const handlePhuongXaChange = (e) => {
    const maPhuongXa = e.target.value ? parseInt(e.target.value) : null;
    setFormInfo({ ...formInfo, maPhuongXa });
  };

  // Handle avatar file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Vui lòng chọn file ảnh (jpg, png, gif)' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Kích thước ảnh tối đa 5MB' });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Upload avatar
  const handleUploadAvatar = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Vui lòng chọn ảnh để tải lên' });
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await api.post('/api/NguoiDung/Profile/UploadAvatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage({ type: 'success', text: 'Cập nhật ảnh đại diện thành công!' });
      
      // Reset
      setSelectedFile(null);
      setPreviewUrl('');
      
      // Reload user info to get new avatar URL
      await loadUserInfo();
      
      // Dispatch custom event để TrangAdmin cập nhật avatar
      window.dispatchEvent(new CustomEvent('avatarUpdated', { 
        detail: { 
          avatarUrl: response.data?.avatarUrl || response.data?.data?.avatarUrl 
        } 
      }));
    } catch (err) {
      console.error('Upload avatar error:', err);
      const msg = err.response?.data?.message || 'Tải ảnh lên thất bại';
      setMessage({ type: 'error', text: msg });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Cancel avatar upload
  const handleCancelAvatar = () => {
    setSelectedFile(null);
    setPreviewUrl('');
  };

  // Validate form thông tin
  const validateInfo = () => {
    const e = {};
    if (!formInfo.hoTen?.trim()) e.hoTen = 'Vui lòng nhập họ tên';
    if (formInfo.soDienThoai && !/^0\d{9}$/.test(formInfo.soDienThoai)) {
      e.soDienThoai = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Validate form đổi mật khẩu
  const validatePassword = () => {
    const e = {};
    if (!formPassword.matKhauCu) e.matKhauCu = 'Vui lòng nhập mật khẩu cũ';
    if (!formPassword.matKhauMoi) e.matKhauMoi = 'Vui lòng nhập mật khẩu mới';
    else if (formPassword.matKhauMoi.length < 6) e.matKhauMoi = 'Mật khẩu mới ít nhất 6 ký tự';
    if (formPassword.matKhauMoi !== formPassword.xacNhanMatKhau) {
      e.xacNhanMatKhau = 'Xác nhận mật khẩu không khớp';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Cập nhật thông tin
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    if (!validateInfo()) return;
    
    setLoading(true);
    setErrors({});
    try {
      const payload = {
        HoTen: formInfo.hoTen?.trim(),
        SoDienThoai: formInfo.soDienThoai?.trim() || null,
        DiaChiChiTiet: formInfo.diaChiChiTiet?.trim() || null,
        MaPhuongXa: formInfo.maPhuongXa || null
      };

      await api.put('/api/NguoiDung/Profile/Me', payload);
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      await loadUserInfo();
    } catch (err) {
      console.error('Update info error:', err);
      const msg = err.response?.data?.message || 'Cập nhật thông tin thất bại';
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  // Đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    
    setLoading(true);
    setErrors({});
    try {
      const payload = {
        MatKhauCu: formPassword.matKhauCu,
        MatKhauMoi: formPassword.matKhauMoi,
        XacNhanMatKhau: formPassword.xacNhanMatKhau
      };

      await api.put('/api/NguoiDung/Profile/ChangePassword', payload);
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      
      setFormPassword({
        matKhauCu: '',
        matKhauMoi: '',
        xacNhanMatKhau: ''
      });
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      console.error('Change password error:', err);
      const msg = err.response?.data?.message || err.response?.data?.Message || 'Đổi mật khẩu thất bại';
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Chưa cập nhật';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Không xác định';
    }
  };

  return (
    <div className="account-management">
      <div className="account-header">
        <div className="account-avatar">
          {/* Chỉ hiển thị 1 trong 3: Preview > Avatar từ server > Placeholder */}
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="avatar-img" />
          ) : userInfo.anhDaiDien ? (
            <img 
              src={`${api.defaults.baseURL}${userInfo.anhDaiDien}`} 
              alt="Avatar"
              className="avatar-img"
              onError={(e) => {
                e.target.style.display = 'none';
                const placeholder = e.target.parentElement.querySelector('.avatar-placeholder');
                if (placeholder) placeholder.style.display = 'flex';
              }}
            />
          ) : (
            <div className="avatar-placeholder">
              {userInfo.hoTen?.charAt(0)?.toUpperCase() || userInfo.email?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
          
          {/* Nút đổi ảnh - chỉ hiện khi KHÔNG có preview */}
          {!previewUrl && (
            <div className="avatar-upload-overlay">
              <label htmlFor="avatar-upload" className="avatar-upload-btn">
                📷 Đổi ảnh
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          )}
        </div>
        
        <div className="account-header-info">
          <h2>{userInfo.hoTen || 'Chưa cập nhật'}</h2>
          <p className="account-email">{userInfo.email}</p>
          <div className="account-badges">
            <span className={`badge badge-${userInfo.vaiTro?.toLowerCase()}`}>
              {userInfo.vaiTro || 'N/A'}
            </span>
            <span className={`badge badge-${userInfo.trangThai === 'Hoạt động' ? 'active' : 'inactive'}`}>
              {userInfo.trangThai || 'N/A'}
            </span>
          </div>
          <p className="account-join-date">
            Tham gia từ: {formatDate(userInfo.ngayTao)}
          </p>
          
          {/* Avatar upload actions - CHỈ HIỆN KHI CÓ PREVIEW */}
          {selectedFile && previewUrl && (
            <div className="avatar-actions">
              <button 
                className="btn-upload-avatar" 
                onClick={handleUploadAvatar}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? '⏳ Đang tải...' : '✓ Lưu ảnh'}
              </button>
              <button 
                className="btn-cancel-avatar" 
                onClick={handleCancelAvatar}
                disabled={uploadingAvatar}
              >
                ✕ Hủy
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="account-tabs">
        <button
          className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          📋 Thông tin cá nhân
        </button>
        <button
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          🔒 Đổi mật khẩu
        </button>
      </div>

      <div className="account-content">
        {activeTab === 'info' && (
          <form onSubmit={handleUpdateInfo} className="account-form">
            <h3>Cập nhật thông tin cá nhân</h3>
            
            {/* Thông tin cơ bản */}
            <div className="form-section">
              <h4 className="form-section-title">Thông tin cơ bản</h4>
              
              {/* Hàng 1: Họ tên + Số điện thoại */}
              <div className="form-row">
                <div className="form-group">
                  <label>Họ và tên <span className="required">*</span></label>
                  <input
                    type="text"
                    className={`form-input ${errors.hoTen ? 'error' : ''}`}
                    value={formInfo.hoTen}
                    onChange={(e) => setFormInfo({ ...formInfo, hoTen: e.target.value })}
                    placeholder="Nguyễn Văn A"
                  />
                  {errors.hoTen && <span className="error-text">{errors.hoTen}</span>}
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    className={`form-input ${errors.soDienThoai ? 'error' : ''}`}
                    value={formInfo.soDienThoai || ''}
                    onChange={(e) => setFormInfo({ ...formInfo, soDienThoai: e.target.value })}
                    placeholder="0909123456"
                  />
                  {errors.soDienThoai && <span className="error-text">{errors.soDienThoai}</span>}
                </div>
              </div>

              {/* Hàng 2: Email + Vai trò */}
              <div className="form-row">
                <div className="form-group">
                  <label>Email <span className="required">*</span></label>
                  <input
                    type="email"
                    value={userInfo.email}
                    disabled
                    className="form-input disabled"
                  />
                  <small>Email không thể thay đổi</small>
                </div>

                <div className="form-group">
                  <label>Vai trò</label>
                  <input
                    type="text"
                    value={userInfo.vaiTro}
                    disabled
                    className="form-input disabled"
                  />
                  <small>Vai trò được quản trị viên cấp</small>
                </div>
              </div>
            </div>

            {/* Địa chỉ */}
            <div className="form-section">
              <h4 className="form-section-title">Địa chỉ</h4>

              <div className="form-group">
                <label>Địa chỉ thường trú</label>
                <div className="address-display">
                  {userInfo.diaChiChiTiet || userInfo.tenPhuongXa ? (
                    <span>
                      {userInfo.diaChiChiTiet && `${userInfo.diaChiChiTiet}`}
                      {userInfo.diaChiChiTiet && userInfo.tenPhuongXa && ', '}
                      {userInfo.tenPhuongXa && `${userInfo.tenPhuongXa}`}
                      {userInfo.tenHuyen && `, ${userInfo.tenHuyen}`}
                      {userInfo.tenTinh && `, ${userInfo.tenTinh}`}
                    </span>
                  ) : (
                    <span className="text-muted">Chưa cập nhật</span>
                  )}
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label>Tỉnh/Thành phố</label>
                  <select
                    className="form-input"
                    value={selectedTinh || ''}
                    onChange={handleTinhChange}
                  >
                    <option value="">-- Chọn Tỉnh/TP --</option>
                    {tinhs.map(t => (
                      <option key={t.maTinh} value={t.maTinh}>{t.tenTinh}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quận/Huyện</label>
                  <select
                    className="form-input"
                    value={selectedHuyen || ''}
                    onChange={handleHuyenChange}
                    disabled={!selectedTinh}
                  >
                    <option value="">-- Chọn Quận/Huyện --</option>
                    {huyens.map(h => (
                      <option key={h.maHuyen} value={h.maHuyen}>{h.tenHuyen}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Phường/Xã</label>
                  <select
                    className="form-input"
                    value={formInfo.maPhuongXa || ''}
                    onChange={handlePhuongXaChange}
                    disabled={!selectedHuyen}
                  >
                    <option value="">-- Chọn Phường/Xã --</option>
                    {phuongXas.map(p => (
                      <option key={p.maPhuongXa} value={p.maPhuongXa}>{p.tenPhuongXa}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Địa chỉ chi tiết</label>
                <textarea
                  className="form-input"
                  value={formInfo.diaChiChiTiet || ''}
                  onChange={(e) => setFormInfo({ ...formInfo, diaChiChiTiet: e.target.value })}
                  placeholder="Số nhà, tên đường..."
                  rows={3}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={loadUserInfo}>
                Hủy
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="account-form">
            <h3>Đổi mật khẩu</h3>
            
            <div className="form-section">
              <div className="form-group">
                <label>Mật khẩu hiện tại <span className="required">*</span></label>
                <div className="password-input-wrapper">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    className={`form-input ${errors.matKhauCu ? 'error' : ''}`}
                    value={formPassword.matKhauCu}
                    onChange={(e) => setFormPassword({ ...formPassword, matKhauCu: e.target.value })}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.matKhauCu && <span className="error-text">{errors.matKhauCu}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mật khẩu mới <span className="required">*</span></label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className={`form-input ${errors.matKhauMoi ? 'error' : ''}`}
                      value={formPassword.matKhauMoi}
                      onChange={(e) => setFormPassword({ ...formPassword, matKhauMoi: e.target.value })}
                      placeholder="Ít nhất 6 ký tự"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {errors.matKhauMoi && <span className="error-text">{errors.matKhauMoi}</span>}
                </div>

                <div className="form-group">
                  <label>Xác nhận mật khẩu mới <span className="required">*</span></label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`form-input ${errors.xacNhanMatKhau ? 'error' : ''}`}
                      value={formPassword.xacNhanMatKhau}
                      onChange={(e) => setFormPassword({ ...formPassword, xacNhanMatKhau: e.target.value })}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {errors.xacNhanMatKhau && <span className="error-text">{errors.xacNhanMatKhau}</span>}
                </div>
              </div>

              <div className="password-requirements">
                <p>Yêu cầu mật khẩu:</p>
                <ul>
                  <li>Ít nhất 6 ký tự</li>
                  <li>Nên kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                  <li>Không sử dụng mật khẩu quá đơn giản</li>
                </ul>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => {
                  setFormPassword({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhau: '' });
                  setErrors({});
                }}
              >
                Hủy
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}
      </div>

      {message && (
        <div className={`toast-message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
