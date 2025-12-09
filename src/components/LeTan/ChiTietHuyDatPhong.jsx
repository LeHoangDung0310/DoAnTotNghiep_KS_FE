import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../../styles/admin.css';
import '../../styles/letan.css';

export default function ChiTietHuyDatPhong({ huyId, onClose, onShowToast, onUpdate }) {
  const [huyDatPhong, setHuyDatPhong] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHuyDatPhong();
  }, [huyId]);

  const fetchHuyDatPhong = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/HuyDatPhong/${huyId}`);
      setHuyDatPhong(res.data.data);
    } catch (err) {
      console.error('Lỗi khi tải chi tiết hủy đặt phòng:', err);
      onShowToast('error', 'Không thể tải thông tin hủy đặt phòng');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal modal-booking" onClick={(e) => e.stopPropagation()}>
          <div className="booking-loading">
            <div className="booking-loading-spinner"></div>
            <p>Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!huyDatPhong) {
    return null;
  }

  const getStatusBadge = (status) => {
    const map = {
      ChoDuyet: { label: '⏳ Chờ duyệt', color: '#f59e0b' },
      DaDuyet: { label: '✅ Đã duyệt', color: '#10b981' },
      TuChoi: { label: '❌ Từ chối', color: '#ef4444' },
    };

    const s = map[status] || { label: status, color: '#6b7280' };
    return (
      <span
        style={{
          background: `${s.color}20`,
          color: s.color,
          padding: '6px 12px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {s.label}
      </span>
    );
  };

  return (
    <div className="modal-backdrop letan-layout" onClick={onClose}>
      <div
        className="modal modal-booking"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 900 }}
      >
        {/* Header */}
        <div className="modal-header-gradient">
          <div className="modal-header-content">
            <div className="modal-icon">🚫</div>
            <div>
              <h3 className="modal-title-large">Chi tiết yêu cầu hủy đặt phòng</h3>
              <p className="modal-subtitle">
                Mã yêu cầu: #{huyDatPhong.maHuyDatPhong} | Mã đặt phòng: #
                {huyDatPhong.maDatPhong}
              </p>
            </div>
          </div>
          <button className="modal-close-btn-gradient" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body modal-body-scrollable">
          {/* Trạng thái */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon">📊</div>
              <h4 className="form-section-title">Trạng thái yêu cầu</h4>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {getStatusBadge(huyDatPhong.trangThai)}
              <div style={{ fontSize: 13, color: '#64748b' }}>
                Yêu cầu lúc:{' '}
                {new Date(huyDatPhong.ngayYeuCau).toLocaleString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>

          {/* Thông tin khách hàng */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon">👤</div>
              <h4 className="form-section-title">Thông tin khách hàng</h4>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Họ tên</label>
                <input
                  type="text"
                  className="form-input-modern"
                  value={huyDatPhong.tenKhachHang || '—'}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="text"
                  className="form-input-modern"
                  value={huyDatPhong.emailKhachHang || '—'}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input
                  type="text"
                  className="form-input-modern"
                  value={huyDatPhong.soDienThoai || '—'}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Thông tin đặt phòng */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon">📅</div>
              <h4 className="form-section-title">Thông tin đặt phòng</h4>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Ngày nhận phòng</label>
                <input
                  type="text"
                  className="form-input-modern"
                  value={
                    huyDatPhong.ngayNhanPhong
                      ? new Date(huyDatPhong.ngayNhanPhong).toLocaleDateString('vi-VN')
                      : '—'
                  }
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ngày trả phòng</label>
                <input
                  type="text"
                  className="form-input-modern"
                  value={
                    huyDatPhong.ngayTraPhong
                      ? new Date(huyDatPhong.ngayTraPhong).toLocaleDateString('vi-VN')
                      : '—'
                  }
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Thông tin tài chính */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon">💰</div>
              <h4 className="form-section-title">Thông tin tài chính</h4>
            </div>

            <div
              style={{
                background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)',
                padding: 24,
                borderRadius: 12,
                border: '2px solid #fee',
              }}
            >
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>
                    💵 Tổng tiền:
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#64748b' }}>
                    {huyDatPhong.tongTien?.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>
                    ✅ Đã thanh toán:
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#2ecc71' }}>
                    {huyDatPhong.daThanhToan?.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <div style={{ height: 2, background: '#fecaca', margin: '8px 0' }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
                    ⚠️ Phí giữ:
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#e74c3c' }}>
                    {huyDatPhong.phiGiu?.toLocaleString('vi-VN') || 0}đ
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
                    💚 Tiền hoàn:
                  </span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>
                    {huyDatPhong.tienHoan?.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lý do hủy */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon">📝</div>
              <h4 className="form-section-title">Lý do hủy</h4>
            </div>

            <div
              style={{
                background: '#f8fafc',
                padding: 16,
                borderRadius: 10,
                border: '2px solid #e2e8f0',
                fontSize: 14,
                color: '#475569',
                lineHeight: 1.6,
              }}
            >
              {huyDatPhong.lyDo || '—'}
            </div>
          </div>

          {/* Thông tin ngân hàng */}
          {(huyDatPhong.nganHang || huyDatPhong.soTaiKhoan) && (
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">🏦</div>
                <h4 className="form-section-title">Thông tin ngân hàng nhận hoàn tiền</h4>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Ngân hàng</label>
                  <input
                    type="text"
                    className="form-input-modern"
                    value={huyDatPhong.nganHang || '—'}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Số tài khoản</label>
                  <input
                    type="text"
                    className="form-input-modern"
                    value={huyDatPhong.soTaiKhoan || '—'}
                    disabled
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Tên chủ tài khoản</label>
                  <input
                    type="text"
                    className="form-input-modern"
                    value={huyDatPhong.tenChuTK || '—'}
                    disabled
                  />
                </div>
              </div>
            </div>
          )}

          {/* Thông tin xử lý */}
          {huyDatPhong.tenNguoiDuyet && (
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">✅</div>
                <h4 className="form-section-title">Thông tin xử lý</h4>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Người duyệt</label>
                  <input
                    type="text"
                    className="form-input-modern"
                    value={huyDatPhong.tenNguoiDuyet}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Thời gian xử lý</label>
                  <input
                    type="text"
                    className="form-input-modern"
                    value={
                      huyDatPhong.ngayXuLy
                        ? new Date(huyDatPhong.ngayXuLy).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'
                    }
                    disabled
                  />
                </div>

                {huyDatPhong.ghiChu && (
                  <div className="form-group full-width">
                    <label className="form-label">Ghi chú</label>
                    <textarea
                      className="form-input-modern"
                      rows={3}
                      value={huyDatPhong.ghiChu}
                      disabled
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Thông tin hoàn tiền */}
          {huyDatPhong.trangThaiHoanTien && (
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">💸</div>
                <h4 className="form-section-title">Trạng thái hoàn tiền</h4>
              </div>

              <div
                style={{
                  background:
                    huyDatPhong.trangThaiHoanTien === 'DaHoan'
                      ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                      : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  padding: 20,
                  borderRadius: 12,
                  border: `2px solid ${
                    huyDatPhong.trangThaiHoanTien === 'DaHoan' ? '#6ee7b7' : '#fbbf24'
                  }`,
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                  {huyDatPhong.trangThaiHoanTien === 'DaHoan'
                    ? '✅ Đã hoàn tiền'
                    : '⏳ Chờ Admin hoàn tiền'}
                </div>
                {huyDatPhong.ngayHoanTien && (
                  <div style={{ fontSize: 13, color: '#475569' }}>
                    Thời gian:{' '}
                    {new Date(huyDatPhong.ngayHoanTien).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                )}
                {huyDatPhong.tenQuanTriHoanTien && (
                  <div style={{ fontSize: 13, color: '#475569' }}>
                    Người xử lý: {huyDatPhong.tenQuanTriHoanTien}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer modal-footer-modern">
          <button className="btn-outline-modern" onClick={onClose}>
            <span className="btn-icon">✕</span>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}