import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useClientTranslation } from '../context/ClientTranslationContext';

export const DEFAULT_PAGE_SIZE_OPTIONS = [6, 9, 12, 18, 24];

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (newSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  itemLabel?: string;
  hideOnSinglePage?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className = '',
  itemLabel,
  hideOnSinglePage = false
}) => {
  const { t } = useClientTranslation();
  const label = itemLabel || t('common.items') || 'mục';
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems <= 0) return null;
  if (hideOnSinglePage && totalPages <= 1) return null;

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Tính danh sách các trang cần hiển thị
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={`pagination-container ${className}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div className="pagination-info">
          {t('pagination.showing')} <strong>{startItem}</strong> - <strong>{endItem}</strong> {t('pagination.of')} <strong>{totalItems}</strong> {label}
        </div>

        {onPageSizeChange && (
          <div className="pagination-size-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('pagination.perPage')}</span>
            <select
              className="pagination-size-select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label={t('pagination.perPage')}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} {t('pagination.unit')}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-btn nav-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label={t('pagination.prev')}
        >
          <ChevronLeft size={16} />
          <span className="pagination-btn-label">{t('pagination.prev')}</span>
        </button>

        <div className="pagination-pages">
          {getPageNumbers().map((page, idx) =>
            typeof page === 'number' ? (
              <button
                key={idx}
                type="button"
                className={`pagination-btn page-btn ${page === currentPage ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ) : (
              <span key={idx} className="pagination-ellipsis">
                {page}
              </span>
            )
          )}
        </div>

        <button
          type="button"
          className="pagination-btn nav-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label={t('pagination.next')}
        >
          <span className="pagination-btn-label">{t('pagination.next')}</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
