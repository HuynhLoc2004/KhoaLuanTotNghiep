import { renderRecognitionUploadWidget, injectHeritageGlobalStyles } from "@hcmc-museum/ui";
import { renderHeader, renderFooter } from "../shell/layout.js";

export function renderPublicRecognitionPage(): string {
  const headerHtml = renderHeader();
  const footerHtml = renderFooter();
  const widgetHtml = renderRecognitionUploadWidget();

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nhận Diện Hiện Vật Bằng Ảnh — Bảo tàng Lịch sử TP.HCM</title>
  <meta name="description" content="Chụp ảnh hiện vật để hệ thống gợi ý hiện vật phù hợp." />
  ${injectHeritageGlobalStyles()}
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased">
  ${headerHtml}

  <main id="recognition-main-content" class="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 pb-20 md:pb-8">
    <div class="text-center mb-6">
      <h1 class="text-2xl sm:text-4xl font-bold font-heading gradient-title-cyber mb-2">Nhận Diện Hiện Vật Bằng Ảnh</h1>
      <p class="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">Chụp hoặc tải ảnh hiện vật, hệ thống sẽ gợi ý hiện vật phù hợp trong bộ sưu tập.</p>
    </div>

    ${widgetHtml}
  </main>

  ${footerHtml}

  <script>
    (function () {
      var fileInput = document.getElementById('recognition-upload-input');
      var identifyBtn = document.getElementById('recognition-identify-button');
      var preview = document.getElementById('recognition-image-preview');
      var statusMessage = document.getElementById('recognition-status-message');
      var resultsEl = document.getElementById('recognition-results');
      var selectedImageBase64 = null;

      function stripDataUrlPrefix(dataUrl) {
        var commaIndex = dataUrl.indexOf(',');
        return commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
      }

      function renderCandidate(candidate) {
        var percent = Math.round(candidate.confidence * 100);
        var card = document.createElement('div');
        card.className = 'recognition-candidate-card glass-card rounded-xl p-4 flex items-center justify-between gap-4';
        card.setAttribute('data-artifact-id', candidate.artifactId);
        card.innerHTML =
          '<div><p class="font-heading text-slate-100">' + candidate.title + '</p>' +
          '<p class="text-xs text-slate-400">Độ tin cậy: ' + percent + '%' + (candidate.matchedZone ? ' · Cùng khu vực' : '') + '</p></div>';
        return card;
      }

      if (fileInput) {
        fileInput.addEventListener('change', function () {
          var file = fileInput.files && fileInput.files[0];
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function () {
            selectedImageBase64 = stripDataUrlPrefix(String(reader.result));
            if (preview) {
              preview.src = String(reader.result);
              preview.classList.remove('hidden');
            }
            if (identifyBtn) identifyBtn.disabled = false;
            if (statusMessage) statusMessage.textContent = '';
          };
          reader.readAsDataURL(file);
        });
      }

      if (identifyBtn) {
        identifyBtn.addEventListener('click', function () {
          if (!selectedImageBase64) return;
          if (statusMessage) statusMessage.textContent = 'Đang nhận diện...';
          if (resultsEl) resultsEl.innerHTML = '';

          fetch('/api/v1/recognition/identify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: selectedImageBase64 }),
          })
            .then(function (res) { return res.json(); })
            .then(function (data) {
              if (data.status === 'UNKNOWN') {
                if (statusMessage) statusMessage.textContent = 'Không nhận diện được — thử chụp ảnh khác hoặc tìm thủ công.';
                return;
              }
              if (statusMessage) {
                statusMessage.textContent = data.status === 'LOW_CONFIDENCE'
                  ? 'Chưa chắc chắn — vui lòng xác nhận hiện vật đúng bên dưới.'
                  : 'Đã tìm thấy hiện vật phù hợp:';
              }
              (data.candidates || []).forEach(function (candidate) {
                if (resultsEl) resultsEl.appendChild(renderCandidate(candidate));
              });
            })
            .catch(function () {
              if (statusMessage) statusMessage.textContent = 'Có lỗi xảy ra, vui lòng thử lại.';
            });
        });
      }
    })();
  </script>
</body>
</html>`;
}
