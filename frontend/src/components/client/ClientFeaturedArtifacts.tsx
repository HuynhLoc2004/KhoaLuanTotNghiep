import React from 'react';
import { Box } from 'lucide-react';
import { Artifact } from '../../types';
import { API_ROOT } from '../../services/api';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { Turntable360Viewer } from '../../components/Turntable360Viewer';

interface ClientFeaturedArtifactsProps {
  artifacts: Artifact[];
  onOpen3DViewer: (artifact: Artifact) => void;
  onSelectArtifactDetail?: (artifactId: string) => void;
  onViewAllArtifacts: () => void;
}

export const ClientFeaturedArtifacts: React.FC<ClientFeaturedArtifactsProps> = ({
  artifacts,
  onOpen3DViewer,
  onSelectArtifactDetail,
  onViewAllArtifacts
}) => {
  const { branding } = useSystemBranding();
  const { t, localize } = useClientTranslation();

  const sortedArtifacts = React.useMemo(() => {
    return [...artifacts].sort((a, b) => {
      if (a.model3dUrl && !b.model3dUrl) return -1;
      if (!a.model3dUrl && b.model3dUrl) return 1;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });
  }, [artifacts]);

  const activeArtifact = React.useMemo(() => {
    if (branding.artifactsFeaturedId?.trim()) {
      const targetId = branding.artifactsFeaturedId.trim();
      const matched = artifacts.find(
        (a) =>
          a.id === targetId ||
          (a as any)._id === targetId ||
          (a as any).code === targetId
      );
      if (matched) return matched;
    }
    return sortedArtifacts[0];
  }, [artifacts, branding.artifactsFeaturedId, sortedArtifacts]);

  const getFullThumb = (art?: Artifact) => {
    if (!art) return '';
    const raw = art.thumbnailUrl || (art.images && art.images[0]);
    if (!raw) return '';
    return raw.startsWith('http')
      ? raw
      : `${API_ROOT}${raw.startsWith('/') ? '' : '/'}${raw}`;
  };

  const customShowcase = branding.artifactsShowcaseImageUrl?.trim();
  const rawThumb = getFullThumb(activeArtifact);
  const currentThumb = customShowcase
    ? (customShowcase.startsWith('http') ? customShowcase : `${API_ROOT}${customShowcase.startsWith('/') ? '' : '/'}${customShowcase}`)
    : rawThumb;
  const currentTitle = activeArtifact
    ? localize(activeArtifact, 'name', activeArtifact.name)
    : t('artifacts.defaultTitle', 'Cổ vật di sản tiêu biểu');
  const artifact3DCount = artifacts.filter((a) => !!a.model3dUrl).length;

  const handleArtifactClick = () => {
    if (activeArtifact?.id && onSelectArtifactDetail) {
      onSelectArtifactDetail(activeArtifact.id);
    } else {
      onViewAllArtifacts();
    }
  };

  return (
    <section id="artifacts" className="client-section">
      <div className="client-container">
        {/* TIÊU ĐỀ PHÂN KHU TRUNG TÂM */}
        <div className="client-section-header-centered reveal-on-scroll">
          <span className="client-section-eyebrow">
            {t(branding.artifactsTag || 'artifacts.tag', branding.artifactsTag || 'Bảo Vật & Hiện Vật Tiêu Biểu')}
          </span>
          <h2 className="client-section-main-title">
            {t(branding.artifactsTitle || 'artifacts.headline', branding.artifactsTitle || 'Bộ Sưu Tập Hiện Vật & Cổ Vật 3D')}
          </h2>
          <p className="client-section-lead">
            {t(
              branding.artifactsDesc || 'artifacts.sub',
              branding.artifactsDesc ||
                'Chiêm ngưỡng các bảo vật và hiện vật lịch sử được số hóa 3D đa chiều, tái hiện chi tiết từng đường nét điêu khắc cổ xưa.'
            )}
          </p>
        </div>

        {/* BỐ CỤC TRIỂN LÃM 2 CỘT MỞ RỘNG (OPEN 2-COLUMN SHOWCASE) */}
        <div className="client-artifacts-showcase-split reveal-on-scroll">
          {/* CỘT TRÁI: BỤC TRƯNG BÀY 3D / TỦ KÍNH VITRINE */}
          <div
            className="client-artifacts-showcase-media"
            onClick={handleArtifactClick}
            role="button"
            tabIndex={0}
            title={t('artifacts.clickToEnter', 'Bấm để xem chi tiết hiện vật')}
            style={{ cursor: 'pointer' }}
          >
            {activeArtifact?.model3dUrl ? (
              <div style={{ width: '100%', height: '100%', minHeight: 480, cursor: 'pointer' }}>
                <Turntable360Viewer
                  modelUrl={
                    activeArtifact.model3dUrl.startsWith('http')
                      ? activeArtifact.model3dUrl
                      : `${API_ROOT}${activeArtifact.model3dUrl.startsWith('/') ? '' : '/'}${activeArtifact.model3dUrl}`
                  }
                  imageUrl={
                    currentThumb ||
                    activeArtifact.thumbnailUrl ||
                    activeArtifact.images?.[0] ||
                    undefined
                  }
                  artifactName={currentTitle}
                  height={480}
                  hideControls={true}
                  onClick={handleArtifactClick}
                />
              </div>
            ) : currentThumb ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <img
                  src={currentThumb}
                  alt={currentTitle}
                  style={{ maxHeight: '85%', maxWidth: '85%', objectFit: 'contain', filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.7))' }}
                  loading="lazy"
                />
                <div className="client-zigzag-badge-float">
                  <span>{t('artifacts.vitrineBadge', 'Bảo vật số hóa')}</span>
                </div>
              </div>
            ) : (
              <div className="client-media-placeholder">
                <div className="client-media-placeholder-icon">
                  <Box size={32} strokeWidth={1.5} />
                </div>
                <span className="client-media-placeholder-title">
                  {t('artifacts.noArtifactTitle', 'Chưa bổ sung hiện vật di sản')}
                </span>
                <span className="client-media-placeholder-desc">
                  {t('artifacts.noArtifactDesc', 'Thông tin và mô hình 3D sẽ xuất hiện sau khi được quản trị viên tải lên hệ thống.')}
                </span>
              </div>
            )}
          </div>

          {/* CỘT PHẢI: BẢNG GIÁM TUYỂN THÔNG TIN HIỆN VẬT */}
          <div className="client-artifacts-showcase-info">
            <span className="client-section-eyebrow" style={{ marginBottom: 8 }}>
              {activeArtifact ? localize(activeArtifact, 'period', (activeArtifact as any).period || 'Cổ vật di sản') : 'Hiện vật số hóa'}
            </span>

            <h3 className="client-artifacts-showcase-name">
              {currentTitle}
            </h3>

            <p className="client-artifacts-showcase-desc">
              {activeArtifact
                ? localize(
                    activeArtifact,
                    'description',
                    (activeArtifact as any).description ||
                      'Hiện vật quý giá được lưu giữ tại Bảo tàng Lịch sử TP. Hồ Chí Minh, được phục dựng số hóa chi tiết nhằm lan tỏa giá trị di sản văn hóa dân tộc.'
                  )
                : 'Hiện vật quý giá được lưu giữ tại Bảo tàng Lịch sử TP. Hồ Chí Minh.'}
            </p>

            {/* DÒNG THỐNG KÊ HIỆN VẬT */}
            <div className="client-intro-plaque-grid" style={{ marginBottom: 26, padding: '16px 22px' }}>
              <div className="client-intro-plaque-item">
                <span className="client-intro-plaque-num">{artifacts.length}</span>
                <span className="client-intro-plaque-label">{t('artifacts.statTotal', 'Hiện vật lưu trữ')}</span>
              </div>
              <div className="client-intro-plaque-sep" />
              <div className="client-intro-plaque-item">
                <span className="client-intro-plaque-num">{artifact3DCount}</span>
                <span className="client-intro-plaque-label">{t('artifacts.stat3D', 'Mô hình 3D xoay')}</span>
              </div>
              <div className="client-intro-plaque-sep" />
              <div className="client-intro-plaque-item">
                <span className="client-intro-plaque-num">AI</span>
                <span className="client-intro-plaque-label">{t('artifacts.statAudio', 'Thuyết minh đa ngữ')}</span>
              </div>
            </div>

            <div>
              <button
                type="button"
                className="client-intro-btn"
                onClick={onViewAllArtifacts}
              >
                {t(branding.artifactsCtaText || 'artifacts.btnViewAll', branding.artifactsCtaText || `Khám phá toàn bộ cổ vật (${artifacts.length})`)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
