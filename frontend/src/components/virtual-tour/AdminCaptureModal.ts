/**
 * AdminCaptureModal.ts
 * Giao diện Admin Studio Thu Thập Dữ Liệu 3DGS & Phân Tích Tự Động
 * Đã đồng bộ 100% với Design System (Theme Variables & Tactile Buttons)
 */

import { showToast } from "../Toast";

export class AdminCaptureModal {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordedVideoBlob: Blob | null = null;
  private uploadedVideoFile: File | null = null;
  private highResFiles: File[] = [];

  public open(): void {
    const existing = document.getElementById("admin-capture-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "admin-capture-modal";
    modal.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center;
      padding: 1.5rem; overflow-y: auto; font-family: var(--font-family-base);
    `;

    modal.innerHTML = `
      <div class="card" style="max-width: 860px; width: 100%; border: 1.5px solid var(--color-card-border); background: var(--color-card-bg); border-radius: var(--radius-md); box-shadow: var(--color-card-shadow); padding: 2rem; color: var(--color-text-main);">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; border-bottom: 1px solid var(--color-card-border); padding-bottom: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem;">
              <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 10px;">
                ADMIN STUDIO • THU THẬP DỮ LIỆU 3DGS
              </span>
            </div>
            <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--color-primary); margin: 0;">
              Quay Video & Tải Ảnh Chi Tiết Phòng Triển Lãm
            </h2>
            <p style="font-size: 0.85rem; color: var(--color-text-muted); margin: 0.25rem 0 0 0;">
              Quay video quét phòng và tải lên các bức ảnh 8K của hiện vật để tự động phân tích không gian 3D.
            </p>
          </div>
          <button id="admin-close-modal" style="background: none; border: none; font-size: 1.5rem; color: var(--color-text-muted); cursor: pointer; padding: 0.25rem 0.5rem; border-radius: var(--radius-xs);">✕</button>
        </div>

        <!-- Room Name Input -->
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--color-text-main);">
            Tên Phòng Trưng Bày Bảo Tàng:
          </label>
          <input id="admin-room-name" type="text" value="Sảnh Di Sản Văn Hóa Champa & Đông Sơn" class="lang-select" style="width: 100%; padding: 0.75rem 1rem; font-size: 0.92rem; font-weight: 600;" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
          <!-- Left: Camera & Video Upload -->
          <div style="background: rgba(var(--color-surface-rgb), 0.25); border: 1px solid var(--color-card-border); border-radius: var(--radius-sm); padding: 1.25rem;">
            <div style="font-weight: 700; font-size: 0.92rem; color: var(--color-primary); margin-bottom: 0.75rem; display: flex; align-items: center; justify-content: space-between;">
              <span>📹 1. Quay Video Phòng</span>
              <span id="video-status-badge" class="badge-pill" style="font-size: 0.7rem; padding: 1px 6px; display: none;">Chưa có video</span>
            </div>

            <!-- Video Viewport / Preview -->
            <div style="position: relative; width: 100%; height: 200px; background: rgba(0,0,0,0.85); border-radius: var(--radius-xs); overflow: hidden; margin-bottom: 0.85rem; display: flex; align-items: center; justify-content: center; border: 1px solid var(--color-card-border);">
              <video id="admin-camera-preview" autoplay playsinline muted style="width: 100%; height: 100%; object-fit: cover; display: none;"></video>
              <video id="admin-recorded-playback" controls style="width: 100%; height: 100%; object-fit: cover; display: none;"></video>
              
              <div id="camera-placeholder" style="color: #cbd5e1; font-size: 0.82rem; text-align: center; padding: 1rem;">
                <div style="font-size: 2.2rem; margin-bottom: 0.4rem;">📹</div>
                <b>Camera Chưa Bật</b><br/>
                Bấm "Bật Camera" hoặc Chọn file Video có sẵn
              </div>

              <div id="recording-badge" style="display: none; position: absolute; top: 0.6rem; left: 0.6rem; background: #ef4444; color: #fff; font-size: 0.72rem; font-weight: 800; padding: 0.25rem 0.6rem; border-radius: var(--radius-xs); animation: pulseGlow 1.2s infinite; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);">
                ● REC • ĐANG QUAY VIDEO
              </div>
            </div>

