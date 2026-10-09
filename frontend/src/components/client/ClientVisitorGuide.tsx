import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { api } from '../../services/api';
import { FloorPlanMap } from '../../types';
import { InteractiveFloorPlanMap } from './InteractiveFloorPlanMap';

interface ClientVisitorGuideProps {
  onViewAllGuide?: () => void;
  onSelectRoom360?: (roomId: string) => void;
}

export const ClientVisitorGuide: React.FC<ClientVisitorGuideProps> = ({ onViewAllGuide, onSelectRoom360 }) => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  const [floorPlan, setFloorPlan] = useState<FloorPlanMap | null>(null);

  // Nạp sơ đồ mặt bằng đang active và lắng nghe đồng bộ thời gian thực
  useEffect(() => {
    let isMounted = true;
    const fetchActiveFloorPlan = async () => {
      try {
        const fp = await api.getFloorPlan();
        if (isMounted) {
          setFloorPlan(fp || null);
        }
      } catch {
        if (isMounted) {
          setFloorPlan(null);
        }
      }
    };

    fetchActiveFloorPlan();

    const handleUpdate = () => {
      fetchActiveFloorPlan();
    };

    window.addEventListener('museum:floor_plan_updated', handleUpdate);
    window.addEventListener('museum:branding_updated', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('museum:floor_plan_updated', handleUpdate);
      window.removeEventListener('museum:branding_updated', handleUpdate);
    };
  }, []);

  const hasSimulationNodes = Boolean(floorPlan && floorPlan.nodes && floorPlan.nodes.length > 0);
  const mapImageUrl = floorPlan ? (floorPlan.imageUrl || '') : '';
  const hasMapDrawing = Boolean(mapImageUrl);

  return (
    <section id="guide" className="client-section">
      <div className="client-container">
        {/* TIÊU ĐỀ PHÂN KHU TRUNG TÂM */}
        <div className="client-section-header-centered reveal-on-scroll">
          <span className="client-section-eyebrow">
            {t(branding.guideTag || 'guide.tag', branding.guideTag || 'Kế Hoạch & Sơ Đồ')}
          </span>
          <h2 className="client-section-main-title">
            {t(branding.guideTitle || 'guide.headline', branding.guideTitle || 'Cẩm Nang Tham Quan & Sơ Đồ Thực Địa')}
          </h2>
          <p className="client-section-lead">
            {t(
              branding.guideDesc || 'guide.sub',
              branding.guideDesc ||
                'Thông tin hướng dẫn đón tiếp khách tham quan và định vị các cánh trưng bày trong khuôn viên bảo tàng.'
            )}
          </p>
        </div>

        {/* BỐ CỤC 2 CỘT CÂN ĐỐI: THÔNG BÁO THAM QUAN & SƠ ĐỒ MẶT BẰNG */}
        <div className="client-guide-split-layout reveal-on-scroll">
          {/* CỘT TRÁI: BẢNG THÔNG TIN ĐÓN TIẾP KHÁCH THAM QUAN */}
          <div className="client-guide-notice-card">
            <h3 className="client-guide-notice-heading">
              {t('guide.visitorHeading', 'Thông tin đón tiếp khách tham quan')}
            </h3>

            <div className="client-guide-notice-row">
              <span className="client-guide-notice-label">
                {t('guide.locationLabel', 'Địa chỉ bảo tàng')}
              </span>
              <span className="client-guide-notice-value">
                Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh (Khuôn viên Thảo Cầm Viên)
              </span>
            </div>

            <div className="client-guide-notice-row">
              <span className="client-guide-notice-label">
                {t('guide.hoursLabel', 'Thời gian mở cửa')}
              </span>
              <span className="client-guide-notice-value">
                Sáng: 08:00 – 11:30 | Chiều: 13:00 – 17:00 (Từ Thứ Ba đến Chủ Nhật hàng tuần)
              </span>
            </div>

            <div className="client-guide-notice-row">
              <span className="client-guide-notice-label">
                {t('guide.amenitiesLabel', 'Dịch vụ & Tiện ích')}
              </span>
              <span className="client-guide-notice-value">
                Thuyết minh Audio Guide đa ngôn ngữ, mã QR chú thích hiện vật & dịch vụ gửi đồ tại sảnh
              </span>
            </div>

            {onViewAllGuide && (
              <div style={{ marginTop: 10 }}>
                <button
                  type="button"
                  className="client-intro-btn"
                  onClick={onViewAllGuide}
                >
                  {t(branding.guideCtaText || 'guide.btnViewAll', branding.guideCtaText || 'Xem cẩm nang tham quan & bảng giá vé đầy đủ →')}
                </button>
              </div>
            )}
          </div>

          {/* CỘT PHẢI: KHUNG HIỂN THỊ SƠ ĐỒ MẶT BẰNG */}
          <div
            className="client-guide-map-display"
            onClick={onViewAllGuide}
            role="button"
            tabIndex={0}
            title={t('guide.clickToEnter', 'Bấm để mở sơ đồ tham quan chi tiết')}
          >
            <div className="client-guide-map-viewport">
              {hasSimulationNodes ? (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <InteractiveFloorPlanMap
                    floorPlan={floorPlan!}
                    clientTheme="dark"
                    previewMode={true}
                    onSelectRoom360={onSelectRoom360 || onViewAllGuide}
                  />
                </div>
              ) : hasMapDrawing ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img
                    src={mapImageUrl}
                    alt={floorPlan?.title || 'Sơ đồ mặt bằng'}
                    style={{ maxWidth: '92%', maxHeight: '92%', objectFit: 'contain' }}
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="client-media-placeholder">
                  <span className="client-media-placeholder-title">
                    {t('guide.noMapTitle', 'Đang cập nhật sơ đồ tham quan')}
                  </span>
                </div>
              )}
            </div>

            <div className="client-guide-map-footer">
              <span>
                {floorPlan?.title || t('guide.mapFooterTitle', 'Sơ đồ mặt bằng các gian trưng bày bảo tàng')}
              </span>
              <span className="client-guide-map-link">
                <span>{t('guide.openFullMap', 'Mở sơ đồ chi tiết')}</span>
                <ExternalLink size={12} style={{ display: 'inline', marginLeft: 4 }} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
