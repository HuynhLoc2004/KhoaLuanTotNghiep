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
    <section id="guide" className="client-zigzag-section">
      <div className="client-container">
        {/* ZIG-ZAG 4: NỘI DUNG BÊN TRÁI - MEDIA SƠ ĐỒ BÊN PHẢI */}
        <div className="client-zigzag-card horizontal-split reverse-columns align-left reveal-on-scroll">
          {/* CỘT MEDIA SƠ ĐỒ MẶT BẰNG */}
          <div
            className="client-zigzag-card-media"
            onClick={onViewAllGuide}
            role="button"
            tabIndex={0}
            title={t('guide.clickToEnter', 'Bấm để mở sơ đồ tham quan chi tiết')}
            style={{ cursor: 'pointer', minHeight: '460px', height: '100%' }}
          >
            <div className="client-guide-map-topbar">
              <div className="client-guide-map-badge">
                <span className="client-guide-pulse-dot" />
                <span>{t('guide.realtimeMapBadge', 'Sơ đồ định vị số hóa')}</span>
              </div>
            </div>

            <div className="client-guide-map-canvas">
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
                <div className="client-guide-drawing-frame">
                  <img
                    src={mapImageUrl}
                    alt={floorPlan?.title || 'Sơ đồ mặt bằng'}
                    className="client-guide-drawing-img"
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

            <div className="client-guide-map-bottombar">
              <span className="client-guide-map-title">
                {floorPlan?.title || t('guide.mapFooterTitle', 'Sơ đồ mặt bằng các gian trưng bày')}
              </span>
              <span className="client-guide-map-action">
                <span>{t('guide.openFullMap', 'Mở sơ đồ chi tiết')}</span>
                <ExternalLink size={12} />
              </span>
            </div>
          </div>

          {/* CỘT NỘI DUNG THÔNG TIN ĐÓN TIẾP KHÁCH */}
          <div className="client-zigzag-card-body">
            <span className="client-zigzag-tag">
              {t(branding.guideTag || 'guide.tag', branding.guideTag || 'Kế Hoạch & Sơ Đồ')}
            </span>

            <h2 className="client-zigzag-title">
              {t(branding.guideTitle || 'guide.headline', branding.guideTitle || 'Cẩm Nang Tham Quan & Sơ Đồ Thực Địa')}
            </h2>

            <p className="client-zigzag-desc">
              {t(
                branding.guideDesc || 'guide.sub',
                branding.guideDesc ||
                  'Thông tin hướng dẫn đón tiếp khách tham quan và định vị các cánh trưng bày trong khuôn viên bảo tàng.'
              )}
            </p>

            {/* DÒNG THÔNG TIN ĐÓN TIẾP KHÁCH THAM QUAN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '12px 0 24px 0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontSize: '0.88rem' }}>
                <span style={{ color: '#D4A86A', fontWeight: 600, flexShrink: 0, minWidth: 80 }}>
                  {t('guide.locationLabel', 'Địa chỉ:')}
                </span>
                <span style={{ color: '#E2E8F0', lineHeight: 1.5 }}>
                  Số 2 Nguyễn Bỉnh Khiêm, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontSize: '0.88rem' }}>
                <span style={{ color: '#D4A86A', fontWeight: 600, flexShrink: 0, minWidth: 80 }}>
                  {t('guide.hoursLabel', 'Mở cửa:')}
                </span>
                <span style={{ color: '#E2E8F0', lineHeight: 1.5 }}>
                  08:00 – 11:30 | 13:00 – 17:00 (Thứ Ba – Chủ Nhật hàng tuần)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontSize: '0.88rem' }}>
                <span style={{ color: '#D4A86A', fontWeight: 600, flexShrink: 0, minWidth: 80 }}>
                  {t('guide.amenitiesLabel', 'Tiện ích:')}
                </span>
                <span style={{ color: '#9CA3AF', lineHeight: 1.5 }}>
                  Thuyết minh Audio Guide đa ngôn ngữ, mã QR chú thích hiện vật & gửi đồ miễn phí
                </span>
              </div>
            </div>

            {/* NÚT HÀNH ĐỘNG DUY NHẤT */}
            {onViewAllGuide && (
              <div className="client-zigzag-actions">
                <button
                  type="button"
                  className="client-zigzag-btn-primary"
                  onClick={onViewAllGuide}
                >
                  {t(branding.guideCtaText || 'guide.btnViewAll', branding.guideCtaText || 'Xem cẩm nang tham quan & sơ đồ')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
