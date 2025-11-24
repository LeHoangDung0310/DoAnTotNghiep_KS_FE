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
      };

      console.log('Dữ liệu gửi đi:', body); // Debug

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
    <>
      <div className="modal-backdrop">
        <div className="modal modal-large">
          <div className="modal-header">
            <div className="modal-header-left">
              <h3>Chỉnh sửa người dùng</h3>
              <div className="modal-sub-info">
                {form.maNguoiDung && (
                  <span className="badge">
                    <span>#</span>
                    <span>{form.maNguoiDung}</span>
                  </span>
                )}

                {form.vaiTro && (
                  <span
                    className={
                      'badge ' +
                      (form.vaiTro === 'Admin'
                        ? 'badge-role-admin'
                        : form.vaiTro === 'LeTan'
                        ? 'badge-role-letan'
                        : 'badge-role-khach')
                    }
                  >
                    <span>Vai trò</span>
                    <span>• {form.vaiTro}</span>
                  </span>
                )}

                {form.trangThai && (
                  <span
                    className={
                      'badge ' +
                      (form.trangThai === 'Hoạt động'
                        ? 'badge-status-active'
                        : 'badge-status-locked')
                    }
                  >
                    <span>Trạng thái</span>
                    <span>• {form.trangThai}</span>
                  </span>
                )}
              </div>
            </div>

            <button className="modal-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 20 }}>Đang tải thông tin...</div>
          ) : (
            <form className="modal-body" onSubmit={handleSubmit}>
              {/* Hàng 1: ID / Email */}
              <div className="form-grid-2-rows">
                <div className="form-row">
                  <span className="form-row-label">Mã người dùng</span>
                  <input type="text" value={form.maNguoiDung || ''} disabled />
                </div>
                <div className="form-row">
                  <span className="form-row-label">Email</span>
                  <input type="email" value={form.email} disabled />
                </div>

                {/* Hàng 2: Họ tên / SĐT */}
                <div className="form-row">
                  <span className="form-row-label">Họ tên</span>
                  <input
                    type="text"
                    value={form.hoTen}
                    onChange={(e) => handleChange('hoTen', e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <span className="form-row-label">Số điện thoại</span>
                  <input
                    type="text"
                    value={form.soDienThoai}
                    onChange={(e) => handleChange('soDienThoai', e.target.value)}
                  />
                </div>

                {/* Hàng 3: Vai trò / Trạng thái */}
                <div className="form-row">
                  <span className="form-row-label">Vai trò</span>
                  <select
                    value={form.vaiTro}
                    onChange={(e) => handleChange('vaiTro', e.target.value)}
                  >
                    <option value="">-- Chọn vai trò --</option>
                    <option value="Admin">Admin</option>
                    <option value="LeTan">Lễ tân</option>
                    <option value="KhachHang">Khách hàng</option>
                  </select>
                </div>
                <div className="form-row">
                  <span className="form-row-label">Trạng thái</span>
                  <select
                    value={form.trangThai}
                    onChange={(e) => handleChange('trangThai', e.target.value)}
                  >
                    <option value="">-- Chọn trạng thái --</option>
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Tạm khóa">Tạm khóa</option>
                  </select>
                </div>
              </div>

              {/* Địa chỉ */}
              <div style={{ marginTop: 16 }}>
                <h4 style={{ marginBottom: 12, fontSize: 15, fontWeight: 600 }}>
                  Địa chỉ
                </h4>
                <div className="form-grid-2-rows">
                  {/* Tỉnh / Huyện */}
                  <div className="form-row">
                    <span className="form-row-label">Tỉnh/Thành phố</span>
                    <select
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
                  <div className="form-row">
                    <span className="form-row-label">Quận/Huyện</span>
                    <select
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

                  {/* Phường xã / Địa chỉ chi tiết */}
                  <div className="form-row">
                    <span className="form-row-label">Phường/Xã</span>
                    <select
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
                  <div className="form-row">
                    <span className="form-row-label">Địa chỉ chi tiết</span>
                    <input
                      type="text"
                      placeholder="Số nhà, tên đường..."
                      value={form.diaChiChiTiet}
                      onChange={(e) => handleChange('diaChiChiTiet', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary-ghost"
                  onClick={onClose}
                  disabled={saving}
                >
                  Hủy
                </button>
                <div className="modal-footer-right">
                  <button
                    type="submit"
                    className="btn-primary-rounded"
                    disabled={saving}
                  >
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}