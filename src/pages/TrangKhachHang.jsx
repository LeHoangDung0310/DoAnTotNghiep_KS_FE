import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import api from '../utils/api';
import '../styles/trangkhachhang.css';

/**
 * Trang Khách Hàng - Trang chủ
 * - Hiển thị danh sách loại phòng dưới dạng lưới
 * - Tìm kiếm và lọc theo giá
 * - Click vào card để xem chi tiết loại phòng
 */
export default function TrangKhachHang() {
  const navigate = useNavigate();
  
  // ========== STATE MANAGEMENT ==========
  const [loaiPhongs, setLoaiPhongs] = useState([]);
  const [filteredLoaiPhongs, setFilteredLoaiPhongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [sortPrice, setSortPrice] = useState(''); // 'asc' | 'desc' | ''
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');

  // ========== LOAD DỮ LIỆU KHI COMPONENT MOUNT ==========
  useEffect(() => {
    loadLoaiPhongs();
  }, []);

  // ========== LỌC VÀ SẮP XẾP KHI SEARCH/SORT THAY ĐỔI ==========
  useEffect(() => {
    let result = [...loaiPhongs];

    // Lọc theo tên
    if (searchText.trim()) {
      result = result.filter(lp =>
        lp.tenLoaiPhong.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Lọc theo khoảng giá
    const minPrice = priceFrom ? parseFloat(priceFrom) : null;
    const maxPrice = priceTo ? parseFloat(priceTo) : null;
    
    if (minPrice !== null) {
      result = result.filter(lp => lp.giaMoiDem >= minPrice);
    }
    if (maxPrice !== null) {
      result = result.filter(lp => lp.giaMoiDem <= maxPrice);
    }

    // Sắp xếp theo giá
    if (sortPrice === 'asc') {
      result.sort((a, b) => a.giaMoiDem - b.giaMoiDem);
    } else if (sortPrice === 'desc') {
      result.sort((a, b) => b.giaMoiDem - a.giaMoiDem);
    }

    setFilteredLoaiPhongs(result);
  }, [loaiPhongs, searchText, sortPrice, priceFrom, priceTo]);

  // ========== GỌI API LẤY DANH SÁCH LOẠI PHÒNG ==========
  const loadLoaiPhongs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/LoaiPhong');
      const data = response.data?.data || response.data || [];
      setLoaiPhongs(data);
      setFilteredLoaiPhongs(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách loại phòng:', error);
      setLoaiPhongs([]);
      setFilteredLoaiPhongs([]);
    } finally {
      setLoading(false);
    }
  };

  // ========== FORMAT GIÁ TIỀN ==========
  const formatPrice = (price) => {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // ========== NAVIGATE ĐẾN TRANG CHI TIẾT ==========
  const handleCardClick = (maLoaiPhong) => {
    navigate(`/loai-phong/${maLoaiPhong}`);
  };

  return (
    <MainLayout>
      <div className="trang-khach-hang">
        {/* ========== HERO BANNER ========== */}
        <section className="hero-banner">
          <div className="hero-content">
            <h1 className="hero-title">
              🏖️ Chào mừng đến với Da Nang Bay Hotel
            </h1>
            <p className="hero-subtitle">
              Khám phá trải nghiệm nghỉ dưỡng đẳng cấp 3 sao với view biển tuyệt đẹp.
              Đặt phòng ngay hôm nay để nhận ưu đãi đặc biệt!
            </p>
          </div>
        </section>

        {/* ========== CONTAINER CHÍNH ========== */}
        <div className="main-container">
          {/* ========== THANH TÌM KIẾM VÀ LỌC ========== */}
          <div className="search-filter-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Tìm kiếm loại phòng..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input"
              />
              {searchText && (
                <button
                  className="clear-search"
                  onClick={() => setSearchText('')}
                  title="Xóa tìm kiếm"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="price-range-box">
              <span className="filter-icon">💰</span>
              <input
                type="number"
                placeholder="Từ (VNĐ)"
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
                className="price-input"
                min="0"
              />
              <span className="price-separator">—</span>
              <input
                type="number"
                placeholder="Đến (VNĐ)"
                value={priceTo}
                onChange={(e) => setPriceTo(e.target.value)}
                className="price-input"
                min="0"
              />
            </div>

            <div className="filter-box">
              <span className="filter-icon">↕️</span>
              <select
                value={sortPrice}
                onChange={(e) => setSortPrice(e.target.value)}
                className="filter-select"
              >
                <option value="">Sắp xếp theo giá</option>
                <option value="asc">Giá: Thấp → Cao</option>
                <option value="desc">Giá: Cao → Thấp</option>
              </select>
            </div>
          </div>

          {/* ========== TIÊU ĐỀ SECTION ========== */}
          <div className="section-header">
            <h2 className="section-title">
              🏨 Loại phòng của chúng tôi
            </h2>
            <p className="section-subtitle">
              Tìm thấy <strong>{filteredLoaiPhongs.length}</strong> loại phòng
            </p>
          </div>

          {/* ========== HIỂN THỊ LOADING ========== */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Đang tải danh sách phòng...</p>
            </div>
          ) : filteredLoaiPhongs.length === 0 ? (
            // ========== KHÔNG CÓ KẾT QUẢ ==========
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>Không tìm thấy loại phòng nào</h3>
              <p>Vui lòng thử tìm kiếm với từ khóa khác</p>
              <button
                className="btn-reset"
                onClick={() => {
                  setSearchText('');
                  setSortPrice('');
                  setPriceFrom('');
                  setPriceTo('');
                }}
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            // ========== LƯỚI DANH SÁCH LOẠI PHÒNG ==========
            <div className="room-grid">
              {filteredLoaiPhongs.map((loaiPhong) => (
                <div
                  key={loaiPhong.maLoaiPhong}
                  className="room-card"
                  onClick={() => handleCardClick(loaiPhong.maLoaiPhong)}
                >
                  {/* Hình ảnh đại diện */}
                  <div className="room-image">
                    <img
                      src={
                        loaiPhong.hinhAnhDauTien
                          ? `${api.defaults.baseURL}${loaiPhong.hinhAnhDauTien}`
                          : `https://via.placeholder.com/400x250/667eea/ffffff?text=${encodeURIComponent(loaiPhong.tenLoaiPhong)}`
                      }
                      alt={loaiPhong.tenLoaiPhong}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/400x250/667eea/ffffff?text=${encodeURIComponent(loaiPhong.tenLoaiPhong)}`;
                      }}
                    />
                    <div className="room-badge">
                      <span className="badge-icon">⭐</span>
                      <span>Phổ biến</span>
                    </div>
                  </div>

                  {/* Nội dung card */}
                  <div className="room-content">
                    <h3 className="room-title">{loaiPhong.tenLoaiPhong}</h3>
                    
                    {/* Mô tả ngắn */}
                    <p className="room-description">
                      {loaiPhong.moTa
                        ? loaiPhong.moTa.length > 100
                          ? `${loaiPhong.moTa.substring(0, 100)}...`
                          : loaiPhong.moTa
                        : 'Phòng sang trọng với đầy đủ tiện nghi hiện đại'}
                    </p>

                    {/* Thông tin phòng */}
                    <div className="room-info">
                      <div className="info-item">
                        <span className="info-icon">👥</span>
                        <span>{loaiPhong.soNguoiToiDa || 2} người</span>
                      </div>
                      <div className="info-item">
                        <span className="info-icon">🛏️</span>
                        <span>{loaiPhong.soGiuong || 1} giường</span>
                      </div>
                      <div className="info-item">
                        <span className="info-icon">📐</span>
                        <span>{loaiPhong.dienTich || 25}m²</span>
                      </div>
                    </div>

                    {/* Giá và nút đặt phòng */}
                    <div className="room-footer">
                      <div className="room-price">
                        <span className="price-label">Chỉ từ</span>
                        <span className="price-value">
                          {formatPrice(loaiPhong.giaMoiDem)}
                        </span>
                        <span className="price-unit">/đêm</span>
                      </div>
                      <button className="btn-view-detail">
                        Xem chi tiết →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}