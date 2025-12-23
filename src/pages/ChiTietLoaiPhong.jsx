import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
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
      <MainLayout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
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
          {/* Ảnh lớn */}
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
                    <button className="btn-book-room">
                      Đặt ngay
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}