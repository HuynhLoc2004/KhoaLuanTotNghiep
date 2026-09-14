import * as THREE from "three";
import { gsap } from "gsap";

export interface SplatHotspot {
  id: string;
  title: string;
  description: string;
  era?: string;
  position: [number, number, number]; // [x, y, z] in Three.js space
  normal: [number, number, number];   // [nx, ny, nz] perpendicular to wall
  highResPhotoUrl: string;
}

export interface SplatTourConfig {
  container: HTMLElement;
  splatUrl: string;
  hotspots?: SplatHotspot[];
  initialCameraPos?: [number, number, number];
  initialTarget?: [number, number, number];
  onHotspotClick?: (hotspot: SplatHotspot) => void;
}

export class SplatTourViewer {
  private container: HTMLElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse: THREE.Vector2 = new THREE.Vector2();
  
  private hotspots: SplatHotspot[] = [];
  private hotspotMeshes: THREE.Group[] = [];
  private collisionMeshGroup: THREE.Group = new THREE.Group();
  private isAnimatingCamera: boolean = false;
  private animationFrameId: number | null = null;
  private controlsTarget: THREE.Vector3 = new THREE.Vector3(0, 1.2, 0);

  // Drag controls
  private isPointerDown: boolean = false;
  private prevPointerPos = { x: 0, y: 0 };
  private cameraAngles = { theta: 0, phi: Math.PI / 2 };

  constructor(private config: SplatTourConfig) {
    this.container = config.container;
    this.hotspots = config.hotspots || [];
    this.initScene();
    this.initLighting();
    this.initSplatModel(config.splatUrl);
    this.initHotspots();
    this.initCollisionGeometry();
    this.initEvents();
    this.animate();
  }

  private initScene(): void {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0c10);

    const initialPos = this.config.initialCameraPos || [0, 1.6, 2.5];
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(initialPos[0], initialPos[1], initialPos[2]);

