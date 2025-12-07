import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5114/api';

export default function ChiTietNguoiDung({ userId, onClose, onShowToast }) {
  const [activeTab, setActiveTab] = useState('general');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const accessToken = localStorage.getItem('accessToken');

  const fetchUserDetail = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/NguoiDung/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Không tải được thông tin');

      setUser(data.data);
    } catch (e) {
      console.error(e);
      onShowToast?.('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingHistory = async () => {
    setLoadingBookings(true);
    try {
      // TODO: Thay bằng API thực tế
      // const res = await fetch(`${API_BASE}/DatPhong/ByKhachHang/${userId}`, {
      //   headers: {
      //     'Content-Type': 'application/json',
      //     ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      //   },
      // });
      // const data = await res.json();
      // if (data.success) {
      //   setBookings(data.data || []);
      // }

      setBookings([]);
    } catch (e) {
      console.error('Lỗi khi tải lịch sử đặt phòng:', e);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchPaymentHistory = async () => {
    setLoadingPayments(true);
    try {
      // TODO: Thay bằng API thực tế
      // const res = await fetch(`${API_BASE}/ThanhToan/ByKhachHang/${userId}`, {
      //   headers: {
      //     'Content-Type': 'application/json',
      //     ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      //   },
      // });
      // const data = await res.json();
      // if (data.success) {
      //   setPayments(data.data || []);
      // }

      setPayments([]);
    } catch (e) {
      console.error('Lỗi khi tải lịch sử thanh toán:', e);
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'booking') {
      fetchBookingHistory();
    } else if (activeTab === 'payment') {
      fetchPaymentHistory();
    }
  }, [activeTab]);

  if (!userId) return null;

  const tabs = [
    { key: 'general', label: 'Thông tin chung', icon: '👤' },
    { key: 'address', label: 'Địa chỉ', icon: '📍' },
    { key: 'verification', label: 'Xác thực & CCCD', icon: '🆔' },
    { key: 'booking', label: 'Lịch sử đặt phòng', icon: '📅' },
    { key: 'payment', label: 'Thanh toán', icon: '💳' },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal modal-xl"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '1100px', height: '90vh' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '2px solid #e5e7eb' }}>
          <div className="modal-header-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                className="admin-user-avatar"
                style={{
                  width: 48,
                  height: 48,
                  fontSize: 20,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                {user?.hoTen?.charAt(0) || user?.email?.charAt(0) || '?'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 20 }}>{user?.hoTen || 'Đang tải...'}</h3>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                  {user?.email} • #{user?.maNguoiDung}
                </div>
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '16px 24px',
            background: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            overflowX: 'auto',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === tab.key ? '#2563eb' : 'white',
                color: activeTab === tab.key ? 'white' : '#374151',
                fontSize: 14,
                fontWeight: activeTab === tab.key ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                boxShadow: activeTab === tab.key ? '0 4px 6px rgba(37, 99, 235, 0.2)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="modal-body" style={{ padding: 24, overflowY: 'auto', maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
              Đang tải dữ liệu...
            </div>
          ) : (
            <>
              {/* Tab 1: Thông tin chung */}
              {activeTab === 'general' && (
                <div className="tab-content-grid">
                  <InfoRow label="Họ và tên" value={user?.hoTen || '—'} icon="👤" />
                  <InfoRow label="Email" value={user?.email} icon="✉️" />
                  <InfoRow label="Số điện thoại" value={user?.soDienThoai || '—'} icon="📞" />
                  <InfoRow label="Giới tính" value={user?.gioiTinh || '—'} icon="⚧️" />
                  <InfoRow
                    label="Ngày sinh"
                    value={user?.ngaySinh ? new Date(user.ngaySinh).toLocaleDateString('vi-VN') : '—'}
                    icon="🎂"
                  />
                  <InfoRow
                    label="Vai trò"
                    value={
                      <span
                        className={
                          user?.vaiTro === 'Admin'
                            ? 'tag tag-danger'
                            : user?.vaiTro === 'LeTan'
                            ? 'tag tag-secondary'
                            : 'tag tag-success'
                        }
                      >
                        {user?.vaiTro}
                      </span>
                    }
                    icon="🔑"
                  />
                  <InfoRow
                    label="Trạng thái"
                    value={
                      <span
                        className={
                          user?.trangThai === 'Hoạt động' ? 'tag tag-success' : 'tag tag-warning'
                        }
                      >
                        {user?.trangThai}
                      </span>
                    }
                    icon="🟢"
                  />
                  <InfoRow
                    label="Ngày tạo"
                    value={
                      user?.ngayTao
                        ? new Date(user.ngayTao).toLocaleString('vi-VN')
                        : '—'
                    }
                    icon="📅"
                  />
                </div>
              )}

              {/* Tab 2: Địa chỉ */}
              {activeTab === 'address' && (
                <div className="tab-content-grid">
                  <InfoRow label="Tỉnh/Thành phố" value={user?.tenTinh || '—'} icon="🏙️" />
                  <InfoRow label="Quận/Huyện" value={user?.tenHuyen || '—'} icon="🏘️" />
                  <InfoRow label="Phường/Xã" value={user?.tenPhuongXa || '—'} icon="🏡" />
                  <InfoRow
                    label="Địa chỉ chi tiết"
                    value={user?.diaChiChiTiet || '—'}
                    icon="📍"
                    fullWidth
                  />
                  <div style={{ marginTop: 16, gridColumn: '1 / -1' }}>
                    <div
                      style={{
                        padding: 16,
                        background: '#f0f9ff',
                        borderRadius: 8,
                        border: '1px solid #bfdbfe',
                      }}
                    >
                      <strong style={{ color: '#1e40af' }}>📌 Địa chỉ đầy đủ:</strong>
                      <p style={{ margin: '8px 0 0', color: '#1e3a8a' }}>
                        {[
                          user?.diaChiChiTiet,
                          user?.tenPhuongXa,
                          user?.tenHuyen,
                          user?.tenTinh,
                        ]
                          .filter(Boolean)
                          .join(', ') || 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Xác thực & CCCD - ĐÃ SỬA */}
              {activeTab === 'verification' && (
                <div>
                  {/* Grid 3 cột cho thông tin CCCD */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: 16,
                    marginBottom: 24 
                  }}>
                    <InfoRow label="Số CCCD" value={user?.soCCCD || '—'} icon="🆔" />
                    <InfoRow
                      label="Ngày cấp"
                      value={
                        user?.ngayCapCCCD
                          ? new Date(user.ngayCapCCCD).toLocaleDateString('vi-VN')
                          : '—'
                      }
                      icon="📅"
                    />
                    <InfoRow label="Nơi cấp" value={user?.noiCapCCCD || '—'} icon="🏛️" />
                  </div>

                  {/* Trạng thái xác thực */}
                  <div
                    style={{
                      padding: 20,
                      background: user?.soCCCD ? '#f0fdf4' : '#fef3c7',
                      borderRadius: 12,
                      border: `2px solid ${user?.soCCCD ? '#86efac' : '#fcd34d'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: user?.soCCCD ? '#22c55e' : '#f59e0b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28,
                        flexShrink: 0,
                      }}
                    >
                      {user?.soCCCD ? '✅' : '⚠️'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: user?.soCCCD ? '#166534' : '#92400e',
                          marginBottom: 6,
                        }}
                      >
                        {user?.soCCCD ? 'Đã cung cấp CCCD' : 'Chưa cung cấp CCCD'}
                      </div>
                      <div style={{ fontSize: 14, color: user?.soCCCD ? '#15803d' : '#a16207' }}>
                        {user?.soCCCD
                          ? `Người dùng đã cung cấp đầy đủ thông tin CCCD. Số CCCD: ${user.soCCCD}`
                          : 'Yêu cầu người dùng cập nhật CCCD để xác thực tài khoản và đặt phòng'}
                      </div>
                    </div>
                  </div>

                  {/* Thông tin bổ sung nếu đã có CCCD */}
                  {user?.soCCCD && (
                    <div
                      style={{
                        marginTop: 16,
                        padding: 16,
                        background: '#f8fafc',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
                        📋 <strong>Chi tiết CCCD:</strong>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', fontSize: 14 }}>
                        <span style={{ color: '#64748b' }}>Số CCCD:</span>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{user.soCCCD}</span>
                        
                        {user.ngayCapCCCD && (
                          <>
                            <span style={{ color: '#64748b' }}>Ngày cấp:</span>
                            <span style={{ color: '#0f172a' }}>
                              {new Date(user.ngayCapCCCD).toLocaleDateString('vi-VN')}
                            </span>
                          </>
                        )}
                        
                        {user.noiCapCCCD && (
                          <>
                            <span style={{ color: '#64748b' }}>Nơi cấp:</span>
                            <span style={{ color: '#0f172a' }}>{user.noiCapCCCD}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Lịch sử đặt phòng */}
              {activeTab === 'booking' && (
                <div>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                      📅 Lịch sử đặt phòng ({bookings.length})
                    </h4>
                  </div>

                  {loadingBookings ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                      Đang tải dữ liệu...
                    </div>
                  ) : bookings.length === 0 ? (
                    <div
                      style={{
                        padding: 60,
                        textAlign: 'center',
                        background: '#f9fafb',
                        borderRadius: 8,
                        color: '#6b7280',
                      }}
                    >
                      <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
                      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                        Chưa có lịch sử đặt phòng
                      </div>
                      <div style={{ fontSize: 13, color: '#9ca3af' }}>
                        Người dùng chưa thực hiện đặt phòng nào
                      </div>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Mã đặt phòng</th>
                            <th>Tên phòng</th>
                            <th>Ngày đến</th>
                            <th>Ngày đi</th>
                            <th>Trạng thái</th>
                            <th>Tổng tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.map((booking) => (
                            <tr key={booking.maDatPhong}>
                              <td>
                                <strong>{booking.maDatPhong}</strong>
                              </td>
                              <td>{booking.tenPhong}</td>
                              <td>{new Date(booking.ngayDen).toLocaleDateString('vi-VN')}</td>
                              <td>{new Date(booking.ngayDi).toLocaleDateString('vi-VN')}</td>
                              <td>
                                <span
                                  className={
                                    booking.trangThai === 'Hoàn thành'
                                      ? 'tag tag-success'
                                      : booking.trangThai === 'Đã hủy'
                                      ? 'tag tag-danger'
                                      : 'tag tag-warning'
                                  }
                                >
                                  {booking.trangThai}
                                </span>
                              </td>
                              <td>
                                <strong style={{ color: '#2563eb' }}>
                                  {booking.tongTien.toLocaleString('vi-VN')}đ
                                </strong>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Lịch sử thanh toán */}
              {activeTab === 'payment' && (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                      💳 Tài khoản ngân hàng liên kết
                    </h4>
                    <div
                      style={{
                        marginTop: 12,
                        padding: 16,
                        background: '#f0f9ff',
                        borderRadius: 8,
                        border: '1px solid #bae6fd',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            background: '#2563eb',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                          }}
                        >
                          🏦
                        </div>
                        <div>
                          <div style={{ fontSize: 14, color: '#6b7280' }}>Chưa liên kết tài khoản ngân hàng</div>
                          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                            Yêu cầu người dùng cập nhật để nhận hoàn tiền
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 24 }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600 }}>
                      💰 Lịch sử thanh toán ({payments.length})
                    </h4>

                    {loadingPayments ? (
                      <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                        Đang tải dữ liệu...
                      </div>
                    ) : payments.length === 0 ? (
                      <div
                        style={{
                          padding: 60,
                          textAlign: 'center',
                          background: '#f9fafb',
                          borderRadius: 8,
                          color: '#6b7280',
                        }}
                      >
                        <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
                        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                          Chưa có lịch sử thanh toán
                        </div>
                        <div style={{ fontSize: 13, color: '#9ca3af' }}>
                          Người dùng chưa thực hiện giao dịch nào
                        </div>
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Mã giao dịch</th>
                              <th>Số tiền</th>
                              <th>Phương thức</th>
                              <th>Thời gian</th>
                              <th>Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {payments.map((payment) => (
                              <tr key={payment.maGiaoDich}>
                                <td>
                                  <strong>{payment.maGiaoDich}</strong>
                                </td>
                                <td>
                                  <strong style={{ color: '#2563eb' }}>
                                    {payment.soTien.toLocaleString('vi-VN')}đ
                                  </strong>
                                </td>
                                <td>{payment.phuongThuc}</td>
                                <td>{payment.thoiGian}</td>
                                <td>
                                  <span
                                    className={
                                      payment.trangThai === 'Thành công'
                                        ? 'tag tag-success'
                                        : 'tag tag-danger'
                                    }
                                  >
                                    {payment.trangThai}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ borderTop: '2px solid #e5e7eb' }}>
          <button className="btn-outline" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// Component hiển thị thông tin theo dạng row
function InfoRow({ label, value, icon, fullWidth }) {
  return (
    <div style={{ gridColumn: fullWidth ? '1 / -1' : 'auto' }}>
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#6b7280',
          marginBottom: 6,
          display: 'block',
        }}
      >
        {icon} {label}
      </label>
      <div
        style={{
          fontSize: 14,
          color: '#111827',
          padding: '10px 12px',
          background: '#f9fafb',
          borderRadius: 6,
          border: '1px solid #e5e7eb',
        }}
      >
        {value}
      </div>
    </div>
  );
}