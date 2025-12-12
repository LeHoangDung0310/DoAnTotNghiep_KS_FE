import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import ThongTinKhachHangStep from './Steps/ThongTinKhachHangStep';
import ChonPhongStep from './Steps/ChonPhongStep';
import ThanhToanStep from './Steps/ThanhToanStep';

export default function TaoDatPhongTrucTiep({ onClose, onSuccess, onShowToast }) {
  const [step, setStep] = useState(1);

  // ✅ Form data - Customer Info
  const [customerInfo, setCustomerInfo] = useState({
    hoTen: '',
    soDienThoai: '',
    email: '',
    soCCCD: '',
    ngayCapCCCD: '',
    noiCapCCCD: '',
    ngaySinh: '',
    gioiTinh: '',
    diaChiChiTiet: '',
    maTinh: '',
    maHuyen: '',
    maPhuongXa: '',
  });

  // ✅ Booking Info
  const [bookingInfo, setBookingInfo] = useState({
    ngayNhanPhong: '',
    ngayTraPhong: '',
    ghiChu: '',
  });

  // ✅ Payment Info
  const [paymentInfo, setPaymentInfo] = useState({
    thanhToanNgay: false,
    soTienThanhToan: '',
    phuongThucThanhToan: 'TienMat',
  });

  // ✅ Room Selection
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);

  // ✅ Address Data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // ✅ UI State
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [numberOfDays, setNumberOfDays] = useState(0);

  // ✅ Filter States
  const [roomFilters, setRoomFilters] = useState({
    loaiPhong: '',
    giaMin: '',
    giaMax: '',
    soNguoi: '',
    searchTerm: '',
  });

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (bookingInfo.ngayNhanPhong && bookingInfo.ngayTraPhong) {
      const checkin = new Date(bookingInfo.ngayNhanPhong);
      const checkout = new Date(bookingInfo.ngayTraPhong);
      
      // Validate date range before calculating
      if (checkout <= checkin) {
        setNumberOfDays(0);
        setAvailableRooms([]);
        setFilteredRooms([]);
        return;
      }

      const days = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
      setNumberOfDays(days);
      fetchAvailableRooms();
    } else {
      setNumberOfDays(0);
      setAvailableRooms([]);
      setFilteredRooms([]);
    }
  }, [bookingInfo.ngayNhanPhong, bookingInfo.ngayTraPhong]);

  useEffect(() => {
    calculateTotal();
  }, [selectedRooms, numberOfDays]);

  useEffect(() => {
    applyFilters();
  }, [roomFilters, availableRooms]);

  // Fetch địa chỉ từ API
  const fetchProvinces = async () => {
    try {
      const res = await api.get('/api/DiaChi/Tinh');
      setProvinces(res.data.data || []);
    } catch (err) {
      console.error('Lỗi khi tải tỉnh:', err);
      onShowToast('error', 'Không thể tải danh sách tỉnh/thành phố');
    }
  };

  const fetchDistricts = async (maTinh) => {
    try {
      const res = await api.get(`/api/DiaChi/Huyen?maTinh=${maTinh}`);
      setDistricts(res.data.data || []);
      setWards([]);
    } catch (err) {
      console.error('Lỗi khi tải huyện:', err);
      onShowToast('error', 'Không thể tải danh sách quận/huyện');
    }
  };

  const fetchWards = async (maHuyen) => {
    try {
      const res = await api.get(`/api/DiaChi/PhuongXa?maHuyen=${maHuyen}`);
      setWards(res.data.data || []);
    } catch (err) {
      console.error('Lỗi khi tải xã:', err);
      onShowToast('error', 'Không thể tải danh sách phường/xã');
    }
  };

  const fetchAvailableRooms = async () => {
    if (!bookingInfo.ngayNhanPhong || !bookingInfo.ngayTraPhong) {
      setAvailableRooms([]);
      setFilteredRooms([]);
      return;
    }

    const checkin = new Date(bookingInfo.ngayNhanPhong);
    const checkout = new Date(bookingInfo.ngayTraPhong);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkin < today) {
      onShowToast('error', 'Ngày nhận phòng không thể là quá khứ');
      setAvailableRooms([]);
      setFilteredRooms([]);
      return;
    }

    if (checkout <= checkin) {
      onShowToast('error', 'Ngày trả phòng phải sau ngày nhận phòng');
      setAvailableRooms([]);
      setFilteredRooms([]);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/api/Phong/PhongTrong', {
        params: {
          ngayNhanPhong: bookingInfo.ngayNhanPhong,
          ngayTraPhong: bookingInfo.ngayTraPhong,
        },
      });
      
      const rooms = res.data.data || [];
      setAvailableRooms(rooms);
      setFilteredRooms(rooms);
      
      const types = [...new Set(rooms.map(r => r.tenLoaiPhong))];
      setRoomTypes(types);

      if (rooms.length > 0) {
        onShowToast('success', `Tìm thấy ${rooms.length} phòng trống`);
      } else {
        onShowToast('warning', 'Không có phòng trống trong thời gian này');
      }
    } catch (err) {
      console.error('Lỗi khi tải phòng:', err);
      onShowToast('error', err.response?.data?.message || 'Không thể tải danh sách phòng');
      setAvailableRooms([]);
      setFilteredRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...availableRooms];

    // Filter by room type
    if (roomFilters.loaiPhong) {
      filtered = filtered.filter(r => r.tenLoaiPhong === roomFilters.loaiPhong);
    }

    // Filter by price range
    if (roomFilters.giaMin) {
      filtered = filtered.filter(r => r.giaMoiDem >= parseFloat(roomFilters.giaMin));
    }
    if (roomFilters.giaMax) {
      filtered = filtered.filter(r => r.giaMoiDem <= parseFloat(roomFilters.giaMax));
    }

    // Filter by capacity
    if (roomFilters.soNguoi) {
      filtered = filtered.filter(r => r.soNguoiToiDa >= parseInt(roomFilters.soNguoi));
    }

    // Filter by search term (room number)
    if (roomFilters.searchTerm) {
      filtered = filtered.filter(r =>
        r.soPhong.toString().toLowerCase().includes(roomFilters.searchTerm.toLowerCase())
      );
    }

    setFilteredRooms(filtered);
  };

  const calculateTotal = () => {
    if (numberOfDays === 0) {
      setTotalAmount(0);
      return;
    }

    const total = selectedRooms.reduce((sum, sr) => {
      const room = availableRooms.find(r => r.maPhong === sr.maPhong);
      return sum + (room?.giaMoiDem || 0) * numberOfDays;
    }, 0);

    setTotalAmount(total);
  };

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));

    if (name === 'maTinh') {
      setCustomerInfo((prev) => ({ ...prev, maHuyen: '', maPhuongXa: '' }));
      setDistricts([]);
      setWards([]);
      if (value) fetchDistricts(value);
    } else if (name === 'maHuyen') {
      setCustomerInfo((prev) => ({ ...prev, maPhuongXa: '' }));
      setWards([]);
      if (value) fetchWards(value);
    }
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentInfo((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setRoomFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setRoomFilters({
      loaiPhong: '',
      giaMin: '',
      giaMax: '',
      soNguoi: '',
      searchTerm: '',
    });
  };

  const toggleRoom = (maPhong) => {
    setSelectedRooms(prev => {
      const exists = prev.find(r => r.maPhong === maPhong);
      if (exists) {
        return prev.filter(r => r.maPhong !== maPhong);
      } else {
        const room = availableRooms.find(r => r.maPhong === maPhong);
        return [...prev, { maPhong, soNguoi: 1, giaMoiDem: room?.giaMoiDem || 0 }];
      }
    });
  };

  const updateRoomGuests = (maPhong, soNguoi) => {
    setSelectedRooms(prev =>
      prev.map(r => (r.maPhong === maPhong ? { ...r, soNguoi } : r))
    );
  };

  const handleSubmit = async () => {
    if (!customerInfo.hoTen || !customerInfo.soDienThoai || !customerInfo.soCCCD) {
      onShowToast('error', 'Vui lòng nhập đầy đủ thông tin khách hàng');
      return;
    }

    if (selectedRooms.length === 0) {
      onShowToast('error', 'Vui lòng chọn ít nhất 1 phòng');
      return;
    }

    if (paymentInfo.thanhToanNgay && (!paymentInfo.soTienThanhToan || paymentInfo.soTienThanhToan <= 0)) {
      onShowToast('error', 'Vui lòng nhập số tiền thanh toán');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        ...customerInfo,
        ...bookingInfo,
        danhSachPhong: selectedRooms,
        thanhToanNgay: paymentInfo.thanhToanNgay,
        soTienThanhToan: paymentInfo.thanhToanNgay ? parseFloat(paymentInfo.soTienThanhToan) : null,
        phuongThucThanhToan: paymentInfo.thanhToanNgay ? paymentInfo.phuongThucThanhToan : null,
        maPhuongXa: customerInfo.maPhuongXa ? parseInt(customerInfo.maPhuongXa) : null,
      };

      await api.post('/api/DatPhong/TrucTiep', requestData);
      onShowToast('success', 'Đặt phòng thành công!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Lỗi khi tạo đặt phòng:', err);
      onShowToast('error', err.response?.data?.message || 'Tạo đặt phòng thất bại');
    } finally {
      setLoading(false);
    }
  };

  // ✅ THAY THẾ renderStep1 bằng component
  const renderStep1 = () => (
    <ThongTinKhachHangStep
      customerInfo={customerInfo}
      bookingInfo={bookingInfo}
      provinces={provinces}
      districts={districts}
      wards={wards}
      handleCustomerChange={handleCustomerChange}
      handleBookingChange={handleBookingChange}
    />
  );

  // ✅ renderStep2 - Sử dụng component
  const renderStep2 = () => (
    <ChonPhongStep
      bookingInfo={bookingInfo}
      numberOfDays={numberOfDays}
      filteredRooms={filteredRooms}
      availableRooms={availableRooms}
      roomFilters={roomFilters}
      roomTypes={roomTypes}
      selectedRooms={selectedRooms}
      loading={loading}
      totalAmount={totalAmount}
      handleFilterChange={handleFilterChange}
      resetFilters={resetFilters}
      toggleRoom={toggleRoom}
      updateRoomGuests={updateRoomGuests}
    />
  );

  // ✅ renderStep3 - Sử dụng component
  const renderStep3 = () => (
    <ThanhToanStep
      customerInfo={customerInfo}
      bookingInfo={bookingInfo}
      selectedRooms={selectedRooms}
      availableRooms={availableRooms}
      paymentInfo={paymentInfo}
      totalAmount={totalAmount}
      handlePaymentChange={handlePaymentChange}
    />
  );

  // Cập nhật các message cho ngắn gọn hơn:
  const handleNextStep = () => {
    if (step === 1) {
      if (!customerInfo.hoTen?.trim()) {
        onShowToast('error', 'Vui lòng nhập họ tên khách hàng');
        return;
      }
      if (!customerInfo.soDienThoai?.trim()) {
        onShowToast('error', 'Vui lòng nhập số điện thoại');
        return;
      }
      if (!/^[0-9]{10,11}$/.test(customerInfo.soDienThoai)) {
        onShowToast('error', 'Số điện thoại không hợp lệ (10-11 số)');
        return;
      }
      if (!customerInfo.soCCCD?.trim()) {
        onShowToast('error', 'Vui lòng nhập số CCCD/CMND');
        return;
      }
      if (!/^[0-9]{9,12}$/.test(customerInfo.soCCCD)) {
        onShowToast('error', 'Số CCCD/CMND không hợp lệ (9-12 số)');
        return;
      }

      if (!bookingInfo.ngayNhanPhong) {
        onShowToast('error', 'Vui lòng chọn ngày nhận phòng');
        return;
      }
      if (!bookingInfo.ngayTraPhong) {
        onShowToast('error', 'Vui lòng chọn ngày trả phòng');
        return;
      }

      const checkin = new Date(bookingInfo.ngayNhanPhong);
      const checkout = new Date(bookingInfo.ngayTraPhong);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkin < today) {
        onShowToast('error', 'Ngày nhận phòng không thể là quá khứ');
        return;
      }
      if (checkout <= checkin) {
        onShowToast('error', 'Ngày trả phòng phải sau ngày nhận phòng');
        return;
      }

      onShowToast('success', 'Thông tin hợp lệ! Tiếp tục chọn phòng');
    }

    if (step === 2) {
      if (selectedRooms.length === 0) {
        onShowToast('error', 'Vui lòng chọn ít nhất 1 phòng');
        return;
      }
      onShowToast('success', `Đã chọn ${selectedRooms.length} phòng!`);
    }

    setStep((prev) => prev + 1);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-booking" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
          <div className="modal-header-gradient">
          <div className="modal-header-content">
            <div className="modal-icon">➕</div>
            <div>
              <h3 className="modal-title-large">Đặt phòng trực tiếp</h3>
              <p className="modal-subtitle">
                Tạo đặt phòng mới cho khách hàng
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        {/* Steps */}
        <div className="booking-steps">
          {[
            { num: 1, label: 'Thông tin', icon: '📋' },
            { num: 2, label: 'Chọn phòng', icon: '🏨' },
            { num: 3, label: 'Thanh toán', icon: '💳' },
          ].map((s) => (
            <div
              key={s.num}
              className={`booking-step ${step >= s.num ? 'active' : ''} ${
                step === s.num ? 'current' : ''
              }`}
            >
              <div className="booking-step-number">
                {step > s.num ? '✓' : s.num}
              </div>
              <div className="booking-step-label">
                <span className="booking-step-icon">{s.icon}</span>
                <span>{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="modal-body booking-modal-body">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer */}
        <div className="modal-footer booking-modal-footer">
          {step > 1 && (
            <button 
              className="btn-outline" 
              onClick={() => {
                setStep((prev) => prev - 1);
                onShowToast('info', '⬅️ Quay lại bước trước');
              }}
            >
              ← Quay lại
            </button>
          )}
          <button className="btn-outline" onClick={onClose}>
            Hủy
          </button>
          {step < 3 ? (
            <button className="btn-primary" onClick={handleNextStep}>
              Tiếp theo →
            </button>
          ) : (
            <button 
              className="btn-success" 
              onClick={handleSubmit} 
              disabled={loading}
            >
              {loading ? '⏳ Đang xử lý...' : '✅ Hoàn tất đặt phòng'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}