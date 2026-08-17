import {
  renderAiGuideChatWidget,
  injectHeritageGlobalStyles,
  renderQrScannerModal,
} from "@hcmc-museum/ui";
import { renderFooter, renderHeader } from "../shell/layout.js";

export function renderPublicAiGuidePage(): string {
  const headerHtml = renderHeader();
  const footerHtml = renderFooter();

  const initialMessages = [
    {
      id: "welcome-001",
      sender: "ai" as const,
      text: "Xin chào quý khách! Tôi là Trợ Lý Thuyết Minh Viên AI Bảo Tàng. Quý khách có thể hỏi tôi về bất kỳ di sản, hiện vật, triều đại lịch sử hoặc thông tin tham quan bảo tàng.",
      timestamp: "Hệ thống",
      suggestedQuestions: [
        "Giới thiệu về Trống Đồng Đông Sơn?",
        "Trang phục Hoàng cung Triều Nguyễn?",
        "Bảo tàng mở cửa vào những giờ nào?",
      ],
    },
  ];

  const chatWidgetHtml = renderAiGuideChatWidget(initialMessages);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Trợ Lý Thuyết Minh Viên AI & Hỏi Đáp Di Sản — Bảo tàng Lịch sử TP.HCM</title>
  <meta name="description" content="Trợ lý AI thuyết minh bảo tàng thông minh giải đáp thắc mắc lịch sử hiện vật có trích dẫn nguồn kiểm định." />
  ${injectHeritageGlobalStyles()}
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased">
  ${headerHtml}
  
  <main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 pb-20 md:pb-8">
    <div class="text-center mb-6">
      <h1 class="text-2xl sm:text-4xl font-bold font-heading gradient-title-cyber mb-2">Trợ Lý Thuyết Minh Viên AI</h1>
      <p class="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">Giải đáp thắc mắc lịch sử hiện vật realtime với bằng chứng kiểm định từ Bảo tàng Lịch sử TP.HCM</p>
    </div>

    ${chatWidgetHtml}
  </main>

  ${footerHtml}
  ${renderQrScannerModal()}

  <script>
    // Audio Player script handler
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-play-audio');
      if (btn) {
        const audioUrl = btn.getAttribute('data-audio-url');
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          audio.play().catch(() => alert('Phát audio thuyết minh: ' + audioUrl));
        }
      }
    });
  </script>
</body>
</html>`;
}
