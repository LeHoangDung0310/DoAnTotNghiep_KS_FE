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
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="admin-loading">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!thongTin) {
    return null;
  }

  return (
    <div className="modal-backdrop letan-layout" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h3 className="modal-title">💳 Thanh toán đặt phòng #{bookingId}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Thông tin tổng quan */}
            <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 24 }}>
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>Tổng tiền:</span>
                  <span style={{ fontSize: 18, fontWeight: 600, color: '#e74c3c' }}>
                    {thongTin.tongTien.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>Đã thanh toán:</span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#27ae60' }}>
                    {thongTin.daThanhToan.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div style={{ height: 1, background: '#dee2e6' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, fontSize: 16 }}>Còn lại:</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#e74c3c' }}>
                    {thongTin.conLai.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>

            {/* Form thanh toán */}
            {thongTin.conLai > 0 && (
              <>
                <div className="form-group">
                  <label>Số tiền thanh toán *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Nhập số tiền"
                    value={soTien}
                    onChange={(e) => setSoTien(e.target.value)}
                    min={0}
                    max={thongTin.conLai}
                    required
                  />
                  <small style={{ color: '#666', marginTop: 4, display: 'block' }}>
                    Tối đa: {thongTin.conLai.toLocaleString('vi-VN')}đ
                  </small>
                </div>

                <div className="form-group">
                  <label>Phương thức thanh toán *</label>
                  <select
                    className="form-control"
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
              </>
            )}

            {/* Lịch sử thanh toán */}
            {thongTin.danhSachThanhToan.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4 style={{ marginBottom: 12, fontSize: 16 }}>📜 Lịch sử thanh toán</h4>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Thời gian</th>
                        <th>Số tiền</th>
                        <th>Phương thức</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {thongTin.danhSachThanhToan.map((tt) => (
                        <tr key={tt.maThanhToan}>
                          <td>{new Date(tt.thoiGian).toLocaleString('vi-VN')}</td>
                          <td style={{ fontWeight: 600 }}>
                            {tt.soTien?.toLocaleString('vi-VN')}đ
                          </td>
                          <td>{tt.phuongThuc}</td>
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
                                ? 'Thành công'
                                : tt.trangThai === 'DangCho'
                                ? 'Đang chờ'
                                : 'Đã hủy'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-outline" onClick={onClose}>
              Đóng
            </button>
            {thongTin.conLai > 0 && (
              <button type="submit" className="btn-success" disabled={processing}>
                {processing ? 'Đang xử lý...' : '💰 Thanh toán'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}