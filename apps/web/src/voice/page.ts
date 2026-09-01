import { renderVoicePlayerWidget, injectHeritageGlobalStyles } from "@hcmc-museum/ui";
import { renderHeader, renderFooter } from "../shell/layout.js";
import type { VoiceScript } from "@hcmc-museum/contracts";

export interface VoicePageOptions {
  scripts?: VoiceScript[];
}

const DEFAULT_SCRIPTS: VoiceScript[] = [
  {
    id: "script-dong-son-vi",
    artifactId: "art-001",
    locale: "vi",
    title: "Trống Đồng Đông Sơn",
    text: "Trống đồng Đông Sơn là hiện vật tiêu biểu của văn hóa Đông Sơn, được đúc bằng kỹ thuật hợp kim đồng thau tinh xảo.",
    status: "PUBLISHED",
    updatedAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "script-dong-son-en",
    artifactId: "art-001",
    locale: "en",
    title: "Dong Son Bronze Drum",
    text: "The Dong Son bronze drum is a representative artifact of the Dong Son culture, cast with refined bronze-alloy techniques.",
    status: "PUBLISHED",
    updatedAt: "2026-09-01T00:00:00.000Z",
  },
];

export function renderPublicVoicePage(options: VoicePageOptions = {}): string {
  const scripts = options.scripts ?? DEFAULT_SCRIPTS;
  const headerHtml = renderHeader();
  const footerHtml = renderFooter();
  const playerHtml = renderVoicePlayerWidget({ scripts });

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thuyết Minh Đa Ngôn Ngữ &amp; Ra Lệnh Giọng Nói — Bảo tàng Lịch sử TP.HCM</title>
  <meta name="description" content="Nghe thuyết minh hiện vật đa ngôn ngữ và điều khiển bằng giọng nói ngay trên trình duyệt." />
  ${injectHeritageGlobalStyles()}
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased">
  ${headerHtml}

  <main id="voice-main-content" class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 pb-20 md:pb-8">
    <div class="text-center mb-6">
      <h1 class="text-2xl sm:text-4xl font-bold font-heading gradient-title-cyber mb-2">Thuyết Minh Đa Ngôn Ngữ</h1>
      <p class="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">Nghe thuyết minh hiện vật bằng tiếng Việt/tiếng Anh và ra lệnh bằng giọng nói ngay trên trình duyệt.</p>
    </div>

    ${playerHtml}
  </main>

  ${footerHtml}

  <script>
    (function () {
      var scripts = ${JSON.stringify(scripts)};
      var selectedScript = null;
      var utterance = null;
      var isSpeaking = false;

      var listEl = document.getElementById('voice-script-list');
      var transcriptEl = document.getElementById('voice-transcript');
      var playBtn = document.getElementById('voice-play-button');
      var pauseBtn = document.getElementById('voice-pause-button');
      var repeatBtn = document.getElementById('voice-repeat-button');
      var speedSelect = document.getElementById('voice-speed-select');
      var micBtn = document.getElementById('voice-mic-button');
      var unsupportedNotice = document.getElementById('voice-unsupported-notice');

      var hasSynthesis = 'speechSynthesis' in window;
      var SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!hasSynthesis && unsupportedNotice) {
        unsupportedNotice.classList.remove('hidden');
      }

      function setSelectedScript(scriptId) {
        selectedScript = scripts.find(function (item) { return item.id === scriptId; }) || null;
        if (selectedScript && transcriptEl) {
          transcriptEl.textContent = selectedScript.text;
        }
        if (playBtn) playBtn.disabled = !selectedScript || !hasSynthesis;
        if (repeatBtn) repeatBtn.disabled = !selectedScript || !hasSynthesis;
      }

      function synthesizeAndSpeak() {
        if (!selectedScript || !hasSynthesis) return;
        var speed = speedSelect ? parseFloat(speedSelect.value) : 1;

        fetch('/api/v1/voice/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scriptId: selectedScript.id,
            locale: selectedScript.locale,
            voiceId: 'default',
            speed: speed,
          }),
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            window.speechSynthesis.cancel();
            utterance = new SpeechSynthesisUtterance(data.plainText);
            utterance.lang = selectedScript.locale === 'en' ? 'en-US' : 'vi-VN';
            utterance.rate = speed;
            utterance.onend = function () {
              isSpeaking = false;
              if (pauseBtn) pauseBtn.disabled = true;
            };
            window.speechSynthesis.speak(utterance);
            isSpeaking = true;
            if (pauseBtn) pauseBtn.disabled = false;
          })
          .catch(function () {
            if (transcriptEl) transcriptEl.textContent = selectedScript.text;
          });
      }

      if (listEl) {
        listEl.addEventListener('click', function (event) {
          var card = event.target.closest('.voice-script-card');
          if (card) {
            setSelectedScript(card.getAttribute('data-script-id'));
          }
        });
      }

      if (playBtn) {
        playBtn.addEventListener('click', synthesizeAndSpeak);
      }

      if (pauseBtn) {
        pauseBtn.addEventListener('click', function () {
          if (!hasSynthesis) return;
          if (isSpeaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
          } else {
            window.speechSynthesis.resume();
          }
        });
      }

      if (repeatBtn) {
        repeatBtn.addEventListener('click', synthesizeAndSpeak);
      }

      if (micBtn && SpeechRecognitionCtor) {
        micBtn.addEventListener('click', function () {
          var recognition = new SpeechRecognitionCtor();
          recognition.lang = selectedScript && selectedScript.locale === 'en' ? 'en-US' : 'vi-VN';
          recognition.onresult = function (event) {
            var transcript = event.results[0][0].transcript;
            fetch('/api/v1/voice/command', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transcript: transcript, locale: recognition.lang.startsWith('en') ? 'en' : 'vi' }),
            })
              .then(function (res) { return res.json(); })
              .then(function (data) {
                if (transcriptEl) transcriptEl.textContent = data.message;
                if (data.intent === 'PLAY') synthesizeAndSpeak();
                if (data.intent === 'PAUSE' && hasSynthesis) window.speechSynthesis.pause();
                if (data.intent === 'STOP' && hasSynthesis) window.speechSynthesis.cancel();
                if (data.intent === 'REPEAT') synthesizeAndSpeak();
                if (data.intent === 'NAVIGATE' && data.targetSlug) window.location.href = data.targetSlug;
              });
          };
          recognition.start();
        });
      } else if (micBtn) {
        micBtn.disabled = true;
        micBtn.title = 'Trình duyệt không hỗ trợ nhận diện giọng nói';
      }

      if (scripts.length > 0) {
        setSelectedScript(scripts[0].id);
      }
    })();
  </script>
</body>
</html>`;
}
