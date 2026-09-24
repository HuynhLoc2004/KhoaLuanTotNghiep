import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MuseumRoom } from '../../types';
import { Pagination } from '../../components/Pagination';
import {
  Compass,
  Search,
  ArrowRight,
  ArrowLeft,
  Layers,
  MapPin,
  Filter,
  ChevronDown,
  Check,
  RotateCcw
} from 'lucide-react';
import { API_ROOT } from '../../services/api';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { ClientNavbar } from '../../components/client/ClientNavbar';
import { ClientFooter } from '../../components/client/ClientFooter';

interface ClientRoomsPageProps {
  rooms: MuseumRoom[];
  onSelectRoomForTour: (room: MuseumRoom) => void;
  onNavigateHome: () => void;
  onNavigatePage: (page: 'home' | 'rooms' | 'artifacts' | 'guide') => void;
  clientTheme: 'light' | 'dark';
  onToggleClientTheme: () => void;
  onOpenLoginModal: () => void;
  onNavigateAdmin: () => void;
  onOpenQRScanner?: () => void;
}

export const ClientRoomsPage: React.FC<ClientRoomsPageProps> = ({
  rooms,
  onSelectRoomForTour,
  onNavigateHome,
  onNavigatePage,
  clientTheme,
  onToggleClientTheme,
  onOpenLoginModal,
  onNavigateAdmin,
  onOpenQRScanner
}) => {
  const { t, localize } = useClientTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Phân trang chuẩn Dashboard (6 - 9 - 12 - 18 - 24)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  // Reset về trang 1 khi lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPeriod]);

  // Đóng dropdown bộ lọc khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sanitizeMuseumText = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/Sảnh Đón Khách\s*&\s*Giới Thiệu Tổng Thể/gi, 'Sảnh Chính')
      .replace(/Gian Thời Tiền Sử Việt Nam/gi, 'Phòng Thời Tiền Sử')
      .replace(/Gian Thời Tiền Sử/gi, 'Phòng Thời Tiền Sử')
      .replace(/Thời kỳ Thành lập\s*&\s*Kiến trúc Đông Dương/gi, 'Kiến trúc Đông Dương (1929)')
      .replace(/Thời kỳ Đồ Đá\s*&\s*Đồ Đồng\s*\(Cách nay hàng ngàn năm\)/gi, 'Thời đại Đồ đá & Đồ đồng')
      .replace(/Gian Văn Hóa Óc Eo\s*&\s*Vương Quốc Phù Nam/gi, 'Phòng Văn hóa Óc Eo – Phù Nam')
      .replace(/Thế kỷ I đến Thế kỷ VII sau Công nguyên/gi, 'Thế kỷ I – VII SCN');
  };

  // Trích xuất danh sách các thời kỳ / phân loại từ dữ liệu phòng thực tế
  const periods = useMemo(() => {
    const set = new Set<string>();
    rooms.forEach((r) => {
      const p = sanitizeMuseumText((r as any).period || r.category || '');
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

  // Danh sách phân trang gian phòng
  const paginatedRooms = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRooms.slice(start, start + pageSize);
  }, [filteredRooms, currentPage, pageSize]);

  // Hiệu ứng cuộn hiển thị nhẹ nhàng (Scroll Reveal Animation)
  useEffect(() => {
    const timer = setTimeout(() => {
      const cards = document.querySelectorAll('.client-gallery-card');
      if (!cards.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
      );

      cards.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }, 80);

    return () => clearTimeout(timer);
  }, [paginatedRooms]);

  const getRoomThumb = (room: MuseumRoom) => {
    const raw = room.panoramaUrl || room.thumbnailUrl;
    if (!raw) return '';
    return raw.startsWith('http')
      ? raw
      : `${API_ROOT}${raw.startsWith('/') ? '' : '/'}${raw}`;
  };

  const currentFilterLabel =
    selectedPeriod === 'all'
      ? `${t('common.all', 'Tất cả thời kỳ')} (${rooms.length})`
      : selectedPeriod;

  return (
    <div className="client-portal" data-client-theme={clientTheme}>
      <ClientNavbar
        clientTheme={clientTheme}
        onToggleClientTheme={onToggleClientTheme}
        onOpenLoginModal={onOpenLoginModal}
        onNavigateAdmin={onNavigateAdmin}
        activeSection="rooms"
        onNavigatePage={onNavigatePage}
        onOpenQRScanner={onOpenQRScanner}
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

            <span className="client-subpage-badge">
              {t('rooms.tag', 'Không gian 360°')}
            </span>

            <h1 className="client-subpage-title">
              {t('rooms.pageHeading', 'Gian phòng trưng bày 360°')}
            </h1>

            <p className="client-subpage-lead">
              {t(
                'rooms.pageLead',
                'Chọn gian phòng bên dưới để bắt đầu trải nghiệm tham quan không gian 360°.'
              )}
            </p>
          </div>

          {/* Thanh công cụ tìm kiếm và bộ lọc Select Dropdown tinh gọn */}
          <div className="client-subpage-toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', margin: '28px 0 36px 0', paddingBottom: 20, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {/* Ô tìm kiếm */}
            <div className="client-subpage-search-wrap" style={{ position: 'relative', width: 340, maxWidth: '100%' }}>
              <Search size={16} className="client-subpage-search-icon" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
              <input
                type="text"
                className="client-subpage-search-input"
                placeholder={t('rooms.searchPlaceholder', 'Tìm tên phòng, mã phòng (P-101, P-102)...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 16px 10px 42px', borderRadius: 30, background: 'rgba(16, 20, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#F3F4F6', fontSize: '13px', outline: 'none' }}
              />
            </div>

            {/* BỘ LỌC THỜI KỲ / CHUYÊN ĐỀ DẠNG SELECT DROPDOWN GỌN GÀNG */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div ref={filterDropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 18px',
                    borderRadius: 30,
                    background: selectedPeriod !== 'all' ? 'rgba(212, 168, 106, 0.16)' : 'rgba(16, 20, 28, 0.85)',
                    border: '1px solid',
                    borderColor: selectedPeriod !== 'all' ? 'rgba(212, 168, 106, 0.5)' : 'rgba(255, 255, 255, 0.12)',
                    color: selectedPeriod !== 'all' ? '#D4A86A' : '#F3F4F6',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  <Filter size={14} style={{ color: '#D4A86A', flexShrink: 0 }} />
                  <span style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentFilterLabel}
                  </span>
                  <ChevronDown
                    size={13}
                    style={{
                      opacity: 0.7,
                      transform: isFilterDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </button>

                {/* Dropdown danh sách thời kỳ */}
                {isFilterDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: 290,
                      maxHeight: '55vh',
                      overflowY: 'auto',
                      background: 'rgba(18, 22, 30, 0.97)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: '1px solid rgba(212, 168, 106, 0.35)',
                      borderRadius: 14,
                      padding: '8px',
                      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)',
                      zIndex: 150,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#D4A86A', textTransform: 'uppercase', letterSpacing: 0.5, padding: '4px 8px 6px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 2 }}>
                      Lọc theo thời kỳ & không gian
                    </div>

                    {/* Option: Tất cả */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPeriod('all');
                        setIsFilterDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: 'none',
                        background: selectedPeriod === 'all' ? 'rgba(212, 168, 106, 0.16)' : 'transparent',
                        color: selectedPeriod === 'all' ? '#D4A86A' : '#E5E7EB',
                        fontSize: '12.5px',
                        fontWeight: selectedPeriod === 'all' ? 600 : 400,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedPeriod !== 'all') e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        if (selectedPeriod !== 'all') e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <span>{t('common.all', 'Tất cả thời kỳ')}</span>
                      <span style={{ fontSize: '11px', opacity: 0.7 }}>({rooms.length})</span>
                    </button>

                    {/* Options từng thời kỳ */}
                    {periods.map((p) => {
                      const isSelected = selectedPeriod === p;
                      const countInPeriod = rooms.filter((r) => ((r as any).period || r.category) === p).length;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setSelectedPeriod(p);
                            setIsFilterDropdownOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: 8,
                            border: 'none',
                            background: isSelected ? 'rgba(212, 168, 106, 0.16)' : 'transparent',
                            color: isSelected ? '#D4A86A' : '#E5E7EB',
                            fontSize: '12.5px',
                            fontWeight: isSelected ? 600 : 400,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.15s'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 6 }}>
                            {p}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            <span style={{ fontSize: '11px', opacity: 0.7 }}>({countInPeriod})</span>
                            {isSelected && <Check size={13} style={{ color: '#D4A86A' }} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Nút đặt lại nhanh nếu đang chọn thời kỳ */}
              {selectedPeriod !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('all')}
                  title="Xóa bộ lọc"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '8px 12px',
                    borderRadius: 30,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#9CA3AF',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={12} />
                  <span>Xóa lọc</span>
                </button>
              )}
            </div>
          </div>

          {/* Danh sách lưới gian phòng */}
          {filteredRooms.length === 0 ? (
            <div className="client-subpage-empty" style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(16, 20, 28, 0.6)', border: '1px dashed rgba(255, 255, 255, 0.12)', borderRadius: 18, color: '#9CA3AF' }}>
              <Compass size={40} style={{ margin: '0 auto 14px auto', opacity: 0.5, color: '#D4A86A' }} />
              <p style={{ fontSize: '14px', margin: 0 }}>{t('rooms.notFound', 'Không tìm thấy gian phòng phù hợp với điều kiện lọc.')}</p>
              <button
                type="button"
                className="client-zigzag-btn-primary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPeriod('all');
                }}
                style={{ marginTop: 14 }}
              >
                <span>{t('common.resetFilter', 'Đặt lại bộ lọc')}</span>
              </button>
            </div>
          ) : (
            <>
              <div className="client-subpage-grid">
                {paginatedRooms.map((room, index) => {
                  const title = sanitizeMuseumText(localize(room, 'name', room.name));
                  const period = sanitizeMuseumText(localize(room, 'period', (room as any).period || room.category || ''));
                  const desc = localize(room, 'description', room.description || '');
                  const hotspotCount = room.hotspots ? room.hotspots.length : 0;
                  const thumb = getRoomThumb(room);

                  return (
                    <div
                      key={room.id}
                      className="client-gallery-card"
                      style={{ transitionDelay: `${index * 60}ms` }}
                    >
                      {/* KHUNG MEDIA ẢNH TOÀN CẢNH */}
                      <div
                        className="client-gallery-media clickable"
                        onClick={() => onSelectRoomForTour(room)}
                        role="button"
                        tabIndex={0}
                        title={`Bấm để vào tham quan 360° ${title}`}
                      >
                        {thumb ? (
                          <img src={thumb} alt={title} className="client-gallery-img" loading="lazy" />
                        ) : (
                          <div className="client-media-placeholder" style={{ padding: '24px 12px' }}>
                            <div className="client-media-placeholder-icon" style={{ width: 44, height: 44, marginBottom: 8 }}>
                              <Compass size={22} strokeWidth={1.5} />
                            </div>
                            <span className="client-media-placeholder-title" style={{ fontSize: 13 }}>Chưa có ảnh 360°</span>
                          </div>
                        )}
                        <div className="client-zigzag-badge-float">
                          <span>{thumb ? '360° Sẵn sàng' : 'Đang cập nhật'}</span>
                        </div>
                        {hotspotCount > 0 && (
                          <div className="client-gallery-hotspot-pill">
                            <Layers size={13} style={{ color: '#D4A86A' }} />
                            <span>{hotspotCount} điểm chú thích</span>
                          </div>
                        )}
                      </div>

                      {/* NỘI DUNG CARD: TYPOGRAPHY ĐỒNG BỘ, KHÔNG RỚT CHỮ LỘN XỘN */}
                      <div className="client-gallery-body">
                        {period && <span className="client-gallery-meta">{period}</span>}
                        <h2 className="client-gallery-title" title={title}>{title}</h2>
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

              {/* PHÂN TRANG CHUẨN DASHBOARD (6 - 9 - 12 - 18 - 24) */}
              <Pagination
                currentPage={currentPage}
                totalItems={filteredRooms.length}
                pageSize={pageSize}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 160, behavior: 'smooth' });
                }}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[6, 9, 12, 18, 24]}
                itemLabel={t('rooms.unit', 'gian phòng')}
              />
            </>
          )}
        </div>
      </main>

      <ClientFooter onNavigatePage={onNavigatePage} />
    </div>
  );
};
