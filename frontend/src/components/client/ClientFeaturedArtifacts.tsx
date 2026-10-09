import React from 'react';
import { Artifact } from '../../types';
import { API_ROOT } from '../../services/api';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';

interface ClientFeaturedArtifactsProps {
  artifacts: Artifact[];
  onOpen3DViewer?: (artifact: Artifact) => void;
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

  // Ưu tiên hiện vật có mô hình 3D và mới tạo nhất lên đầu
  const sortedArtifacts = React.useMemo(() => {
    return [...artifacts].sort((a, b) => {
      const has3DA = a.model3dUrl ? 1 : 0;
      const has3DB = b.model3dUrl ? 1 : 0;
      if (has3DA !== has3DB) return has3DB - has3DA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });
  }, [artifacts]);

  // Lấy 4 hiện vật tiêu biểu cho lưới triển lãm trang chủ
  const displayArtifacts = sortedArtifacts.slice(0, 4);

  const getFullThumb = (art?: Artifact) => {
    if (!art) return '';
    const raw = art.thumbnailUrl || (art.images && art.images[0]);
    if (!raw) return '';
    return raw.startsWith('http')
      ? raw
      : `${API_ROOT}${raw.startsWith('/') ? '' : '/'}${raw}`;
  };

  const handleArtifactClick = (art: Artifact) => {
    if (art.id && onSelectArtifactDetail) {
      onSelectArtifactDetail(art.id);
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
            {t(branding.artifactsTag || 'artifacts.tag', branding.artifactsTag || 'Kho Tàng Di Sản')}
          </span>
          <h2 className="client-section-main-title">
            {t(branding.artifactsTitle || 'artifacts.headline', branding.artifactsTitle || 'Bảo Vật Quốc Gia & Cổ Vật Tiêu Biểu')}
          </h2>
          <p className="client-section-lead">
            {t(
              branding.artifactsDesc || 'artifacts.sub',
              branding.artifactsDesc ||
                'Chiêm ngưỡng các bảo vật lịch sử quý giá được phục dựng số hóa 3D sắc nét, hỗ trợ xoay đa góc độ và tra cứu tư liệu lịch sử.'
            )}
          </p>
        </div>

        {/* LƯỚI TRIỂN LÃM GALLERY 4 CỘT CÂN ĐỐI (KHÔNG SIDEBAR) */}
        {displayArtifacts.length > 0 ? (
          <div className="client-artifacts-gallery-grid reveal-on-scroll">
            {displayArtifacts.map((art) => {
              const thumb = getFullThumb(art);
              const title = localize(art, 'name', art.name);
              const period = localize(art, 'period', (art as any).period || (art as any).category || 'Hiện vật di sản');
              const has3D = Boolean(art.model3dUrl);

              return (
                <div
                  key={art.id}
                  className="client-artifact-card"
                  onClick={() => handleArtifactClick(art)}
                  role="button"
                  tabIndex={0}
                  title={`Chiêm ngưỡng: ${title}`}
                >
                  <div className="client-artifact-card-media">
                    {thumb ? (
                      <img src={thumb} alt={title} loading="lazy" />
                    ) : (
                      <div style={{ color: '#64748B', fontSize: '0.85rem' }}>
                        Di sản
                      </div>
                    )}
                    {has3D && (
                      <span className="client-artifact-tag-3d">
                        {t('artifacts.badge3D', 'Mô hình 3D')}
                      </span>
                    )}
                  </div>

                  <div className="client-artifact-card-body">
                    <span className="client-artifact-period">{period}</span>
                    <h3 className="client-artifact-name">{title}</h3>
                    <button
                      type="button"
                      className="client-artifact-explore-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArtifactClick(art);
                      }}
                    >
                      <span>{t('artifacts.viewDetailsBtn', 'Chiêm ngưỡng hiện vật')}</span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="client-media-placeholder">
            <span className="client-media-placeholder-title">
              {t('artifacts.noArtifactTitle', 'Đang cập nhật hiện vật di sản')}
            </span>
          </div>
        )}

        {/* NÚT XEM TOÀN BỘ BỘ SƯU TẬP Ở CHÂN PHÂN KHU */}
        <div className="client-section-center-action reveal-on-scroll">
          <button
            type="button"
            className="client-intro-btn"
            onClick={onViewAllArtifacts}
          >
            {t(branding.artifactsCtaText || 'artifacts.btnViewAll', branding.artifactsCtaText || `Khám phá toàn bộ kho hiện vật (${artifacts.length})`)}
          </button>
        </div>
      </div>
    </section>
  );
};
