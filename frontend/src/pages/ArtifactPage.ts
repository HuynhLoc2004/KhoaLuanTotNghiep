import { ARTIFACTS_DATA } from "../data/artifacts";
import { MuseumConfigStore } from "../data/museumConfig";
import { Icons } from "../components/Icons";
import * as THREE from "three";

let currentArtifactIndex = 0;
let isSpeaking = false;
let speechUtterance: SpeechSynthesisUtterance | null = null;
let currentFilter: string = "all";
let currentPage: number = 1;
const ITEMS_PER_PAGE = 4;

let threeAnimId: number | null = null;
let threeGroup: THREE.Group | null = null;
let isWireframe = false;

// Multi-language translation map for placards and voice AI
const TRANSLATIONS: Record<string, Record<string, string>> = {
  "buddha-dong-duong": {
    vi: "Bảo vật quốc gia. Pho tượng Phật đứng bằng đồng thau, phong cách nghệ thuật Amaravati tiêu biểu với nếp gấp áo cà sa vắt qua vai trái. Di vật minh chứng cho giao lưu hàng hải văn hóa rực rỡ phương Nam.",
    en: "National Treasure. Standing bronze Buddha statue representing the distinctive Amaravati art style with monastic robe draped over the left shoulder, illustrating vibrant maritime cultural exchanges.",
    ja: "国宝。左肩に法衣をまとったアマラヴァティ様式のブロンズ製立仏像。古代東南アジアにおける海上交易と仏教文化の繁栄を証明する貴重な遺物です。",
    ko: "국보. 왼쪽 어깨에 가사를 걸친 독특한 아마라바티 양식의 청동 불상으로 고대 해양 문화 교류를 보여주는 유물입니다.",
    fr: "Trésor National. Statue de Bouddha debout en bronze de style Amaravati, drapée sur l'épaule gauche, témoignant des échanges maritimes historiques."
  },
  "trong-dong-dong-son": {
    vi: "Bảo vật thời kỳ đồ đồng rực rỡ của nền văn minh lúa nước sông Hồng. Mặt trống khắc họa mặt trời 12 tia, chim Lạc bay và cảnh người giã gạo, múa vũ trang.",
    en: "Dong Son Bronze Drum. Masterpiece of the Red River civilization featuring a 12-pointed sun, flying Lac birds, and warrior dancers.",
    ja: "ドンソン銅鼓。紅河文明の傑作であり、中央に12光線の太陽、周囲にラック鳥や舞踏の戦士が刻まれています。",
    ko: "동손 청동북. 12갈래 태양 광선과 락 새, 춤추는 전사들이 새겨진 홍강 문명의 대표 유물입니다.",
    fr: "Tambour de bronze de Dong Son. Chef-d'œuvre gravé d'un soleil à 12 rayons et d'oiseaux Lac sacrés."
  }
};

const SPEECH_LANG_CODES: Record<string, string> = {
  vi: "vi-VN",
  en: "en-US",
  ja: "ja-JP",
  ko: "ko-KR",
  fr: "fr-FR"
};

