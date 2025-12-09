import React from 'react';

export default function ThongTinKhachHangStep({
  customerInfo,
  bookingInfo,
  provinces,
  districts,
  wards,
  handleCustomerChange,
  handleBookingChange,
}) {
  return (
    <div className="booking-form-step">
      {/* Thông tin khách hàng */}
      <div className="booking-section">
        <h4 className="booking-section-title">
          <span className="booking-section-icon">👤</span>
          Thông tin khách hàng
        </h4>
        <div className="booking-form-grid">
          <div className="booking-form-group">
            <label className="booking-label required">Họ và tên</label>
            <input
              type="text"
              name="hoTen"
              className="booking-input"
              placeholder="Nguyễn Văn A"
              value={customerInfo.hoTen}
              onChange={handleCustomerChange}
            />
          </div>

          <div className="booking-form-group">
            <label className="booking-label required">Số điện thoại</label>
            <input
              type="tel"
              name="soDienThoai"
              className="booking-input"
              placeholder="0901234567"
              value={customerInfo.soDienThoai}
              onChange={handleCustomerChange}
            />
          </div>

          <div className="booking-form-group">
            <label className="booking-label">Email</label>
            <input
              type="email"
              name="email"
              className="booking-input"
              placeholder="email@example.com"
              value={customerInfo.email}
              onChange={handleCustomerChange}
            />
          </div>

          <div className="booking-form-group">
            <label className="booking-label required">Số CCCD/CMND</label>
            <input
              type="text"
              name="soCCCD"
              className="booking-input"
              placeholder="001234567890"
              value={customerInfo.soCCCD}
              onChange={handleCustomerChange}
            />
          </div>

          <div className="booking-form-group">
            <label className="booking-label">Ngày cấp</label>
            <input
              type="date"
              name="ngayCapCCCD"
              className="booking-input"
              value={customerInfo.ngayCapCCCD}
              onChange={handleCustomerChange}
            />
          </div>

          <div className="booking-form-group">
            <label className="booking-label">Nơi cấp</label>
            <input
              type="text"
              name="noiCapCCCD"
              className="booking-input"
              placeholder="Cục Cảnh sát..."
              value={customerInfo.noiCapCCCD}
              onChange={handleCustomerChange}
            />
          </div>

          <div className="booking-form-group">
            <label className="booking-label">Ngày sinh</label>
            <input
              type="date"
              name="ngaySinh"
              className="booking-input"
              value={customerInfo.ngaySinh}
              onChange={handleCustomerChange}
            />
          </div>

          <div className="booking-form-group">
            <label className="booking-label">Giới tính</label>
            <select
              name="gioiTinh"
              className="booking-input"
              value={customerInfo.gioiTinh}
              onChange={handleCustomerChange}
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>
      </div>

      {/* Địa chỉ */}
      <div className="booking-section">
        <h4 className="booking-section-title">
          <span className="booking-section-icon">📍</span>
          Địa chỉ
        </h4>
        <div className="booking-form-grid">
          <div className="booking-form-group">
            <label className="booking-label">Tỉnh/Thành phố</label>
            <select
              name="maTinh"
              className="booking-input"
              value={customerInfo.maTinh}
              onChange={handleCustomerChange}
            >
              <option value="">-- Chọn tỉnh/thành phố --</option>
              {provinces.map((t) => (
                <option key={t.maTinh} value={t.maTinh}>
                  {t.tenTinh}
                </option>
              ))}
            </select>
          </div>

          <div className="booking-form-group">
            <label className="booking-label">Quận/Huyện</label>
            <select
              name="maHuyen"
              className="booking-input"
              value={customerInfo.maHuyen}
              onChange={handleCustomerChange}
              disabled={!customerInfo.maTinh}
            >
              <option value="">-- Chọn quận/huyện --</option>
              {districts.map((h) => (
                <option key={h.maHuyen} value={h.maHuyen}>
                  {h.tenHuyen}
                </option>
              ))}
            </select>
          </div>

          <div className="booking-form-group">
            <label className="booking-label">Phường/Xã</label>
            <select
              name="maPhuongXa"
              className="booking-input"
              value={customerInfo.maPhuongXa}
              onChange={handleCustomerChange}
              disabled={!customerInfo.maHuyen}
            >
              <option value="">-- Chọn phường/xã --</option>
              {wards.map((x) => (
                <option key={x.maPhuongXa} value={x.maPhuongXa}>
                  {x.tenPhuongXa}
                </option>
              ))}
            </select>
          </div>

          <div className="booking-form-group booking-full-width">
            <label className="booking-label">Địa chỉ chi tiết</label>
            <input
              type="text"
              name="diaChiChiTiet"
              className="booking-input"
              placeholder="Số nhà, tên đường..."
              value={customerInfo.diaChiChiTiet}
              onChange={handleCustomerChange}
            />
          </div>
        </div>
      </div>

      {/* Thông tin đặt phòng */}
      <div className="booking-section">
        <h4 className="booking-section-title">
          <span className="booking-section-icon">📅</span>
          Thời gian đặt phòng
        </h4>
        <div className="booking-form-grid">
          <div className="booking-form-group">
            <label className="booking-label required">Ngày nhận phòng</label>
            <input
              type="date"
              name="ngayNhanPhong"
              className="booking-input"
              value={bookingInfo.ngayNhanPhong}
              onChange={handleBookingChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="booking-form-group">
            <label className="booking-label required">Ngày trả phòng</label>
            <input
              type="date"
              name="ngayTraPhong"
              className="booking-input"
              value={bookingInfo.ngayTraPhong}
              onChange={handleBookingChange}
              min={bookingInfo.ngayNhanPhong || new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="booking-form-group booking-full-width">
            <label className="booking-label">Ghi chú</label>
            <textarea
              name="ghiChu"
              className="booking-input"
              rows={3}
              placeholder="Yêu cầu đặc biệt (nếu có)..."
              value={bookingInfo.ghiChu}
              onChange={handleBookingChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}