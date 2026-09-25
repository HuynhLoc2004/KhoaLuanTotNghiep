import React, { useState } from 'react';
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

  const [selectedArtifactId, setSelectedArtifactId] = useState<string>(
    artifacts[0]?.id || ''
  );

  const activeArtifact =
    artifacts.find((a) => a.id === selectedArtifactId) || artifacts[0];

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

  return (
    <section id="artifacts" className="client-zigzag-section client-section-alt">
      <div className="client-container">
        {/* ZIG-ZAG 3: NẰM BÊN PHẢI, TRỒI TỪ DƯỚI LÊN KHI SCROLL */}
        <div className="client-zigzag-card horizontal-split align-right reveal-on-scroll">
          {/* CỘT MEDIA: MÔ HÌNH 3D / ẢNH HIỆN VẬT LỊCH SỬ CHUẨN MỰC */}
          <div
            className="client-zigzag-card-media dark-vitrine clickable"
            onClick={onViewAllArtifacts}
            role="button"
            tabIndex={0}
            title={t('artifacts.clickToEnter', 'Bấm để xem toàn bộ kho hiện vật')}
          >
            {activeArtifact?.model3dUrl ? (
              <div style={{ width: '100%', height: 340 }}>
                <Turntable360Viewer
                  modelUrl={
                    activeArtifact.model3dUrl.startsWith('http')
                      ? activeArtifact.model3dUrl
                      : `${API_ROOT}${activeArtifact.model3dUrl.startsWith('/') ? '' : '/'}${activeArtifact.model3dUrl}`
                  }
                  artifactName={currentTitle}
                  height={340}
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

            {/* Dải thumbnail chọn nhanh hiện vật */}
            {artifacts.length > 1 && (
              <div className="client-zigzag-shelf" onClick={(e) => e.stopPropagation()}>
                {artifacts.slice(0, 4).map((art) => {
                  const isSelected = art.id === (activeArtifact?.id || '');
                  const thumb = getFullThumb(art);
                  return (
                    <button
                      key={art.id}
                      type="button"
                      className={`client-zigzag-shelf-item ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedArtifactId(art.id)}
                      title={localize(art, 'name', art.name)}
                    >
                      <img src={thumb} alt={localize(art, 'name', art.name)} />
                    </button>
                  );
                })}
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

