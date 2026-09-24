import React, { useState } from 'react';
import { Artifact } from '../../types';
import { Box, Eye, RotateCw, Volume2, Sparkles, ExternalLink } from 'lucide-react';
import { API_ROOT } from '../../services/api';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { Turntable360Viewer } from '../Turntable360Viewer';

interface ClientFeaturedArtifactsProps {
  artifacts: Artifact[];
  onOpen3DViewer?: (artifact: Artifact) => void;
  onSelectArtifactDetail?: (artifactId: string) => void;
  onViewAllArtifacts?: () => void;
}

export const ClientFeaturedArtifacts: React.FC<ClientFeaturedArtifactsProps> = ({
  artifacts,
  onOpen3DViewer,
  onSelectArtifactDetail,
  onViewAllArtifacts
}) => {
  const { t, localize } = useClientTranslation();

  // Ưu tiên các hiện vật có mô hình 3D
  const artifactsWith3D = artifacts.filter((a) => !!a.model3dUrl);
  const eligibleArtifacts = artifactsWith3D.length > 0 ? artifactsWith3D : artifacts;

  // Quản lý hiện vật đang được đưa vào tâm điểm tủ kính (spotlight)
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>(
    eligibleArtifacts[0]?.id || ''
  );

  const activeArtifact =
    eligibleArtifacts.find((a) => a.id === selectedArtifactId) ||
    eligibleArtifacts[0];

  return (
    <section id="artifacts" className="client-section client-section-alt">
      <div className="client-container">
        {/* Tiêu đề Section */}
        <div className="client-section-header">
          <span className="client-section-tag">
            {t('artifacts.tag', 'Bảo Vật & Hiện Vật Số')}
          </span>
          <h2 className="client-section-title">
            {t('artifacts.headline', 'Kiệt Tác Cổ Vật Di Sản 3D')}
          </h2>
          <p className="client-section-subtitle">
            {t(
              'artifacts.sub',
              'Chiêm ngưỡng bảo vật nghìn năm tuổi được tái tạo khối đa giác 3D với độ chi tiết cao, tương tác xoay đa chiều và lắng nghe giọng thuyết minh truyền cảm.'
            )}
          </p>
        </div>

        {eligibleArtifacts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--c-text-muted)' }}>
            <Box size={40} style={{ color: 'var(--c-gold)', opacity: 0.7, marginBottom: 12 }} />
            <p>{t('artifacts.empty', 'Đang cập nhật các bảo vật di sản 3D...')}</p>
          </div>
        ) : (
          <div>
            {/* TỦ KÍNH GIÁM TUYỂN TRƯNG BÀY BẢO VẬT TRUNG TÂM (EXHIBITION CABINET) */}
            {activeArtifact && (
              <div className="client-masterpiece-cabinet">
                {/* Vùng tương tác 3D bên trái */}
                <div className="client-cabinet-stage">
                  <div className="client-cabinet-viewer-wrap">
                    {activeArtifact.model3dUrl ? (
                      <Turntable360Viewer
                        modelUrl={activeArtifact.model3dUrl}
                        artifactName={activeArtifact.name}
                        artifactPeriod={activeArtifact.period || activeArtifact.category}
                        audioNarrationUrl={activeArtifact.audioNarrationUrl}
                        translations={activeArtifact.translations}
                        height={420}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <img
                          src={
                            activeArtifact.thumbnailUrl?.startsWith('http')
                              ? activeArtifact.thumbnailUrl
                              : `${API_ROOT}${activeArtifact.thumbnailUrl?.startsWith('/') ? '' : '/'}${activeArtifact.thumbnailUrl}`
                          }
                          alt={activeArtifact.name}
                          style={{ maxHeight: 340, maxWidth: '90%', objectFit: 'contain' }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Thẻ giám tuyển cổ vật bên phải */}
                <div className="client-cabinet-placard">
                  <div className="client-cabinet-period">
                    {localize(activeArtifact, 'period', activeArtifact.period || 'Thời kỳ di sản')}
                  </div>

                  <h3 className="client-cabinet-title">
                    {localize(activeArtifact, 'name', activeArtifact.name)}
                  </h3>

                  <div className="client-cabinet-meta-grid">
                    <div>
                      <div className="client-cabinet-meta-item-label">
                        {t('artifacts.metaCategory', 'Loại hình')}
                      </div>
                      <div className="client-cabinet-meta-item-value">
                        {activeArtifact.category || 'Cổ vật bảo tàng'}
                      </div>
                    </div>

                    <div>
                      <div className="client-cabinet-meta-item-label">
                        {t('artifacts.metaOrigin', 'Xuất xứ / Niên đại')}
                      </div>
                      <div className="client-cabinet-meta-item-value">
                        {localize(activeArtifact, 'origin', activeArtifact.origin || activeArtifact.period || 'Việt Nam')}
                      </div>
                    </div>
                  </div>

                  <p className="client-cabinet-desc">
                    {localize(
                      activeArtifact,
                      'description',
                      activeArtifact.description ||
                        'Hiện vật tiêu biểu được lưu giữ và bảo quản nghiêm ngặt tại bảo tàng, đã được số hóa tái tạo mô hình 3D phục vụ nghiên cứu và trải nghiệm công chúng.'
                    )}
                  </p>

                  <div className="client-cabinet-actions">
                    {onSelectArtifactDetail && (
                      <button
                        type="button"
                        className="client-btn-primary"
                        onClick={() => onSelectArtifactDetail(activeArtifact.id)}
                      >
                        <Volume2 size={16} />
                        <span>{t('artifacts.btnDetail', 'Xem Thuyết Minh Đầy Đủ & Voice AI')}</span>
                      </button>
                    )}

                    {onOpen3DViewer && activeArtifact.model3dUrl && (
                      <button
                        type="button"
                        className="client-btn-secondary"
                        onClick={() => onOpen3DViewer(activeArtifact)}
                      >
                        <RotateCw size={16} />
                        <span>{t('artifacts.btnFullscreen', 'Mở Đĩa Xoay Lớn')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* KHAY CHỌN CỔ VẬT TIÊU BIỂU CHÂN TỦ KÍNH */}
            {eligibleArtifacts.length > 1 && (
              <div className="client-cabinet-shelf">
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--c-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    paddingRight: 6
                  }}
                >
                  Bộ sưu tập:
                </span>
                {eligibleArtifacts.map((art) => {
                  const rawThumb = art.thumbnailUrl || (art.images && art.images[0]);
                  const thumb = rawThumb
                    ? rawThumb.startsWith('http')
                      ? rawThumb
                      : `${API_ROOT}${rawThumb.startsWith('/') ? '' : '/'}${rawThumb}`
                    : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80';

                  const isSelected = art.id === (activeArtifact?.id || '');

                  return (
                    <div
                      key={art.id}
                      className={`client-shelf-item ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedArtifactId(art.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <img src={thumb} alt={art.name} className="client-shelf-thumb" />
                      <span className="client-shelf-name">{localize(art, 'name', art.name)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
