import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Toast from '../components/Common/Toast';
import '../styles/lichsudatphong.css';

export default function TrangLichSuDP() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // cancellation state
    const [cancelModal, setCancelModal] = useState({ show: false, loading: false, booking: null, checkResult: null });
    const [cancelForm, setCancelForm] = useState({ lyDo: '', nganHang: '', soTaiKhoan: '', tenChuTK: '' });

    // Toast state
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
    };

    const openCancelModal = async (booking) => {
        setCancelModal({ show: true, loading: true, booking, checkResult: null });
        try {
            const res = await api.get(`/api/HuyDatPhong/KiemTraDieuKien/${booking.maDatPhong}`);
            console.log('Cancel check result:', res.data); // Debug log
            setCancelModal(prev => ({ ...prev, loading: false, checkResult: res.data }));

            // Pre-fill bank info if available
            const bankData = res.data.data?.taiKhoanNH || res.data.data?.TaiKhoanNH;
            console.log('Bank data fetched:', bankData);

            if (res.data.success && bankData) {
                setCancelForm(prev => ({
                    ...prev,
                    nganHang: bankData.nganHang || bankData.NganHang || '',
                    soTaiKhoan: bankData.soTaiKhoan || bankData.SoTaiKhoan || '',
                    tenChuTK: bankData.tenChuTK || bankData.TenChuTK || ''
                }));
            }
        } catch (err) {
            console.error('Error checking cancel conditions:', err);
            setCancelModal(prev => ({ ...prev, loading: false, checkResult: null }));
            showToast('error', 'Lỗi khi kiểm tra điều kiện hủy');
        }
    };

    const closeCancelModal = () => {
        setCancelModal({ show: false, loading: false, booking: null, checkResult: null });
        setCancelForm({ lyDo: '', nganHang: '', soTaiKhoan: '', tenChuTK: '' });
    };

    const handleRequestCancel = async () => {
        try {
            const res = await api.post(`/api/HuyDatPhong/YeuCauHuy/${cancelModal.booking.maDatPhong}`, {
                lyDo: cancelForm.lyDo,
                nganHang: cancelForm.nganHang || null,
                soTaiKhoan: cancelForm.soTaiKhoan || null,
                tenChuTK: cancelForm.tenChuTK || null
            });

            if (res.data.success) {
                showToast('success', 'Gửi yêu cầu hủy thành công. Vui lòng chờ lễ tân duyệt.');
                closeCancelModal();
                loadBookings();
            } else {
                showToast('error', res.data.message || 'Gửi yêu cầu thất bại');
            }
        } catch (err) {
            console.error('Error requesting cancel:', err);
            showToast('error', err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    // Reset to page 1 when filter changes
    const handleFilterChange = (status) => {
        setFilterStatus(status);
        setCurrentPage(1);
    };

    const handleResumePayment = async (booking) => {
        try {
            setLoading(true);
            const resVNPay = await api.post('/api/ThanhToan/create-vnpay-url', {
                maDatPhong: booking.maDatPhong,
                soTien: booking.tongTien
            });

            if (resVNPay.data?.success) {
                window.location.href = resVNPay.data.data;
            } else {
                showToast('error', 'Không thể tạo liên kết thanh toán. Vui lòng thử lại sau!');
            }
        } catch (err) {
            console.error(err);
            showToast('error', 'Lỗi khi khởi tạo thanh toán');
        } finally {
            setLoading(false);
        }
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
            'DaHuy': { label: 'Đã hủy', className: 'status-cancelled' },
            'ChoThanhToan': { label: 'Chờ thanh toán', className: 'status-pending' },
            'DaDuyet': { label: 'Đã xác nhận', className: 'status-active' }
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
                    className={`filter-btn ${filterStatus === 'ChoThanhToan' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('ChoThanhToan')}
                >
                    Chờ thanh toán ({bookings.filter(b => b.trangThai === 'ChoThanhToan').length})
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

                                {booking.coYeuCauHuy ? (
                                    <span className="status-badge status-pending" style={{ marginLeft: '10px' }}>
                                        ⏳ Đang xử lý hủy
                                    </span>
                                ) : (
                                    <button
                                        className="btn-cancel"
                                        style={{
                                            marginLeft: '10px',
                                            opacity: booking.canCancel ? 1 : 0.5,
                                            cursor: booking.canCancel ? 'pointer' : 'not-allowed'
                                        }}
                                        onClick={() => booking.canCancel && openCancelModal(booking)}
                                        title={booking.canCancel ? "" : booking.cancellationMessage}
                                    >
                                        🚫 Hủy đặt phòng
                                    </button>
                                )}

                                {booking.trangThai === 'ChoThanhToan' && (
                                    <button
                                        className="btn-primary"
                                        style={{ marginLeft: '10px' }}
                                        onClick={() => handleResumePayment(booking)}
                                    >
                                        💳 Thanh toán ngay
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

            {/* Modal Hủy đặt phòng */}
            {cancelModal.show && (
                <div className="modal-backdrop" onClick={closeCancelModal}>
                    <div className="modal modal-booking" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-gradient">
                            <div className="modal-header-content">
                                <div className="modal-icon">🚫</div>
                                <div>
                                    <h3 className="modal-title-large">Yêu cầu hủy đặt phòng</h3>
                                    <p className="modal-subtitle">Mã đặt phòng: <strong>#{cancelModal.booking?.maDatPhong}</strong></p>
                                </div>
                            </div>
                            <button className="modal-close-btn-gradient" onClick={closeCancelModal}>✕</button>
                        </div>

                        <div className="modal-body" style={{ padding: '2rem' }}>
                            {cancelModal.loading ? (
                                <div style={{ textAlign: 'center', padding: '3rem' }}>
                                    <div className="spinner"></div>
                                    <p style={{ marginTop: '1rem', color: '#64748b' }}>Đang kiểm tra điều kiện hủy...</p>
                                </div>
                            ) : !cancelModal.checkResult ? (
                                <div className="error-message">Không thể kiểm tra điều kiện hủy. Vui lòng thử lại!</div>
                            ) : !cancelModal.checkResult.success ? (
                                <div className="cancellation-policy-error">
                                    <div className="policy-icon">⚠️</div>
                                    <h4 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '1rem' }}>Không thể hủy đặt phòng</h4>
                                    <p style={{ color: '#64748b' }}>{cancelModal.checkResult.message}</p>
                                    <div className="policy-rules">
                                        <strong style={{ color: '#92400e', display: 'block', marginBottom: '0.5rem' }}>Chính sách hủy phòng:</strong>
                                        <ul>
                                            <li>Hủy trước 15 ngày: Hoàn tiền 100%</li>
                                            <li>Hủy từ 8 - 14 ngày: Hoàn tiền 50% (Phí giữ 50%)</li>
                                            <li>Hủy dưới 7 ngày: Không được hoàn tiền</li>
                                        </ul>
                                    </div>
                                    <button className="btn-detail" onClick={closeCancelModal} style={{ width: '100%', marginTop: '2rem' }}>Đóng</button>
                                </div>
                            ) : (
                                <div className="cancellation-form">
                                    <div className="refund-summary-card">
                                        <div className="summary-item">
                                            <span>Tổng số tiền đã thanh toán</span>
                                            <span className="value">{formatCurrency(cancelModal.booking.tongTien)}</span>
                                        </div>
                                        <div className="summary-item">
                                            <span>Phí giữ phòng (Phạt)</span>
                                            <span className="value penalty">-{formatCurrency(cancelModal.checkResult.data.phiGiu)}</span>
                                        </div>
                                        <div className="summary-total">
                                            <span>Số tiền thực tế hoàn trả</span>
                                            <span className="value refund">{formatCurrency(cancelModal.checkResult.data.tienHoan)}</span>
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                        <label className="form-label">Lý do hủy phòng <span style={{ color: '#ef4444' }}>*</span></label>
                                        <textarea
                                            className="form-input-modern"
                                            rows="3"
                                            placeholder="Vui lòng cho chúng tôi biết lý do bạn muốn hủy phòng..."
                                            value={cancelForm.lyDo}
                                            onChange={e => setCancelForm({ ...cancelForm, lyDo: e.target.value })}
                                            required
                                        />
                                    </div>

                                    {cancelModal.checkResult.data.tienHoan > 0 && (
                                        <div className="bank-info-card">
                                            <div className="bank-info-header">
                                                <span>🏦 Thông tin nhận hoàn tiền</span>
                                            </div>
                                            <div className="bank-grid">
                                                <div className="form-group">
                                                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Ngân hàng</label>
                                                    <input
                                                        type="text"
                                                        className="form-input-modern"
                                                        placeholder="Vidu: MB Bank"
                                                        value={cancelForm.nganHang}
                                                        onChange={e => setCancelForm({ ...cancelForm, nganHang: e.target.value })}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Số tài khoản</label>
                                                    <input
                                                        type="text"
                                                        className="form-input-modern"
                                                        placeholder="Số tài khoản của bạn"
                                                        value={cancelForm.soTaiKhoan}
                                                        onChange={e => setCancelForm({ ...cancelForm, soTaiKhoan: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                                <label className="form-label" style={{ fontSize: '0.8rem' }}>Tên chủ tài khoản</label>
                                                <input
                                                    type="text"
                                                    className="form-input-modern"
                                                    placeholder="VIET CHU HOA KHONG DAU (VD: NGUYEN VAN A)"
                                                    value={cancelForm.tenChuTK}
                                                    onChange={e => setCancelForm({ ...cancelForm, tenChuTK: e.target.value.toUpperCase() })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="modal-actions">
                                        <button className="btn-cancel-modern" onClick={closeCancelModal}>Hủy bỏ</button>
                                        <button
                                            className="btn-submit-modern"
                                            onClick={handleRequestCancel}
                                            disabled={!cancelForm.lyDo || (cancelModal.checkResult.data.tienHoan > 0 && (!cancelForm.nganHang || !cancelForm.soTaiKhoan || !cancelForm.tenChuTK))}
                                        >
                                            Gửi yêu cầu hủy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {toast.show && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
        </div >
    );
}
