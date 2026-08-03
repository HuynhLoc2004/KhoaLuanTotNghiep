import { heritageTheme } from "@hcmc-museum/ui";

export function renderHeader(): string {
  return `
    <header id="main-header" style="position: sticky; top: 0; z-index: 100; background: ${heritageTheme.glassmorphism.background}; backdrop-filter: ${heritageTheme.glassmorphism.backdropFilter}; border-bottom: ${heritageTheme.glassmorphism.border}; padding: 0.875rem 1.5rem;">
      <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
        <a id="nav-brand" href="/" style="display: flex; align-items: center; gap: 0.75rem; text-decoration: none; color: ${heritageTheme.colors.textPrimary};">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: ${heritageTheme.colors.primaryRed}; border: 1px solid ${heritageTheme.colors.accentGold}; display: flex; align-items: center; justify-content: center; font-weight: bold; color: ${heritageTheme.colors.accentGold};">BT</div>
          <span style="font-family: ${heritageTheme.typography.fontFamilyHeading}; font-weight: bold; font-size: ${heritageTheme.typography.sizes.lg}; letter-spacing: 0.5px;">BẢO TÀNG LỊCH SỬ TP.HCM</span>
        </a>
        <nav id="main-nav" style="display: flex; gap: 1.5rem; align-items: center;">
          <a id="nav-home" href="/" style="color: ${heritageTheme.colors.accentGold}; text-decoration: none; font-weight: 600;">Trang chủ</a>
          <a id="nav-artifacts" href="/artifacts" style="color: ${heritageTheme.colors.textPrimary}; text-decoration: none;">Hiện vật</a>
          <a id="nav-timeline" href="/timeline" style="color: ${heritageTheme.colors.textPrimary}; text-decoration: none;">Dòng thời gian</a>
          <a id="nav-map-3d" href="/map-3d" style="color: ${heritageTheme.colors.textPrimary}; text-decoration: none;">Bản đồ 3D</a>
          <a id="nav-guide" href="/guide" style="color: ${heritageTheme.colors.textPrimary}; text-decoration: none;">AI Guide</a>
        </nav>
      </div>
    </header>
  `.trim();
}

export function renderFooter(): string {
  return `
    <footer id="main-footer" style="background: ${heritageTheme.colors.bgDark}; border-top: 1px solid ${heritageTheme.colors.borderGlass}; color: ${heritageTheme.colors.textSecondary}; padding: 3rem 1.5rem 1.5rem 1.5rem; margin-top: auto;">
      <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
        <div>
          <h3 style="font-family: ${heritageTheme.typography.fontFamilyHeading}; color: ${heritageTheme.colors.textPrimary}; margin-bottom: 1rem;">Bảo tàng Lịch sử TP. Hồ Chí Minh</h3>
          <p style="font-size: ${heritageTheme.typography.sizes.sm}; line-height: 1.6;">Nền tảng số hóa di sản văn hóa, cung cấp trải nghiệm tham quan 3D, AI Guide và dòng thời gian tương tác sống động.</p>
        </div>
        <div>
          <h4 style="color: ${heritageTheme.colors.accentGold}; margin-bottom: 0.75rem;">Thông tin liên hệ</h4>
          <p style="font-size: ${heritageTheme.typography.sizes.sm}; margin: 0.25rem 0;">Địa chỉ: 2 Nguyễn Bỉnh Khiêm, Bến Nghé, Quận 1, TP.HCM</p>
          <p style="font-size: ${heritageTheme.typography.sizes.sm}; margin: 0.25rem 0;">Điện thoại: (028) 3829 8146</p>
        </div>
        <div>
          <h4 style="color: ${heritageTheme.colors.accentGold}; margin-bottom: 0.75rem;">Liên kết nhanh</h4>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: ${heritageTheme.typography.sizes.sm};">
            <li style="margin-bottom: 0.5rem;"><a href="/privacy" style="color: ${heritageTheme.colors.textSecondary}; text-decoration: none;">Bảo mật & Quyền riêng tư</a></li>
            <li style="margin-bottom: 0.5rem;"><a href="/terms" style="color: ${heritageTheme.colors.textSecondary}; text-decoration: none;">Điều khoản sử dụng</a></li>
          </ul>
        </div>
      </div>
      <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem; text-align: center; font-size: ${heritageTheme.typography.sizes.xs}; color: ${heritageTheme.colors.textMuted};">
        © 2026 Bảo tàng Lịch sử Thành phố Hồ Chí Minh. All rights reserved.
      </div>
    </footer>
  `.trim();
}
