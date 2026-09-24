import React, { useState, useMemo, useEffect } from 'react';
import { Artifact } from '../../types';
import { Pagination } from '../../components/Pagination';
import { Box, Search, ArrowRight, ArrowLeft, RotateCw, Sparkles, Filter } from 'lucide-react';
import { API_ROOT } from '../../services/api';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { ClientNavbar } from '../../components/client/ClientNavbar';
import { ClientFooter } from '../../components/client/ClientFooter';

interface ClientArtifactsPageProps {
  artifacts: Artifact[];
  onSelectArtifactDetail: (artifactId: string) => void;
  onNavigateHome: () => void;
  onNavigatePage: (page: 'home' | 'rooms' | 'artifacts' | 'guide') => void;
  clientTheme: 'light' | 'dark';
  onToggleClientTheme: () => void;
  onOpenLoginModal: () => void;
  onNavigateAdmin: () => void;
  onOpenQRScanner?: () => void;
}

export const ClientArtifactsPage: React.FC<ClientArtifactsPageProps> = ({
  artifacts,
  onSelectArtifactDetail,
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [only3D, setOnly3D] = useState<boolean>(false);

  // Phân trang chuẩn Dashboard (6 - 9 - 12 - 18 - 24)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9);

  // Reset về trang 1 khi lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, only3D]);

  // Trích xuất các phân loại hiện vật
  const categories = useMemo(() => {
    const set = new Set<string>();
    artifacts.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return Array.from(set);
  }, [artifacts]);

  // Lọc hiện vật theo tìm kiếm, danh mục và trạng thái 3D
  const filteredArtifacts = useMemo(() => {
    return artifacts.filter((a) => {
      const name = localize(a, 'name', a.name).toLowerCase();
      const code = (a.code || '').toLowerCase();
      const desc = localize(a, 'description', a.description || '').toLowerCase();
      const origin = localize(a, 'origin', a.origin || '').toLowerCase();
      const period = localize(a, 'period', a.period || '').toLowerCase();
      const cat = a.category || '';

      const matchSearch =
        !searchQuery ||
        name.includes(searchQuery.toLowerCase()) ||
        code.includes(searchQuery.toLowerCase()) ||
        desc.includes(searchQuery.toLowerCase()) ||
        origin.includes(searchQuery.toLowerCase()) ||
        period.includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === 'all' || cat === selectedCategory;
      const match3D = !only3D || !!a.model3dUrl;

      return matchSearch && matchCategory && match3D;
    });
  }, [artifacts, searchQuery, selectedCategory, only3D, localize]);

  // Phân trang hiện vật
  const paginatedArtifacts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredArtifacts.slice(start, start + pageSize);
  }, [filteredArtifacts, currentPage, pageSize]);

  const getArtifactThumb = (art: Artifact) => {
    const raw = art.thumbnailUrl || (art.images && art.images[0]);
    if (!raw) return '';
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
        activeSection="artifacts"
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
                {t('artifacts.pageTitle', 'Cổ vật 3D')}
              </span>
            </div>

            <span className="client-subpage-badge">
              {t('artifacts.tag', 'Hiện vật & Cổ vật 3D')}
            </span>

            <h1 className="client-subpage-title">
              {t('artifacts.pageHeading', 'Kho hiện vật di sản')}
            </h1>

            <p className="client-subpage-lead">
              {t(
                'artifacts.pageLead',
                'Khám phá bộ sưu tập hiện vật và bảo vật lịch sử được số hóa 3D đa chiều.'
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
                placeholder={t('artifacts.searchPlaceholder', 'Tìm kiếm cổ vật, chất liệu, niên đại...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="client-subpage-filters">
              <button
                type="button"
                className={`client-subpage-filter-btn ${!only3D && selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory('all');
                  setOnly3D(false);
                }}
              >
                <span>{t('common.all', 'Tất cả')} ({artifacts.length})</span>
              </button>

              <button
                type="button"
                className={`client-subpage-filter-btn ${only3D ? 'active' : ''}`}
                onClick={() => setOnly3D((prev) => !prev)}
              >
                <RotateCw size={13} />
                <span>{t('artifacts.only3D', 'Có mô hình 3D xoay')}</span>
              </button>

              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`client-subpage-filter-btn ${selectedCategory === c ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(c)}
                >
                  <span>{c}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Danh sách lưới hiện vật */}
          {filteredArtifacts.length === 0 ? (
            <div className="client-subpage-empty">
              <Box size={40} className="client-empty-icon" />
              <p>{t('artifacts.notFound', 'Không tìm thấy cổ vật phù hợp với điều kiện tìm kiếm.')}</p>
              <button
                type="button"
                className="client-zigzag-btn-primary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setOnly3D(false);
                }}
                style={{ marginTop: 12 }}
              >
                <span>{t('common.resetFilter', 'Đặt lại bộ lọc')}</span>
              </button>
            </div>
          ) : (
            <>
              <div className="client-subpage-grid">
                {paginatedArtifacts.map((art) => {
                  const title = localize(art, 'name', art.name);
                  const period = localize(art, 'period', art.period || '');
                  const category = art.category || 'Cổ vật di sản';
                  const desc = localize(art, 'description', art.description || '');
                  const thumb = getArtifactThumb(art);
                  const has3D = !!art.model3dUrl;

                  return (
                    <div key={art.id} className="client-gallery-card">
                      <div
                        className="client-gallery-media clickable"
                        onClick={() => onSelectArtifactDetail(art.id)}
                        role="button"
                        tabIndex={0}
                      >
                        {thumb ? (
                          <img src={thumb} alt={title} className="client-gallery-img" loading="lazy" />
                        ) : (
                          <div className="client-media-placeholder" style={{ padding: '24px 12px' }}>
                            <div className="client-media-placeholder-icon" style={{ width: 44, height: 44, marginBottom: 8 }}>
                              <Box size={22} strokeWidth={1.5} />
                            </div>
                            <span className="client-media-placeholder-title" style={{ fontSize: 13 }}>Chưa có ảnh</span>
                          </div>
                        )}
                        {has3D ? (
                          <div className="client-zigzag-badge-float" style={{ borderColor: 'rgba(212, 175, 55, 0.7)' }}>
                            <RotateCw size={12} style={{ display: 'inline', marginRight: 4 }} />
                            <span>Mô hình 3D</span>
                          </div>
                        ) : (
                          <div className="client-zigzag-badge-float">
                            <span>{thumb ? 'Hiện vật số hóa' : 'Đang cập nhật'}</span>
                          </div>
                        )}
                      </div>

                      <div className="client-gallery-body">
                        <div className="client-gallery-tags-row">
                          <span className="client-gallery-meta">{category}</span>
                          {period && <span className="client-gallery-period">{period}</span>}
                        </div>

                        <h2 className="client-gallery-title">{title}</h2>
                        {desc && <p className="client-gallery-desc">{desc}</p>}

                        <div className="client-gallery-actions">
                          <button
                            type="button"
                            className="client-zigzag-btn-primary"
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={() => onSelectArtifactDetail(art.id)}
                          >
                            <Box size={15} />
                            <span>{t('artifacts.btnViewDetail', 'Chiêm ngưỡng chi tiết & 3D')}</span>
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
                totalItems={filteredArtifacts.length}
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
                itemLabel={t('artifacts.unit', 'cổ vật')}
              />
            </>
          )}
        </div>
      </main>

      <ClientFooter onNavigatePage={onNavigatePage} />
    </div>
  );
};
