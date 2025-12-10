import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function SuaNguoiDungLT({ userId, onClose, onSuccess, onShowToast }) {
  const [formData, setFormData] = useState({
    hoTen: '',
    soDienThoai: '',
    email: '',
    soCCCD: '',
    ngayCapCCCD: '',
    noiCapCCCD: '',
    ngaySinh: '',
    gioiTinh: '',
    diaChiChiTiet: '',
    maTinh: '',
    maHuyen: '',
    maPhuongXa: '',
    trangThai: 'Hoạt động',
    // Thông tin ngân hàng
    nganHang: '',
    soTaiKhoan: '',
    tenChuTK: '',
  });

  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    fetchUserDetail();
    fetchProvinces();
  }, [userId]);

  const fetchUserDetail = async () => {
    try {
      const res = await api.get(`/api/NguoiDung/${userId}`);
      const user = res.data.data;

      setFormData({
        hoTen: user.hoTen || '',
        soDienThoai: user.soDienThoai || '',
        email: user.email || '',
        soCCCD: user.soCCCD || '',
        ngayCapCCCD: user.ngayCapCCCD ? user.ngayCapCCCD.split('T')[0] : '',
        noiCapCCCD: user.noiCapCCCD || '',
        ngaySinh: user.ngaySinh ? user.ngaySinh.split('T')[0] : '',
        gioiTinh: user.gioiTinh || '',
        diaChiChiTiet: user.diaChiChiTiet || '',
        maTinh: user.maTinh || '',
        maHuyen: user.maHuyen || '',
        maPhuongXa: user.maPhuongXa || '',
        trangThai: user.trangThai || 'Hoạt động',
        // Thông tin ngân hàng
        nganHang: user.nganHang || '',
        soTaiKhoan: user.soTaiKhoan || '',
        tenChuTK: user.tenChuTK || '',
      });

      if (user.maTinh) {
        fetchDistricts(user.maTinh);
        if (user.maHuyen) {
          fetchWards(user.maHuyen);
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải thông tin:', err);
      onShowToast && onShowToast('error', 'Không thể tải thông tin người dùng');
    }
  };

  const fetchProvinces = async () => {
    try {
      const res = await api.get('/api/OTP/tinh');
      setProvinces(res.data.data || []);
    } catch (err) {
      console.error('Lỗi khi tải tỉnh:', err);
    }
  };

  const fetchDistricts = async (maTinh) => {
    try {
      const res = await api.get(`/api/OTP/huyen/${maTinh}`);
      setDistricts(res.data.data || []);
    } catch (err) {
      console.error('Lỗi khi tải huyện:', err);
    }
  };

  const fetchWards = async (maHuyen) => {
    try {
      const res = await api.get(`/api/OTP/phuongxa/${maHuyen}`);
      setWards(res.data.data || []);
    } catch (err) {
      console.error('Lỗi khi tải xã:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'maTinh') {
      setFormData((prev) => ({ ...prev, maHuyen: '', maPhuongXa: '' }));
      setDistricts([]);
      setWards([]);
      if (value) fetchDistricts(value);
    } else if (name === 'maHuyen') {
      setFormData((prev) => ({ ...prev, maPhuongXa: '' }));
      setWards([]);
      if (value) fetchWards(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.hoTen?.trim()) {
      onShowToast && onShowToast('error', '⚠️ Vui lòng nhập họ tên');
      return;
    }

    if (!formData.email?.trim()) {
      onShowToast && onShowToast('error', '⚠️ Vui lòng nhập email');
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        hoTen: formData.hoTen.trim(),
        soDienThoai: formData.soDienThoai?.trim() || null,
        email: formData.email.trim(),
        soCCCD: formData.soCCCD?.trim() || null,
        ngayCapCCCD: formData.ngayCapCCCD || null,
        noiCapCCCD: formData.noiCapCCCD?.trim() || null,
        ngaySinh: formData.ngaySinh || null,
        gioiTinh: formData.gioiTinh || null,
        diaChiChiTiet: formData.diaChiChiTiet?.trim() || null,
        maPhuongXa: formData.maPhuongXa ? parseInt(formData.maPhuongXa) : null,
        trangThai: formData.trangThai,
        // Thông tin ngân hàng
        nganHang: formData.nganHang?.trim() || null,
        soTaiKhoan: formData.soTaiKhoan?.trim() || null,
        tenChuTK: formData.tenChuTK?.trim() || null,
      };

      console.log('📤 Dữ liệu gửi lên server:', updateData);

      await api.put(`/api/NguoiDung/${userId}`, updateData);
      
      // ✅ GỌI onSuccess TRƯỚC để refresh data
      onSuccess && onSuccess();
      
      // ✅ ĐÓNG modal TRƯỚC
      onClose && onClose();
      
      // ✅ SAU ĐÓ MỚI hiển thị toast (sau khi modal đã đóng)
      setTimeout(() => {
        onShowToast && onShowToast(
          'success', 
          `✅ Cập nhật thông tin khách hàng "${formData.hoTen}" thành công!`
        );
      }, 100);

    } catch (err) {
      console.error('❌ Lỗi khi cập nhật:', err);
      
      // Xử lý các loại lỗi cụ thể
      let errorMessage = '❌ Cập nhật thất bại! Vui lòng thử lại';
      
      if (err.response?.status === 400) {
        errorMessage = `⚠️ ${err.response.data.message || 'Dữ liệu không hợp lệ'}`;
      } else if (err.response?.status === 404) {
        errorMessage = '❌ Không tìm thấy người dùng';
      } else if (err.response?.status === 401) {
        errorMessage = '🔒 Bạn không có quyền thực hiện thao tác này';
      } else if (err.response?.status === 500) {
        errorMessage = '⚠️ Lỗi máy chủ! Vui lòng thử lại sau';
      } else if (err.message === 'Network Error') {
        errorMessage = '📡 Lỗi kết nối! Vui lòng kiểm tra mạng';
      }
      
      // ✅ Lỗi thì hiển thị toast NGAY (modal vẫn mở)
      onShowToast && onShowToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-large"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 900 }}
      >
        {/* Header với gradient */}
        <div className="modal-header-gradient">
          <div className="modal-header-content">
            <div className="modal-icon">✏️</div>
            <div>
              <h3 className="modal-title-large">Chỉnh sửa thông tin khách hàng</h3>
              <p className="modal-subtitle">
                Cập nhật thông tin chi tiết người dùng #{userId} • {formData.email}
              </p>
            </div>
          </div>
          <button className="modal-close-btn-gradient" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body-scrollable">
            {/* Thông tin cá nhân */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">👤</div>
                <h4 className="form-section-title">Thông tin cá nhân</h4>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <span className="form-label-icon">📝</span>
                    Họ tên
                    <span className="form-label-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="hoTen"
                    className="form-input-modern"
                    placeholder="Nhập họ và tên đầy đủ"
                    value={formData.hoTen}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="form-label-icon">📧</span>
                    Email
                    <span className="form-label-required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-input-modern"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="form-label-icon">📱</span>
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="soDienThoai"
                    className="form-input-modern"
                    placeholder="0xxx xxx xxx"
                    value={formData.soDienThoai}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="form-label-icon">⚧</span>
                    Giới tính
                  </label>
                  <select
                    name="gioiTinh"
                    className="form-select-modern"
                    value={formData.gioiTinh}
                    onChange={handleChange}
                  >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="form-label-icon">🎂</span>
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="ngaySinh"
                    className="form-input-modern"
                    value={formData.ngaySinh}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="form-label-icon">📊</span>
                    Trạng thái
                  </label>
                  <select
                    name="trangThai"
                    className="form-select-modern"
                    value={formData.trangThai}
                    onChange={handleChange}
                  >
                    <option value="Hoạt động">✅ Hoạt động</option>
                    <option value="Tạm khóa">🔒 Tạm khóa</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CCCD */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">🆔</div>
                <h4 className="form-section-title">Thông tin CCCD</h4>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <span className="form-label-icon">🔢</span>
                    Số CCCD
                  </label>
                  <input
                    type="text"
                    name="soCCCD"
                    className="form-input-modern"
                    placeholder="Nhập số CCCD (12 chữ số)"
                    value={formData.soCCCD}
                    onChange={handleChange}
                    maxLength={12}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="form-label-icon">📅</span>
                    Ngày cấp
                  </label>
                  <input
                    type="date"
                    name="ngayCapCCCD"
                    className="form-input-modern"
                    value={formData.ngayCapCCCD}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    <span className="form-label-icon">🏛️</span>
                    Nơi cấp
                  </label>
                  <input
                    type="text"
                    name="noiCapCCCD"
                    className="form-input-modern"
                    placeholder="VD: Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư"
                    value={formData.noiCapCCCD}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Địa chỉ */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">📍</div>
                <h4 className="form-section-title">Địa chỉ liên hệ</h4>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <span className="form-label-icon">🏙️</span>
                    Tỉnh/Thành phố
                  </label>
                  <select
                    name="maTinh"
                    className="form-select-modern"
                    value={formData.maTinh}
                    onChange={handleChange}
                  >
                    <option value="">-- Chọn tỉnh/thành phố --</option>
                    {provinces.map((t) => (
                      <option key={t.maTinh} value={t.maTinh}>
                        {t.tenTinh}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="form-label-icon">🏘️</span>
                    Quận/Huyện
                  </label>
                  <select
                    name="maHuyen"
                    className="form-select-modern"
                    value={formData.maHuyen}
                    onChange={handleChange}
                    disabled={!formData.maTinh}
                  >
                    <option value="">-- Chọn quận/huyện --</option>
                    {districts.map((h) => (
                      <option key={h.maHuyen} value={h.maHuyen}>
                        {h.tenHuyen}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="form-label-icon">🏡</span>
                    Phường/Xã
                  </label>
                  <select
                    name="maPhuongXa"
                    className="form-select-modern"
                    value={formData.maPhuongXa}
                    onChange={handleChange}
                    disabled={!formData.maHuyen}
                  >
                    <option value="">-- Chọn phường/xã --</option>
                    {wards.map((x) => (
                      <option key={x.maPhuongXa} value={x.maPhuongXa}>
                        {x.tenPhuongXa}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    <span className="form-label-icon">🏠</span>
                    Địa chỉ chi tiết
                  </label>
                  <input
                    type="text"
                    name="diaChiChiTiet"
                    className="form-input-modern"
                    placeholder="Số nhà, tên đường, khu vực..."
                    value={formData.diaChiChiTiet}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Tài khoản ngân hàng */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">🏦</div>
                <h4 className="form-section-title">Thông tin tài khoản ngân hàng</h4>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <span className="form-label-icon">🏦</span>
                    Ngân hàng
                  </label>
                  <input
                    type="text"
                    name="nganHang"
                    className="form-input-modern"
                    placeholder="VD: Vietcombank, Techcombank, VPBank..."
                    value={formData.nganHang}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="form-label-icon">💳</span>
                    Số tài khoản
                  </label>
                  <input
                    type="text"
                    name="soTaiKhoan"
                    className="form-input-modern"
                    placeholder="Nhập số tài khoản ngân hàng"
                    value={formData.soTaiKhoan}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    <span className="form-label-icon">👤</span>
                    Tên chủ tài khoản
                  </label>
                  <input
                    type="text"
                    name="tenChuTK"
                    className="form-input-modern"
                    placeholder="Họ và tên chủ tài khoản (viết HOA KHÔNG DẤU)"
                    value={formData.tenChuTK}
                    onChange={handleChange}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer-modern">
            <button type="button" className="btn-outline-modern" onClick={onClose} disabled={loading}>
              <span className="btn-icon">✕</span>
              Hủy bỏ
            </button>
            <button type="submit" className="btn-primary-modern" disabled={loading}>
              <span className="btn-icon">{loading ? '⏳' : '💾'}</span>
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}