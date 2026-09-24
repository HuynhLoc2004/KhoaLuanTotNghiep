import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Clock, Ticket, MapPin, Maximize2, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { ClientNavbar } from '../../components/client/ClientNavbar';
import { ClientFooter } from '../../components/client/ClientFooter';
import { InteractiveFloorPlanMap } from '../../components/client/InteractiveFloorPlanMap';
import { API_ROOT, api } from '../../services/api';
import { FloorPlanMap } from '../../types';

interface ClientGuidePageProps {
  onNavigateHome: () => void;
  onNavigatePage: (page: 'home' | 'rooms' | 'artifacts' | 'guide') => void;
  clientTheme: 'light' | 'dark';
  onToggleClientTheme: () => void;
  onOpenLoginModal: () => void;
  onNavigateAdmin: () => void;
  onSelectRoom360?: (roomId: string) => void;
  onOpenQRScanner?: () => void;
}

export const ClientGuidePage: React.FC<ClientGuidePageProps> = ({
  onNavigateHome,
  onNavigatePage,
  clientTheme,
  onToggleClientTheme,
  onOpenLoginModal,
  onNavigateAdmin,
  onSelectRoom360,
  onOpenQRScanner
}) => {
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  const address = branding.address || 'Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh';
  const hotline = branding.hotline || '(028) 3829 8146';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  // Quản lý Modal Lightbox phóng to sơ đồ mặt bằng
  const [isMapLightboxOpen, setIsMapLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Dữ liệu Sơ đồ mặt bằng & Mạng Topo Không gian thực tế từ CSDL
  const [floorPlan, setFloorPlan] = useState<FloorPlanMap | null>(null);
  const [loadingFloorPlan, setLoadingFloorPlan] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    api.getFloorPlan()
      .then((data) => {
        if (isMounted && data) {
          setFloorPlan(data);
        }
      })
      .catch((err) => {
        console.warn('[ClientGuidePage] Không tải được sơ đồ mặt bằng:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingFloorPlan(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Đường dẫn sơ đồ mặt bằng: Ưu tiên ảnh do Admin upload từ server
  const serverMapUrl = branding.guideMapUrl
    ? branding.guideMapUrl.startsWith('http')
      ? branding.guideMapUrl
      : `${API_ROOT}${branding.guideMapUrl.startsWith('/') ? '' : '/'}${branding.guideMapUrl}`
    : '';

  // Phân khu trưng bày gắn liền với lộ trình tham quan thực địa
  const museumWings = [
    {
      code: 'KHU A',
      title: 'Thời Tiền Sử & Khởi Nguồn Dân Tộc',
      desc: 'Công cụ đá, đồ đồng Đông Sơn và dấu tích người cổ trên đất Việt.',
      period: 'Thời Tiền Sử – Thế kỷ X'
    },
    {
      code: 'KHU B',
      title: 'Văn Hóa Óc Eo & Vương Quốc Phù Nam',
      desc: 'Cổ vật khảo cổ Nam Bộ, tượng thờ bằng gỗ và trang sức vàng cổ.',
      period: 'Thế kỷ I – Thế kỷ VII'
    },
    {
      code: 'KHU C',
      title: 'Nghệ Thuật Điêu Khắc Chăm Pa',
      desc: 'Kiệt tác tượng đá phù điêu thần Shiva, Ganesha và bia ký cổ.',
      period: 'Thế kỷ VII – Thế kỷ XVII'
    },
    {
      code: 'KHU D',
      title: 'Di Sản Mỹ Thuật Cung Đình Triều Nguyễn',
      desc: 'Trang phục hoàng gia, kim ấn, súng thần công và đồ sứ ngự dụng.',
      period: 'Năm 1802 – 1945'
    }
  ];

  return (
    <div className="client-portal" data-client-theme={clientTheme}>
      <ClientNavbar
        clientTheme={clientTheme}
        onToggleClientTheme={onToggleClientTheme}
        onOpenLoginModal={onOpenLoginModal}
        onNavigateAdmin={onNavigateAdmin}
        activeSection="guide"
        onNavigatePage={onNavigatePage}
        onOpenQRScanner={onOpenQRScanner}
      />

      <main className="client-subpage">
        <div className="client-container">
          {/* Tiêu đề trang - Tinh gọn, uy nghiêm, không rườm rà */}
          <div className="client-subpage-hero" style={{ maxWidth: 840, margin: '0 auto clamp(28px, 3.5vw, 44px) auto', textAlign: 'center' }}>
            <div className="client-subpage-breadcrumb" style={{ justifyContent: 'center' }}>
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
                {t('guide.pageTitle', 'Cẩm nang tham quan')}
              </span>
            </div>

            <h1 className="client-subpage-title" style={{ fontSize: 'clamp(2rem, 3.2vw, 2.75rem)', letterSpacing: '-0.02em', margin: '14px 0 10px 0' }}>
              {t('guide.pageHeading', 'Cẩm Nang & Sơ Đồ Tham Quan')}
            </h1>

            <p className="client-subpage-lead" style={{ margin: '0 auto', fontSize: '1.02rem', lineHeight: 1.7, color: 'var(--c-text-secondary)', maxWidth: 680 }}>
              {t(
                'guide.pageLead',
                'Thông tin chính thức về thời gian mở cửa, biểu phí vé, hướng dẫn di chuyển và sơ đồ liên kết các gian trưng bày tại Bảo tàng Lịch sử TP. Hồ Chí Minh.'
              )}
            </p>
          </div>

          {/* =========================================================================
              PHẦN 1: THÔNG TIN THIẾT YẾU CHO KHÁCH THAM QUAN (3 CỘT TRỰC QUAN, RÕ RÀNG)
              Tập trung đúng trọng tâm: Giờ mở cửa, Giá vé, Vị trí & Di chuyển
              ========================================================================= */}
          <section className="client-guide-essentials-section" style={{ marginBottom: 40 }}>
            <div className="client-guide-essentials-grid">
              {/* Cột 1: Giờ mở cửa */}
              <div className="client-guide-essential-card">
                <div className="client-guide-essential-header">
                  <div className="client-guide-essential-icon">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="client-guide-essential-title">Giờ Mở Cửa</h3>
                    <span className="client-guide-essential-badge open">Thứ Ba – Chủ Nhật</span>
                  </div>
                </div>

                <div className="client-guide-essential-body">
                  <div className="client-guide-hours-display">
                    <div className="client-guide-hour-slot">
                      <span className="client-guide-hour-period">Sáng</span>
                      <strong className="client-guide-hour-time">08:00 – 11:30</strong>
                    </div>
                    <div className="client-guide-hour-divider" />
                    <div className="client-guide-hour-slot">
                      <span className="client-guide-hour-period">Chiều</span>
                      <strong className="client-guide-hour-time">13:30 – 17:00</strong>
                    </div>
                  </div>

                  <ul className="client-guide-essential-list">
                    <li>
                      <span className="bullet">•</span>
                      <span><strong>Thứ Hai:</strong> Đóng cửa định kỳ để bảo quản hiện vật.</span>
                    </li>
                    <li>
                      <span className="bullet">•</span>
                      <span>Quầy vé ngưng nhận khách trước giờ đóng cửa 30 phút.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Cột 2: Bảng giá vé niêm yết */}
              <div className="client-guide-essential-card">
                <div className="client-guide-essential-header">
                  <div className="client-guide-essential-icon">
                    <Ticket size={18} />
                  </div>
                  <div>
                    <h3 className="client-guide-essential-title">Giá Vé Niêm Yết</h3>
                    <span className="client-guide-essential-badge neutral">Quy định hiện hành</span>
                  </div>
                </div>

                <div className="client-guide-essential-body">
                  <div className="client-guide-price-rows">
                    <div className="client-guide-price-row">
                      <div className="client-guide-price-target">
                        <strong>Người lớn</strong>
                        <span>Khách Việt Nam & Quốc tế</span>
                      </div>
                      <div className="client-guide-price-amount">30.000 ₫</div>
                    </div>

                    <div className="client-guide-price-row highlight">
                      <div className="client-guide-price-target">
                        <strong>Học sinh, Sinh viên</strong>
                        <span>Xuất trình thẻ HSSV còn hạn</span>
                      </div>
                      <div className="client-guide-price-amount gold">15.000 ₫</div>
                    </div>

                    <div className="client-guide-price-row free">
                      <div className="client-guide-price-target">
                        <strong>Trẻ em &lt; 6 tuổi, Người cao tuổi</strong>
                        <span>Người khuyết tật, diện chính sách</span>
                      </div>
                      <div className="client-guide-price-amount free-badge">Miễn phí</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột 3: Vị trí & Hướng dẫn đi lại */}
              <div className="client-guide-essential-card">
                <div className="client-guide-essential-header">
                  <div className="client-guide-essential-icon">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="client-guide-essential-title">Vị Trí & Di Chuyển</h3>
                    <span className="client-guide-essential-badge neutral">Quận 1, TP.HCM</span>
                  </div>
                </div>

                <div className="client-guide-essential-body">
                  <p className="client-guide-address-text">
                    <strong>{address}</strong>
                    <br />
                    <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                      (Cổng chính đối diện Thảo Cầm Viên Sài Gòn)
                    </span>
                  </p>

                  <ul className="client-guide-essential-list" style={{ marginBottom: 16 }}>
                    <li>
                      <span className="bullet">•</span>
                      <span><strong>Xe buýt:</strong> Tuyến 05, 06, 14, 19, 52 dừng ngay cổng đường Nguyễn Bỉnh Khiêm.</span>
                    </li>
                    <li>
                      <span className="bullet">•</span>
                      <span><strong>Gửi xe:</strong> Bãi đỗ xe máy và ô tô thuận tiện ngay trong sân bảo tàng.</span>
                    </li>
                    <li>
                      <span className="bullet">•</span>
                      <span><strong>Hotline:</strong> <strong style={{ color: '#F8FAFC' }}>{hotline}</strong></span>
                    </li>
                  </ul>

                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="client-guide-maps-btn"
                  >
                    <span>Mở chỉ đường Google Maps</span>
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================================
              PHẦN 2: TÂM ĐIỂM SƠ ĐỒ MẶT BẰNG BẢO TÀNG (MUSEUM FLOOR PLAN SHOWCASE)
              Sạch sẽ, trực quan, không lặp lại các card thừa
              ========================================================================= */}
          <section className="client-guide-floorplan-showcase" style={{ marginBottom: 44 }}>
            <div className="client-guide-floorplan-header">
              <div>
                <h2 className="client-guide-floorplan-title" style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.85rem)' }}>
                  {branding.guideMapTitle || 'Sơ Đồ Mặt Bằng & Vị Trí Các Gian Trưng Bày'}
                </h2>
                <p className="client-guide-floorplan-desc" style={{ maxWidth: 720 }}>
                  {branding.guideMapDesc ||
                    'Chọn từng gian phòng trên sơ đồ để tra cứu tên hiện vật, quan sát hướng đi và các lối thông phòng liên kết thực tế.'}
                </p>
              </div>

              <div className="client-guide-floorplan-actions">
                <button
                  type="button"
                  className="client-zigzag-btn-primary"
                  onClick={() => {
                    setZoomLevel(1);
                    setIsMapLightboxOpen(true);
                  }}
                  title="Mở toàn màn hình để xem chi tiết từng phòng"
                >
                  <Maximize2 size={15} />
                  <span>Phóng to sơ đồ</span>
                </button>
              </div>
            </div>

            {/* Khung hiển thị Bản đồ mặt bằng & Mạng Topo Thông phòng */}
            <div style={{ marginTop: 20 }}>
              {floorPlan ? (
                <InteractiveFloorPlanMap
                  floorPlan={floorPlan}
                  onSelectRoom360={onSelectRoom360}
                  clientTheme={clientTheme}
                />
              ) : loadingFloorPlan ? (
                <div
                  style={{
                    padding: '60px 20px',
                    textAlign: 'center',
                    background: '#0D111A',
                    borderRadius: 14,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#94A3B8'
                  }}
                >
                  <div style={{ fontSize: 13, color: '#D4AF37', marginBottom: 6 }}>
                    Đang nạp sơ đồ mặt bằng từ máy chủ...
                  </div>
                </div>
              ) : serverMapUrl ? (
                <div
                  className="client-guide-map-stage"
                  onClick={() => {
                    setZoomLevel(1);
                    setIsMapLightboxOpen(true);
                  }}
                  role="button"
                  tabIndex={0}
                  title="Bấm để phóng to sơ đồ chi tiết"
                >
                  <img
                    src={serverMapUrl}
                    alt={branding.guideMapTitle || 'Sơ đồ mặt bằng bảo tàng'}
                    className="client-guide-map-img"
                    loading="lazy"
                  />
                </div>
              ) : null}
            </div>
          </section>

          {/* =========================================================================
              PHẦN 3: LƯU Ý & TIỆN ÍCH DÀNH CHO KHÁCH THAM QUAN
              Dải 4 tiện ích ngang tinh tế, thực tế, dễ đọc
              ========================================================================= */}
          <section className="client-guide-amenities-section" style={{ marginBottom: 60 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--c-text-primary)', marginBottom: 16 }}>
              Tiện Ích & Quy Định Tham Quan
            </h3>

            <div className="client-guide-amenities-grid">
              <div className="client-guide-amenity-card">
                <div className="client-guide-amenity-num">01</div>
                <h4>Quét mã QR tại tủ hiện vật</h4>
                <p>Mỗi tủ trưng bày đều trang bị mã QR để mở mô hình 3D xoay 360° và hồ sơ khảo cứu chi tiết ngay trên điện thoại.</p>
              </div>

              <div className="client-guide-amenity-card">
                <div className="client-guide-amenity-num">02</div>
                <h4>Thuyết minh Audio Guide song ngữ</h4>
                <p>Khách tham quan có thể nghe giọng đọc thuyết minh tự động bằng tiếng Việt hoặc tiếng Anh trực tiếp trên trình duyệt.</p>
              </div>

              <div className="client-guide-amenity-card">
                <div className="client-guide-amenity-num">03</div>
                <h4>Bảo quản di sản & Hiện vật</h4>
                <p>Vui lòng không chạm tay vào hiện vật, không sử dụng đèn flash khi chụp ảnh tại các gian trưng bày cổ vật nhạy cảm.</p>
              </div>

              <div className="client-guide-amenity-card">
                <div className="client-guide-amenity-num">04</div>
                <h4>Trang phục & Văn minh tham quan</h4>
                <p>Trang phục lịch sự, giữ trật tự chung trong không gian trưng bày. Trẻ em dưới 12 tuổi cần có người lớn đi kèm.</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* =========================================================================
          MODAL LIGHTBOX: PHÓNG TO SƠ ĐỒ MẶT BẰNG TOÀN CẢNH
          ========================================================================= */}
      {isMapLightboxOpen && (
        <div
          className="client-guide-lightbox-overlay"
          onClick={() => setIsMapLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="client-guide-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header thanh điều khiển */}
            <div className="client-guide-lightbox-header">
              <div>
                <h3 className="client-guide-lightbox-title">
                  {branding.guideMapTitle || 'Sơ Đồ Mặt Bằng & Không Gian Trưng Bày'}
                </h3>
                <span className="client-guide-lightbox-sub">
                  Bảo tàng Lịch sử TP. Hồ Chí Minh • {address}
                </span>
              </div>

              <div className="client-guide-lightbox-controls">
                <button
                  type="button"
                  className="client-guide-ctrl-btn"
                  onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5))}
                  title="Phóng to"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  type="button"
                  className="client-guide-ctrl-btn"
                  onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75))}
                  title="Thu nhỏ"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  type="button"
                  className="client-guide-ctrl-btn"
                  onClick={() => setZoomLevel(1)}
                  title="Đặt lại kích thước"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  type="button"
                  className="client-guide-ctrl-btn close"
                  onClick={() => setIsMapLightboxOpen(false)}
                  title="Đóng (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Vùng hiển thị ảnh có thể zoom */}
            <div className="client-guide-lightbox-body">
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transition: 'transform 0.2s ease',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                {serverMapUrl ? (
                  <img
                    src={serverMapUrl}
                    alt={branding.guideMapTitle || 'Sơ đồ mặt bằng chi tiết'}
                    style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }}
                  />
                ) : floorPlan ? (
                  <div style={{ width: '100%', maxWidth: 960 }}>
                    <InteractiveFloorPlanMap
                      floorPlan={floorPlan}
                      onSelectRoom360={(roomId) => {
                        setIsMapLightboxOpen(false);
                        if (onSelectRoom360) onSelectRoom360(roomId);
                      }}
                      clientTheme={clientTheme}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      <ClientFooter onNavigatePage={onNavigatePage} />
    </div>
  );
};

