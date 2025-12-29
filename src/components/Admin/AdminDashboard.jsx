import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import {
    FaMoneyBillWave,
    FaUsers,
    FaHotel,
    FaExclamationCircle,
    FaArrowRight,
    FaHistory
} from 'react-icons/fa';
import dayjs from 'dayjs';
import '../../styles/AdminDashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        roomOccupancy: 0,
        totalUsers: 0,
        pendingRefunds: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [resStats, resDatPhong, resPhong, resHuy] = await Promise.all([
                api.get('/api/NguoiDung/Statistics'),
                api.get('/api/DatPhong'),
                api.get('/api/Phong'),
                api.get('/api/HuyDatPhong')
            ]);

            const userStats = resStats.data?.data || {};
            const bookings = resDatPhong.data?.data || [];
            const rooms = resPhong.data?.data || [];
            const refunds = resHuy.data?.data || [];

            // Calculate Revenue (Sum of all completed or checked-in bookings)
            const revenue = bookings
                .filter(b => ['HoanThanh', 'CheckedIn', 'DangSuDung'].includes(b.trangThai))
                .reduce((sum, b) => sum + (b.tongTien || 0), 0);

            // Calculate Occupancy
            const occupiedRooms = rooms.filter(r => r.trangThai === 'CoKhach').length;
            const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;

            setStats({
                totalRevenue: revenue,
                roomOccupancy: occupancyRate,
                totalUsers: userStats.total || 0,
                pendingRefunds: refunds.filter(r => r.trangThai === 'ChoDuyet').length
            });

            // Recent Activity (Latest 5 bookings)
            setRecentBookings(bookings.slice(0, 5));

            // Prepare Chart Data (Revenue by month for the current year)
            const months = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
            const monthlyRevenue = Array(12).fill(0);

            bookings.forEach(b => {
                if (['HoanThanh', 'CheckedIn'].includes(b.trangThai)) {
                    const month = dayjs(b.ngayDat).month();
                    monthlyRevenue[month] += b.tongTien || 0;
                }
            });

            setChartData({
                labels: months,
                datasets: [
                    {
                        label: 'Doanh thu (VNĐ)',
                        data: monthlyRevenue,
                        backgroundColor: '#10b981',
                        borderRadius: 8,
                        barThickness: 20,
                    }
                ]
            });

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        }
        setLoading(false);
    };

    const kpis = [
        {
            label: 'Tổng doanh thu',
            value: `${stats.totalRevenue.toLocaleString('vi-VN')}₫`,
            icon: <FaMoneyBillWave />,
            theme: 'revenue'
        },
        {
            label: 'Công suất phòng',
            value: `${stats.roomOccupancy}%`,
            icon: <FaHotel />,
            theme: 'occupancy'
        },
        {
            label: 'Người dùng',
            value: stats.totalUsers,
            icon: <FaUsers />,
            theme: 'users'
        },
        {
            label: 'Yêu cầu chờ',
            value: stats.pendingRefunds,
            icon: <FaExclamationCircle />,
            theme: 'issues'
        }
    ];

    if (loading) return <div className="admin-loading">Khởi tạo hệ sinh thái dữ liệu...</div>;

    return (
        <div className="admin-db-wrapper">
            <div className="admin-db-container">

                {/* Statistics Grid */}
                <div className="stats-grid">
                    {kpis.map((kpi, idx) => (
                        <div key={idx} className={`stats-card ${kpi.theme}`}>
                            <div className="stats-icon-box">{kpi.icon}</div>
                            <div className="stats-info">
                                <span className="stats-label">{kpi.label}</span>
                                <span className="stats-value">{kpi.value}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Workspace */}
                <div className="admin-db-main">

                    {/* Revenue Chart */}
                    <div className="chart-panel">
                        <h3 className="panel-title"><span><FaHistory /></span> Doanh Thu Theo Tháng</h3>
                        <div className="admin-chart-wrapper">
                            {chartData && (
                                <Bar
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: {
                                                backgroundColor: '#064e3b',
                                                padding: 12,
                                                titleFont: { size: 14, weight: 'bold' },
                                                bodyFont: { size: 13 }
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                grid: { color: '#f1f5f9' },
                                                ticks: { callback: (val) => `${(val / 1000000).toFixed(1)}M` }
                                            },
                                            x: { grid: { display: false } }
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="activity-panel">
                        <h3 className="panel-title"><span><FaArrowRight /></span> Đặt Phòng Gần Đây</h3>
                        <div className="activity-list">
                            {recentBookings.map((b, idx) => (
                                <div key={idx} className="activity-item">
                                    <div className="activity-avatar">
                                        {b.tenKhachHang?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="activity-details">
                                        <span className="activity-text">
                                            <b>{b.tenKhachHang}</b> đã đặt #{b.maDatPhong}
                                        </span>
                                        <span className="activity-time">
                                            {dayjs(b.ngayDat).format('DD/MM/YYYY HH:mm')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {recentBookings.length === 0 && <p className="empty-text">Chưa có hoạt động nào.</p>}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
