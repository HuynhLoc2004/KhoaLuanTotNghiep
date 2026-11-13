import React from 'react';
import { Box, ArrowRight } from 'lucide-react';
import { Artifact } from '../../types';
import { API_ROOT, resolveMediaUrl } from '../../services/api';
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

  // Lấy danh sách hiện vật trưng bày: tuân thủ nghiêm ngặt danh sách Admin chỉ định (hoặc tối đa 2 hiện vật tiêu biểu ban đầu)
  const showcaseArtifacts = React.useMemo(() => {
    if (!artifacts || artifacts.length === 0) return [];

    // Nếu Admin chỉ định không trưng bày hiện vật nào
    if (branding.artifactsFeaturedId === 'none') return [];

    const featuredIds = branding.artifactsFeaturedId
      ? branding.artifactsFeaturedId.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    if (featuredIds.length > 0) {
      const selected: Artifact[] = [];
      for (const fid of featuredIds) {
        const found = artifacts.find(
          (a) =>
            a.id === fid ||
            (a as any)._id === fid ||
            (a as any).code === fid
        );
        if (found && !selected.some((s) => s.id === found.id)) {
          selected.push(found);
        }
      }
      if (selected.length > 0) return selected;
    }

    // Mặc định ban đầu nếu chưa từng cấu hình trong Trang chủ: Chỉ lấy tối đa 2 hiện vật tiêu biểu
    const sorted = [...artifacts].sort((a, b) => {
      if (a.model3dUrl && !b.model3dUrl) return -1;
      if (!a.model3dUrl && b.model3dUrl) return 1;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });

    return sorted.slice(0, 2);
  }, [artifacts, branding.artifactsFeaturedId]);

  const [failedThumbs, setFailedThumbs] = React.useState<Record<string, boolean>>({});

  const handleThumbError = (artId: string) => {
    setFailedThumbs((prev) => ({ ...prev, [artId]: true }));
  };

  const getArtifactThumb = (art?: Artifact) => {
    if (!art) return '';
    const raw = art.thumbnailUrl || (art.images && art.images[0]) || '';
    if (!raw) return '';
    return resolveMediaUrl(raw);
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

        {/* LƯỚI THẺ HIỆN VẬT RESPONSIVE HOẶC TRẠNG THÁI TRỐNG CĂN GIỮA */}
        {showcaseArtifacts.length > 0 ? (
          <div
            className={`client-artifacts-gallery-grid count-${showcaseArtifacts.length} ${
              showcaseArtifacts.length === 1 ? 'single-item' : ''
            } ${showcaseArtifacts.length === 2 ? 'two-items' : ''} ${
              showcaseArtifacts.length === 3 ? 'three-items' : ''
            }`}
          >
            {showcaseArtifacts.map((art, idx) => {
              const thumbUrl = getArtifactThumb(art);
              const artName = localize(art, 'name', art.name);
              const artPeriod = localize(art, 'period', (art as any).period || 'Cổ vật di sản');
              const artDesc = localize(
                art,
                'description',
                (art as any).description ||
                  'Hiện vật quý giá được lưu giữ tại Bảo tàng Lịch sử TP. Hồ Chí Minh, phục vụ trải nghiệm tham quan trực quan.'
              );

              return (
                <div
                  key={art.id}
                  className={`client-artifact-gallery-card reveal-on-scroll reveal-delay-${(idx % 4) + 1}`}
                  onClick={() => handleArtifactClick(art)}
                  role="button"
                  tabIndex={0}
                  title={`Chiêm ngưỡng: ${artName}`}
                >
                  <div className="client-artifact-gallery-media">
                    {thumbUrl && !failedThumbs[art.id] ? (
                      <img
                        src={thumbUrl}
                        alt={artName}
                        loading="lazy"
                        onError={() => handleThumbError(art.id)}
                      />
                    ) : (
                      <div className="client-media-placeholder-inner">
                        <Box size={32} strokeWidth={1.5} />
                      </div>
                    )}
                    {art.model3dUrl ? (
                      <div className="client-artifact-gallery-badge has-3d">
                        <span>3D Scan</span>
                      </div>
                    ) : (
                      <div className="client-artifact-gallery-badge">
                        <span>Di sản</span>
                      </div>
                    )}
                  </div>

                  <div className="client-artifact-gallery-body">
                    <div className="client-artifact-gallery-meta">
                      <span className="client-artifact-gallery-period">{artPeriod}</span>
                      {art.code && <span className="client-artifact-gallery-code">{art.code}</span>}
                    </div>

                    <h3 className="client-artifact-gallery-title">{artName}</h3>

                    <p className="client-artifact-gallery-desc">{artDesc}</p>

                    <div className="client-artifact-gallery-action">
                      <span>{t('artifacts.viewDetail', 'Chiêm ngưỡng chi tiết')}</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="client-artifacts-empty-state reveal-on-scroll">
            <div className="client-artifacts-empty-icon">
              <Box size={24} strokeWidth={1.75} />
            </div>
            <h4 className="client-artifacts-empty-title">
              {t('artifacts.noArtifactTitle', 'Đang cập nhật kho bảo vật số hóa')}
            </h4>
            <p className="client-artifacts-empty-desc">
              {t(
                'artifacts.noArtifactDesc',
                'Hệ thống đang đồng bộ và chuẩn bị các hiện vật di sản 3D tiêu biểu để trưng bày tại đây.'
              )}
            </p>
          </div>
        )}

        {/* NÚT XEM TẤT CẢ HIỆN VẬT */}
        {artifacts.length > 0 && (
          <div className="client-section-center-action reveal-on-scroll" style={{ marginTop: 32 }}>
            <button
              type="button"
              className="client-intro-btn"
              onClick={onViewAllArtifacts}
            >
              <span>
                {t(
                  branding.artifactsCtaText || 'artifacts.btnViewAll',
                  branding.artifactsCtaText || `Khám phá toàn bộ kho cổ vật (${artifacts.length})`
                )}
              </span>
              <ArrowRight size={14} style={{ marginLeft: 6, display: 'inline' }} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
