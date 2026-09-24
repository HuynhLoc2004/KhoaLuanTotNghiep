import React, { useState } from 'react';
import { Artifact } from '../../types';
import { Box, Eye, RotateCw, Volume2, Sparkles } from 'lucide-react';
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

  // Quản lý hiện vật đang được đưa lên bệ xoay 3D trung tâm
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
            {t('artifacts.headline', 'Bệ Trưng Bày Cổ Vật 3D Tương Tác')}
          </h2>
          <p className="client-section-subtitle">
            {t(
              'artifacts.sub',
              'Tương tác xoay đa chiều trực tiếp từng đường nét cổ vật nghìn năm tuổi được tái tạo khối 3D độ chi tiết cao và lắng nghe thuyết minh truyền cảm.'
            )}
          </p>
        </div>

        {eligibleArtifacts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--c-text-muted)' }}>
            <Box size={44} style={{ color: 'var(--c-gold)', opacity: 0.7, marginBottom: 14 }} />
            <p>{t('artifacts.empty', 'Đang cập nhật các bảo vật di sản 3D...')}</p>
          </div>
        ) : (
          <div className="client-pedestal-wrap">
            {/* KHỐI TRƯNG BÀY BỆ XOAY 3D & THẺ GIÁM TUYỂN */}
            {activeArtifact && (
              <div className="client-pedestal-grid">
                {/* BỆ XOAY 3D TRỰC TIẾP TRÊN TRANG CHỦ */}
                <div className="client-pedestal-viewer-stage">
                  {activeArtifact.model3dUrl ? (
                    <Turntable360Viewer
                      modelUrl={activeArtifact.model3dUrl}
                      artifactName={activeArtifact.name}
                      artifactPeriod={activeArtifact.period || activeArtifact.category}
                      audioNarrationUrl={activeArtifact.audioNarrationUrl}
                      translations={activeArtifact.translations}
                      height={480}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: 480,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#090B0E'
                      }}
                    >
                      <img
                        src={
                          activeArtifact.thumbnailUrl?.startsWith('http')
                            ? activeArtifact.thumbnailUrl
                            : `${API_ROOT}${activeArtifact.thumbnailUrl?.startsWith('/') ? '' : '/'}${activeArtifact.thumbnailUrl}`
                        }
                        alt={activeArtifact.name}
                        style={{ maxHeight: 360, maxWidth: '85%', objectFit: 'contain' }}
                      />
                    </div>
                  )}
                </div>

                {/* THẺ GIÁM TUYỂN BẢO VẬT BÊN PHẢI */}
                <div className="client-pedestal-placard">
                  <div className="client-pedestal-period">
                    {localize(activeArtifact, 'period', activeArtifact.period || 'Thời kỳ di sản')}
                  </div>

                  <h3 className="client-pedestal-title">
                    {localize(activeArtifact, 'name', activeArtifact.name)}
                  </h3>

                  <div className="client-pedestal-meta-table">
                    <div>
                      <div className="client-pedestal-meta-label">
                        {t('artifacts.metaCategory', 'Loại hình / Chất liệu')}
                      </div>
                      <div className="client-pedestal-meta-val">
                        {activeArtifact.category || 'Cổ vật bảo tàng'}
                      </div>
                    </div>

                    <div>
                      <div className="client-pedestal-meta-label">
                        {t('artifacts.metaOrigin', 'Niên đại / Xuất xứ')}
                      </div>
                      <div className="client-pedestal-meta-val">
                        {localize(activeArtifact, 'origin', activeArtifact.origin || activeArtifact.period || 'Việt Nam')}
                      </div>
                    </div>
                  </div>

                  <p className="client-pedestal-desc">
                    {localize(
                      activeArtifact,
                      'description',
                      activeArtifact.description ||
                        'Hiện vật tiêu biểu được lưu giữ và bảo quản nghiêm ngặt tại bảo tàng, đã được số hóa tái tạo mô hình 3D phục vụ nghiên cứu và trải nghiệm công chúng.'
                    )}
                  </p>

                  <div className="client-pedestal-actions">
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
                        <span>{t('artifacts.btnFullscreen', 'Phóng To Đĩa Xoay')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* KHAY CHỌN CỔ VẬT CHÂN BỆ XOAY */}
            {eligibleArtifacts.length > 1 && (
              <div className="client-pedestal-shelf">
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--c-gold)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    paddingRight: 6
                  }}
                >
                  Chọn cổ vật:
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
                      className={`client-pedestal-shelf-item ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedArtifactId(art.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <img src={thumb} alt={art.name} className="client-pedestal-shelf-thumb" />
                      <span className="client-pedestal-shelf-name">{localize(art, 'name', art.name)}</span>
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
