import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import dayjs from 'dayjs';
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
import { FaBed, FaSignInAlt, FaSignOutAlt, FaBan } from 'react-icons/fa';
import { Tabs } from 'antd';
import 'antd/dist/reset.css';
import '../../styles/LeTanDBoard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function formatDate(date) {
  return dayjs(date).format('DD/MM/YYYY');
}

export default function LeTanDashboard() {
  const [stats, setStats] = useState({
    phongTrong: 0,
    checkInNgay: 0,
    checkOutNgay: 0,
    huyChoDuyetNgay: 0,
    huy7Ngay: 0, // Thêm thống kê số lượng hủy 7 ngày gần nhất
  });
  const [dsDatPhong, setDsDatPhong] = useState([]);
  const [dsHuy, setDsHuy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today'); // 'today' | 'month'
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchStatsAndTable();
  }, [filter]);

  useEffect(() => {
    fetchChartData();
  }, []); // chỉ chạy 1 lần khi mount

  // Lấy dữ liệu KPI và bảng theo filter
  const fetchStatsAndTable = async () => {
    setLoading(true);
    try {
      const resDatPhong = await api.get('/api/DatPhong');
      const datPhongs = resDatPhong.data?.data || [];
      const resPhong = await api.get('/api/Phong');
      const phongs = resPhong.data?.data || [];
      const resHuy = await api.get('/api/HuyDatPhong');
      const huyList = resHuy.data?.data || [];

      const today = dayjs();
      const thisMonth = today.month();
      const thisYear = today.year();

      // KPI
      let phongTrong = phongs.filter(p => p.trangThai === 'Trong').length;
      let checkInNgay = 0, checkOutNgay = 0, huyChoDuyetNgay = 0;
      let dsDatPhongHomNay = [], dsHuyHomNay = [];

      // Thống kê số lượng hủy trong 7 ngày gần nhất
      let huy7Ngay = 0;
      for (let i = 0; i < 7; i++) {
        const d = today.subtract(i, 'day');
        huy7Ngay += huyList.filter(h => h.trangThai === 'ChoDuyet' && dayjs(h.ngayYeuCau).isSame(d, 'day')).length;
      }

      if (filter === 'today') {
        checkInNgay = datPhongs.filter(dp => dp.thoiGianCheckIn && dayjs(dp.thoiGianCheckIn).isSame(today, 'day')).length;
        checkOutNgay = datPhongs.filter(dp => dp.thoiGianCheckOut && dayjs(dp.thoiGianCheckOut).isSame(today, 'day')).length;
        huyChoDuyetNgay = huyList.filter(h => h.trangThai === 'ChoDuyet' && dayjs(h.ngayYeuCau).isSame(today, 'day')).length;
        dsDatPhongHomNay = datPhongs.filter(dp => dayjs(dp.ngayNhanPhong).isSame(today, 'day'));
        dsHuyHomNay = huyList.filter(h => h.trangThai === 'ChoDuyet' && dayjs(h.ngayYeuCau).isSame(today, 'day'));
      } else {
        // Tháng
        checkInNgay = datPhongs.filter(dp => dp.thoiGianCheckIn && dayjs(dp.thoiGianCheckIn).month() === thisMonth && dayjs(dp.thoiGianCheckIn).year() === thisYear).length;
        checkOutNgay = datPhongs.filter(dp => dp.thoiGianCheckOut && dayjs(dp.thoiGianCheckOut).month() === thisMonth && dayjs(dp.thoiGianCheckOut).year() === thisYear).length;
        huyChoDuyetNgay = huyList.filter(h => h.trangThai === 'ChoDuyet' && dayjs(h.ngayYeuCau).month() === thisMonth && dayjs(h.ngayYeuCau).year() === thisYear).length;
        dsDatPhongHomNay = datPhongs.filter(dp => dayjs(dp.ngayNhanPhong).month() === thisMonth && dayjs(dp.ngayNhanPhong).year() === thisYear);
        dsHuyHomNay = huyList.filter(h => h.trangThai === 'ChoDuyet' && dayjs(h.ngayYeuCau).month() === thisMonth && dayjs(h.ngayYeuCau).year() === thisYear);
      }

      setStats({ phongTrong, checkInNgay, checkOutNgay, huyChoDuyetNgay, huy7Ngay });
      setDsDatPhong(dsDatPhongHomNay);
      setDsHuy(dsHuyHomNay);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Lấy dữ liệu biểu đồ 7 ngày gần nhất (không phụ thuộc filter)
  const fetchChartData = async () => {
    try {
      const resDatPhong = await api.get('/api/DatPhong');
      const datPhongs = resDatPhong.data?.data || [];
      const resHuy = await api.get('/api/HuyDatPhong');
      const huyList = resHuy.data?.data || [];
      const today = dayjs();
      const days = [];
      const checkinCounts = [];
      const checkoutCounts = [];
      const cancelCounts = [];
      let hasData = false;
      for (let i = 6; i >= 0; i--) {
        const d = today.subtract(i, 'day');
        days.push(d.format('DD/MM'));
        const checkin = datPhongs.filter(dp => !!dp.thoiGianCheckIn && dayjs(dp.thoiGianCheckIn).isSame(d, 'day')).length;
        const checkout = datPhongs.filter(dp => !!dp.thoiGianCheckOut && dayjs(dp.thoiGianCheckOut).isSame(d, 'day')).length;
        const cancel = huyList.filter(h => h.trangThai === 'ChoDuyet' && dayjs(h.ngayYeuCau).isSame(d, 'day')).length;
        checkinCounts.push(checkin);
        checkoutCounts.push(checkout);
        cancelCounts.push(cancel);
        if (checkin > 0 || checkout > 0 || cancel > 0) hasData = true;
      }
      setChartData({
        labels: days,
        datasets: [
          {
            label: 'Check-in',
            data: checkinCounts,
            backgroundColor: '#1976d2',
            borderRadius: 8,
            barThickness: 18,
          },
          {
            label: 'Check-out',
            data: checkoutCounts,
            backgroundColor: '#7b1fa2',
            borderRadius: 8,
            barThickness: 18,
          },
          {
            label: 'Hủy',
            data: cancelCounts,
            backgroundColor: '#e53935',
            borderRadius: 8,
            barThickness: 18,
          },
        ],
        hasData,
      });
    } catch (err) {
      setChartData(null);
      console.error(err);
    }
  };

  // Card KPI
  const kpiCards = [
    {
      icon: <FaBed size={28} />, label: 'Phòng trống', value: stats.phongTrong, color: '#1976d2', bg: '#e3f2fd'
    },
    {
      icon: <FaSignInAlt size={28} />, label: 'Check-in hôm nay', value: stats.checkInNgay, color: '#7b1fa2', bg: '#ede7f6'
    },
    {
      icon: <FaSignOutAlt size={28} />, label: 'Check-out hôm nay', value: stats.checkOutNgay, color: '#0288d1', bg: '#e1f5fe'
    },
    {
      icon: <FaBan size={28} />, label: 'Hủy chờ duyệt', value: stats.huyChoDuyetNgay, color: '#ff9800', bg: '#fff3e0'
    },
    {
      icon: <FaBan size={28} />, label: 'Hủy 7 ngày', value: stats.huy7Ngay, color: '#e53935', bg: '#ffebee'
    },
  ];

  // Biểu đồ
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: {
        display: true,
        text: 'Check-in / Check-out 7 ngày gần nhất',
        font: { size: 16 },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#e0e0e0' }, ticks: { stepSize: 1, precision: 0 } },
      x: { grid: { color: '#f5f5f5' } },
    },
  };

  // Badge trạng thái
  const getStatusBadge = (status) => {
    let colorClass = 'letan-badge-other', text = 'Khác';
    if (status === 'ChoDuyet' || status === 'Pending') { colorClass = 'letan-badge-pending'; text = 'Chờ duyệt'; }
    else if (status === 'CheckedIn' || status === 'DangSuDung') { colorClass = 'letan-badge-checkedin'; text = 'Đã nhận'; }
    else if (status === 'HoanThanh' || status === 'Completed') { colorClass = 'letan-badge-completed'; text = 'Hoàn thành'; }
    else if (status === 'DaHuy') { colorClass = 'letan-badge-cancelled'; text = 'Đã hủy'; }
    return <span className={`letan-status-badge ${colorClass}`}>{text}</span>;
  };

  // Tab bảng dữ liệu
  const tabItems = [
    {
      key: 'datphong',
      label: 'Đặt phòng hôm nay',
      children: (
        <div className="letan-table-scroll">
          <table className="letan-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Khách hàng</th>
                <th>Nhận phòng</th>
                <th>Trả phòng</th>
                <th>Trạng thái</th>
                <th>Phòng</th>
                <th>Check-in</th>
                <th>Check-out</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="letan-table-empty">Đang tải dữ liệu...</td></tr>
              ) : dsDatPhong.length === 0 ? (
                <tr><td colSpan={8} className="letan-table-empty">Không có dữ liệu</td></tr>
              ) : dsDatPhong.map(dp => (
                <tr key={dp.maDatPhong} className="letan-table-row">
                  <td>{dp.maDatPhong}</td>
                  <td>{dp.tenKhachHang}</td>
                  <td>{formatDate(dp.ngayNhanPhong)}</td>
                  <td>{formatDate(dp.ngayTraPhong)}</td>
                  <td>{getStatusBadge(dp.trangThai)}</td>
                  <td>{dp.danhSachPhong?.map(p => p.soPhong).join(', ')}</td>
                  <td>{dp.thoiGianCheckIn ? dayjs(dp.thoiGianCheckIn).format('HH:mm') : '-'}</td>
                  <td>{dp.thoiGianCheckOut ? dayjs(dp.thoiGianCheckOut).format('HH:mm') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    },
    {
      key: 'huy',
      label: 'Yêu cầu hủy chờ duyệt',
      children: (
        <div className="letan-table-scroll">
          <table className="letan-table">
            <thead>
              <tr>
                <th>Mã hủy</th>
                <th>Khách hàng</th>
                <th>Ngày nhận</th>
                <th>Ngày trả</th>
                <th>Tổng tiền</th>
                <th>Lý do</th>
                <th>Ngày yêu cầu</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="letan-table-empty">Đang tải dữ liệu...</td></tr>
              ) : dsHuy.length === 0 ? (
                <tr><td colSpan={7} className="letan-table-empty">Không có dữ liệu</td></tr>
              ) : dsHuy.map(h => (
                <tr key={h.maHuyDatPhong} className="letan-table-row">
                  <td>{h.maHuyDatPhong}</td>
                  <td>{h.tenKhachHang}</td>
                  <td>{h.ngayNhanPhong ? formatDate(h.ngayNhanPhong) : '-'}</td>
                  <td>{h.ngayTraPhong ? formatDate(h.ngayTraPhong) : '-'}</td>
                  <td>{h.tongTien?.toLocaleString('vi-VN')}₫</td>
                  <td>{h.lyDo}</td>
                  <td>{formatDate(h.ngayYeuCau)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
  ];

  return (
    <div className="letan-dashboard-root">
      {/* Header */}
      <div className="letan-dashboard-header">
        <h2 className="letan-dashboard-title">Tổng quan lễ tân</h2>
        <div className="letan-dashboard-filter">
          <button
            className={filter === 'today' ? 'letan-btn active' : 'letan-btn'}
            onClick={() => setFilter('today')}
          >Hôm nay</button>
          <button
            className={filter === 'month' ? 'letan-btn active' : 'letan-btn'}
            onClick={() => setFilter('month')}
          >Tháng này</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="letan-kpi-cards">
        {kpiCards.map((card, idx) => (
          <div key={idx} className="letan-kpi-card" style={{ background: card.bg }}>
            <div className="letan-kpi-icon" style={{ color: card.color }}>{card.icon}</div>
            <div className="letan-kpi-value" style={{ color: card.color }}>{card.value}</div>
            <div className="letan-kpi-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Khu vực chi tiết: Bảng + Biểu đồ */}
      <div className="letan-detail-area">
        {/* Bảng dữ liệu (tab) */}
        <div className="letan-table-area">
          <Tabs defaultActiveKey="datphong" items={tabItems} />
        </div>
        {/* Biểu đồ */}
        <div className="letan-chart-area">
          {chartData && (chartData.hasData || (chartData.datasets && (chartData.datasets[0].data.some(v => v > 0) || chartData.datasets[1].data.some(v => v > 0)))) ? (
            <Bar data={chartData} options={chartOptions} height={260} />
          ) : (
            <div className="letan-chart-empty">Không có dữ liệu biểu đồ</div>
          )}
        </div>
      </div>
    </div>
  );
}
