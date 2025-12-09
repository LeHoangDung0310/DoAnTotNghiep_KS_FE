import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../../styles/admin.css';
import '../../styles/letan.css';

export default function ThanhToanModal({ bookingId, onClose, onSuccess, onShowToast }) {
  const [thongTin, setThongTin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [soTien, setSoTien] = useState('');
  const [phuongThuc, setPhuongThuc] = useState('TienMat');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchThongTinThanhToan();
  }, [bookingId]);

  const fetchThongTinThanhToan = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/ThanhToan/DatPhong/${bookingId}`);
      setThongTin(res.data.data);
      setSoTien(res.data.data.conLai.toString());
    } catch (err) {
      console.error('Lỗi khi tải thông tin thanh toán:', err);
      onShowToast('error', 'Không thể tải thông tin thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!soTien || parseFloat(soTien) <= 0) {
      onShowToast('error', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (parseFloat(soTien) > thongTin.conLai) {
      onShowToast('error', `Số tiền không được vượt quá ${thongTin.conLai.toLocaleString('vi-VN')}đ`);
      return;
    }

    setProcessing(true);
    try {
      const res = await api.post('/api/ThanhToan', {
        maDatPhong: bookingId,
        soTien: parseFloat(soTien),
        phuongThuc: phuongThuc,
      });

      onSuccess();
      onShowToast('success', res.data.message || 'Thanh toán thành công');
      onClose();
    } catch (err) {
      console.error('Lỗi khi thanh toán:', err);
      onShowToast('error', err.response?.data?.message || 'Thanh toán thất bại');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal modal-booking" onClick={(e) => e.stopPropagation()}>
          <div className="booking-loading">
            <div className="booking-loading-spinner"></div>
            <p>Đang tải thông tin thanh toán...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!thongTin) {
    return null;
  }

  return (
    <div className="modal-backdrop letan-layout" onClick={onClose}>
      <div 
        className="modal modal-booking" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 700 }}
      >
        {/* ✅ HEADER GRADIENT */}
        <div className="modal-header-gradient">
          <div className="modal-header-content">
            <div className="modal-icon">💳</div>
            <div>
              <h3 className="modal-title-large">Thanh toán đặt phòng</h3>
              <p className="modal-subtitle">
                Mã đặt phòng: #{bookingId}
              </p>
            </div>
          </div>
          <button className="modal-close-btn-gradient" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body modal-body-scrollable">
            {/* ✅ THÔNG TIN TỔNG QUAN */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">💰</div>
                <h4 className="form-section-title">Thông tin thanh toán</h4>
              </div>

              <div style={{ 
                background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)', 
                padding: 24, 
                borderRadius: 12,
                border: '2px solid #fee'
              }}>
                <div style={{ display: 'grid', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#475569' }}>
                      💵 Tổng tiền:
                    </span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#e74c3c' }}>
                      {thongTin.tongTien.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#475569' }}>
                      ✅ Đã thanh toán:
                    </span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#2ecc71' }}>
                      {thongTin.daThanhToan.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  <div style={{ height: 2, background: '#fecaca', margin: '8px 0' }}></div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
                      ⚠️ Còn lại:
                    </span>
                    <span style={{ fontSize: 24, fontWeight: 700, color: '#dc2626' }}>
                      {thongTin.conLai.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ FORM THANH TOÁN */}
            {thongTin.conLai > 0 && (
              <div className="form-section">
                <div className="form-section-header">
                  <div className="form-section-icon">💳</div>
                  <h4 className="form-section-title">Thông tin thanh toán mới</h4>
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">
                      <span className="form-label-icon">💵</span>
                      Số tiền thanh toán
                      <span className="form-label-required">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-input-modern"
                      placeholder="Nhập số tiền"
                      value={soTien}
                      onChange={(e) => setSoTien(e.target.value)}
                      min={0}
                      max={thongTin.conLai}
                      required
                    />
                    <small style={{ color: '#64748b', fontSize: 13, marginTop: 4, display: 'block' }}>
                      💡 Tối đa: <strong style={{ color: '#e74c3c' }}>
                        {thongTin.conLai.toLocaleString('vi-VN')}đ
                      </strong>
                    </small>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">
                      <span className="form-label-icon">🏦</span>
                      Phương thức thanh toán
                      <span className="form-label-required">*</span>
                    </label>
                    <select
                      className="form-select-modern"
                      value={phuongThuc}
                      onChange={(e) => setPhuongThuc(e.target.value)}
                    >
                      <option value="TienMat">💵 Tiền mặt</option>
                      <option value="ChuyenKhoan">🏦 Chuyển khoản</option>
                      <option value="TheATM">💳 Thẻ ATM</option>
                      <option value="MoMo">📱 MoMo</option>
                      <option value="ZaloPay">💰 ZaloPay</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ LỊCH SỬ THANH TOÁN */}
            {thongTin.danhSachThanhToan.length > 0 && (
              <div className="form-section">
                <div className="form-section-header">
                  <div className="form-section-icon">📜</div>
                  <h4 className="form-section-title">
                    Lịch sử thanh toán ({thongTin.danhSachThanhToan.length})
                  </h4>
                </div>

                <div style={{ 
                  maxHeight: 300, 
                  overflowY: 'auto',
                  border: '2px solid #e5e7eb',
                  borderRadius: 12
                }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>⏰ Thời gian</th>
                        <th>💵 Số tiền</th>
                        <th>🏦 Phương thức</th>
                        <th>📊 Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {thongTin.danhSachThanhToan.map((tt) => (
                        <tr key={tt.maThanhToan}>
                          <td style={{ fontSize: 13 }}>
                            {new Date(tt.thoiGian).toLocaleString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td style={{ fontWeight: 700, fontSize: 14, color: '#e74c3c' }}>
                            {tt.soTien?.toLocaleString('vi-VN')}đ
                          </td>
                          <td style={{ fontSize: 13 }}>{tt.phuongThuc}</td>
                          <td>
                            <span
                              className={`tag ${
                                tt.trangThai === 'ThanhCong'
                                  ? 'tag-success'
                                  : tt.trangThai === 'DangCho'
                                  ? 'tag-warning'
                                  : 'tag-danger'
                              }`}
                            >
                              {tt.trangThai === 'ThanhCong'
                                ? '✅ Thành công'
                                : tt.trangThai === 'DangCho'
                                ? '⏳ Đang chờ'
                                : '❌ Đã hủy'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ✅ THÔNG BÁO KHI ĐÃ THANH TOÁN ĐỦ */}
            {thongTin.conLai === 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                padding: 20,
                borderRadius: 12,
                border: '2px solid #6ee7b7',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <h4 style={{ fontSize: 18, fontWeight: 700, color: '#065f46', margin: '0 0 8px 0' }}>
                  Đã thanh toán đầy đủ!
                </h4>
                <p style={{ fontSize: 14, color: '#047857', margin: 0 }}>
                  Không cần thanh toán thêm cho đặt phòng này.
                </p>
              </div>
            )}
          </div>

          {/* ✅ FOOTER */}
          <div className="modal-footer modal-footer-modern">
            <button type="button" className="btn-outline-modern" onClick={onClose}>
              <span className="btn-icon">✕</span>
              Đóng
            </button>
            
            {thongTin.conLai > 0 && (
              <button 
                type="submit" 
                className="btn-primary-modern" 
                disabled={processing}
              >
                <span className="btn-icon">
                  {processing ? '⏳' : '💰'}
                </span>
                {processing ? 'Đang xử lý...' : 'Thanh toán'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}