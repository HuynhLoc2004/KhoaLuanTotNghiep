export function renderHeader(): string {
  return `
    <header id="main-header" class="glass-nav-cyber sticky top-0 z-50 px-4 sm:px-6 py-3.5 transition-all">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <a id="nav-brand" href="/" class="flex items-center gap-2.5 group text-slate-100 hover:text-amber-400 transition-colors">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-400 to-rose-600 p-[1px] shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform animate-float-3d">
            <div class="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-bold text-amber-400 text-xs sm:text-sm">BT</div>
          </div>
          <span class="font-heading font-black text-base sm:text-lg tracking-wider text-slate-100 group-hover:text-amber-300">BẢO TÀNG LỊCH SỬ TP.HCM</span>
        </a>

        <!-- Desktop Nav -->
        <nav id="main-nav" class="hidden md:flex gap-4 items-center font-medium text-sm">
          <a id="nav-home" href="/" class="text-amber-400 hover:text-amber-300 font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-amber-500/10">Trang chủ</a>
          <a id="nav-artifacts" href="/search" class="text-slate-200 hover:text-amber-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-amber-500/10">Hiện vật</a>
          <a id="nav-3d" href="/3d-experience" class="text-slate-200 hover:text-amber-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-amber-500/10 flex items-center gap-1.5">
            <span class="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Trải nghiệm 3D
          </a>
          <a id="nav-map-3d" href="/3d-experience" class="hidden">Bản đồ 3D</a>
          <a id="nav-search" href="/search" class="text-slate-200 hover:text-amber-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-amber-500/10">Tìm kiếm</a>
          <a id="nav-ai-guide" href="/ai-guide" class="text-slate-200 hover:text-amber-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-amber-500/10">AI Guide</a>
          <a id="nav-guide" href="/ai-guide" class="hidden">AI Guide</a>
          <a id="nav-timeline" href="/timeline" class="text-slate-200 hover:text-amber-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-amber-500/10">Dòng thời gian</a>
          <a id="nav-profile" href="/profile" class="text-slate-200 hover:text-amber-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-amber-500/10">Trang cá nhân</a>
          <button class="btn-trigger-qr-scanner btn-cyber-gold px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <span>📷 Quét QR</span>
          </button>
        </nav>
      </div>
    </header>
  `.trim();
}

export function renderMobileBottomNav(): string {
  return `
    <!-- Mobile Bottom Navigation Bar Positioned Standalone at Body Root -->
    <nav id="mobile-bottom-nav" class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-2xl border-t border-amber-500/30 px-2 py-1.5 flex justify-around items-center text-[10px] font-mono shadow-2xl">
      <a href="/" class="flex flex-col items-center gap-0.5 text-amber-400 hover:text-amber-300 p-1">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        <span>Trang chủ</span>
      </a>
      <a href="/3d-experience" class="flex flex-col items-center gap-0.5 text-slate-300 hover:text-amber-400 p-1">
        <svg class="w-5 h-5 text-cyan-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
        <span class="text-cyan-300">Tham quan 3D</span>
      </a>
      
      <!-- Central QR Scanner Action Button -->
      <button class="btn-trigger-qr-scanner -mt-5 p-3 rounded-full bg-gradient-to-br from-amber-400 to-rose-600 text-slate-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse border-2 border-amber-300 flex flex-col items-center justify-center">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
      </button>

      <a href="/search" class="flex flex-col items-center gap-0.5 text-slate-300 hover:text-amber-400 p-1">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <span>Tra cứu</span>
      </a>
      <a href="/ai-guide" class="flex flex-col items-center gap-0.5 text-slate-300 hover:text-amber-400 p-1">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
        <span>AI Guide</span>
      </a>
    </nav>
  `.trim();
}

export function renderFooter(): string {
  return `
    <footer id="main-footer" class="bg-slate-950 border-t border-amber-500/20 text-slate-400 py-10 px-4 sm:px-6 mt-auto mb-16 md:mb-0">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <h3 class="font-heading text-lg font-bold text-slate-100 mb-3">Bảo tàng Lịch sử TP. Hồ Chí Minh</h3>
          <p class="text-sm text-slate-400 leading-relaxed">Nền tảng số hóa di sản văn hóa, cung cấp trải nghiệm tham quan 3D Digital Twin, Trợ lý AI Guide và Dòng thời gian tương tác sống động.</p>
        </div>
        <div>
          <h4 class="text-amber-400 font-semibold mb-3">Thông tin liên hệ</h4>
          <p class="text-sm text-slate-400 mb-1">Địa chỉ: 2 Nguyễn Bỉnh Khiêm, Bến Nghé, Quận 1, TP.HCM</p>
          <p class="text-sm text-slate-400">Điện thoại: (028) 3829 8146</p>
        </div>
        <div>
          <h4 class="text-amber-400 font-semibold mb-3">Liên kết nhanh</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="/privacy" class="hover:text-amber-300 transition-colors">Bảo mật & Quyền riêng tư</a></li>
            <li><a href="/terms" class="hover:text-amber-300 transition-colors">Điều khoản sử dụng</a></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-slate-800/80 pt-6 text-center text-xs text-slate-500">
        © 2026 Bảo tàng Lịch sử Thành phố Hồ Chí Minh. All rights reserved.
      </div>
    </footer>
  `.trim();
}
