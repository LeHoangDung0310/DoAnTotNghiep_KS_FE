import React, { useEffect, useState } from 'react';
import Toast from '../Common/Toast'; // ✅ IMPORT

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

  // modal thêm / sửa tầng
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = thêm mới, khác null = đang sửa
  const [form, setForm] = useState({
    tenTang: '',
    moTa: '',
  });
  const [saving, setSaving] = useState(false);

  // modal xác nhận xóa
  const [deletingItem, setDeletingItem] = useState(null);

  // Toast
  const [toast, setToast] = useState({ show: false, type: '', message: '' }); // ✅ ĐỔI

  const accessToken = localStorage.getItem('accessToken');

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
      showToast('error', e.message || 'Lỗi khi lấy danh sách tầng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // chỉ gọi 1 lần khi component mount
    fetchData(1, pagination.pageSize);
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
      showToast('error', 'Tên tầng không được để trống');
      return;
    }

    const isEdit = !!editingItem;
    const url = isEdit
      ? `${API_BASE}/Tang/${editingItem.maTang}`
      : `${API_BASE}/Tang`;
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

      showToast('success', data.message || (isEdit ? 'Cập nhật tầng thành công' : 'Tạo tầng thành công'));
      setShowForm(false);
      setEditingItem(null);
      fetchData(1, pagination.pageSize);
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Có lỗi xảy ra');
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

      showToast('success', data.message || 'Xóa tầng thành công');
      setDeletingItem(null);
      fetchData(1, pagination.pageSize);
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Có lỗi xảy ra khi xóa tầng');
    }
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message }); // ✅ ĐỔI
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
        <div className="room-header-title">Quản lý tầng</div>
        <div className="room-header-actions">
          <button className="btn-outline" onClick={handleReset}>
            Đặt lại
          </button>
          <button className="btn-primary" onClick={handleSearch}>
            Tìm kiếm
          </button>
          {/* nút thêm tầng */}
          <button className="btn-success" onClick={openCreateModal}>
            + Thêm tầng
          </button>
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
              <tr>
                <td colSpan={4}>Đang tải dữ liệu...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4}>Không có dữ liệu</td>
              </tr>
            ) : (
              items.map((t) => (
                <tr key={t.maTang}>
                  <td>{t.maTang}</td>
                  <td>{t.tenTang}</td>
                  <td>{t.moTa || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-icon-btn edit"
                        onClick={() => openEditModal(t)}
                      >
                        ✏️
                      </button>
                      <button
                        className="action-icon-btn delete"
                        onClick={() => openDeleteConfirm(t)}
                      >
                        🗑️
                      </button>
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
        <span>
          Tổng: <strong>{totalItems}</strong> tầng
        </span>
        <button
          onClick={() => handleChangePage(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        >
          ‹
        </button>
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            className={p === pagination.currentPage ? 'active' : ''}
            onClick={() => handleChangePage(p)}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => handleChangePage(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
        >
          ›
        </button>
      </div>

      {/* Modal thêm / sửa tầng */}
      {showForm && (
        <div className="modal-backdrop">
          <div className="modal modal-sm">
            <div className="modal-header">
              <div className="modal-header-left">
                <h3>{editingItem ? 'Chỉnh sửa tầng' : 'Thêm tầng mới'}</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body floor-modal-body">
                {/* Hàng 1: Tên tầng */}
                <div className="form-row full">
                  <label className="form-label-required">Tên tầng</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.tenTang}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, tenTang: e.target.value }))
                    }
                    placeholder="VD: Tầng 1"
                    required
                  />
                  <span className="form-help-text">
                    Đặt tên dễ hiểu, ví dụ: Tầng 1, Tầng 2, Lầu 3...
                  </span>
                </div>

                {/* Hàng 2: Mô tả */}
                <div className="form-row full">
                  <label>Mô tả (không bắt buộc)</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    value={form.moTa}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, moTa: e.target.value }))
                    }
                    placeholder="Mô tả ngắn cho tầng, ví dụ: Khu phòng standard, gần sảnh..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <div className="modal-footer-right">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingItem(null);
                    }}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving
                      ? editingItem
                        ? 'Đang lưu...'
                        : 'Đang tạo...'
                      : editingItem
                      ? 'Lưu thay đổi'
                      : 'Lưu tầng'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa tầng */}
      {deletingItem && (
        <div className="modal-backdrop">
          <div className="modal modal-sm">
            <div className="modal-header">
              <div className="modal-header-left">
                <h3>Xóa tầng</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setDeletingItem(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn xóa tầng{' '}
                <strong>
                  {deletingItem.tenTang} (Mã: {deletingItem.maTang})
                </strong>
                ? Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="modal-footer">
              <div className="modal-footer-right">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setDeletingItem(null)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn-primary btn-danger"
                  onClick={handleDelete}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}