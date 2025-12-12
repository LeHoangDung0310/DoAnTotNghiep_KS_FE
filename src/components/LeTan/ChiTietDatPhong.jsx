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
        {/* Header với gradient */}
        <div className="modal-header-gradient">
          <div className="modal-header-content">
            <div className="modal-icon">📄</div>
            <div>
              <h3 className="modal-title-large">Chi tiết đặt phòng</h3>
              <p className="modal-subtitle">
                Mã đặt phòng: #{bookingId}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body chitiet-modal-body">
          {/* Status Banner */}
          <div className="chitiet-status-banner">
            <div>
              <div className="chitiet-status-label">
                Trạng thái hiện tại
              </div>
              <div className="chitiet-status-value">
                {getStatusBadge(booking.trangThai)}
              </div>
            </div>
            <div className="chitiet-status-right">
              <div className="chitiet-status-label">
                Loại đặt phòng
              </div>
              <div className="chitiet-status-type">
                {booking.loaiDatPhong === 'TrucTiep' ? (
                  <span className="tag tag-primary">🏪 Trực tiếp</span>
                ) : (
                  <span className="tag tag-info">🌐 Online</span>
                )}
              </div>
            </div>
          </div>

          {/* Thông tin thời gian */}
          <div className="chitiet-section">
            <h4 className="chitiet-section-title">
              📅 Thông tin thời gian
            </h4>
            <div className="chitiet-grid-3">
              <div className="chitiet-card chitiet-card-blue">
                <div className="chitiet-card-icon">📆</div>
                <div className="chitiet-card-content">
                  <div className="chitiet-card-label">Ngày đặt</div>
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
                  <div className="chitiet-card-label">Nhận phòng (dự kiến)</div>
                  <div className="chitiet-card-value">
                    {new Date(booking.ngayNhanPhong).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>

              {/* ✅ THÊM MỚI - Thời gian check-in thực tế */}
              {booking.thoiGianCheckIn && (
                <div className="chitiet-card chitiet-card-green">
                  <div className="chitiet-card-icon">✅</div>
                  <div className="chitiet-card-content">
                    <div className="chitiet-card-label">
                      Check-in thực tế
                    </div>
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
                  <div className="chitiet-card-label">Trả phòng (dự kiến)</div>
                  <div className="chitiet-card-value">
                    {new Date(booking.ngayTraPhong).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>

              {/* ✅ THÊM MỚI - Thời gian check-out thực tế */}
              {booking.thoiGianCheckOut && (
                <div className="chitiet-card chitiet-card-red">
                  <div className="chitiet-card-icon">🚪</div>
                  <div className="chitiet-card-content">
                    <div className="chitiet-card-label">
                      Check-out thực tế
                    </div>
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
                <div className="chitiet-card-icon">⏱️</div>
                <div className="chitiet-card-content">
                  <div className="chitiet-card-label">Số ngày ở</div>
                  <div className="chitiet-card-value">
                    {booking.soNgayO} ngày
                  </div>
                </div>
              </div>
            </div>
            {booking.tenNguoiTao && (
              <div className="chitiet-creator-info">
                👤 Được tạo bởi: <strong>{booking.tenNguoiTao}</strong>
              </div>
            )}
          </div>

          {/* Thông tin khách hàng */}
          <div className="detail-section" style={{
            background: '#fff',
            padding: 24,
            borderRadius: 12,
            marginBottom: 20,
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <h4 className="detail-section-title" style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: 20,
              paddingBottom: 12,
              borderBottom: '2px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              👤 Thông tin khách hàng
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: 16 
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                padding: '16px',
                borderRadius: 10,
                border: '2px solid #93c5fd',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0
                }}>👨</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#1e40af', fontWeight: 600, marginBottom: 4 }}>Họ tên</div>
                  <div style={{ fontSize: 14, color: '#1e3a8a', fontWeight: 700 }}>{booking.tenKhachHang}</div>
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                padding: '16px',
                borderRadius: 10,
                border: '2px solid #fcd34d',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0
                }}>📧</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#a16207', fontWeight: 600, marginBottom: 4 }}>Email</div>
                  <div style={{ fontSize: 13, color: '#78350f', fontWeight: 700, wordBreak: 'break-word' }}>
                    {booking.emailKhachHang || '—'}
                  </div>
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                padding: '16px',
                borderRadius: 10,
                border: '2px solid #6ee7b7',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0
                }}>📞</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#065f46', fontWeight: 600, marginBottom: 4 }}>Số điện thoại</div>
                  <div style={{ fontSize: 14, color: '#047857', fontWeight: 700 }}>
                    {booking.soDienThoai || '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Danh sách phòng */}
          <div className="detail-section" style={{
            background: '#fff',
            padding: 24,
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <h4 className="detail-section-title" style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: 20,
              paddingBottom: 12,
              borderBottom: '2px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              🏨 Danh sách phòng đã đặt ({booking.danhSachPhong?.length || 0} phòng)
            </h4>
            
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ marginBottom: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: 100 }}>Số phòng</th>
                    <th>Loại phòng</th>
                    <th style={{ width: 100 }}>Số người</th>
                    <th style={{ width: 120 }}>Giá/đêm</th>
                    <th style={{ width: 140 }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.danhSachPhong?.map((room, index) => (
                    <tr key={index}>
                      <td>
                        <span style={{
                          background: 'linear-gradient(135deg, #3498db 0%, #2ecc71 100%)',
                          color: '#fff',
                          padding: '6px 12px',
                          borderRadius: 6,
                          fontWeight: 700,
                          fontSize: 14
                        }}>
                          {room.soPhong}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{room.tenLoaiPhong}</td>
                      <td>
                        <span className="tag tag-secondary">
                          👥 {room.soNguoi}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {room.giaPhong?.toLocaleString('vi-VN')}đ
                      </td>
                      <td style={{ fontWeight: 700, color: '#e74c3c', fontSize: 15 }}>
                        {(room.giaPhong * booking.soNgayO).toLocaleString('vi-VN')}đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tổng tiền */}
            <div style={{
              marginTop: 20,
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)',
              borderRadius: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '2px solid #fee',
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
                💰 Tổng thanh toán:
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#e74c3c' }}>
                {booking.tongTien?.toLocaleString('vi-VN')}đ
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer chitiet-modal-footer">
          <button className="btn-outline" onClick={onClose} style={{ minWidth: 120 }}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}