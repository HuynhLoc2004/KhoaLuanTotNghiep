import React, { useState, useEffect } from 'react';
import { api, API_ROOT } from '../../services/api';
import { MuseumRoom, Artifact, TopicItem } from '../../types';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { ClientNavbar } from '../../components/client/ClientNavbar';
import { ClientHeroBanner } from '../../components/client/ClientHeroBanner';
import { ClientIntroSection } from '../../components/client/ClientIntroSection';
import { ClientFeaturedRooms } from '../../components/client/ClientFeaturedRooms';
import { ClientFeaturedArtifacts } from '../../components/client/ClientFeaturedArtifacts';
import { ClientTopicsSection } from '../../components/client/ClientTopicsSection';
import { ClientVisitorGuide } from '../../components/client/ClientVisitorGuide';
import { ClientFooter } from '../../components/client/ClientFooter';
import { Turntable360Viewer } from '../../components/Turntable360Viewer';
import { X, Box, ExternalLink, Loader2 } from 'lucide-react';
import '../../styles/client.css';

interface ClientHomePageProps {
  onNavigateAdmin: () => void;
  onSelectRoomForTour: (room: MuseumRoom) => void;
  onSelectArtifactDetail?: (artifactId: string) => void;
}

export const ClientHomePage: React.FC<ClientHomePageProps> = ({
  onNavigateAdmin,
  onSelectRoomForTour,
  onSelectArtifactDetail
}) => {
  const { branding } = useSystemBranding();
  const { currentLang, activeLanguages, t } = useClientTranslation();

  const [rooms, setRooms] = useState<MuseumRoom[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal xem nhanh 3D đĩa xoay cho khách tham quan
  const [active3DArtifact, setActive3DArtifact] = useState<Artifact | null>(null);

  // Tải toàn bộ dữ liệu thật từ MongoDB
  useEffect(() => {
    let isMounted = true;
    const loadHomeData = async () => {
      try {
        setIsLoading(true);
        const [roomsData, artifactsData, topicsData] = await Promise.all([
          api.getRooms().catch(() => []),
          api.getArtifacts().catch(() => []),
          api.getTopics().catch(() => [])
        ]);

        if (isMounted) {
          setRooms(roomsData);
          setArtifacts(artifactsData);
          setTopics(topicsData);
        }
      } catch (err) {
        console.error('[ClientHomePage] Lỗi nạp dữ liệu trang chủ:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpen3DViewer = (artifact: Artifact) => {
    setActive3DArtifact(artifact);
  };

  const scrollToRooms = () => {
    const el = document.getElementById('rooms');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToArtifacts = () => {
    const el = document.getElementById('artifacts');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const artifactsWith3D = artifacts.filter((a) => !!a.model3dUrl);

  return (
    <div className="client-portal">
      {/* 1. Thanh điều hướng cố định */}
      <ClientNavbar onNavigateAdmin={onNavigateAdmin} />

      <main>
        {/* 2. Banner chính */}
        <ClientHeroBanner
          roomCount={rooms.length}
          artifact3DCount={artifactsWith3D.length}
          languageCount={activeLanguages.length || 5}
          onExploreTourClick={scrollToRooms}
          onExploreArtifactsClick={scrollToArtifacts}
          featuredImageUrl={rooms[0]?.panoramaUrl ? `${API_ROOT}${rooms[0].panoramaUrl.startsWith('/') ? '' : '/'}${rooms[0].panoramaUrl}` : undefined}
        />

        {/* 3. Giới thiệu Bảo tàng & Kiến trúc */}
        <ClientIntroSection />

        {/* 4. Các gian phòng 360° tiêu biểu */}
        <ClientFeaturedRooms
          rooms={rooms}
          onSelectRoom={(room) => onSelectRoomForTour(room)}
        />

        {/* 5. Bộ sưu tập cổ vật số hóa 3D */}
        <ClientFeaturedArtifacts
          artifacts={artifacts}
          onSelectArtifact={handleOpen3DViewer}
        />

        {/* 6. Không gian triển lãm chuyên đề */}
        <ClientTopicsSection topics={topics} />

        {/* 7. Hướng dẫn tham quan & thông tin thực tế */}
        <ClientVisitorGuide />
      </main>

      {/* 8. Chân trang di sản */}
      <ClientFooter onNavigateAdmin={onNavigateAdmin} />

      {/* =========================================================================
          MODAL XEM 3D TƯƠNG TÁC ĐĨA XOAY CHO KHÁCH THAM QUAN
          ========================================================================= */}
      {active3DArtifact && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 2000 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActive3DArtifact(null);
          }}
        >
          <div
            className="modal-card"
            style={{
              maxWidth: 860,
              width: '95vw',
              maxHeight: '92vh',
              margin: 'auto',
              display: 'flex',
              flexDirection: 'column',
              background: '#0d1118',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 16,
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                background: '#121620'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Box size={18} style={{ color: 'var(--accent-gold)' }} />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>
                    {active3DArtifact.name}
                  </h3>
                  <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}>
                    {active3DArtifact.period || active3DArtifact.category || 'Cổ vật di sản'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActive3DArtifact(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 6
                }}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Turntable 360 Viewer */}
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <Turntable360Viewer
                modelUrl={
                  active3DArtifact.model3dUrl && active3DArtifact.model3dUrl.trim() !== ''
                    ? (active3DArtifact.model3dUrl.startsWith('http')
                        ? active3DArtifact.model3dUrl
                        : `${API_ROOT}${active3DArtifact.model3dUrl.startsWith('/') ? '' : '/'}${active3DArtifact.model3dUrl}`)
                    : undefined
                }
                artifactName={active3DArtifact.name}
                artifactPeriod={active3DArtifact.period}
                audioNarrationUrl={
                  active3DArtifact.audioNarrationUrl ||
                  active3DArtifact.translations?.vi?.audioNarrationUrl ||
                  (active3DArtifact.translations &&
                    Object.values(active3DArtifact.translations).find((t: any) => !!t?.audioNarrationUrl)?.audioNarrationUrl)
                }
                translations={active3DArtifact.translations}
                autoPlayAudio={true}
                height={typeof window !== 'undefined' && window.innerWidth < 640 ? Math.min(380, Math.round(window.innerHeight * 0.52)) : 500}
              />
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#121620'
              }}
            >
              <a
                href={`/?artifact=${active3DArtifact.code || active3DArtifact.id}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--accent-gold)',
                  fontSize: '13px',
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                <ExternalLink size={14} />
                <span>Xem trang tư liệu khảo cứu đầy đủ</span>
              </a>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActive3DArtifact(null)}
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
