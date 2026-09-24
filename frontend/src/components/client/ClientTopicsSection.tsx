import React from 'react';
import { TopicItem } from '../../types';
import { Layers, Calendar } from 'lucide-react';
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
            {t('topics.tag', 'Dòng Chảy Lịch Sử Ngang')}
          </span>
          <h2 className="client-section-title">
            {t('topics.headline', 'Dấu Ấn Thời Gian & Chuyên Đề')}
          </h2>
          <p className="client-section-subtitle">
            {t(
              'topics.sub',
              'Hành trình tái hiện các cột mốc lịch sử hào hùng qua từng thời kỳ và không gian chuyên đề bảo tàng.'
            )}
          </p>
        </div>

        {displayTopics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--c-text-muted)' }}>
            <Layers size={44} style={{ color: 'var(--c-gold)', opacity: 0.7, marginBottom: 14 }} />
            <p>{t('topics.empty', 'Đang cập nhật các chuyên đề lịch sử...')}</p>
          </div>
        ) : (
          <div className="client-timeline-track">
            {displayTopics.map((topic, idx) => {
              const name = localize(topic, 'name', topic.name);
              const description = localize(topic, 'description', topic.description || '');

              return (
                <div key={topic.id} className="client-timeline-milestone">
                  <div className="client-timeline-step-badge">{`0${idx + 1}`}</div>
                  <h3 className="client-timeline-era-title">{name}</h3>
                  <p className="client-timeline-era-desc">
                    {description || t('topics.defaultDesc', 'Trưng bày các hiện vật quý và tư liệu khảo cứu lịch sử theo tiến trình thời gian.')}
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
