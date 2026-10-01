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

  // Ưu tiên hiện vật có mô hình 3D và mới tạo nhất lên đầu trang chủ
  const sortedArtifacts = React.useMemo(() => {
    return [...artifacts].sort((a, b) => {
      // 1. Ưu tiên hiện vật có 3D model
      const has3DA = a.model3dUrl ? 1 : 0;
      const has3DB = b.model3dUrl ? 1 : 0;
      if (has3DA !== has3DB) return has3DB - has3DA;

      // 2. Ưu tiên thời gian tạo mới nhất
      const timeA = new Date((a as any).createdAt || (a as any).updatedAt || (a as any).created_at || 0).getTime();
      const timeB = new Date((b as any).createdAt || (b as any).updatedAt || (b as any).created_at || 0).getTime();
      if (timeA !== timeB) return timeB - timeA;

      return String(b.id || '').localeCompare(String(a.id || ''));
    });
  }, [artifacts]);

  const activeArtifact = sortedArtifacts[0];

  const getFullThumb = (art?: Artifact) => {
    if (!art) return '';
    const raw = art.thumbnailUrl || (art.images && art.images[0]);
    if (!raw) return '';
    return raw.startsWith('http')
      ? raw
      : `${API_ROOT}${raw.startsWith('/') ? '' : '/'}${raw}`;
  };

  const currentThumb = getFullThumb(activeArtifact);
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
    <section id="artifacts" className="client-zigzag-section client-section-alt">
      <div className="client-container">
        {/* ZIG-ZAG 3: NẰM BÊN PHẢI, TRỒI TỪ DƯỚI LÊN KHI SCROLL */}
        <div className="client-zigzag-card horizontal-split align-right reveal-on-scroll">
          {/* CỘT MEDIA: MÔ HÌNH 3D / ẢNH HIỆN VẬT LỊCH SỬ CHUẨN MỰC */}
          <div
            className="client-zigzag-card-media dark-vitrine clickable"
            onClick={handleArtifactClick}
            role="button"
            tabIndex={0}
            title={t('artifacts.clickToEnter', 'Bấm để xem chi tiết hiện vật')}
            style={{ cursor: 'pointer' }}
          >
            {activeArtifact?.model3dUrl ? (
              <div style={{ width: '100%', height: '100%', minHeight: 380, cursor: 'pointer' }}>
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
                  height={380}
                  hideControls={true}
                  onClick={handleArtifactClick}
                />
              </div>
            ) : currentThumb ? (
              <div className="client-zigzag-vitrine-static">
                <img
                  src={currentThumb}
                  alt={currentTitle}
                  className="client-zigzag-vitrine-img"
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

          {/* CỘT NỘI DUNG: TINH TẾ, ĐẲNG CẤP, KHÔNG TÈM LEM MÀU SẮC */}
          <div className="client-zigzag-card-body">
            <span className="client-zigzag-tag">
              {branding.artifactsTag || t('artifacts.tag', 'Bảo Vật Di Sản & Mô Hình 3D')}
            </span>

            <h2 className="client-zigzag-title">
              {branding.artifactsTitle || t('artifacts.headline', 'Kho Tàng Cổ Vật & Bảo Vật Di Sản')}
            </h2>

            <p className="client-zigzag-desc">
              {branding.artifactsDesc ||
                t(
                  'artifacts.sub',
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
                {branding.artifactsCtaText || t('artifacts.btnViewAll', 'Khám phá toàn bộ kho hiện vật')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

