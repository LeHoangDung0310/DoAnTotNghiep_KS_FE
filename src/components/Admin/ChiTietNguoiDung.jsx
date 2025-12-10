import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function ChiTietNguoiDung({ userId, onClose, onShowToast }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'address', 'cccd'

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const fetchUserDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/NguoiDung/${userId}`);
      setUser(res.data.data);
    } catch (err) {
      console.error('Lỗi khi tải thông tin:', err);
      onShowToast('error', 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const getDiaChiDayDu = () => {
    if (!user) return 'Chưa cập nhật';
    const parts = [];
    if (user.diaChiChiTiet) parts.push(user.diaChiChiTiet);
    if (user.tenPhuongXa) parts.push(user.tenPhuongXa);
    if (user.tenHuyen) parts.push(user.tenHuyen);
    if (user.tenTinh) parts.push(user.tenTinh);
    return parts.length > 0 ? parts.join(', ') : 'Chưa cập nhật';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal modal-detail-user" onClick={(e) => e.stopPropagation()}>
          <div className="admin-loading">
            <div className="admin-loading-spinner"></div>
            <p>Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-detail-user" onClick={(e) => e.stopPropagation()}>
        {/* Header với avatar và thông tin cơ bản */}
        <div className="modal-header-detail">
          <div className="detail-header-left">
            <div className="detail-user-avatar">
              {(user.hoTen || user.email || '?').charAt(0).toUpperCase()}
            </div>
            <div className="detail-user-info">
              <h3 className="detail-user-name">{user.hoTen || 'Chưa cập nhật'}</h3>
              <p className="detail-user-email">{user.email}</p>
            </div>
          </div>
          <button className="modal-close-btn-circle" onClick={onClose} title="Đóng">
            ✕
          </button>
        </div>

        {/* Tabs Navigation - THÊM TAB NGÂN HÀNG */}
        <div className="detail-tabs">
          <button
            className={`detail-tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <span className="tab-icon">👤</span>
            Thông tin chung
          </button>
          <button
            className={`detail-tab ${activeTab === 'address' ? 'active' : ''}`}
            onClick={() => setActiveTab('address')}
          >
            <span className="tab-icon">📍</span>
            Địa chỉ
          </button>
          <button
            className={`detail-tab ${activeTab === 'cccd' ? 'active' : ''}`}
            onClick={() => setActiveTab('cccd')}
          >
            <span className="tab-icon">🆔</span>
            Xác thực & CCCD
          </button>
          <button
            className={`detail-tab ${activeTab === 'bank' ? 'active' : ''}`}
            onClick={() => setActiveTab('bank')}
          >
            <span className="tab-icon">🏦</span>
            Ngân hàng
          </button>
        </div>

        {/* Tab Content */}
        <div className="detail-body">
          {/* Tab Thông tin chung */}
          {activeTab === 'info' && (
            <div className="detail-content">
              <div className="detail-info-grid">
                <div className="detail-info-item">
                  <div className="detail-info-icon">📝</div>
                  <div className="detail-info-content">
                    <span className="detail-info-label">Họ và tên</span>
                    <span className="detail-info-value">{user.hoTen || '—'}</span>
                  </div>
                </div>

                <div className="detail-info-item">
                  <div className="detail-info-icon">📧</div>
                  <div className="detail-info-content">
                    <span className="detail-info-label">Email</span>
                    <span className="detail-info-value">{user.email}</span>
                  </div>
                </div>

                <div className="detail-info-item">
                  <div className="detail-info-icon">📱</div>
                  <div className="detail-info-content">
                    <span className="detail-info-label">Số điện thoại</span>
                    <span className="detail-info-value">{user.soDienThoai || '—'}</span>
                  </div>
                </div>

                <div className="detail-info-item">
                  <div className="detail-info-icon">⚧</div>
                  <div className="detail-info-content">
                    <span className="detail-info-label">Giới tính</span>
                    <span className="detail-info-value">{user.gioiTinh || '—'}</span>
                  </div>
                </div>

                <div className="detail-info-item">
                  <div className="detail-info-icon">🎂</div>
                  <div className="detail-info-content">
                    <span className="detail-info-label">Ngày sinh</span>
                    <span className="detail-info-value">{formatDate(user.ngaySinh)}</span>
                  </div>
                </div>

                <div className="detail-info-item">
                  <div className="detail-info-icon">🎭</div>
                  <div className="detail-info-content">
                    <span className="detail-info-label">Vai trò</span>
                    <span className="detail-badge badge-role">
                      {user.vaiTro === 'Admin' && '🔴 Admin'}
                      {user.vaiTro === 'LeTan' && '🔵 Lễ tân'}
                      {user.vaiTro === 'KhachHang' && '🟢 Khách hàng'}
                    </span>
                  </div>
                </div>

                <div className="detail-info-item">
                  <div className="detail-info-icon">📊</div>
                  <div className="detail-info-content">
                    <span className="detail-info-label">Trạng thái</span>
                    <span className={`detail-badge ${user.trangThai === 'Hoạt động' ? 'badge-active' : 'badge-locked'}`}>
                      {user.trangThai === 'Hoạt động' ? '✅ Hoạt động' : '🔒 Tạm khóa'}
                    </span>
                  </div>
                </div>

                <div className="detail-info-item">
                  <div className="detail-info-icon">📅</div>
                  <div className="detail-info-content">
                    <span className="detail-info-label">Ngày tạo</span>
                    <span className="detail-info-value">
                      {user.ngayTao
                        ? new Date(user.ngayTao).toLocaleString('vi-VN', { hour12: false })
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Địa chỉ */}
          {activeTab === 'address' && (
            <div className="detail-content">
              <div className="detail-info-grid">
                <div className="detail-info-item full-width">
                  <div className="detail-info-icon">🏠</div>
                  <div className="detail-info-content">
                    <span className="detail-info-label">Địa chỉ chi tiết</span>
                    <span className="detail-info-value">{user.diaChiChiTiet || '—'}</span>
                  </div>
                </div>

                <div className="detail-info-item">
                  <div className="detail-info-icon">🏡</div>
                  <div className="detail-info-content">
                    <span className="detail-info-label">Phường/Xã</span>
                    <span className="detail-info-value">{user.tenPhuongXa || '—'}</span>
                  </div>
                </div>

                <div className="detail-info-item">
                  <div className="detail-info-icon">🏘️</div>
                  <div className="detail-info-content">
                    <span className="detail-info-label">Quận/Huyện</span>
                    <span className="detail-info-value">{user.tenHuyen || '—'}</span>
                  </div>
                </div>

                <div className="detail-info-item">
                  <div className="detail-info-icon">🏙️</div>
                  <div className="detail-info-content">
                    <span className="detail-info-label">Tỉnh/Thành phố</span>
                    <span className="detail-info-value">{user.tenTinh || '—'}</span>
                  </div>
                </div>

                <div className="detail-info-item full-width">
                  <div className="detail-info-icon">🗺️</div>
                  <div className="detail-info-content">
                    <span className="detail-info-label">Địa chỉ đầy đủ</span>
                    <span className="detail-info-value detail-address-full">
                      {getDiaChiDayDu()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab CCCD */}
          {activeTab === 'cccd' && (
            <div className="detail-content">
              <div className="detail-info-grid">
                <div className="detail-info-item">
                  <div className="detail-info-icon">🔢</div>
                  <div className="detail-info-content">
                    <span className="detail-info-label">Số CCCD</span>
                    <span className="detail-info-value detail-cccd-number">
                      {user.soCCCD || '—'}
                    </span>
                  </div>
                </div>

                <div className="detail-info-item">
                  <div className="detail-info-icon">📅</div>
                  <div className="detail-info-content">
                    <span className="detail-info-label">Ngày cấp CCCD</span>
                    <span className="detail-info-value">{formatDate(user.ngayCapCCCD)}</span>
                  </div>
                </div>

                <div className="detail-info-item full-width">
                  <div className="detail-info-icon">🏛️</div>
                  <div className="detail-info-content">
                    <span className="detail-info-label">Nơi cấp</span>
                    <span className="detail-info-value">{user.noiCapCCCD || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Ngân hàng - MỚI */}
          {activeTab === 'bank' && (
            <div className="detail-content">
              <div className="detail-info-grid">
                {user.nganHang || user.soTaiKhoan || user.tenChuTK ? (
                  <>
                    <div className="detail-info-item">
                      <div className="detail-info-icon">🏦</div>
                      <div className="detail-info-content">
                        <span className="detail-info-label">Ngân hàng</span>
                        <span className="detail-info-value">{user.nganHang || '—'}</span>
                      </div>
                    </div>

                    <div className="detail-info-item">
                      <div className="detail-info-icon">💳</div>
                      <div className="detail-info-content">
                        <span className="detail-info-label">Số tài khoản</span>
                        <span className="detail-info-value detail-bank-number">
                          {user.soTaiKhoan || '—'}
                        </span>
                      </div>
                    </div>

                    <div className="detail-info-item full-width">
                      <div className="detail-info-icon">👤</div>
                      <div className="detail-info-content">
                        <span className="detail-info-label">Tên chủ tài khoản</span>
                        <span className="detail-info-value">{user.tenChuTK || '—'}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="detail-info-item full-width">
                    <div className="detail-info-icon">ℹ️</div>
                    <div className="detail-info-content">
                      <span className="detail-info-label">Thông báo</span>
                      <span className="detail-info-value" style={{ color: '#64748b', fontStyle: 'italic' }}>
                        Người dùng chưa cập nhật thông tin tài khoản ngân hàng
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="detail-footer">
          <button className="btn-close-detail" onClick={onClose}>
            <span className="btn-icon">✕</span>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}