import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import '../../../styles/doiphong.css';

export default function DoiPhongStep({ bookingId, onClose, onSuccess, onShowToast, customStyle }) {
    const [loading, setLoading] = useState(false);
    const [bookingInfo, setBookingInfo] = useState(null);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [selectedOldRoom, setSelectedOldRoom] = useState('');
    const [selectedNewRoom, setSelectedNewRoom] = useState('');
    const [reason, setReason] = useState('');
    const [calculatedFee, setCalculatedFee] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [oldRoomDetails, setOldRoomDetails] = useState(null);

    useEffect(() => { fetchBookingInfo(); }, [bookingId]);

    useEffect(() => {
        if (selectedOldRoom) {
            fetchAvailableRooms();
            fetchOldRoomDetails();
        }
    }, [selectedOldRoom]);

    const fetchOldRoomDetails = async () => {
        try {
            const res = await api.get(`/api/Phong/${selectedOldRoom}`);
            if (res.data.success) setOldRoomDetails(res.data.data);
        } catch (err) { console.error('Lỗi tải phòng:', err); }
    };

    const fetchBookingInfo = async () => {
        try {
            const res = await api.get(`/api/DatPhong/${bookingId}`);
            if (res.data.success) setBookingInfo(res.data.data);
        } catch (err) {
            onShowToast('error', 'Lỗi khi tải thông tin đặt phòng');
        }
    };

    const fetchAvailableRooms = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/Phong/PhongTrong', {
                params: { ngayNhanPhong: bookingInfo.ngayNhanPhong, ngayTraPhong: bookingInfo.ngayTraPhong }
            });
            if (res.data.success) setAvailableRooms(res.data.data || []);
        } catch (err) {
            onShowToast('error', 'Lỗi tải phòng trống');
        } finally { setLoading(false); }
    };

    const handleCalculate = () => {
        const oldRoom = bookingInfo.danhSachPhong.find(p => p.maPhong === parseInt(selectedOldRoom));
        const newRoom = availableRooms.find(r => r.maPhong === parseInt(selectedNewRoom));
        if (!oldRoom || !newRoom) return;

        const soNgay = Math.ceil((new Date(bookingInfo.ngayTraPhong) - new Date()) / (1000 * 60 * 60 * 24));
        const phi = (newRoom.giaMoiDem - oldRoom.giaPhong) * soNgay;

        setCalculatedFee({ oldRoom, newRoom, soNgay, phi, giaCu: oldRoom.giaPhong, giaMoi: newRoom.giaMoiDem });
        setShowConfirm(true);
    };

    const handleChangeRoom = async () => {
        try {
            setLoading(true);
            const res = await api.put(`/api/DatPhong/${bookingId}/DoiPhong`, {
                maPhongCu: parseInt(selectedOldRoom),
                maPhongMoi: parseInt(selectedNewRoom),
                lyDo: reason
            });
            if (res.data.success) {
                onShowToast('success', 'Đổi phòng thành công');
                onSuccess(); onClose();
            }
        } catch (err) {
            onShowToast('error', err.response?.data?.message || 'Lỗi đổi phòng');
        } finally { setLoading(false); }
    };

    if (!bookingInfo) return <div className="dp-loading-state">Đang tải dữ liệu...</div>;

    return (
        <div className={`doiphong-container ${customStyle ? 'custom-modal' : ''}`}>
            <header className="dp-header">
                <h3>Đổi phòng</h3>
                <p>Mã đặt phòng: #{bookingId}</p>
            </header>

            {!showConfirm ? (
                <div className="dp-step-content animate-fade-in">
                    {/* Customer Info Card */}
                    <div className="dp-customer-card">
                        <div className="dp-badge">Khách hàng</div>
                        <h4>{bookingInfo.tenKhachHang}</h4>
                        <div className="dp-meta">
                            <span>📅 Ngày trả: <b>{new Date(bookingInfo.ngayTraPhong).toLocaleDateString('vi-VN')}</b></span>
                        </div>
                    </div>

                    <div className="dp-form-grid">
                        {/* Select Old Room */}
                        <div className="dp-field">
                            <label>Chọn phòng hiện tại cần đổi</label>
                            <select value={selectedOldRoom} onChange={e => setSelectedOldRoom(e.target.value)}>
                                <option value="">— Chọn phòng —</option>
                                {bookingInfo.danhSachPhong?.map(p => (
                                    <option key={p.maPhong} value={p.maPhong}>Phòng {p.soPhong} ({p.tenLoaiPhong})</option>
                                ))}
                            </select>
                        </div>

                        {/* Select New Room */}
                        {selectedOldRoom && (
                            <div className="dp-field animate-slide-up">
                                <label>Chọn phòng mới trống</label>
                                <select value={selectedNewRoom} onChange={e => setSelectedNewRoom(e.target.value)} disabled={loading}>
                                    <option value="">— {loading ? 'Đang tải...' : 'Chọn phòng trống'} —</option>
                                    {availableRooms.map(r => (
                                        <option key={r.maPhong} value={r.maPhong}>Phòng {r.soPhong} - {r.tenLoaiPhong}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Quick Comparison Card */}
                    {selectedOldRoom && oldRoomDetails && (
                        <div className="dp-comparison-preview animate-scale-in">
                            <div className="dp-room-mini current">
                                <small>Hiện tại</small>
                                <strong>P.{oldRoomDetails.soPhong}</strong>
                                <span>{oldRoomDetails.giaMoiDem?.toLocaleString()}đ</span>
                            </div>
                            <div className="dp-arrow">➔</div>
                            <div className={`dp-room-mini next ${selectedNewRoom ? 'active' : ''}`}>
                                <small>Phòng mới</small>
                                {selectedNewRoom ? (
                                    <>
                                        <strong>P.{availableRooms.find(r => r.maPhong === parseInt(selectedNewRoom))?.soPhong}</strong>
                                        <span>{availableRooms.find(r => r.maPhong === parseInt(selectedNewRoom))?.giaMoiDem?.toLocaleString()}đ</span>
                                    </>
                                ) : <span>Chưa chọn</span>}
                            </div>
                        </div>
                    )}

                    <div className="dp-field">
                        <label>Lý do đổi phòng (tùy chọn)</label>
                        <textarea placeholder="Nhập lý do khách đổi phòng..." value={reason} onChange={e => setReason(e.target.value)} />
                    </div>

                    <footer className="dp-footer">
                        <button className="btn-secondary" onClick={onClose}>Hủy bỏ</button>
                        <button className="btn-primary" disabled={!selectedNewRoom} onClick={handleCalculate}>Tiếp tục</button>
                    </footer>
                </div>
            ) : (
                <div className="dp-confirm-step animate-slide-right">
                    <div className="dp-summary-card">
                        <div className="dp-summary-row header">
                            <span>Nội dung</span>
                            <span>Chi tiết</span>
                        </div>
                        <div className="dp-summary-row">
                            <span>Phòng:</span>
                            <span className="dp-transfer-text">{calculatedFee.oldRoom.soPhong} ➔ {calculatedFee.newRoom.soPhong}</span>
                        </div>
                        <div className="dp-summary-row">
                            <span>Chênh lệch/đêm:</span>
                            <span>{(calculatedFee.giaMoi - calculatedFee.giaCu).toLocaleString()}đ</span>
                        </div>
                        <div className="dp-summary-row total">
                            <span>Tổng phí đổi:</span>
                            <strong className={calculatedFee.phi >= 0 ? 'text-danger' : 'text-success'}>
                                {calculatedFee.phi === 0 ? 'Miễn phí' : `${calculatedFee.phi.toLocaleString()}đ`}
                            </strong>
                        </div>
                    </div>

                    <div className="dp-notice">
                        {calculatedFee.phi > 0 ? (
                            <p className="warn">⚠️ Cần thu thêm tiền từ khách hàng.</p>
                        ) : calculatedFee.phi < 0 ? (
                            <p className="info">💰 Khách hàng sẽ dư tiền (hoàn trả hoặc trừ vào dịch vụ khác).</p>
                        ) : (
                            <p className="success">✅ Đổi phòng cùng giá hoặc cùng loại.</p>
                        )}
                    </div>

                    <footer className="dp-footer">
                        <button className="btn-secondary" onClick={() => setShowConfirm(false)}>Quay lại</button>
                        <button className="btn-success" onClick={handleChangeRoom} disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Xác nhận đổi phòng'}
                        </button>
                    </footer>
                </div>
            )}
        </div>
    );
}