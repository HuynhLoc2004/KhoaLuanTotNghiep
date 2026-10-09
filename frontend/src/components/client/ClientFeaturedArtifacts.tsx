import React from 'react';
import { Box } from 'lucide-react';
import { Artifact } from '../../types';
import { API_ROOT } from '../../services/api';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { Turntable360Viewer } from '../Turntable360Viewer';

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

  const sortedArtifacts = React.useMemo(() => {
    return [...artifacts].sort((a, b) => {
      const has3DA = a.model3dUrl ? 1 : 0;
      const has3DB = b.model3dUrl ? 1 : 0;
      if (has3DA !== has3DB) return has3DB - has3DA;

      const timeA = new Date((a as any).createdAt || (a as any).updatedAt || (a as any).created_at || 0).getTime();
      const timeB = new Date((b as any).createdAt || (b as any).updatedAt || (b as any).created_at || 0).getTime();
      if (timeA !== timeB) return timeB - timeA;

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
    <section id="artifacts" className="client-zigzag-section">
      <div className="client-container">
        {/* ZIG-ZAG 3: MEDIA HIỆN VẬT BÊN TRÁI - NỘI DUNG BÊN PHẢI */}
        <div className="client-zigzag-card horizontal-split align-right reveal-on-scroll">
          {/* CỘT MEDIA: MÔ HÌNH 3D / ẢNH HIỆN VẬT LỊCH SỬ CHUẨN MỰC */}
          <div
            className={`client-zigzag-card-media dark-vitrine clickable ${!currentThumb && !activeArtifact?.model3dUrl ? 'has-placeholder' : ''}`}
            onClick={handleArtifactClick}
            role="button"
            tabIndex={0}
            title={t('artifacts.clickToEnter', 'Bấm để xem chi tiết hiện vật')}
            style={{ cursor: 'pointer', minHeight: '460px', height: '100%' }}
          >
            {activeArtifact?.model3dUrl ? (
              <div style={{ width: '100%', height: '100%', minHeight: 460, cursor: 'pointer' }}>
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
                  height={460}
                  hideControls={true}
                  onClick={handleArtifactClick}
                />
              </div>
            ) : currentThumb ? (
              <div className="client-zigzag-vitrine-static" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={currentThumb}
                  alt={currentTitle}
                  className="client-zigzag-vitrine-img"
                  style={{ maxHeight: '85%', maxWidth: '85%', objectFit: 'contain' }}
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

          {/* CỘT NỘI DUNG: SANG TRỌNG, ĐẲNG CẤP, KHÔNG SIDEBAR VỤN VẶT */}
          <div className="client-zigzag-card-body">
            <span className="client-zigzag-tag">
              {t(branding.artifactsTag || 'artifacts.tag', branding.artifactsTag || 'Bảo Vật Di Sản & Mô Hình 3D')}
            </span>

            <h2 className="client-zigzag-title">
              {t(branding.artifactsTitle || 'artifacts.headline', branding.artifactsTitle || 'Kho Tàng Cổ Vật & Bảo Vật Di Sản')}
            </h2>

            <p className="client-zigzag-desc">
              {t(
                branding.artifactsDesc || 'artifacts.sub',
                branding.artifactsDesc ||
                  'Chiêm ngưỡng các bảo vật quốc gia và hiện vật lịch sử quý giá được phục dựng 3D sắc nét, hỗ trợ xoay đĩa 360° tương tác và hệ thống thuyết minh âm thanh đa ngôn ngữ.'
              )}
            </p>

            {/* DÒNG THÔNG SỐ ĐỒNG BỘ THẬT */}
            <div className="client-zigzag-meta-line">
              <span className="client-zigzag-meta-item">
                <strong>{artifacts.length}</strong> {t('artifacts.totalArtifacts', 'Hiện vật lưu trữ')}
              </span>
              {artifact3DCount > 0 && (
                <>
                  <span className="client-zigzag-meta-sep">•</span>
                  <span className="client-zigzag-meta-item">
                    <strong>{artifact3DCount}</strong> {t('artifacts.total3D', 'Mô hình 3D xoay')}
                  </span>
                </>
              )}
              <span className="client-zigzag-meta-sep">•</span>
              <span className="client-zigzag-meta-item">
                {t('artifacts.audioGuide', 'Thuyết minh song ngữ')}
              </span>
            </div>

            {/* NÚT HÀNH ĐỘNG SANG TRỌNG */}
            <div className="client-zigzag-actions">
              <button
                type="button"
                className="client-zigzag-btn-primary"
                onClick={onViewAllArtifacts}
              >
                {t(branding.artifactsCtaText || 'artifacts.btnViewAll', branding.artifactsCtaText || 'Khám phá toàn bộ kho hiện vật')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