            <!-- Control Buttons -->
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <div style="display: flex; gap: 0.5rem;">
                <button id="btn-toggle-camera" class="btn btn-outline" style="flex: 1; font-size: 0.8rem; padding: 0.5rem;">
                  Bật Camera
                </button>
                <button id="btn-record-video" disabled class="btn btn-danger" style="flex: 1; font-size: 0.8rem; padding: 0.5rem; opacity: 0.5; cursor: not-allowed;">
                  Bắt Đầu Quay
                </button>
              </div>

              <div style="text-align: center; font-size: 0.75rem; color: var(--color-text-muted); margin: 0.2rem 0;">— Hoặc —</div>

              <button id="btn-upload-file-trigger" class="btn btn-outline" style="width: 100%; font-size: 0.8rem; padding: 0.5rem; justify-content: center;">
                📁 Chọn File Video Có Sẵn (.mp4, .webm)
              </button>
              <input id="video-file-input" type="file" accept="video/mp4,video/webm,video/mov,video/avi" style="display: none;" />
            </div>
          </div>

          <!-- Right: High-Res Photos Dropzone -->
          <div style="background: rgba(var(--color-surface-rgb), 0.25); border: 1px solid var(--color-card-border); border-radius: var(--radius-sm); padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-weight: 700; font-size: 0.92rem; color: var(--color-primary); margin-bottom: 0.75rem;">
                📸 2. Tải Ảnh Chụp Cận Cảnh (8K)
              </div>

              <div id="photo-dropzone" style="border: 2px dashed var(--color-secondary); border-radius: var(--radius-sm); padding: 1.75rem 1rem; text-align: center; cursor: pointer; background: rgba(var(--color-surface-rgb), 0.15); margin-bottom: 0.85rem; transition: all 0.2s;">
                <div style="font-size: 2.2rem; margin-bottom: 0.3rem;">🖼️</div>
                <div style="font-size: 0.85rem; color: var(--color-text-main); font-weight: 700;">Kéo thả ảnh hoặc Bấm để chọn</div>
                <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.25rem;">Các bức tranh / hiện vật trên tường</div>
                <input id="photo-input" type="file" multiple accept="image/*" style="display: none;" />
              </div>
            </div>

            <div id="selected-photos-count" style="font-size: 0.82rem; color: var(--color-primary); font-weight: 700; background: rgba(var(--color-surface-rgb), 0.3); padding: 0.6rem; border-radius: var(--radius-xs); text-align: center; border: 1px solid var(--color-card-border);">
              Chưa chọn ảnh chi tiết nào
            </div>
          </div>
        </div>

        <!-- Progress Tracker -->
        <div id="pipeline-progress-container" style="display: none; background: rgba(var(--color-surface-rgb), 0.3); border: 1px solid var(--color-card-border); border-radius: var(--radius-sm); padding: 1.25rem; margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 700; margin-bottom: 0.6rem;">
            <span id="pipeline-step-text" style="color: var(--color-primary);">Đang gửi dữ liệu lên hàng đợi RabbitMQ...</span>
            <span id="pipeline-progress-pct" style="color: #16A34A; font-family: var(--font-family-mono);">0%</span>
          </div>
          <div style="width: 100%; height: 10px; background: var(--color-canvas); border-radius: 5px; overflow: hidden; border: 1px solid var(--color-card-border);">
            <div id="pipeline-progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, var(--color-secondary), var(--color-primary)); transition: width 0.3s ease;"></div>
          </div>
        </div>

