import React, { useState, useEffect } from 'react';
import { MaintenanceStatus } from '../../types';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { Clock, RefreshCw, LogIn, MapPin, ShieldAlert } from 'lucide-react';

interface ClientMaintenanceViewProps {
  maintenance: MaintenanceStatus;
  onRetry: () => Promise<void>;
  onNavigateAdmin?: () => void;
}

export const ClientMaintenanceView: React.FC<ClientMaintenanceViewProps> = ({
  maintenance,
  onRetry,
  onNavigateAdmin
}) => {
  const { branding } = useSystemBranding();
  const [isRetrying, setIsRetrying] = useState(false);
  const [timeRemainingText, setTimeRemainingText] = useState('');

  // Tính toán thời gian dự kiến hoàn tất & đếm ngược
  useEffect(() => {
    const calculateTime = () => {
      const startTime = new Date(maintenance.startTime || maintenance.updatedAt).getTime();
      const estMinutes = Number(maintenance.estimatedMinutes) || 30;
      const validStart = isNaN(startTime) ? Date.now() : startTime;
      const expectedEndTime = new Date(validStart + estMinutes * 60000);

      const remainingMs = expectedEndTime.getTime() - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / 60000);

      const startStr = new Date(validStart).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const endStr = expectedEndTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      if (remainingMinutes > 0) {
        setTimeRemainingText(`Dự kiến hoàn tất trong khoảng ${remainingMinutes} phút nữa (khoảng ${endStr})`);
      } else {
        setTimeRemainingText('Hệ thống đang hoàn thiện những khâu kiểm tra cuối cùng và sẽ mở lại trong ít phút');
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 10000);
    return () => clearInterval(interval);
  }, [maintenance]);

  const handleManualRetry = async () => {
    if (isRetrying) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setTimeout(() => setIsRetrying(false), 500);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#1A1715',
        color: '#EDE5DF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: "'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      <div
        style={{
          maxWidth: 540,
          width: '100%',
          backgroundColor: '#24201D',
          border: '1px solid #362F29',
          borderRadius: 12,
          padding: '36px 32px',
          textAlign: 'center',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
          position: 'relative'
        }}
      >
        {/* Biểu trưng hoặc Logo bảo tàng */}
        <div style={{ marginBottom: 16 }}>
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.shortName || 'Logo'}
              style={{
                maxHeight: 64,
                maxWidth: 180,
                objectFit: 'contain',
                margin: '0 auto',
                display: 'block'
              }}
            />
          ) : (
            <div
              style={{
                width: 48,
                height: 48,
                margin: '0 auto',
                background: 'linear-gradient(135deg, #8C2D19 0%, #6E2212 100%)',
                color: '#D4A86A',
                border: '1px solid rgba(212, 168, 106, 0.45)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: 0.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              {branding.emblemText || 'BT'}
            </div>
          )}
        </div>

        {/* Tên bảo tàng */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: '#D4A86A',
            marginBottom: 10
          }}
        >
          {branding.museumName || 'Bảo tàng Lịch sử TP. Hồ Chí Minh'}
        </div>

        {/* Tiêu đề thông báo do Admin cấu hình */}
        <h1
          style={{
            fontSize: 21,
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: 14,
            lineHeight: 1.35
          }}
        >
          {maintenance.title || 'Hệ Thống Đang Nâng Cấp & Bảo Trì'}
        </h1>

        {/* Đường gạch ngang phân cách */}
        <div
          style={{
            width: 48,
            height: 1,
            backgroundColor: '#362F29',
            margin: '0 auto 16px'
          }}
        />

        {/* Lời nhắn gửi khách tham quan do Admin cấu hình */}
        <p
          style={{
            fontSize: 13.5,
            lineHeight: 1.65,
            color: '#A3978C',
            marginBottom: 22,
            whiteSpace: 'pre-line'
          }}
        >
          {maintenance.message ||
            'Hệ thống Tour 360 và Không gian Di sản đang được nâng cấp để phục vụ quý khách tốt hơn. Quý khách vui lòng quay lại sau ít phút.'}
        </p>

        {/* Khối thời gian dự kiến */}
        {timeRemainingText && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12.5,
              color: '#D4A86A',
              marginBottom: 24,
              padding: '8px 16px',
              backgroundColor: '#2C2723',
              borderRadius: 6,
              border: '1px solid rgba(212, 168, 106, 0.25)'
            }}
          >
            <Clock size={15} style={{ color: '#D4A86A', flexShrink: 0 }} />
            <span>{timeRemainingText}</span>
          </div>
        )}

        {/* Khối nút hành động */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12
          }}
        >
          <button
            type="button"
            onClick={handleManualRetry}
            disabled={isRetrying}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: '#2C2723',
              color: '#EDE5DF',
              fontSize: 13,
              fontWeight: 500,
              padding: '9px 26px',
              borderRadius: 6,
              border: '1px solid #362F29',
              cursor: isRetrying ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <RefreshCw
              size={14}
              style={{
                animation: isRetrying ? 'spin 0.75s linear infinite' : 'none'
              }}
            />
            <span>{isRetrying ? 'Đang kiểm tra kết nối...' : 'Thử kết nối lại'}</span>
          </button>

          <span style={{ fontSize: 12, color: '#7A6F65' }}>
            Hệ thống sẽ tự động chuyển tiếp ngay khi dịch vụ hoàn tất bảo trì.
          </span>

          {/* Cổng đăng nhập dành riêng cho Quản trị viên (Admin không bao giờ bị chặn) */}
          <div style={{ marginTop: 12 }}>
            {onNavigateAdmin ? (
              <button
                type="button"
                onClick={onNavigateAdmin}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px 8px',
                  color: '#D4A86A',
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  opacity: 0.85,
                  textDecoration: 'none'
                }}
              >
                <LogIn size={13} />
                <span>Cổng Quản trị viên đăng nhập</span>
              </button>
            ) : (
              <a
                href="/admin-login"
                style={{
                  color: '#D4A86A',
                  fontSize: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  opacity: 0.85,
                  textDecoration: 'none'
                }}
              >
                <LogIn size={13} />
                <span>Cổng Quản trị viên đăng nhập</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Footer địa chỉ thực tế từ nhận diện bảo tàng */}
      <footer
        style={{
          marginTop: 24,
          fontSize: 11.5,
          color: '#7A6F65',
          textAlign: 'center',
          lineHeight: 1.6
        }}
      >
        <div>{branding.address || 'Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'}</div>
        <div style={{ marginTop: 4 }}>
          <a
            href="/admin-login"
            style={{
              color: '#7A6F65',
              textDecoration: 'none',
              transition: 'color 0.15s ease'
            }}
          >
            Quản trị viên đăng nhập
          </a>
        </div>
      </footer>
    </div>
  );
};
