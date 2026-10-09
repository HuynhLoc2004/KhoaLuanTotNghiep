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
      const has3DA = a.model3dUrl ? 1 : 0;
      const has3DB = b.model3dUrl ? 1 : 0;
      if (has3DA !== has3DB) return has3DB - has3DA;

      const timeA = new Date((a as any).createdAt || (a as any).updatedAt || (a as any).created_at || 0).getTime();
      const timeB = new Date((b as any).createdAt || (b as any).updatedAt || (b as any).created_at || 0).getTime();
      if (timeA !== timeB) return timeB - timeA;

      return String(b.id || '').localeCompare(String(a.id || ''));
    });
  }, [artifacts]);

  // Cổ vật mặc định
  const defaultArtifact = React.useMemo(() => {
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

  const [selectedArtifactId, setSelectedArtifactId] = React.useState<string>(defaultArtifact?.id || '');

  const activeArtifact = artifacts.find((a) => a.id === selectedArtifactId) || defaultArtifact || sortedArtifacts[0];

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
  const currentThumb = (activeArtifact === defaultArtifact && customShowcase)
    ? (customShowcase.startsWith('http') ? customShowcase : `${API_ROOT}${customShowcase.startsWith('/') ? '' : '/'}${customShowcase}`)
    : rawThumb;
  const currentTitle = activeArtifact
    ? localize(activeArtifact, 'name', activeArtifact.name)
    : t('artifacts.defaultTitle', 'Cổ vật di sản tiêu biểu');
  const currentPeriod = activeArtifact ? localize(activeArtifact, 'period', (activeArtifact as any).period || '') : '';
  const artifact3DCount = artifacts.filter((a) => !!a.model3dUrl).length;

  // Lấy 4 hiện vật tiêu biểu cho danh sách tuyển tập bên phải
  const showcaseList = sortedArtifacts.slice(0, 4);

  const handleArtifactClick = (art?: Artifact) => {
    const target = art || activeArtifact;
    if (target?.id && onSelectArtifactDetail) {
      onSelectArtifactDetail(target.id);
    } else {
      onViewAllArtifacts();
    }
  };

  return (
    <section id="artifacts" className="client-section client-section-alt">
      <div className="client-container">
        {/* TIÊU ĐỀ PHÂN KHU TRUNG TÂM */}
        <div className="client-section-header-centered reveal-on-scroll">
          <span className="client-section-eyebrow">
            {t(branding.artifactsTag || 'artifacts.tag', branding.artifactsTag || 'Bảo Vật Di Sản & Mô Hình 3D')}
          </span>
          <h2 className="client-section-main-title">
            {t(branding.artifactsTitle || 'artifacts.headline', branding.artifactsTitle || 'Kho Tàng Cổ Vật & Bảo Vật Di Sản')}
          </h2>
          <p className="client-section-lead">
            {t(
              branding.artifactsDesc || 'artifacts.sub',
              branding.artifactsDesc ||
                'Chiêm ngưỡng các bảo vật quốc gia và hiện vật lịch sử quý giá được phục dựng 3D sắc nét, hỗ trợ tương tác xoay đa góc độ và tra cứu tư liệu lịch sử.'
            )}
          </p>
        </div>

        {/* BỐ CỤC TỦ TRƯNG BÀY (VITRINE SPOTLIGHT + CURATED LIST) */}
        <div className="client-vitrine-showcase-grid reveal-on-scroll">
          {/* CỘT TRÁI (60%): SÂN KHẤU TIÊU ĐIỂM 3D */}
          <div className="client-vitrine-spotlight-card">
            <div className="client-vitrine-3d-stage">
              {activeArtifact?.model3dUrl ? (
                <div style={{ width: '100%', height: '100%' }}>
                  <Turntable360Viewer
                    key={activeArtifact.id}
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
                    onClick={() => handleArtifactClick(activeArtifact)}
                  />
                </div>
              ) : currentThumb ? (
                <div
                  className="client-vitrine-static-media"
                  onClick={() => handleArtifactClick(activeArtifact)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={currentThumb}
                    alt={currentTitle}
                    loading="lazy"
                  />
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

              {/* Huy hiệu nhận diện */}
              <div className="client-vitrine-stage-badge">
                <Box size={13} style={{ color: '#D4A86A' }} />
                <span>
                  {activeArtifact?.model3dUrl
                    ? t('artifacts.3dRotatableBadge', 'Mô hình 3D • Kéo để xoay')
                    : t('artifacts.vitrineBadge', 'Bảo vật số hóa')}
                </span>
              </div>
            </div>

            {/* Thông tin chân thẻ tiêu điểm */}
            <div className="client-vitrine-spotlight-info">
              <div style={{ minWidth: 0, flex: 1, paddingRight: 10 }}>
                <h3 className="client-vitrine-spotlight-title">
                  {currentTitle}
                </h3>
                {currentPeriod && (
                  <span className="client-vitrine-spotlight-period">
                    {currentPeriod}
                  </span>
                )}
              </div>

              <button
                type="button"
                className="client-vitrine-detail-btn"
                onClick={() => handleArtifactClick(activeArtifact)}
              >
                <span>{t('artifacts.viewDetailsBtn', 'Xem chi tiết hiện vật')}</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          {/* CỘT PHẢI (40%): DANH SÁCH TUYỂN TẬP CỔ VẬT TIÊU BIỂU */}
          <div className="client-vitrine-sidebar-card">
            <div className="client-vitrine-sidebar-header">
              <span className="client-vitrine-sidebar-title">
                {t('artifacts.curatedCollection', 'Tuyển tập bảo vật')}
              </span>
              <button
                type="button"
                className="client-vitrine-sidebar-all-link"
                onClick={onViewAllArtifacts}
              >
                <span>{t('artifacts.viewAllCount', `Tất cả (${artifacts.length})`)}</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>

            <div className="client-vitrine-sidebar-list">
              {showcaseList.map((art) => {
                const isSelected = art.id === activeArtifact?.id;
                const thumb = getFullThumb(art);
                const title = localize(art, 'name', art.name);
                const period = localize(art, 'period', (art as any).period || '');
                const has3D = Boolean(art.model3dUrl);

                return (
                  <div
                    key={art.id}
                    className={`client-vitrine-item-row ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedArtifactId(art.id)}
                    role="button"
                    tabIndex={0}
                    title={`Chọn xem: ${title}`}
                  >
                    <div className="client-vitrine-item-thumb">
                      {thumb ? (
                        <img src={thumb} alt={title} loading="lazy" />
                      ) : (
                        <Box size={20} />
                      )}
                      {has3D && <span className="client-vitrine-item-3d-badge">3D</span>}
                    </div>

                    <div className="client-vitrine-item-details">
                      <div className="client-vitrine-item-name">{title}</div>
                      <div className="client-vitrine-item-period">
                        {period || (art as any).category || 'Hiện vật di sản'}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="client-vitrine-item-quick-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArtifactClick(art);
                      }}
                      title="Xem toàn trang chi tiết"
                    >
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Dòng tóm tắt thông số di sản ở chân thẻ */}
            <div className="client-vitrine-stat-footer">
              <div className="client-vitrine-stat-col">
                <strong>{artifacts.length}</strong>
                <span>{t('artifacts.statTotal', 'Hiện vật lưu trữ')}</span>
              </div>
              <div className="client-vitrine-stat-sep" />
              <div className="client-vitrine-stat-col">
                <strong>{artifact3DCount}</strong>
                <span>{t('artifacts.stat3D', 'Mô hình 3D')}</span>
              </div>
              <div className="client-vitrine-stat-sep" />
              <div className="client-vitrine-stat-col">
                <strong>100%</strong>
                <span>{t('artifacts.statAudio', 'Thuyết minh')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

