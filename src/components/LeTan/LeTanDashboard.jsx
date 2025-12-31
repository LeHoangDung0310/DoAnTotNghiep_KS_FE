import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import dayjs from 'dayjs';
import 'dayjs/locale/vi'; // Import Vietnamese locale
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
import { FaBed, FaSignInAlt, FaSignOutAlt, FaBan, FaArrowRight, FaClock } from 'react-icons/fa';
import { Tabs, Tag } from 'antd';
import 'antd/dist/reset.css';
import '../../styles/LeTanDBoard.css';

// Set locale to Vietnamese
dayjs.locale('vi');

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function formatDate(date) {
  return dayjs(date).format('DD/MM/YYYY');
}

export default function LeTanDashboard() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({
    phongTrong: 0,
    checkInNgay: 0,
    checkOutNgay: 0,
    huyChoDuyetNgay: 0,
    huy7Ngay: 0,
  });
  const [dsDatPhong, setDsDatPhong] = useState([]);
  const [dsHuy, setDsHuy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today');
  const [chartData, setChartData] = useState(null);

  // Pagination states
  const PAGE_SIZE = 5;
  const [currentPageDP, setCurrentPageDP] = useState(1);
  const [currentPageHuy, setCurrentPageHuy] = useState(1);

  useEffect(() => {
    fetchStatsAndTable();
    setCurrentPageDP(1);
    setCurrentPageHuy(1);
  }, [filter, selectedYear]);

  useEffect(() => {
    fetchChartData();
  }, [selectedYear]);

  const fetchStatsAndTable = async () => {
    setLoading(true);
    try {
      const [resDatPhong, resPhong, resHuy] = await Promise.all([
        api.get('/api/DatPhong'),
        api.get('/api/Phong'),
        api.get('/api/HuyDatPhong')
      ]);

      const datPhongs = resDatPhong.data?.data || [];
      const phongs = resPhong.data?.data || [];
      const huyList = resHuy.data?.data || [];

      const today = dayjs();
      const thisMonth = today.month();
      const thisYear = selectedYear; // Respect selected year

      let phongTrong = phongs.filter(p => p.trangThai === 'Trong').length;
      let checkInNgay = 0, checkOutNgay = 0, huyChoDuyetNgay = 0;
      let dsDatPhongHomNay = [], dsHuyHomNay = [];

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

  const fetchChartData = async () => {
    try {
      const [resDatPhong, resHuy] = await Promise.all([
        api.get('/api/DatPhong'),
        api.get('/api/HuyDatPhong')
      ]);
      const datPhongs = resDatPhong.data?.data || [];
      const huyList = resHuy.data?.data || [];

      const months = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
      const checkinCounts = Array(12).fill(0);
      const checkoutCounts = Array(12).fill(0);
      const cancelCounts = Array(12).fill(0);

      // Nhận phòng (CheckedIn/DangSuDung/HoanThanh) trong năm chọn
      datPhongs.forEach(dp => {
        if (dayjs(dp.ngayDat).year() === selectedYear) {
          const m = dayjs(dp.ngayNhanPhong).month();
          if (['CheckedIn', 'DangSuDung', 'HoanThanh'].includes(dp.trangThai)) {
            checkinCounts[m]++;
          }
          if (dp.trangThai === 'HoanThanh') {
            checkoutCounts[m]++;
          }
        }
      });

      // Hủy đặt (Đã hủy)
      huyList.forEach(h => {
        if (dayjs(h.ngayYeuCau).year() === selectedYear) {
          const m = dayjs(h.ngayYeuCau).month();
          if (h.trangThai === 'DaDuyet' || h.trangThai === 'DaHuy') {
            cancelCounts[m]++;
          }
        }
      });

      setChartData({
        labels: months,
        datasets: [
          {
            label: 'Nhận phòng',
            data: checkinCounts,
            backgroundColor: '#10b981',
            borderRadius: 6,
            barThickness: 12,
          },
          {
            label: 'Trả phòng',
            data: checkoutCounts,
            backgroundColor: '#6366f1',
            borderRadius: 6,
            barThickness: 12,
          },
          {
            label: 'Hủy đặt',
            data: cancelCounts,
            backgroundColor: '#ef4444',
            borderRadius: 6,
            barThickness: 12,
          },
        ],
      });
    } catch (err) {
      console.error(err);
    }
  };

  const kpiCards = [
    { icon: <FaBed />, label: 'Phòng trống', value: stats.phongTrong, theme: 'info', description: 'Sẵn sàng đón khách' },
    { icon: <FaSignInAlt />, label: 'Nhận phòng', value: stats.checkInNgay, theme: 'success', description: `Đã xử lý ${filter === 'today' ? 'hôm nay' : 'trong tháng'}` },
    { icon: <FaSignOutAlt />, label: 'Trả phòng', value: stats.checkOutNgay, theme: 'primary', description: `Đã xử lý ${filter === 'today' ? 'hôm nay' : 'trong tháng'}` },
    { icon: <FaBan />, label: 'Đợi hủy', value: stats.huyChoDuyetNgay, theme: 'warning', description: 'Cần phê duyệt ngay' },
  ];

  const getStatusTag = (status) => {
    switch (status) {
      case 'ChoDuyet': case 'Pending': case 'ChoThanhToan': return <Tag color="gold">CHỜ DUYỆT</Tag>;
      case 'CheckedIn': case 'DangSuDung': case 'DaDuyet': return <Tag color="green">ĐANG Ở / ĐÃ DUYỆT</Tag>;
      case 'HoanThanh': return <Tag color="blue">HOÀN THÀNH</Tag>;
      case 'DaHuy': return <Tag color="error">ĐÃ HỦY</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const Pagination = ({ current, total, pageSize, onChange }) => {
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) return null;

    return (
      <div className="custom-pagination">
        <button
          disabled={current === 1}
          onClick={() => onChange(current - 1)}
          className="pag-btn"
        >
          Trước
        </button>
        <div className="pag-numbers">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              className={`pag-num ${current === i + 1 ? 'active' : ''}`}
              onClick={() => onChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          disabled={current === totalPages}
          onClick={() => onChange(current + 1)}
          className="pag-btn"
        >
          Sau
        </button>
      </div>
    );
  };

  const paginatedDP = dsDatPhong.slice((currentPageDP - 1) * PAGE_SIZE, currentPageDP * PAGE_SIZE);
  const paginatedHuy = dsHuy.slice((currentPageHuy - 1) * PAGE_SIZE, currentPageHuy * PAGE_SIZE);

  const tabItems = [
    {
      key: 'incoming',
      label: 'Danh sách đặt phòng',
      children: (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Mã Đặt</th>
                <th>Khách Hàng</th>
                <th>Thời Gian Lưu Trú</th>
                <th>Phòng</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDP.map(dp => (
                <tr key={dp.maDatPhong}>
                  <td><span className="id-badge">#{dp.maDatPhong}</span></td>
                  <td>
                    <div className="guest-info">
                      <span className="guest-name">{dp.tenKhachHang}</span>
                      <span className="guest-sub">Khách hàng thành viên</span>
                    </div>
                  </td>
                  <td>
                    <div className="stay-duration">
                      <FaClock size={12} /> {formatDate(dp.ngayNhanPhong)} <FaArrowRight size={10} /> {formatDate(dp.ngayTraPhong)}
                    </div>
                  </td>
                  <td>
                    <div className="room-badges">
                      {dp.danhSachPhong?.map(p => <span key={p.maPhong} className="room-item">P.{p.soPhong}</span>)}
                    </div>
                  </td>
                  <td>{getStatusTag(dp.trangThai)}</td>
                </tr>
              ))}
              {dsDatPhong.length === 0 && <tr><td colSpan={6} className="empty-row">Không có lịch đặt nào trong thời gian này</td></tr>}
            </tbody>
          </table>
          <Pagination
            current={currentPageDP}
            total={dsDatPhong.length}
            pageSize={PAGE_SIZE}
            onChange={setCurrentPageDP}
          />
        </div>
      )
    },
    {
      key: 'cancellation',
      label: 'Yêu cầu hủy phòng',
      children: (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Mã Hủy</th>
                <th>Khách Hàng</th>
                <th>Số Tiền</th>
                <th>Lý Do</th>
                <th>Ngày Yêu Cầu</th>
              </tr>
            </thead>
            <tbody>
              {paginatedHuy.map(h => (
                <tr key={h.maHuyDatPhong}>
                  <td><span className="id-badge danger">#{h.maHuyDatPhong}</span></td>
                  <td><span className="guest-name">{h.tenKhachHang}</span></td>
                  <td><span className="price-tag">{h.tongTien?.toLocaleString('vi-VN')}₫</span></td>
                  <td className="reason-cell" title={h.lyDo}>{h.lyDo}</td>
                  <td>{formatDate(h.ngayYeuCau)}</td>
                </tr>
              ))}
              {dsHuy.length === 0 && <tr><td colSpan={6} className="empty-row">Hiện không có yêu cầu hủy nào cần xử lý</td></tr>}
            </tbody>
          </table>
          <Pagination
            current={currentPageHuy}
            total={dsHuy.length}
            pageSize={PAGE_SIZE}
            onChange={setCurrentPageHuy}
          />
        </div>
      )
    }
  ];

  return (
    <div className="dashboard-wrapper">
      <div className="glass-container">
        {/* Header Section */}
        <header className="dashboard-header">
          <div className="welcome-info">
            <h1 className="main-title">Trung Tâm Điều Hành</h1>
            <div className="status-pill">
              <span className="pulse-dot"></span>
              Lễ tân trực tuyến • Quản lý vận hành chuyên nghiệp
            </div>
          </div>
          <div className="filter-controls">
            <div className="year-selector-lt">
              <label>Năm: </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="lt-select-year"
              >
                {[2023, 2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="toggle-group">
              <button className={filter === 'today' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setFilter('today')}>HÀNG NGÀY</button>
              <button className={filter === 'month' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setFilter('month')}>HÀNG THÁNG</button>
            </div>
          </div>
        </header>

        {/* KPI Grid */}
        <div className="kpi-grid">
          {kpiCards.map((card, idx) => (
            <div key={idx} className={`kpi-card ${card.theme}`}>
              <div className="kpi-icon-wrapper">
                {card.icon}
              </div>
              <div className="kpi-content">
                <span className="kpi-label">{card.label}</span>
                <span className="kpi-value">{card.value}</span>
                <span className="kpi-desc">{card.description}</span>
              </div>
              <div className="kpi-visual"></div>
            </div>
          ))}
        </div>

        {/* Main Workspace */}
        <div className="workspace-grid">
          <div className="data-panel">
            <Tabs defaultActiveKey="incoming" items={tabItems} className="custom-tabs" />
          </div>

          <div className="analytics-panel">
            <div className="panel-header-lt">
              <div>
                <h3>Mật Độ Lưu Trú - Năm {selectedYear}</h3>
                <p>Thống kê trạng thái đặt phòng theo từng tháng</p>
              </div>
            </div>
            <div className="chart-wrapper">
              {chartData ? (
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { usePointStyle: true, font: { weight: '600', size: 11, family: 'Plus Jakarta Sans' } } },
                      tooltip: { backgroundColor: '#1e293b', padding: 12, cornerRadius: 8, titleFont: { family: 'Plus Jakarta Sans' }, bodyFont: { family: 'Plus Jakarta Sans' } }
                    },
                    scales: {
                      y: { grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { stepSize: 1, font: { family: 'Plus Jakarta Sans' } } },
                      x: { grid: { display: false }, ticks: { font: { family: 'Plus Jakarta Sans' } } }
                    }
                  }}
                />
              ) : <div className="loading-spinner">Đang phân tích dữ liệu...</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
