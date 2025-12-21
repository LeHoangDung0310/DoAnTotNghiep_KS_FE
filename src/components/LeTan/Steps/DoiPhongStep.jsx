import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import '../../../styles/doiphong.css';

export default function DoiPhongStep({ bookingId, onClose, onSuccess, onShowToast, customStyle }) {
  const [loading, setLoading] = useState(false);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedOldRoom, setSelectedOldRoom] = useState('');
  const [selectedNewRoom, setSelectedNewRoom] = useState('');
  const [reason, setReason] = useState('');  const [calculatedFee, setCalculatedFee] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [oldRoomDetails, setOldRoomDetails] = useState(null);

  useEffect(() => {
    fetchBookingInfo();
  }, [bookingId]);

  useEffect(() => {
    if (selectedOldRoom && bookingInfo) {
      fetchAvailableRooms();
      fetchOldRoomDetails();
    }
  }, [selectedOldRoom]);

  const fetchOldRoomDetails = async () => {
    if (!selectedOldRoom) return;
    
    try {
      const res = await api.get(`/api/Phong/${selectedOldRoom}`);
      if (res.data.success) {
        setOldRoomDetails(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải thông tin phòng:', err);
    }
  };

  const fetchBookingInfo = async () => {
    try {
      const res = await api.get(`/api/DatPhong/${bookingId}`);
      if (res.data.success) {
        setBookingInfo(res.data.data);
      }
    } catch (err) {
      onShowToast('error', err.response?.data?.message || 'Lỗi khi tải thông tin đặt phòng');
    }
  };

  const fetchAvailableRooms = async () => {
    if (!bookingInfo) return;
    
    try {
      setLoading(true);
      // Lấy danh sách phòng trống theo thời gian booking
      const res = await api.get('/api/Phong/PhongTrong', {
        params: {
          ngayNhanPhong: bookingInfo.ngayNhanPhong,
          ngayTraPhong: bookingInfo.ngayTraPhong
        }
      });
      if (res.data.success) {
        setAvailableRooms(res.data.data || []);
      }
    } catch (err) {
      onShowToast('error', 'Lỗi khi tải danh sách phòng trống');
    } finally {
      setLoading(false);
    }
  };

  const calculateFee = () => {
    if (!selectedOldRoom || !selectedNewRoom || !bookingInfo) {
      return;
    }

    const oldRoom = bookingInfo.danhSachPhong.find(p => p.maPhong === parseInt(selectedOldRoom));
    const newRoom = availableRooms.find(r => r.maPhong === parseInt(selectedNewRoom));

    if (!oldRoom || !newRoom) return;

    const ngayTraPhong = new Date(bookingInfo.ngayTraPhong);
    const ngayHienTai = new Date();
    const soNgayConLai = Math.ceil((ngayTraPhong - ngayHienTai) / (1000 * 60 * 60 * 24));

    const giaPhongCu = oldRoom.giaPhong;
    const giaPhongMoi = newRoom.giaMoiDem || 0;
    const cungLoaiPhong = oldRoom.tenLoaiPhong === newRoom.tenLoaiPhong;
    const phiChenhLech = cungLoaiPhong ? 0 : (giaPhongMoi - giaPhongCu) * soNgayConLai;

    setCalculatedFee({
      oldRoom,
      newRoom,
      soNgayConLai,
      giaPhongCu,
      giaPhongMoi,
      cungLoaiPhong,
      phiChenhLech
    });

    setShowConfirm(true);
  };

  const handleChangeRoom = async () => {
    if (!selectedOldRoom || !selectedNewRoom) {
      onShowToast('error', 'Vui lòng chọn phòng cũ và phòng mới');
      return;
    }

    try {
      setLoading(true);
      const res = await api.put(`/api/DatPhong/${bookingId}/DoiPhong`, {
        maPhongCu: parseInt(selectedOldRoom),
        maPhongMoi: parseInt(selectedNewRoom),
        lyDo: reason || null
      });

      if (res.data.success) {
        onShowToast('success', res.data.message || 'Đổi phòng thành công');
        onSuccess();
        onClose();
      }
    } catch (err) {
      onShowToast('error', err.response?.data?.message || 'Lỗi khi đổi phòng');
    } finally {
      setLoading(false);
    }
  };

  if (!bookingInfo) {
    return (
      <div className={customStyle ? 'modal-body-custom' : ''} style={{ textAlign: 'center', padding: 32 }}>
        Đang tải thông tin đặt phòng...
      </div>
    );
  }

  return (
    <div className="doiphong-body">
      <h3 style={{ marginBottom: 18, color: '#764ba2', fontWeight: 700, fontSize: '1.35rem' }}>Đổi phòng</h3>
      {!showConfirm ? (
        <>
          {/* Thông tin booking */}
          <div className="doiphong-info-card">
            <div className="doiphong-info-header">
              <span>👤</span>
              <h4>Khách hàng: <span style={{ color: '#3b82f6' }}>{bookingInfo.tenKhachHang}</span></h4>
            </div>
            <div className="doiphong-info-grid">
              <div className="doiphong-info-item"><span>📅</span> <span className="label">Ngày trả phòng:</span> <strong>{new Date(bookingInfo.ngayTraPhong).toLocaleDateString('vi-VN')}</strong></div>
            </div>
          </div>

          {/* Chọn phòng cũ */}
          <div className="doiphong-form-group">
            <label className="doiphong-label">Phòng hiện tại cần đổi <span className="required">*</span></label>
            <select
              className="doiphong-select"
              value={selectedOldRoom}
              onChange={e => {
                setSelectedOldRoom(e.target.value);
                setSelectedNewRoom('');
                setCalculatedFee(null);
                setOldRoomDetails(null);
              }}
            >
              <option value="">— Chọn phòng —</option>
              {bookingInfo.danhSachPhong?.map(phong => (
                <option key={phong.maPhong} value={phong.maPhong}>
                  Phòng {phong.soPhong} - {phong.tenLoaiPhong}
                </option>
              ))}
            </select>
          </div>

          {/* Thông tin phòng cũ */}
          {selectedOldRoom && oldRoomDetails && (
            <div className="doiphong-room-old" style={{ boxShadow: '0 4px 16px #fbbf2466', marginBottom: 28, padding: '28px 28px', borderRadius: 16, border: '2.5px solid #fbbf24', background: 'linear-gradient(135deg, #fffbe6 0%, #fde68a 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
                <span style={{ fontSize: 32, marginRight: 8, color: '#fbbf24' }}>🏨</span>
                <span style={{ fontWeight: 800, fontSize: 20, color: '#92400e', letterSpacing: 1 }}>Phòng hiện tại</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="doiphong-room-card" style={{ background: '#fff', border: '1.5px solid #fbbf24', boxShadow: '0 2px 8px #fbbf2433', padding: '18px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 18 }}>
                  <span style={{ fontSize: 22, color: '#92400e' }}>🔢</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: '#92400e' }}>Số phòng:</span>
                  <span style={{ fontWeight: 700, fontSize: 18, color: '#d97706', marginLeft: 8 }}>{oldRoomDetails.soPhong}</span>
                </div>
                <div className="doiphong-room-card" style={{ background: '#fff', border: '1.5px solid #fbbf24', boxShadow: '0 2px 8px #fbbf2433', padding: '18px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 18 }}>
                  <span style={{ fontSize: 22, color: '#92400e' }}>🏷️</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: '#92400e' }}>Loại phòng:</span>
                  <span style={{ fontWeight: 700, fontSize: 18, color: '#d97706', marginLeft: 8 }}>{oldRoomDetails.tenLoaiPhong}</span>
                </div>
                <div className="doiphong-room-card" style={{ background: '#fff', border: '1.5px solid #fbbf24', boxShadow: '0 2px 8px #fbbf2433', padding: '18px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 18 }}>
                  <span style={{ fontSize: 22, color: '#92400e' }}>🏢</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: '#92400e' }}>Tầng:</span>
                  <span style={{ fontWeight: 700, fontSize: 18, color: '#d97706', marginLeft: 8 }}>{oldRoomDetails.tenTang || 'N/A'}</span>
                </div>
                <div className="doiphong-room-card" style={{ background: '#fff', border: '1.5px solid #fbbf24', boxShadow: '0 2px 8px #fbbf2433', padding: '18px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 18 }}>
                  <span style={{ fontSize: 22, color: '#92400e' }}>💸</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: '#92400e' }}>Giá/đêm:</span>
                  <span style={{ fontWeight: 700, fontSize: 18, color: '#d97706', marginLeft: 8 }}>{(oldRoomDetails.giaMoiDem || 0).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>
          )}

          {/* Chọn phòng mới */}
          {selectedOldRoom && (
            <div className="doiphong-form-group">
              <label className="doiphong-label">Phòng mới <span className="required">*</span></label>
              <select
                className="doiphong-select"
                value={selectedNewRoom}
                onChange={e => setSelectedNewRoom(e.target.value)}
                disabled={loading}
              >
                <option value="">— Chọn phòng trống —</option>
                {availableRooms.map(phong => (
                  <option key={phong.maPhong} value={phong.maPhong}>
                    Phòng {phong.soPhong} - {phong.tenLoaiPhong || 'N/A'}
                  </option>
                ))}
              </select>
              {loading && <div className="doiphong-loading"><span className="doiphong-spinner"></span> Đang tải danh sách phòng trống...</div>}
            </div>
          )}

          {/* Thông tin phòng mới */}
          {selectedNewRoom && availableRooms.find(r => r.maPhong === parseInt(selectedNewRoom)) && (
            <div className="doiphong-room-new" style={{ boxShadow: '0 4px 16px #6ee7b766', marginBottom: 28, padding: '28px 28px', borderRadius: 16, border: '2.5px solid #6ee7b7', background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
                <span style={{ fontSize: 32, marginRight: 8, color: '#059669' }}>🆕</span>
                <span style={{ fontWeight: 800, fontSize: 20, color: '#065f46', letterSpacing: 1 }}>Phòng mới</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="doiphong-room-card" style={{ background: '#fff', border: '1.5px solid #6ee7b7', boxShadow: '0 2px 8px #6ee7b733', padding: '18px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 18 }}>
                  <span style={{ fontSize: 22, color: '#065f46' }}>🔢</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: '#065f46' }}>Số phòng:</span>
                  <span style={{ fontWeight: 700, fontSize: 18, color: '#059669', marginLeft: 8 }}>{availableRooms.find(r => r.maPhong === parseInt(selectedNewRoom)).soPhong}</span>
                </div>
                <div className="doiphong-room-card" style={{ background: '#fff', border: '1.5px solid #6ee7b7', boxShadow: '0 2px 8px #6ee7b733', padding: '18px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 18 }}>
                  <span style={{ fontSize: 22, color: '#065f46' }}>🏷️</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: '#065f46' }}>Loại phòng:</span>
                  <span style={{ fontWeight: 700, fontSize: 18, color: '#059669', marginLeft: 8 }}>{availableRooms.find(r => r.maPhong === parseInt(selectedNewRoom)).tenLoaiPhong}</span>
                </div>
                <div className="doiphong-room-card" style={{ background: '#fff', border: '1.5px solid #6ee7b7', boxShadow: '0 2px 8px #6ee7b733', padding: '18px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 18 }}>
                  <span style={{ fontSize: 22, color: '#065f46' }}>🏢</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: '#065f46' }}>Tầng:</span>
                  <span style={{ fontWeight: 700, fontSize: 18, color: '#059669', marginLeft: 8 }}>{availableRooms.find(r => r.maPhong === parseInt(selectedNewRoom)).tenTang || 'N/A'}</span>
                </div>
                <div className="doiphong-room-card" style={{ background: '#fff', border: '1.5px solid #6ee7b7', boxShadow: '0 2px 8px #6ee7b733', padding: '18px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 18 }}>
                  <span style={{ fontSize: 22, color: '#065f46' }}>💸</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: '#065f46' }}>Giá/đêm:</span>
                  <span style={{ fontWeight: 700, fontSize: 18, color: '#059669', marginLeft: 8 }}>{(availableRooms.find(r => r.maPhong === parseInt(selectedNewRoom)).giaMoiDem || 0).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>
          )}

          {/* Lý do đổi phòng */}
          <div className="doiphong-form-group">
            <label className="doiphong-label">Lý do đổi phòng <span className="optional">(tùy chọn)</span></label>
            <textarea
              className="doiphong-textarea"
              rows={3}
              placeholder="Ví dụ: Khách yêu cầu đổi phòng có view đẹp hơn..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          {/* Nút */}
          <div className="doiphong-footer">
            <button onClick={onClose} className="doiphong-btn doiphong-btn-cancel">Hủy bỏ</button>
            <button
              onClick={calculateFee}
              className="doiphong-btn doiphong-btn-primary"
              disabled={!selectedOldRoom || !selectedNewRoom || loading}
            >
              📊 Tính phí và xem chi tiết
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Xác nhận đổi phòng */}
          <div className="doiphong-confirm-card">
            <div className="doiphong-confirm-header">
              <span>✅</span>
              <h4>Xác nhận đổi phòng</h4>
            </div>
            <div className="doiphong-confirm-list">
              <div className="doiphong-confirm-item"><span>Phòng hiện tại:</span> <strong>{calculatedFee.oldRoom.soPhong} - {calculatedFee.oldRoom.tenLoaiPhong}</strong></div>
              <div className="doiphong-confirm-item"><span>Giá phòng cũ:</span> <strong>{calculatedFee.giaPhongCu.toLocaleString('vi-VN')}đ/đêm</strong></div>
              <div className="doiphong-confirm-item new-room"><span>Phòng mới:</span> <strong>{calculatedFee.newRoom.soPhong} - {calculatedFee.newRoom.tenLoaiPhong}</strong></div>
              <div className="doiphong-confirm-item"><span>Giá phòng mới:</span> <strong>{calculatedFee.giaPhongMoi.toLocaleString('vi-VN')}đ/đêm</strong></div>
              <div className="doiphong-confirm-item"><span>Số ngày còn lại:</span> <strong>{calculatedFee.soNgayConLai} ngày</strong></div>
            </div>
            <div className={`doiphong-fee-box ${calculatedFee.phiChenhLech === 0 ? 'zero' : calculatedFee.phiChenhLech > 0 ? 'positive' : 'negative'}`}> 
              <div className="doiphong-fee-content">
                <span>Phí chênh lệch:</span>
                <strong>
                  {calculatedFee.phiChenhLech === 0 ? 'Không phụ thu' : calculatedFee.phiChenhLech > 0 ? `+${calculatedFee.phiChenhLech.toLocaleString('vi-VN')}đ` : `${calculatedFee.phiChenhLech.toLocaleString('vi-VN')}đ (hoàn trả)`}
                </strong>
              </div>
            </div>
            {calculatedFee.cungLoaiPhong && (
              <div className="doiphong-alert success">✅ Đổi phòng cùng loại, không phụ thu</div>
            )}
            {!calculatedFee.cungLoaiPhong && calculatedFee.phiChenhLech > 0 && (
              <div className="doiphong-alert warning">⚠️ Khách cần thanh toán thêm {calculatedFee.phiChenhLech.toLocaleString('vi-VN')}đ cho {calculatedFee.soNgayConLai} ngày còn lại</div>
            )}
            {!calculatedFee.cungLoaiPhong && calculatedFee.phiChenhLech < 0 && (
              <div className="doiphong-alert info">💰 Hoàn trả cho khách {Math.abs(calculatedFee.phiChenhLech).toLocaleString('vi-VN')}đ</div>
            )}
            {reason && (
              <div className="doiphong-alert note"><strong>Lý do:</strong> {reason}</div>
            )}
          </div>
          <div className="doiphong-footer">
            <button onClick={() => setShowConfirm(false)} className="doiphong-btn doiphong-btn-cancel">← Quay lại</button>
            <button
              onClick={handleChangeRoom}
              className="doiphong-btn doiphong-btn-primary"
              disabled={loading}
            >
              {loading ? '⏳ Đang xử lý...' : '✓ Xác nhận đổi phòng'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}