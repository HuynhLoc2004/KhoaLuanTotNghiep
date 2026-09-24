import React from 'react';
import { TopicItem } from '../../types';
import { Layers, ArrowLeft, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { ClientNavbar } from '../../components/client/ClientNavbar';
import { ClientFooter } from '../../components/client/ClientFooter';

interface ClientTopicsPageProps {
  topics: TopicItem[];
  onNavigateHome: () => void;
  onNavigatePage: (page: 'home' | 'rooms' | 'artifacts' | 'topics' | 'guide') => void;
  onNavigateRoomsPage: () => void;
  clientTheme: 'light' | 'dark';
  onToggleClientTheme: () => void;
  onOpenLoginModal: () => void;
  onNavigateAdmin: () => void;
}

const DEFAULT_EPOCHS = [
  {
    id: 'epoch-1',
    name: 'Tiền Sử & Bình Minh Lịch Sử',
    era: 'Thời Tiền Sử • Đồ Đá, Đồ Đồng',
    desc: 'Dấu tích văn hóa Đông Sơn và thời dựng nước Hùng Vương.',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    roomCount: 3
  },
  {
    id: 'epoch-2',
    name: 'Văn Hóa Phù Nam & Champa',
    era: 'Thế kỷ I – XIII',
    desc: 'Văn minh cổ Óc Eo và nghệ thuật điêu khắc sa thạch Champa.',
    image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80',
    roomCount: 4
  },
  {
    id: 'epoch-3',
    name: 'Đại Việt Qua Các Triều Đại',
    era: 'Lý, Trần, Lê, Nguyễn',
    desc: 'Kỷ nguyên độc lập và mỹ thuật cung đình cổ truyền rực rỡ.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    roomCount: 6
  },
  {
    id: 'epoch-4',
    name: 'Văn Hóa Đất Phương Nam',
    era: 'Từ Thế kỷ XVII',
    desc: 'Hành trình khai phá Nam Bộ và mỹ thuật dân gian phương Nam.',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    roomCount: 5
  }
];

export const ClientTopicsPage: React.FC<ClientTopicsPageProps> = ({
  topics,
  onNavigateHome,
  onNavigatePage,
  onNavigateRoomsPage,
  clientTheme,
  onToggleClientTheme,
  onOpenLoginModal,
  onNavigateAdmin
}) => {
  const { t, localize } = useClientTranslation();

  const displayList =
    topics && topics.length >= 2
      ? topics.map((top, idx) => ({
          id: top.id,
          name: localize(top, 'name', top.name),
          era: (top as any).era || `Chuyên đề ${idx + 1}`,
          desc: localize(top, 'description', top.description || 'Chuyên đề trưng bày di sản lịch sử.'),
          image: (top as any).imageUrl || DEFAULT_EPOCHS[idx % DEFAULT_EPOCHS.length].image,
          roomCount: top.roomCount || 2
        }))
      : DEFAULT_EPOCHS;

  return (
    <div className="client-portal" data-client-theme={clientTheme}>
      <ClientNavbar
        clientTheme={clientTheme}
        onToggleClientTheme={onToggleClientTheme}
        onOpenLoginModal={onOpenLoginModal}
        onNavigateAdmin={onNavigateAdmin}
        activeSection="topics"
        onNavigatePage={onNavigatePage}
      />

      <main className="client-subpage">
        <div className="client-container">
          {/* Breadcrumb & Header */}
          <div className="client-subpage-hero">
            <div className="client-subpage-breadcrumb">
              <button
                type="button"
                className="client-breadcrumb-btn"
                onClick={onNavigateHome}
              >
                <ArrowLeft size={14} />
                <span>{t('nav.home', 'Trang chủ')}</span>
              </button>
              <span className="client-breadcrumb-sep">/</span>
              <span className="client-breadcrumb-current">
                {t('topics.pageTitle', 'Chuyên đề lịch sử')}
              </span>
            </div>

            <span className="client-zigzag-tag">
              {t('topics.tag', 'Dòng Chảy Lịch Sử Phương Nam')}
            </span>

            <h1 className="client-subpage-title">
              {t('topics.pageHeading', 'Các Thời Kỳ & Chuyên Đề Di Sản')}
            </h1>

            <p className="client-subpage-lead">
              {t(
                'topics.pageLead',
                'Hành trình xuyên suốt lịch sử từ thời tiền sử đến các triều đại phong kiến và giai đoạn mở cõi đất phương Nam qua các bộ sưu tập chuyên đề độc đáo.'
              )}
            </p>
          </div>

          {/* Danh sách các chuyên đề */}
          <div className="client-subpage-grid">
            {displayList.map((item) => (
              <div key={item.id} className="client-gallery-card">
                <div className="client-gallery-media">
                  <img src={item.image} alt={item.name} className="client-gallery-img" loading="lazy" />
                  <div className="client-zigzag-badge-float">
                    <span>{item.era}</span>
                  </div>
                </div>

                <div className="client-gallery-body">
                  <h2 className="client-gallery-title">{item.name}</h2>
                  <p className="client-gallery-desc">{item.desc}</p>

                  <div className="client-gallery-actions" style={{ marginTop: 'auto', paddingTop: 14 }}>
                    <button
                      type="button"
                      className="client-zigzag-btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={onNavigateRoomsPage}
                    >
                      <BookOpen size={15} />
                      <span>{t('topics.btnExploreRooms', 'Khám phá các gian phòng')}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <ClientFooter />
    </div>
  );
};
