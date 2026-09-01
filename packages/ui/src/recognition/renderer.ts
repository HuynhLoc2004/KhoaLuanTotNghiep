import type { RecognitionCandidate } from "@hcmc-museum/contracts";

export function renderRecognitionCandidateCard(candidate: RecognitionCandidate): string {
  const percent = Math.round(candidate.confidence * 100);
  return `
    <div class="recognition-candidate-card glass-card rounded-xl p-4 flex items-center justify-between gap-4" data-artifact-id="${candidate.artifactId}">
      <div>
        <p class="font-heading text-slate-100">${candidate.title}</p>
        <p class="text-xs text-slate-400">Độ tin cậy: ${String(percent)}%${candidate.matchedZone ? " · Cùng khu vực" : ""}</p>
      </div>
      <div class="flex gap-2">
        <button type="button" class="recognition-confirm-button px-3 py-1.5 rounded-lg bg-emerald-600/80 text-xs text-white" data-artifact-id="${candidate.artifactId}">Đúng rồi</button>
        <button type="button" class="recognition-reject-button px-3 py-1.5 rounded-lg bg-slate-700/80 text-xs text-slate-200" data-artifact-id="${candidate.artifactId}">Không phải</button>
      </div>
    </div>
  `.trim();
}

export function renderRecognitionUploadWidget(): string {
  return `
    <div id="recognition-widget" class="recognition-guide-widget glass-card rounded-2xl p-4 sm:p-6 space-y-4">
      <div class="flex flex-col sm:flex-row gap-3 items-center">
        <label for="recognition-upload-input" class="px-4 py-2 rounded-lg bg-amber-500/90 text-slate-950 text-sm font-semibold cursor-pointer">
          Chụp/tải ảnh hiện vật
        </label>
        <input id="recognition-upload-input" type="file" accept="image/*" capture="environment" class="hidden" />
        <button type="button" id="recognition-identify-button" class="px-4 py-2 rounded-lg bg-slate-700/80 text-sm text-slate-200" disabled>
          Nhận diện
        </button>
      </div>
      <img id="recognition-image-preview" class="hidden max-h-64 rounded-xl mx-auto" alt="Ảnh đã chọn" />
      <p id="recognition-status-message" class="text-sm text-slate-300" role="status"></p>
      <div id="recognition-results" class="space-y-3"></div>
    </div>
  `.trim();
}
