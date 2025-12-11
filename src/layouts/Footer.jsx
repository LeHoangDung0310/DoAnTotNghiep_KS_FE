import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Footer Top */}
        <div className="footer-top">
          <div className="footer-column">
            <div className="footer-logo">
              <div className="logo-icon">🏖️</div>
              <h3>Da Nang Bay Hotel</h3>
            </div>
            <p className="footer-description">
              Khách sạn 5 sao sang trọng tại trung tâm Đà Nẵng.
              Trải nghiệm dịch vụ đẳng cấp quốc tế với tầm nhìn biển tuyệt đẹp.
            </p>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <span>📘</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <span>📷</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <span>🐦</span>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <span>📺</span>
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h4 className="footer-title">Liên kết nhanh</h4>
            <ul className="footer-links">
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/rooms">Phòng & Suite</Link></li>
              <li><Link to="/services">Dịch vụ</Link></li>
              <li><Link to="/about">Giới thiệu</Link></li>
              <li><Link to="/contact">Liên hệ</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-title">Dịch vụ</h4>
            <ul className="footer-links">
              <li><Link to="/spa">Spa & Massage</Link></li>
              <li><Link to="/restaurant">Nhà hàng</Link></li>
              <li><Link to="/pool">Hồ bơi</Link></li>
              <li><Link to="/gym">Phòng Gym</Link></li>
              <li><Link to="/meeting">Phòng họp</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-title">Liên hệ</h4>
            <ul className="footer-contact">
              <li>
                <span className="contact-icon">📍</span>
                <span>123 Võ Nguyên Giáp, Đà Nẵng</span>
              </li>
              <li>
                <span className="contact-icon">📞</span>
                <a href="tel:+84236123456">+84 236 123 456</a>
              </li>
              <li>
                <span className="contact-icon">📧</span>
                <a href="mailto:info@danangbay.com">info@danangbay.com</a>
              </li>
              <li>
                <span className="contact-icon">🕐</span>
                <span>24/7 - Luôn phục vụ</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} <strong>Da Nang Bay Hotel</strong>. All rights reserved.
            </p>
            <div className="footer-legal">
              <Link to="/privacy">Chính sách bảo mật</Link>
              <span className="separator">•</span>
              <Link to="/terms">Điều khoản sử dụng</Link>
              <span className="separator">•</span>
              <Link to="/cookies">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      <button
        className="scroll-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Lên đầu trang"
      >
        ↑
      </button>
    </footer>
  );
}