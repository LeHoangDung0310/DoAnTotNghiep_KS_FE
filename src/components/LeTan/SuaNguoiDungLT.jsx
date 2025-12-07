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
      });

      if (user.maTinh) {
        fetchDistricts(user.maTinh);
        if (user.maHuyen) {
          fetchWards(user.maHuyen);
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải thông tin:', err);
      onShowToast('error', 'Không thể tải thông tin người dùng');
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
    setLoading(true);

    try {
      const updateData = {
        hoTen: formData.hoTen,
        soDienThoai: formData.soDienThoai,
        email: formData.email,
        soCCCD: formData.soCCCD,
        ngayCapCCCD: formData.ngayCapCCCD || null,
        noiCapCCCD: formData.noiCapCCCD,
        ngaySinh: formData.ngaySinh || null,
        gioiTinh: formData.gioiTinh,
        diaChiChiTiet: formData.diaChiChiTiet,
        maPhuongXa: formData.maPhuongXa ? parseInt(formData.maPhuongXa) : null,
        trangThai: formData.trangThai,
        // KHÔNG GỬI VaiTro
      };

      await api.put(`/api/NguoiDung/${userId}`, updateData);
      onSuccess();
    } catch (err) {
      console.error('Lỗi khi cập nhật:', err);
      onShowToast(
        'error',
        err.response?.data?.message || 'Cập nhật thất bại'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 800 }}
      >
        <div className="modal-header">
          <h3 className="modal-title">✏️ Chỉnh sửa thông tin khách hàng</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Thông tin cá nhân */}
            <div className="form-section">
              <h4 className="form-section-title">Thông tin cá nhân</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Họ tên *</label>
                  <input
                    type="text"
                    name="hoTen"
                    className="form-control"
                    value={formData.hoTen}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    name="soDienThoai"
                    className="form-control"
                    value={formData.soDienThoai}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Giới tính</label>
                  <select
                    name="gioiTinh"
                    className="form-control"
                    value={formData.gioiTinh}
                    onChange={handleChange}
                  >
                    <option value="">-- Chọn --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Ngày sinh</label>
                  <input
                    type="date"
                    name="ngaySinh"
                    className="form-control"
                    value={formData.ngaySinh}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Trạng thái</label>
                  <select
                    name="trangThai"
                    className="form-control"
                    value={formData.trangThai}
                    onChange={handleChange}
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Tạm khóa">Tạm khóa</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CCCD */}
            <div className="form-section">
              <h4 className="form-section-title">Thông tin CCCD</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Số CCCD</label>
                  <input
                    type="text"
                    name="soCCCD"
                    className="form-control"
                    value={formData.soCCCD}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Ngày cấp</label>
                  <input
                    type="date"
                    name="ngayCapCCCD"
                    className="form-control"
                    value={formData.ngayCapCCCD}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Nơi cấp</label>
                  <input
                    type="text"
                    name="noiCapCCCD"
                    className="form-control"
                    value={formData.noiCapCCCD}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Địa chỉ */}
            <div className="form-section">
              <h4 className="form-section-title">Địa chỉ</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Tỉnh/Thành phố</label>
                  <select
                    name="maTinh"
                    className="form-control"
                    value={formData.maTinh}
                    onChange={handleChange}
                  >
                    <option value="">-- Chọn tỉnh --</option>
                    {provinces.map((t) => (
                      <option key={t.maTinh} value={t.maTinh}>
                        {t.tenTinh}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quận/Huyện</label>
                  <select
                    name="maHuyen"
                    className="form-control"
                    value={formData.maHuyen}
                    onChange={handleChange}
                    disabled={!formData.maTinh}
                  >
                    <option value="">-- Chọn huyện --</option>
                    {districts.map((h) => (
                      <option key={h.maHuyen} value={h.maHuyen}>
                        {h.tenHuyen}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Phường/Xã</label>
                  <select
                    name="maPhuongXa"
                    className="form-control"
                    value={formData.maPhuongXa}
                    onChange={handleChange}
                    disabled={!formData.maHuyen}
                  >
                    <option value="">-- Chọn xã --</option>
                    {wards.map((x) => (
                      <option key={x.maPhuongXa} value={x.maPhuongXa}>
                        {x.tenPhuongXa}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Địa chỉ chi tiết</label>
                  <input
                    type="text"
                    name="diaChiChiTiet"
                    className="form-control"
                    placeholder="Số nhà, tên đường..."
                    value={formData.diaChiChiTiet}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Đang lưu...' : '💾 Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}