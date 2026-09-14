/**
 * AdminCaptureModal.ts
 * Giao diện Admin quay video phòng bảo tàng trực tiếp bằng Camera Web (MediaRecorder)
 * và tải lên danh sách ảnh chụp chi tiết 8K để đẩy vào Pipeline 3DGS.
 */

export class AdminCaptureModal {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordedVideoBlob: Blob | null = null;
  private highResFiles: File[] = [];

  public open(): void {
    const existing = document.getElementById("admin-capture-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "admin-capture-modal";
    modal.style.cssText = `
      position: fixed; inset: 0; z-index: 999;
      background: rgba(10, 14, 23, 0.9);
      backdrop-filter: blur(16px);
      display: flex; align-items: center; justify-content: center;
      padding: 1.5rem; overflow-y: auto; font-family: 'Inter', sans-serif;
    `;

    modal.innerHTML = `
      <div style="background: #11141d; border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 16px; max-width: 800px; width: 100%; box-shadow: 0 25px 50px rgba(0,0,0,0.9); padding: 2rem; color: #f5f2eb;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem;">
          <div>
            <div style="font-size: 0.75rem; color: #d4af37; text-transform: uppercase; font-weight: 700;">Admin Studio • Thu Thập Dữ Liệu 3DGS</div>
            <h2 style="font-size: 1.5rem; font-weight: 800; font-family: 'Cinzel', serif; margin: 0.25rem 0 0; color: #fff;">
              Quay Video & Tải Lên Ảnh Chi Tiết Phòng Triển Lãm
            </h2>
          </div>
          <button id="admin-close-modal" style="background: transparent; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer;">✕</button>
        </div>

        <!-- Room Name Input -->
        <div style="margin-bottom: 1.25rem;">
          <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.4rem; color: #cbd5e1;">Tên Phòng Trưng Bày:</label>
          <input id="admin-room-name" type="text" value="Sảnh Di Sản Văn Hóa Champa & Đông Sơn" style="width: 100%; padding: 0.75rem 1rem; background: #1a1e29; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff; font-size: 0.95rem;" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
          <!-- Left: Camera Recorder -->
          <div style="background: #181c26; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.25rem;">
            <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
              <span>📹</span> 1. Quay Video Phòng Trưng Bày
            </div>
            
            <div style="position: relative; width: 100%; height: 180px; background: #000; border-radius: 8px; overflow: hidden; margin-bottom: 0.75rem; display: flex; align-items: center; justify-content: center;">
              <video id="admin-camera-preview" autoplay playsinline muted style="width: 100%; height: 100%; object-fit: cover; display: none;"></video>
              <div id="camera-placeholder" style="color: #64748b; font-size: 0.85rem; text-align: center; padding: 1rem;">
                Camera chưa bật.<br/>Bấm "Bật Camera" để quét phòng.
              </div>
              <div id="recording-badge" style="display: none; position: absolute; top: 0.5rem; left: 0.5rem; background: #ef4444; color: #fff; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; animation: pulse 1s infinite;">
                REC ● Đang quay
              </div>
            </div>

            <div style="display: flex; gap: 0.5rem;">
              <button id="btn-toggle-camera" style="flex: 1; padding: 0.5rem; background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.82rem;">
                Bật Camera
              </button>
              <button id="btn-record-video" disabled style="flex: 1; padding: 0.5rem; background: #9e1b1b; border: 1px solid #d4af37; color: #fff; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.82rem; opacity: 0.5;">
                Bắt Đầu Quay
              </button>
            </div>
          </div>

          <!-- Right: High-Res Photos Dropzone -->
          <div style="background: #181c26; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.25rem;">
            <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
              <span>📸</span> 2. Tải Ảnh Chụp Cận Cảnh (8K)
            </div>

            <div id="photo-dropzone" style="border: 2px dashed rgba(212, 175, 55, 0.4); border-radius: 8px; padding: 1.5rem 1rem; text-align: center; cursor: pointer; background: rgba(212, 175, 55, 0.03); margin-bottom: 0.75rem;">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">🖼️</div>
              <div style="font-size: 0.85rem; color: #e2e8f0; font-weight: 600;">Kéo thả ảnh hoặc Bấm để chọn</div>
              <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">Các bức tranh / bảo vật trên tường</div>
              <input id="photo-input" type="file" multiple accept="image/*" style="display: none;" />
            </div>

            <div id="selected-photos-count" style="font-size: 0.8rem; color: #d4af37; font-weight: 600;">
              Chưa có ảnh nào được chọn
            </div>
          </div>
        </div>

        <!-- Progress Tracker -->
        <div id="pipeline-progress-container" style="display: none; background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem;">
            <span id="pipeline-step-text">Đang gửi dữ liệu lên Queue RabbitMQ...</span>
            <span id="pipeline-progress-pct" style="color: #38bdf8;">0%</span>
          </div>
          <div style="width: 100%; height: 8px; background: #1e293b; border-radius: 4px; overflow: hidden;">
            <div id="pipeline-progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #38bdf8, #22c55e); transition: width 0.3s ease;"></div>
          </div>
        </div>

        <!-- Submit Button -->
        <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
          <button id="admin-cancel-btn" style="padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Hủy Bỏ
          </button>
          <button id="admin-submit-pipeline-btn" style="padding: 0.75rem 2rem; background: linear-gradient(135deg, #d4af37, #b8860b); border: none; color: #000; font-weight: 800; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
            <span>🚀</span> Bắt Đầu Pipeline 3D Gaussian Splatting
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
    const videoPreview = modal.querySelector("#admin-camera-preview") as HTMLVideoElement;
    const placeholder = modal.querySelector("#camera-placeholder") as HTMLElement;
    const recordingBadge = modal.querySelector("#recording-badge") as HTMLElement;
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

    // Toggle Camera
    toggleCamBtn?.addEventListener("click", async () => {
      if (!this.mediaStream) {
        try {
          this.mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
            audio: false,
          });
          videoPreview.srcObject = this.mediaStream;
          videoPreview.style.display = "block";
          placeholder.style.display = "none";
          toggleCamBtn.textContent = "Tắt Camera";
          recordBtn.disabled = false;
          recordBtn.style.opacity = "1";
        } catch (err) {
          alert("Không thể truy cập camera: " + (err as Error).message);
        }
      } else {
        this.stopCamera();
        videoPreview.style.display = "none";
        placeholder.style.display = "block";
        toggleCamBtn.textContent = "Bật Camera";
        recordBtn.disabled = true;
        recordBtn.style.opacity = "0.5";
      }
    });

    // Recording Video
    let isRecording = false;
    recordBtn?.addEventListener("click", () => {
      if (!this.mediaStream) return;

      if (!isRecording) {
        // Start recording
        this.recordedChunks = [];
        this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType: "video/webm" });
        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) this.recordedChunks.push(e.data);
        };
        this.mediaRecorder.onstop = () => {
          this.recordedVideoBlob = new Blob(this.recordedChunks, { type: "video/webm" });
          console.log("[AdminCapture] Video recorded:", this.recordedVideoBlob.size, "bytes");
        };
        this.mediaRecorder.start();
        isRecording = true;
        recordBtn.textContent = "Dừng Quay";
        recordBtn.style.background = "#22c55e";
        recordingBadge.style.display = "block";
      } else {
        // Stop recording
        this.mediaRecorder?.stop();
        isRecording = false;
        recordBtn.textContent = "Quay Lại";
        recordBtn.style.background = "#9e1b1b";
        recordingBadge.style.display = "none";
      }
    });

    // High-Res Photos Selector
    dropzone?.addEventListener("click", () => photoInput.click());
    photoInput?.addEventListener("change", () => {
      if (photoInput.files) {
        this.highResFiles = Array.from(photoInput.files);
        photoCount.textContent = `Đã chọn ${this.highResFiles.length} ảnh chi tiết 8K`;
      }
    });

    // Submit Pipeline
    submitBtn?.addEventListener("click", async () => {
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
    const roomName = (modal.querySelector("#admin-room-name") as HTMLInputElement)?.value || "Sảnh Trưng Bày";

    progressBox.style.display = "block";

    const formData = new FormData();
    formData.append("roomName", roomName);

    // Video blob fallback if test without camera
    const videoFile = this.recordedVideoBlob
      ? new File([this.recordedVideoBlob], "room_scan.webm", { type: "video/webm" })
      : new File(["dummy video"], "room_scan_mock.mp4", { type: "video/mp4" });
    formData.append("video", videoFile);

    // High-res photos
    if (this.highResFiles.length === 0) {
      const dummyPhoto = new File(["dummy"], "photo_trong_dong.jpg", { type: "image/jpeg" });
      formData.append("photos", dummyPhoto);
    } else {
      this.highResFiles.forEach((file) => formData.append("photos", file));
    }

    try {
      progressText.textContent = "Đang gửi dữ liệu lên Backend API & RabbitMQ...";
      progressBar.style.width = "20%";
      progressPct.textContent = "20%";

      const apiHost = "http://localhost:3000";
      const response = await fetch(`${apiHost}/api/v1/tour/upload`, {
        method: "POST",
        body: formData,
      });

      const resJson = await response.json();
      if (!resJson.success) throw new Error(resJson.error || "Gửi thất bại");

      const jobId = resJson.data.jobId;
      console.log("[AdminCapture] Job created:", jobId);

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
              alert("🎉 Pipeline hoàn tất! File 3D Gaussian Splatting và các Hotspots đã sẵn sàng.");
              modal.remove();
            }
          }
        } catch {
          // Ignore network glitch during polling
        }
      }, 2000);
    } catch (err: any) {
      alert("Lỗi: " + err.message + "\n(Vui lòng đảm bảo Backend API trên Port 3000 đang hoạt động)");
      progressBox.style.display = "none";
    }
  }
}