        <!-- Action Footer -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-card-border); padding-top: 1.25rem;">
          <button id="admin-cancel-btn" class="btn btn-outline" style="padding: 0.65rem 1.25rem;">
            Hủy Bỏ
          </button>

          <!-- Dynamic Action Button: Initially disabled/hidden until video is ready -->
          <button id="admin-submit-pipeline-btn" disabled class="btn btn-primary" style="padding: 0.75rem 1.75rem; font-weight: 800; font-size: 0.95rem; opacity: 0.5; cursor: not-allowed; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
            <span>🚀</span> Bắt Đầu Tạo Không Gian Ảo 3D
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.setupListeners(modal);
  }

  private setupListeners(modal: HTMLElement): void {
    const closeBtn = modal.querySelector("#admin-close-modal");
    const cancelBtn = modal.querySelector("#admin-cancel-btn");
    const toggleCamBtn = modal.querySelector("#btn-toggle-camera") as HTMLButtonElement;
    const recordBtn = modal.querySelector("#btn-record-video") as HTMLButtonElement;
    const uploadTriggerBtn = modal.querySelector("#btn-upload-file-trigger") as HTMLButtonElement;
    const videoFileInput = modal.querySelector("#video-file-input") as HTMLInputElement;

    const cameraPreview = modal.querySelector("#admin-camera-preview") as HTMLVideoElement;
    const recordedPlayback = modal.querySelector("#admin-recorded-playback") as HTMLVideoElement;
    const placeholder = modal.querySelector("#camera-placeholder") as HTMLElement;
    const recordingBadge = modal.querySelector("#recording-badge") as HTMLElement;
    const statusBadge = modal.querySelector("#video-status-badge") as HTMLElement;

    const dropzone = modal.querySelector("#photo-dropzone") as HTMLElement;
    const photoInput = modal.querySelector("#photo-input") as HTMLInputElement;
    const photoCount = modal.querySelector("#selected-photos-count") as HTMLElement;

    const submitBtn = modal.querySelector("#admin-submit-pipeline-btn") as HTMLButtonElement;

    const closeHandler = () => {
      this.stopCamera();
      modal.remove();
    };

    closeBtn?.addEventListener("click", closeHandler);
    cancelBtn?.addEventListener("click", closeHandler);

    // Function to enable submit button when video is ready
    const markVideoReady = (sourceText: string) => {
      submitBtn.disabled = false;
      submitBtn.style.opacity = "1";
      submitBtn.style.cursor = "pointer";
      submitBtn.style.boxShadow = "0 6px 20px rgba(51, 104, 160, 0.4)";
      submitBtn.innerHTML = `<span>🚀</span> <b>Bắt Đầu Tạo Không Gian Ảo 3D</b>`;

      if (statusBadge) {
        statusBadge.style.display = "inline-flex";
        statusBadge.textContent = sourceText;
        statusBadge.style.background = "rgba(34, 197, 94, 0.15)";
        statusBadge.style.color = "#16A34A";
        statusBadge.style.borderColor = "#22C55E";
      }
    };

    // Toggle Live Camera
    toggleCamBtn?.addEventListener("click", async () => {
      if (!this.mediaStream) {
        try {
          this.mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          });
          cameraPreview.srcObject = this.mediaStream;
          cameraPreview.style.display = "block";
          recordedPlayback.style.display = "none";
          placeholder.style.display = "none";

          toggleCamBtn.textContent = "Tắt Camera";
          recordBtn.disabled = false;
          recordBtn.style.opacity = "1";
          recordBtn.style.cursor = "pointer";
        } catch (err) {
          showToast("Không thể truy cập Camera: " + (err as Error).message, "error");
        }
      } else {
        this.stopCamera();
        cameraPreview.style.display = "none";
        placeholder.style.display = "block";
        toggleCamBtn.textContent = "Bật Camera";
        recordBtn.disabled = true;
        recordBtn.style.opacity = "0.5";
        recordBtn.style.cursor = "not-allowed";
      }
    });

    // Record Video Control
    let isRecording = false;
    recordBtn?.addEventListener("click", () => {
      if (!this.mediaStream) return;

      if (!isRecording) {
        // Start Recording
        this.recordedChunks = [];
        try {
          this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType: "video/webm" });
        } catch {
          this.mediaRecorder = new MediaRecorder(this.mediaStream);
        }

        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) this.recordedChunks.push(e.data);
        };

        this.mediaRecorder.onstop = () => {
          this.recordedVideoBlob = new Blob(this.recordedChunks, { type: "video/webm" });
          this.uploadedVideoFile = null;

          // Display recorded playback
          cameraPreview.style.display = "none";
          recordedPlayback.src = URL.createObjectURL(this.recordedVideoBlob);
          recordedPlayback.style.display = "block";

          // ENABLE THE SUBMIT BUTTON IMMEDIATELY WHEN RECORDING STOPS
          markVideoReady("✓ Video Đã Quay Xong");
        };

        this.mediaRecorder.start();
        isRecording = true;
        recordBtn.textContent = "🛑 Dừng Quay";
        recordBtn.className = "btn btn-danger";
        recordingBadge.style.display = "block";
      } else {
        // Stop Recording
        this.mediaRecorder?.stop();
        isRecording = false;
        recordBtn.textContent = "Quay Lại";
        recordBtn.className = "btn btn-outline";
        recordingBadge.style.display = "none";
        this.stopCamera();
        toggleCamBtn.textContent = "Bật Camera";
      }
    });

    // Upload Video File Trigger
    uploadTriggerBtn?.addEventListener("click", () => videoFileInput.click());
    videoFileInput?.addEventListener("change", () => {
      if (videoFileInput.files && videoFileInput.files[0]) {
        this.uploadedVideoFile = videoFileInput.files[0];
        this.recordedVideoBlob = null;
        this.stopCamera();

        cameraPreview.style.display = "none";
        placeholder.style.display = "none";
        recordedPlayback.src = URL.createObjectURL(this.uploadedVideoFile);
        recordedPlayback.style.display = "block";

        markVideoReady(`✓ File: ${this.uploadedVideoFile.name.slice(0, 15)}...`);
      }
    });

    // High-Res Photos Dropzone
    dropzone?.addEventListener("click", () => photoInput.click());
    photoInput?.addEventListener("change", () => {
      if (photoInput.files) {
        this.highResFiles = Array.from(photoInput.files);
        photoCount.textContent = `✓ Đã chọn ${this.highResFiles.length} ảnh chi tiết 8K`;
      }
    });

    // Submit Pipeline
    submitBtn?.addEventListener("click", async () => {
      if (submitBtn.disabled) return;
      await this.handleSubmitPipeline(modal);
    });
  }

  private stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
  }

  private async handleSubmitPipeline(modal: HTMLElement): Promise<void> {
    const progressBox = modal.querySelector("#pipeline-progress-container") as HTMLElement;
    const progressText = modal.querySelector("#pipeline-step-text") as HTMLElement;
    const progressPct = modal.querySelector("#pipeline-progress-pct") as HTMLElement;
    const progressBar = modal.querySelector("#pipeline-progress-bar") as HTMLElement;
    const submitBtn = modal.querySelector("#admin-submit-pipeline-btn") as HTMLButtonElement;
    const roomName = (modal.querySelector("#admin-room-name") as HTMLInputElement)?.value || "Sảnh Trưng Bày";

    progressBox.style.display = "block";
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.5";

    const formData = new FormData();
    formData.append("roomName", roomName);

    // Attach video (either live recorded blob or uploaded file)
    if (this.uploadedVideoFile) {
      formData.append("video", this.uploadedVideoFile);
    } else if (this.recordedVideoBlob) {
      const videoFile = new File([this.recordedVideoBlob], "room_scan.webm", { type: "video/webm" });
      formData.append("video", videoFile);
    } else {
      showToast("Vui lòng quay video hoặc chọn file video trước!", "warning");
      progressBox.style.display = "none";
      submitBtn.disabled = false;
      submitBtn.style.opacity = "1";
      return;
    }

    // Attach High-Res photos
    if (this.highResFiles.length > 0) {
      this.highResFiles.forEach((file) => formData.append("photos", file));
    }

    try {
      progressText.textContent = "Đang tải video & gửi tới RabbitMQ Pipeline...";
      progressBar.style.width = "15%";
      progressPct.textContent = "15%";

      const apiHost = "http://localhost:3000";
      const response = await fetch(`${apiHost}/api/v1/tour/upload`, {
        method: "POST",
        body: formData,
      });

      const resJson = await response.json();
      if (!resJson.success) throw new Error(resJson.error || "Gửi thất bại");

      const jobId = resJson.data.jobId;
      console.log("[AdminCapture] Job created successfully:", jobId);

      // Poll Redis job status
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${apiHost}/api/v1/tour/status/${jobId}`);
          const statusJson = await statusRes.json();
          if (statusJson.success && statusJson.data) {
            const data = statusJson.data;
            progressText.textContent = data.details?.currentStep || data.status;
            progressBar.style.width = `${data.progress}%`;
            progressPct.textContent = `${data.progress}%`;

            if (data.status === "COMPLETED" || data.progress >= 100) {
              clearInterval(pollInterval);
              showToast("🎉 Hoàn tất! Không gian 3D Gaussian Splatting đã được tạo thành công.", "success");
              modal.remove();
            }
          }
        } catch {
          // Ignore transient network errors during polling
        }
      }, 2000);
    } catch (err: any) {
      showToast("Lỗi: " + err.message + " (Vui lòng đảm bảo Backend API trên Port 3000 đang mở)", "error");
      progressBox.style.display = "none";
      submitBtn.disabled = false;
      submitBtn.style.opacity = "1";
    }
  }
}
