
import { useState, useEffect } from 'react';
import '../../../styles/doiphong.css';

export default function HuyDPsauCheckin({ bookingId, onClose, onSuccess, onShowToast, bookingInfo: propBookingInfo, customStyle }) {
  const [bookingInfo, setBookingInfo] = useState(propBookingInfo || null);
  const [loading, setLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundInfo, setRefundInfo] = useState({ bank: '', account: '', owner: '' });
  const [feeInfo, setFeeInfo] = useState(null); // { phiGiu, tienHoan, message }
  const [calcLoading, setCalcLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!bookingInfo && bookingId) {
      setLoading(true);
      fetch(`/api/DatPhong/${bookingId}`, { credentials: 'include' })
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
      setCalcLoading(true);
      fetch(`/api/HuyDatPhong/KiemTraDieuKien/${bookingId}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success) setFeeInfo(data.data);
          else setError(data.message || 'Không kiểm tra được điều kiện hủy');
        })
        .catch(() => setError('Không kiểm tra được điều kiện hủy'))
        .finally(() => setCalcLoading(false));
    }
  }, [bookingId]);

  const isCheckedIn = bookingInfo?.trangThai === 'DangSuDung';

  const handleCancel = async () => {
    setSubmitLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/HuyDatPhong/YeuCauHuy/${bookingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          lyDo: cancelReason,
          nganHang: refundInfo.bank,
          soTaiKhoan: refundInfo.account,
          tenChuTK: refundInfo.owner,
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Yêu cầu hủy đã được ghi nhận. Quản lý sẽ xác nhận hoàn tiền.');
        onShowToast && onShowToast('Yêu cầu hủy đã được ghi nhận!', 'success');
        onSuccess && onSuccess();
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
      {(loading || calcLoading) ? (
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
            </div>
          )}
          <div className="doiphong-form-group">
            <label className="doiphong-label">Lý do hủy phòng</label>
            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              rows={2}
              className="doiphong-textarea"
              disabled={!isCheckedIn}
            />
          </div>
          <div className="doiphong-label" style={{ marginBottom: 8 }}>Thông tin tài khoản nhận hoàn tiền (nếu có):</div>
          <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <input
              type="text"
              placeholder="Ngân hàng"
              value={refundInfo.bank}
              onChange={e => setRefundInfo({ ...refundInfo, bank: e.target.value })}
              className="doiphong-select"
              style={{ marginBottom: 4, fontSize: '1rem', padding: 10 }}
              disabled={!isCheckedIn}
            />
            <input
              type="text"
              placeholder="Số tài khoản"
              value={refundInfo.account}
              onChange={e => setRefundInfo({ ...refundInfo, account: e.target.value })}
              className="doiphong-select"
              style={{ marginBottom: 4, fontSize: '1rem', padding: 10 }}
              disabled={!isCheckedIn}
            />
            <input
              type="text"
              placeholder="Tên chủ tài khoản"
              value={refundInfo.owner}
              onChange={e => setRefundInfo({ ...refundInfo, owner: e.target.value })}
              className="doiphong-select"
              style={{ marginBottom: 4, fontSize: '1rem', padding: 10 }}
              disabled={!isCheckedIn}
            />
          </div>
          {error && <div style={{ background: '#fff1f0', color: '#cf1322', padding: 12, borderRadius: 4, marginBottom: 8, border: '1px solid #ffa39e', fontSize: '1rem' }}>{error}</div>}
          {successMsg && <div style={{ background: '#f6ffed', color: '#389e0d', padding: 12, borderRadius: 4, marginBottom: 8, border: '1px solid #b7eb8f', fontSize: '1rem' }}>{successMsg}</div>}
          <div className="doiphong-footer" style={{ marginTop: 12, background: 'transparent', borderTop: 'none', padding: 0, gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} className="doiphong-btn doiphong-btn-cancel">Đóng</button>
            <button
              onClick={handleCancel}
              className="doiphong-btn doiphong-btn-primary"
              disabled={!isCheckedIn || submitLoading}
              style={{ opacity: !isCheckedIn || submitLoading ? 0.7 : 1 }}
            >
              {submitLoading ? 'Đang gửi...' : 'Gửi yêu cầu hủy'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

