import React from 'react';
import {
  Layers,
  BookOpen,
  ArrowRight,
  Compass,
  Calendar
} from 'lucide-react';
import { TopicItem } from '../../types';
import { useClientTranslation } from '../../context/ClientTranslationContext';

interface ClientTopicsSectionProps {
  topics: TopicItem[];
  onSelectTopic?: (topic: TopicItem) => void;
}

export const ClientTopicsSection: React.FC<ClientTopicsSectionProps> = ({
  topics,
  onSelectTopic
}) => {
  const { t, localize } = useClientTranslation();

  const displayTopics = topics.length > 0 ? topics : [
    {
      id: 'prehistoric',
      name: 'Thời kỳ Tiền sử & Sơ sử Việt Nam',
      description: 'Dấu tích văn hóa Đông Sơn, Sa Huỳnh, Đồng Nai với các công cụ đá, rìu đồng và trống đồng tinh xảo.',
      roomCount: 2
    },
    {
      id: 'oc-eo',
      name: 'Văn hóa Óc Eo - Phù Nam',
      description: 'Nền văn minh cổ đại phát triển rực rỡ ở vùng đất Nam Bộ từ thế kỷ I đến thế kỷ VII sau Công nguyên.',
      roomCount: 3
    },
    {
      id: 'champa',
      name: 'Nghệ thuật Điêu khắc Champa',
      description: 'Các kiệt tác điêu khắc sa thạch độc đáo thể hiện đỉnh cao tín ngưỡng và nghệ thuật tạo hình Ấn Độ giáo.',
      roomCount: 2
    },
    {
      id: 'dynasties',
      name: 'Các Triều đại Phong kiến Độc lập',
      description: 'Lịch sử nghìn năm dựng nước và giữ nước qua các thời kỳ Lý, Trần, Lê sơ, Mạc, Tây Sơn và nhà Nguyễn.',
      roomCount: 4
    }
  ];

  return (
    <section id="topics" className="client-section">
      <div className="client-container">
        <div className="client-section-header">
          <span className="client-section-badge">
            <BookOpen size={13} />
            <span>{t('topics.badge', 'Chuyên đề & Dòng thời gian')}</span>
          </span>
          <h2 className="client-section-title">
            {t('topics.title', 'Không gian trưng bày chuyên đề')}
          </h2>
          <p className="client-section-desc">
            {t(
              'topics.desc',
              'Hệ thống trưng bày được phân bố theo tiến trình lịch sử và các nền văn hóa cổ đại, giúp người xem có cái nhìn toàn cảnh sâu sắc về nguồn cội văn hóa.'
            )}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {displayTopics.map((topic, idx) => {
            const name = localize(topic, 'name', topic.name);
            const desc = localize(topic, 'description', topic.description || '');

            return (
              <div
                key={topic.id || idx}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 16,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.25s ease'
                }}
                className="client-topic-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'rgba(140, 45, 25, 0.1)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Layers size={18} />
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--accent-gold)',
                      background: 'rgba(180, 125, 40, 0.1)',
                      padding: '3px 8px',
                      borderRadius: 12
                    }}
                  >
                    Chuyên đề 0{idx + 1}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--heading-color)', margin: '0 0 8px 0', lineHeight: 1.35 }}>
                  {name}
                </h3>

                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 18px 0', flex: 1 }}>
                  {desc}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: 12 }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Compass size={12} style={{ color: 'var(--accent-gold)' }} />
                    <span>{topic.roomCount || 1} {t('topics.roomCount', 'gian trưng bày')}</span>
                  </span>

                  <a
                    href="#rooms"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--primary)',
                      textDecoration: 'none'
                    }}
                  >
                    <span>{t('topics.btnView', 'Khám phá')}</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
