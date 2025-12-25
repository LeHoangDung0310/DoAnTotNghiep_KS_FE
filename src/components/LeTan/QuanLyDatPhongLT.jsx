import React, { useState, useEffect } from 'react';
import Toast from '../Common/Toast';
import TaoDatPhongTrucTiep from './TaoDatPhongTrucTiep';
import ChiTietDatPhong from './ChiTietDatPhong';
import ThanhToanModal from './ThanhToanModal';
import DoiPhongHuyDP from './DoiPhongHuyDP';
import api from '../../utils/api';

// Import CSS
import '../../styles/admin.css';
import '../../styles/letan.css';

export default function QuanLyDatPhongLT() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBookingId, setPaymentBookingId] = useState(null);

  const [showDoiPhongModal, setShowDoiPhongModal] = useState(false);
  const [doiPhongBookingId, setDoiPhongBookingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [currentPage, filterStatus, filterType, pageSize]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/DatPhong');
      let data = res.data.data || [];

      // Filter by status
      if (filterStatus) {
        data = data.filter((b) => b.trangThai === filterStatus);
      }

      // Filter by type
      if (filterType) {
        data = data.filter((b) => b.loaiDatPhong === filterType);
      }

      // Search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        data = data.filter(
          (b) =>
            b.tenKhachHang?.toLowerCase().includes(term) ||
            b.emailKhachHang?.toLowerCase().includes(term) ||
            b.soDienThoai?.includes(term) ||
            b.maDatPhong?.toString().includes(term)
        );
      }

      // Pagination
      const total = Math.ceil(data.length / pageSize);
      setTotalPages(total || 1);

      const start = (currentPage - 1) * pageSize;
      const paginated = data.slice(start, start + pageSize);

      setBookings(paginated);

    } catch (err) {
      console.error('Lỗi khi tải danh sách đặt phòng:', err);
      showToast('error', 'Không thể tải danh sách đặt phòng');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    console.log('Toast triggered:', type, message); // Debug
    setToast({ show: true, type, message });
  };

  const hideToast = () => {
    setToast({ show: false, type: '', message: '' });
  };
  const handleReset = () => {
    setSearchTerm('');
    setFilterStatus('');
    setCurrentPage(1);
    setPageSize(10);
    fetchUsers();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchBookings();
  };

  const handleApprove = async (bookingId) => {
    if (!window.confirm('Xác nhận duyệt đặt phòng này?')) return;

    try {
      await api.put(`/api/DatPhong/${bookingId}/Duyet`);
      showToast('success', 'Duyệt đặt phòng thành công');
      fetchBookings();
    } catch (err) {
      console.error('Lỗi khi duyệt:', err);
      showToast('error', err.response?.data?.message || 'Duyệt thất bại');
    }
  };

  const handleReject = async (bookingId) => {
    const reason = window.prompt('Nhập lý do từ chối:');
    if (!reason) return;

    try {
      await api.put(`/api/DatPhong/${bookingId}/TuChoi`, { lyDo: reason });
      showToast('success', 'Từ chối đặt phòng thành công');
      fetchBookings();
    } catch (err) {
      console.error('Lỗi khi từ chối:', err);
      showToast('error', err.response?.data?.message || 'Từ chối thất bại');
    }
  };

  const handleCheckIn = async (bookingId) => {
    if (!window.confirm('Xác nhận check-in cho đặt phòng này?')) return;

    try {
      await api.put(`/api/DatPhong/${bookingId}/CheckIn`);
      showToast('success', 'Check-in thành công');
      fetchBookings();
    } catch (err) {
      console.error('Lỗi khi check-in:', err);
      showToast('error', err.response?.data?.message || 'Check-in thất bại');
    }
  };

  const handleCheckOut = async (bookingId) => {
    if (!window.confirm('Xác nhận check-out cho đặt phòng này?')) return;

    try {
      await api.put(`/api/DatPhong/${bookingId}/CheckOut`);
      showToast('success', 'Check-out thành công');
      fetchBookings();
    } catch (err) {
      console.error('Lỗi khi check-out:', err);
      showToast('error', err.response?.data?.message || 'Check-out thất bại');
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      ChoDuyet: { label: 'Chờ duyệt', class: 'tag-warning' },
      DaDuyet: { label: 'Đã duyệt', class: 'tag-info' },
      DangSuDung: { label: 'Đang sử dụng', class: 'tag-primary' },
      HoanThanh: { label: 'Hoàn thành', class: 'tag-success' },
      DaHuy: { label: 'Đã hủy', class: 'tag-danger' },
      TuChoi: { label: 'Từ chối', class: 'tag-dark' },
      // TRẠNG THÁI HIỂN THỊ MỚI
      DenHan: { label: '⌛ Đến hạn trả', class: 'tag-warning' },
      QuaHan: { label: '⚠️ Quá hạn trả', class: 'tag-danger' },
    };
    const s = statusMap[status] || { label: status, class: 'tag-secondary' };
    return <span className={`tag ${s.class}`}>{s.label}</span>;
  };

  const getTypeTag = (type) => {
    return type === 'TrucTiep' ? (
      <span className="tag tag-primary" style={{ fontSize: 11 }}>
        🏪 Trực tiếp
      </span>
    ) : (
      <span className="tag tag-info" style={{ fontSize: 11 }}>
        🌐 Online
      </span>
    );
  };

  const renderActions = (booking) => {
    const { maDatPhong, trangThai } = booking;

    return (
      <div className="action-buttons">
        {/* Xem chi tiết */}
        <button
          className="action-icon-btn view"
          onClick={() => setSelectedBookingId(maDatPhong)}
          title="Xem chi tiết"
        >
          👁️
        </button>

        {/* Thanh toán - Hiện khi ChoDuyet, DaDuyet hoặc DangSuDung */}
        {(trangThai === 'ChoDuyet' || trangThai === 'DaDuyet' || trangThai === 'DangSuDung') && (
          <button
            className="action-icon-btn success"
            onClick={() => {
              setPaymentBookingId(maDatPhong);
              setShowPaymentModal(true);
            }}
            title="Thanh toán"
          >
            💳
          </button>
        )}

        {/* Check-in - CHỈ hiện khi trạng thái "DaDuyet" */}
        {trangThai === 'DaDuyet' && (
          <button
            className="action-icon-btn primary"
            onClick={() => handleCheckIn(maDatPhong)}
            title="Check-in"
          >
            🔑
          </button>
        )}

        {/* Check-out - CHỈ hiện khi trạng thái "DangSuDung" */}
        {trangThai === 'DangSuDung' && (
          <button
            className="action-icon-btn warning"
            onClick={() => handleCheckOut(maDatPhong)}
            title="Check-out"
          >
            🚪
          </button>
        )}

        {/* Đổi phòng - CHỈ hiện khi trạng thái "DangSuDung" */}
        {trangThai === 'DangSuDung' && (
          <button
            className="action-icon-btn info"
            onClick={() => {
              setDoiPhongBookingId(maDatPhong);
              setShowDoiPhongModal(true);
            }}
            title="Đổi phòng"
          >
            🔄
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="admin-card letan-layout">
      {/* ⚠️ Toast PHẢI Ở ĐÂY - Ngoài cùng */}
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={hideToast}
          duration={3000}
        />
      )}

      {/* Header */}
      <div className="letan-header-layout" >
        <div className="letan-header-left">
          <h3 className="admin-card-title">📅 Quản lý đặt phòng</h3>
          <button className="btn-outline letan-reset-btn" onClick={handleReset}>
            🔄 Đặt lại
          </button>
        </div>

        <div className="letan-header-right">
          <button className="btn-success" onClick={() => setShowCreateModal(true)}>
            ➕ Đặt phòng trực tiếp
          </button>
        </div>
      </div>

      {/* Filters - CẬP NHẬT */}
      <div className="letan-search-section">
        <div className="letan-search-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Search Input */}
          <div className="letan-search-input-wrapper">
            <span className="letan-search-icon">🔍</span>
            <input
              type="text"
              className="letan-search-input"
              placeholder="Tìm theo mã, tên, email, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Filter Status */}
          <select
            className="letan-select"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">📋 Tất cả trạng thái</option>
            <option value="ChoDuyet">⏳ Chờ duyệt</option>
            <option value="DaDuyet">✅ Đã duyệt</option>
            <option value="DangSuDung">🏨 Đang sử dụng</option>
            <option value="HoanThanh">✔️ Hoàn thành</option>
            <option value="DaHuy">❌ Đã hủy</option>
            <option value="TuChoi">🚫 Từ chối</option>
          </select>

          {/* Page size select - Đặt cùng hàng bên phải filter trạng thái */}
          {/* Page Size */}
          <select
            className="letan-select"
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          >
            <option value={5}>📄 5 / trang</option>
            <option value={10}>📄 10 / trang</option>
            <option value={20}>📄 20 / trang</option>
            <option value={50}>📄 50 / trang</option>
          </select>

          {/* Filter Type */}
          <select
            className="letan-select"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">🏷️ Tất cả loại</option>
            <option value="Online">🌐 Online</option>
            <option value="TrucTiep">🏪 Trực tiếp</option>
          </select>

          {/* Search Button */}
          <button className="letan-btn-search" onClick={handleSearch}>
            🔍 Tìm kiếm
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading">Đang tải...</div>
      ) : bookings.length === 0 ? (
        <div className="admin-empty">
          <p>😕 Không có đặt phòng nào</p>
        </div>
      ) : (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Liên hệ</th>
                  <th>Ngày đặt</th>
                  <th>Nhận phòng</th>
                  <th>Trả phòng</th>
                  <th>Số phòng</th>
                  <th>Tổng tiền</th>
                  <th>Loại</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                  <th>Thời gian thực tế</th> {/* Thêm cột mới vào table */}
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.maDatPhong}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          className="admin-user-avatar"
                          style={{
                            width: 32,
                            height: 32,
                            fontSize: 14,
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          }}
                        >
                          {booking.tenKhachHang?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>
                            {booking.tenKhachHang || '—'}
                          </div>
                          {booking.tenNguoiTao && (
                            <div style={{ fontSize: 11, color: '#666' }}>
                              Tạo bởi: {booking.tenNguoiTao}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>
                        <div>{booking.emailKhachHang || '—'}</div>
                        <div style={{ color: '#666' }}>
                          {booking.soDienThoai || '—'}
                        </div>
                      </div>
                    </td>
                    <td>
                      {new Date(booking.ngayDat).toLocaleDateString('vi-VN')}
                    </td>
                    <td>
                      {new Date(booking.ngayNhanPhong).toLocaleDateString('vi-VN')}
                    </td>
                    <td>
                      {new Date(booking.ngayTraPhong).toLocaleDateString('vi-VN')}
                    </td>
                    <td>
                      <span className="tag tag-secondary">
                        {booking.danhSachPhong?.length || 0} phòng
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#e74c3c' }}>
                      {booking.tongTien?.toLocaleString('vi-VN')}đ
                    </td>
                    <td>{getTypeTag(booking.loaiDatPhong)}</td>
                    <td>{getStatusTag(booking.trangThaiHienThi || booking.trangThai)}</td>
                    <td>{renderActions(booking)}</td>
                    <td>
                      <div style={{ fontSize: 12 }}>
                        {booking.thoiGianCheckIn && (
                          <div style={{ color: '#059669' }}>
                            ✅ In: {new Date(booking.thoiGianCheckIn).toLocaleString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        )}
                        {booking.thoiGianCheckOut && (
                          <div style={{ color: '#dc2626' }}>
                            🚪 Out: {new Date(booking.thoiGianCheckOut).toLocaleString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        )}
                        {!booking.thoiGianCheckIn && !booking.thoiGianCheckOut && '—'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination - luôn hiển thị khi có dữ liệu */}
          {bookings.length > 0 && (
            <div
              className="admin-pagination"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                margin: '24px 0 0 0',
                padding: '12px 0',
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <button
                className="btn-outline"
                disabled={currentPage === 1}
                style={{ minWidth: 80 }}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                ← Trước
              </button>
              <span className="admin-pagination-info" style={{ fontWeight: 500 }}>
                Trang {currentPage} / {totalPages}
              </span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{ margin: '0 8px', padding: '4px 8px', borderRadius: 4 }}
              >
                <option value={5}>5 / trang</option>
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
              </select>
              <button
                className="btn-outline"
                disabled={currentPage === totalPages}
                style={{ minWidth: 80 }}
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

      {/* Modal Tạo Đặt Phòng Trực Tiếp */}
      {showCreateModal && (
        <TaoDatPhongTrucTiep
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchBookings}
          onShowToast={showToast}
        />
      )}

      {/* Modal Chi Tiết */}
      {selectedBookingId && (
        <ChiTietDatPhong
          bookingId={selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
          onShowToast={showToast}
          onUpdate={fetchBookings}
        />
      )}

      {/* Modal Thanh Toán - THÊM MỚI */}
      {showPaymentModal && paymentBookingId && (
        <ThanhToanModal
          bookingId={paymentBookingId}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentBookingId(null);
          }}
          onSuccess={() => {
            fetchBookings();
            showToast('success', 'Thanh toán thành công');
          }}
          onShowToast={showToast}
        />
      )}

      {/* Modal Đổi/Hủy Đặt Phòng */}
      {showDoiPhongModal && doiPhongBookingId && (
        <DoiPhongHuyDP
          bookingId={doiPhongBookingId}
          onClose={() => {
            setShowDoiPhongModal(false);
            setDoiPhongBookingId(null);
          }}
          onSuccess={fetchBookings}
          onShowToast={showToast}
        />
      )}
    </div>
  );
}