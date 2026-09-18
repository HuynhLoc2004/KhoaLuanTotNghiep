import React, { useState, useEffect } from 'react';
import { MuseumArtifact, MuseumRoom } from '../../types';
import { api, API_ROOT } from '../../services/api';
import { Turntable360Viewer } from '../../components/Turntable360Viewer';
import { AIVoiceNarrator } from '../../components/AIVoiceNarrator';
import { Landmark, Compass, QrCode, Share2, Sparkles, MapPin, Calendar, Layers, ShieldCheck, ArrowLeft, Loader2, Check } from 'lucide-react';

interface PublicArtifactViewProps {
  artifactId: string;
  onNavigateToRoom?: (roomId: string) => void;
  onBackToAdmin?: () => void;
}

export const PublicArtifactView: React.FC<PublicArtifactViewProps> = ({
  artifactId,
  onNavigateToRoom,
  onBackToAdmin
}) => {
  const [artifact, setArtifact] = useState<MuseumArtifact | null>(null);
  const [room, setRoom] = useState<MuseumRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const artData = await api.getArtifact(artifactId);
        setArtifact(artData);

        if (artData.roomId) {
          try {
            const roomData = await api.getRoom(artData.roomId);
            setRoom(roomData);
          } catch {}
        }
      } catch (err: any) {
        setError(err.message || 'Không thể tìm thấy hiện vật di sản');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [artifactId]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0F172A',
          color: '#F8FAFC',
          gap: 16
        }}
      >
        <Loader2 size={36} className="spin" style={{ color: '#F59E0B' }} />
        <p style={{ fontSize: 14, color: '#94A3B8' }}>Đang nạp dữ liệu hiện vật 3D...</p>
      </div>
    );
  }

  if (error || !artifact) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0F172A',
          color: '#F8FAFC',
          padding: 24,
          textAlign: 'center'
        }}
      >
        <Landmark size={48} style={{ color: '#EF4444', marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Không tìm thấy hiện vật</h2>
        <p style={{ color: '#94A3B8', maxWidth: 400, marginBottom: 20 }}>
          {error || 'Hiện vật này có thể chưa được kích hoạt hoặc mã QR không tồn tại trên hệ thống.'}
        </p>
        {onBackToAdmin && (
          <button
            onClick={onBackToAdmin}
            style={{
              padding: '10px 20px',
              background: '#8B1818',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Trở về Quản trị
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="public-artifact-page"
      style={{
        minHeight: '100vh',
        background: '#0D1117',
        color: '#E2E8F0',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onBackToAdmin && (
            <button
              onClick={onBackToAdmin}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#fff',
                width: 34,
                height: 34,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Quay lại"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#8B1818',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: 13,
              boxShadow: '0 2px 8px rgba(139, 24, 24, 0.5)'
            }}
          >
            BT
          </div>

          <div>
            <h1 style={{ fontSize: 13, fontWeight: 700, margin: 0, color: '#F8FAFC' }}>
              Bảo tàng Lịch sử TP.HCM
            </h1>
            <p style={{ fontSize: 10, margin: 0, color: '#94A3B8' }}>
              Di sản Số hóa 3D • Khảo cổ học
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setShowQrModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#F1F5F9',
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <QrCode size={14} color="#F59E0B" />
            <span>Mã QR</span>
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main style={{ flex: 1, maxWidth: 900, width: '100%', margin: '0 auto', padding: '16px' }}>
        {/* 360 Turntable Pedestal Viewer */}
        <div style={{ marginBottom: 20 }}>
          <Turntable360Viewer
            images={artifact.images360 && artifact.images360.length > 0 ? artifact.images360 : [artifact.thumbnailUrl]}
            model3dUrl={artifact.model3dUrl}
            title={artifact.name}
            height={420}
          />
        </div>

        {/* AI Voice Narration Widget */}
        <div style={{ marginBottom: 24 }}>
          <AIVoiceNarrator
            text={artifact.audioText || artifact.description}
            title={`Thuyết minh: ${artifact.name}`}
          />
        </div>

        {/* Artifact Main Metadata Card */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Badges & Title */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: '#FEF3C7',
                color: '#92400E',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 6
              }}
            >
              <ShieldCheck size={13} />
              Mã: {artifact.code}
            </span>

            {artifact.featured && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'rgba(239, 68, 68, 0.18)',
                  color: '#F87171',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 6
                }}
              >
                <Sparkles size={12} />
                BẢO VẬT QUỐC GIA
              </span>
            )}
          </div>

          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#F8FAFC',
              marginBottom: 16,
              lineHeight: 1.3
            }}
          >
            {artifact.name}
          </h2>

          {/* Quick Stats Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
              marginBottom: 20
            }}
          >
            <div style={statBoxStyle}>
              <Calendar size={16} color="#F59E0B" />
              <div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>Niên đại lịch sử</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>
                  {artifact.period || 'Chưa xác định'}
                </div>
              </div>
            </div>

            <div style={statBoxStyle}>
              <Layers size={16} color="#F59E0B" />
              <div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>Chất liệu & Kích thước</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>
                  {artifact.material || 'Đang cập nhật'} {artifact.dimensions ? `(${artifact.dimensions})` : ''}
                </div>
              </div>
            </div>

            <div style={statBoxStyle}>
              <MapPin size={16} color="#F59E0B" />
              <div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>Xuất xứ khai quật</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>
                  {artifact.origin || 'Bảo tàng Lịch sử TP.HCM'}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Historical Significance */}
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#F59E0B', marginBottom: 8 }}>
              Ý nghĩa Lịch sử & Giá trị Khảo cổ
            </h3>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: '#CBD5E1',
                whiteSpace: 'pre-line',
                margin: 0
              }}
            >
              {artifact.description || 'Đang cập nhật thông tin khảo cứu lịch sử cho hiện vật này.'}
            </p>
          </div>
        </div>

        {/* Room Connection Card (Connect to 360 Tour) */}
        {artifact.roomId && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(139, 24, 24, 0.25) 0%, rgba(30, 41, 59, 0.8) 100%)',
              border: '1px solid rgba(139, 24, 24, 0.4)',
              borderRadius: 16,
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 30
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#8B1818',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0
                }}
              >
                <Compass size={24} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#FCA5A5', fontWeight: 600 }}>
                  VỊ TRÍ TRƯNG BÀY TẠI BẢO TÀNG
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                  {room ? room.name : 'Gian trưng bày thực tế'}
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>
                  {room ? room.period : 'Mã phòng: ' + artifact.roomId}
                </div>
              </div>
            </div>

            {onNavigateToRoom && (
              <button
                onClick={() => onNavigateToRoom(artifact.roomId!)}
                style={{
                  background: '#8B1818',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 12px rgba(139, 24, 24, 0.4)',
                  transition: 'all 0.2s'
                }}
              >
                <Compass size={16} />
                Bước vào Tour 360
              </button>
            )}
          </div>
        )}
      </main>

      {/* QR Code Modal for Visitor Sharing */}
      {showQrModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            zIndex: 100
          }}
          onClick={() => setShowQrModal(false)}
        >
          <div
            style={{
              background: '#1E293B',
              borderRadius: 20,
              padding: 24,
              maxWidth: 360,
              width: '100%',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>
              Mã QR Hiện Vật
            </h3>
            <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>
              Quét để mở trực tiếp hiện vật 3D trên điện thoại
            </p>

            <div
              style={{
                background: '#fff',
                padding: 16,
                borderRadius: 12,
                display: 'inline-block',
                marginBottom: 16,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
              }}
            >
              {artifact.qrCodeDataUrl ? (
                <img
                  src={artifact.qrCodeDataUrl}
                  alt={`QR ${artifact.name}`}
                  style={{ width: 220, height: 220, display: 'block' }}
                />
              ) : (
                <div style={{ width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                  Đang tạo QR...
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleCopyLink}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                {copied ? <Check size={16} color="#10B981" /> : <Share2 size={16} />}
                {copied ? 'Đã sao chép!' : 'Sao chép link'}
              </button>

              <button
                onClick={() => setShowQrModal(false)}
                style={{
                  padding: '10px 18px',
                  background: '#8B1818',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const statBoxStyle: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.6)',
  padding: '10px 12px',
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  border: '1px solid rgba(255,255,255,0.05)'
};
