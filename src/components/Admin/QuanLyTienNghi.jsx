import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5114/api';
const API_ORIGIN = 'http://localhost:5114'; // thêm dòng này

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
  const [editingItem, setEditingItem] = useState(null); // null = thêm mới
  const [form, setForm] = useState({
    ten: '',
    icon: '', // URL icon
  });
  const [saving, setSaving] = useState(false);

  // preview ảnh icon khi user chọn file
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState('');

  // modal xác nhận xóa
  const [deletingItem, setDeletingItem] = useState(null);

  // Toast
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  const accessToken = localStorage.getItem('accessToken');

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchData = async (page = 1, pageSize = pagination.pageSize) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('pageNumber', page);
      params.append('pageSize', pageSize);
      if (ten.trim()) params.append('ten', ten.trim());

      const res = await fetch(
        `${API_BASE}/TienNghi/Search?${params.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Lỗi khi lấy danh sách tiện nghi');
      }

      setItems(data.data || []);
      console.log('TienNghi data', data.data); // <== thêm dòng này
      setTotalItems(data.pagination?.totalItems || 0);
      setPagination({
        currentPage: data.pagination?.currentPage || page,
        pageSize: data.pagination?.pageSize || pageSize,
        totalPages: data.pagination?.totalPages || 1,
      });
    } catch (e) {
      console.error(e);
      showToast('error', e.message || 'Có lỗi xảy ra');
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

  // mở modal thêm mới
  const openCreateModal = () => {
    setEditingItem(null);
    setForm({ ten: '', icon: '' });
    setIconFile(null);
    setIconPreview('');
    setShowForm(true);
  };

  // mở modal chỉnh sửa
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
      showToast('error', 'Tên tiện nghi không được để trống');
      return;
    }

    const isEdit = !!editingItem;
    const url = isEdit
      ? `${API_BASE}/TienNghi/${editingItem.maTienNghi}`
      : `${API_BASE}/TienNghi`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      setSaving(true);

      let iconUrl = form.icon?.trim() || '';

      // Nếu user vừa chọn file mới thì upload
      if (iconFile) {
        const fd = new FormData();
        fd.append('file', iconFile);

        const uploadRes = await fetch(
          `${API_BASE.replace('/api', '')}/api/tiennghi-icon`,
          {
            method: 'POST',
            headers: {
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            body: fd,
          }
        );

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
        throw new Error(
          data.message ||
            (isEdit
              ? 'Không thể cập nhật tiện nghi'
              : 'Không thể tạo tiện nghi')
        );
      }

      showToast(
        'success',
        data.message ||
          (isEdit ? 'Cập nhật tiện nghi thành công' : 'Tạo tiện nghi thành công')
      );
      setShowForm(false);
      setEditingItem(null);
      setIconFile(null);
      setIconPreview('');
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
      const res = await fetch(
        `${API_BASE}/TienNghi/${deletingItem.maTienNghi}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.message ||
            'Không thể xóa tiện nghi (có thể đang được sử dụng)'
        );
      }

      showToast('success', data.message || 'Xóa tiện nghi thành công');
      setDeletingItem(null);
      fetchData(1, pagination.pageSize);
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Có lỗi xảy ra khi xóa tiện nghi');
    }
  };

  const handleIconFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Vui lòng chọn file hình ảnh (png, jpg, svg...)');
      return;
    }

    setIconFile(file);
    const url = URL.createObjectURL(file);
    setIconPreview(url);
  };

  return (
    <div className="admin-card">
      <div className="room-header">
        <div className="room-header-title">Quản lý tiện nghi</div>
        <div className="room-header-actions">
          <button className="btn-outline" onClick={handleReset}>
            Đặt lại
          </button>
          <button className="btn-primary" onClick={handleSearch}>
            Tìm kiếm
          </button>
          <button className="btn-success" onClick={openCreateModal}>
            + Thêm tiện nghi
          </button>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div
        className="room-search-row"
        style={{ gridTemplateColumns: '2fr 1fr' }}
      >
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
              <tr>
                <td colSpan={4}>Đang tải dữ liệu...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4}>Không có dữ liệu</td>
              </tr>
            ) : (
              items.map((t) => (
                <tr key={t.maTienNghi}>
                  <td>{t.maTienNghi}</td>
                  <td className="admin-table-name">{t.ten}</td>
                  <td>
                    {t.icon ? (
                      <img
                        src={
                          t.icon.startsWith('http')
                            ? t.icon
                            : `${API_ORIGIN}${t.icon}`  // API_ORIGIN = 'http://localhost:5114'
                        }
                        alt={t.ten}
                        style={{
                          width: 28,
                          height: 28,
                          objectFit: 'cover',
                          borderRadius: 6,
                        }}
                      />
                    ) : (
                      '-'
                    )}
                  </td>
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
          Tổng: <strong>{totalItems}</strong> tiện nghi
        </span>
        <button
          onClick={() => handleChangePage(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        >
          ‹
        </button>
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
          (p) => (
            <button
              key={p}
              className={p === pagination.currentPage ? 'active' : ''}
              onClick={() => handleChangePage(p)}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => handleChangePage(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
        >
          ›
        </button>
      </div>

      {/* Modal thêm / sửa tiện nghi */}
      {showForm && (
        <div className="modal-backdrop">
          <div className="modal modal-sm">
            <div className="modal-header">
              <div className="modal-header-left">
                <h3>{editingItem ? 'Chỉnh sửa tiện nghi' : 'Thêm tiện nghi mới'}</h3>
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
                <div className="form-row full">
                  <label className="form-label-required">Tên tiện nghi</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.ten}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, ten: e.target.value }))
                    }
                    placeholder="VD: Điều hòa, Wi-Fi, TV..."
                    required
                  />
                </div>

                <div className="form-row full">
                  <label>Icon (ảnh tải lên)</label>

                  {iconPreview && (
                    <div style={{ marginBottom: 8 }}>
                      <img
                        src={iconPreview}
                        alt="preview icon"
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: 'cover',
                          borderRadius: 8,
                          border: '1px solid #e5e7eb',
                        }}
                      />
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconFileChange}
                  />

                  <span className="form-help-text">
                    Tuỳ chọn. Nếu không chọn file, hệ thống sẽ giữ icon cũ (nếu
                    có). Hỗ trợ PNG, JPG, SVG...
                  </span>
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
                      : 'Lưu tiện nghi'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa tiện nghi */}
      {deletingItem && (
        <div className="modal-backdrop">
          <div className="modal modal-sm">
            <div className="modal-header">
              <div className="modal-header-left">
                <h3>Xóa tiện nghi</h3>
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
                Bạn có chắc chắn muốn xóa tiện nghi{' '}
                <strong>
                  {deletingItem.ten} (Mã: {deletingItem.maTienNghi})
                </strong>
                ? Nếu tiện nghi đang được gán cho phòng, bạn phải gỡ ra trước.
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

      {/* Toast */}
      {toast && (
        <div className="toast-container-admin">
          <div
            className={
              'toast-admin ' +
              (toast.type === 'error'
                ? 'toast-admin-error'
                : 'toast-admin-success')
            }
          >
            <div className="toast-admin-icon">
              {toast.type === 'error' ? '!' : '✓'}
            </div>
            <div className="toast-admin-text">{toast.message}</div>
            <button
              className="toast-admin-close"
              onClick={() => setToast(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}