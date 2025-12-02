import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5114/api';

export default function QuanLyLoaiPhong() {
  const [loaiPhongs, setLoaiPhongs] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentLoaiPhong, setCurrentLoaiPhong] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [toast, setToast] = useState(null);

  const [filters, setFilters] = useState({
    tenLoaiPhong: '',
    giaMin: '',
    giaMax: '',
  });

  const [formData, setFormData] = useState({
    tenLoaiPhong: '',
    moTa: '',
    soNguoiToiDa: '',
    soGiuong: '',
    dienTich: '',
    giaMoiDem: '',
  });

  const accessToken = localStorage.getItem('accessToken');

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchLoaiPhongs = async (page = 1, pageSize = pagination.pageSize) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append('pageNumber', page);
      params.append('pageSize', pageSize);

      if (filters.tenLoaiPhong.trim())
        params.append('tenLoaiPhong', filters.tenLoaiPhong.trim());
      if (filters.giaMin) params.append('giaMin', filters.giaMin);
      if (filters.giaMax) params.append('giaMax', filters.giaMax);

      const res = await fetch(`${API_BASE}/LoaiPhong/Search?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Lỗi khi lấy danh sách loại phòng');
      }

      const data = await res.json();
      setLoaiPhongs(data.data || []);
      setTotalItems(data.pagination?.totalItems || 0);
      setPagination({
        currentPage: data.pagination?.currentPage || page,
        pageSize: data.pagination?.pageSize || pageSize,
        totalPages: data.pagination?.totalPages || 1,
      });
    } catch (error) {
      console.error(error);
      showToast('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoaiPhongs(1);
  }, [filters, pagination.pageSize]);

  const handleSearch = () => {
    fetchLoaiPhongs(1, pagination.pageSize);
  };

  const handleReset = () => {
    setFilters({
      tenLoaiPhong: '',
      giaMin: '',
      giaMax: '',
    });
    fetchLoaiPhongs(1, pagination.pageSize);
  };

  const handleChangePage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchLoaiPhongs(page, pagination.pageSize);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentLoaiPhong(null);
    setFormData({
      tenLoaiPhong: '',
      moTa: '',
      soNguoiToiDa: '',
      soGiuong: '',
      dienTich: '',
      giaMoiDem: '',
    });
    setShowModal(true);
  };

  const openEditModal = (loaiPhong) => {
    setModalMode('edit');
    setCurrentLoaiPhong(loaiPhong);
    setFormData({
      tenLoaiPhong: loaiPhong.tenLoaiPhong || '',
      moTa: loaiPhong.moTa || '',
      soNguoiToiDa: loaiPhong.soNguoiToiDa || '',
      soGiuong: loaiPhong.soGiuong || '',
      dienTich: loaiPhong.dienTich || '',
      giaMoiDem: loaiPhong.giaMoiDem || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        tenLoaiPhong: formData.tenLoaiPhong.trim(),
        moTa: formData.moTa.trim() || null,
        soNguoiToiDa: formData.soNguoiToiDa ? parseInt(formData.soNguoiToiDa) : null,
        soGiuong: formData.soGiuong ? parseInt(formData.soGiuong) : null,
        dienTich: formData.dienTich ? parseInt(formData.dienTich) : null,
        giaMoiDem: formData.giaMoiDem ? parseFloat(formData.giaMoiDem) : null,
      };

      const url =
        modalMode === 'create'
          ? `${API_BASE}/LoaiPhong`
          : `${API_BASE}/LoaiPhong/${currentLoaiPhong.maLoaiPhong}`;

      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }

      showToast(
        'success',
        data.message ||
          (modalMode === 'create' ? 'Tạo loại phòng thành công' : 'Cập nhật thành công')
      );
      setShowModal(false);
      fetchLoaiPhongs(pagination.currentPage, pagination.pageSize);
    } catch (error) {
      console.error(error);
      showToast('error', error.message);
    }
  };

  const openDeleteConfirm = (loaiPhong) => {
    setDeletingItem(loaiPhong);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      const res = await fetch(`${API_BASE}/LoaiPhong/${deletingItem.maLoaiPhong}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Xóa loại phòng thất bại');
      }

      showToast('success', data.message || 'Xóa loại phòng thành công');
      setDeletingItem(null);
      fetchLoaiPhongs(pagination.currentPage, pagination.pageSize);
    } catch (error) {
      console.error(error);
      showToast('error', error.message);
    }
  };

  return (
    <div className="admin-card">
      <div className="room-header">
        <div className="room-header-title">Quản lý loại phòng</div>
        <div className="room-header-actions">
          <button className="btn-outline" onClick={handleReset}>
            Đặt lại
          </button>
          <button className="btn-primary" onClick={handleSearch}>
            Tìm kiếm
          </button>
          <button className="btn-success" onClick={openCreateModal}>
            + Thêm loại phòng
          </button>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="room-search-row">
        <div className="room-search-input">
          <label>Tên loại phòng</label>
          <input
            type="text"
            placeholder="Nhập tên loại phòng"
            value={filters.tenLoaiPhong}
            onChange={(e) => setFilters({ ...filters, tenLoaiPhong: e.target.value })}
          />
        </div>

        <div className="room-search-input">
          <label>Giá tối thiểu</label>
          <input
            type="number"
            min="0"
            placeholder="Giá tối thiểu"
            value={filters.giaMin}
            onChange={(e) => setFilters({ ...filters, giaMin: e.target.value })}
          />
        </div>

        <div className="room-search-input">
          <label>Giá tối đa</label>
          <input
            type="number"
            min="0"
            placeholder="Giá tối đa"
            value={filters.giaMax}
            onChange={(e) => setFilters({ ...filters, giaMax: e.target.value })}
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
              <th>Mã loại</th>
              <th>Tên loại phòng</th>
              <th>Diện tích (m²)</th>
              <th>Số giường</th>
              <th>Số người tối đa</th>
              <th>Giá / đêm (VNĐ)</th>
              <th>Mô tả</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8}>Đang tải dữ liệu...</td>
              </tr>
            ) : loaiPhongs.length === 0 ? (
              <tr>
                <td colSpan={8}>Không có dữ liệu</td>
              </tr>
            ) : (
              loaiPhongs.map((lp) => (
                <tr key={lp.maLoaiPhong}>
                  <td>{lp.maLoaiPhong}</td>
                  <td>
                    <strong>{lp.tenLoaiPhong}</strong>
                  </td>
                  <td>{lp.dienTich ?? '-'}</td>
                  <td>{lp.soGiuong ?? '-'}</td>
                  <td>{lp.soNguoiToiDa ?? '-'}</td>
                  <td>
                    {lp.giaMoiDem != null ? lp.giaMoiDem.toLocaleString('vi-VN') : '-'}
                  </td>
                  <td>
                    {lp.moTa ? (
                      <span title={lp.moTa}>
                        {lp.moTa.length > 50 ? lp.moTa.substring(0, 50) + '...' : lp.moTa}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-icon-btn edit"
                        title="Sửa"
                        onClick={() => openEditModal(lp)}
                      >
                        ✏️
                      </button>
                      <button
                        className="action-icon-btn delete"
                        title="Xóa"
                        onClick={() => openDeleteConfirm(lp)}
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
          Tổng: <strong>{totalItems}</strong> loại phòng
        </span>
        <button
          onClick={() => handleChangePage(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        >
          ‹
        </button>
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={page === pagination.currentPage ? 'active' : ''}
            onClick={() => handleChangePage(page)}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => handleChangePage(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
        >
          ›
        </button>
      </div>

      {/* Modal thêm/sửa loại phòng */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-header-left">
                <h3>{modalMode === 'create' ? 'Thêm loại phòng mới' : 'Cập nhật loại phòng'}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row full">
                  <label className="form-label-required">Tên loại phòng</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.tenLoaiPhong}
                    onChange={(e) =>
                      setFormData({ ...formData, tenLoaiPhong: e.target.value })
                    }
                    placeholder="Nhập tên loại phòng"
                  />
                </div>

                <div className="form-row">
                  <div style={{ flex: 1 }}>
                    <label>Diện tích (m²)</label>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      value={formData.dienTich}
                      onChange={(e) => setFormData({ ...formData, dienTich: e.target.value })}
                      placeholder="Diện tích"
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label>Số giường</label>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      value={formData.soGiuong}
                      onChange={(e) => setFormData({ ...formData, soGiuong: e.target.value })}
                      placeholder="Số giường"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div style={{ flex: 1 }}>
                    <label>Số người tối đa</label>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      value={formData.soNguoiToiDa}
                      onChange={(e) =>
                        setFormData({ ...formData, soNguoiToiDa: e.target.value })
                      }
                      placeholder="Số người tối đa"
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label>Giá / đêm (VNĐ)</label>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      step="1000"
                      value={formData.giaMoiDem}
                      onChange={(e) => setFormData({ ...formData, giaMoiDem: e.target.value })}
                      placeholder="Giá mỗi đêm"
                    />
                  </div>
                </div>

                <div className="form-row full">
                  <label>Mô tả</label>
                  <textarea
                    rows="4"
                    className="form-textarea"
                    value={formData.moTa}
                    onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                    placeholder="Nhập mô tả loại phòng"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <div className="modal-footer-right">
                  <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn-primary">
                    {modalMode === 'create' ? 'Thêm mới' : 'Cập nhật'}
                  </button>
                </div>
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
                <h3>Xóa loại phòng</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setDeletingItem(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn xóa loại phòng{' '}
                <strong>{deletingItem.tenLoaiPhong}</strong>? Hành động này không thể hoàn tác.
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
              (toast.type === 'error' ? 'toast-admin-error' : 'toast-admin-success')
            }
          >
            <div className="toast-admin-icon">{toast.type === 'error' ? '!' : '✓'}</div>
            <div className="toast-admin-text">{toast.message}</div>
            <button className="toast-admin-close" onClick={() => setToast(null)}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}