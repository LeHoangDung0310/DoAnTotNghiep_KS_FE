import React, { useEffect, useState } from 'react';
import ChinhSuaNguoiDung from './ChinhSuaNguoiDung';

const API_BASE = 'http://localhost:5114/api'; // dùng port 5114 theo launchSettings

function getRoleTagClass(role) {
  switch (role) {
    case 'Admin':
      return 'tag tag-danger';
    case 'LeTan':
      return 'tag tag-secondary';
    case 'KhachHang':
      return 'tag tag-success';
    default:
      return 'tag tag-secondary';
  }
}

function getStatusTagClass(status) {
  switch (status) {
    case 'Hoạt động':
      return 'tag tag-success';
    case 'Tạm khóa':
      return 'tag tag-warning';
    default:
      return 'tag tag-secondary';
  }
}

export default function QuanLyNguoiDung() {
  const [users, setUsers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);

  const [editingUserId, setEditingUserId] = useState(null);

  const [filters, setFilters] = useState({
    searchTerm: '',
    vaiTro: '',
    trangThai: '',
  });

  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }
  const [confirmState, setConfirmState] = useState(null);
  // { type: 'delete' | 'status', user: object, newStatus?: string }

  const accessToken = localStorage.getItem('accessToken');

  const fetchUsers = async (page = 1, pageSize = pagination.pageSize) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append('pageNumber', page);
      params.append('pageSize', pageSize);
      if (filters.searchTerm.trim()) params.append('searchTerm', filters.searchTerm.trim());
      if (filters.vaiTro) params.append('vaiTro', filters.vaiTro);
      if (filters.trangThai) params.append('trangThai', filters.trangThai);

      const res = await fetch(`${API_BASE}/NguoiDung/Search?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 401) {
          // TODO: gọi refresh token hoặc navigate('/login')
          throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        }
        throw new Error(err.message || 'Lỗi khi lấy danh sách người dùng');
      }

      const data = await res.json();
      setUsers(data.data || []);
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
    fetchUsers(1, pagination.pageSize);
    // không dùng eslint rule react-hooks/exhaustive-deps nên không cần comment
  }, []);

  const handleSearch = () => {
    fetchUsers(1, pagination.pageSize);
  };

  const handleReset = () => {
    setFilters({
      searchTerm: '',
      vaiTro: '',
      trangThai: '',
    });
    fetchUsers(1, pagination.pageSize);
  };

  const handleChangePage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchUsers(page, pagination.pageSize);
  };

  const handleToggleStatus = (user) => {
    const newStatus = user.trangThai === 'Hoạt động' ? 'Tạm khóa' : 'Hoạt động';
    setConfirmState({ type: 'status', user, newStatus });
  };

  const handleDelete = (user) => {
    setConfirmState({ type: 'delete', user });
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    // auto close sau 2.5s
    setTimeout(() => setToast(null), 2500);
  };

  const doToggleStatus = async ({ user, newStatus }) => {
    try {
      const res = await fetch(`${API_BASE}/NguoiDung/${user.maNguoiDung}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ trangThai: newStatus }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Không thể cập nhật trạng thái');

      showToast('success', data.message || 'Cập nhật trạng thái thành công');
      fetchUsers(pagination.currentPage, pagination.pageSize);
    } catch (e) {
      console.error(e);
      showToast('error', e.message);
    }
  };

  const doDeleteUser = async ({ user }) => {
    try {
      const res = await fetch(`${API_BASE}/NguoiDung/${user.maNguoiDung}`, {
        method: 'DELETE',
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Không thể xóa người dùng');

      showToast('success', data.message || 'Xóa người dùng thành công');
      fetchUsers(pagination.currentPage, pagination.pageSize);
    } catch (e) {
      console.error(e);
      showToast('error', e.message);
    }
  };

  // Helper function - hiển thị địa chỉ RẤT NGẮN GỌN
  const getDiaChiRutGon = (user) => {
    // Chỉ lấy 2 phần: Xã + Huyện, mỗi phần tối đa 10 ký tự
    const parts = [];
    
    if (user.tenPhuongXa) {
      const xa = user.tenPhuongXa.length > 10 
        ? user.tenPhuongXa.substring(0, 10) + '..' 
        : user.tenPhuongXa;
      parts.push(xa);
    }
    
    if (user.tenHuyen && parts.length < 2) {
      const huyen = user.tenHuyen.length > 8 
        ? user.tenHuyen.substring(0, 8) + '..' 
        : user.tenHuyen;
      parts.push(huyen);
    }
    
    return parts.length > 0 ? parts.join(', ') : '-';
  };

  // Địa chỉ đầy đủ cho tooltip
  const getDiaChiDayDu = (user) => {
    const parts = [];
    if (user.diaChiChiTiet) parts.push(user.diaChiChiTiet);
    if (user.tenPhuongXa) parts.push(user.tenPhuongXa);
    if (user.tenHuyen) parts.push(user.tenHuyen);
    if (user.tenTinh) parts.push(user.tenTinh);
    return parts.length > 0 ? parts.join(', ') : 'Chưa cập nhật';
  };

  return (
    <div className="admin-card">
      <div className="room-header">
        <div className="room-header-title">Quản lý người dùng</div>
        <div className="room-header-actions">
          <button className="btn-outline" onClick={handleReset}>
            Đặt lại
          </button>
          <button className="btn-primary" onClick={handleSearch}>
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Thanh tìm kiếm (tên / email, vai trò, trạng thái, pageSize) */}
      <div className="room-search-row">
        <div className="room-search-input">
          <label>Tên / Email</label>
          <input
            type="text"
            placeholder="Nhập tên hiển thị hoặc email"
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
          />
        </div>

        <div className="room-search-select">
          <label>Vai trò</label>
          <select
            value={filters.vaiTro}
            onChange={(e) => setFilters({ ...filters, vaiTro: e.target.value })}
          >
            <option value="">Tất cả</option>
            <option value="Admin">Admin</option>
            <option value="LeTan">Lễ tân</option>
            <option value="KhachHang">Khách hàng</option>
          </select>
        </div>

        <div className="room-search-select">
          <label>Trạng thái</label>
          <select
            value={filters.trangThai}
            onChange={(e) => setFilters({ ...filters, trangThai: e.target.value })}
          >
            <option value="">Tất cả</option>
            <option value="Hoạt động">Hoạt động</option>
            <option value="Tạm khóa">Tạm khóa</option>
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

        {/* cột trống cho đẹp grid */}
        <div />
      </div>

      {/* Bảng dữ liệu */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Email</th>
              <th>Quyền</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Điện thoại</th>
              <th>Địa điểm</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8}>Đang tải dữ liệu...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8}>Không có dữ liệu</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.maNguoiDung}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="admin-user-avatar" style={{ width: 28, height: 28 }}>
                        {(u.hoTen || u.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: '#1d4ed8',
                          }}
                        >
                          {u.hoTen || '—'}
                        </div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>#{u.maNguoiDung}</div>
                      </div>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={getRoleTagClass(u.vaiTro)}>
                      {u.vaiTro === 'KhachHang'
                        ? 'Khách hàng'
                        : u.vaiTro === 'LeTan'
                        ? 'Lễ tân'
                        : u.vaiTro}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusTagClass(u.trangThai)}>{u.trangThai}</span>
                  </td>
                  <td>
                    {u.ngayTao
                      ? new Date(u.ngayTao).toLocaleString('vi-VN', {
                          hour12: false,
                        })
                      : '-'}
                  </td>
                  <td>{u.soDienThoai || '-'}</td>
                  <td 
                    className="address-cell" 
                    title={getDiaChiDayDu(u)}
                  >
                    <div className="address-text">
                      {getDiaChiRutGon(u)}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-icon-btn edit"
                        title="Chỉnh sửa thông tin"
                        onClick={() => setEditingUserId(u.maNguoiDung)}
                      >
                        ✏️
                      </button>
                      <button
                        className="action-icon-btn edit"
                        title="Đổi trạng thái"
                        onClick={() => handleToggleStatus(u)}
                      >
                        🔒
                      </button>
                      <button
                        className="action-icon-btn delete"
                        title="Xóa người dùng"
                        onClick={() => handleDelete(u)}
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
          Tổng: <strong>{totalItems}</strong> người dùng
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

      {editingUserId && (
        <ChinhSuaNguoiDung
          userId={editingUserId}
          onClose={() => setEditingUserId(null)}
          onUpdated={() => fetchUsers(pagination.currentPage, pagination.pageSize)}
          onShowToast={showToast}   // tất cả toast đi qua đây
        />
      )}

      {toast && (
        <div className="toast-container">
          <div
            className={
              'toast ' +
              (toast.type === 'error' ? 'toast-error' : 'toast-success')
            }
          >
            <div className="toast-icon">
              {toast.type === 'error' ? '!' : '✓'}
            </div>

            {/* chỉ 1 text, không chia 2 dòng nữa */}
            <div className="toast-single-text">
              {toast.message}
            </div>

            <button className="toast-close" onClick={() => setToast(null)}>
              ✕
            </button>
          </div>
        </div>
      )}

      {confirmState && (
        <div className="modal-backdrop">
          <div className="modal confirm-modal">
            <div className="modal-header">
              <h3>
                {confirmState.type === 'delete'
                  ? 'Xóa người dùng'
                  : 'Đổi trạng thái người dùng'}
              </h3>
              <button className="modal-close-btn" onClick={() => setConfirmState(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>
                {confirmState.type === 'delete'
                  ? `Bạn có chắc chắn muốn xóa người dùng "${confirmState.user.hoTen || confirmState.user.email}"?`
                  : `Bạn có chắc muốn đổi trạng thái người dùng này thành "${confirmState.newStatus}"?`}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary-ghost" onClick={() => setConfirmState(null)}>
                Hủy
              </button>
              <button
                className="btn-primary-rounded btn-danger"
                onClick={async () => {
                  const state = confirmState;
                  setConfirmState(null);
                  if (state.type === 'delete') {
                    await doDeleteUser(state);
                  } else {
                    await doToggleStatus(state);
                  }
                }}
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}