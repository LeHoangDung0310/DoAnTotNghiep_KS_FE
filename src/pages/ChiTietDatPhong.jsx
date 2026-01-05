import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Toast from '../components/Common/Toast';
import '../styles/chitietdatphong.css';
import { FaArrowLeft, FaUser, FaHotel, FaCalendarAlt, FaMoon, FaBed, FaFilePdf, FaClock, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';

export default function ChiTietDatPhong() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/api/DatPhong/${id}`);
                if (response.data.success) {
                    setBooking(response.data.data);
                } else {
                    setError(response.data.message || 'Không tìm thấy thông tin đặt phòng');
                }
            } catch (err) {
                console.error('Error fetching booking details:', err);
                setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBookingDetails();
        }
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            'DangSuDung': 'Đang sử dụng',
            'HoanThanh': 'Hoàn thành',
            'DaHuy': 'Đã hủy',
            'ChoThanhToan': 'Chờ thanh toán',
            'DaDuyet': 'Đã xác nhận'
        };
        return statusMap[status] || status;
    };

    if (loading) {
        return (
            <div className="booking-detail-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Đang tải chi tiết đặt phòng...</p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="booking-detail-container">
                <div className="error-message">
                    <h3>⚠️ Lỗi</h3>
                    <p>{error || 'Không tìm thấy thông tin đặt phòng'}</p>
                    <button className="btn-primary" onClick={() => navigate('/bookings')}>Quay lại danh sách</button>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-detail-page">
            {/* UI View (Screen only) */}
            <div className="no-print">
                <div className="detail-header-v2">
                    <button className="btn-back-v2" onClick={() => navigate('/bookings')}>
                        <FaArrowLeft /> <span>Quay lại</span>
                    </button>
                    <div>
                        <h1>Chi tiết đặt phòng</h1>
                        <p style={{ margin: '5px 0 0', opacity: 0.9, fontWeight: 500 }}>
                            Hệ thống quản lý khách sạn - Mã đơn: #{booking.maDatPhong}
                        </p>
                    </div>
                </div>

                <div className="detail-container">
                    <div className="detail-main-grid">
                        <section className="detail-card info-section">
                            <div className="card-header">
                                <FaUser className="header-icon" />
                                <h3>Thông tin khách hàng</h3>
                            </div>
                            <div className="card-body">
                                <div className="info-group">
                                    <span className="label">👤 Họ tên khách hàng:</span>
                                    <span className="value">{booking.tenKhachHang}</span>
                                </div>
                                <div className="info-group">
                                    <span className="label">📧 Địa chỉ Email:</span>
                                    <span className="value">{booking.emailKhachHang || '—'}</span>
                                </div>
                                <div className="info-group">
                                    <span className="label">📞 Số điện thoại:</span>
                                    <span className="value">{booking.soDienThoai || '—'}</span>
                                </div>
                            </div>
                        </section>

                        <section className="detail-card info-section">
                            <div className="card-header">
                                <FaHotel className="header-icon" />
                                <h3>Trạng thái & Thời gian</h3>
                            </div>
                            <div className="card-body">
                                <div className="info-group">
                                    <span className="label">Trạng thái:</span>
                                    <span className={`status-pill status-${booking.trangThai?.toLowerCase()}`}>
                                        {booking.trangThai === 'HoanThanh' && <FaCheckCircle />}
                                        {booking.trangThai === 'DaHuy' && <FaTimesCircle />}
                                        {booking.trangThai === 'ChoThanhToan' && <FaClock />}
                                        {booking.trangThai === 'DaDuyet' && <FaCheckCircle />}
                                        <span>{getStatusLabel(booking.trangThai)}</span>
                                    </span>
                                </div>
                                <div className="info-group">
                                    <span className="label">📅 Ngày đặt:</span>
                                    <span className="value">{formatDate(booking.ngayDat)}</span>
                                </div>
                                <div className="info-group">
                                    <span className="label">🔑 Nhận phòng:</span>
                                    <span className="value">{formatDate(booking.ngayNhanPhong)}</span>
                                </div>
                                <div className="info-group">
                                    <span className="label">🚪 Trả phòng:</span>
                                    <span className="value">{formatDate(booking.ngayTraPhong)}</span>
                                </div>
                                {booking.thoiGianCheckIn && (
                                    <div className="info-group">
                                        <span className="label">✅ Check-in thực tế:</span>
                                        <span className="value" style={{ color: '#059669' }}>{formatDateTime(booking.thoiGianCheckIn)}</span>
                                    </div>
                                )}
                                {booking.thoiGianCheckOut && (
                                    <div className="info-group">
                                        <span className="label">🚪 Check-out thực tế:</span>
                                        <span className="value" style={{ color: '#dc2626' }}>{formatDateTime(booking.thoiGianCheckOut)}</span>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    <section className="detail-card table-section">
                        <div className="card-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <FaBed className="header-icon" />
                                <h3>Danh sách phòng đã chọn ({booking.danhSachPhong?.length || 0})</h3>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="modern-table">
                                    <thead>
                                        <tr>
                                            <th>STT</th>
                                            <th>Mã phòng</th>
                                            <th>Loại phòng</th>
                                            <th>Sức chứa</th>
                                            <th className="txt-right">Đơn giá/đêm</th>
                                            <th className="txt-right">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {booking.danhSachPhong?.map((room, index) => (
                                            <tr key={index}>
                                                <td>{(index + 1).toString().padStart(2, '0')}</td>
                                                <td>
                                                    <span className="room-number">
                                                        {room.soPhong || room.maPhong || (room.MaPhong ? `ID:${room.MaPhong}` : 'Chưa gán')}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 600 }}>{room.tenLoaiPhong}</td>
                                                <td><FaUser style={{ marginRight: '8px', color: '#64748b' }} /> {room.soNguoi} người</td>
                                                <td className="txt-right font-semibold">{formatCurrency(room.giaPhong)}</td>
                                                <td className="txt-right font-bold" style={{ color: '#4f46e5' }}>
                                                    {formatCurrency(room.giaPhong * booking.soNgayO)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    <div className="detail-actions-footer">
                        <div className="total-summary-card">
                            <div className="summary-label">
                                <FaMoon style={{ marginRight: '10px', color: '#6366f1' }} />
                                <span>Tổng cộng ({booking.soNgayO} đêm):</span>
                            </div>
                            <div className="summary-value" style={{ fontSize: '3rem' }}>{formatCurrency(booking.tongTien)}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button className="btn-export-pdf" onClick={handlePrint} style={{ background: 'var(--primary-gradient)' }}>
                                <FaFilePdf /> <span>Xuất hóa đơn</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print View (Hidden on screen, visible during window.print()) */}
            <div className="invoice-print-container">
                <div className="invoice-header">
                    <div className="company-info">
                        <h3>CÔNG TY CỔ PHẦN KHÁCH SẠN DA NANG BAY</h3>
                        <p>Mã số thuế: 0101245789</p>
                        <p>Địa chỉ: 02 Thanh Sơn, Thanh Bình, Hải Châu, Đà Nẵng</p>
                        <p>Điện thoại: 0236 858 0103 | Email: info@danangbayhotel.vn</p>
                        <p>Số tài khoản: 123456789 – Ngân hàng ABC Bank</p>
                    </div>
                    <div className="invoice-meta">
                        <div className="meta-box">
                            <p>Mẫu số: <strong>01GTKT0/001</strong></p>
                            <p>Ký hiệu: <strong>HA/19E</strong></p>
                            <hr />
                            <p>Số: <strong>{String(booking.maDatPhong).padStart(7, '0')}</strong></p>
                        </div>
                    </div>
                </div>

                <div className="invoice-title">
                    <h1>HÓA ĐƠN GIÁ TRỊ GIA TĂNG</h1>
                    <p className="subtitle">(Bản hàng hóa, dịch vụ)</p>
                    <p className="date">Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
                </div>

                <div className="invoice-section">
                    <h3 className="section-title">THÔNG TIN NGƯỜI MUA</h3>
                    <div className="buyer-info">
                        <div className="info-line">
                            <span className="label">Họ tên người mua:</span>
                            <span className="value">{booking.tenKhachHang}</span>
                        </div>
                        <div className="info-line">
                            <span className="label">Tên đơn vị:</span>
                            <span className="value">---</span>
                        </div>
                        <div className="info-line">
                            <span className="label">Mã số thuế:</span>
                            <span className="value">---</span>
                        </div>
                        <div className="info-line">
                            <span className="label">Địa chỉ:</span>
                            <span className="value">---</span>
                        </div>
                        <div className="info-line">
                            <span className="label">Hình thức thanh toán:</span>
                            <span className="value">Online / VNPAY</span>
                        </div>
                    </div>
                </div>

                <div className="invoice-section">
                    <h3 className="section-title">THÔNG TIN ĐẶT PHÒNG</h3>
                    <div className="event-info">
                        <div className="info-line">
                            <span className="label">Thời gian ở:</span>
                            <span className="value">{formatDate(booking.ngayNhanPhong)} - {formatDate(booking.ngayTraPhong)} ({booking.soNgayO} đêm)</span>
                        </div>
                        <div className="info-line">
                            <span className="label">Địa điểm:</span>
                            <span className="value">Đà Nẵng Luxury Hotel & Resort</span>
                        </div>
                    </div>
                </div>

                <table className="invoice-table">
                    <thead>
                        <tr>
                            <th rowSpan="2">STT</th>
                            <th rowSpan="2">Tên hàng hóa, dịch vụ</th>
                            <th rowSpan="2">Đơn vị tính</th>
                            <th rowSpan="2">Số lượng</th>
                            <th rowSpan="2">Đơn giá</th>
                            <th rowSpan="2">Thành tiền</th>
                            <th colSpan="3">Thuế GTGT</th>
                        </tr>
                        <tr>
                            <th>Thuế suất</th>
                            <th>Tiền thuế</th>
                            <th>Tổng cộng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {booking.danhSachPhong?.map((room, index) => (
                            <tr key={index}>
                                <td className="txt-center">{index + 1}</td>
                                <td>Phòng {room.soPhong} ({room.tenLoaiPhong})</td>
                                <td className="txt-center">Phòng/Đêm</td>
                                <td className="txt-center">{booking.soNgayO}</td>
                                <td className="txt-right">{formatCurrency(room.giaPhong)}</td>
                                <td className="txt-right">{formatCurrency(room.giaPhong * booking.soNgayO)}</td>
                                <td className="txt-center">0%</td>
                                <td className="txt-right">0₫</td>
                                <td className="txt-right">{formatCurrency(room.giaPhong * booking.soNgayO)}</td>
                            </tr>
                        ))}
                        <tr className="summary-row">
                            <td colSpan="5" className="txt-right font-bold">Cộng tiền hàng:</td>
                            <td className="txt-right font-bold">{formatCurrency(booking.tongTien)}</td>
                            <td className="txt-center">---</td>
                            <td className="txt-right">0₫</td>
                            <td className="txt-right font-bold">{formatCurrency(booking.tongTien)}</td>
                        </tr>
                        <tr className="final-total">
                            <td colSpan="8" className="txt-right font-bold">Tổng tiền thanh toán:</td>
                            <td className="txt-right font-bold txt-red">{formatCurrency(booking.tongTien)}</td>
                        </tr>
                    </tbody>
                </table>

                <div className="amount-in-words">
                    <span className="label">Số tiền viết bằng chữ:</span>
                    <span className="value italic"> (Vui lòng tự chuyển đổi số tiền {formatCurrency(booking.tongTien)} sang chữ)</span>
                </div>

                <div className="payment-status-box">
                    <p>Trạng thái thanh toán: <strong>{booking.trangThai === 'ChoThanhToan' ? 'CHƯA THANH TOÁN' : 'ĐÃ THANH TOÁN'}</strong></p>
                    <p>Thời gian thanh toán: {formatDateTime(booking.thoiGianCheckIn || booking.ngayDat)}</p>
                </div>

                <div className="signatures">
                    <div className="sig-box">
                        <p className="sig-title">NGƯỜI MUA HÀNG</p>
                        <p className="sig-note">(Ký, ghi rõ họ, tên)</p>
                    </div>
                    <div className="sig-box">
                        <p className="sig-title">NGƯỜI BÁN HÀNG</p>
                        <p className="sig-note">(Ký, ghi rõ họ, tên)</p>
                    </div>
                </div>

                <div className="invoice-footer">
                    <p>Hóa đơn được xuất ngày: {new Date().toLocaleDateString('vi-VN')} lúc {new Date().toLocaleTimeString('vi-VN')}</p>
                    <p>Mã đặt vé: {booking.maDatPhong}</p>
                </div>
            </div>

            {toast.show && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
        </div>
    );
}
