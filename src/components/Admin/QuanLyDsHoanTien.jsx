import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../../styles/admin.css';
import Toast from '../Common/Toast';
import ChiTietHoanTien from './ChiTietHoanTien';

export default function QuanLyDsHoanTien() {
  const [hoanTiens, setHoanTiens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedHoanTien, setSelectedHoanTien] = useState(null);
  const [showXacNhanModal, setShowXacNhanModal] = useState(null);

  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchHoanTiens();
  }, []);

  const fetchHoanTiens = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/HuyDatPhong/ChoHoanTien');
      setHoanTiens(res.data.data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách hoàn tiền:', err);
      showToast('error', 'Không thể tải danh sách hoàn tiền');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const hideToast = () => {
    setToast({ show: false, type: '', message: '' });
  };

  // ✅ LỌC & TÌM KIẾM
  const filteredList = hoanTiens.filter((h) => {
    const matchStatus = !filterStatus || h.trangThaiHoanTien === filterStatus;
    const matchSearch =
      !searchTerm ||
      h.tenKhachHang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.emailKhachHang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.soDienThoai?.includes(searchTerm) ||
      h.soTaiKhoan?.includes(searchTerm) ||
      h.maDatPhong?.toString().includes(searchTerm);

    return matchStatus && matchSearch;
  });

  // ✅ THỐNG KÊ
  const tongChoXuLy = hoanTiens.filter((h) => h.trangThaiHoanTien === 'ChoXuLy').length;
  const tongDaHoan = hoanTiens.filter((h) => h.trangThaiHoanTien === 'DaHoan').length;
  const tongTienChoXuLy = hoanTiens
    .filter((h) => h.trangThaiHoanTien === 'ChoXuLy')
    .reduce((sum, h) => sum + (h.tienHoan || 0), 0);

  // ✅ RESET BỘ LỌC
  const handleReset = () => {
    setFilterStatus('');
    setSearchTerm('');
    fetchHoanTiens();
    showToast('info', '🔄 Đã làm mới dữ liệu');
  };

  // ✅ TAG TRẠNG THÁI
  const getStatusTag = (status) => {
    const statusMap = {
      ChoXuLy: { label: '⏳ Chờ xử lý', class: 'tag-warning' },
      DaHoan: { label: '✅ Đã hoàn', class: 'tag-success' },
    };

    const s = statusMap[status] || { label: status, class: 'tag-secondary' };
    return <span className={`tag ${s.class}`}>{s.label}</span>;
  };

  // ✅ RENDER ACTIONS
  const renderActions = (hoanTien) => {
    return (
      <div className="action-buttons">
        <button
          className="action-icon-btn view"
          onClick={() => setSelectedHoanTien(hoanTien)}
          title="Xem chi tiết"
        >
          👁️
        </button>

        {hoanTien.trangThaiHoanTien === 'ChoXuLy' && (
          <button
            className="action-icon-btn success"
            onClick={() => setShowXacNhanModal(hoanTien)}
            title="Xác nhận đã hoàn tiền"
          >
            ✅
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="admin-container">
      {/* Toast */}
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={hideToast}
          duration={3000}
        />
      )}

      {/* Header */}
      <div className="admin-header">
        <div>
          <h2 className="admin-title">💸 Quản lý hoàn tiền</h2>
          <p className="admin-subtitle">Danh sách yêu cầu hoàn tiền đã được duyệt</p>
        </div>
        <button className="btn-outline" onClick={handleReset}>
          🔄 Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card gradient-orange">
          <div className="admin-stat-icon">⏳</div>
          <div className="admin-stat-content">
            <div className="admin-stat-value">{tongChoXuLy}</div>
            <div className="admin-stat-label">Chờ xử lý</div>
          </div>
        </div>

        <div className="admin-stat-card gradient-green">
          <div className="admin-stat-icon">✅</div>
          <div className="admin-stat-content">
            <div className="admin-stat-value">{tongDaHoan}</div>
            <div className="admin-stat-label">Đã hoàn</div>
          </div>
        </div>

        <div className="admin-stat-card gradient-red">
          <div className="admin-stat-icon">💰</div>
          <div className="admin-stat-content">
            <div className="admin-stat-value">
              {(tongTienChoXuLy / 1000000).toFixed(1)}tr
            </div>
            <div className="admin-stat-label">Tổng tiền chờ hoàn</div>
          </div>
        </div>

        <div className="admin-stat-card gradient-blue">
          <div className="admin-stat-icon">📋</div>
          <div className="admin-stat-content">
            <div className="admin-stat-value">{hoanTiens.length}</div>
            <div className="admin-stat-label">Tổng yêu cầu</div>
          </div>
        </div>
      </div>

      {/* Card chứa bộ lọc và bảng */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">📋 Danh sách hoàn tiền</h3>
        </div>

        {/* Filters */}
        <div className="admin-search-section">
          <div className="admin-search-row">
            {/* Search Input */}
            <div className="admin-search-wrapper">
              <span className="admin-search-icon">🔍</span>
              <input
                type="text"
                className="admin-search-input"
                placeholder="Tìm theo tên, email, SĐT, STK, mã đặt phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Status */}
            <select
              className="admin-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">📋 Tất cả trạng thái</option>
              <option value="ChoXuLy">⏳ Chờ xử lý</option>
              <option value="DaHoan">✅ Đã hoàn</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="admin-loading">
            <div className="admin-loading-spinner"></div>
            <p>Đang tải danh sách...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">📭</div>
            <p className="admin-empty-text">Không có yêu cầu hoàn tiền nào</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 200 }}>Khách hàng</th>
                  <th style={{ minWidth: 100 }}>Mã ĐP</th>
                  <th style={{ minWidth: 150 }}>Ngân hàng</th>
                  <th style={{ minWidth: 150 }}>Số tài khoản</th>
                  <th style={{ minWidth: 180 }}>Tên chủ TK</th>
                  <th style={{ minWidth: 120 }}>Tiền hoàn</th>
                  <th style={{ minWidth: 120 }}>Trạng thái</th>
                  <th style={{ minWidth: 150 }}>Ngày yêu cầu</th>
                  <th style={{ minWidth: 150 }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((hoanTien) => (
                  <tr key={hoanTien.maHoanTien}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          className="admin-user-avatar"
                          style={{
                            width: 40,
                            height: 40,
                            fontSize: 16,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          }}
                        >
                          {(hoanTien.tenKhachHang || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>
                            {hoanTien.tenKhachHang || '—'}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            {hoanTien.emailKhachHang || '—'}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            📱 {hoanTien.soDienThoai || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="tag tag-primary">#{hoanTien.maDatPhong}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 18 }}>🏦</span>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>
                          {hoanTien.nganHang || '—'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          background: '#f8fafc',
                          padding: '6px 12px',
                          borderRadius: 8,
                          fontFamily: 'monospace',
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#334155',
                          border: '2px solid #e2e8f0',
                        }}
                      >
                        {hoanTien.soTaiKhoan || '—'}
                      </div>
                    </td>
                    <td style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>
                      {hoanTien.tenChuTK || '—'}
                    </td>
                    <td>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: '#10b981',
                          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: '2px solid #6ee7b7',
                          textAlign: 'center',
                        }}
                      >
                        {hoanTien.tienHoan?.toLocaleString('vi-VN')}đ
                      </div>
                    </td>
                    <td>{getStatusTag(hoanTien.trangThaiHoanTien)}</td>
                    <td style={{ fontSize: 13 }}>
                      {hoanTien.ngayYeuCau
                        ? new Date(hoanTien.ngayYeuCau).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td>{renderActions(hoanTien)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Chi tiết */}
      {selectedHoanTien && (
        <ChiTietHoanTien
          hoanTien={selectedHoanTien}
          onClose={() => setSelectedHoanTien(null)}
          onShowToast={showToast}
          onUpdate={fetchHoanTiens}
        />
      )}

      {/* Modal Xác nhận hoàn tiền */}
      {showXacNhanModal && (
        <XacNhanHoanTienModal
          hoanTien={showXacNhanModal}
          onClose={() => setShowXacNhanModal(null)}
          onSuccess={() => {
            setShowXacNhanModal(null);
            fetchHoanTiens();
          }}
          onShowToast={showToast}
        />
      )}
    </div>
  );
}

// ✅ COMPONENT MODAL XÁC NHẬN HOÀN TIỀN
function XacNhanHoanTienModal({ hoanTien, onClose, onSuccess, onShowToast }) {
  const [ghiChu, setGhiChu] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.put(`/api/HuyDatPhong/HoanTien/${hoanTien.maHoanTien}`, {
        ghiChu: ghiChu || null,
      });

      onShowToast('success', res.data.message || 'Đã xác nhận hoàn tiền thành công');
      onSuccess();
    } catch (err) {
      console.error('Lỗi khi xác nhận hoàn tiền:', err);
      onShowToast('error', err.response?.data?.message || 'Xác nhận thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-booking"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 700 }}
      >
        {/* Header */}
        <div className="modal-header-gradient">
          <div className="modal-header-content">
            <div className="modal-icon">💸</div>
            <div>
              <h3 className="modal-title-large">Xác nhận hoàn tiền</h3>
              <p className="modal-subtitle">
                Mã hoàn tiền: #{hoanTien.maHoanTien} | Mã đặt phòng: #{hoanTien.maDatPhong}
              </p>
            </div>
          </div>
          <button className="modal-close-btn-gradient" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Thông tin khách hàng */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">👤</div>
                <h4 className="form-section-title">Thông tin khách hàng</h4>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Họ tên</label>
                  <input
                    type="text"
                    className="form-input-modern"
                    value={hoanTien.tenKhachHang || '—'}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    type="text"
                    className="form-input-modern"
                    value={hoanTien.soDienThoai || '—'}
                    disabled
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Email</label>
                  <input
                    type="text"
                    className="form-input-modern"
                    value={hoanTien.emailKhachHang || '—'}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Thông tin ngân hàng */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">🏦</div>
                <h4 className="form-section-title">Thông tin ngân hàng</h4>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Ngân hàng</label>
                  <input
                    type="text"
                    className="form-input-modern"
                    value={hoanTien.nganHang || '—'}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Số tài khoản</label>
                  <input
                    type="text"
                    className="form-input-modern"
                    value={hoanTien.soTaiKhoan || '—'}
                    disabled
                    style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 600 }}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Tên chủ tài khoản</label>
                  <input
                    type="text"
                    className="form-input-modern"
                    value={hoanTien.tenChuTK || '—'}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Số tiền hoàn */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">💰</div>
                <h4 className="form-section-title">Số tiền hoàn</h4>
              </div>

              <div
                style={{
                  background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                  padding: 32,
                  borderRadius: 16,
                  border: '3px solid #6ee7b7',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
                  💸 Số tiền cần hoàn trả
                </div>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#059669' }}>
                  {hoanTien.tienHoan?.toLocaleString('vi-VN')}đ
                </div>
              </div>
            </div>

            {/* Ghi chú */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">📝</div>
                <h4 className="form-section-title">Ghi chú xác nhận</h4>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="form-label-icon">💬</span>
                  Ghi chú
                  <span className="form-label-required">*</span>
                </label>
                <textarea
                  className="form-input-modern"
                  rows={4}
                  placeholder="VD: Đã chuyển khoản lúc 14:30 ngày 08/12/2025. Mã giao dịch: FT123456789"
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                  required
                />
              </div>

              <div
                style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  padding: 16,
                  borderRadius: 10,
                  border: '2px solid #fbbf24',
                  marginTop: 16,
                }}
              >
                <div style={{ fontSize: 14, color: '#92400e', lineHeight: 1.6 }}>
                  <strong>⚠️ Lưu ý quan trọng:</strong>
                  <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                    <li>Vui lòng kiểm tra kỹ thông tin ngân hàng trước khi chuyển khoản</li>
                    <li>Ghi rõ mã đặt phòng trong nội dung chuyển khoản</li>
                    <li>Sau khi xác nhận, trạng thái sẽ chuyển sang "Đã hoàn"</li>
                    <li>Không thể hoàn tác sau khi xác nhận</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer modal-footer-modern">
            <button type="button" className="btn-outline-modern" onClick={onClose}>
              <span className="btn-icon">✕</span>
              Hủy
            </button>
            <button type="submit" className="btn-success-modern" disabled={loading || !ghiChu}>
              <span className="btn-icon">{loading ? '⏳' : '✅'}</span>
              {loading ? 'Đang xử lý...' : 'Xác nhận đã hoàn tiền'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}