import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/lichsudatphong.css';

export default function TrangLichSuDP() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        loadBookings();
    }, []);

    // Reset to page 1 when filter changes
    const handleFilterChange = (status) => {
        setFilterStatus(status);
        setCurrentPage(1);
    };

    const loadBookings = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/api/DatPhong/CuaToi');

            if (response.data.success) {
                setBookings(response.data.data || []);
            } else {
                setError(response.data.message || 'Không thể tải danh sách đặt phòng');
            }
        } catch (err) {
            console.error('Error loading bookings:', err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách đặt phòng');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'DangSuDung': { label: 'Đang sử dụng', className: 'status-active' },
            'HoanThanh': { label: 'Hoàn thành', className: 'status-completed' },
            'DaHuy': { label: 'Đã hủy', className: 'status-cancelled' }
        };

        const statusInfo = statusMap[status] || { label: status, className: 'status-default' };
        return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const filteredBookings = filterStatus === 'all'
        ? bookings
        : bookings.filter(b => b.trangThai === filterStatus);

    // Pagination logic
    const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

    if (loading) {
        return (
            <div className="booking-history-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Đang tải danh sách đặt phòng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-history-container">
            <div className="booking-history-header">
                <div className="header-content">
                    <h1>📋 Lịch sử đặt phòng</h1>
                    <p className="subtitle">Quản lý và theo dõi các đặt phòng của bạn</p>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            <div className="booking-filters">
                <button
                    className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('all')}
                >
                    Tất cả ({bookings.length})
                </button>
                <button
                    className={`filter-btn ${filterStatus === 'DangSuDung' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('DangSuDung')}
                >
                    Đang sử dụng ({bookings.filter(b => b.trangThai === 'DangSuDung').length})
                </button>
                <button
                    className={`filter-btn ${filterStatus === 'HoanThanh' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('HoanThanh')}
                >
                    Hoàn thành ({bookings.filter(b => b.trangThai === 'HoanThanh').length})
                </button>
                <button
                    className={`filter-btn ${filterStatus === 'DaHuy' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('DaHuy')}
                >
                    Đã hủy ({bookings.filter(b => b.trangThai === 'DaHuy').length})
                </button>
            </div>

            {filteredBookings.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>Chưa có đặt phòng nào</h3>
                    <p>Bạn chưa có lịch sử đặt phòng. Hãy đặt phòng ngay để trải nghiệm dịch vụ của chúng tôi!</p>
                    <button className="btn-primary" onClick={() => navigate('/customer')}>
                        Đặt phòng ngay
                    </button>
                </div>
            ) : (
                <div className="bookings-list">
                    {currentItems.map((booking) => (
                        <div key={booking.maDatPhong} className="booking-card">
                            <div className="booking-card-header">
                                {getStatusBadge(booking.trangThai)}
                            </div>

                            <div className="booking-card-body">
                                <div className="booking-info-grid">
                                    <div className="info-item">
                                        <span className="info-icon">🏨</span>
                                        <div className="info-content">
                                            <span className="info-label">Phòng</span>
                                            <span className="info-value">
                                                {booking.danhSachPhong?.map(p => p.soPhong).join(', ') || 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <span className="info-icon">🛏️</span>
                                        <div className="info-content">
                                            <span className="info-label">Loại phòng</span>
                                            <span className="info-value">
                                                {booking.danhSachPhong?.[0]?.tenLoaiPhong || 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <span className="info-icon">📅</span>
                                        <div className="info-content">
                                            <span className="info-label">Ngày đặt</span>
                                            <span className="info-value">{formatDate(booking.ngayDat)}</span>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <span className="info-icon">📆</span>
                                        <div className="info-content">
                                            <span className="info-label">Nhận phòng</span>
                                            <span className="info-value">{formatDate(booking.ngayNhanPhong)}</span>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <span className="info-icon">📆</span>
                                        <div className="info-content">
                                            <span className="info-label">Trả phòng</span>
                                            <span className="info-value">{formatDate(booking.ngayTraPhong)}</span>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <span className="info-icon">🌙</span>
                                        <div className="info-content">
                                            <span className="info-label">Số đêm</span>
                                            <span className="info-value">{booking.soNgayO || 0} đêm</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="booking-total">
                                    <span className="total-label">Tổng tiền:</span>
                                    <span className="total-value">{formatCurrency(booking.tongTien)}</span>
                                </div>
                            </div>

                            <div className="booking-card-footer">
                                <button
                                    className="btn-detail"
                                    onClick={() => navigate(`/booking/${booking.maDatPhong}`)}
                                >
                                    Xem chi tiết
                                </button>

                                {booking.trangThai === 'ChoDuyet' && (
                                    <button
                                        className="btn-cancel"
                                        onClick={() => {
                                            // TODO: Implement cancel booking
                                            console.log('Cancel booking:', booking.maDatPhong);
                                        }}
                                    >
                                        Hủy đặt phòng
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Pagination UI */}
                    {totalPages > 1 && (
                        <div className="pagination-container">
                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                ⬅️ Trước
                            </button>

                            <div className="pagination-numbers">
                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index + 1}
                                        className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(index + 1)}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Tiếp ➡️
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
