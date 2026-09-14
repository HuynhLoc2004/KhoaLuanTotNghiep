import { ARTIFACTS_DATA } from "../data/artifacts";
import { MuseumConfigStore } from "../data/museumConfig";
import { Icons } from "../components/Icons";
import * as THREE from "three";

let heroAnimId: number | null = null;

export function renderHomePage(): string {
  const featured = ARTIFACTS_DATA[0];
  const branding = MuseumConfigStore.branding;
  const features = MuseumConfigStore.features;

  return `
    <div class="page-viewport">
      <!-- HERO ASYMMETRICAL SECTION -->
      <section class="card" style="margin-bottom: 2rem; padding: 2.5rem; background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(200,223,219,0.35) 100%);">
        <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 2.5rem; align-items: center;">
          <div>
            <div class="badge-pill" style="margin-bottom: 1.25rem; display: inline-flex;">
              ${branding.subName}
            </div>
            
            <h1 style="font-size: 2.4rem; font-weight: 800; color: var(--color-primary); margin-bottom: 1rem; line-height: 1.2;">
              Khám Phá Di Sản ${branding.name} Bằng Trải Nghiệm 3D & Giọng Đọc AI
            </h1>
            
            <p style="color: var(--color-text-muted); font-size: 1rem; margin-bottom: 1.75rem; line-height: 1.6;">
              Dành cho khách tham quan và học sinh: Xoay ngắm hiện vật 3D 360 độ, nghe giọng đọc AI chuẩn bảng chú thích thực tế, sưu tập tem số và đặt lịch theo lớp học.
            </p>

            <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem;">
              <a href="#artifact" class="btn btn-primary">
                ${Icons.cube}
                <span>Soi Hiện Vật 3D & Voice AI</span>
              </a>
              ${features.enableTourBooking ? `
                <a href="#booking" class="btn btn-outline">
                  ${Icons.calendar}
                  <span>Đặt Lịch Tour Theo Đoàn</span>
                </a>
              ` : ''}
            </div>

            <div style="display: flex; gap: 2.5rem; border-top: 1px solid var(--color-card-border); padding-top: 1.25rem; flex-wrap: wrap;">
              <div>
                <div style="font-size: 1.4rem; font-weight: 800; color: var(--color-primary);" class="mono">20,000+</div>
                <div style="font-size: 0.78rem; color: var(--color-text-muted); font-weight: 600;">Hiện vật lưu trữ</div>
              </div>
              <div>
                <div style="font-size: 1.4rem; font-weight: 800; color: var(--color-secondary);" class="mono">100%</div>
                <div style="font-size: 0.78rem; color: var(--color-text-muted); font-weight: 600;">Bảng chú thích thật</div>
              </div>
              <div>
                <div style="font-size: 1.4rem; font-weight: 800; color: var(--color-primary);" class="mono">&lt; 100ms</div>
                <div style="font-size: 0.78rem; color: var(--color-text-muted); font-weight: 600;">Tốc độ soát vé QR</div>
              </div>
            </div>
          </div>

          <!-- Hero 3D Interactive Viewport -->
          <div style="position: relative; height: 380px; background: rgba(200, 223, 219, 0.25); border: 1.5px solid var(--color-secondary); border-radius: var(--radius-lg); overflow: hidden; display: flex; align-items: center; justify-content: center;">
            ${features.enable3D ? `
              <canvas id="hero-3d-canvas" style="width: 100%; height: 100%; display: block;"></canvas>
              
              <div style="position: absolute; top: 1rem; left: 1rem; background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(8px); padding: 0.4rem 0.85rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; color: var(--color-primary); border: 1px solid var(--color-card-border);">
                Xoay 360° • ${featured.name}
              </div>

              <a href="#artifact" class="btn btn-primary" style="position: absolute; bottom: 1rem; right: 1rem; padding: 0.45rem 0.95rem; font-size: 0.8rem;">
                <span>Chi Tiết Hiện Vật</span>
                ${Icons.arrowRight}
              </a>
            ` : `
              <img src="${featured.thumbnail}" alt="${featured.name}" style="max-height: 280px; max-width: 90%; border-radius: var(--radius-md);" />
            `}
          </div>
        </div>
      </section>

      <!-- LIVE RADAR NOTIFICATION -->
      <section class="card" style="margin-bottom: 2rem; padding: 1.25rem 1.75rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; background: rgba(200, 223, 219, 0.35);">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="width: 42px; height: 42px; border-radius: 50%; background: var(--color-primary); display: flex; align-items: center; justify-content: center; color: #fff;">
            ${Icons.location}
          </div>
          <div>
            <div style="font-size: 0.92rem; font-weight: 700; color: var(--color-primary);">
              Định Vị Không Gian Bảo Tàng
            </div>
            <div style="font-size: 0.82rem; color: var(--color-text-muted);">
              Phát hiện cổ vật gần bạn: <b>Tượng Phật Đồng Dương (3m)</b>, <b>Trống Đồng Đông Sơn (7m)</b>.
            </div>
          </div>
        </div>

        <a href="#artifact" class="btn btn-outline" style="padding: 0.45rem 1rem; font-size: 0.82rem;">
          <span>Xem Kho Hiện Vật</span>
          ${Icons.arrowRight}
        </a>
      </section>

      <!-- CORE PILLARS SECTION -->
      <div style="margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <div class="brand-subtitle">TRẢI NGHIỆM TRỌNG TÂM</div>
          <h2 style="font-size: 1.6rem; color: var(--color-primary);">Tính Năng Số Hóa Dành Cho Khách</h2>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
        <!-- Card 1: 3D & Voice AI -->
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
              ${Icons.cube}
            </div>
            <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--color-primary);">Hiện Vật 3D & Voice AI</h3>
            <p style="color: var(--color-text-muted); font-size: 0.88rem; margin-bottom: 1.25rem; line-height: 1.55;">
              Mô hình 3D tương tác 360 độ kèm giọng đọc AI tự động chuyển hóa từ bảng chú thích tại bảo tàng.
            </p>
          </div>
          <a href="#artifact" class="btn btn-outline" style="width: 100%;">
            <span>Khám Phá Hiện Vật</span>
            ${Icons.arrowRight}
          </a>
        </div>

        <!-- Card 2: Quiz & Passport Stamps -->
        ${features.enableQuiz ? `
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
                ${Icons.quiz}
              </div>
              <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--color-primary);">Đố Vui & Sưu Tập Tem</h3>
              <p style="color: var(--color-text-muted); font-size: 0.88rem; margin-bottom: 1.25rem; line-height: 1.55;">
                Trả lời câu hỏi trắc nghiệm nhanh để nhận tem số vào Hộ chiếu di sản và tăng hạng danh hiệu.
              </p>
            </div>
            <a href="#quiz" class="btn btn-outline" style="width: 100%;">
              <span>Làm Bài Đố Vui</span>
              ${Icons.arrowRight}
            </a>
          </div>
        ` : ''}

        <!-- Card 3: Group Booking -->
        ${features.enableTourBooking ? `
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
                ${Icons.ticket}
              </div>
              <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--color-primary);">Đặt Lịch Tham Quan Theo Đoàn</h3>
              <p style="color: var(--color-text-muted); font-size: 0.88rem; margin-bottom: 1.25rem; line-height: 1.55;">
                Đăng ký ca giờ cho học sinh và đoàn tham quan, nhận thẻ vé QR điện tử để vào cổng tức thì.
              </p>
            </div>
            <a href="#booking" class="btn btn-outline" style="width: 100%;">
              <span>Đăng Ký Tour Ngay</span>
              ${Icons.arrowRight}
            </a>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

