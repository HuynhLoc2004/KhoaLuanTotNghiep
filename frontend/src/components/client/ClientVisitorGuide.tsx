import React, { useState, useEffect } from 'react';
import { MapPin, Sparkles, Image as ImageIcon, ExternalLink } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'simulation' | 'drawing'>('simulation');

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
            {t(branding.guideTitle || 'guide.headline', branding.guideTitle || 'Cẩm Nang & Sơ Đồ Tham Quan Thực Địa')}
          </h2>
          <p className="client-section-lead">
            {t(
              branding.guideDesc || 'guide.sub',
              branding.guideDesc ||
                'Khám phá sơ đồ không gian kiến trúc bảo tàng, định vị các gian trưng bày và tra cứu thông tin phục vụ hành trình tham quan.'
            )}
          </p>
        </div>

        {/* BỐ CỤC ĐÔI: CỘT THÔNG TIN THỰC TẾ & CỘT BẢN ĐỒ MẶT BẰNG */}
        <div className="client-guide-layout-grid reveal-on-scroll">
          {/* CỘT TRÁI: 3 THẺ HƯỚNG DẪN THỰC ĐỊA & NÚT CẨM NANG */}
          <div className="client-guide-cards-col">
            <div className="client-guide-info-tile">
              <div className="client-guide-info-icon">
                <MapPin size={18} style={{ color: '#D4A86A' }} />
              </div>
              <div className="client-guide-info-content">
                <h4>{t('guide.locationTitle', 'Địa chỉ bảo tàng')}</h4>
                <p>Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh.</p>
                <span className="client-guide-info-sub">Khuôn viên Thảo Cầm Viên Sài Gòn</span>
              </div>
            </div>

            <div className="client-guide-info-tile">
              <div className="client-guide-info-icon">
                <Sparkles size={18} style={{ color: '#D4A86A' }} />
              </div>
              <div className="client-guide-info-content">
                <h4>{t('guide.hoursTitle', 'Thời gian mở cửa')}</h4>
                <p>Sáng: 08:00 – 11:30 | Chiều: 13:00 – 17:00</p>
                <span className="client-guide-info-sub">Đón khách từ Thứ Ba đến Chủ Nhật hàng tuần</span>
              </div>
            </div>

            <div className="client-guide-info-tile">
              <div className="client-guide-info-icon">
                <ImageIcon size={18} style={{ color: '#D4A86A' }} />
              </div>
              <div className="client-guide-info-content">
                <h4>{t('guide.amenitiesTitle', 'Dịch vụ tham quan')}</h4>
                <p>Thuyết minh âm thanh số hóa, mã QR tại từng hiện vật & hỗ trợ gửi đồ.</p>
                <span className="client-guide-info-sub">Sẵn sàng phục vụ khách tham quan trong nước & quốc tế</span>
              </div>
            </div>

            {onViewAllGuide && (
              <button
                type="button"
                className="client-guide-full-btn"
                onClick={onViewAllGuide}
              >
                <span>{t(branding.guideCtaText || 'guide.btnViewAll', branding.guideCtaText || 'Xem cẩm nang & bảng giá vé đầy đủ')}</span>
                <span aria-hidden="true">→</span>
              </button>
            )}
          </div>

          {/* CỘT PHẢI: KHUNG SƠ ĐỒ MẶT BẰNG TƯƠNG TÁC */}
          <div
            className="client-guide-map-col clickable"
            onClick={onViewAllGuide}
            role="button"
            tabIndex={0}
            title={t('guide.clickToEnter', 'Bấm để xem cẩm nang & sơ đồ tham quan')}
          >
            {/* 1. THANH TIÊU ĐỀ NỔI PHÍA TRÊN CỘT BẢN ĐỒ */}
            <div className="client-guide-map-topbar">
              <div className="client-guide-map-badge">
                {hasSimulationNodes ? (
                  <>
                    <span className="client-guide-pulse-dot" />
                    <span>
                      {t(
                        'guide.simulatedMapBadge',
                        `Sơ đồ số hóa • ${floorPlan?.nodes?.length || 0} gian phòng`
                      )}
                    </span>
                  </>
                ) : hasMapDrawing ? (
                  <>
                    <ImageIcon size={13} style={{ color: '#D4A86A' }} />
                    <span>{t('guide.drawingBadge', 'Bản vẽ sơ đồ kiến trúc')}</span>
                  </>
                ) : (
                  <span>{t('guide.noMapBadge', 'Chưa có sơ đồ')}</span>
                )}
              </div>

              {/* NÚT CHUYỂN CHẾ ĐỘ XEM: MÔ PHỎNG SVG VS BẢN VẼ GỐC */}
              {hasSimulationNodes && hasMapDrawing && (
                <div
                  className="client-guide-view-toggle"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className={`client-guide-toggle-btn ${viewMode === 'simulation' ? 'active' : ''}`}
                    onClick={() => setViewMode('simulation')}
                    title="Xem sơ đồ số hóa mô phỏng phân tích từ thị giác máy tính"
                  >
                    <span>Mô phỏng</span>
                  </button>
                  <button
                    type="button"
                    className={`client-guide-toggle-btn ${viewMode === 'drawing' ? 'active' : ''}`}
                    onClick={() => setViewMode('drawing')}
                    title="Xem bản vẽ sơ đồ kiến trúc gốc"
                  >
                    <span>Bản vẽ</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. VÙNG KHUNG CANVAS HIỂN THỊ CHÍNH */}
            <div className={`client-guide-map-canvas-frame ${!hasSimulationNodes && !hasMapDrawing ? 'has-placeholder' : ''}`}>
              {hasSimulationNodes && viewMode === 'simulation' ? (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <InteractiveFloorPlanMap
                    floorPlan={floorPlan!}
                    clientTheme="dark"
                    previewMode={true}
                    onSelectRoom360={onSelectRoom360 || onViewAllGuide}
                  />
                </div>
              ) : hasMapDrawing && (viewMode === 'drawing' || !hasSimulationNodes) ? (
                <div className="client-guide-drawing-frame">
                  <img
                    src={mapImageUrl}
                    alt={floorPlan?.title || branding.guideMapTitle || branding.museumName || 'Sơ đồ mặt bằng'}
                    className="client-guide-drawing-img"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="client-media-placeholder">
                  <div className="client-media-placeholder-icon">
                    <MapPin size={32} strokeWidth={1.5} />
                  </div>
                  <span className="client-media-placeholder-title">
                    {t('guide.noMapTitle', 'Chưa bổ sung sơ đồ tham quan')}
                  </span>
                  <span className="client-media-placeholder-desc">
                    {t('guide.noMapDesc', 'Sơ đồ mặt bằng và cẩm nang sẽ hiển thị sau khi quản trị viên cập nhật tại mục Quản lý Trang Cẩm nang & Sơ đồ.')}
                  </span>
                </div>
              )}
            </div>

            {/* 3. THANH THÔNG TIN DƯỚI (BOTTOMBAR - KHÔNG DÙNG EMOJI) */}
            {(hasSimulationNodes || hasMapDrawing) && (
              <div className="client-guide-map-bottombar">
                <span className="client-guide-map-title">
                  {hasSimulationNodes
                    ? (floorPlan?.title || 'Sơ đồ mặt bằng các gian trưng bày')
                    : (floorPlan?.title || branding.guideMapTitle || 'Sơ đồ mặt bằng bảo tàng')}
                </span>
                <span className="client-guide-map-action">
                  <span>{t('guide.clickToExplore', 'Chạm để mở bản đồ chi tiết')}</span>
                  <ExternalLink size={11} />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};


