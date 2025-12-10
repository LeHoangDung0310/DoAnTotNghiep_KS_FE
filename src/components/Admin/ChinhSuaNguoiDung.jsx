import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5114/api';

export default function ChinhSuaNguoiDung({ userId, onClose, onUpdated, onShowToast }) {
  const [form, setForm] = useState({
    maNguoiDung: null,
    hoTen: '',
    email: '',
    soDienThoai: '',
    diaChiChiTiet: '',
    maTinh: '',
    maHuyen: '',
    maPhuongXa: '',
    vaiTro: '',
    trangThai: '',
    soCCCD: '',
    ngayCapCCCD: '',
    noiCapCCCD: '',
    ngaySinh: '',
    gioiTinh: '',
    // Thông tin ngân hàng
    nganHang: '',
    soTaiKhoan: '',
    tenChuTK: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Danh sách địa chỉ
  const [tinhs, setTinhs] = useState([]);
  const [huyens, setHuyens] = useState([]);
  const [phuongXas, setPhuongXas] = useState([]);

  const accessToken = localStorage.getItem('accessToken');

  // Lấy danh sách tỉnh
  const fetchTinhs = async () => {
    try {
      const res = await fetch(`${API_BASE}/DiaChi/Tinh`);
      const data = await res.json();
      if (data.success) {
        setTinhs(data.data || []);
      }
    } catch (e) {
      console.error('Lỗi khi tải danh sách tỉnh:', e);
    }
  };

  // Lấy danh sách huyện theo tỉnh
  const fetchHuyens = async (maTinh) => {
    if (!maTinh) {
      setHuyens([]);
      setPhuongXas([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/DiaChi/Huyen?maTinh=${maTinh}`);
      const data = await res.json();
      if (data.success) {
        setHuyens(data.data || []);
      }
    } catch (e) {
      console.error('Lỗi khi tải danh sách huyện:', e);
    }
  };

  // Lấy danh sách phường xã theo huyện
  const fetchPhuongXas = async (maHuyen) => {
    if (!maHuyen) {
      setPhuongXas([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/DiaChi/PhuongXa?maHuyen=${maHuyen}`);
      const data = await res.json();
      if (data.success) {
        setPhuongXas(data.data || []);
      }
    } catch (e) {
      console.error('Lỗi khi tải danh sách phường xã:', e);
    }
  };

  const fetchUserDetail = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/NguoiDung/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Không tải được thông tin người dùng');
      }

      const u = data.data || {};
      
      // Format date cho input type="date"
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toISOString().split('T')[0];
      };

      setForm({
        maNguoiDung: u.maNguoiDung,
        hoTen: u.hoTen || '',
        email: u.email || '',
        soDienThoai: u.soDienThoai || '',
        diaChiChiTiet: u.diaChiChiTiet || '',
        maTinh: u.maTinh || '',
        maHuyen: u.maHuyen || '',
        maPhuongXa: u.maPhuongXa || '',
        vaiTro: u.vaiTro || '',
        trangThai: u.trangThai || '',
        soCCCD: u.soCCCD || '',
        ngayCapCCCD: formatDate(u.ngayCapCCCD),
        noiCapCCCD: u.noiCapCCCD || '',
        ngaySinh: formatDate(u.ngaySinh),
        gioiTinh: u.gioiTinh || '',
        // Thông tin ngân hàng
        nganHang: u.nganHang || '',
        soTaiKhoan: u.soTaiKhoan || '',
        tenChuTK: u.tenChuTK || '',
      });

      // Tải huyện và phường xã nếu có
      if (u.maTinh) {
        await fetchHuyens(u.maTinh);
      }
      if (u.maHuyen) {
        await fetchPhuongXas(u.maHuyen);
      }
    } catch (e) {
      console.error(e);
      onShowToast && onShowToast('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTinhs();
    fetchUserDetail();
  }, [userId]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    // Khi đổi tỉnh -> reset huyện, phường xã
    if (field === 'maTinh') {
      setForm((prev) => ({ ...prev, maHuyen: '', maPhuongXa: '' }));
      fetchHuyens(value);
      setPhuongXas([]);
    }
    // Khi đổi huyện -> reset phường xã
    if (field === 'maHuyen') {
      setForm((prev) => ({ ...prev, maPhuongXa: '' }));
      fetchPhuongXas(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setSaving(true);
      
      // Validate
      if (!form.hoTen || !form.hoTen.trim()) {
        throw new Error('Vui lòng nhập họ tên');
      }

      const body = {
        hoTen: form.hoTen.trim(),
        soDienThoai: form.soDienThoai?.trim() || null,
        diaChiChiTiet: form.diaChiChiTiet?.trim() || null,
        maPhuongXa: form.maPhuongXa ? parseInt(form.maPhuongXa) : null,
        vaiTro: form.vaiTro || null,
        trangThai: form.trangThai || null,
        soCCCD: form.soCCCD?.trim() || null,
        ngayCapCCCD: form.ngayCapCCCD || null,
        noiCapCCCD: form.noiCapCCCD?.trim() || null,
        ngaySinh: form.ngaySinh || null,
        gioiTinh: form.gioiTinh || null,
        // Thông tin ngân hàng
        nganHang: form.nganHang?.trim() || null,
        soTaiKhoan: form.soTaiKhoan?.trim() || null,
        tenChuTK: form.tenChuTK?.trim() || null,
      };

      console.log('Dữ liệu gửi đi:', body);

      const res = await fetch(`${API_BASE}/NguoiDung/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Không thể cập nhật người dùng');
      }

      onShowToast && onShowToast('success', data.message || 'Cập nhật người dùng thành công');
      onUpdated && onUpdated();
      onClose && onClose();
    } catch (e) {
      console.error(e);
      onShowToast && onShowToast('error', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!userId) return null;

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
              <h3 className="modal-title-large">Chỉnh sửa thông tin người dùng</h3>
              <p className="modal-subtitle">
                Cập nhật thông tin chi tiết người dùng #{form.maNguoiDung} • {form.email}
              </p>
            </div>
          </div>
          <button className="modal-close-btn-gradient" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-loading-spinner"></div>
            <p>Đang tải thông tin...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body-scrollable">
              {/* Thông tin cơ bản */}
              <div className="form-section">
                <div className="form-section-header">
                  <div className="form-section-icon">👤</div>
                  <h4 className="form-section-title">Thông tin cơ bản</h4>
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
                      className="form-input-modern"
                      placeholder="Nhập họ và tên đầy đủ"
                      value={form.hoTen}
                      onChange={(e) => handleChange('hoTen', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="form-label-icon">📧</span>
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-input-modern"
                      value={form.email}
                      disabled
                      style={{ background: '#f3f4f6', color: '#6b7280' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="form-label-icon">📱</span>
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      className="form-input-modern"
                      placeholder="0xxx xxx xxx"
                      value={form.soDienThoai}
                      onChange={(e) => handleChange('soDienThoai', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="form-label-icon">⚧</span>
                      Giới tính
                    </label>
                    <select
                      className="form-select-modern"
                      value={form.gioiTinh}
                      onChange={(e) => handleChange('gioiTinh', e.target.value)}
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
                      className="form-input-modern"
                      value={form.ngaySinh}
                      onChange={(e) => handleChange('ngaySinh', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="form-label-icon">🎭</span>
                      Vai trò
                    </label>
                    <select
                      className="form-select-modern"
                      value={form.vaiTro}
                      onChange={(e) => handleChange('vaiTro', e.target.value)}
                    >
                      <option value="">-- Chọn vai trò --</option>
                      <option value="Admin">🔴 Admin</option>
                      <option value="LeTan">🔵 Lễ tân</option>
                      <option value="KhachHang">🟢 Khách hàng</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="form-label-icon">📊</span>
                      Trạng thái
                    </label>
                    <select
                      className="form-select-modern"
                      value={form.trangThai}
                      onChange={(e) => handleChange('trangThai', e.target.value)}
                    >
                      <option value="">-- Chọn trạng thái --</option>
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
                      className="form-input-modern"
                      placeholder="Nhập số CCCD (12 chữ số)"
                      value={form.soCCCD}
                      onChange={(e) => handleChange('soCCCD', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="form-label-icon">📅</span>
                      Ngày cấp
                    </label>
                    <input
                      type="date"
                      className="form-input-modern"
                      value={form.ngayCapCCCD}
                      onChange={(e) => handleChange('ngayCapCCCD', e.target.value)}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">
                      <span className="form-label-icon">🏛️</span>
                      Nơi cấp
                    </label>
                    <input
                      type="text"
                      className="form-input-modern"
                      placeholder="VD: Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư"
                      value={form.noiCapCCCD}
                      onChange={(e) => handleChange('noiCapCCCD', e.target.value)}
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
                      className="form-select-modern"
                      value={form.maTinh}
                      onChange={(e) => handleChange('maTinh', e.target.value)}
                    >
                      <option value="">-- Chọn tỉnh/thành phố --</option>
                      {tinhs.map((t) => (
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
                      className="form-select-modern"
                      value={form.maHuyen}
                      onChange={(e) => handleChange('maHuyen', e.target.value)}
                      disabled={!form.maTinh}
                    >
                      <option value="">-- Chọn quận/huyện --</option>
                      {huyens.map((h) => (
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
                      className="form-select-modern"
                      value={form.maPhuongXa}
                      onChange={(e) => handleChange('maPhuongXa', e.target.value)}
                      disabled={!form.maHuyen}
                    >
                      <option value="">-- Chọn phường/xã --</option>
                      {phuongXas.map((x) => (
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
                      className="form-input-modern"
                      placeholder="Số nhà, tên đường, khu vực..."
                      value={form.diaChiChiTiet}
                      onChange={(e) => handleChange('diaChiChiTiet', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Tài khoản ngân hàng - MỚI */}
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
                      className="form-input-modern"
                      placeholder="VD: Vietcombank, Techcombank..."
                      value={form.nganHang}
                      onChange={(e) => handleChange('nganHang', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="form-label-icon">💳</span>
                      Số tài khoản
                    </label>
                    <input
                      type="text"
                      className="form-input-modern"
                      placeholder="Nhập số tài khoản"
                      value={form.soTaiKhoan}
                      onChange={(e) => handleChange('soTaiKhoan', e.target.value)}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">
                      <span className="form-label-icon">👤</span>
                      Tên chủ tài khoản
                    </label>
                    <input
                      type="text"
                      className="form-input-modern"
                      placeholder="Họ và tên chủ tài khoản (viết HOA KHÔNG DẤU)"
                      value={form.tenChuTK}
                      onChange={(e) => handleChange('tenChuTK', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer-modern">
              <button type="button" className="btn-outline-modern" onClick={onClose}>
                <span className="btn-icon">✕</span>
                Hủy bỏ
              </button>
              <button type="submit" className="btn-primary-modern" disabled={saving}>
                <span className="btn-icon">💾</span>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}