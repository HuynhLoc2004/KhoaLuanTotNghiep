import React from 'react';
import { TopicItem } from '../../types';
import { Layers, Calendar, ArrowRight, Landmark, Compass, Award } from 'lucide-react';
import { useClientTranslation } from '../../context/ClientTranslationContext';

interface ClientTopicsSectionProps {
  topics: TopicItem[];
}

interface CuratedEpoch {
  id: string;
  name: string;
  era: string;
  description: string;
  roomCount: number;
  imageUrl: string;
}

const CURATED_DEFAULT_EPOCHS: CuratedEpoch[] = [
  {
    id: 'epoch-01',
    name: 'Tiến Trình Lịch Sử & Thời Đại Dựng Nước',
    era: 'Thời Tiền Sử • Đồ Đồng • Dựng Nước',
    description: 'Từ thời tiền sử, các nền văn minh Sông Hồng, trống đồng Đông Sơn đến các triều đại Đinh - Lê - Lý - Trần kế tục giữ yên bờ cõi.',
    roomCount: 4,
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'epoch-02',
    name: 'Văn Hóa Champa & Phù Nam - Óc Eo',
    era: 'Thế kỷ I – Thế kỷ XIII',
    description: 'Di sản điêu khắc sa thạch độc bản, đồ gốm và trang sức vàng rực rỡ của các vương quốc cổ đại rạng danh trên dải đất phương Nam.',
    roomCount: 3,
    imageUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'epoch-03',
    name: 'Mỹ Thuật Cung Đình & Cổ Ngoạn Đặc Sắc',
    era: 'Triều Nguyễn (1802 – 1945)',
    description: 'Bộ sưu tập trang phục hoàng gia, long sàng, ngự kiếm và kho tàng cổ vật quý hiếm do học giả Vương Hồng Sển hiến tặng.',
    roomCount: 4,
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'epoch-04',
    name: 'Kiến Trúc Đông Dương & Bảo Tàng Gần 100 Năm',
    era: 'Từ 1929 Đến Nay',
    description: 'Kiệt tác kiến trúc Đông Dương kết hợp mỹ thuật cung đình truyền thống và kỹ nghệ phương Tây giữa lòng Sài Gòn cổ kính.',
    roomCount: 3,
    imageUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80'
  }
];

export const ClientTopicsSection: React.FC<ClientTopicsSectionProps> = ({ topics }) => {
  const { t, localize } = useClientTranslation();

  // Hòa trộn chuyên đề thực tế từ Admin MongoDB với danh mục thời kỳ lịch sử chuẩn
  const displayList: (TopicItem | CuratedEpoch)[] =
    topics && topics.length >= 2
      ? topics.slice(0, 4)
      : CURATED_DEFAULT_EPOCHS;

  const sampleImages = [
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80'
  ];

  return (
    <section id="topics" className="client-section client-topics-section">
      <div className="client-container">
        {/* Tiêu đề Khối Chuyên Đề */}
        <div className="client-section-header">
          <span className="client-section-tag">
            {t('topics.tag', 'Dòng Chảy Lịch Sử & Thời Đại')}
          </span>
          <h2 className="client-section-title">
            {t('topics.headline', 'Dấu Ấn Thời Gian & Các Chuyên Đề Trưng Bày')}
          </h2>
          <p className="client-section-subtitle">
            {t(
              'topics.sub',
              'Khám phá tiến trình lịch sử hào hùng qua từng thời kỳ văn hóa, kiến trúc và các bộ sưu tập chuyên đề đặc sắc của bảo tàng.'
            )}
          </p>
        </div>

        {/* LƯỚI THẺ CHUYÊN ĐỀ HÌNH ẢNH NGHỆ THUẬT (EPOCH GALLERY GRID) */}
        <div className="client-topics-grid">
          {displayList.map((item, idx) => {
            const name = localize(item, 'name', item.name);
            const description = localize(item, 'description', item.description || '');
            const era = (item as any).era || `Thời kỳ ${idx + 1}`;
            const roomCount = item.roomCount || 3;
            const bgImage = (item as any).imageUrl || sampleImages[idx % sampleImages.length];

            return (
              <div key={item.id} className="client-topic-card">
                {/* Lớp nền ảnh di sản kèm hiệu ứng phủ tối */}
                <div className="client-topic-bg-wrap">
                  <img src={bgImage} alt={name} className="client-topic-bg-img" />
                  <div className="client-topic-gradient" />
                </div>

                {/* Nội dung trên thẻ chuyên đề */}
                <div className="client-topic-content">
                  <div className="client-topic-header-row">
                    <span className="client-topic-step-pill">{`0${idx + 1}`}</span>
                    <span className="client-topic-era-tag">{era}</span>
                  </div>

                  <h3 className="client-topic-title">{name}</h3>

                  <p className="client-topic-desc">{description}</p>

                  <div className="client-topic-footer">
                    <span className="client-topic-room-badge">
                      <Landmark size={13} />
                      <span>{roomCount} gian phòng liên quan</span>
                    </span>
                    <span className="client-topic-arrow">
                      <ArrowRight size={15} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
