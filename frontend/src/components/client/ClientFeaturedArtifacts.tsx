import React from 'react';
import { Box, ArrowRight } from 'lucide-react';
import { Artifact } from '../../types';
import { API_ROOT } from '../../services/api';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';

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

  // Ưu tiên hiện vật có 3D trước, lấy tối đa 4 hiện vật đại diện
  const showcaseArtifacts = React.useMemo(() => {
    if (!artifacts || artifacts.length === 0) return [];

    let sorted = [...artifacts].sort((a, b) => {
      if (a.model3dUrl && !b.model3dUrl) return -1;
      if (!a.model3dUrl && b.model3dUrl) return 1;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });

    if (branding.artifactsFeaturedId) {
      const featured = sorted.find(
        (a) =>
          a.id === branding.artifactsFeaturedId ||
          (a as any)._id === branding.artifactsFeaturedId ||
          (a as any).code === branding.artifactsFeaturedId
      );
      if (featured) {
        sorted = [featured, ...sorted.filter((a) => a.id !== featured.id)];
      }
    }

    return sorted.slice(0, 4);
  }, [artifacts, branding.artifactsFeaturedId]);

  const featuredSingle = showcaseArtifacts[0];
  const isSingleArtifact = showcaseArtifacts.length === 1;

  const getArtifactThumb = (art?: Artifact) => {
    if (!art) return '';
    const raw = art.thumbnailUrl || (art.images && art.images[0]) || '';
    if (!raw) return '';
    return raw.startsWith('http') ? raw : `${API_ROOT}${raw.startsWith('/') ? '' : '/'}${raw}`;
  };

  const handleArtifactClick = (art: Artifact) => {
    if (art?.id && onSelectArtifactDetail) {
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
            {t(branding.artifactsTag || 'artifacts.tag', branding.artifactsTag || 'Bảo Vật & Hiện Vật Tiêu Biểu')}
          </span>
          <h2 className="client-section-main-title">
            {t(branding.artifactsTitle || 'artifacts.headline', branding.artifactsTitle || 'Kho Tàng Cổ Vật & Bảo Vật Di Sản')}
          </h2>
          <p className="client-section-lead">
            {t(
              branding.artifactsDesc || 'artifacts.sub',
              branding.artifactsDesc ||
                'Chiêm ngưỡng những kiệt tác nghìn năm từ thời tiền sử đến thế kỷ XX được lưu giữ và số hóa đa chiều phục vụ trải nghiệm tham quan trực quan.'
            )}
          </p>
        </div>

        {/* NẾU CHỈ CÓ 1 HIỆN VẬT: HIỂN THỊ THẺ ĐƠN TIÊU BIỂU CÂN ĐỐI */}
        {isSingleArtifact && featuredSingle ? (
          <div
            className="client-artifact-featured-teaser reveal-on-scroll"
            onClick={() => handleArtifactClick(featuredSingle)}
            role="button"
            tabIndex={0}
            title={t('artifacts.clickToEnter', 'Bấm để xem chi tiết hiện vật')}
          >
            <div className="client-artifact-teaser-media">
              {getArtifactThumb(featuredSingle) ? (
                <img
                  src={getArtifactThumb(featuredSingle)}
                  alt={localize(featuredSingle, 'name', featuredSingle.name)}
                  className="client-artifact-teaser-img"
                  loading="lazy"
                />
              ) : (
                <div className="client-media-placeholder">
                  <Box size={36} strokeWidth={1.5} />
                </div>
              )}
              <div className="client-artifact-teaser-badge">
                <span>{featuredSingle.model3dUrl ? 'Bảo vật số hóa 3D' : 'Hiện vật di sản'}</span>
              </div>
            </div>

            <div className="client-artifact-teaser-content">
              <span className="client-section-eyebrow" style={{ marginBottom: 6 }}>
                {localize(featuredSingle, 'period', (featuredSingle as any).period || 'Cổ vật di sản')}
              </span>
              <h3 className="client-artifact-teaser-title">
                {localize(featuredSingle, 'name', featuredSingle.name)}
              </h3>
              <p className="client-artifact-teaser-desc">
                {localize(
                  featuredSingle,
                  'description',
                  (featuredSingle as any).description ||
                    'Hiện vật quý giá được lưu giữ tại Bảo tàng Lịch sử TP. Hồ Chí Minh, được phục dựng số hóa chi tiết nhằm lan tỏa giá trị di sản văn hóa dân tộc.'
                )}
              </p>

              <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                <button
                  type="button"
                  className="client-intro-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArtifactClick(featuredSingle);
                  }}
                >
                  <span>{t('artifacts.viewDetailBtn', 'Chiêm ngưỡng chi tiết hiện vật')}</span>
                  <ArrowRight size={14} style={{ marginLeft: 6, display: 'inline' }} />
                </button>
              </div>
            </div>
          </div>
        ) : showcaseArtifacts.length > 1 ? (
          /* NẾU CÓ NHIỀU HIỆN VẬT: HIỂN THỊ LƯỚI GALLERY CARD TRANG TRỌNG */
          <div className="client-artifacts-gallery-grid reveal-on-scroll">
            {showcaseArtifacts.map((art) => {
              const thumbUrl = getArtifactThumb(art);
              const artName = localize(art, 'name', art.name);
              const artPeriod = localize(art, 'period', (art as any).period || 'Cổ vật di sản');

              return (
                <div
                  key={art.id}
                  className="client-artifact-gallery-card"
                  onClick={() => handleArtifactClick(art)}
                  role="button"
                  tabIndex={0}
                  title={`Chiêm ngưỡng: ${artName}`}
                >
                  <div className="client-artifact-gallery-media">
                    {thumbUrl ? (
                      <img src={thumbUrl} alt={artName} loading="lazy" />
                    ) : (
                      <div className="client-media-placeholder">
                        <Box size={28} strokeWidth={1.5} />
                      </div>
                    )}
                    {art.model3dUrl && (
                      <div className="client-artifact-gallery-badge">
                        <span>3D Scan</span>
                      </div>
                    )}
                  </div>

                  <div className="client-artifact-gallery-body">
                    <span className="client-artifact-gallery-period">{artPeriod}</span>
                    <h3 className="client-artifact-gallery-title">{artName}</h3>
                    <div className="client-artifact-gallery-action">
                      <span>{t('artifacts.viewLink', 'Chiêm ngưỡng hiện vật')}</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="client-media-placeholder" style={{ minHeight: 240, margin: '20px 0' }}>
            <Box size={36} strokeWidth={1.5} />
            <span className="client-media-placeholder-title">
              {t('artifacts.noArtifactTitle', 'Đang cập nhật kho bảo vật số hóa')}
            </span>
          </div>
        )}

        {/* NÚT XEM TẤT CẢ HIỆN VẬT */}
        {artifacts.length > 0 && (
          <div className="client-section-center-action reveal-on-scroll" style={{ marginTop: 28 }}>
            <button
              type="button"
              className="client-intro-btn"
              onClick={onViewAllArtifacts}
            >
              {t(
                branding.artifactsCtaText || 'artifacts.btnViewAll',
                branding.artifactsCtaText || `Khám phá toàn bộ kho cổ vật (${artifacts.length})`
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
