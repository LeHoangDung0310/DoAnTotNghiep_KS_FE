import React, { useState, useEffect, useRef } from 'react';
import ChiTietNguoiDung from '../Admin/ChiTietNguoiDung';
import SuaNguoiDungLT from './SuaNguoiDungLT';
import api from '../../utils/api';
import '../../styles/admin.css';
import '../../styles/letan.css';

export default function QuanLyKhachHangLT() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filterStatus, pageSize]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        searchTerm: searchTerm || undefined,
        vaiTro: 'KhachHang',
        trangThai: filterStatus || undefined,
        pageNumber: currentPage,
        pageSize: pageSize,
      };

      const res = await api.get('/api/NguoiDung/Search', { params });
      const data = res.data;

      setUsers(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.totalItems || 0);
    } catch (err) {
      console.error('Lỗi khi tải danh sách khách hàng:', err);
      showToast('error', 'Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handleReset = () => {
    setSearchTerm('');
    setFilterStatus('');
    setCurrentPage(1);
    setPageSize(10);
    fetchUsers();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getDiaChiRutGon = (user) => {
    const parts = [];
    if (user.tenPhuongXa) {
      const xa = user.tenPhuongXa.length > 12 
        ? user.tenPhuongXa.substring(0, 12) + '..' 
        : user.tenPhuongXa;
      parts.push(xa);
    }
    if (user.tenHuyen && parts.length < 2) {
      const huyen = user.tenHuyen.length > 10 
        ? user.tenHuyen.substring(0, 10) + '..' 
        : user.tenHuyen;
      parts.push(huyen);
    }
    return parts.length > 0 ? parts.join(', ') : '-';
  };

  const getDiaChiDayDu = (user) => {
    const parts = [];
    if (user.diaChiChiTiet) parts.push(user.diaChiChiTiet);
    if (user.tenPhuongXa) parts.push(user.tenPhuongXa);
    if (user.tenHuyen) parts.push(user.tenHuyen);
    if (user.tenTinh) parts.push(user.tenTinh);
    return parts.length > 0 ? parts.join(', ') : 'Chưa cập nhật';
  };

  return (
    <div className="admin-card letan-layout">
      {/* Toast */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="admin-card-header">
        <div className="admin-card-header-left">
          <h3 className="admin-card-title">👥 Quản lý khách hàng</h3>
          <p className="admin-card-subtitle">
            Xem và chỉnh sửa thông tin khách hàng (không thể đổi vai trò)
          </p>
        </div>
        <div className="admin-card-header-right">
          <button className="btn-outline" onClick={handleReset}>
            🔄 Đặt lại
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="admin-search-group">
          <input
            ref={searchInputRef}
            type="text"
            className="admin-search-input"
            placeholder="Tìm theo tên, email, SĐT, CCCD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="btn-primary" onClick={handleSearch}>
            🔍 Tìm kiếm
          </button>
        </div>

        <select
          className="admin-select"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Hoạt động">Hoạt động</option>
          <option value="Tạm khóa">Tạm khóa</option>
        </select>

        <select
          className="admin-select"
          value={pageSize}
          onChange={(e) => {
            const newSize = Number(e.target.value);
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        >
          <option value={5}>5 / trang</option>
          <option value={10}>10 / trang</option>
          <option value={20}>20 / trang</option>
          <option value={50}>50 / trang</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading">Đang tải dữ liệu...</div>
      ) : users.length === 0 ? (
        <div className="admin-empty">
          <p>😕 Không tìm thấy khách hàng nào</p>
        </div>
      ) : (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 180 }}>Người dùng</th>
                  <th style={{ minWidth: 200 }}>Email</th>
                  <th style={{ minWidth: 80 }}>Quyền</th>
                  <th style={{ minWidth: 100 }}>Trạng thái</th>
                  <th style={{ minWidth: 140 }}>Ngày tạo</th>
                  <th style={{ minWidth: 110 }}>Điện thoại</th>
                  <th style={{ minWidth: 150 }}>Địa điểm</th>
                  <th style={{ minWidth: 120, width: 120 }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.maNguoiDung}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          className="admin-user-avatar"
                          style={{
                            width: 40,
                            height: 40,
                            fontSize: 16,
                            background: 'linear-gradient(135deg, #3498db 0%, #2ecc71 100%)',
                          }}
                        >
                          {(user.hoTen || user.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>
                            {user.hoTen || '—'}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            #{user.maNguoiDung}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{user.email}</td>
                    <td>
                      <span className="tag tag-success">Khách hàng</span>
                    </td>
                    <td>
                      <span
                        className={
                          user.trangThai === 'Hoạt động'
                            ? 'tag tag-success'
                            : 'tag tag-warning'
                        }
                      >
                        {user.trangThai}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {user.ngayTao
                        ? new Date(user.ngayTao).toLocaleString('vi-VN', { hour12: false })
                        : '—'}
                    </td>
                    <td style={{ fontSize: 13 }}>{user.soDienThoai || '—'}</td>
                    <td title={getDiaChiDayDu(user)} style={{ fontSize: 12, color: '#64748b' }}>
                      {getDiaChiRutGon(user)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-icon-btn view"
                          onClick={() => setSelectedUserId(user.maNguoiDung)}
                          title="Xem chi tiết"
                        >
                          👁️
                        </button>
                        <button
                          className="action-icon-btn edit"
                          onClick={() => setEditUserId(user.maNguoiDung)}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="admin-pagination">
              <button
                className="btn-outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                ← Trước
              </button>
              <span className="admin-pagination-info">
                Trang {currentPage} / {totalPages}
                <span style={{ marginLeft: 12, color: '#64748b' }}>
                  (Tổng: {totalItems} khách hàng)
                </span>
              </span>
              <button
                className="btn-outline"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal Chi Tiết */}
      {selectedUserId && (
        <ChiTietNguoiDung
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onShowToast={showToast}
        />
      )}

      {/* Modal Sửa */}
      {editUserId && (
        <SuaNguoiDungLT
          userId={editUserId}
          onClose={() => setEditUserId(null)}
          onSuccess={() => {
            fetchUsers();
            setEditUserId(null);
            showToast('success', 'Cập nhật thông tin khách hàng thành công');
          }}
          onShowToast={showToast}
        />
      )}
    </div>
  );
}