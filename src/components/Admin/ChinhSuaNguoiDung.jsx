import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5114/api';

export default function ChinhSuaNguoiDung({ userId, onClose, onUpdated }) {
  const [form, setForm] = useState({
    maNguoiDung: null,
    hoTen: '',
    email: '',
    soDienThoai: '',
    diaChi: '',
    vaiTro: '',
    trangThai: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  const accessToken = localStorage.getItem('accessToken');

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
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
        diaChi: u.diaChi || '',
        vaiTro: u.vaiTro || '',
        trangThai: u.trangThai || '',
      });
    } catch (e) {
      console.error(e);
      showToast('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setSaving(true);
      const body = {
        hoTen: form.hoTen || null,
        soDienThoai: form.soDienThoai || null,
        diaChi: form.diaChi || null,
        vaiTro: form.vaiTro || null,
        trangThai: form.trangThai || null,
      };

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

      showToast('success', data.message || 'Cập nhật người dùng thành công');
      if (onUpdated) onUpdated();

      // đóng modal sau 1s cho user kịp thấy toast
      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
    } catch (e) {
      console.error(e);
      showToast('error', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!userId) return null;

  return (
  <>
    {toast && (
      <div className="toast-container">
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : ''}`}>
          <div className="toast-message">{toast.message}</div>
          <button className="toast-close" onClick={() => setToast(null)}>
            ✕
          </button>
        </div>
      </div>
    )}

    <div className="modal-backdrop">
      <div className="modal">
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
            {/* 3 hàng đầu: ID / Email, Họ tên / SĐT, Vai trò / Trạng thái */}
            <div className="form-grid-2-rows">
              {/* Hàng 1 */}
              <div className="form-row">
                <span className="form-row-label">Mã người dùng</span>
                <input type="text" value={form.maNguoiDung || ''} disabled />
              </div>
              <div className="form-row">
                <span className="form-row-label">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>

              {/* Hàng 2 */}
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

              {/* Hàng 3 */}
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

            {/* Hàng 4: Địa chỉ, chiếm full width */}
            <div style={{ marginTop: 10 }}>
              <div className="form-row">
                <span className="form-row-label">Địa chỉ</span>
                <textarea
                  value={form.diaChi}
                  onChange={(e) => handleChange('diaChi', e.target.value)}
                />
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
);}