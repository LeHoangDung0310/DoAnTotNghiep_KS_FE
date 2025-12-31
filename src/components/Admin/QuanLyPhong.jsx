import React, { useEffect, useState } from 'react';
import Toast from '../Common/Toast';

const API_BASE = 'http://localhost:5114/api';

function getStatusTagClass(status) {
  switch (status) {
    case 'Trong':
      return 'tag tag-success';
    case 'DaDat':
      return 'tag tag-warning';
    case 'DangSuDung':
      return 'tag tag-secondary';
    case 'BaoTri':
      return 'tag tag-danger';
    default:
      return 'tag tag-secondary';
  }
}

export default function QuanLyPhong() {
  const [rooms, setRooms] = useState([]);
  const [loaiPhongs, setLoaiPhongs] = useState([]);
  const [tangs, setTangs] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const [filters, setFilters] = useState({
    soPhong: '',
    maLoaiPhong: '',
    trangThai: '',
    maTang: '',
  });

  const [formData, setFormData] = useState({
    soPhong: '',
    moTa: '',
    maTang: '',
    maLoaiPhong: '',
    trangThai: 'Trong',
  });

  const accessToken = localStorage.getItem('accessToken');

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const hideToast = () => {
    setToast({ show: false, type: '', message: '' });
  };

  const fetchLoaiPhongs = async () => {
    try {
      const res = await fetch(`${API_BASE}/LoaiPhong`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!res.ok) throw new Error('Lỗi khi lấy danh sách loại phòng');

      const data = await res.json();
      setLoaiPhongs(data.data || []);
    } catch (error) {
      console.error(error);
      showToast('error', error.message);
    }
  };

  const fetchTangs = async () => {
    try {
      const res = await fetch(`${API_BASE}/Tang`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!res.ok) throw new Error('Lỗi khi lấy danh sách tầng');

      const data = await res.json();
      setTangs(data.data || []);
    } catch (error) {
      console.error(error);
      showToast('error', error.message);
    }
  };

  const fetchRooms = async (page = 1, pageSize = pagination.pageSize) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append('pageNumber', page);
      params.append('pageSize', pageSize);

      if (filters.soPhong.trim()) params.append('soPhong', filters.soPhong.trim());
      if (filters.maLoaiPhong) params.append('maLoaiPhong', filters.maLoaiPhong);
      if (filters.trangThai) params.append('trangThai', filters.trangThai);
      if (filters.maTang) params.append('maTang', filters.maTang);

      const res = await fetch(`${API_BASE}/Phong/Search?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Lỗi khi lấy danh sách phòng');
      }

      const data = await res.json();
      setRooms(data.data || []);
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
    fetchLoaiPhongs();
    fetchTangs();
  }, []);

  // ✅ Reset về trang 1 khi lọc hoặc thay đổi pageSize
  useEffect(() => {
    fetchRooms(1, pagination.pageSize);
  }, [filters, pagination.pageSize]);


  const handleSearch = () => {
    fetchRooms(1, pagination.pageSize);
  };

  const handleReset = () => {
    setFilters({
      soPhong: '',
      maLoaiPhong: '',
      trangThai: '',
      maTang: '',
    });
    fetchRooms(1, pagination.pageSize);
  };

  const handleChangePage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchRooms(page, pagination.pageSize);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentRoom(null);
    setFormData({
      soPhong: '',
      moTa: '',
      maTang: '',
      maLoaiPhong: '',
      trangThai: 'Trong',
    });
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setModalMode('edit');
    setCurrentRoom(room);
    setFormData({
      soPhong: room.soPhong || '',
      moTa: room.moTa || '',
      maTang: room.maTang || '',
      maLoaiPhong: room.maLoaiPhong || '',
      trangThai: room.trangThai || 'Trong',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        soPhong: formData.soPhong.trim(),
        soGiuong: formData.soGiuong ? parseInt(formData.soGiuong) : null,
        soNguoiToiDa: formData.soNguoiToiDa ? parseInt(formData.soNguoiToiDa) : null,
        moTa: formData.moTa.trim() || null,
        maTang: formData.maTang ? parseInt(formData.maTang) : null,
        maLoaiPhong: formData.maLoaiPhong ? parseInt(formData.maLoaiPhong) : null,
      };

      if (modalMode === 'edit') {
        payload.trangThai = formData.trangThai;
      }

      const url =
        modalMode === 'create'
          ? `${API_BASE}/Phong`
          : `${API_BASE}/Phong/${currentRoom.maPhong}`;

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

      showToast('success', data.message || (modalMode === 'create' ? 'Tạo phòng thành công' : 'Cập nhật thành công'));
      setShowModal(false);
      fetchRooms(pagination.currentPage, pagination.pageSize);
    } catch (error) {
      console.error(error);
      showToast('error', error.message);
    }
  };

  const openDeleteConfirm = (room) => {
    setDeletingItem(room);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      const res = await fetch(`${API_BASE}/Phong/${deletingItem.maPhong}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Xóa phòng thất bại');
      }

      showToast('success', data.message || 'Xóa phòng thành công');
      setDeletingItem(null);
      fetchRooms(pagination.currentPage, pagination.pageSize);
    } catch (error) {
      console.error(error);
      showToast('error', error.message);
    }
  };

  return (
    <div className="admin-card">
      {/* ✅ Toast mới */}
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={hideToast}
          duration={3000}
        />
      )}

      <div className="room-header">
        <div className="room-header-title">Quản lý phòng</div>
        <div className="room-header-actions">
          <button className="btn-outline" onClick={handleReset}>
            Đặt lại
          </button>
          <button className="btn-primary" onClick={handleSearch}>
            Tìm kiếm
          </button>
          <button className="btn-success" onClick={openCreateModal}>
            + Thêm phòng
          </button>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="room-search-row">
        <div className="room-search-input">
          <label>Số phòng</label>
          <input
            type="text"
            placeholder="Nhập số phòng"
            value={filters.soPhong}
            onChange={(e) => setFilters({ ...filters, soPhong: e.target.value })}
          />
        </div>

        <div className="room-search-select">
          <label>Loại phòng</label>
          <select
            value={filters.maLoaiPhong}
            onChange={(e) => setFilters({ ...filters, maLoaiPhong: e.target.value })}
          >
            <option value="">Tất cả</option>
            {loaiPhongs.map((lp) => (
              <option key={lp.maLoaiPhong} value={lp.maLoaiPhong}>
                {lp.tenLoaiPhong}
              </option>
            ))}
          </select>
        </div>

        <div className="room-search-select">
          <label>Trạng thái</label>
          <select
            value={filters.trangThai}
            onChange={(e) => setFilters({ ...filters, trangThai: e.target.value })}
          >
            <option value="">Tất cả</option>
            <option value="Trong">Trống</option>
            <option value="DaDat">Đã đặt</option>
            <option value="DangSuDung">Đang sử dụng</option>
            <option value="BaoTri">Bảo trì</option>
          </select>
        </div>

        <div className="room-search-select">
          <label>Tầng</label>
          <select
            value={filters.maTang}
            onChange={(e) => setFilters({ ...filters, maTang: e.target.value })}
          >
            <option value="">Tất cả</option>
            {tangs.map((t) => (
              <option key={t.maTang} value={t.maTang}>
                {t.tenTang}
              </option>
            ))}
          </select>
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
              <th>Mã phòng</th>
              <th>Số phòng</th>
              <th>Loại phòng</th>
              <th>Tầng</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>Đang tải dữ liệu...</td>
              </tr>
            ) : rooms.length === 0 ? (
              <tr>
                <td colSpan={7}>Không có dữ liệu</td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room.maPhong}>
                  <td>{room.maPhong}</td>
                  <td>{room.soPhong}</td>
                  <td>{room.tenLoaiPhong || '-'}</td>
                  <td>{room.tenTang || '-'}</td>
                  <td>
                    {room.moTa ? (
                      <span title={room.moTa}>
                        {room.moTa.length > 30 ? room.moTa.substring(0, 30) + '...' : room.moTa}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <span className={getStatusTagClass(room.trangThai)}>
                      {room.trangThai}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-icon-btn edit"
                        title="Sửa"
                        onClick={() => openEditModal(room)}
                      >
                        ✏️
                      </button>
                      <button
                        className="action-icon-btn delete"
                        title="Xóa"
                        onClick={() => openDeleteConfirm(room)}
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

      {/* Pagination */}
      <div className="pagination">
        <div className="pagination-info">
          Hiển thị <strong>{rooms.length}</strong> / <strong>{totalItems}</strong> phòng
        </div>
        <div className="pag-actions">
          <button
            className="pag-btn nav-btn"
            onClick={() => handleChangePage(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            Trước
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`pag-btn ${page === pagination.currentPage ? 'active' : ''}`}
              onClick={() => handleChangePage(page)}
            >
              {page}
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

      {/* ✅ Modal mới - Đẹp hơn */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal modal-large modal-booking" onClick={(e) => e.stopPropagation()}>
            {/* Header với gradient */}
            <div className="modal-header-gradient">
              <div className="modal-header-content">
                <div className="modal-icon">
                  {modalMode === 'create' ? '➕' : '✏️'}
                </div>
                <div>
                  <h3 className="modal-title-large">
                    {modalMode === 'create' ? 'Thêm phòng mới' : 'Chỉnh sửa phòng'}
                  </h3>
                  <p className="modal-subtitle">
                    {modalMode === 'create'
                      ? 'Điền thông tin để tạo phòng mới'
                      : `Cập nhật thông tin phòng ${currentRoom?.soPhong}`
                    }
                  </p>
                </div>
              </div>
              <button className="modal-close-btn-gradient" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body modal-body-scrollable">
                {/* Thông tin cơ bản */}
                <div className="form-section">
                  <div className="form-section-header">
                    <div className="form-section-icon">📋</div>
                    <h4 className="form-section-title">Thông tin cơ bản</h4>
                  </div>

                  <div className="form-grid">
                    {/* Số phòng */}
                    <div className="form-group full-width">
                      <label className="form-label">
                        <span className="form-label-icon">🚪</span>
                        Số phòng
                        <span className="form-label-required">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input-modern"
                        required
                        value={formData.soPhong}
                        onChange={(e) => setFormData({ ...formData, soPhong: e.target.value })}
                        placeholder="VD: 101, A205, VIP-301..."
                      />
                    </div>

                    {/* Loại phòng */}
                    <div className="form-group">
                      <label className="form-label">
                        <span className="form-label-icon">🏷️</span>
                        Loại phòng
                      </label>
                      <select
                        className="form-select-modern"
                        value={formData.maLoaiPhong}
                        onChange={(e) => setFormData({ ...formData, maLoaiPhong: e.target.value })}
                      >
                        <option value="">-- Chọn loại phòng --</option>
                        {loaiPhongs.map((lp) => (
                          <option key={lp.maLoaiPhong} value={lp.maLoaiPhong}>
                            {lp.tenLoaiPhong}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tầng */}
                    <div className="form-group">
                      <label className="form-label">
                        <span className="form-label-icon">🏢</span>
                        Tầng
                      </label>
                      <select
                        className="form-select-modern"
                        value={formData.maTang}
                        onChange={(e) => setFormData({ ...formData, maTang: e.target.value })}
                      >
                        <option value="">-- Chọn tầng --</option>
                        {tangs.map((t) => (
                          <option key={t.maTang} value={t.maTang}>
                            {t.tenTang}
                          </option>
                        ))}
                      </select>
                    </div>


                    {/* Trạng thái - chỉ khi edit */}
                    {modalMode === 'edit' && (
                      <div className="form-group full-width">
                        <label className="form-label">
                          <span className="form-label-icon">🔄</span>
                          Trạng thái
                        </label>
                        <select
                          className="form-select-modern"
                          value={formData.trangThai}
                          onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
                        >
                          <option value="Trong">Trống</option>
                          <option value="DaDat">Đã đặt</option>
                          <option value="DangSuDung">Đang sử dụng</option>
                          <option value="BaoTri">Bảo trì</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mô tả */}
                <div className="form-section">
                  <div className="form-section-header">
                    <div className="form-section-icon">📝</div>
                    <h4 className="form-section-title">Mô tả chi tiết</h4>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="form-label-icon">💬</span>
                      Mô tả phòng
                    </label>
                    <textarea
                      rows="4"
                      className="form-textarea-modern"
                      value={formData.moTa}
                      onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                      placeholder="Nhập mô tả chi tiết về phòng (không bắt buộc)..."
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer modal-footer-modern">
                <button type="button" className="btn-outline-modern" onClick={() => setShowModal(false)}>
                  <span className="btn-icon">✕</span>
                  Hủy
                </button>
                <button type="submit" className="btn-primary-modern">
                  <span className="btn-icon">
                    {modalMode === 'create' ? '✓' : '↻'}
                  </span>
                  {modalMode === 'create' ? 'Lưu phòng' : 'Cập nhật'}
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
                <h3>Xóa phòng</h3>
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
                Bạn có chắc chắn muốn xóa phòng{' '}
                <strong>
                  {deletingItem.soPhong} (Mã: {deletingItem.maPhong})
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