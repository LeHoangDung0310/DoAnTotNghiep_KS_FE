import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

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
        className="modal modal-detail"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 900, borderRadius: 16 }}
      >
        {/* Header với gradient */}
        <div className="modal-header" style={{ 
          background: 'linear-gradient(135deg, #3498db 0%, #2ecc71 100%)',
          padding: '24px 32px',
          borderRadius: '16px 16px 0 0'
        }}>
          <div>
            <h3 className="modal-title" style={{ fontSize: 24, marginBottom: 4 }}>
              📄 Chi tiết đặt phòng
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 14, margin: 0 }}>
              Mã đặt phòng: <strong>#{booking.maDatPhong}</strong>
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body" style={{ 
          maxHeight: '75vh', 
          overflowY: 'auto',
          padding: '24px 32px'
        }}>
          {/* Status Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            padding: 20,
            borderRadius: 12,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #dee2e6'
          }}>
            <div>
              <div style={{ fontSize: 13, color: '#6c757d', marginBottom: 4 }}>
                Trạng thái hiện tại
              </div>
              <div style={{ fontSize: 20 }}>
                {getStatusBadge(booking.trangThai)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: '#6c757d', marginBottom: 4 }}>
                Loại đặt phòng
              </div>
              <div style={{ fontSize: 16 }}>
                {booking.loaiDatPhong === 'TrucTiep' ? (
                  <span className="tag tag-primary">🏪 Trực tiếp</span>
                ) : (
                  <span className="tag tag-info">🌐 Online</span>
                )}
              </div>
            </div>
          </div>

          {/* Thông tin thời gian */}
          <div className="detail-section" style={{
            background: '#fff',
            padding: 20,
            borderRadius: 12,
            marginBottom: 20,
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h4 className="detail-section-title" style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              📅 Thông tin thời gian
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: 16 
            }}>
              <div className="detail-card">
                <div className="detail-card-icon">📆</div>
                <div>
                  <div className="detail-card-label">Ngày đặt</div>
                  <div className="detail-card-value">
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
              <div className="detail-card">
                <div className="detail-card-icon">🔑</div>
                <div>
                  <div className="detail-card-label">Nhận phòng (dự kiến)</div>
                  <div className="detail-card-value">
                    {new Date(booking.ngayNhanPhong).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>

              {/* ✅ THÊM MỚI - Thời gian check-in thực tế */}
              {booking.thoiGianCheckIn && (
                <div className="detail-card" style={{
                  background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                  border: '2px solid #6ee7b7'
                }}>
                  <div className="detail-card-icon" style={{ background: '#059669' }}>✅</div>
                  <div>
                    <div className="detail-card-label" style={{ color: '#065f46', fontWeight: 600 }}>
                      Check-in thực tế
                    </div>
                    <div className="detail-card-value" style={{ color: '#047857', fontWeight: 700 }}>
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

              <div className="detail-card">
                <div className="detail-card-icon">🚪</div>
                <div>
                  <div className="detail-card-label">Trả phòng (dự kiến)</div>
                  <div className="detail-card-value">
                    {new Date(booking.ngayTraPhong).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>

              {/* ✅ THÊM MỚI - Thời gian check-out thực tế */}
              {booking.thoiGianCheckOut && (
                <div className="detail-card" style={{
                  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                  border: '2px solid #fca5a5'
                }}>
                  <div className="detail-card-icon" style={{ background: '#dc2626' }}>🚪</div>
                  <div>
                    <div className="detail-card-label" style={{ color: '#991b1b', fontWeight: 600 }}>
                      Check-out thực tế
                    </div>
                    <div className="detail-card-value" style={{ color: '#b91c1c', fontWeight: 700 }}>
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

              <div className="detail-card">
                <div className="detail-card-icon">⏱️</div>
                <div>
                  <div className="detail-card-label">Số ngày ở</div>
                  <div className="detail-card-value">
                    {booking.soNgayO} ngày
                  </div>
                </div>
              </div>
            </div>
            {booking.tenNguoiTao && (
              <div style={{
                marginTop: 16,
                paddingTop: 16,
                borderTop: '1px solid #e5e7eb',
                fontSize: 13,
                color: '#64748b'
              }}>
                👤 Được tạo bởi: <strong>{booking.tenNguoiTao}</strong>
              </div>
            )}
          </div>

          {/* Thông tin khách hàng */}
          <div className="detail-section" style={{
            background: '#fff',
            padding: 20,
            borderRadius: 12,
            marginBottom: 20,
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h4 className="detail-section-title" style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: 16,
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
              <div className="detail-card">
                <div className="detail-card-icon">👨</div>
                <div>
                  <div className="detail-card-label">Họ tên</div>
                  <div className="detail-card-value">{booking.tenKhachHang}</div>
                </div>
              </div>
              <div className="detail-card">
                <div className="detail-card-icon">📧</div>
                <div>
                  <div className="detail-card-label">Email</div>
                  <div className="detail-card-value" style={{ fontSize: 13 }}>
                    {booking.emailKhachHang || '—'}
                  </div>
                </div>
              </div>
              <div className="detail-card">
                <div className="detail-card-icon">📞</div>
                <div>
                  <div className="detail-card-label">Số điện thoại</div>
                  <div className="detail-card-value">
                    {booking.soDienThoai || '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Danh sách phòng */}
          <div className="detail-section" style={{
            background: '#fff',
            padding: 20,
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h4 className="detail-section-title" style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: 16,
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

        <div className="modal-footer" style={{ padding: '20px 32px' }}>
          <button className="btn-outline" onClick={onClose} style={{ minWidth: 120 }}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}