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

    const soTienFloat = parseFloat(soTien);
    
    // Cho phép số tiền âm (hoàn tiền) hoặc dương (thanh toán)
    if (!soTien || soTienFloat === 0) {
      onShowToast('error', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    // Khi còn lại dương: Khách cần trả thêm tiền
    if (thongTin.conLai > 0) {
      if (soTienFloat <= 0) {
        onShowToast('error', 'Số tiền thanh toán phải lớn hơn 0');
        return;
      }
      if (soTienFloat > thongTin.conLai) {
        onShowToast('error', `Số tiền không được vượt quá ${thongTin.conLai.toLocaleString('vi-VN')}đ`);
        return;
      }
    }
    
    // Khi còn lại âm: Cần hoàn tiền cho khách
    if (thongTin.conLai < 0) {
      if (soTienFloat >= 0) {
        onShowToast('error', 'Số tiền hoàn trả phải là số âm');
        return;
      }
      if (soTienFloat < thongTin.conLai) {
        onShowToast('error', `Số tiền hoàn trả không được lớn hơn ${Math.abs(thongTin.conLai).toLocaleString('vi-VN')}đ`);
        return;
      }
    }

    setProcessing(true);
    try {
      const res = await api.post('/api/ThanhToan', {
        maDatPhong: bookingId,
        soTien: soTienFloat,
        phuongThuc: phuongThuc,
      });

      onSuccess();
      const message = soTienFloat < 0 
        ? 'Xác nhận hoàn tiền thành công'
        : res.data.message || 'Thanh toán thành công';
      onShowToast('success', message);
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
        style={{ maxWidth: 900, width: '95%' }}
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
                padding: 28, 
                borderRadius: 12,
                border: '2px solid #fee',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)'
              }}>
                <div style={{ display: 'grid', gap: 20 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '16px 20px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: 10,
                    border: '2px solid rgba(239, 68, 68, 0.15)'
                  }}>
                    <span style={{ fontSize: 17, fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 24 }}>💵</span> Tổng tiền:
                    </span>
                    <span style={{ fontSize: 24, fontWeight: 800, color: '#e74c3c' }}>
                      {thongTin.tongTien.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '16px 20px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: 10,
                    border: '2px solid rgba(46, 204, 113, 0.25)'
                  }}>
                    <span style={{ fontSize: 17, fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 24 }}>✅</span> Đã thanh toán:
                    </span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#2ecc71' }}>
                      {thongTin.daThanhToan.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  <div style={{ height: 3, background: 'linear-gradient(90deg, transparent 0%, #fecaca 50%, transparent 100%)', margin: '4px 0' }}></div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '20px 24px',
                    background: thongTin.conLai >= 0 
                      ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(239, 68, 68, 0.15) 100%)'
                      : 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(251, 191, 36, 0.15) 100%)',
                    borderRadius: 12,
                    border: thongTin.conLai >= 0 ? '3px solid #fca5a5' : '3px solid #fcd34d',
                    boxShadow: thongTin.conLai >= 0 
                      ? '0 4px 12px rgba(220, 38, 38, 0.15)'
                      : '0 4px 12px rgba(234, 179, 8, 0.15)'
                  }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 28 }}>{thongTin.conLai >= 0 ? '⚠️' : '💸'}</span> 
                      {thongTin.conLai >= 0 ? 'Còn lại:' : 'Cần hoàn trả:'}
                    </span>
                    <span style={{ 
                      fontSize: 32, 
                      fontWeight: 900, 
                      color: thongTin.conLai >= 0 ? '#dc2626' : '#eab308', 
                      letterSpacing: '-0.5px' 
                    }}>
                      {thongTin.conLai >= 0 
                        ? thongTin.conLai.toLocaleString('vi-VN')
                        : Math.abs(thongTin.conLai).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ FORM THANH TOÁN / HOÀN TIỀN */}
            {thongTin.conLai !== 0 && (
              <div className="form-section">
                <div className="form-section-header">
                  <div className="form-section-icon">{thongTin.conLai > 0 ? '💳' : '💸'}</div>
                  <h4 className="form-section-title">
                    {thongTin.conLai > 0 ? 'Thông tin thanh toán mới' : 'Xác nhận hoàn tiền'}
                  </h4>
                </div>

                {thongTin.conLai < 0 && (
                  <div style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    padding: 20,
                    borderRadius: 12,
                    border: '2px solid #fcd34d',
                    marginBottom: 20
                  }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                      <span style={{ fontSize: 28 }}>⚠️</span>
                      <div>
                        <h5 style={{ fontSize: 16, fontWeight: 700, color: '#92400e', margin: '0 0 8px 0' }}>
                          Khách đã thanh toán thừa!
                        </h5>
                        <p style={{ fontSize: 14, color: '#78350f', margin: 0, lineHeight: 1.6 }}>
                          Do đổi phòng từ đắt sang rẻ hơn, cần hoàn trả <strong>{Math.abs(thongTin.conLai).toLocaleString('vi-VN')}đ</strong> cho khách hàng. 
                          Vui lòng nhập số tiền âm và xác nhận đã hoàn tiền.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-grid" style={{ gap: 24 }}>
                  <div className="form-group full-width">
                    <label className="form-label" style={{ fontSize: 15, fontWeight: 700 }}>
                      <span className="form-label-icon">💵</span>
                      {thongTin.conLai > 0 ? 'Số tiền thanh toán' : 'Số tiền hoàn trả'}
                      <span className="form-label-required">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-input-modern"
                      placeholder={thongTin.conLai > 0 ? 'Nhập số tiền' : 'Nhập số tiền âm (VD: -50000)'}
                      value={soTien}
                      onChange={(e) => setSoTien(e.target.value)}
                      required
                      step="any"
                      style={{ fontSize: 16, padding: '14px 16px' }}
                    />
                    <small style={{ color: '#64748b', fontSize: 13, marginTop: 4, display: 'block' }}>
                      {thongTin.conLai > 0 ? (
                        <>
                          💡 Tối đa: <strong style={{ color: '#e74c3c' }}>
                            {thongTin.conLai.toLocaleString('vi-VN')}đ
                          </strong>
                        </>
                      ) : (
                        <>
                          💸 Nhập số âm để xác nhận hoàn tiền: <strong style={{ color: '#eab308' }}>
                            {thongTin.conLai.toLocaleString('vi-VN')}đ
                          </strong>
                        </>
                      )}
                    </small>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label" style={{ fontSize: 15, fontWeight: 700 }}>
                      <span className="form-label-icon">🏦</span>
                      Phương thức thanh toán
                      <span className="form-label-required">*</span>
                    </label>
                    <select
                      className="form-select-modern"
                      value={phuongThuc}
                      onChange={(e) => setPhuongThuc(e.target.value)}
                      style={{ fontSize: 16, padding: '14px 16px' }}
                    >
                      <option value="TienMat">💵 Tiền mặt</option>
                      <option value="ChuyenKhoan">🏦 Chuyển khoản</option>
                      <option value="TheATM">💳 Thẻ ATM</option>
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
                  maxHeight: 320, 
                  overflowY: 'auto',
                  border: '2px solid #e5e7eb',
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
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
                padding: 32,
                borderRadius: 16,
                border: '3px solid #6ee7b7',
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)'
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
            
            {thongTin.conLai !== 0 && (
              <button 
                type="submit" 
                className="btn-primary-modern" 
                disabled={processing}
              >
                <span className="btn-icon">
                  {processing ? '⏳' : (thongTin.conLai > 0 ? '💰' : '✅')}
                </span>
                {processing 
                  ? 'Đang xử lý...' 
                  : (thongTin.conLai > 0 ? 'Thanh toán' : 'Xác nhận đã hoàn tiền')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}