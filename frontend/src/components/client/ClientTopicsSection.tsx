import React from 'react';
import { TopicItem } from '../../types';
import { ArrowRight } from 'lucide-react';
import { useClientTranslation } from '../../context/ClientTranslationContext';

interface ClientTopicsSectionProps {
  topics?: TopicItem[];
  onViewAllTopics?: () => void;
}

const CURATED_DEFAULT_EPOCHS = [
  {
    id: 'epoch-1',
    name: 'Tiền Sử & Bình Minh Lịch Sử',
    era: 'Thời Tiền Sử • Đồ Đá, Đồ Đồng',
    desc: 'Dấu tích văn hóa Đông Sơn và thời dựng nước Hùng Vương.',
    image: '',
    roomCount: 3
  },
  {
    id: 'epoch-2',
    name: 'Văn Hóa Phù Nam & Champa',
    era: 'Thế kỷ I – XIII',
    desc: 'Văn minh cổ Óc Eo và nghệ thuật điêu khắc sa thạch Champa.',
    image: '',
    roomCount: 4
  },
  {
    id: 'epoch-3',
    name: 'Đại Việt Qua Các Triều Đại',
    era: 'Lý, Trần, Lê, Nguyễn',
    desc: 'Kỷ nguyên độc lập và mỹ thuật cung đình cổ truyền rực rỡ.',
    image: '',
    roomCount: 6
  },
  {
    id: 'epoch-4',
    name: 'Văn Hóa Đất Phương Nam',
    era: 'Từ Thế kỷ XVII',
    desc: 'Hành trình khai phá Nam Bộ và mỹ thuật dân gian phương Nam.',
    image: '',
    roomCount: 5
  }
];

export const ClientTopicsSection: React.FC<ClientTopicsSectionProps> = ({ topics, onViewAllTopics }) => {
  const { t, localize } = useClientTranslation();

  const displayEpochs =
    topics && topics.length >= 2
      ? topics.slice(0, 4).map((top, idx) => ({
          id: top.id,
          name: localize(top, 'name', top.name),
          era: (top as any).era || `Chuyên đề ${idx + 1}`,
          desc: localize(top, 'description', top.description || 'Chuyên đề trưng bày di sản lịch sử.'),
          image: (top as any).imageUrl || CURATED_DEFAULT_EPOCHS[idx % CURATED_DEFAULT_EPOCHS.length].image,
          roomCount: top.roomCount || 2
        }))
      : CURATED_DEFAULT_EPOCHS;

  return (
    <section id="topics" className="client-zigzag-section">
      <div className="client-container">
        {/* ZIG-ZAG THẰNG 4: NẰM BÊN CÙNG BÊN TRÁI, TRỒI TỪ DƯỚI LÊN KHI SCROLL */}
        <div className="client-zigzag-card align-left reveal-on-scroll">
          <div className="client-zigzag-card-body">
            <span className="client-zigzag-tag">
              {t('topics.tag', 'Dòng Chảy Lịch Sử')}
            </span>

            <h2 className="client-zigzag-title">
              {t('topics.headline', 'Các Thời Kỳ & Chuyên Đề Di Sản')}
            </h2>

            <p className="client-zigzag-desc">
              {t(
                'topics.desc',
                'Hành trình xuyên suốt lịch sử phương Nam từ thời tiền sử đến các triều đại phong kiến qua hệ thống các phòng chuyên khảo độc đáo.'
              )}
            </p>

            {/* Lưới 2x2 chuyên đề */}
            <div className="client-zigzag-topics-grid">
              {displayEpochs.map((item) => (
                <div key={item.id} className="client-zigzag-topic-card">
                  <div className="client-zigzag-topic-bg">
                    <img src={item.image} alt={item.name} className="client-zigzag-topic-img" />
                    <div className="client-zigzag-topic-gradient" />
                  </div>

                  <div className="client-zigzag-topic-body">
                    <span className="client-zigzag-topic-era">{item.era}</span>
                    <h3 className="client-zigzag-topic-name">{item.name}</h3>
                    <p className="client-zigzag-topic-desc">{item.desc}</p>
                    <div className="client-zigzag-topic-rooms">
                      <span>{item.roomCount} gian phòng liên quan</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20 }}>
              <button
                type="button"
                className="client-zigzag-btn-primary"
                onClick={onViewAllTopics}
              >
                <span>{t('topics.btnViewAll', 'Xem tất cả chuyên đề lịch sử')}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
