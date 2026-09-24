import React, { useState, useMemo } from 'react';
import { MuseumRoom } from '../../types';
import { Compass, Search, ArrowRight, ArrowLeft, Layers, MapPin } from 'lucide-react';
import { API_ROOT } from '../../services/api';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { ClientNavbar } from '../../components/client/ClientNavbar';
import { ClientFooter } from '../../components/client/ClientFooter';

interface ClientRoomsPageProps {
  rooms: MuseumRoom[];
  onSelectRoomForTour: (room: MuseumRoom) => void;
  onNavigateHome: () => void;
  onNavigatePage: (page: 'home' | 'rooms' | 'artifacts' | 'topics' | 'guide') => void;
  clientTheme: 'light' | 'dark';
  onToggleClientTheme: () => void;
  onOpenLoginModal: () => void;
  onNavigateAdmin: () => void;
}

export const ClientRoomsPage: React.FC<ClientRoomsPageProps> = ({
  rooms,
  onSelectRoomForTour,
  onNavigateHome,
  onNavigatePage,
  clientTheme,
  onToggleClientTheme,
  onOpenLoginModal,
  onNavigateAdmin
}) => {
  const { t, localize } = useClientTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  // Trích xuất danh sách các thời kỳ / phân loại từ dữ liệu phòng thực tế
  const periods = useMemo(() => {
    const set = new Set<string>();
    rooms.forEach((r) => {
      const p = (r as any).period || r.category;
      if (p) set.add(p);
    });
    return Array.from(set);
  }, [rooms]);

  // Lọc gian phòng theo tìm kiếm và thời kỳ
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const name = localize(r, 'name', r.name).toLowerCase();
      const code = (r.code || '').toLowerCase();
      const desc = localize(r, 'description', r.description || '').toLowerCase();
      const p = (r as any).period || r.category || '';

      const matchSearch =
        !searchQuery ||
        name.includes(searchQuery.toLowerCase()) ||
        code.includes(searchQuery.toLowerCase()) ||
        desc.includes(searchQuery.toLowerCase());

      const matchPeriod = selectedPeriod === 'all' || p === selectedPeriod;

      return matchSearch && matchPeriod;
    });
  }, [rooms, searchQuery, selectedPeriod, localize]);

  const getRoomThumb = (room: MuseumRoom) => {
    const raw = room.panoramaUrl || room.thumbnailUrl;
    if (!raw) {
      return 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=85';
    }
    return raw.startsWith('http')
      ? raw
      : `${API_ROOT}${raw.startsWith('/') ? '' : '/'}${raw}`;
  };

  return (
    <div className="client-portal" data-client-theme={clientTheme}>
      <ClientNavbar
        clientTheme={clientTheme}
        onToggleClientTheme={onToggleClientTheme}
        onOpenLoginModal={onOpenLoginModal}
        onNavigateAdmin={onNavigateAdmin}
        activeSection="rooms"
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
                {t('rooms.pageTitle', 'Gian phòng 360°')}
              </span>
            </div>

            <span className="client-zigzag-tag">
              {t('rooms.tag', 'Không Gian Thực Tế Ảo Tour 360°')}
            </span>

            <h1 className="client-subpage-title">
              {t('rooms.pageHeading', 'Tất Cả Gian Phòng Trưng Bày 360°')}
            </h1>

            <p className="client-subpage-lead">
              {t(
                'rooms.pageLead',
                'Hệ thống không gian trưng bày số hóa toàn cảnh 360° sắc nét. Bấm vào bất kỳ gian phòng nào để bắt đầu hành trình tham quan và tương tác với các điểm chú thích hiện vật lịch sử.'
              )}
            </p>
          </div>

          {/* Thanh công cụ tìm kiếm và bộ lọc */}
          <div className="client-subpage-toolbar">
            <div className="client-subpage-search-wrap">
              <Search size={16} className="client-subpage-search-icon" />
              <input
                type="text"
                className="client-subpage-search-input"
                placeholder={t('rooms.searchPlaceholder', 'Tìm kiếm gian phòng, mã phòng, thời kỳ...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="client-subpage-filters">
              <button
                type="button"
                className={`client-subpage-filter-btn ${selectedPeriod === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedPeriod('all')}
              >
                <span>{t('common.all', 'Tất cả')} ({rooms.length})</span>
              </button>

              {periods.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`client-subpage-filter-btn ${selectedPeriod === p ? 'active' : ''}`}
                  onClick={() => setSelectedPeriod(p)}
                >
                  <span>{p}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Danh sách lưới gian phòng */}
          {filteredRooms.length === 0 ? (
            <div className="client-subpage-empty">
              <Compass size={40} className="client-empty-icon" />
              <p>{t('rooms.notFound', 'Không tìm thấy gian phòng phù hợp với điều kiện lọc.')}</p>
              <button
                type="button"
                className="client-zigzag-btn-primary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPeriod('all');
                }}
                style={{ marginTop: 12 }}
              >
                <span>{t('common.resetFilter', 'Đặt lại bộ lọc')}</span>
              </button>
            </div>
          ) : (
            <div className="client-subpage-grid">
              {filteredRooms.map((room) => {
                const title = localize(room, 'name', room.name);
                const period = localize(room, 'period', (room as any).period || room.category || '');
                const desc = localize(room, 'description', room.description || '');
                const hotspotCount = room.hotspots ? room.hotspots.length : 0;
                const thumb = getRoomThumb(room);

                return (
                  <div key={room.id} className="client-gallery-card">
                    <div
                      className="client-gallery-media clickable"
                      onClick={() => onSelectRoomForTour(room)}
                      role="button"
                      tabIndex={0}
                    >
                      <img src={thumb} alt={title} className="client-gallery-img" loading="lazy" />
                      <div className="client-zigzag-badge-float">
                        <span>360° Sẵn sàng</span>
                      </div>
                      {hotspotCount > 0 && (
                        <div className="client-gallery-hotspot-pill">
                          <Layers size={13} />
                          <span>{hotspotCount} điểm chú thích</span>
                        </div>
                      )}
                    </div>

                    <div className="client-gallery-body">
                      {period && <span className="client-gallery-meta">{period}</span>}
                      <h2 className="client-gallery-title">{title}</h2>
                      {desc && <p className="client-gallery-desc">{desc}</p>}

                      <div className="client-gallery-actions">
                        <button
                          type="button"
                          className="client-zigzag-btn-primary"
                          style={{ width: '100%', justifyContent: 'center' }}
                          onClick={() => onSelectRoomForTour(room)}
                        >
                          <Compass size={15} />
                          <span>{t('rooms.btnEnterTour', 'Vào tham quan 360°')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <ClientFooter />
    </div>
  );
};
