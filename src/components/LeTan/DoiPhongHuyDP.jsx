
import React, { useState } from 'react';
import DoiPhongStep from './Steps/DoiPhongStep';
import HuyDPsauCheckin from './Steps/HuyDPsauCheckin';

export default function DoiPhongHuyDP({ bookingId, onClose, onSuccess, onShowToast, bookingInfo }) {
  const [tab, setTab] = useState(0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-booking"style={{ maxWidth: 850, width: '95%' }} onClick={e => e.stopPropagation()}>
        {/* Header giống tạo phòng trực tiếp */}
        <div className="modal-header-gradient">
          <div className="modal-header-content">
            <div className="modal-icon">🔄</div>
            <div>
              <h3 className="modal-title-large">Đổi phòng / Hủy đặt phòng</h3>
              <p className="modal-subtitle">Mã đặt phòng #{bookingId}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #eee', background: '#fff' }}>
          <button
            style={{
              flex: 1,
              padding: '12px 0',
              background: tab === 0 ? '#1976d2' : '#f5f5f5',
              color: tab === 0 ? '#fff' : '#333',
              border: 'none',
              borderBottom: tab === 0 ? '2px solid #1976d2' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: tab === 0 ? 'bold' : 'normal',
              borderRadius: '8px 8px 0 0',
              outline: 'none',
              transition: 'all 0.2s',
            }}
            onClick={() => setTab(0)}
          >
            Đổi phòng
          </button>
          <button
            style={{
              flex: 1,
              padding: '12px 0',
              background: tab === 1 ? '#1976d2' : '#f5f5f5',
              color: tab === 1 ? '#fff' : '#333',
              border: 'none',
              borderBottom: tab === 1 ? '2px solid #1976d2' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: tab === 1 ? 'bold' : 'normal',
              borderRadius: '8px 8px 0 0',
              outline: 'none',
              transition: 'all 0.2s',
            }}
            onClick={() => setTab(1)}
          >
            Hủy đặt phòng
          </button>
        </div>
        {/* Body */}
        <div className="modal-body booking-modal-body" style={{ minHeight: 550 }}>
          {tab === 0 && (
            <DoiPhongStep
              bookingId={bookingId}
              onClose={onClose}
              onSuccess={onSuccess}
              onShowToast={onShowToast}
            />
          )}
          {tab === 1 && (
            <HuyDPsauCheckin
              bookingId={bookingId}
              onClose={onClose}
              onSuccess={onSuccess}
              onShowToast={onShowToast}
              bookingInfo={bookingInfo}
            />
          )}
        </div>
      </div>
    </div>
  );
}
