import React from 'react';
import { TopicItem } from '../../types';
import { Layers } from 'lucide-react';
import { useClientTranslation } from '../../context/ClientTranslationContext';

interface ClientTopicsSectionProps {
  topics: TopicItem[];
}

export const ClientTopicsSection: React.FC<ClientTopicsSectionProps> = ({ topics }) => {
  const { t, localize } = useClientTranslation();

  const displayTopics = topics.slice(0, 4);

  return (
    <section id="topics" className="client-section">
      <div className="client-container">
        {/* Tiêu đề Section */}
        <div className="client-section-header">
          <span className="client-section-tag">
            {t('topics.tag', 'Chuyên Đề & Thời Kỳ Lịch Sử')}
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
          <div className="client-timeline-grid">
            {displayTopics.map((topic, idx) => {
              const name = localize(topic, 'name', topic.name);
              const description = localize(topic, 'description', topic.description || '');

              return (
                <div key={topic.id} className="client-timeline-card">
                  <div className="client-timeline-num">{`0${idx + 1}`}</div>
                  <h3 className="client-timeline-title">{name}</h3>
                  <p className="client-timeline-desc">
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
