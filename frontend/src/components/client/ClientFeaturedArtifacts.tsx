import React, { useState } from 'react';
import { Artifact } from '../../types';
import { RotateCw, Volume2 } from 'lucide-react';
import { API_ROOT } from '../../services/api';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { Turntable360Viewer } from '../Turntable360Viewer';

interface ClientFeaturedArtifactsProps {
  artifacts: Artifact[];
  onOpen3DViewer?: (artifact: Artifact) => void;
  onSelectArtifactDetail?: (artifactId: string) => void;
  onViewAllArtifacts?: () => void;
}

const CURATED_NATIONAL_TREASURES: Artifact[] = [
  {
    id: 'curated-01',
    name: 'Tượng Phật Sa Thạch Đồng Dương',
    code: 'BVQG-01',
    category: 'Sa thạch • Champa',
    period: 'Thế kỷ IX',
    origin: 'Quảng Nam',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=85',
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=85'],
    description: 'Pho tượng sa thạch đỉnh cao nghệ thuật điêu khắc Phật giáo Champa thế kỷ thứ IX, đường nét nghiêm cẩn và tĩnh tại.',
    status: 'active',
    processingStatus: 'completed',
    orderIndex: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'curated-02',
    name: 'Trống Đồng Đông Sơn',
    code: 'BVQG-02',
    category: 'Đồng thau • Đông Sơn',
    period: 'Thế kỷ IV - II TCN',
    origin: 'Sông Hồng',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=85',
    images: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=85'],
    description: 'Trống đồng đúc với hoa văn ngôi sao nhiều cánh, hình tượng chim lạc bay ngược chiều kim đồng hồ thời đại Hùng Vương.',
    status: 'active',
    processingStatus: 'completed',
    orderIndex: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'curated-03',
    name: 'Tượng Bồ Tát Avalokiteshvara',
    code: 'BVQG-03',
    category: 'Kim loại quý & Sa thạch',
    period: 'Thế kỷ VIII - IX',
    origin: 'Miền Trung',
    thumbnailUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=85',
    images: ['https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=85'],
    description: 'Kiệt tác điêu khắc Bồ Tát tọa thiền uy nghi, vương miện chạm hình Phật A Di Đà tinh xảo.',
    status: 'active',
    processingStatus: 'completed',
    orderIndex: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'curated-04',
    name: 'Bình Gốm Hoa Lam Vẽ Thiên Nga',
    code: 'BVQG-04',
    category: 'Gốm men Chu Đậu',
    period: 'Thế kỷ XV • Triều Lê',
    origin: 'Hải Dương',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85',
    images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85'],
    description: 'Bình gốm hoa lam men ngà vẽ coban tả cảnh chim thiên nga bay lượn trên đầm sen thời Lê sơ.',
    status: 'active',
    processingStatus: 'completed',
    orderIndex: 3,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

export const ClientFeaturedArtifacts: React.FC<ClientFeaturedArtifactsProps> = ({
  artifacts,
  onOpen3DViewer,
  onSelectArtifactDetail,
  onViewAllArtifacts
}) => {
  const { t, localize } = useClientTranslation();

  const eligibleArtifacts: Artifact[] = React.useMemo(() => {
    const list = [...(artifacts || [])];
    CURATED_NATIONAL_TREASURES.forEach((c) => {
      if (!list.some((a) => a.id === c.id || a.code === c.code)) {
        list.push(c);
      }
    });
    return list;
  }, [artifacts]);

  const [selectedArtifactId, setSelectedArtifactId] = useState<string>(
    eligibleArtifacts[0]?.id || ''
  );

  const activeArtifact =
    eligibleArtifacts.find((a) => a.id === selectedArtifactId) || eligibleArtifacts[0];

  const getFullThumb = (art: Artifact) => {
    const raw = art.thumbnailUrl || (art.images && art.images[0]);
    if (!raw) {
      return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=85';
    }
    return raw.startsWith('http')
      ? raw
      : `${API_ROOT}${raw.startsWith('/') ? '' : '/'}${raw}`;
  };

  if (!activeArtifact) return null;

  const currentThumb = getFullThumb(activeArtifact);
  const currentTitle = localize(activeArtifact, 'name', activeArtifact.name);
  const currentDesc = localize(activeArtifact, 'description', activeArtifact.description || '');
  const currentCategory = activeArtifact.category || 'Cổ vật bảo tàng';
  const currentPeriod = localize(activeArtifact, 'period', activeArtifact.period || '');
  const currentOrigin = localize(activeArtifact, 'origin', activeArtifact.origin || 'Việt Nam');

  return (
    <section id="artifacts" className="client-zigzag-section client-section-alt">
      <div className="client-container">
        {/* ZIG-ZAG THẰNG 3: NẰM BÊN CÙNG BÊN PHẢI, TRỒI TỪ DƯỚI LÊN KHI SCROLL */}
        <div className="client-zigzag-card horizontal-split align-right reveal-on-scroll">
          {/* Bục xoay 3D / ảnh hiện vật */}
          <div className="client-zigzag-card-media dark-vitrine">
            {activeArtifact.model3dUrl ? (
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
            ) : (
              <div className="client-zigzag-vitrine-static">
                <img
                  src={currentThumb}
                  alt={currentTitle}
                  className="client-zigzag-vitrine-img"
                />
                <div className="client-zigzag-badge-float">
                  <span>Mô hình 3D tương tác</span>
                </div>
              </div>
            )}

            {/* Thanh thumbnail chọn nhanh cổ vật */}
            <div className="client-zigzag-shelf">
              {eligibleArtifacts.slice(0, 4).map((art) => {
                const isSelected = art.id === activeArtifact.id;
                const thumb = getFullThumb(art);
                return (
                  <button
                    key={art.id}
                    type="button"
                    className={`client-zigzag-shelf-item ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedArtifactId(art.id)}
                    title={localize(art, 'name', art.name)}
                  >
                    <img src={thumb} alt="" className="client-zigzag-shelf-img" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="client-zigzag-card-body">
            <span className="client-zigzag-tag">
              {t('artifacts.tag', 'Bảo Vật Quốc Gia & Cổ Vật 3D')}
            </span>

            <h2 className="client-zigzag-title">{currentTitle}</h2>

            {/* Thông số giám định */}
            <div className="client-zigzag-meta-grid">
              <div className="client-zigzag-meta-item">
                <span className="client-zigzag-meta-lbl">Chất liệu</span>
                <span className="client-zigzag-meta-val">{currentCategory}</span>
              </div>
              <div className="client-zigzag-meta-item">
                <span className="client-zigzag-meta-lbl">Niên đại</span>
                <span className="client-zigzag-meta-val">{currentPeriod || 'Cổ đại'}</span>
              </div>
              <div className="client-zigzag-meta-item">
                <span className="client-zigzag-meta-lbl">Xuất xứ</span>
                <span className="client-zigzag-meta-val">{currentOrigin}</span>
              </div>
            </div>

            <p className="client-zigzag-desc">{currentDesc}</p>

            {/* Nút hành động */}
            <div className="client-zigzag-actions">
              {onSelectArtifactDetail && (
                <button
                  type="button"
                  className="client-zigzag-btn-primary"
                  onClick={() => onSelectArtifactDetail(activeArtifact.id)}
                >
                  <Volume2 size={16} />
                  <span>Nghe Thuyết Minh Voice AI</span>
                </button>
              )}

              {onOpen3DViewer && activeArtifact.model3dUrl && (
                <button
                  type="button"
                  className="client-zigzag-btn-secondary"
                  onClick={() => onOpen3DViewer(activeArtifact)}
                >
                  <RotateCw size={15} />
                  <span>Phóng to 3D</span>
                </button>
              )}

              {onViewAllArtifacts && (
                <button
                  type="button"
                  className="client-zigzag-btn-link"
                  onClick={onViewAllArtifacts}
                >
                  Toàn bộ cổ vật →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
