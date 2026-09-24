import React, { useState, useEffect } from 'react';
import { ArrowLeft, Maximize2, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
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
          {/* Breadcrumb & Tiêu đề trang */}
          <div className="client-subpage-hero" style={{ maxWidth: 880, margin: '0 auto clamp(36px, 4vw, 54px) auto', textAlign: 'center' }}>
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
                {t('guide.pageTitle', 'Cẩm nang & Sơ đồ tham quan')}
              </span>
            </div>

            <span className="client-zigzag-tag">
              {t('guide.tag', 'Lộ Trình & Kế Hoạch Tham Quan Thực Địa')}
            </span>

            <h1 className="client-subpage-title" style={{ fontSize: 'clamp(2.1rem, 3.2vw, 3rem)' }}>
              {t('guide.pageHeading', 'Sơ Đồ Mặt Bằng & Cẩm Nang Tham Quan')}
            </h1>

            <p className="client-subpage-lead" style={{ margin: '0 auto', fontSize: '1rem', lineHeight: 1.75 }}>
              {t(
                'guide.pageLead',
                'Khám phá sơ đồ không gian kiến trúc bảo tàng, định vị các cánh trưng bày và trang bị đầy đủ thông tin biểu phí, giờ mở cửa cùng các tiện ích tương tác số hóa tại điểm.'
              )}
            </p>
          </div>

          {/* =========================================================================
              PHẦN 1: TÂM ĐIỂM SƠ ĐỒ MẶT BẰNG BẢO TÀNG (MUSEUM FLOOR PLAN SHOWCASE)
              Hỗ trợ nạp động ảnh do Admin upload từ server
              ========================================================================= */}
          <section className="client-guide-floorplan-showcase">
            <div className="client-guide-floorplan-header">
              <div>
                <span className="client-zigzag-tag" style={{ marginBottom: 6 }}>
                  Sơ Đồ Không Gian Kiến Trúc
                </span>
                <h2 className="client-guide-floorplan-title">
                  {branding.guideMapTitle || 'Sơ Đồ Mặt Bằng & Lộ Trình Tham Quan'}
                </h2>
                <p className="client-guide-floorplan-desc">
                  {branding.guideMapDesc ||
                    'Bản đồ vị trí các cánh trưng bày, sảnh tiếp đón và lối vào khuôn viên Bảo tàng Lịch sử TP.HCM'}
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

            {/* Khung hiển thị Bản đồ mặt bằng & Mạng Topo Thông phòng do Server Phân Tích */}
            <div style={{ marginTop: 24, marginBottom: 36 }}>
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
                    background: '#0B0F17',
                    borderRadius: 16,
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    color: '#94A3B8'
                  }}
                >
                  <div style={{ fontSize: 13, color: '#D4AF37', marginBottom: 6 }}>
                    Đang đồng bộ mạng liên kết không gian từ máy chủ...
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

            {/* Danh sách các phân khu trưng bày tương ứng với các gian phòng 360° */}
            <div className="client-guide-wings-grid">
              {(floorPlan && floorPlan.nodes.filter(n => !n.isEntrance).length > 0
                ? floorPlan.nodes.filter(n => !n.isEntrance).slice(0, 4).map(node => ({
                    code: node.code,
                    title: node.name,
                    desc: node.category || 'Gian trưng bày hiện vật lịch sử theo tiến trình thời gian',
                    period: node.period || 'Hiện vật & Văn hóa',
                    roomId: node.roomId
                  }))
                : museumWings
              ).map((w: any) => (
                <div key={w.code} className="client-guide-wing-card">
                  <div className="client-guide-wing-header">
                    <span className="client-guide-wing-badge">{w.code}</span>
                    <span className="client-guide-wing-period">{w.period}</span>
                  </div>
                  <h3 className="client-guide-wing-title">{w.title}</h3>
                  <p className="client-guide-wing-desc">{w.desc}</p>
                  <button
                    type="button"
                    className="client-guide-wing-btn"
                    onClick={() => {
                      if (w.roomId && onSelectRoom360) {
                        onSelectRoom360(w.roomId);
                      } else {
                        onNavigatePage('rooms');
                      }
                    }}
                  >
                    Xem gian phòng 360° →
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* =========================================================================
              PHẦN 2: THÔNG TIN VÉ & GIỜ ĐÓN TIẾP (2 CỘT CÂN XỨNG)
              ========================================================================= */}
          <div className="client-guide-two-col-grid" style={{ marginTop: 48 }}>
            {/* Cột 1: Giờ mở cửa */}
            <div className="client-guide-feature-card">
              <span className="client-zigzag-tag">Kế Hoạch Tham Quan</span>
              <h2 className="client-guide-feature-title">Thời Gian Mở Cửa Đón Khách</h2>
              
              <div className="client-guide-status-row">
                <span className="client-guide-status-pill">
                  Đón khách: Thứ Ba – Chủ Nhật
                </span>
                <span className="client-guide-status-note">Nghỉ Thứ Hai hàng tuần</span>
              </div>

              <div className="client-guide-hours-box">
                <div className="client-guide-hour-item">
                  <span className="client-guide-hour-label">Buổi Sáng</span>
                  <strong className="client-guide-hour-val">08:00 – 11:30</strong>
                </div>
                <div className="client-guide-hour-sep">•</div>
                <div className="client-guide-hour-item">
                  <span className="client-guide-hour-label">Buổi Chiều</span>
                  <strong className="client-guide-hour-val">13:30 – 17:00</strong>
                </div>
              </div>

              <div className="client-guide-card-footer-note">
                * Quầy vé ngừng phát hành vé và đón khách mới trước giờ đóng cửa 30 phút. Bảo tàng đóng cửa ngày Thứ Hai để thực hiện công tác bảo tồn hiện vật.
              </div>
            </div>

            {/* Cột 2: Biểu phí vé */}
            <div className="client-guide-feature-card">
              <span className="client-zigzag-tag">Biểu Phí Niêm Yết</span>
              <h2 className="client-guide-feature-title">Chính Sách Vé Tham Quan</h2>

              <div className="client-guide-ticket-list">
                <div className="client-guide-ticket-item">
                  <div>
                    <strong>Khách người lớn</strong>
                    <div className="client-guide-ticket-sub">Áp dụng cho khách Việt Nam & Quốc tế</div>
                  </div>
                  <div className="client-guide-ticket-price">30.000 VNĐ / vé</div>
                </div>

                <div className="client-guide-ticket-item">
                  <div>
                    <strong>Học sinh, Sinh viên</strong>
                    <div className="client-guide-ticket-sub">Yêu cầu xuất trình thẻ HSSV còn hạn</div>
                  </div>
                  <div className="client-guide-ticket-price highlight">Ưu đãi 50% (15.000 VNĐ)</div>
                </div>

                <div className="client-guide-ticket-item">
                  <div>
                    <strong>Người cao tuổi & Trẻ em dưới 6 tuổi</strong>
                    <div className="client-guide-ticket-sub">Người khuyết tật và các đối tượng chính sách</div>
                  </div>
                  <div className="client-guide-ticket-price highlight">Miễn phí hoàn toàn</div>
                </div>
              </div>

              <div className="client-guide-card-footer-note">
                * Đăng ký hướng dẫn viên đoàn thuyết minh: Vui lòng liên hệ quầy tiếp đón tại sảnh Bát Giác trước 24 giờ.
              </div>
            </div>
          </div>

          {/* =========================================================================
              PHẦN 3: ĐƯỜNG ĐI & TIỆN ÍCH TRẢI NGHIỆM SỐ TẠI ĐIỂM (2 CỘT CÂN XỨNG)
              ========================================================================= */}
          <div className="client-guide-two-col-grid" style={{ marginTop: 28, marginBottom: 60 }}>
            {/* Cột 1: Vị trí & Di chuyển */}
            <div className="client-guide-feature-card">
              <span className="client-zigzag-tag">Vị Trí & Chỉ Dẫn</span>
              <h2 className="client-guide-feature-title">Đường Đi & Bãi Gửi Xe</h2>

              <p className="client-guide-feature-desc" style={{ marginBottom: 16 }}>
                <strong>{address}</strong> (Cổng chính đối diện Thảo Cầm Viên Sài Gòn).
              </p>

              <div className="client-guide-info-rows">
                <div className="client-guide-info-row">
                  <span className="client-guide-info-key">Xe Buýt:</span>
                  <span>Các tuyến 05, 06, 14, 19, 52 dừng ngay cổng đường Nguyễn Bỉnh Khiêm.</span>
                </div>
                <div className="client-guide-info-row">
                  <span className="client-guide-info-key">Bãi Đỗ Xe:</span>
                  <span>Có bãi gửi xe máy và bãi đỗ ô tô thuận tiện ngay trong khuôn viên bảo tàng.</span>
                </div>
                <div className="client-guide-info-row">
                  <span className="client-guide-info-key">Hotline:</span>
                  <strong style={{ color: 'var(--c-text-primary)' }}>{hotline}</strong>
                </div>
              </div>

              <div style={{ marginTop: 22 }}>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="client-zigzag-btn-primary"
                  style={{ textDecoration: 'none', display: 'inline-flex' }}
                >
                  <span>Chỉ đường trên Google Maps</span>
                </a>
              </div>
            </div>

            {/* Cột 2: Tiện ích số hóa tại điểm */}
            <div className="client-guide-feature-card">
              <span className="client-zigzag-tag">Trải Nghiệm Số Tại Điểm</span>
              <h2 className="client-guide-feature-title">Tiện Ích Số Hóa Cho Khách Tham Quan</h2>

              <p className="client-guide-feature-desc" style={{ marginBottom: 16 }}>
                Bảo tàng Lịch sử TP.HCM tích hợp hệ thống tương tác số hóa trực tiếp trên thiết bị cá nhân của bạn:
              </p>

              <div className="client-guide-perks-list">
                <div className="client-guide-perk-item">
                  <strong>Quét mã QR tại tủ hiện vật</strong>
                  <span>Mỗi tủ kính đều có mã QR tra cứu mô hình 3D xoay 360° và hồ sơ khảo cứu chi tiết.</span>
                </div>
                <div className="client-guide-perk-item">
                  <strong>Thuyết minh tự động (Audio Guide song ngữ)</strong>
                  <span>Nghe giọng đọc thuyết minh truyền cảm bằng tiếng Việt và tiếng Anh ngay trên trình duyệt điện thoại.</span>
                </div>
                <div className="client-guide-perk-item">
                  <strong>Wi-Fi di sản tốc độ cao miễn phí</strong>
                  <span>Hệ thống mạng không dây phủ sóng toàn bộ các gian trưng bày và sân vườn.</span>
                </div>
              </div>
            </div>
          </div>
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

