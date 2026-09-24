import React from 'react';
import { Artifact } from '../../types';
import { Box, Eye, ArrowRight, RotateCw, Volume2 } from 'lucide-react';
import { API_ROOT } from '../../services/api';
import { useClientTranslation } from '../../context/ClientTranslationContext';

interface ClientFeaturedArtifactsProps {
  artifacts: Artifact[];
  onOpen3DViewer: (artifact: Artifact) => void;
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

  // Ưu tiên các hiện vật đã có mô hình 3D, lấy tối đa 4 hiện vật kiệt tác lên trang chủ
  const artifactsWith3D = artifacts.filter((a) => !!a.model3dUrl);
  const displayList = (artifactsWith3D.length > 0 ? artifactsWith3D : artifacts).slice(0, 4);

  return (
    <section id="artifacts" className="client-section client-section-alt">
      <div className="client-container">
        {/* Tiêu đề Section */}
        <div className="client-section-header">
          <span className="client-section-badge">
            {t('artifacts.badge', 'Bảo Vật & Hiện Vật Số')}
          </span>
          <h2 className="client-section-title">
            {t('artifacts.headline', 'Kiệt Tác Cổ Vật Di Sản 3D')}
          </h2>
          <p className="client-section-subtitle">
            {t(
              'artifacts.sub',
              'Chiêm ngưỡng các cổ vật nghìn năm tuổi được tái tạo khối đa giác 3D với độ chi tiết cao, tương tác xoay đa chiều và lắng nghe giọng thuyết minh truyền cảm.'
            )}
          </p>
        </div>

        {/* Danh sách thẻ hiện vật */}
        {displayList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--c-text-muted)' }}>
            <Box size={40} style={{ color: 'var(--c-gold)', opacity: 0.7, marginBottom: 12 }} />
            <p>{t('artifacts.empty', 'Đang cập nhật các bảo vật di sản 3D...')}</p>
          </div>
        ) : (
          <div className="client-artifacts-grid">
            {displayList.map((artifact) => {
              const name = localize(artifact, 'name', artifact.name);
              const period = localize(artifact, 'period', artifact.period || artifact.category);
              const origin = localize(artifact, 'origin', artifact.origin);

              const rawThumb = artifact.thumbnailUrl || (artifact.images && artifact.images[0]);
              const thumbUrl = rawThumb
                ? rawThumb.startsWith('http')
                  ? rawThumb
                  : `${API_ROOT}${rawThumb.startsWith('/') ? '' : '/'}${rawThumb}`
                : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

              const has3D = !!artifact.model3dUrl;

              return (
                <div key={artifact.id} className="client-artifact-card">
                  <div className="client-artifact-thumb-wrap">
                    <img
                      src={thumbUrl}
                      alt={name}
                      className="client-artifact-thumb"
                      loading="lazy"
                    />
                    {has3D && (
                      <div className="client-artifact-badge-3d">
                        <Box size={12} />
                        <span>Mô hình 3D</span>
                      </div>
                    )}
                  </div>

                  <div className="client-artifact-body">
                    {period && <div className="client-artifact-period">{period}</div>}
                    <h3 className="client-artifact-name">{name}</h3>
                    {origin && <div className="client-artifact-origin">{origin}</div>}

                    <div className="client-artifact-actions">
                      {has3D && (
                        <button
                          type="button"
                          className="client-artifact-3d-btn"
                          onClick={() => onOpen3DViewer(artifact)}
                          title="Xoay đĩa tương tác 360°"
                        >
                          <RotateCw size={14} />
                          <span>{t('artifacts.btnSpin', 'Xoay 3D')}</span>
                        </button>
                      )}

                      {onSelectArtifactDetail && (
                        <button
                          type="button"
                          className="client-artifact-detail-btn"
                          onClick={() => onSelectArtifactDetail(artifact.id)}
                          title={t('artifacts.btnDetail', 'Xem chi tiết & Thuyết minh')}
                          aria-label="Xem chi tiết hiện vật"
                        >
                          <Eye size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Nút Xem toàn bộ bộ sưu tập */}
        {artifacts.length > 4 && (
          <div className="client-section-action">
            <button
              type="button"
              className="client-btn-primary"
              onClick={() => {
                if (onViewAllArtifacts) onViewAllArtifacts();
                else if (onSelectArtifactDetail && displayList[0]) onSelectArtifactDetail(displayList[0].id);
              }}
            >
              <span>{t('artifacts.viewAll', `Khám phá kho tàng ${artifacts.length} hiện vật`)}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
