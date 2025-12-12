import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import '../../../styles/modal.css';
import '../../../styles/doiphong.css';

export default function DoiPhongStep({ bookingId, onClose, onSuccess, onShowToast }) {
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
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-loading">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container doiphong-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header-gradient">
          <div className="modal-header-content">
            <div className="modal-icon">🔄</div>
            <div>
              <h3 className="modal-title-large">Đổi phòng</h3>
              <p className="modal-subtitle">
                Mã đặt phòng #{bookingId}
              </p>
            </div>
          </div>
          <button className="modal-close-btn doiphong-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body doiphong-body">
          {!showConfirm ? (
            <>
              {/* Thông tin booking */}
              <div className="doiphong-info-card">
                <div className="doiphong-info-header">
                  <span>💼</span>
                  <h4>Thông tin đặt phòng</h4>
                </div>
                <div className="doiphong-info-grid">
                  <div className="doiphong-info-item">
                    <span>👤</span>
                    <div>
                      <div className="label">Khách hàng</div>
                      <strong>{bookingInfo.tenKhachHang}</strong>
                    </div>
                  </div>
                  <div className="doiphong-info-item">
                    <span>📅</span>
                    <div>
                      <div className="label">Ngày trả phòng</div>
                      <strong>{new Date(bookingInfo.ngayTraPhong).toLocaleDateString('vi-VN')}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chọn phòng cũ */}
              <div className="doiphong-form-group">
                <label className="doiphong-label">
                  <span>🏨</span>
                  Chọn phòng hiện tại cần đổi
                  <span className="required">*</span>
                </label>
                <select
                  className="doiphong-select"
                  value={selectedOldRoom}
                  onChange={(e) => {
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

              {/* Hiển thị thông tin chi tiết phòng cũ */}
              {selectedOldRoom && oldRoomDetails && (
                <div className="doiphong-room-old">
                  <div className="doiphong-room-header">
                    <span>📍</span>
                    <span>Thông tin phòng hiện tại</span>
                  </div>
                  <div className="doiphong-room-grid">
                    <div className="doiphong-room-card">
                      <div className="doiphong-room-card-content">
                        <span>🏢</span>
                        <div>
                          <div className="doiphong-room-card-label">Tầng</div>
                          <strong className="doiphong-room-card-value">
                            {oldRoomDetails.tenTang || 'N/A'}
                          </strong>
                        </div>
                      </div>
                    </div>
                    <div className="doiphong-room-card">
                      <div className="doiphong-room-card-content">
                        <span>💰</span>
                        <div>
                          <div className="doiphong-room-card-label">Giá/đêm</div>
                          <strong className="doiphong-room-card-value price">
                            {(oldRoomDetails.giaMoiDem || 0).toLocaleString('vi-VN')}đ
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chọn phòng mới */}
              {selectedOldRoom && (
                <>
                  <div className="doiphong-form-group">
                    <label className="doiphong-label">
                      <span>🆕</span>
                      Chọn phòng mới
                      <span className="required">*</span>
                    </label>
                    <select
                      className="doiphong-select"
                      value={selectedNewRoom}
                      onChange={(e) => setSelectedNewRoom(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">— Chọn phòng trống —</option>
                      {availableRooms.map(phong => (
                        <option key={phong.maPhong} value={phong.maPhong}>
                          Phòng {phong.soPhong} - {phong.tenLoaiPhong || 'N/A'}
                        </option>
                      ))}
                    </select>
                    {loading && (
                      <div className="doiphong-loading">
                        <span className="doiphong-spinner"></span>
                        Đang tải danh sách phòng trống...
                      </div>
                    )}
                  </div>

                  {/* Hiển thị thông tin chi tiết phòng mới */}
                  {selectedNewRoom && availableRooms.find(r => r.maPhong === parseInt(selectedNewRoom)) && (
                    <div className="doiphong-room-new">
                      <div className="doiphong-room-header">
                        <span>✨</span>
                        <span>Thông tin phòng mới</span>
                      </div>
                      <div className="doiphong-room-grid">
                        <div className="doiphong-room-card">
                          <div className="doiphong-room-card-content">
                            <span>🏢</span>
                            <div>
                              <div className="doiphong-room-card-label">Tầng</div>
                              <strong className="doiphong-room-card-value">
                                {availableRooms.find(r => r.maPhong === parseInt(selectedNewRoom)).tenTang || 'N/A'}
                              </strong>
                            </div>
                          </div>
                        </div>
                        <div className="doiphong-room-card">
                          <div className="doiphong-room-card-content">
                            <span>💰</span>
                            <div>
                              <div className="doiphong-room-card-label">Giá/đêm</div>
                              <strong className="doiphong-room-card-value price">
                                {(availableRooms.find(r => r.maPhong === parseInt(selectedNewRoom)).giaMoiDem || 0).toLocaleString('vi-VN')}đ
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Lý do */}
              <div className="doiphong-form-group" style={{ marginBottom: 0 }}>
                <label className="doiphong-label">
                  <span>📝</span>
                  Lý do đổi phòng
                  <span className="optional">(tùy chọn)</span>
                </label>
                <textarea
                  className="doiphong-textarea"
                  rows="3"
                  placeholder="Ví dụ: Khách yêu cầu đổi phòng có view đẹp hơn..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              {/* Xác nhận đổi phòng */}
              <div className="doiphong-confirm-card">
                <div className="doiphong-confirm-header">
                  <span>📋</span>
                  <h4>Thông tin đổi phòng</h4>
                </div>
                
                <div className="doiphong-confirm-list">
                  <div className="doiphong-confirm-item">
                    <span>🏨 Phòng hiện tại:</span>
                    <strong>Phòng {calculatedFee.oldRoom.soPhong} - {calculatedFee.oldRoom.tenLoaiPhong}</strong>
                  </div>
                  <div className="doiphong-confirm-item">
                    <span>💰 Giá phòng cũ:</span>
                    <strong>{calculatedFee.giaPhongCu.toLocaleString('vi-VN')}đ/đêm</strong>
                  </div>
                  <div className="doiphong-confirm-item new-room">
                    <span>🆕 Phòng mới:</span>
                    <strong>Phòng {calculatedFee.newRoom.soPhong} - {calculatedFee.newRoom.tenLoaiPhong}</strong>
                  </div>
                  <div className="doiphong-confirm-item new-room">
                    <span>💵 Giá phòng mới:</span>
                    <strong>{calculatedFee.giaPhongMoi.toLocaleString('vi-VN')}đ/đêm</strong>
                  </div>
                  <div className="doiphong-confirm-item">
                    <span>📅 Số ngày còn lại:</span>
                    <strong>{calculatedFee.soNgayConLai} ngày</strong>
                  </div>
                </div>

                <div className={`doiphong-fee-box ${
                  calculatedFee.phiChenhLech === 0 ? 'zero' : 
                  calculatedFee.phiChenhLech > 0 ? 'positive' : 'negative'
                }`}>
                  <div className="doiphong-fee-content">
                    <span>💳 Phí chênh lệch:</span>
                    <strong>
                      {calculatedFee.phiChenhLech === 0 
                        ? 'Không phụ thu' 
                        : calculatedFee.phiChenhLech > 0
                          ? `+${calculatedFee.phiChenhLech.toLocaleString('vi-VN')}đ`
                          : `${calculatedFee.phiChenhLech.toLocaleString('vi-VN')}đ (hoàn trả)`
                      }
                    </strong>
                  </div>
                </div>

                {calculatedFee.cungLoaiPhong && (
                  <div className="doiphong-alert success">
                    ✅ Đổi phòng cùng loại, không phụ thu
                  </div>
                )}
                {!calculatedFee.cungLoaiPhong && calculatedFee.phiChenhLech > 0 && (
                  <div className="doiphong-alert warning">
                    ⚠️ Khách cần thanh toán thêm {calculatedFee.phiChenhLech.toLocaleString('vi-VN')}đ cho {calculatedFee.soNgayConLai} ngày còn lại
                  </div>
                )}
                {!calculatedFee.cungLoaiPhong && calculatedFee.phiChenhLech < 0 && (
                  <div className="doiphong-alert info">
                    💰 Hoàn trả cho khách {Math.abs(calculatedFee.phiChenhLech).toLocaleString('vi-VN')}đ
                  </div>
                )}

                {reason && (
                  <div className="doiphong-alert note">
                    <strong>Lý do:</strong> {reason}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="modal-footer doiphong-footer">
          {!showConfirm ? (
            <>
              <button 
                className="doiphong-btn doiphong-btn-cancel" 
                onClick={onClose}
              >
                Hủy bỏ
              </button>
              <button
                className="doiphong-btn doiphong-btn-primary"
                onClick={calculateFee}
                disabled={!selectedOldRoom || !selectedNewRoom || loading}
              >
                📊 Tính phí và xem chi tiết
              </button>
            </>
          ) : (
            <>
              <button 
                className="doiphong-btn doiphong-btn-cancel" 
                onClick={() => setShowConfirm(false)}
              >
                ← Quay lại
              </button>
              <button
                className="doiphong-btn doiphong-btn-primary"
                onClick={handleChangeRoom}
                disabled={loading}
              >
                {loading ? '⏳ Đang xử lý...' : '✓ Xác nhận đổi phòng'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