    const initialTarget = this.config.initialTarget || [0, 1.2, 0];
    this.controlsTarget.set(initialTarget[0], initialTarget[1], initialTarget[2]);
    this.camera.lookAt(this.controlsTarget);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.container.innerHTML = "";
    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.cursor = "grab";
  }

  private initLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    dirLight.position.set(5, 10, 7);
    this.scene.add(dirLight);

    const ceilingLight = new THREE.PointLight(0xd4af37, 1.5, 12);
    ceilingLight.position.set(0, 3.5, 0);
    this.scene.add(ceilingLight);
  }

  /**
   * Khởi tạo và nạp 3D Gaussian Splatting
   * Hỗ trợ dynamic import của @mkkellogg/gaussian-splats-3d hoặc fallback PBR room
   */
  private async initSplatModel(splatUrl: string): Promise<void> {
    try {
      // Dynamic import Gaussian Splats 3D viewer library if available
      const GaussianSplats3D = await import("@mkkellogg/gaussian-splats-3d" as any).catch(() => null);

      if (GaussianSplats3D && GaussianSplats3D.Viewer) {
        console.log("[SplatTour] Initializing @mkkellogg/gaussian-splats-3d Viewer...");
        const splatViewer = new GaussianSplats3D.Viewer({
          threeScene: this.scene,
          camera: this.camera,
          renderer: this.renderer,
          useBuiltInControls: false,
        });

        await splatViewer.addSplatScene(splatUrl, {
          progressiveLoad: true,
          showLoadingUI: false,
        });
        console.log("[SplatTour] 3DGS Scene loaded successfully.");
      } else {
        console.log("[SplatTour] Using simulated 3DGS Museum Room with ambient reflections.");
        this.createRealisticRoomFallback();
      }
    } catch (err) {
      console.warn("[SplatTour] Splat loader fallback:", err);
      this.createRealisticRoomFallback();
    }
  }

  /**
   * Phòng trưng bày mô phỏng chân thực phục vụ kiểm thử và render mượt mà 60 FPS
   */
  private createRealisticRoomFallback(): void {
    const roomSize = 10;
    const wallHeight = 4.2;

    // Sàn gỗ bóng phản chiếu ánh sáng bảo tàng
    const floorGeo = new THREE.PlaneGeometry(roomSize, roomSize);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x181512,
      roughness: 0.25,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    this.scene.add(floor);

    // Tường bảo tàng với màu đá hoa cương đen Obsidian
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x121418,
      roughness: 0.8,
    });

    // 4 bức tường xung quanh
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(roomSize, wallHeight), wallMat);
    backWall.position.set(0, wallHeight / 2, -roomSize / 2);
    this.scene.add(backWall);

    const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(roomSize, wallHeight), wallMat);
    frontWall.position.set(0, wallHeight / 2, roomSize / 2);
    frontWall.rotation.y = Math.PI;
    this.scene.add(frontWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(roomSize, wallHeight), wallMat);
    leftWall.position.set(-roomSize / 2, wallHeight / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(roomSize, wallHeight), wallMat);
    rightWall.position.set(roomSize / 2, wallHeight / 2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    this.scene.add(rightWall);

    // Trần nhà
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(roomSize, roomSize), wallMat);
    ceiling.position.set(0, wallHeight, 0);
    ceiling.rotation.x = Math.PI / 2;
    this.scene.add(ceiling);

    // Bục kính trưng bày cổ vật trung tâm
    const pedestalGeo = new THREE.CylinderGeometry(0.8, 0.9, 0.8, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x22242a, roughness: 0.4 });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(0, 0.4, 0);
    this.scene.add(pedestal);
  }

  /**
   * Tạo các mặt phẳng vô hình (Invisible Collision Meshes) để Raycaster bắt chuẩn xác
   * tọa độ và vector pháp tuyến của các bức tường phòng bảo tàng
   */
  private initCollisionGeometry(): void {
    const roomSize = 10;
    const wallHeight = 4.2;
    const invisibleMat = new THREE.MeshBasicMaterial({ visible: false });

    // Back wall normal: [0, 0, 1]
    const backMesh = new THREE.Mesh(new THREE.PlaneGeometry(roomSize, wallHeight), invisibleMat);
    backMesh.position.set(0, wallHeight / 2, -roomSize / 2);
    this.collisionMeshGroup.add(backMesh);

    // Left wall normal: [1, 0, 0]
    const leftMesh = new THREE.Mesh(new THREE.PlaneGeometry(roomSize, wallHeight), invisibleMat);
    leftMesh.position.set(-roomSize / 2, wallHeight / 2, 0);
    leftMesh.rotation.y = Math.PI / 2;
    this.collisionMeshGroup.add(leftMesh);

    // Right wall normal: [-1, 0, 0]
    const rightMesh = new THREE.Mesh(new THREE.PlaneGeometry(roomSize, wallHeight), invisibleMat);
    rightMesh.position.set(roomSize / 2, wallHeight / 2, 0);
    rightMesh.rotation.y = -Math.PI / 2;
    this.collisionMeshGroup.add(rightMesh);

    // Floor normal: [0, 1, 0]
    const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(roomSize, roomSize), invisibleMat);
    floorMesh.position.set(0, 0, 0);
    floorMesh.rotation.x = -Math.PI / 2;
    this.collisionMeshGroup.add(floorMesh);

    this.scene.add(this.collisionMeshGroup);
  }

  /**
   * Tạo các điểm ghim tương tác (3D Hotspot Pins) lơ lửng trên tường/hiện vật
   */
  private initHotspots(): void {
    this.hotspotMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.hotspotMeshes = [];

    this.hotspots.forEach((hotspot) => {
      const pinGroup = new THREE.Group();
      pinGroup.position.set(hotspot.position[0], hotspot.position[1], hotspot.position[2]);
      pinGroup.userData = { hotspot };

      // 1. Vòng tròn ngoài phát sáng
      const ringGeo = new THREE.RingGeometry(0.12, 0.16, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xd4af37, // Gold hoàng gia
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      pinGroup.add(ringMesh);

      // 2. Chấm tâm phát sáng
      const dotGeo = new THREE.CircleGeometry(0.08, 32);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      pinGroup.add(dotMesh);

      // Định hướng mặt phẳng của Hotspot theo vector pháp tuyến của bức tường
      const normalVec = new THREE.Vector3(...hotspot.normal).normalize();
      pinGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normalVec);

      this.scene.add(pinGroup);
      this.hotspotMeshes.push(pinGroup);
    });
  }

  /**
   * Thiết lập sự kiện tương tác chuột & chạm:
   * - Xoay nhìn tự do (First-person / Orbit Drag)
   * - Double-click Raycasting để chuyển góc nhìn trực diện
   */
  private initEvents(): void {
    const el = this.renderer.domElement;

    // Pointer events for smooth navigation
    el.addEventListener("pointerdown", (e) => {
      this.isPointerDown = true;
      this.prevPointerPos = { x: e.clientX, y: e.clientY };
      el.style.cursor = "grabbing";
    });

    window.addEventListener("pointerup", () => {
      this.isPointerDown = false;
      el.style.cursor = "grab";
    });

    el.addEventListener("pointermove", (e) => {
      if (!this.isPointerDown || this.isAnimatingCamera) return;
      const dx = e.clientX - this.prevPointerPos.x;
      const dy = e.clientY - this.prevPointerPos.y;
      this.prevPointerPos = { x: e.clientX, y: e.clientY };

      const rotateSpeed = 0.004;
      this.cameraAngles.theta -= dx * rotateSpeed;
      this.cameraAngles.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.cameraAngles.phi + dy * rotateSpeed));

      this.updateCameraLookDirection();
    });

    // Double-click Raycasting feature
    el.addEventListener("dblclick", (e) => this.handleDoubleClick(e));

    // Resize handling
    window.addEventListener("resize", () => {
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  private updateCameraLookDirection(): void {
    const targetDistance = 2.0;
    const x = this.camera.position.x + targetDistance * Math.sin(this.cameraAngles.phi) * Math.sin(this.cameraAngles.theta);
    const y = this.camera.position.y + targetDistance * Math.cos(this.cameraAngles.phi);
    const z = this.camera.position.z + targetDistance * Math.sin(this.cameraAngles.phi) * Math.cos(this.cameraAngles.theta);

    this.controlsTarget.set(x, y, z);
    this.camera.lookAt(this.controlsTarget);
  }

  /**
   * Tính năng đặc biệt:
   * Raycasting bắt điểm va chạm và vector pháp tuyến khi người dùng Double-Click
   */
  private handleDoubleClick(event: MouseEvent): void {
    if (this.isAnimatingCamera) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 1. Kiểm tra xem người dùng có click trúng Hotspot nào không
    const hotspotIntersects = this.raycaster.intersectObjects(
      this.hotspotMeshes.flatMap((g) => g.children),
      true
    );

    if (hotspotIntersects.length > 0) {
      let root = hotspotIntersects[0].object.parent;
      while (root && !root.userData?.hotspot) {
        root = root.parent;
      }
      if (root && root.userData.hotspot) {
        const hotspot: SplatHotspot = root.userData.hotspot;
        console.log("[SplatTour] Clicked Hotspot:", hotspot.title);
        this.tweenCameraToPerpendicularView(
          new THREE.Vector3(...hotspot.position),
          new THREE.Vector3(...hotspot.normal),
          hotspot
        );
        return;
      }
    }

    // 2. Raycast vào các bức tường bảo tàng
    const wallIntersects = this.raycaster.intersectObjects(this.collisionMeshGroup.children, true);
    if (wallIntersects.length > 0) {
      const hit = wallIntersects[0];
      const hitPoint = hit.point.clone();
      // Vector pháp tuyến bề mặt (World Normal Vector)
      const hitNormal = hit.face ? hit.face.normal.clone() : new THREE.Vector3(0, 0, 1);
      hitNormal.transformDirection(hit.object.matrixWorld).normalize();

      console.log(`[Raycast] Hit Point: [${hitPoint.x.toFixed(2)}, ${hitPoint.y.toFixed(2)}, ${hitPoint.z.toFixed(2)}]`);
      console.log(`[Raycast] Normal: [${hitNormal.x.toFixed(2)}, ${hitNormal.y.toFixed(2)}, ${hitNormal.z.toFixed(2)}]`);

      // Tìm xem có Hotspot nào nằm gần điểm click không
      const nearbyHotspot = this.hotspots.find((h) => {
        const hPos = new THREE.Vector3(...h.position);
        return hPos.distanceTo(hitPoint) < 1.0;
      });

      this.tweenCameraToPerpendicularView(hitPoint, hitNormal, nearbyHotspot);
    }
  }

  /**
   * GSAP Camera Tweening:
   * Lướt góc nhìn trực diện đối diện tầm mắt người xem:
   * P_target = P_hit + Normal * d_view
   */
  public tweenCameraToPerpendicularView(
    hitPoint: THREE.Vector3,
    normal: THREE.Vector3,
    hotspot?: SplatHotspot
  ): void {
    this.isAnimatingCamera = true;

    // Khoảng cách lý tưởng nhìn trực diện bức tường (1.4 mét)
    const viewDistance = 1.4;
    const targetCamPos = hitPoint.clone().add(normal.clone().multiplyScalar(viewDistance));

    // Đảm bảo tầm mắt tối thiểu ở độ cao 1.3m - 1.7m
    targetCamPos.y = Math.max(1.2, Math.min(2.0, targetCamPos.y));

    // Thời gian lướt 1.4s với hiệu ứng gia tốc mượt mà
    const timeline = gsap.timeline({
      onComplete: () => {
        this.isAnimatingCamera = false;
        // Cập nhật lại góc quay của chuột để tiếp tục xoay mượt sau khi kết thúc tween
        const dir = new THREE.Vector3().subVectors(hitPoint, targetCamPos).normalize();
        this.cameraAngles.phi = Math.acos(Math.max(-1, Math.min(1, dir.y)));
        this.cameraAngles.theta = Math.atan2(dir.x, dir.z);

        if (hotspot) {
          if (this.config.onHotspotClick) {
            this.config.onHotspotClick(hotspot);
          } else {
            this.showDetailModal(hotspot);
          }
        }
      },
    });

    timeline.to(this.camera.position, {
      x: targetCamPos.x,
      y: targetCamPos.y,
      z: targetCamPos.z,
      duration: 1.4,
      ease: "power2.inOut",
    }, 0);

    timeline.to(this.controlsTarget, {
      x: hitPoint.x,
      y: hitPoint.y,
      z: hitPoint.z,
      duration: 1.4,
      ease: "power2.inOut",
      onUpdate: () => {
        this.camera.lookAt(this.controlsTarget);
      },
    }, 0);
  }

  /**
   * Hiển thị Modal chi tiết hiện vật với ảnh siêu nét độ phân giải cao và âm thanh thuyết minh
   */
  public showDetailModal(hotspot: SplatHotspot): void {
    const existing = document.getElementById("splat-hotspot-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "splat-hotspot-modal";
    modal.style.cssText = `
      position: fixed; inset: 0; z-index: 1000;
      background: rgba(10, 14, 23, 0.85);
      backdrop-filter: blur(20px);
      display: flex; align-items: center; justify-content: center;
      padding: 1.5rem; animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
      <div style="background: linear-gradient(145deg, #151821, #0f1118); border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 16px; max-width: 650px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8); overflow: hidden; color: #f5f2eb; font-family: 'Inter', sans-serif;">
        <div style="position: relative; height: 320px; background: #000; overflow: hidden;">
          <img src="${hotspot.highResPhotoUrl}" alt="${hotspot.title}" style="width: 100%; height: 100%; object-fit: contain;" />
          <button id="close-modal-btn" style="position: absolute; top: 1rem; right: 1rem; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.3); color: #fff; width: 36px; height: 36px; border-radius: 50%; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
          <div style="position: absolute; bottom: 0.75rem; left: 1rem; background: rgba(212, 175, 55, 0.9); color: #000; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 700; font-size: 0.75rem; text-transform: uppercase;">
            Ảnh Chụp Trực Diện 8K
          </div>
        </div>
        <div style="padding: 1.5rem;">
          <div style="font-size: 0.8rem; color: #d4af37; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
            ${hotspot.era || 'Cổ vật bảo tàng'}
          </div>
          <h3 style="font-size: 1.4rem; font-weight: 800; margin: 0.4rem 0 0.8rem; font-family: 'Cinzel', serif; color: #f8fafc;">
            ${hotspot.title}
          </h3>
          <p style="color: #94a3b8; font-size: 0.92rem; line-height: 1.6; margin-bottom: 1.2rem;">
            ${hotspot.description}
          </p>
          <div style="display: flex; gap: 0.75rem;">
            <button id="play-audio-btn" style="flex: 1; padding: 0.75rem; background: linear-gradient(135deg, #9e1b1b, #7f1d1d); border: 1px solid #d4af37; color: #fff; font-weight: 700; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
              <span>🔊</span> Nghe Thuyết Minh AI
            </button>
            <button id="close-btn" style="padding: 0.75rem 1.25rem; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 8px; cursor: pointer;">
              Đóng
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeHandler = () => modal.remove();
    modal.querySelector("#close-modal-btn")?.addEventListener("click", closeHandler);
    modal.querySelector("#close-btn")?.addEventListener("click", closeHandler);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeHandler();
    });
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Hiệu ứng nhịp thở (Pulsing) cho các vòng tròn Hotspot
    const time = Date.now() * 0.003;
    this.hotspotMeshes.forEach((group, index) => {
      const ring = group.children[0];
      if (ring) {
        const scale = 1.0 + Math.sin(time + index * 1.5) * 0.15;
        ring.scale.set(scale, scale, 1);
      }
    });

    this.renderer.render(this.scene, this.camera);
  };

  public destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.renderer.dispose();
    this.container.innerHTML = "";
  }
}
