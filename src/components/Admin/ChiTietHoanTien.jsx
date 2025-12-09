import React from 'react';
import '../../styles/admin.css';

export default function ChiTietHoanTien({ hoanTien, onClose }) {
  const getStatusBadge = (status) => {
    const map = {
      ChoXuLy: { label: '⏳ Chờ xử lý', color: '#f59e0b' },
      DaHoan: { label: '✅ Đã hoàn', color: '#10b981' },
    };

    const s = map[status] || { label: status, color: '#6b7280' };
    return (
      <span
        style={{
          background: `${s.color}20`,
          color: s.color,
          padding: '8px 16px',
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
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-booking"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 900 }}
      >
        {/* Header */}
        <div className="modal-header-gradient">
          <div className="modal-header-content">
            <div className="modal-icon">💸</div>
            <div>
              <h3 className="modal-title-large">Chi tiết yêu cầu hoàn tiền</h3>
              <p className="modal-subtitle">
                Mã hoàn tiền: #{hoanTien.maHoanTien} | Mã đặt phòng: #{hoanTien.maDatPhong}
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
              <h4 className="form-section-title">Trạng thái</h4>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {getStatusBadge(hoanTien.trangThaiHoanTien)}
              {hoanTien.ngayYeuCau && (
                <div style={{ fontSize: 13, color: '#64748b' }}>
                  Yêu cầu lúc:{' '}
                  {new Date(hoanTien.ngayYeuCau).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}
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
                  value={hoanTien.tenKhachHang || '—'}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="text"
                  className="form-input-modern"
                  value={hoanTien.emailKhachHang || '—'}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input
                  type="text"
                  className="form-input-modern"
                  value={hoanTien.soDienThoai || '—'}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Thông tin ngân hàng */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon">🏦</div>
              <h4 className="form-section-title">Thông tin ngân hàng nhận tiền</h4>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Ngân hàng</label>
                <input
                  type="text"
                  className="form-input-modern"
                  value={hoanTien.nganHang || '—'}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số tài khoản</label>
                <input
                  type="text"
                  className="form-input-modern"
                  value={hoanTien.soTaiKhoan || '—'}
                  disabled
                  style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Tên chủ tài khoản</label>
                <input
                  type="text"
                  className="form-input-modern"
                  value={hoanTien.tenChuTK || '—'}
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
                    {hoanTien.tongTien?.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>
                    ✅ Đã thanh toán:
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#2ecc71' }}>
                    {hoanTien.daThanhToan?.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>
                    ⚠️ Phí giữ:
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#e74c3c' }}>
                    {hoanTien.phiGiu?.toLocaleString('vi-VN') || 0}đ
                  </span>
                </div>

                <div style={{ height: 2, background: '#fecaca', margin: '8px 0' }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
                    💚 Tiền hoàn:
                  </span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>
                    {hoanTien.tienHoan?.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lý do hủy */}
          {hoanTien.lyDo && (
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">📝</div>
                <h4 className="form-section-title">Lý do hủy đặt phòng</h4>
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
                {hoanTien.lyDo}
              </div>
            </div>
          )}

          {/* Thông tin xử lý */}
          {hoanTien.trangThaiHoanTien === 'DaHoan' && (
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">✅</div>
                <h4 className="form-section-title">Thông tin xử lý</h4>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Người xử lý</label>
                  <input
                    type="text"
                    className="form-input-modern"
                    value={hoanTien.tenQuanTriHoanTien || '—'}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Thời gian hoàn tiền</label>
                  <input
                    type="text"
                    className="form-input-modern"
                    value={
                      hoanTien.ngayHoanTien
                        ? new Date(hoanTien.ngayHoanTien).toLocaleString('vi-VN', {
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

                {hoanTien.ghiChu && (
                  <div className="form-group full-width">
                    <label className="form-label">Ghi chú</label>
                    <textarea
                      className="form-input-modern"
                      rows={3}
                      value={hoanTien.ghiChu}
                      disabled
                    />
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