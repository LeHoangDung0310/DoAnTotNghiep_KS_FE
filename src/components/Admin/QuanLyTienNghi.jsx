import React, { useEffect, useState } from 'react';
import Toast from '../Common/Toast'; // ✅ IMPORT

const API_BASE = 'http://localhost:5114/api';
const API_ORIGIN = 'http://localhost:5114';

export default function QuanLyTienNghi() {
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [ten, setTen] = useState('');

  // modal thêm / sửa tiện nghi
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    ten: '',
    icon: '',
  });
  const [saving, setSaving] = useState(false);

  // preview ảnh icon
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState('');

  // modal xác nhận xóa
  const [deletingItem, setDeletingItem] = useState(null);

  // Toast
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const accessToken = localStorage.getItem('accessToken');

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const fetchData = async (page = 1, pageSize = pagination.pageSize) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('pageNumber', page);
      params.append('pageSize', pageSize);
      if (ten.trim()) params.append('ten', ten.trim());

      const res = await fetch(`${API_BASE}/TienNghi/Search?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Lỗi khi lấy danh sách tiện nghi');
      }

      setItems(data.data || []);
      setTotalItems(data.pagination?.totalItems || 0);
      setPagination({
        currentPage: data.pagination?.currentPage || page,
        pageSize: data.pagination?.pageSize || pageSize,
        totalPages: data.pagination?.totalPages || 1,
      });
    } catch (e) {
      console.error(e);
      showToast('error', `❌ ${e.message || 'Có lỗi xảy ra'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, pagination.pageSize);
  }, []);

  const handleSearch = () => fetchData(1, pagination.pageSize);

  const handleReset = () => {
    setTen('');
    fetchData(1, pagination.pageSize);
  };

  const handleChangePage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchData(page, pagination.pageSize);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({ ten: '', icon: '' });
    setIconFile(null);
    setIconPreview('');
    setShowForm(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      ten: item.ten || '',
      icon: item.icon || '',
    });
    setIconFile(null);
    setIconPreview(item.icon || '');
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.ten.trim()) {
      showToast('error', '⚠️ Tên tiện nghi không được để trống');
      return;
    }

    const isEdit = !!editingItem;
    const url = isEdit ? `${API_BASE}/TienNghi/${editingItem.maTienNghi}` : `${API_BASE}/TienNghi`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      setSaving(true);
      let iconUrl = form.icon?.trim() || '';

      // Upload icon nếu có file mới
      if (iconFile) {
        const fd = new FormData();
        fd.append('file', iconFile);

        const uploadRes = await fetch(`${API_BASE.replace('/api', '')}/api/tiennghi-icon`, {
          method: 'POST',
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: fd,
        });

        const uploadData = await uploadRes.json().catch(() => ({}));
        const success = uploadData.success ?? uploadData.Success ?? false;

        if (!uploadRes.ok || !success || !uploadData.url) {
          throw new Error(uploadData.message || 'Upload icon không thành công');
        }
        iconUrl = uploadData.url;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          ten: form.ten.trim(),
          icon: iconUrl || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || (isEdit ? 'Không thể cập nhật tiện nghi' : 'Không thể tạo tiện nghi'));
      }

      showToast('success', `✅ ${data.message || (isEdit ? 'Cập nhật tiện nghi thành công' : 'Tạo tiện nghi thành công')}`);
      setShowForm(false);
      setEditingItem(null);
      setIconFile(null);
      setIconPreview('');
      fetchData(1, pagination.pageSize);
    } catch (err) {
      console.error(err);
      showToast('error', `❌ ${err.message || 'Có lỗi xảy ra'}`);
    } finally {
      setSaving(false);
    }
  };

  const openDeleteConfirm = (item) => {
    setDeletingItem(item);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      const res = await fetch(`${API_BASE}/TienNghi/${deletingItem.maTienNghi}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Không thể xóa tiện nghi (có thể đang được sử dụng)');
      }

      showToast('success', `✅ ${data.message || 'Xóa tiện nghi thành công'}`);
      setDeletingItem(null);
      fetchData(1, pagination.pageSize);
    } catch (err) {
      console.error(err);
      showToast('error', `❌ ${err.message || 'Có lỗi xảy ra khi xóa tiện nghi'}`);
    }
  };

  const handleIconFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', '⚠️ Vui lòng chọn file hình ảnh (png, jpg, svg...)');
      return;
    }

    setIconFile(file);
    const url = URL.createObjectURL(file);
    setIconPreview(url);
  };

  return (
    <div className="admin-card">
      {/* ✅ Toast Component */}
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ show: false, type: '', message: '' })}
          duration={3000}
        />
      )}

      <div className="room-header">
        <div className="room-header-title">Quản lý tiện nghi</div>
        <div className="room-header-actions">
          <button className="btn-outline" onClick={handleReset}>Đặt lại</button>
          <button className="btn-primary" onClick={handleSearch}>Tìm kiếm</button>
          <button className="btn-success" onClick={openCreateModal}>+ Thêm tiện nghi</button>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="room-search-row" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="room-search-input">
          <label>Tên tiện nghi</label>
          <input
            type="text"
            placeholder="Nhập tên tiện nghi"
            value={ten}
            onChange={(e) => setTen(e.target.value)}
          />
        </div>

        <div className="room-search-select">
          <label>Số bản ghi / trang</label>
          <select
            value={pagination.pageSize}
            onChange={(e) =>
              setPagination((prev) => ({
                ...prev,
                pageSize: Number(e.target.value),
              }))
            }
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã tiện nghi</th>
              <th>Tên tiện nghi</th>
              <th>Icon</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4}>Đang tải dữ liệu...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4}>Không có dữ liệu</td></tr>
            ) : (
              items.map((t) => (
                <tr key={t.maTienNghi}>
                  <td>{t.maTienNghi}</td>
                  <td className="admin-table-name">{t.ten}</td>
                  <td>
                    {t.icon ? (
                      <img
                        src={t.icon.startsWith('http') ? t.icon : `${API_ORIGIN}${t.icon}`}
                        alt={t.ten}
                        style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 6 }}
                      />
                    ) : '-'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-icon-btn edit" onClick={() => openEditModal(t)}>✏️</button>
                      <button className="action-icon-btn delete" onClick={() => openDeleteConfirm(t)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="pagination">
        <span>Tổng: <strong>{totalItems}</strong> tiện nghi</span>
        <button onClick={() => handleChangePage(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>‹</button>
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            className={p === pagination.currentPage ? 'active' : ''}
            onClick={() => handleChangePage(p)}
          >
            {p}
          </button>
        ))}
        <button onClick={() => handleChangePage(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages}>›</button>
      </div>

      {/* ✅ Modal thêm/sửa tiện nghi - GRADIENT HEADER */}
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            {/* Header với gradient */}
            <div className="modal-header-gradient">
              <div className="modal-header-content">
                <div className="modal-icon">{editingItem ? '✏️' : '➕'}</div>
                <div>
                  <h3 className="modal-title-large">
                    {editingItem ? 'Chỉnh sửa tiện nghi' : 'Thêm tiện nghi mới'}
                  </h3>
                  <p className="modal-subtitle">
                    {editingItem 
                      ? `Cập nhật thông tin tiện nghi #${editingItem.maTienNghi}`
                      : 'Tạo tiện nghi mới cho khách sạn'}
                  </p>
                </div>
              </div>
              <button className="modal-close-btn-gradient" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body-scrollable">
                {/* Thông tin tiện nghi */}
                <div className="form-section">
                  <div className="form-section-header">
                    <div className="form-section-icon">📝</div>
                    <h4 className="form-section-title">Thông tin tiện nghi</h4>
                  </div>

                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label className="form-label">
                        <span className="form-label-icon">🏷️</span>
                        Tên tiện nghi
                        <span className="form-label-required">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input-modern"
                        placeholder="VD: Điều hòa, Wi-Fi, TV, Minibar..."
                        value={form.ten}
                        onChange={(e) => setForm((prev) => ({ ...prev, ten: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">
                        <span className="form-label-icon">🖼️</span>
                        Icon tiện nghi
                      </label>

                      {iconPreview && (
                        <div style={{ marginBottom: 12 }}>
                          <img
                            src={iconPreview}
                            alt="preview icon"
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: 'cover',
                              borderRadius: 12,
                              border: '2px solid #e5e7eb',
                              padding: 8,
                            }}
                          />
                        </div>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIconFileChange}
                        className="form-input-modern"
                        style={{ padding: '8px 12px' }}
                      />

                      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
                        💡 Tuỳ chọn. Hỗ trợ PNG, JPG, SVG... Nếu không chọn, icon cũ sẽ được giữ lại.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer-modern">
                <button type="button" className="btn-outline-modern" onClick={() => setShowForm(false)} disabled={saving}>
                  <span className="btn-icon">✕</span>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-primary-modern" disabled={saving}>
                  <span className="btn-icon">{saving ? '⏳' : '💾'}</span>
                  {saving ? (editingItem ? 'Đang lưu...' : 'Đang tạo...') : (editingItem ? 'Lưu thay đổi' : 'Tạo tiện nghi')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {deletingItem && (
        <div className="modal-backdrop">
          <div className="modal confirm-modal">
            <div className="modal-header">
              <h3>Xóa tiện nghi</h3>
              <button className="modal-close-btn" onClick={() => setDeletingItem(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn xóa tiện nghi <strong>{deletingItem.ten} (Mã: {deletingItem.maTienNghi})</strong>?
                <br />
                Nếu tiện nghi đang được gán cho phòng, bạn phải gỡ ra trước.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary-ghost" onClick={() => setDeletingItem(null)}>Hủy</button>
              <button className="btn-primary-rounded btn-danger" onClick={handleDelete}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}