export function renderArtifactPage(): string {
  const artifact = ARTIFACTS_DATA[currentArtifactIndex] || ARTIFACTS_DATA[0];
  const lang = MuseumConfigStore.currentLanguage;
  const features = MuseumConfigStore.features;

  // Localized placard
  const localizedPlacard = (TRANSLATIONS[artifact.id] && TRANSLATIONS[artifact.id][lang])
    ? TRANSLATIONS[artifact.id][lang]
    : artifact.placardText;

  // Filtered artifacts
  const filtered = currentFilter === "all"
    ? ARTIFACTS_DATA
    : ARTIFACTS_DATA.filter(a => a.periodGroup === currentFilter);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  if (currentPage > totalPages) currentPage = 1;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return `
    <div class="page-viewport">
      <!-- Breadcrumb & Title -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div class="brand-subtitle">PHÒNG TRƯNG BÀY SỐ HÓA • ${lang.toUpperCase()}</div>
          <h1 style="font-size: 2rem; color: var(--color-primary); margin-top: 0.2rem;">${artifact.name}</h1>
          <div style="display: flex; gap: 0.6rem; margin-top: 0.4rem; flex-wrap: wrap;">
            <span class="badge-pill">${artifact.era}</span>
            <span class="badge-pill" style="background: rgba(var(--color-surface-rgb), 0.5);">${artifact.material}</span>
            <span class="badge-pill" style="background: rgba(51,104,160,0.1);">${artifact.location}</span>
          </div>
        </div>

        <!-- Quick Selector Dropdown -->
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <label style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted);">Chọn nhanh:</label>
          <select id="artifact-select" class="lang-select" style="padding: 0.55rem 1rem; font-size: 0.88rem;">
            ${ARTIFACTS_DATA.map((art, idx) => `
              <option value="${idx}" ${idx === currentArtifactIndex ? 'selected' : ''}>
                ${art.code} - ${art.name}
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- MAIN 2-COLUMN SPOTLIGHT SHOWCASE -->
      <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 2rem; margin-bottom: 2.5rem;">
        <!-- Left: 3D Interactive Stage or Fallback Photo -->
        <div class="card" style="padding: 0; position: relative; height: 500px; overflow: hidden; background: linear-gradient(180deg, rgba(200,223,219,0.2) 0%, rgba(242,239,231,0.6) 100%);">
          ${features.enable3D ? `
            <canvas id="artifact-3d-canvas" style="width: 100%; height: 100%; display: block;"></canvas>

            <!-- 3D Top HUD Controls -->
            <div style="position: absolute; top: 1rem; left: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <span style="background: rgba(255,255,255,0.92); backdrop-filter: blur(8px); padding: 0.35rem 0.8rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; color: var(--color-primary); border: 1px solid var(--color-card-border);">
                Kéo chuột xoay 360°
              </span>
              <button class="chip" id="toggle-wireframe-btn" style="padding: 0.3rem 0.75rem; font-size: 0.75rem;">
                Chế độ khung dây
              </button>
            </div>

            <!-- 3D Bottom Hotspots HUD -->
            <div style="position: absolute; bottom: 1rem; left: 1rem; right: 1rem; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.92); backdrop-filter: blur(10px); padding: 0.75rem 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--color-card-border); flex-wrap: wrap; gap: 0.5rem;">
              <div style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main);">
                Điểm chạm hoa văn: <b>${artifact.hotspots.length} điểm</b>
              </div>
              <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                ${artifact.hotspots.map((hs, i) => `
                  <button class="btn btn-outline hotspot-btn" data-index="${i}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">
                    ${hs.title}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : `
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem;">
              <img src="${artifact.thumbnail}" alt="${artifact.name}" style="max-height: 380px; max-width: 90%; border-radius: var(--radius-md); box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />
              <div style="margin-top: 1rem; font-size: 0.82rem; color: var(--color-text-muted); font-weight: 600;">
                (Chế độ xem ảnh sắc nét 2.5D - Tính năng 3D đang tạm khóa trong Cấu hình Bảo Tàng)
              </div>
            </div>
          `}
        </div>

        <!-- Right: Placard & Multi-Language Voice AI Reader -->
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <!-- Bảng Chú Thích Bảo Tàng Thực Tế -->
          <div class="card" style="border-left: 4px solid var(--color-primary);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem;">
              <span class="brand-subtitle" style="font-size: 0.75rem;">BẢNG CHÚ THÍCH TẠI TỦ KÍNH</span>
              <span class="mono" style="font-size: 0.8rem; font-weight: 700; color: var(--color-primary);">${artifact.code}</span>
            </div>

            <p style="font-size: 0.96rem; color: var(--color-text-main); line-height: 1.65; margin-bottom: 1.25rem;" id="placard-text">
              "${localizedPlacard}"
            </p>

            <div style="font-size: 0.8rem; color: var(--color-text-muted); display: flex; gap: 1.25rem; flex-wrap: wrap;">
              <span>Vị trí: <b>${artifact.room}</b></span>
              <span>Thời lượng: <b>${artifact.audioDuration}</b></span>
            </div>
          </div>

          <!-- Trình Phát Voice AI Thuyết Minh (Đa ngôn ngữ) -->
          ${features.enableVoiceAI ? `
            <div class="card" style="background: rgba(200, 223, 219, 0.25);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.65rem;">
                  <div style="width: 38px; height: 38px; border-radius: var(--radius-xs); background: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center;">
                    ${Icons.volume}
                  </div>
                  <div>
                    <div style="font-size: 0.92rem; font-weight: 700; color: var(--color-primary);">Voice AI Thuyết Minh Đa Ngữ</div>
                    <div style="font-size: 0.76rem; color: var(--color-text-muted);">Ngôn ngữ phát âm: <b>${SPEECH_LANG_CODES[lang] || 'vi-VN'}</b></div>
                  </div>
                </div>

                <!-- Animated Soundwave Bars -->
                <div style="display: flex; align-items: center; gap: 3px;" id="soundwave-container">
                  <div style="width: 4px; height: 12px; background: var(--color-secondary); border-radius: 2px;"></div>
                  <div style="width: 4px; height: 18px; background: var(--color-primary); border-radius: 2px;"></div>
                  <div style="width: 4px; height: 8px; background: var(--color-secondary); border-radius: 2px;"></div>
                  <div style="width: 4px; height: 22px; background: var(--color-primary); border-radius: 2px;"></div>
                  <div style="width: 4px; height: 14px; background: var(--color-secondary); border-radius: 2px;"></div>
                </div>
              </div>

              <div style="display: flex; gap: 0.75rem; align-items: center;">
                <button class="btn btn-primary" id="play-voice-btn" style="flex: 1;">
                  ${Icons.play}
                  <span id="voice-btn-label">Phát Giọng Đọc AI (${lang.toUpperCase()})</span>
                </button>

                <button class="btn btn-outline" id="stop-voice-btn" style="padding: 0.65rem 0.9rem;">
                  ${Icons.pause}
                  <span>Dừng</span>
                </button>
              </div>
            </div>
          ` : ''}

          <!-- Nút Chuyển Tiếp Sang Quiz (Nếu được bật) -->
          ${features.enableQuiz ? `
            <div class="card" style="text-align: center; background: rgba(51, 104, 160, 0.05); border: 1.5px dashed var(--color-secondary);">
              <div style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--color-primary);">
                Kiểm Tra Tri Thức Di Sản
              </div>
              <p style="font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 0.85rem;">
                Trả lời 2 câu hỏi từ bảng chú thích để nhận tem vào Hộ chiếu số.
              </p>
              <a href="#quiz" class="btn btn-outline" style="width: 100%;">
                ${Icons.quiz}
                <span>Thử Thách Đố Vui Ngay</span>
              </a>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- =========================================================
           PAGINATED HERITAGE CATALOG SECTION (PHÂN TRANG & BỘ LỌC)
      ========================================================= -->
      <section style="border-top: 1px solid var(--color-card-border); padding-top: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div class="brand-subtitle">DANH MỤC HIỆN VẬT</div>
            <h2 style="font-size: 1.6rem; color: var(--color-primary);">Kho Tàng Cổ Vật Theo Thời Kỳ</h2>
          </div>
          <div style="font-size: 0.84rem; color: var(--color-text-muted); font-weight: 600;">
            Hiển thị <b>${filtered.length > 0 ? startIndex + 1 : 0} - ${Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)}</b> trên <b>${filtered.length}</b> hiện vật
          </div>
        </div>

        <!-- Filter Chips -->
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;" id="era-filter-chips">
          <button class="chip ${currentFilter === 'all' ? 'active' : ''}" data-era="all">
            Tất cả (${ARTIFACTS_DATA.length})
          </button>
          <button class="chip ${currentFilter === 'dong-son' ? 'active' : ''}" data-era="dong-son">
            Đông Sơn
          </button>
          <button class="chip ${currentFilter === 'sa-huynh' ? 'active' : ''}" data-era="sa-huynh">
            Sa Huỳnh
          </button>
          <button class="chip ${currentFilter === 'oc-eo' ? 'active' : ''}" data-era="oc-eo">
            Óc Eo
          </button>
          <button class="chip ${currentFilter === 'champa' ? 'active' : ''}" data-era="champa">
            Champa
          </button>
          <button class="chip ${currentFilter === 'trieu-nguyen' ? 'active' : ''}" data-era="trieu-nguyen">
            Triều Nguyễn
          </button>
        </div>

        <!-- 4-Item Grid for Clean Scannable Layout -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
          ${pageItems.map((item) => {
            const globalIdx = ARTIFACTS_DATA.findIndex(a => a.id === item.id);
            const isSelected = globalIdx === currentArtifactIndex;

            return `
              <div class="card artifact-grid-card" style="display: flex; flex-direction: column; justify-content: space-between; border: 1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-card-border)'}; ${isSelected ? 'background: rgba(var(--color-surface-rgb), 0.25);' : ''}">
                <div>
                  <!-- Image thumbnail -->
                  <div style="height: 160px; border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 1rem; position: relative; background: #e5e5e5;">
                    <img src="${item.thumbnail}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
                    <span style="position: absolute; top: 0.5rem; left: 0.5rem; background: rgba(0,0,0,0.65); color: #fff; padding: 0.2rem 0.55rem; border-radius: var(--radius-xs); font-size: 0.72rem; font-weight: 700;" class="mono">
                      ${item.code}
                    </span>
                  </div>

                  <div style="display: flex; gap: 0.4rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
                    <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 7px;">${item.era}</span>
                    <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 7px; background: rgba(var(--color-surface-rgb), 0.5);">${item.room}</span>
                  </div>

                  <h3 style="font-size: 1.05rem; margin-bottom: 0.4rem; color: var(--color-primary);">
                    ${item.name}
                  </h3>
                  
                  <p style="font-size: 0.82rem; color: var(--color-text-muted); line-height: 1.45; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${item.placardText}
                  </p>
                </div>

                <button class="btn ${isSelected ? 'btn-primary' : 'btn-outline'} select-artifact-btn" data-index="${globalIdx}" style="width: 100%; font-size: 0.82rem; padding: 0.55rem;">
                  ${Icons.cube}
                  <span>${isSelected ? 'Đang Xem' : 'Xem Chi Tiết'}</span>
                </button>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Pagination Controls Bar -->
        <div class="pagination">
          <button class="page-btn" id="prev-page-btn" ${currentPage === 1 ? 'disabled' : ''} aria-label="Trang trước">
            ${Icons.chevronLeft}
          </button>

          ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
            <button class="page-btn ${p === currentPage ? 'active' : ''} page-num-btn" data-page="${p}">
              ${p}
            </button>
          `).join('')}

          <button class="page-btn" id="next-page-btn" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Trang tiếp">
            ${Icons.chevronRight}
          </button>
        </div>
      </section>
    </div>
  `;
}

export function initArtifactPageLogic() {
  const features = MuseumConfigStore.features;

  // Dropdown selector
  const select = document.getElementById("artifact-select") as HTMLSelectElement;
  if (select) {
    select.addEventListener("change", (e) => {
      currentArtifactIndex = parseInt((e.target as HTMLSelectElement).value, 10);
      stopSpeech();
      refreshPage();
    });
  }

  // Era filter chips
  const chips = document.querySelectorAll("#era-filter-chips .chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      currentFilter = chip.getAttribute("data-era") || "all";
      currentPage = 1;
      refreshPage();
    });
  });

  // Pagination buttons
  const prevBtn = document.getElementById("prev-page-btn");
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        refreshPage();
      }
    });
  }

  const nextBtn = document.getElementById("next-page-btn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentPage++;
      refreshPage();
    });
  }

  const pageNumBtns = document.querySelectorAll(".page-num-btn");
  pageNumBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      currentPage = parseInt(btn.getAttribute("data-page") || "1", 10);
      refreshPage();
    });
  });

  // Select artifact from grid
  const selectBtns = document.querySelectorAll(".select-artifact-btn");
  selectBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      currentArtifactIndex = parseInt(btn.getAttribute("data-index") || "0", 10);
      stopSpeech();
      refreshPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // Voice AI speech synthesis with Multi-Language Code
  const playBtn = document.getElementById("play-voice-btn");
  const stopBtn = document.getElementById("stop-voice-btn");
  const voiceLabel = document.getElementById("voice-btn-label");
  const soundwaves = document.querySelectorAll("#soundwave-container div");

  function setSoundwaveActive(active: boolean) {
    soundwaves.forEach((sw) => {
      (sw as HTMLElement).style.animation = active ? "soundwave 0.8s infinite ease-in-out alternate" : "none";
    });
  }

  function stopSpeech() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      isSpeaking = false;
      const lang = MuseumConfigStore.currentLanguage;
      if (voiceLabel) voiceLabel.textContent = `Phát Giọng Đọc AI (${lang.toUpperCase()})`;
      setSoundwaveActive(false);
    }
  }

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      if (!window.speechSynthesis) {
        alert("Trình duyệt không hỗ trợ Web Speech API!");
        return;
      }

      if (isSpeaking) {
        stopSpeech();
        return;
      }

      const lang = MuseumConfigStore.currentLanguage;
      const artifact = ARTIFACTS_DATA[currentArtifactIndex];
      const text = (TRANSLATIONS[artifact.id] && TRANSLATIONS[artifact.id][lang])
        ? TRANSLATIONS[artifact.id][lang]
        : artifact.placardText;

      speechUtterance = new SpeechSynthesisUtterance(text);
      speechUtterance.lang = SPEECH_LANG_CODES[lang] || "vi-VN";
      speechUtterance.rate = 0.95;

      speechUtterance.onstart = () => {
        isSpeaking = true;
        if (voiceLabel) voiceLabel.textContent = "Tạm Dừng Giọng Đọc";
        setSoundwaveActive(true);
      };

      speechUtterance.onend = () => {
        stopSpeech();
      };

      speechUtterance.onerror = () => {
        stopSpeech();
      };

      window.speechSynthesis.speak(speechUtterance);
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener("click", stopSpeech);
  }

  // Toggle wireframe mode
  const wireframeBtn = document.getElementById("toggle-wireframe-btn");
  if (wireframeBtn) {
    wireframeBtn.addEventListener("click", () => {
      isWireframe = !isWireframe;
      wireframeBtn.classList.toggle("active", isWireframe);
      wireframeBtn.textContent = isWireframe ? "Chế độ bóng đặc" : "Chế độ khung dây";
      if (threeGroup) {
        threeGroup.traverse((child: any) => {
          if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m: any) => m.wireframe = isWireframe);
            } else {
              child.material.wireframe = isWireframe;
            }
          }
        });
      }
    });
  }

  // Hotspots clicks
  const hotspotBtns = document.querySelectorAll(".hotspot-btn");
  hotspotBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const hIndex = parseInt(btn.getAttribute("data-index") || "0", 10);
      const hs = ARTIFACTS_DATA[currentArtifactIndex].hotspots[hIndex];
      alert(`[Điểm chạm: ${hs.title}]\n\n${hs.description}`);
    });
  });

  // Init 3D Canvas if enabled
  if (features.enable3D) {
    initArtifact3D(currentArtifactIndex);
  }
}

