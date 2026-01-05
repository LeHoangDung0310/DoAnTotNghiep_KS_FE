import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../../styles/chitietdatphong.css';

export default function ChiTietDatPhong({ bookingId, onClose, onShowToast, onUpdate }) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetail();
  }, [bookingId]);

  const fetchBookingDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/DatPhong/${bookingId}`);
      setBooking(res.data.data);
    } catch (err) {
      console.error('Lỗi khi tải chi tiết:', err);
      onShowToast('error', 'Không thể tải chi tiết đặt phòng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      ChoDuyet: { label: 'Chờ duyệt', class: 'tag-warning', icon: '⏳' },
      DaDuyet: { label: 'Đã duyệt', class: 'tag-info', icon: '✅' },
      DangSuDung: { label: 'Đang sử dụng', class: 'tag-primary', icon: '🔑' },
      HoanThanh: { label: 'Hoàn thành', class: 'tag-success', icon: '✨' },
      DaHuy: { label: 'Đã hủy', class: 'tag-danger', icon: '❌' },
      TuChoi: { label: 'Từ chối', class: 'tag-danger', icon: '🚫' },
    };
    const s = map[status] || { label: status, class: 'tag-secondary', icon: '📋' };
    return (
      <span className={`tag ${s.class}`}>
        {s.icon} {s.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="admin-loading">⏳ Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-detail chitiet-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Gradient */}
        <div className="modal-header-gradient">
          <div className="modal-header-content">
            <div className="modal-icon">🏨</div>
            <div>
              <h3 className="modal-title-large">Chi tiết đặt phòng</h3>
              <p className="modal-subtitle">
                Mã định danh hệ thống: <strong>#{bookingId}</strong>
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Đóng">
            ✕
          </button>
        </div>

        <div className="modal-body chitiet-modal-body">
          {/* Status Banner */}
          <div className="chitiet-status-banner">
            <div>
              <div className="chitiet-status-label">Trạng thái hiện tại</div>
              <div className="chitiet-status-value">
                {getStatusBadge(booking.trangThai)}
              </div>
            </div>
            <div className="chitiet-status-right" style={{ textAlign: 'right' }}>
              <div className="chitiet-status-label">Phương thức đặt</div>
              <div className="chitiet-status-type">
                {booking.loaiDatPhong === 'TrucTiep' ? (
                  <span className="tag tag-primary">🏪 Trực tiếp tại quầy</span>
                ) : (
                  <span className="tag tag-info">🌐 Đặt chỗ trực tuyến</span>
                )}
              </div>
            </div>
          </div>

          {/* Time Information Section */}
          <div className="chitiet-section">
            <h4 className="chitiet-section-title">
              📅 Lịch trình đặt phòng
            </h4>
            <div className="chitiet-grid-3">
              <div className="chitiet-card chitiet-card-blue">
                <div className="chitiet-card-icon">🕒</div>
                <div className="chitiet-card-content">
                  <div className="chitiet-card-label">Thời điểm đặt</div>
                  <div className="chitiet-card-value">
                    {new Date(booking.ngayDat).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              <div className="chitiet-card chitiet-card-yellow">
                <div className="chitiet-card-icon">🔑</div>
                <div className="chitiet-card-content">
                  <div className="chitiet-card-label">Nhận phòng (Dự kiến)</div>
                  <div className="chitiet-card-value">
                    {new Date(booking.ngayNhanPhong).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>

              {booking.thoiGianCheckIn && (
                <div className="chitiet-card chitiet-card-green">
                  <div className="chitiet-card-icon">✅</div>
                  <div className="chitiet-card-content">
                    <div className="chitiet-card-label">Check-in thực tế</div>
                    <div className="chitiet-card-value">
                      {new Date(booking.thoiGianCheckIn).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="chitiet-card chitiet-card-pink">
                <div className="chitiet-card-icon">🚪</div>
                <div className="chitiet-card-content">
                  <div className="chitiet-card-label">Trả phòng (Dự kiến)</div>
                  <div className="chitiet-card-value">
                    {new Date(booking.ngayTraPhong).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>

              {booking.thoiGianCheckOut && (
                <div className="chitiet-card chitiet-card-red">
                  <div className="chitiet-card-icon">🔙</div>
                  <div className="chitiet-card-content">
                    <div className="chitiet-card-label">Check-out thực tế</div>
                    <div className="chitiet-card-value">
                      {new Date(booking.thoiGianCheckOut).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="chitiet-card chitiet-card-purple">
                <div className="chitiet-card-icon">🌙</div>
                <div className="chitiet-card-content">
                  <div className="chitiet-card-label">Tổng thời gian lưu trú</div>
                  <div className="chitiet-card-value">
                    {booking.soNgayO} đêm nghỉ
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information Section */}
          <div className="customer-section">
            <h4 className="chitiet-section-title">
              👤 Thông tin khách hàng
            </h4>
            <div className="customer-grid">
              <div className="customer-item">
                <div className="customer-item-icon item-name">👤</div>
                <div>
                  <div className="chitiet-card-label">Họ và tên</div>
                  <div className="chitiet-card-value">{booking.tenKhachHang}</div>
                </div>
              </div>
              <div className="customer-item">
                <div className="customer-item-icon item-email">✉️</div>
                <div>
                  <div className="chitiet-card-label">Địa chỉ Email</div>
                  <div className="chitiet-card-value">{booking.emailKhachHang || '—'}</div>
                </div>
              </div>
              <div className="customer-item">
                <div className="customer-item-icon item-phone">📞</div>
                <div>
                  <div className="chitiet-card-label">Số điện thoại</div>
                  <div className="chitiet-card-value">{booking.soDienThoai || '—'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Room List Section */}
          <div className="room-list-section">
            <h4 className="chitiet-section-title">
              🛌 Danh sách phòng ({booking.danhSachPhong?.length || 0})
            </h4>

            <div style={{ overflowX: 'auto' }}>
              <table className="premium-table">
                <thead>
                  <tr>
                    <th style={{ width: '120px' }}>Mã phòng</th>
                    <th>Loại phòng & Tiện nghi</th>
                    <th style={{ width: '120px' }}>Sức chứa</th>
                    <th style={{ width: '150px' }}>Đơn giá/đêm</th>
                    <th style={{ width: '180px' }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.danhSachPhong?.map((room, index) => (
                    <tr key={index}>
                      <td>
                        <span className="room-number">
                          {room.soPhong || room.maPhong || (room.MaPhong ? `ID:${room.MaPhong}` : 'Chưa gán')}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{room.tenLoaiPhong}</td>
                      <td>
                        <span className="tag tag-secondary">
                          👥 {room.soNguoi} người
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#475569' }}>
                        {room.giaPhong?.toLocaleString('vi-VN')}đ
                      </td>
                      <td style={{ fontWeight: 800, color: '#e11d48', fontSize: '1.05rem' }}>
                        {(room.giaPhong * booking.soNgayO).toLocaleString('vi-VN')}đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Payment Highlight */}
            <div className="chitiet-total-box">
              <div className="total-left">
                <div className="total-icon-bg">💰</div>
                <div className="total-label">Tổng giá trị đơn đặt phòng:</div>
              </div>
              <div className="total-amount">
                {booking.tongTien?.toLocaleString('vi-VN')}đ
              </div>
            </div>

            {booking.tenNguoiTao && (
              <div className="chitiet-creator-info">
                <span>👤 Nhân viên thực hiện:</span>
                <strong>{booking.tenNguoiTao}</strong>
              </div>
            )}
          </div>
        </div>

        <div className="chitiet-modal-footer">
          <button className="btn-outline" onClick={onClose} style={{ minWidth: "120px", borderRadius: "10px", fontWeight: 700 }}>
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
}
