import React, { useEffect, useState } from 'react';
import '../../styles/toast.css';

export default function Toast({ type, message, onClose, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto close
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: `translateX(-50%) translateY(${isVisible ? '0' : '-20px'})`,
      background: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 9999999, // ✅ TĂNG z-index CỰC CAO
      minWidth: '280px',
      maxWidth: '400px',
      borderLeft: `4px solid ${colors[type]}`,
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.21, 1.02, 0.73, 1)',
      pointerEvents: 'auto' // ✅ Cho phép click
    }}>
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: colors[type],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <span style={{ 
          color: 'white', 
          fontSize: '12px', 
          fontWeight: 'bold',
          lineHeight: '1'
        }}>
          {icons[type]}
        </span>
      </div>
      <span style={{ 
        flex: 1, 
        color: '#1f2937', 
        fontSize: '14px', 
        fontWeight: 500,
        lineHeight: '1.4'
      }}>
        {message}
      </span>
      <button 
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }} 
        style={{
          background: 'none',
          border: 'none',
          color: '#9ca3af',
          fontSize: '18px',
          cursor: 'pointer',
          padding: 0,
          width: '20px',
          height: '20px',
          lineHeight: '1',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.color = '#6b7280';
          e.target.style.background = '#f3f4f6';
          e.target.style.borderRadius = '4px';
        }}
        onMouseLeave={(e) => {
          e.target.style.color = '#9ca3af';
          e.target.style.background = 'none';
        }}
      >
        ×
      </button>
    </div>
  );
}