import React, { useState } from 'react';
import { Artifact } from '../../types';
import { Box, Eye, RotateCw, Volume2, Sparkles, Shield, Award, Layers } from 'lucide-react';
import { API_ROOT } from '../../services/api';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { Turntable360Viewer } from '../Turntable360Viewer';

interface ClientFeaturedArtifactsProps {
  artifacts: Artifact[];
  onOpen3DViewer?: (artifact: Artifact) => void;
  onSelectArtifactDetail?: (artifactId: string) => void;
  onViewAllArtifacts?: () => void;
}

// Bộ sưu tập cổ vật mẫu chuẩn Bảo vật Quốc gia của Bảo tàng Lịch sử TP.HCM (đảm bảo không bao giờ bị rỗng hay lãng xẹt)
const CURATED_NATIONAL_TREASURES: Artifact[] = [
  {
    id: 'curated-01',
    name: 'Tượng Phật Sa Thạch Đồng Dương',
    code: 'BVQG-01',
    category: 'Bảo vật Quốc gia • Sa thạch',
    period: 'Thế kỷ IX • Văn hóa Champa',
    origin: 'Phật viện Đồng Dương, Thăng Bình, Quảng Nam',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=85',
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=85'],
    description: 'Pho tượng sa thạch đỉnh cao của nghệ thuật điêu khắc Phật giáo Champa thế kỷ thứ IX. Đường nét chạm khắc nghiêm cẩn, toát lên vẻ từ bi, tĩnh tại đặc trưng của phong cách mỹ thuật Đồng Dương cổ đại.',
    status: 'active',
    processingStatus: 'completed',
    orderIndex: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'curated-02',
    name: 'Trống Đồng Đông Sơn (Loại I Heger)',
    code: 'BVQG-02',
    category: 'Bảo vật Quốc gia • Đồng thau',
    period: 'Thế kỷ IV - II TCN • Văn minh Đông Sơn',
    origin: 'Lưu vực Sông Hồng, Miền Bắc Việt Nam',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=85',
    images: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=85'],
    description: 'Trống đồng đúc với kỹ thuật điêu luyện, hoa văn ngôi sao nhiều cánh ở tâm, hình tượng chim lạc bay ngược chiều kim đồng hồ cùng cảnh sinh hoạt hội hè của cư dân thời đại Hùng Vương dựng nước.',
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
    category: 'Điêu khắc Cổ • Kim loại quý & Sa thạch',
    period: 'Thế kỷ VIII - IX • Văn hóa Champa',
    origin: 'Miền Trung Việt Nam',
    thumbnailUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=85',
    images: ['https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=85'],
    description: 'Kiệt tác điêu khắc Bồ Tát Quán Thế Âm trong tư thế tọa thiền uy nghi, vương miện Jatamukuta chạm hình Phật A Di Đà tinh xảo, thể hiện kỹ thuật đúc đồng đỉnh cao của người xưa.',
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
    category: 'Gốm men cao cấp • Nghệ thuật Cung đình',
    period: 'Thế kỷ XV • Triều Lê Sơ',
    origin: 'Lò gốm Chu Đậu (Hải Dương)',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85',
    images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85'],
    description: 'Bình gốm hoa lam thời Lê sơ với nước men trắng ngà vẽ lam coban tả cảnh đàn thiên nga đang bay lượn và bơi lội thanh thoát giữa đầm sen, phản ánh mỹ thuật cung đình rực rỡ.',
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

  // Hòa trộn danh sách hiện vật thật từ Admin MongoDB; nếu chưa có hiện vật thì hiển thị bộ sưu tập bảo vật quốc gia chuẩn
  const eligibleArtifacts: Artifact[] =
    artifacts && artifacts.length > 0
      ? artifacts.slice(0, 8)
      : CURATED_NATIONAL_TREASURES;

  // Quản lý hiện vật đang được đưa lên bệ xoay 3D trung tâm
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>(
    eligibleArtifacts[0]?.id || ''
  );

  const activeArtifact =
    eligibleArtifacts.find((a) => a.id === selectedArtifactId) ||
    eligibleArtifacts[0];

  const getFullThumb = (art: Artifact) => {
    const raw = art.thumbnailUrl || (art.images && art.images[0]);
    if (!raw) return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=85';
    if (raw.startsWith('http')) return raw;
    return `${API_ROOT}${raw.startsWith('/') ? '' : '/'}${raw}`;
  };

  return (
    <section id="artifacts" className="client-section client-section-alt client-artifacts-section">
      <div className="client-container">
        {/* Tiêu đề Khối Bảo Vật 3D */}
        <div className="client-section-header">
          <span className="client-section-tag">
            {t('artifacts.tag', 'Kho Tàng Bảo Vật Quốc Gia & Hiện Vật 3D')}
          </span>
          <h2 className="client-section-title">
            {t('artifacts.headline', 'Bệ Trưng Bày Cổ Vật 3D Tương Tác')}
          </h2>
          <p className="client-section-subtitle">
            {t(
              'artifacts.sub',
              'Chiêm ngưỡng chi tiết từng hoa văn, giác cắt và cấu trúc cổ vật nghìn năm tuổi qua công nghệ tái hiện 3D tương tác đa chiều.'
            )}
          </p>
        </div>

        {/* KHUNG BỆ TRƯNG BÀY BẢO VẬT TRUNG TÂM (SPOTLIGHT VITRINE) */}
        <div className="client-pedestal-wrap">
          {activeArtifact && (
            <div className="client-pedestal-grid">
              {/* CỘT TRÁI: BỆ XOAY 3D / TỦ KÍNH TRIỂN LÃM ĐÈN SPOTLIGHT */}
              <div className="client-pedestal-viewer-stage">
                {activeArtifact.model3dUrl ? (
                  <Turntable360Viewer
                    modelUrl={activeArtifact.model3dUrl}
                    artifactName={activeArtifact.name}
                    artifactPeriod={activeArtifact.period || activeArtifact.category}
                    audioNarrationUrl={activeArtifact.audioNarrationUrl}
                    translations={activeArtifact.translations}
                    height={500}
                  />
                ) : (
                  <div className="client-pedestal-static-vitrine">
                    {/* Vòng hào quang đèn spotlight sân khấu */}
                    <div className="client-pedestal-halo" />

                    {/* Huy hiệu bảo vật góc trên */}
                    <div className="client-pedestal-status-badge">
                      <Award size={15} />
                      <span>{activeArtifact.code || 'BẢO VẬT QUỐC GIA'}</span>
                    </div>

                    <img
                      src={getFullThumb(activeArtifact)}
                      alt={activeArtifact.name}
                      className="client-pedestal-static-img"
                    />

                    {/* Chỉ báo tương tác xoay 360 */}
                    <div className="client-pedestal-interaction-hint">
                      <RotateCw size={15} />
                      <span>Chế độ xem xoay chi tiết độ phân giải cao</span>
                    </div>
                  </div>
                )}
              </div>

              {/* CỘT PHẢI: BẢNG GIÁM TUYỂN DI SẢN (CURATORIAL PLACARD) */}
              <div className="client-pedestal-placard">
                <div className="client-pedestal-top-meta">
                  <span className="client-pedestal-badge-gold">
                    <Shield size={14} />
                    <span>Di Sản Văn Hóa</span>
                  </span>
                  <span className="client-pedestal-period">
                    {localize(activeArtifact, 'period', activeArtifact.period || 'Thời kỳ di sản')}
                  </span>
                </div>

                <h3 className="client-pedestal-title">
                  {localize(activeArtifact, 'name', activeArtifact.name)}
                </h3>

                {/* Bảng thông số giám định */}
                <div className="client-pedestal-meta-table">
                  <div className="client-pedestal-meta-col">
                    <div className="client-pedestal-meta-label">
                      {t('artifacts.metaCategory', 'Chất liệu / Phân loại')}
                    </div>
                    <div className="client-pedestal-meta-val">
                      {activeArtifact.category || 'Cổ vật bảo tàng'}
                    </div>
                  </div>

                  <div className="client-pedestal-meta-col">
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

                {/* Các nút hành động */}
                <div className="client-pedestal-actions">
                  {onSelectArtifactDetail && (
                    <button
                      type="button"
                      className="client-pedestal-primary-btn"
                      onClick={() => onSelectArtifactDetail(activeArtifact.id)}
                    >
                      <Volume2 size={17} />
                      <span>{t('artifacts.btnDetail', 'Xem Thuyết Minh & Audio Voice AI')}</span>
                    </button>
                  )}

                  {onOpen3DViewer && activeArtifact.model3dUrl && (
                    <button
                      type="button"
                      className="client-pedestal-secondary-btn"
                      onClick={() => onOpen3DViewer(activeArtifact)}
                    >
                      <RotateCw size={16} />
                      <span>{t('artifacts.btnFullscreen', 'Phóng To Toàn Màn Hình')}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* KHAY TRƯỢT CHỌN CỔ VẬT CHÂN BỆ XOAY (PEDESTAL SHELF) */}
          <div className="client-pedestal-shelf-wrap">
            <div className="client-pedestal-shelf-header">
              <span className="client-pedestal-shelf-label">
                Bộ sưu tập bảo vật tiêu biểu ({eligibleArtifacts.length})
              </span>
              {onViewAllArtifacts && (
                <button
                  type="button"
                  className="client-pedestal-shelf-all-btn"
                  onClick={onViewAllArtifacts}
                >
                  <span>Xem kho hiện vật đầy đủ →</span>
                </button>
              )}
            </div>

            <div className="client-pedestal-shelf-scroll">
              {eligibleArtifacts.map((art) => {
                const thumb = getFullThumb(art);
                const isSelected = art.id === (activeArtifact?.id || '');

                return (
                  <div
                    key={art.id}
                    className={`client-pedestal-shelf-item ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedArtifactId(art.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="client-pedestal-shelf-thumb-wrap">
                      <img src={thumb} alt={art.name} className="client-pedestal-shelf-thumb" />
                      {isSelected && <div className="client-pedestal-shelf-active-dot" />}
                    </div>
                    <div className="client-pedestal-shelf-info">
                      <span className="client-pedestal-shelf-name">
                        {localize(art, 'name', art.name)}
                      </span>
                      <span className="client-pedestal-shelf-meta">
                        {art.code ? `[${art.code}] ` : ''}{art.period || art.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
