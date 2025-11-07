import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="home-page">
      <header className="hero" onClick={() => navigate('/login')} role="button" tabIndex={0} aria-label="Mở trang đăng nhập">
        <div className="hero-content">
          <h1>Quản Lý Khách Sạn Đà Nẵng Bay</h1>
          <p>Giải pháp quản lý đặt phòng — nhanh, trực quan và chuyên nghiệp cho khách sạn của bạn.</p>
          <div className="actions">
            <button className="btn primary" onClick={(e) => { e.stopPropagation(); navigate('/login'); }}>
              Đăng nhập ngay
            </button>
            <button className="btn ghost" onClick={(e) => { e.stopPropagation(); navigate('/login'); }}>
              Dùng thử (demo)
            </button>
          </div>
          <small className="hint">Nhấn vào bất kỳ vị trí trên khung để mở trang đăng nhập.</small>
        </div>
        <div className="hero-visual" aria-hidden>
          <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className="sky">
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stopColor="#7c3aed" stopOpacity="0.9" />
                <stop offset="1" stopColor="#06b6d4" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <rect width="800" height="600" fill="url(#g)" />
            <g fill="rgba(255,255,255,0.06)">
              <rect x="60" y="360" width="660" height="180" rx="20" />
              <rect x="120" y="260" width="120" height="140" rx="10" />
              <rect x="260" y="220" width="140" height="180" rx="10" />
              <rect x="430" y="240" width="110" height="160" rx="10" />
              <rect x="560" y="200" width="120" height="200" rx="10" />
            </g>
          </svg>
        </div>
      </header>

      <section className="features">
        <h2>Những tính năng nổi bật</h2>
        <div className="grid">
          <article>
            <h3>Quản lý đặt phòng</h3>
            <p>Đặt, hủy, và theo dõi trạng thái phòng dễ dàng — giảm nhầm lẫn, tăng hiệu suất.</p>
          </article>
          <article>
            <h3>Quản lý khách hàng</h3>
            <p>Hồ sơ khách hàng chi tiết, lịch sử lưu trú và ưu đãi tùy chỉnh.</p>
          </article>
          <article>
            <h3>Báo cáo & thống kê</h3>
            <p>Báo cáo doanh thu, công suất phòng, và KPI trực quan giúp ra quyết định nhanh.</p>
          </article>
          <article>
            <h3>Tích hợp thanh toán</h3>
            <p>Thanh toán trực tuyến an toàn, hỗ trợ nhiều cổng thanh toán phổ biến.</p>
          </article>
        </div>
      </section>

      <footer className="home-footer">
        <div>© {new Date().getFullYear()} Khách Sạn Đà Nẵng Bay — Hệ thống quản lý nội bộ</div>
      </footer>
    </main>
  );
}