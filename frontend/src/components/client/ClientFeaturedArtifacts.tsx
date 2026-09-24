import React, { useState, useMemo } from 'react';
import {
  Box,
  RotateCw,
  Sparkles,
  Volume2,
  Tag,
  ArrowRight
} from 'lucide-react';
import { Artifact } from '../../types';
import { API_ROOT } from '../../services/api';
import { useClientTranslation } from '../../context/ClientTranslationContext';

interface ClientFeaturedArtifactsProps {
  artifacts: Artifact[];
  onSelectArtifact: (artifact: Artifact) => void;
}

export const ClientFeaturedArtifacts: React.FC<ClientFeaturedArtifactsProps> = ({
  artifacts,
  onSelectArtifact
}) => {
  const { t, localize, currentLang } = useClientTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Lọc danh mục cổ vật
  const categories = useMemo(() => {
    const set = new Set<string>();
    artifacts.forEach((a) => {
      if (a.category && a.category.trim()) set.add(a.category.trim());
    });
    return ['all', ...Array.from(set)];
  }, [artifacts]);

  const filteredArtifacts = useMemo(() => {
    if (selectedCategory === 'all') return artifacts;
    return artifacts.filter((a) => a.category?.trim() === selectedCategory);
  }, [artifacts, selectedCategory]);

  return (
    <section id="artifacts" className="client-section" style={{ background: 'var(--bg-subtle)' }}>
      <div className="client-container">
        <div className="client-section-header">
          <span className="client-section-badge">
            <Box size={13} />
            <span>{t('artifacts.badge', 'Bảo vật & Hiện vật số')}</span>
          </span>
          <h2 className="client-section-title">
            {t('artifacts.title', 'Bộ sưu tập cổ vật di sản 3D')}
          </h2>
          <p className="client-section-desc">
            {t(
              'artifacts.desc',
              'Chiêm ngưỡng các cổ vật nghìn năm tuổi được tái tạo khối đa giác 3D với độ chi tiết cao. Bạn có thể tương tác xoay 360°, phóng to từng đường nét hoa văn và lắng nghe giọng đọc thuyết minh.'
            )}
          </p>
        </div>

        {/* Bộ lọc danh mục */}
        {categories.length > 2 && (
          <div className="client-artifacts-filter">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`client-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'all' ? t('artifacts.filterAll', 'Tất cả cổ vật') : cat}
              </button>
            ))}
          </div>
        )}

        {filteredArtifacts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Box size={36} style={{ color: 'var(--accent-gold)', opacity: 0.6, marginBottom: 12 }} />
            <p>{t('artifacts.empty', 'Chưa có cổ vật nào thuộc danh mục này.')}</p>
          </div>
        ) : (
          <div className="client-artifacts-grid">
            {filteredArtifacts.slice(0, 8).map((artifact) => {
              const has3D = !!artifact.model3dUrl;
              const imgUrl = artifact.thumbnailUrl || (artifact.images && artifact.images[0]) || '';
              const fullImgUrl = imgUrl
                ? imgUrl.startsWith('http')
                  ? imgUrl
                  : `${API_ROOT}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`
                : 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=600&q=80';

              const name = localize(artifact, 'name', artifact.name);
              const period = localize(artifact, 'period', artifact.period || artifact.category || 'Cổ vật di sản');
              const hasAudio = !!artifact.audioNarrationUrl || (artifact.translations && Object.values(artifact.translations).some((tr: any) => !!tr?.audioNarrationUrl));

              return (
                <div
                  key={artifact.id}
                  className="client-artifact-card"
                  onClick={() => onSelectArtifact(artifact)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSelectArtifact(artifact);
                  }}
                >
                  <div className="client-artifact-thumb-wrap">
                    <img src={fullImgUrl} alt={name} className="client-artifact-thumb" loading="lazy" />
                    {has3D && (
                      <div className="client-artifact-badge-3d">
                        <Box size={12} />
                        <span>Mô hình 3D</span>
                      </div>
                    )}
                  </div>

                  <div className="client-artifact-body">
                    <div className="client-artifact-period">{period}</div>
                    <h3 className="client-artifact-name">{name}</h3>

                    <div className="client-artifact-footer">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {hasAudio ? (
                          <>
                            <Volume2 size={12} style={{ color: 'var(--accent-gold)' }} />
                            <span>Có thuyết minh</span>
                          </>
                        ) : (
                          <span>Mã: {artifact.code}</span>
                        )}
                      </span>

                      <button
                        type="button"
                        className="client-artifact-btn-view"
                        aria-label={`Xem 3D cổ vật ${name}`}
                      >
                        <RotateCw size={12} />
                        <span>{has3D ? t('artifacts.btnView3D', 'Xoay 3D 360°') : t('artifacts.btnView', 'Xem chi tiết')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