function refreshPage() {
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

function initArtifact3D(index: number) {
  if (threeAnimId) {
    cancelAnimationFrame(threeAnimId);
    threeAnimId = null;
  }

  const canvas = document.getElementById("artifact-3d-canvas") as HTMLCanvasElement;
  if (!canvas) return;

  const width = canvas.clientWidth || 600;
  const height = canvas.clientHeight || 500;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 4.5);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lights
  const amb = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(amb);

  const keyLight = new THREE.DirectionalLight(0x66a3bf, 2.8);
  keyLight.position.set(5, 8, 6);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x3368a0, 2.0);
  fillLight.position.set(-5, -4, -4);
  scene.add(fillLight);

  const group = new THREE.Group();
  threeGroup = group;

  // Distinct procedural geometries
  const art = ARTIFACTS_DATA[index];
  let geometry: THREE.BufferGeometry;
  let material: THREE.MeshStandardMaterial;

  if (art.periodGroup === "champa") {
    geometry = new THREE.CylinderGeometry(0.5, 0.7, 2.4, 32);
    material = new THREE.MeshStandardMaterial({ color: 0xb59458, roughness: 0.35, metalness: 0.7, wireframe: isWireframe });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 32), material);
    head.position.y = 1.45;
    group.add(head);
  } else if (art.periodGroup === "dong-son") {
    geometry = new THREE.CylinderGeometry(1.2, 0.9, 1.4, 32);
    material = new THREE.MeshStandardMaterial({ color: 0x3d6860, roughness: 0.45, metalness: 0.65, wireframe: isWireframe });
  } else if (art.periodGroup === "trieu-nguyen") {
    geometry = new THREE.TorusGeometry(1.0, 0.35, 24, 64);
    material = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.9, wireframe: isWireframe });
  } else if (art.periodGroup === "sa-huynh") {
    geometry = new THREE.TorusKnotGeometry(0.7, 0.25, 64, 16);
    material = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.25, metalness: 0.5, wireframe: isWireframe });
  } else {
    geometry = new THREE.BoxGeometry(1.2, 2.0, 0.6);
    material = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7, metalness: 0.1, wireframe: isWireframe });
  }

  const mainMesh = new THREE.Mesh(geometry, material);
  group.add(mainMesh);
  scene.add(group);

  // Drag controls
  let isDragging = false;
  let prevX = 0;
  let prevY = 0;

  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    prevX = e.clientX;
    prevY = e.clientY;
  });

  window.addEventListener("mouseup", () => { isDragging = false; });

  canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
      group.rotation.y += (e.clientX - prevX) * 0.01;
      group.rotation.x += (e.clientY - prevY) * 0.01;
      prevX = e.clientX;
      prevY = e.clientY;
    }
  });

  const animate = () => {
    threeAnimId = requestAnimationFrame(animate);
    if (!isDragging) {
      group.rotation.y += 0.004;
    }
    renderer.render(scene, camera);
  };

  animate();
}
