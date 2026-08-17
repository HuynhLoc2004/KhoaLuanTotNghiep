export function renderHeader(): string {
  return `
    <header id="main-header" class="glass-nav-cyber sticky top-0 z-50 px-6 py-4 transition-all">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <a id="nav-brand" href="/" class="flex items-center gap-3 group text-slate-100 hover:text-amber-400 transition-colors">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-rose-600 p-[1px] shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform animate-float-3d">
            <div class="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-bold text-amber-400 text-sm">BT</div>
          </div>
          <span class="font-heading font-black text-lg tracking-wider text-slate-100 group-hover:text-amber-300">BẢO TÀNG LỊCH SỬ TP.HCM</span>
        </a>
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
        </nav>
      </div>
    </header>
  `.trim();
}

export function renderFooter(): string {
  return `
    <footer id="main-footer" class="bg-slate-950 border-t border-amber-500/20 text-slate-400 py-12 px-6 mt-auto">
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
