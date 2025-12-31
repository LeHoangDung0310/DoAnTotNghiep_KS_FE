import React, { useEffect, useState } from 'react';
import Toast from '../Common/Toast';

const API_BASE = 'http://localhost:5114/api';

export default function QuanLyTang() {
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [tenTang, setTenTang] = useState('');

  // ✅ Reset về trang 1 khi lọc hoặc thay đổi pageSize
  useEffect(() => {
    fetchData(1, pagination.pageSize);
  }, [tenTang, pagination.pageSize]);

  // modal thêm / sửa tầng
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    tenTang: '',
    moTa: '',
  });
  const [saving, setSaving] = useState(false);

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
      if (tenTang.trim()) params.append('tenTang', tenTang.trim());

      const res = await fetch(`${API_BASE}/Tang/Search?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Lỗi khi lấy danh sách tầng');
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
      showToast('error', `❌ ${e.message || 'Lỗi khi lấy danh sách tầng'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  }, []);

  const handleSearch = () => fetchData(1, pagination.pageSize);

  const handleReset = () => {
    setTenTang('');
    fetchData(1, pagination.pageSize);
  };

  const handleChangePage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchData(page, pagination.pageSize);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({ tenTang: '', moTa: '' });
    setShowForm(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      tenTang: item.tenTang || '',
      moTa: item.moTa || '',
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.tenTang.trim()) {
      showToast('error', '⚠️ Tên tầng không được để trống');
      return;
    }

    const isEdit = !!editingItem;
    const url = isEdit ? `${API_BASE}/Tang/${editingItem.maTang}` : `${API_BASE}/Tang`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      setSaving(true);
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          tenTang: form.tenTang.trim(),
          moTa: form.moTa?.trim() || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || (isEdit ? 'Không thể cập nhật tầng' : 'Không thể tạo tầng'));
      }

      showToast('success', `✅ ${data.message || (isEdit ? 'Cập nhật tầng thành công' : 'Tạo tầng thành công')}`);
      setShowForm(false);
      setEditingItem(null);
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
      const url = `${API_BASE}/Tang/${deletingItem.maTang}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Không thể xóa tầng');
      }

      showToast('success', `✅ ${data.message || 'Xóa tầng thành công'}`);
      setDeletingItem(null);
      fetchData(1, pagination.pageSize);
    } catch (err) {
      console.error(err);
      showToast('error', `❌ ${err.message || 'Có lỗi xảy ra khi xóa tầng'}`);
    }
  };

  return (
    <div className="admin-card">
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ show: false, type: '', message: '' })}
          duration={3000}
        />
      )}

      <div className="room-header">
        <div className="room-header-title">Quản lý tầng</div>
        <div className="room-header-actions">
          <button className="btn-outline" onClick={handleReset}>Đặt lại</button>
          <button className="btn-primary" onClick={handleSearch}>Tìm kiếm</button>
          <button className="btn-success" onClick={openCreateModal}>+ Thêm tầng</button>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="room-search-row" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="room-search-input">
          <label>Tên tầng</label>
          <input
            type="text"
            placeholder="Nhập tên tầng"
            value={tenTang}
            onChange={(e) => setTenTang(e.target.value)}
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
              <th>Mã tầng</th>
              <th>Tên tầng</th>
              <th>Mô tả</th>
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
                <tr key={t.maTang}>
                  <td>{t.maTang}</td>
                  <td><strong>{t.tenTang}</strong></td>
                  <td>{t.moTa || '-'}</td>
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

      {/* Pagination */}
      <div className="pagination">
        <div className="pagination-info">
          Hiển thị <strong>{items.length}</strong> / <strong>{totalItems}</strong> tầng
        </div>
        <div className="pag-actions">
          <button
            className="pag-btn nav-btn"
            onClick={() => handleChangePage(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            Trước
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`pag-btn ${p === pagination.currentPage ? 'active' : ''}`}
              onClick={() => handleChangePage(p)}
            >
              {p}
            </button>
          ))}

          <button
            className="pag-btn nav-btn"
            onClick={() => handleChangePage(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Sau
          </button>
        </div>
      </div>

      {/* ✅ MODAL MỚI - GRADIENT HEADER */}
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal modal-large modal-booking" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            {/* Header gradient */}
            <div className="modal-header-gradient">
              <div className="modal-header-content">
                <div className="modal-icon">{editingItem ? '✏️' : '➕'}</div>
                <div>
                  <h3 className="modal-title-large">
                    {editingItem ? 'Cập nhật thông tin tầng' : 'Thêm tầng mới'}
                  </h3>
                  <p className="modal-subtitle">
                    {editingItem
                      ? `Chỉnh sửa thông tin cho tầng "${editingItem.tenTang}"`
                      : 'Tạo tầng mới cho khách sạn'}
                  </p>
                </div>
              </div>
              <button className="modal-close-btn-gradient" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body modal-body-scrollable">
                {/* Section: Thông tin tầng */}
                <div className="form-section">
                  <div className="form-section-header">
                    <div className="form-section-icon">🏢</div>
                    <h4 className="form-section-title">Thông tin tầng</h4>
                  </div>

                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label className="form-label">
                        <span className="form-label-icon">🏷️</span>
                        Tên tầng
                        <span className="form-label-required">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input-modern"
                        required
                        value={form.tenTang}
                        onChange={(e) => setForm((prev) => ({ ...prev, tenTang: e.target.value }))}
                        placeholder="VD: Tầng 1, Tầng 2, Lầu 3..."
                      />
                      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
                        💡 Đặt tên dễ hiểu và rõ ràng để phân biệt các tầng
                      </p>
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">
                        <span className="form-label-icon">📝</span>
                        Mô tả
                      </label>
                      <textarea
                        rows="3"
                        className="form-textarea-modern"
                        value={form.moTa}
                        onChange={(e) => setForm((prev) => ({ ...prev, moTa: e.target.value }))}
                        placeholder="Mô tả ngắn gọn về tầng này (không bắt buộc)..."
                      />
                      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
                        💡 VD: Khu phòng Standard, gần sảnh, view đẹp...
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer modal-footer-modern">
                <button type="button" className="btn-outline-modern" onClick={() => setShowForm(false)} disabled={saving}>
                  <span className="btn-icon">✕</span>
                  Hủy
                </button>
                <button type="submit" className="btn-primary-modern" disabled={saving}>
                  <span className="btn-icon">{saving ? '⏳' : (editingItem ? '↻' : '✓')}</span>
                  {saving
                    ? (editingItem ? 'Đang lưu...' : 'Đang tạo...')
                    : (editingItem ? 'Cập nhật' : 'Tạo tầng')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {deletingItem && (
        <div className="modal-backdrop">
          <div className="modal modal-sm">
            <div className="modal-header">
              <div className="modal-header-left">
                <h3>Xóa tầng</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setDeletingItem(null)}>✕</button>
            </div>

            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn xóa tầng{' '}
                <strong>{deletingItem.tenTang} (Mã: {deletingItem.maTang})</strong>?
                <br />
                Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="modal-footer">
              <div className="modal-footer-right">
                <button type="button" className="btn-outline" onClick={() => setDeletingItem(null)}>Hủy</button>
                <button type="button" className="btn-primary btn-danger" onClick={handleDelete}>Xóa</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}