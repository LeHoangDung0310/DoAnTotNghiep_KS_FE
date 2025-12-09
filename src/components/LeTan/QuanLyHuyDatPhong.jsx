import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../../styles/admin.css';
import '../../styles/letan.css';
import Toast from '../Common/Toast';
import ChiTietHuyDatPhong from './ChiTietHuyDatPhong';

export default function QuanLyHuyDatPhong() {
  const [huyDatPhongs, setHuyDatPhongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedHuyId, setSelectedHuyId] = useState(null);
  const [showDuyetModal, setShowDuyetModal] = useState(null);

  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchHuyDatPhongs();
  }, []);

  const fetchHuyDatPhongs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/HuyDatPhong');
      setHuyDatPhongs(res.data.data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách hủy đặt phòng:', err);
      showToast('error', 'Không thể tải danh sách hủy đặt phòng');
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
  const filteredList = huyDatPhongs.filter((h) => {
    const matchStatus = !filterStatus || h.trangThai === filterStatus;
    const matchSearch =
      !searchTerm ||
      h.tenKhachHang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.emailKhachHang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.soDienThoai?.includes(searchTerm) ||
      h.maDatPhong?.toString().includes(searchTerm);

    return matchStatus && matchSearch;
  });

  // ✅ RESET BỘ LỌC
  const handleReset = () => {
    setFilterStatus('');
    setSearchTerm('');
    showToast('info', '🔄 Đã đặt lại bộ lọc');
  };

  // ✅ TAG TRẠNG THÁI
  const getStatusTag = (status) => {
    const statusMap = {
      ChoDuyet: { label: '⏳ Chờ duyệt', class: 'tag-warning' },
      DaDuyet: { label: '✅ Đã duyệt', class: 'tag-success' },
      TuChoi: { label: '❌ Từ chối', class: 'tag-danger' },
    };

    const s = statusMap[status] || { label: status, class: 'tag-secondary' };
    return <span className={`tag ${s.class}`}>{s.label}</span>;
  };

  // ✅ RENDER ACTIONS
  const renderActions = (huy) => {
    return (
      <div className="action-buttons">
        <button
          className="action-icon-btn view"
          onClick={() => setSelectedHuyId(huy.maHuyDatPhong)}
          title="Xem chi tiết"
        >
          👁️
        </button>

        {huy.trangThai === 'ChoDuyet' && (
          <>
            <button
              className="action-icon-btn success"
              onClick={() => setShowDuyetModal({ id: huy.maHuyDatPhong, type: 'duyet' })}
              title="Duyệt yêu cầu"
            >
              ✅
            </button>
            <button
              className="action-icon-btn danger"
              onClick={() => setShowDuyetModal({ id: huy.maHuyDatPhong, type: 'tuchoi' })}
              title="Từ chối"
            >
              ❌
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="admin-card letan-layout">
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
      <div className="letan-header-layout">
        <div className="letan-header-left">
          <h3 className="admin-card-title">🚫 Quản lý hủy đặt phòng</h3>
          <button className="btn-outline letan-reset-btn" onClick={handleReset}>
            🔄 Đặt lại
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="letan-search-section">
        <div className="letan-search-row">
          {/* Search Input */}
          <div className="letan-search-input-wrapper">
            <span className="letan-search-icon">🔍</span>
            <input
              type="text"
              className="letan-search-input"
              placeholder="Tìm theo tên, email, SĐT, mã đặt phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Status */}
          <select
            className="letan-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">📋 Tất cả trạng thái</option>
            <option value="ChoDuyet">⏳ Chờ duyệt</option>
            <option value="DaDuyet">✅ Đã duyệt</option>
            <option value="TuChoi">❌ Từ chối</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading">Đang tải...</div>
      ) : filteredList.length === 0 ? (
        <div className="admin-empty">
          <p>😕 Không có yêu cầu hủy nào</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ minWidth: 180 }}>Khách hàng</th>
                <th style={{ minWidth: 100 }}>Mã ĐP</th>
                <th style={{ minWidth: 120 }}>Ngày yêu cầu</th>
                <th style={{ minWidth: 120 }}>Ngày nhận phòng</th>
                <th style={{ minWidth: 100 }}>Tổng tiền</th>
                <th style={{ minWidth: 100 }}>Phí giữ</th>
                <th style={{ minWidth: 100 }}>Tiền hoàn</th>
                <th style={{ minWidth: 120 }}>Trạng thái</th>
                <th style={{ minWidth: 250 }}>Lý do</th>
                <th style={{ minWidth: 180 }}>Người duyệt</th>
                <th style={{ minWidth: 150 }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((huy) => (
                <tr key={huy.maHuyDatPhong}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        className="admin-user-avatar"
                        style={{
                          width: 40,
                          height: 40,
                          fontSize: 16,
                          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        }}
                      >
                        {(huy.tenKhachHang || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>
                          {huy.tenKhachHang || '—'}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {huy.emailKhachHang || '—'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="tag tag-primary">#{huy.maDatPhong}</span>
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {new Date(huy.ngayYeuCau).toLocaleDateString('vi-VN')}
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {huy.ngayNhanPhong
                      ? new Date(huy.ngayNhanPhong).toLocaleDateString('vi-VN')
                      : '—'}
                  </td>
                  <td style={{ fontWeight: 600, fontSize: 14, color: '#64748b' }}>
                    {huy.tongTien?.toLocaleString('vi-VN')}đ
                  </td>
                  <td style={{ fontWeight: 600, fontSize: 14, color: '#e74c3c' }}>
                    {huy.phiGiu?.toLocaleString('vi-VN') || 0}đ
                  </td>
                  <td style={{ fontWeight: 600, fontSize: 14, color: '#2ecc71' }}>
                    {huy.tienHoan?.toLocaleString('vi-VN')}đ
                  </td>
                  <td>{getStatusTag(huy.trangThai)}</td>
                  <td
                    style={{
                      fontSize: 13,
                      color: '#475569',
                      maxWidth: 250,
                      whiteSpace: 'normal',
                      lineHeight: 1.4,
                    }}
                  >
                    {huy.lyDo || '—'}
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {huy.tenNguoiDuyet ? (
                      <div>
                        <div style={{ fontWeight: 500 }}>{huy.tenNguoiDuyet}</div>
                        {huy.ngayXuLy && (
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            {new Date(huy.ngayXuLy).toLocaleString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{renderActions(huy)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Chi tiết */}
      {selectedHuyId && (
        <ChiTietHuyDatPhong
          huyId={selectedHuyId}
          onClose={() => setSelectedHuyId(null)}
          onShowToast={showToast}
          onUpdate={fetchHuyDatPhongs}
        />
      )}

      {/* Modal Duyệt/Từ chối */}
      {showDuyetModal && (
        <DuyetHuyModal
          huyId={showDuyetModal.id}
          type={showDuyetModal.type}
          onClose={() => setShowDuyetModal(null)}
          onSuccess={() => {
            setShowDuyetModal(null);
            fetchHuyDatPhongs();
          }}
          onShowToast={showToast}
        />
      )}
    </div>
  );
}

// ✅ COMPONENT MODAL DUYỆT/TỪ CHỐI
function DuyetHuyModal({ huyId, type, onClose, onSuccess, onShowToast }) {
  const [ghiChu, setGhiChu] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.put(`/api/HuyDatPhong/${huyId}/Duyet`, {
        choDuyet: type === 'duyet',
        ghiChu: ghiChu || null,
      });

      onShowToast('success', res.data.message || 'Xử lý thành công');
      onSuccess();
    } catch (err) {
      console.error('Lỗi khi xử lý yêu cầu hủy:', err);
      onShowToast('error', err.response?.data?.message || 'Xử lý thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-booking"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 600 }}
      >
        {/* Header */}
        <div className="modal-header-gradient">
          <div className="modal-header-content">
            <div className="modal-icon">
              {type === 'duyet' ? '✅' : '❌'}
            </div>
            <div>
              <h3 className="modal-title-large">
                {type === 'duyet' ? 'Duyệt yêu cầu hủy' : 'Từ chối yêu cầu hủy'}
              </h3>
              <p className="modal-subtitle">
                Yêu cầu hủy #{huyId}
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
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">📝</div>
                <h4 className="form-section-title">
                  {type === 'duyet' ? 'Xác nhận duyệt' : 'Lý do từ chối'}
                </h4>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="form-label-icon">💬</span>
                  Ghi chú
                </label>
                <textarea
                  className="form-input-modern"
                  rows={4}
                  placeholder={
                    type === 'duyet'
                      ? 'Ghi chú cho khách hàng (nếu có)...'
                      : 'Nhập lý do từ chối...'
                  }
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                />
              </div>

              {type === 'duyet' && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                    padding: 16,
                    borderRadius: 10,
                    border: '2px solid #6ee7b7',
                    marginTop: 16,
                  }}
                >
                  <div style={{ fontSize: 14, color: '#065f46', lineHeight: 1.6 }}>
                    <strong>⚠️ Lưu ý:</strong>
                    <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                      <li>Đặt phòng sẽ được chuyển sang trạng thái "Đã hủy"</li>
                      <li>Phòng sẽ được giải phóng về trạng thái "Trống"</li>
                      <li>Yêu cầu hoàn tiền sẽ được gửi đến Admin xử lý</li>
                    </ul>
                  </div>
                </div>
              )}

              {type === 'tuchoi' && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                    padding: 16,
                    borderRadius: 10,
                    border: '2px solid #fca5a5',
                    marginTop: 16,
                  }}
                >
                  <div style={{ fontSize: 14, color: '#991b1b', lineHeight: 1.6 }}>
                    <strong>⚠️ Cảnh báo:</strong>
                    <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                      <li>Yêu cầu hủy sẽ bị từ chối</li>
                      <li>Khách hàng sẽ không nhận được hoàn tiền</li>
                      <li>Đặt phòng vẫn giữ nguyên trạng thái</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer modal-footer-modern">
            <button type="button" className="btn-outline-modern" onClick={onClose}>
              <span className="btn-icon">✕</span>
              Hủy
            </button>
            <button
              type="submit"
              className={type === 'duyet' ? 'btn-success-modern' : 'btn-danger-modern'}
              disabled={loading}
            >
              <span className="btn-icon">
                {loading ? '⏳' : type === 'duyet' ? '✅' : '❌'}
              </span>
              {loading
                ? 'Đang xử lý...'
                : type === 'duyet'
                ? 'Xác nhận duyệt'
                : 'Xác nhận từ chối'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}