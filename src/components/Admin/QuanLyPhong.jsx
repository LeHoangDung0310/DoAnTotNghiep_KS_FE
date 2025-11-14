import React, { useEffect, useState } from 'react';

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
  const [totalItems, setTotalItems] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    soPhong: '',
    tenLoai: '',
    trangThai: '',
    maTang: '',
  });

  const accessToken = localStorage.getItem('accessToken');

  const fetchRooms = async (page = 1, pageSize = pagination.pageSize) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append('pageNumber', page);
      params.append('pageSize', pageSize);

      if (filters.soPhong.trim()) params.append('soPhong', filters.soPhong.trim());
      if (filters.tenLoai.trim()) params.append('tenLoai', filters.tenLoai.trim());
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
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // khi filters hoặc pageSize thay đổi thì tự load lại trang 1
    fetchRooms(1);
  }, [filters, pagination.pageSize]); // <-- chỉ giữ dependency, bỏ comment eslint

  const handleSearch = () => {
    fetchRooms(1, pagination.pageSize);
  };

  const handleReset = () => {
    setFilters({
      soPhong: '',
      tenLoai: '',
      trangThai: '',
      maTang: '',
    });
    fetchRooms(1, pagination.pageSize);
  };

  const handleChangePage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchRooms(page, pagination.pageSize);
  };

  return (
    <div className="admin-card">
      <div className="room-header">
        <div className="room-header-title">Quản lý phòng</div>
        <div className="room-header-actions">
          <button className="btn-outline" onClick={handleReset}>
            Đặt lại
          </button>
          <button className="btn-primary" onClick={handleSearch}>
            Tìm kiếm
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

        <div className="room-search-input">
          <label>Loại phòng</label>
          <input
            type="text"
            placeholder="Nhập loại phòng"
            value={filters.tenLoai}
            onChange={(e) => setFilters({ ...filters, tenLoai: e.target.value })}
          />
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

        <div className="room-search-input">
          <label>Tầng</label>
          <input
            type="number"
            placeholder="Nhập mã tầng"
            value={filters.maTang}
            onChange={(e) => setFilters({ ...filters, maTang: e.target.value })}
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
              <th>Mã phòng</th>
              <th>Số phòng</th>
              <th>Loại phòng</th>
              <th>Diện tích</th>
              <th>Số giường</th>
              <th>Tối đa</th>
              <th>Hướng nhìn</th>
              <th>Giá / đêm</th>
              <th>Tầng</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11}>Đang tải dữ liệu...</td>
              </tr>
            ) : rooms.length === 0 ? (
              <tr>
                <td colSpan={11}>Không có dữ liệu</td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room.maPhong}>
                  <td>{room.maPhong}</td>
                  <td>{room.soPhong}</td>
                  <td>{room.tenLoai}</td>
                  <td>{room.dienTich ?? '-'}</td>
                  <td>{room.soGiuong ?? '-'}</td>
                  <td>{room.soNguoiToiDa ?? '-'}</td>
                  <td>{room.huongNhin ?? '-'}</td>
                  <td>
                    {room.giaMoiDem != null
                      ? room.giaMoiDem.toLocaleString('vi-VN') + ' đ'
                      : '-'}
                  </td>
                  <td>{room.tenTang ?? room.maTang ?? '-'}</td>
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
                        onClick={() => alert('TODO: mở popup sửa phòng')}
                      >
                        ✏️
                      </button>
                      <button
                        className="action-icon-btn delete"
                        title="Xóa"
                        onClick={() => alert('TODO: xác nhận xóa phòng')}
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
          Tổng: <strong>{totalItems}</strong> phòng
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
    </div>
  );
}