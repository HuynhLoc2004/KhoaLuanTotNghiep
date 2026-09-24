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
import { ClientVisitorGuide } from '../../components/client/ClientVisitorGuide';
import { ClientFooter } from '../../components/client/ClientFooter';
import { ClientLoginOtpModal } from '../../components/client/ClientLoginOtpModal';
import { Turntable360Viewer } from '../../components/Turntable360Viewer';
import { X, Box, ExternalLink } from 'lucide-react';
import '../../styles/client.css';

interface ClientHomePageProps {
  onNavigateAdmin: () => void;
  onSelectRoomForTour: (room: MuseumRoom) => void;
  onSelectArtifactDetail?: (artifactId: string) => void;
  onNavigatePage: (page: 'home' | 'rooms' | 'artifacts' | 'guide') => void;
  onOpenQRScanner?: () => void;
}

export const ClientHomePage: React.FC<ClientHomePageProps> = ({
  onNavigateAdmin,
  onSelectRoomForTour,
  onSelectArtifactDetail,
  onNavigatePage,
  onOpenQRScanner
}) => {
  const { branding } = useSystemBranding();
  const { currentLang, activeLanguages, t } = useClientTranslation();

  // Quản lý Light / Dark Mode chuyên biệt của Client Portal (Mặc định: Deep Obsidian Gallery)
  const [clientTheme, setClientTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('client_theme_v2');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'dark'; // Mặc định: Deep Gallery Obsidian sang trọng chuẩn bảo tàng ảo
  });

  const toggleClientTheme = () => {
    setClientTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('client_theme_v2', next);
      } catch {}
      return next;
    });
  };

  const [rooms, setRooms] = useState<MuseumRoom[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Đăng nhập Email OTP
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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

  // Hiệu ứng cuộn hiển thị nhẹ nhàng tự nhiên từ dưới lên (Subtle Scroll Reveal)
  useEffect(() => {
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.reveal-on-scroll');
      if (!elements.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
      );

      elements.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }, 150);

    return () => clearTimeout(timer);
  }, [rooms, artifacts, topics]);

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
    <div className="client-portal" data-client-theme={clientTheme}>
      {/* 1. Thanh điều hướng cố định */}
      <ClientNavbar
        clientTheme={clientTheme}
        onToggleClientTheme={toggleClientTheme}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onNavigateAdmin={onNavigateAdmin}
        onNavigatePage={onNavigatePage}
        onOpenQRScanner={onOpenQRScanner}
      />

      <main>
        {/* 2. Banner chính (Cinematic Hero hỗ trợ cả Video & Ảnh) */}
        <ClientHeroBanner
          roomCount={rooms.length}
          artifact3DCount={artifactsWith3D.length}
          languageCount={activeLanguages.length || 5}
          onExploreTourClick={() => onNavigatePage('rooms')}
          onExploreArtifactsClick={() => onNavigatePage('artifacts')}
          featuredImageUrl={
            branding.heroBannerUrl ||
            (rooms[0]?.panoramaUrl
              ? `${API_ROOT}${rooms[0].panoramaUrl.startsWith('/') ? '' : '/'}${rooms[0].panoramaUrl}`
              : undefined)
          }
          videoUrl={branding.heroVideoUrl}
        />

        {/* 3. Khối Giới thiệu & Lịch sử (Curatorial Storytelling 2 cột nghệ thuật) */}
        <ClientIntroSection
          roomCount={rooms.length}
          artifactCount={artifacts.length}
          topicCount={topics.length}
          onExploreRooms={() => onNavigatePage('rooms')}
        />

        {/* 4. Khối Gian phòng Trưng bày 360° (Đại diện cho trang Gian phòng 360°) */}
        <ClientFeaturedRooms
          rooms={rooms}
          onSelectRoom={onSelectRoomForTour}
          onViewAllRooms={() => onNavigatePage('rooms')}
        />

        {/* 5. Khối Kiệt tác Cổ vật 3D (Đại diện cho trang Kho hiện vật) */}
        <ClientFeaturedArtifacts
          artifacts={artifacts}
          onOpen3DViewer={handleOpen3DViewer}
          onSelectArtifactDetail={onSelectArtifactDetail}
          onViewAllArtifacts={() => onNavigatePage('artifacts')}
        />



        {/* 7. Khối Hướng dẫn tham quan & Giờ mở cửa (Đại diện cho trang Cẩm nang) */}
        <ClientVisitorGuide
          onViewAllGuide={() => onNavigatePage('guide')}
        />
      </main>

      {/* 8. Chân trang văn hóa di sản */}
      <ClientFooter onNavigatePage={onNavigatePage} />

      {/* 9. Modal Đăng nhập thuần Email OTP (Không lộ mật khẩu) */}
      <ClientLoginOtpModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsLoginModalOpen(false);
        }}
      />

      {/* 10. Modal Xem Nhanh Đĩa Xoay 3D Tương Tác Của Cổ Vật */}
      {active3DArtifact && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            background: 'rgba(10, 12, 16, 0.85)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActive3DArtifact(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 960,
              maxHeight: '90vh',
              background: 'var(--c-bg-card)',
              border: '1px solid var(--c-border-gold)',
              borderRadius: 'var(--c-radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--c-shadow-lg)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Thanh tiêu đề Modal 3D */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderBottom: '1px solid var(--c-border)',
                background: 'var(--c-bg-alt)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Box size={20} style={{ color: 'var(--c-gold)' }} />
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.15rem',
                      fontFamily: 'serif',
                      color: 'var(--c-text-primary)'
                    }}
                  >
                    {active3DArtifact.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--c-text-muted)' }}>
                    {active3DArtifact.period ? `${active3DArtifact.period} • ` : ''}
                    {active3DArtifact.category || 'Cổ vật di sản'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {onSelectArtifactDetail && (
                  <button
                    type="button"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 14px',
                      borderRadius: 'var(--c-radius-pill)',
                      background: 'var(--c-primary-light)',
                      border: '1px solid var(--c-primary)',
                      color: 'var(--c-primary)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      const id = active3DArtifact.id;
                      setActive3DArtifact(null);
                      onSelectArtifactDetail(id);
                    }}
                  >
                    <span>{t('artifacts.viewFull', 'Xem Thuyết Minh Đầy Đủ')}</span>
                    <ExternalLink size={14} />
                  </button>
                )}

                <button
                  type="button"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--c-border)',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--c-text-muted)'
                  }}
                  onClick={() => setActive3DArtifact(null)}
                  aria-label="Đóng"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Trình xem 3D tương tác */}
            <div style={{ flex: 1, minHeight: 460, position: 'relative' }}>
              <Turntable360Viewer
                modelUrl={active3DArtifact.model3dUrl!}
                artifactName={active3DArtifact.name}
                artifactPeriod={active3DArtifact.period || active3DArtifact.category}
                audioNarrationUrl={active3DArtifact.audioNarrationUrl}
                translations={active3DArtifact.translations}
                height={480}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
