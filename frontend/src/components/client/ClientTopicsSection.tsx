import React from 'react';
import { TopicItem } from '../../types';
import { Layers, Calendar } from 'lucide-react';
import { useClientTranslation } from '../../context/ClientTranslationContext';

interface ClientTopicsSectionProps {
  topics: TopicItem[];
}

export const ClientTopicsSection: React.FC<ClientTopicsSectionProps> = ({ topics }) => {
  const { t, localize } = useClientTranslation();

  // Hiển thị tối đa 4 chuyên đề tiêu biểu trên trang chủ
  const displayTopics = topics.slice(0, 4);

  return (
    <section id="topics" className="client-section">
      <div className="client-container">
        {/* Tiêu đề Section */}
        <div className="client-section-header">
          <span className="client-section-badge">
            {t('topics.badge', 'Chuyên Đề & Thời Kỳ')}
          </span>
          <h2 className="client-section-title">
            {t('topics.headline', 'Dòng Chảy Lịch Sử & Văn Hóa')}
          </h2>
          <p className="client-section-subtitle">
            {t(
              'topics.sub',
              'Hành trình tái hiện các cột mốc lịch sử hào hùng qua từng không gian trưng bày chuyên đề đặc sắc.'
            )}
          </p>
        </div>

        {displayTopics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--c-text-muted)' }}>
            <Layers size={40} style={{ color: 'var(--c-gold)', opacity: 0.7, marginBottom: 12 }} />
            <p>{t('topics.empty', 'Đang cập nhật các chuyên đề lịch sử...')}</p>
          </div>
        ) : (
          <div className="client-topics-grid">
            {displayTopics.map((topic) => {
              const name = localize(topic, 'name', topic.name);
              const period = (topic as any).period || (topic.roomCount ? `${topic.roomCount} gian phòng` : 'Chuyên đề di sản');
              const description = localize(topic, 'description', topic.description || '');

              return (
                <div key={topic.id} className="client-topic-card">
                  <div className="client-topic-period">{period}</div>
                  <h3 className="client-topic-title">{name}</h3>
                  <p className="client-topic-desc">
                    {description || t('topics.defaultDesc', 'Trưng bày các hiện vật quý và tư liệu khảo cứu lịch sử.')}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
