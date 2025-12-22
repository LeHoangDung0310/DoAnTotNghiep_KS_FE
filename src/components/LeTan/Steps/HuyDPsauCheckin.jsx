

import { useState, useEffect } from 'react';
const API_BASE = process.env.REACT_APP_API_BASE_URL || '';
import '../../../styles/doiphong.css';

export default function HuyDPsauCheckin({ bookingId, onClose, onSuccess, onShowToast, bookingInfo: propBookingInfo, customStyle }) {
  const [bookingInfo, setBookingInfo] = useState(propBookingInfo || null);
  const [loading, setLoading] = useState(false);
  const [feeInfo, setFeeInfo] = useState(null); // { phiGiu, tienHoan, khachHang, phongList }
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');


  useEffect(() => {
    if (!bookingInfo && bookingId) {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      fetch(`${API_BASE}/api/DatPhong/${bookingId}`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
        .then(res => res.json())
        .then(data => {
          setBookingInfo(data.data || null);
        })
        .catch(() => setError('Không lấy được thông tin đặt phòng'))
        .finally(() => setLoading(false));
    }
  }, [bookingId, bookingInfo]);


  useEffect(() => {
    if (bookingId) {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      fetch(`${API_BASE}/api/HuyDatPhong/KiemTraDieuKien/${bookingId}`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setFeeInfo(data.data);
          else setError(data.message || 'Không kiểm tra được điều kiện hủy');
        })
        .catch(() => setError('Không kiểm tra được điều kiện hủy'))
        .finally(() => setLoading(false));
    }
  }, [bookingId]);


  const isCheckedIn = bookingInfo?.trangThai === 'DangSuDung';


  const handleCancel = async () => {
    setSubmitLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const apiUrl = `${API_BASE}/api/HuyDatPhong/HuySauCheckIn/${bookingId}`;
      const token = localStorage.getItem('access_token');
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Hủy thành công!');
        onShowToast && onShowToast('Hủy thành công!', 'success');
        onSuccess && onSuccess();
        // Lưu lại thông tin trả về từ BE (bao gồm phí, khách, phòng)
        if (data.data) setFeeInfo(data.data);
      } else {
        setError(data.message || 'Có lỗi xảy ra khi gửi yêu cầu hủy');
      }
    } catch (e) {
      setError('Có lỗi xảy ra khi gửi yêu cầu hủy');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="doiphong-body" style={{ maxWidth: 500, margin: '0 auto', background: 'transparent', boxShadow: 'none', padding: 0 }}>
      <h3 style={{ fontSize: '1.18rem', fontWeight: 700, marginBottom: 18, color: '#d32f2f' }}>Hủy đặt phòng sau check-in</h3>
      {!isCheckedIn && (
        <div style={{ background: '#fffbe6', color: '#ad8b00', padding: 12, borderRadius: 4, marginBottom: 16, border: '1px solid #ffe58f', fontSize: '1rem' }}>
          Chỉ có thể hủy khi khách đã check-in.
        </div>
      )}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24, color: '#1976d2', fontWeight: 500 }}>Đang tải...</div>
      ) : (
        <>
          {bookingInfo && (
            <div style={{ marginBottom: 16, fontSize: '1rem', background: '#f8f9fa', borderRadius: 8, padding: 12, border: '1px solid #e3e3e3' }}>
              <div><b>Khách hàng:</b> {bookingInfo.tenKhachHang || bookingInfo.khachHang?.hoTen}</div>
              <div><b>Ngày nhận phòng:</b> {bookingInfo.ngayNhanPhong}</div>
              <div><b>Ngày trả phòng:</b> {bookingInfo.ngayTraPhong}</div>
              <div><b>Trạng thái:</b> {bookingInfo.trangThai}</div>
            </div>
          )}
          {feeInfo && (
            <div style={{ marginBottom: 16, background: '#e6f7ff', color: '#0050b3', padding: 12, borderRadius: 4, border: '1px solid #91d5ff', fontSize: '1rem' }}>
              <div>Khách sạn sẽ thu <b>100% tiền phòng ngày đầu tiên</b>. Các ngày còn lại sẽ được hoàn lại.</div>
              <div><b>Phí giữ lại:</b> {feeInfo.phiGiu?.toLocaleString()} VND</div>
              <div><b>Số tiền hoàn lại:</b> {feeInfo.tienHoan?.toLocaleString()} VND</div>
              {feeInfo.khachHang && (
                <div style={{ marginTop: 8 }}>
                  <b>Khách hàng:</b> {feeInfo.khachHang.ten} ({feeInfo.khachHang.sdt})
                </div>
              )}
              {feeInfo.phongList && Array.isArray(feeInfo.phongList) && feeInfo.phongList.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <b>Phòng:</b> {feeInfo.phongList.map((p, idx) => (
                    <span key={idx}>{p.soPhong} ({p.loaiPhong}){idx < feeInfo.phongList.length - 1 ? ', ' : ''}</span>
                  ))}
                </div>
              )}
            </div>
          )}
          {error && <div style={{ background: '#fff1f0', color: '#cf1322', padding: 12, borderRadius: 4, marginBottom: 8, border: '1px solid #ffa39e', fontSize: '1rem' }}>{error}</div>}
          {successMsg && <div style={{ background: '#f6ffed', color: '#389e0d', padding: 12, borderRadius: 4, marginBottom: 8, border: '1px solid #b7eb8f', fontSize: '1rem' }}>{successMsg}</div>}
          <div className="doiphong-footer" style={{ marginTop: 12, background: 'transparent', borderTop: 'none', padding: 0, gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} className="doiphong-btn doiphong-btn-cancel">Đóng</button>
            <button
              onClick={handleCancel}
              className="doiphong-btn doiphong-btn-primary"
              disabled={submitLoading || !isCheckedIn}
              style={{ opacity: submitLoading || !isCheckedIn ? 0.7 : 1 }}
            >
              {submitLoading ? 'Đang gửi...' : 'Hủy đặt phòng & hoàn tiền'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

