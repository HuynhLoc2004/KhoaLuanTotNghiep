export function renderQrScannerModal(): string {
  return `
    <!-- QR Scanner Trigger & Modal Component -->
    <div id="qr-scanner-modal" class="hidden fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4">
      <div class="glass-futuristic rounded-3xl max-w-md w-full p-6 border-2 border-amber-500/40 shadow-2xl relative space-y-6">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-amber-500/20 pb-4">
          <div class="flex items-center gap-3">
            <div class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
            </div>
            <div>
              <h3 class="font-heading font-bold text-slate-100 text-lg">Quét Mã QR Di Sản</h3>
              <p class="text-xs text-amber-400 font-mono">Web Camera Real-time Scanner</p>
            </div>
          </div>
          <button id="btn-close-qr-modal" class="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
            ✕
          </button>
        </div>

        <!-- Camera Scanner Viewport -->
        <div class="relative w-full h-64 rounded-2xl overflow-hidden bg-slate-900 border border-amber-500/30 flex items-center justify-center">
          <div class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div class="w-48 h-48 border-2 border-amber-400 rounded-2xl relative animate-pulse shadow-[0_0_30px_rgba(245,158,11,0.5)]">
              <!-- Corner Brackets -->
              <div class="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-amber-300"></div>
              <div class="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-amber-300"></div>
              <div class="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-amber-300"></div>
              <div class="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-amber-300"></div>
              <!-- Laser Scanner Line -->
              <div class="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_10px_#f59e0b] animate-scanline"></div>
            </div>
          </div>
          
          <video id="qr-video-viewport" class="w-full h-full object-cover hidden z-10" playsinline autoplay muted></video>
          <p id="qr-camera-placeholder" class="text-xs text-slate-400 font-mono text-center px-6 relative z-10">
            📸 Đang khởi động camera điện thoại...<br>
            <span class="text-[10px] text-amber-400/80">Vui lòng bấm Cho Phép (Allow) truy cập Camera trên điện thoại</span>
          </p>
        </div>

        <!-- Preset Demo QR Selection for Web Testing -->
        <div class="space-y-3 pt-2">
          <span class="block text-xs font-mono text-slate-400 uppercase tracking-wider">Hoặc chọn nhanh mã QR mẫu để thử nghiệm:</span>
          
          <div class="grid grid-cols-1 gap-2">
            <button class="btn-demo-qr-scan text-left px-4 py-3 rounded-xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/10 transition-all flex items-center justify-between group" data-code="ART-DS-001" data-target="/3d-experience">
              <div class="flex items-center gap-3">
                <span class="text-xl">🥁</span>
                <div>
                  <h4 class="font-heading font-bold text-slate-200 text-sm group-hover:text-amber-300">Trống Đồng Đông Sơn</h4>
                  <p class="text-[10px] font-mono text-amber-400">Mã QR: ART-DS-001 (Xem 3D Digital Twin)</p>
                </div>
              </div>
              <span class="text-amber-400 font-bold text-xs">Mở 3D →</span>
            </button>

            <button class="btn-demo-qr-scan text-left px-4 py-3 rounded-xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/10 transition-all flex items-center justify-between group" data-code="ART-AV-002" data-target="/search">
              <div class="flex items-center gap-3">
                <span class="text-xl">👑</span>
                <div>
                  <h4 class="font-heading font-bold text-slate-200 text-sm group-hover:text-amber-300">Ấn Vàng Sắc Mệnh Chi Bảo</h4>
                  <p class="text-[10px] font-mono text-amber-400">Mã QR: ART-AV-002 (Tra cứu di sản)</p>
                </div>
              </div>
              <span class="text-amber-400 font-bold text-xs">Xem di sản →</span>
            </button>

            <button class="btn-demo-qr-scan text-left px-4 py-3 rounded-xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/10 transition-all flex items-center justify-between group" data-code="N01_ENTRANCE" data-target="/3d-experience">
              <div class="flex items-center gap-3">
                <span class="text-xl">📍</span>
                <div>
                  <h4 class="font-heading font-bold text-slate-200 text-sm group-hover:text-amber-300">Cổng Vào Chính Bảo Tàng</h4>
                  <p class="text-[10px] font-mono text-amber-400">Mã QR: N01_ENTRANCE (Vị trí A* Routing)</p>
                </div>
              </div>
              <span class="text-amber-400 font-bold text-xs">Dẫn đường →</span>
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Client-side Interactive Modal & Web Camera Stream Script -->
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        const qrModal = document.getElementById('qr-scanner-modal');
        const openBtns = document.querySelectorAll('.btn-trigger-qr-scanner');
        const closeBtn = document.getElementById('btn-close-qr-modal');
        const demoScanBtns = document.querySelectorAll('.btn-demo-qr-scan');
        const videoElement = document.getElementById('qr-video-viewport');
        const placeholderText = document.getElementById('qr-camera-placeholder');
        let activeStream = null;

        async function startCameraStream() {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            if (placeholderText) {
              placeholderText.innerHTML = '📷 Camera không hỗ trợ trên trình duyệt này.<br><span class="text-[10px] text-amber-400">Vui lòng dùng mã QR mẫu bên dưới để thử nghiệm!</span>';
            }
            return;
          }

          try {
            activeStream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: { ideal: 'environment' } }
            });
            if (videoElement) {
              videoElement.srcObject = activeStream;
              videoElement.classList.remove('hidden');
              if (placeholderText) placeholderText.classList.add('hidden');
            }
          } catch (err) {
            console.warn('Camera access error:', err);
            if (placeholderText) {
              placeholderText.innerHTML = '📷 Chưa thể kết nối camera.<br><span class="text-[10px] text-amber-400">Vui lòng chọn 1 mã QR mẫu bên dưới để xem mô hình 3D!</span>';
            }
          }
        }

        function stopCameraStream() {
          if (activeStream) {
            activeStream.getTracks().forEach(track => track.stop());
            activeStream = null;
          }
          if (videoElement) {
            videoElement.classList.add('hidden');
            videoElement.srcObject = null;
          }
          if (placeholderText) placeholderText.classList.remove('hidden');
        }

        openBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (qrModal) {
              qrModal.classList.remove('hidden');
              startCameraStream();
            }
          });
        });

        if (closeBtn && qrModal) {
          closeBtn.addEventListener('click', () => {
            qrModal.classList.add('hidden');
            stopCameraStream();
          });
        }

        demoScanBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            stopCameraStream();
            const target = btn.getAttribute('data-target') || '/3d-experience';
            const code = btn.getAttribute('data-code') || '';
            window.location.href = target + '?qrCode=' + encodeURIComponent(code);
          });
        });
      });
    </script>
  `.trim();
}
