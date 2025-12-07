import React from 'react';

export default function ThanhToanStep({
  customerInfo,
  bookingInfo,
  selectedRooms,
  availableRooms,
  paymentInfo,
  totalAmount,
  handlePaymentChange,
}) {
  return (
    <div className="booking-form-step">
      <div className="booking-section">
        <h4 className="booking-section-title">
          <span className="booking-section-icon">💳</span>
          Thanh toán
        </h4>

        <div className="booking-payment-option">
          <label className="booking-checkbox-label">
            <input
              type="checkbox"
              name="thanhToanNgay"
              checked={paymentInfo.thanhToanNgay}
              onChange={handlePaymentChange}
            />
            <span>Thanh toán ngay</span>
          </label>
        </div>

        {paymentInfo.thanhToanNgay && (
          <div className="booking-form-grid">
            <div className="booking-form-group">
              <label className="booking-label required">Số tiền thanh toán</label>
              <input
                type="number"
                name="soTienThanhToan"
                className="booking-input"
                placeholder="0"
                value={paymentInfo.soTienThanhToan}
                onChange={handlePaymentChange}
                min={0}
                max={totalAmount}
              />
              <small className="booking-input-hint">
                Tối đa: {totalAmount.toLocaleString('vi-VN')}đ
              </small>
            </div>

            <div className="booking-form-group">
              <label className="booking-label required">Phương thức</label>
              <select
                name="phuongThucThanhToan"
                className="booking-input"
                value={paymentInfo.phuongThucThanhToan}
                onChange={handlePaymentChange}
              >
                <option value="TienMat">💵 Tiền mặt</option>
                <option value="ChuyenKhoan">🏦 Chuyển khoản</option>
                <option value="TheATM">💳 Thẻ ATM</option>
              </select>
            </div>

            <div className="booking-payment-summary booking-full-width">
              <div className="booking-payment-row">
                <span>Tổng tiền:</span>
                <span>{totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="booking-payment-row">
                <span>Đã thanh toán:</span>
                <span className="text-success">
                  -{parseFloat(paymentInfo.soTienThanhToan || 0).toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="booking-payment-row booking-payment-remaining">
                <span>Còn lại:</span>
                <span>
                  {(totalAmount - (parseFloat(paymentInfo.soTienThanhToan) || 0)).toLocaleString(
                    'vi-VN'
                  )}
                  đ
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tóm tắt */}
      <div className="booking-section">
        <h4 className="booking-section-title">
          <span className="booking-section-icon">📝</span>
          Tóm tắt đặt phòng
        </h4>
        <div className="booking-review">
          <div className="booking-review-row">
            <span className="booking-review-label">👤 Khách hàng:</span>
            <span className="booking-review-value">
              {customerInfo.hoTen} - {customerInfo.soDienThoai}
            </span>
          </div>
          <div className="booking-review-row">
            <span className="booking-review-label">📧 Email:</span>
            <span className="booking-review-value">{customerInfo.email || '—'}</span>
          </div>
          <div className="booking-review-row">
            <span className="booking-review-label">🔑 Nhận phòng:</span>
            <span className="booking-review-value">
              {new Date(bookingInfo.ngayNhanPhong).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <div className="booking-review-row">
            <span className="booking-review-label">🚪 Trả phòng:</span>
            <span className="booking-review-value">
              {new Date(bookingInfo.ngayTraPhong).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <div className="booking-review-row">
            <span className="booking-review-label">🏨 Số phòng:</span>
            <span className="booking-review-value">{selectedRooms.length} phòng</span>
          </div>
          <div className="booking-review-row">
            <span className="booking-review-label">🏨 Danh sách phòng:</span>
            <span className="booking-review-value">
              {selectedRooms
                .map((sr) => {
                  const room = availableRooms.find((r) => r.maPhong === sr.maPhong);
                  return room?.soPhong;
                })
                .join(', ')}
            </span>
          </div>
          <div className="booking-review-row booking-review-total">
            <span className="booking-review-label">💰 Tổng tiền:</span>
            <span className="booking-review-value">
              {totalAmount.toLocaleString('vi-VN')}đ
            </span>
          </div>
          {paymentInfo.thanhToanNgay && (
            <div className="booking-review-row">
              <span className="booking-review-label">✅ Thanh toán:</span>
              <span className="booking-review-value">
                {parseFloat(paymentInfo.soTienThanhToan || 0).toLocaleString('vi-VN')}đ (
                {paymentInfo.phuongThucThanhToan})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}