export function initHomePageLogic() {
  if (heroAnimId) {
    cancelAnimationFrame(heroAnimId);
    heroAnimId = null;
  }

  const canvas = document.getElementById("hero-3d-canvas") as HTMLCanvasElement;
  if (!canvas) return;

  const width = canvas.clientWidth || 400;
  const height = canvas.clientHeight || 380;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 4.2);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const amb = new THREE.AmbientLight(0xffffff, 1.4);
  scene.add(amb);

  const dirLight = new THREE.DirectionalLight(0x66a3bf, 2.5);
  dirLight.position.set(5, 8, 5);
  scene.add(dirLight);

  const group = new THREE.Group();

  const bodyGeo = new THREE.CylinderGeometry(0.45, 0.65, 2.2, 32);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xb59458, roughness: 0.35, metalness: 0.7 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  const headGeo = new THREE.SphereGeometry(0.4, 32, 32);
  const head = new THREE.Mesh(headGeo, bodyMat);
  head.position.y = 1.35;
  group.add(head);

  scene.add(group);

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
    heroAnimId = requestAnimationFrame(animate);
    if (!isDragging) {
      group.rotation.y += 0.005;
    }
    renderer.render(scene, camera);
  };

  animate();
}

export const initHomePage3D = initHomePageLogic;
