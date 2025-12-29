import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/chitietloaiphong.css';

/**
 * Trang Chi Tiết Loại Phòng
 * - Hiển thị thông tin chi tiết loại phòng
 * - Hiển thị danh sách phòng
 * - Có lọc theo ngày (PhongTrong)
 */
export default function ChiTietLoaiPhong() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ================= STATE =================
  const [loaiPhong, setLoaiPhong] = useState(null);
  const [danhSachPhong, setDanhSachPhong] = useState([]);
  const [hinhAnhs, setHinhAnhs] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const [ngayNhanPhong, setNgayNhanPhong] = useState('');
  const [ngayTraPhong, setNgayTraPhong] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPhong, setSelectedPhong] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // ================= LOAD INITIAL =================
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      await Promise.all([
        loadLoaiPhongDetail(),
        loadHinhAnhs()
      ]);
      setLoading(false);
      loadDanhSachPhong();
      // Only load rooms if dates are already set, otherwise the UI will prompt user to select dates
      if (ngayNhanPhong && ngayTraPhong) {
        loadDanhSachPhong();
      } else {
        setDanhSachPhong([]); // Clear rooms if no dates selected initially
      }
    };
    loadInitial();
  }, [id]);

  // ================= API =================
  const loadLoaiPhongDetail = async () => {
    try {
      const res = await api.get(`/api/LoaiPhong/${id}`);
      setLoaiPhong(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
      setLoaiPhong(null);
    }
  };

  const loadHinhAnhs = async () => {
    try {
      const res = await api.get(`/api/HinhAnhLPhong/LoaiPhong/${id}`);
      const data = res.data?.data || res.data || [];
      setHinhAnhs(data);
      if (data.length > 0) setSelectedImage(data[0]);
    } catch (err) {
      console.error(err);
      setHinhAnhs([]);
    }
  };

  // ================= LOAD ROOMS =================
  const loadDanhSachPhong = async () => {
    try {
      setLoadingRooms(true);

      // ===== CÓ NGÀY → PHONGTRONG =====
      if (ngayNhanPhong && ngayTraPhong) {
        const res = await api.get('/api/Phong/PhongTrong', {
          params: { ngayNhanPhong, ngayTraPhong }
        });

        const rooms = res.data?.data || [];

        setDanhSachPhong(
          rooms.filter(r => r.maLoaiPhong === Number(id))
        );
        return;
      }

      // ===== KHÔNG NGÀY → SEARCH =====
      const res = await api.get('/api/Phong/Search', {
        params: {
          MaLoaiPhong: id,
          PageSize: 100
        }
      });

      const data = res.data?.data || [];

      if (showOnlyAvailable) {
        setDanhSachPhong(data.filter(p => p.trangThai === 'Trong'));
      } else {
        setDanhSachPhong(data);
      }

    } catch (err) {
      console.error(err);
      setDanhSachPhong([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  // ================= HANDLER =================
  const handleSearch = () => loadDanhSachPhong();

  const handleReset = () => {
    setNgayNhanPhong('');
    setNgayTraPhong('');
    setShowOnlyAvailable(false);
    setTimeout(loadDanhSachPhong, 0);
  };

  useEffect(() => {
    if (!ngayNhanPhong && !ngayTraPhong) {
      loadDanhSachPhong();
    }
  }, [showOnlyAvailable]);

  // ================= IMAGE HANDLER =================
  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handlePrevImage = () => {
    if (hinhAnhs.length === 0) return;
    const currentIndex = hinhAnhs.findIndex(img => img.maHinhAnh === selectedImage?.maHinhAnh);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : hinhAnhs.length - 1;
    setSelectedImage(hinhAnhs[prevIndex]);
  };

  const handleNextImage = () => {
    if (hinhAnhs.length === 0) return;
    const currentIndex = hinhAnhs.findIndex(img => img.maHinhAnh === selectedImage?.maHinhAnh);
    const nextIndex = currentIndex < hinhAnhs.length - 1 ? currentIndex + 1 : 0;
    setSelectedImage(hinhAnhs[nextIndex]);
  };

  const getCurrentImageIndex = () => {
    if (!selectedImage || hinhAnhs.length === 0) return 0;
    return hinhAnhs.findIndex(img => img.maHinhAnh === selectedImage?.maHinhAnh) + 1;
  };

  // ================= BOOKING HANDLER =================
  const handleOpenBooking = (phong) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Vui lòng đăng nhập để đặt phòng!');
      navigate('/login');
      return;
    }

    if (!ngayNhanPhong || !ngayTraPhong) {
      alert('Vui lòng chọn ngày nhận và ngày trả phòng trước!');
      return;
    }

    setSelectedPhong(phong);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    try {
      setBookingLoading(true);

      // 1. Tạo đặt phòng
      const bookingData = {
        ngayNhanPhong,
        ngayTraPhong,
        danhSachPhong: [
          {
            maPhong: selectedPhong.maPhong,
            soNguoi: loaiPhong.soNguoiToiDa || 2
          }
        ]
      };

      const resBooking = await api.post('/api/DatPhong', bookingData);

      if (resBooking.data?.success) {
        const maDatPhong = resBooking.data.data.maDatPhong;

        // 2. Tính tổng tiền (giả sử thanh toán hết 100%)
        const soNgay = Math.max(1, (new Date(ngayTraPhong) - new Date(ngayNhanPhong)) / (1000 * 60 * 60 * 24));
        const soTien = loaiPhong.giaMoiDem * soNgay;

        // 3. Gọi API tạo URL VNPay
        const resVNPay = await api.post('/api/ThanhToan/create-vnpay-url', {
          maDatPhong,
          soTien
        });

        if (resVNPay.data?.success) {
          // Redirect đến VNPay
          window.location.href = resVNPay.data.data;
        } else {
          alert('Không thể tạo liên kết thanh toán. Vui lòng thử lại sau!');
        }
      } else {
        alert(resBooking.data?.message || 'Có lỗi xảy ra khi đặt phòng');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi hệ thống khi đặt phòng');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleAddToCart = (phong) => {
    if (!ngayNhanPhong || !ngayTraPhong) {
      alert('Vui lòng chọn ngày nhận và ngày trả phòng trước khi thêm vào giỏ hàng!');
      return;
    }

    const email = localStorage.getItem('userEmail');
    const cartKey = email ? `cart_${email}` : 'cart_guest';
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    const newItem = {
      cartId: Date.now(),
      maLoaiPhong: loaiPhong.maLoaiPhong,
      tenLoaiPhong: loaiPhong.tenLoaiPhong,
      maPhong: phong.maPhong,
      soPhong: phong.soPhong,
      giaMoiDem: loaiPhong.giaMoiDem,
      ngayNhanPhong,
      ngayTraPhong,
      hinhAnh: loaiPhong.hinhAnhDauTien
    };

    cart.push(newItem);
    localStorage.setItem(cartKey, JSON.stringify(cart));

    // Trigger event for Header to update badge
    window.dispatchEvent(new Event('cartUpdated'));

    alert('Đã thêm phòng vào giỏ hàng thành công!');
  };

  // ================= UTIL =================
  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(price || 0);

  const renderTrangThai = (trangThai) => {
    const map = {
      Trong: { label: 'Còn trống', className: 'status-available', icon: '✓' },
      DaDat: { label: 'Đã đặt', className: 'status-booked', icon: '🔒' },
      DangSuDung: { label: 'Đang sử dụng', className: 'status-occupied', icon: '👥' },
      BaoTri: { label: 'Bảo trì', className: 'status-maintenance', icon: '🔧' }
    };
    const s = map[trangThai] || map.Trong;
    return (
      <span className={`room-status ${s.className}`}>
        <span>{s.icon}</span>
        <span>{s.label}</span>
      </span>
    );
  };

  // ================= LOADING =================
  if (loading || !loaiPhong) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="chi-tiet-loai-phong">
      {/* ========== BREADCRUMB ========== */}
      <div className="breadcrumb">
        <button onClick={() => navigate('/customer')} className="breadcrumb-link">
          🏠 Trang chủ
        </button>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{loaiPhong.tenLoaiPhong}</span>
      </div>

      {/* ========== THÔNG TIN LOẠI PHÒNG ========== */}
      <div className="loai-phong-header">
        {/* Ảnh lớn với navigation */}
        <div className="header-image">
          <img
            src={
              selectedImage
                ? `${api.defaults.baseURL}${selectedImage.url}`
                : loaiPhong.hinhAnhDauTien
                  ? `${api.defaults.baseURL}${loaiPhong.hinhAnhDauTien}`
                  : `https://via.placeholder.com/800x500/667eea/ffffff?text=${encodeURIComponent(loaiPhong.tenLoaiPhong)}`
            }
            alt={loaiPhong.tenLoaiPhong}
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/800x500/667eea/ffffff?text=${encodeURIComponent(loaiPhong.tenLoaiPhong)}`;
            }}
          />

          {/* Navigation Arrows */}
          {hinhAnhs.length > 1 && (
            <>
              <button className="image-nav-btn prev-btn" onClick={handlePrevImage} aria-label="Ảnh trước">
                <span>‹</span>
              </button>
              <button className="image-nav-btn next-btn" onClick={handleNextImage} aria-label="Ảnh tiếp theo">
                <span>›</span>
              </button>

              {/* Image Counter */}
              <div className="image-counter">
                <span className="counter-icon">📷</span>
                <span>{getCurrentImageIndex()}/{hinhAnhs.length}</span>
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {hinhAnhs.length > 0 && (
          <div className="thumbnail-gallery">
            <div className="thumbnail-label">📸 Thư viện</div>
            <div className="thumbnail-list">
              {hinhAnhs.map((image, index) => (
                <div
                  key={image.maHinhAnh || index}
                  className={`thumbnail-item ${selectedImage?.maHinhAnh === image.maHinhAnh ? 'active' : ''}`}
                  onClick={() => handleImageClick(image)}
                >
                  <img
                    src={`${api.defaults.baseURL}${image.url}`}
                    alt={`${loaiPhong.tenLoaiPhong} - ${index + 1}`}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/150x100/667eea/ffffff?text=${index + 1}`;
                    }}
                  />
                  <div className="thumbnail-number">{index + 1}/{hinhAnhs.length}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="header-content">
          <h1 className="loai-phong-title">{loaiPhong.tenLoaiPhong}</h1>

          <div className="loai-phong-specs">
            <div className="spec-item">
              <span className="spec-icon">👥</span>
              <span className="spec-label">Sức chứa</span>
              <strong>{loaiPhong.soNguoiToiDa || 2} người</strong>
            </div>
            <div className="spec-item">
              <span className="spec-icon">🛏️</span>
              <span className="spec-label">Giường</span>
              <strong>{loaiPhong.soGiuong || 1} giường</strong>
            </div>
            <div className="spec-item">
              <span className="spec-icon">📐</span>
              <span className="spec-label">Diện tích</span>
              <strong>{loaiPhong.dienTich || 25}m²</strong>
            </div>
          </div>

          <div className="loai-phong-price">
            <span className="price-label1">Giá phòng</span>
            <span className="price-value1">{formatPrice(loaiPhong.giaMoiDem)}</span>
            <span className="price-unit1">/đêm</span>
          </div>

          <p className="loai-phong-description">
            {loaiPhong.moTa || 'Phòng được thiết kế sang trọng, hiện đại với đầy đủ tiện nghi cao cấp.'}
          </p>
        </div>
      </div>

      {/* ========== DANH SÁCH PHÒNG ========== */}
      <div className="danh-sach-phong-section">
        <div className="section-header">
          <h2 className="section-title">
            📋 Danh sách phòng ({danhSachPhong.length})
          </h2>
          <p className="section-subtitle">
            Tất cả các phòng thuộc loại "{loaiPhong.tenLoaiPhong}" - Giá: {formatPrice(loaiPhong.giaMoiDem)}/đêm
          </p>
        </div>

        {/* ========== BỘ LỌC TÌM KIẾM ========== */}
        <div className="search-filter-box">
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">
                <span className="label-icon">📅</span>
                Ngày nhận phòng
              </label>
              <input
                type="date"
                className="filter-input"
                value={ngayNhanPhong}
                onChange={(e) => setNgayNhanPhong(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <span className="label-icon">📅</span>
                Ngày trả phòng
              </label>
              <input
                type="date"
                className="filter-input"
                value={ngayTraPhong}
                onChange={(e) => setNgayTraPhong(e.target.value)}
                min={ngayNhanPhong || new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <span className="label-icon">✓</span>
                Trạng thái
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                />
                <span>Chỉ phòng trống</span>
              </label>
            </div>
          </div>

          <div className="filter-actions">
            <button className="btn-search" onClick={handleSearch}>
              🔍 Tìm kiếm
            </button>
            <button className="btn-reset" onClick={handleReset}>
              ↺ Đặt lại
            </button>
          </div>
        </div>

        {loadingRooms ? (
          <div className="loading-container" style={{ padding: '40px', textAlign: 'center' }}>
            <div className="spinner"></div>
            <p>Đang tìm kiếm phòng...</p>
          </div>
        ) : (!ngayNhanPhong || !ngayTraPhong) ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>Khám phá phòng trống</h3>
            <p>Vui lòng chọn ngày nhận và ngày trả phòng để kiểm tra tính khả dụng</p>
          </div>
        ) : danhSachPhong.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏨</div>
            <h3>Không tìm thấy phòng nào</h3>
            <p>Không có phòng nào phù hợp với tiêu chí tìm kiếm</p>
          </div>
        ) : (
          <div className="phong-list">
            {danhSachPhong.map((phong) => (
              <div key={phong.maPhong} className="phong-item">
                <div className="phong-number">
                  <span className="number-icon">🚪</span>
                  <span className="number-text">Phòng {phong.soPhong}</span>
                </div>

                <div className="phong-info">
                  <div className="phong-detail">
                    <span className="detail-icon">🏢</span>
                    <span>{phong.tenTang || 'Chưa có tầng'}</span>
                  </div>
                  <div className="phong-detail">
                    <span className="detail-icon">🛏️</span>
                    <span>{loaiPhong.soGiuong || 1} giường</span>
                  </div>
                  <div className="phong-detail">
                    <span className="detail-icon">👥</span>
                    <span>{loaiPhong.soNguoiToiDa || 2} người</span>
                  </div>
                </div>

                {renderTrangThai(phong.trangThai)}

                {phong.trangThai === 'Trong' && (
                  <div className="room-actions-row">
                    <button
                      className="btn-book-room"
                      onClick={() => handleOpenBooking(phong)}
                    >
                      Đặt ngay
                    </button>
                    <button
                      className="btn-add-cart"
                      onClick={() => handleAddToCart(phong)}
                    >
                      🛒 Thêm giỏ hàng
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========== MODAL XÁC NHẬN ĐẶT PHÒNG (PREMIUM) ========== */}
      {showBookingModal && (
        <div className="booking-modal-overlay">
          <div className="booking-modal">
            <div className="modal-header-premium">
              <h2>Xác nhận đặt phòng</h2>
              <button className="close-btn" onClick={() => setShowBookingModal(false)}>✕</button>
            </div>

            <div className="modal-receipt-body">
              <div className="receipt-card">
                <div className="receipt-item">
                  <span className="label">🏨 Loại phòng</span>
                  <span className="value">{loaiPhong.tenLoaiPhong}</span>
                </div>
                <div className="receipt-item">
                  <span className="label">🚪 Số phòng</span>
                  <span className="value">{selectedPhong?.soPhong}</span>
                </div>
                <div className="receipt-item">
                  <span className="label">📅 Nhận phòng</span>
                  <span className="value">{new Date(ngayNhanPhong).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="receipt-item">
                  <span className="label">📅 Trả phòng</span>
                  <span className="value">{new Date(ngayTraPhong).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="receipt-item">
                  <span className="label">⏳ Khoảng thời gian</span>
                  <span className="value">
                    {Math.max(1, (new Date(ngayTraPhong) - new Date(ngayNhanPhong)) / (1000 * 60 * 60 * 24))} đêm
                  </span>
                </div>

                <div className="receipt-divider"></div>

                <div className="receipt-total">
                  <span className="label">TỔNG CỘNG</span>
                  <span className="value">
                    {formatPrice(loaiPhong.giaMoiDem * Math.max(1, (new Date(ngayTraPhong) - new Date(ngayNhanPhong)) / (1000 * 60 * 60 * 24)))}
                  </span>
                </div>
              </div>

              <div className="payment-section">
                <h3>Phương thức thanh toán</h3>
                <div className="vnpay-selector">
                  <img src="https://sandbox.vnpayment.vn/paymentv2/Images/brands/logo-vnpay.png" alt="VNPay" />
                  <span>Cổng thanh toán VNPay (Thành toán ngay)</span>
                  <span style={{ marginLeft: 'auto', color: '#6366f1' }}>✅</span>
                </div>
              </div>
            </div>

            <div className="modal-footer-premium">
              <button
                className="btn-confirm-receipt"
                onClick={handleConfirmBooking}
                disabled={bookingLoading}
              >
                {bookingLoading ? <div className="spinner-white"></div> : 'Xác nhận & Thanh toán →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}