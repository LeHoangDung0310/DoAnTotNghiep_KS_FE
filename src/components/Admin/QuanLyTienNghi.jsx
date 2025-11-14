import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5114/api';

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

  const accessToken = localStorage.getItem('accessToken');

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
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Lỗi khi lấy danh sách tiện nghi');
      }
      const data = await res.json();
      setItems(data.data || []);
      setTotalItems(data.pagination?.totalItems || 0);
      setPagination({
        currentPage: data.pagination?.currentPage || page,
        pageSize: data.pagination?.pageSize || pageSize,
        totalPages: data.pagination?.totalPages || 1,
      });
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // chỉ gọi 1 lần khi component mount
    fetchData(1, pagination.pageSize);
  }, []); // <-- BỎ comment eslint, chỉ giữ mảng rỗng

  const handleSearch = () => fetchData(1, pagination.pageSize);

  const handleReset = () => {
    setTen('');
    fetchData(1, pagination.pageSize);
  };

  const handleChangePage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchData(page, pagination.pageSize);
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
                <tr key={t.maTienNghi}>
                  <td>{t.maTienNghi}</td>
                  <td className="admin-table-name">{t.ten}</td>
                  <td>{t.moTa || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-icon-btn edit"
                        onClick={() => alert('TODO: sửa tiện nghi')}
                      >
                        ✏️
                      </button>
                      <button
                        className="action-icon-btn delete"
                        onClick={() => alert('TODO: xóa tiện nghi')}
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
    </div>
  );
}