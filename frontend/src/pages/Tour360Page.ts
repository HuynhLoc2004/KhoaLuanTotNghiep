import * as THREE from "three";
import { MuseumConfigStore, Tour360Room, WalkNode360, ShowcasePin360 } from "../data/museumConfig";
import { ARTIFACTS_DATA } from "../data/artifacts";
import { Icons } from "../components/Icons";
import { showToast } from "../components/Toast";

export function renderTour360Page(): string {
  const rooms = MuseumConfigStore.rooms360;
  const currentRoom = rooms[0] || null;

  return `
    <div class="page-container" style="max-width: 100%; padding: 0; position: relative; height: calc(100vh - 2rem); overflow: hidden; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);">
      <!-- 3D Panorama Canvas Container -->
      <div id="tour-canvas-container" style="width: 100%; height: 100%; position: absolute; inset: 0; background: #0b0f19; cursor: grab;">
        <canvas id="tour-three-canvas" style="width: 100%; height: 100%; display: block;"></canvas>
      </div>

      <!-- Top Overlay Controls Bar -->
      <div style="position: absolute; top: 1.25rem; left: 1.5rem; right: 1.5rem; z-index: 20; display: flex; align-items: center; justify-content: space-between; pointer-events: none; gap: 1rem; flex-wrap: wrap;">
        <!-- Left: Room Switcher & Title -->
        <div style="pointer-events: auto; display: flex; align-items: center; gap: 0.75rem; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(16px); padding: 0.6rem 1rem; border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <div style="color: #38bdf8; display: flex; align-items: center;">
            ${Icons.compass}
          </div>
          <div>
            <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Tour Ảo VR 360° Bước Đi</div>
            <div id="tour-current-room-name" style="font-size: 0.95rem; font-weight: 800; color: #f8fafc;">${currentRoom ? currentRoom.name : 'Sảnh Bảo Tàng'}</div>
          </div>

          <!-- Room Selector Dropdown / Pills -->
          <div class="room-selector-group" style="display: flex; gap: 0.4rem; margin-left: 0.75rem;">
            ${rooms.map((r, idx) => `
              <button class="room-btn ${idx === 0 ? 'active' : ''}" data-room-id="${r.id}" style="padding: 0.35rem 0.75rem; font-size: 0.78rem; font-weight: 700; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.2); background: ${idx === 0 ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'rgba(255,255,255,0.08)'}; color: #fff; cursor: pointer; transition: all 0.2s ease;">
                ${r.name.replace('Sảnh Văn Hóa ', '').replace('Gian Trưng Bày ', '')}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Right: Mini-Radar Map HUD -->
        <div style="pointer-events: auto; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(16px); padding: 0.75rem; border-radius: var(--radius-lg); border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 10px 25px rgba(0,0,0,0.5); display: flex; flex-direction: column; align-items: center; gap: 0.4rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; font-size: 0.7rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">
            <span>Radar Sảnh</span>
            <span id="radar-node-label" style="color: #94a3b8; font-size: 0.65rem;">Điểm #1</span>
          </div>
          <canvas id="tour-radar-canvas" width="140" height="140" style="border-radius: var(--radius-md); background: rgba(2, 6, 23, 0.9); border: 1px solid rgba(56, 189, 248, 0.2);"></canvas>
          <div style="font-size: 0.65rem; color: #94a3b8; text-align: center;">Chấm xanh: Vị trí của bạn</div>
        </div>
      </div>

      <!-- Bottom Floating Controls & Info -->
      <div style="position: absolute; bottom: 1.5rem; left: 1.5rem; right: 1.5rem; z-index: 20; display: flex; align-items: center; justify-content: space-between; pointer-events: none; gap: 1rem; flex-wrap: wrap;">
        <!-- Left: Active Node & Narration -->
        <div style="pointer-events: auto; display: flex; align-items: center; gap: 0.75rem; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(16px); padding: 0.65rem 1.25rem; border-radius: var(--radius-lg); border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <div class="pulse-dot" style="background: #22c55e;"></div>
          <div>
            <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 700;">Vị trí quan sát</div>
            <div id="tour-active-node-name" style="font-size: 0.88rem; font-weight: 800; color: #f8fafc;">Trung tâm gian sảnh</div>
          </div>

          <button id="btn-room-voice" class="btn btn-secondary" style="margin-left: 1rem; padding: 0.4rem 0.85rem; font-size: 0.8rem; background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; display: flex; align-items: center; gap: 0.4rem;">
            ${Icons.volume}
            <span id="voice-btn-label">Nghe Thuyết Minh Sảnh</span>
          </button>
        </div>

        <!-- Right: Camera Tools -->
        <div style="pointer-events: auto; display: flex; align-items: center; gap: 0.5rem; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(16px); padding: 0.5rem 0.75rem; border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.15);">
          <button id="btn-autorotate" title="Tự động xoay 360" style="background: none; border: none; color: #f8fafc; cursor: pointer; padding: 0.4rem 0.6rem; border-radius: 9999px; display: flex; align-items: center; gap: 0.35rem; font-size: 0.78rem; font-weight: 700;">
            ${Icons.cube}
            <span id="autorotate-label">Tự Xoay: BẬT</span>
          </button>
          <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.2);"></div>
          <button id="btn-reset-view" title="Căn chỉnh lại góc nhìn" style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0.4rem; border-radius: 9999px; display: flex; align-items: center;">
            ${Icons.compass}
          </button>
        </div>
      </div>

      <!-- Interactive Showcase Pin Popup Modal -->
      <div id="showcase-pin-modal" style="display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 50; width: 90%; max-width: 480px; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: var(--radius-xl); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75); padding: 1.75rem; color: #f8fafc;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="badge-pill" style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid #38bdf8; font-size: 0.72rem; padding: 2px 8px;">ĐIỂM TRƯNG BÀY VẬT THỂ</span>
            <span id="modal-pin-era" style="font-size: 0.75rem; color: #94a3b8; font-weight: 600;"></span>
          </div>
          <button id="modal-close-btn" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.25rem; font-weight: bold; line-height: 1;">&times;</button>
        </div>

        <div style="display: flex; gap: 1rem; margin-bottom: 1.25rem;">
          <img id="modal-artifact-img" src="" alt="" style="width: 100px; height: 100px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.1); background: #1e293b;" />
          <div style="flex: 1;">
            <h3 id="modal-artifact-title" style="margin: 0 0 0.4rem 0; font-size: 1.15rem; color: #f8fafc; font-weight: 800;"></h3>
            <p id="modal-artifact-desc" style="margin: 0; font-size: 0.82rem; color: #cbd5e1; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;"></p>
          </div>
        </div>

        <!-- Audio Player Simulation -->
        <div style="background: rgba(2, 6, 23, 0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-md); padding: 0.75rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <button id="modal-play-audio-btn" class="btn btn-primary" style="width: 38px; height: 38px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center;">
              ${Icons.play}
            </button>
            <div>
              <div style="font-size: 0.78rem; font-weight: 700; color: #f8fafc;">Giọng Đọc Thuyết Minh AI</div>
              <div style="font-size: 0.68rem; color: #94a3b8;">Tiếng Việt • Giọng chuẩn truyền cảm</div>
            </div>
          </div>
          <div class="audio-bars" style="display: flex; align-items: flex-end; gap: 3px; height: 18px;">
            <div style="width: 3px; height: 8px; background: #38bdf8; border-radius: 2px;"></div>
            <div style="width: 3px; height: 16px; background: #38bdf8; border-radius: 2px;"></div>
            <div style="width: 3px; height: 10px; background: #38bdf8; border-radius: 2px;"></div>
            <div style="width: 3px; height: 18px; background: #38bdf8; border-radius: 2px;"></div>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <a id="modal-artifact-link" href="#artifact" class="btn btn-primary" style="flex: 1; text-align: center; text-decoration: none; justify-content: center; font-size: 0.85rem; padding: 0.65rem;">
            ${Icons.cube}
            <span>Xem Cận Cảnh & Xoay 3D</span>
          </a>
          <button id="modal-done-btn" class="btn btn-secondary" style="padding: 0.65rem 1.25rem; font-size: 0.85rem;">
            Đóng
          </button>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// THREE.JS SPHERICAL WALKTHROUGH ENGINE
// -------------------------------------------------------------
export function initTour360Page() {
  const container = document.getElementById("tour-canvas-container") as HTMLElement;
  const canvas = document.getElementById("tour-three-canvas") as HTMLCanvasElement;
  if (!container || !canvas) return;

  const radarCanvas = document.getElementById("tour-radar-canvas") as HTMLCanvasElement;
  const radarCtx = radarCanvas?.getContext("2d");

  let currentRoomIndex = 0;
  const rooms = MuseumConfigStore.rooms360;
  let activeRoom = rooms[currentRoomIndex] || rooms[0];
  let activeNodeId = activeRoom.nodes[0]?.id || "node-1";

  // Three.js Core
  const scene = new THREE.Scene();
  const width = container.clientWidth;
  const height = container.clientHeight;
  const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1200);
  camera.position.set(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Inverted Sphere for 360 Panorama
  const sphereGeo = new THREE.SphereGeometry(500, 60, 40);
  sphereGeo.scale(-1, 1, 1); // Invert faces inwards

  let sphereTexture = createProceduralPhotosphere(activeRoom);
  const sphereMat = new THREE.MeshBasicMaterial({ map: sphereTexture });
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  scene.add(sphereMesh);

  // Group for Floor Walk Nodes
  const walkNodesGroup = new THREE.Group();
  scene.add(walkNodesGroup);

  // Group for Showcase Pins
  const showcasePinsGroup = new THREE.Group();
  scene.add(showcasePinsGroup);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambientLight);

  // Camera Orbit Controls State
  let isUserInteracting = false;
  let onPointerDownPointerX = 0;
  let onPointerDownPointerY = 0;
  let lon = 0;
  let onPointerDownLon = 0;
  let lat = 0;
  let onPointerDownLat = 0;
  let phi = 0;
  let theta = 0;
  let autoRotate = true;

  // Render Walk Nodes & Showcase Pins
  function refreshRoomObjects() {
    // Clear old
    while (walkNodesGroup.children.length > 0) {
      walkNodesGroup.remove(walkNodesGroup.children[0]);
    }
    while (showcasePinsGroup.children.length > 0) {
      showcasePinsGroup.remove(showcasePinsGroup.children[0]);
    }

    // Add Walk Rings on Floor (y = -120)
    activeRoom.nodes.forEach(node => {
      const ringGeo = new THREE.RingGeometry(8, 14, 32);
      const isCurrent = node.id === activeNodeId;
      const ringMat = new THREE.MeshBasicMaterial({
        color: isCurrent ? 0x22c55e : 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isCurrent ? 0.9 : 0.65
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(node.position.x, -120, node.position.z);
      ringMesh.userData = { type: "walkNode", nodeId: node.id, nodeName: node.name, targetPos: node.position };
      walkNodesGroup.add(ringMesh);

      // Add center dot
      const dotGeo = new THREE.CircleGeometry(4, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      dotMesh.rotation.x = -Math.PI / 2;
      dotMesh.position.set(node.position.x, -119, node.position.z);
      walkNodesGroup.add(dotMesh);
    });

    // Add Showcase Pins (Floating Beacon Markers)
    activeRoom.showcases.forEach(pin => {
      const pinGroup = new THREE.Group();
      pinGroup.position.set(pin.position.x, pin.position.y - 10, pin.position.z);

      // Glowing Diamond Marker
      const octGeo = new THREE.OctahedronGeometry(9, 0);
      const octMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        wireframe: false
      });
      const octMesh = new THREE.Mesh(octGeo, octMat);
      pinGroup.add(octMesh);

      // Pulsing Ring under pin
      const ringGeo = new THREE.RingGeometry(12, 15, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = -18;
      pinGroup.add(ringMesh);

      pinGroup.userData = { type: "showcasePin", pinData: pin };
      showcasePinsGroup.add(pinGroup);
    });
  }

  refreshRoomObjects();

  // Draw Top-down Mini-Radar HUD
  function updateRadar() {
    if (!radarCtx) return;
    radarCtx.clearRect(0, 0, 140, 140);

    // Room Outer Border
    radarCtx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    radarCtx.lineWidth = 2;
    radarCtx.strokeRect(10, 10, 120, 120);

    // Room Center Grid Cross
    radarCtx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    radarCtx.lineWidth = 1;
    radarCtx.beginPath();
    radarCtx.moveTo(70, 10);
    radarCtx.lineTo(70, 130);
    radarCtx.moveTo(10, 70);
    radarCtx.lineTo(130, 70);
    radarCtx.stroke();

    // Map 3D coordinates (-200..200) to radar canvas (20..120)
    const mapCoord = (val: number) => 70 + (val / 250) * 45;

    // Draw Walk Nodes
    activeRoom.nodes.forEach(node => {
      const rx = mapCoord(node.position.x);
      const rz = mapCoord(node.position.z);
      const isCurrent = node.id === activeNodeId;

      radarCtx.fillStyle = isCurrent ? "#22c55e" : "#38bdf8";
      radarCtx.beginPath();
      radarCtx.arc(rx, rz, isCurrent ? 5 : 3, 0, Math.PI * 2);
      radarCtx.fill();
    });

    // Draw Showcases
    activeRoom.showcases.forEach(pin => {
      const px = mapCoord(pin.position.x);
      const pz = mapCoord(pin.position.z);
      radarCtx.fillStyle = "#f59e0b";
      radarCtx.beginPath();
      radarCtx.arc(px, pz, 3.5, 0, Math.PI * 2);
      radarCtx.fill();
    });

    // Draw Visitor View Cone (heading)
    const currentNode = activeRoom.nodes.find(n => n.id === activeNodeId);
    const cx = currentNode ? mapCoord(currentNode.position.x) : 70;
    const cz = currentNode ? mapCoord(currentNode.position.z) : 70;

    const angleRad = THREE.MathUtils.degToRad(lon);
    radarCtx.fillStyle = "rgba(56, 189, 248, 0.25)";
    radarCtx.beginPath();
    radarCtx.moveTo(cx, cz);
    radarCtx.arc(cx, cz, 22, angleRad - 0.4, angleRad + 0.4);
    radarCtx.closePath();
    radarCtx.fill();
  }

  // Smooth Camera Glide / Tweening
  let targetCameraPos = new THREE.Vector3(0, 0, 0);
  let isGliding = false;

  function glideToNode(targetPos: { x: number; y: number; z: number }, nodeId: string, nodeName: string) {
    targetCameraPos.set(targetPos.x, targetPos.y, targetPos.z);
    activeNodeId = nodeId;
    isGliding = true;

    const nodeLabel = document.getElementById("tour-active-node-name");
    if (nodeLabel) nodeLabel.textContent = nodeName;

    const radarLabel = document.getElementById("radar-node-label");
    if (radarLabel) radarLabel.textContent = nodeName.substring(0, 12);

    refreshRoomObjects();
  }

  // Raycasting for interactive clicks
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onPointerDown(event: MouseEvent | TouchEvent) {
    isUserInteracting = true;
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    onPointerDownPointerX = clientX;
    onPointerDownPointerY = clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
  }

  function onPointerMove(event: MouseEvent | TouchEvent) {
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    if (isUserInteracting) {
      lon = (onPointerDownPointerX - clientX) * 0.15 + onPointerDownLon;
      lat = (clientY - onPointerDownPointerY) * 0.15 + onPointerDownLat;
    }

    // Raycast on hover
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([...walkNodesGroup.children, ...showcasePinsGroup.children], true);

    if (intersects.length > 0) {
      container.style.cursor = "pointer";
    } else {
      container.style.cursor = isUserInteracting ? "grabbing" : "grab";
    }
  }

  function onPointerUp(event: MouseEvent | TouchEvent) {
    const wasDragging = Math.abs(lon - onPointerDownLon) > 1 || Math.abs(lat - onPointerDownLat) > 1;
    isUserInteracting = false;

    if (!wasDragging) {
      // It was a click! Raycast to see if user clicked a walk ring or showcase pin
      const clientX = 'changedTouches' in event ? event.changedTouches[0].clientX : (event as MouseEvent).clientX;
      const clientY = 'changedTouches' in event ? event.changedTouches[0].clientY : (event as MouseEvent).clientY;
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([...walkNodesGroup.children, ...showcasePinsGroup.children], true);

      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && !hitObj.userData.type && hitObj.parent) {
          hitObj = hitObj.parent;
        }

        if (hitObj && hitObj.userData.type === "walkNode") {
          glideToNode(hitObj.userData.targetPos, hitObj.userData.nodeId, hitObj.userData.nodeName);
        } else if (hitObj && hitObj.userData.type === "showcasePin") {
          openShowcaseModal(hitObj.userData.pinData);
        }
      }
    }
  }

  if (container) {
    container.addEventListener("mousedown", onPointerDown);
    container.addEventListener("touchstart", onPointerDown, { passive: true });
    container.addEventListener("wheel", (e) => {
      e.preventDefault();
      camera.fov = THREE.MathUtils.clamp(camera.fov + e.deltaY * 0.05, 45, 95);
      camera.updateProjectionMatrix();
    }, { passive: false });
  }
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseup", onPointerUp);
  window.addEventListener("touchmove", onPointerMove, { passive: true });
  window.addEventListener("touchend", onPointerUp);



  // Modal handlers
  const modal = document.getElementById("showcase-pin-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalDoneBtn = document.getElementById("modal-done-btn");
  const modalAudioBtn = document.getElementById("modal-play-audio-btn");

  let currentSpeakingUtterance: SpeechSynthesisUtterance | null = null;

  function openShowcaseModal(pin: ShowcasePin360) {
    if (!modal) return;
    const artifact = ARTIFACTS_DATA.find(a => a.id === pin.artifactId);

    const titleEl = document.getElementById("modal-artifact-title");
    const eraEl = document.getElementById("modal-pin-era");
    const descEl = document.getElementById("modal-artifact-desc");
    const imgEl = document.getElementById("modal-artifact-img") as HTMLImageElement;
    const linkEl = document.getElementById("modal-artifact-link") as HTMLAnchorElement;

    if (titleEl) titleEl.textContent = pin.title;
    if (eraEl) eraEl.textContent = pin.era;
    if (descEl) descEl.textContent = artifact ? artifact.placardText : "Cổ vật trưng bày đặc sắc thuộc bộ sưu tập bảo tàng.";
    if (imgEl && artifact) imgEl.src = artifact.thumbnail;
    if (linkEl) linkEl.href = `#artifact`;

    modal.style.display = "block";

    if (modalAudioBtn) {
      modalAudioBtn.onclick = () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const text = `${pin.title}. Niên đại: ${pin.era}. ${artifact ? artifact.placardText : ''}`;
          const utt = new SpeechSynthesisUtterance(text);
          utt.lang = "vi-VN";
          window.speechSynthesis.speak(utt);
          currentSpeakingUtterance = utt;
        } else {
          showToast("Trình duyệt không hỗ trợ Web Speech API.", "warning");
        }
      };
    }
  }

  function closeModal() {
    if (modal) modal.style.display = "none";
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  if (modalCloseBtn) modalCloseBtn.onclick = closeModal;
  if (modalDoneBtn) modalDoneBtn.onclick = closeModal;

  // Auto-rotate Toggle
  const autoRotateBtn = document.getElementById("btn-autorotate");
  const autoRotateLabel = document.getElementById("autorotate-label");
  if (autoRotateBtn && autoRotateLabel) {
    autoRotateBtn.onclick = () => {
      autoRotate = !autoRotate;
      autoRotateLabel.textContent = `Tự Xoay: ${autoRotate ? 'BẬT' : 'TẮT'}`;
      autoRotateBtn.style.color = autoRotate ? '#f8fafc' : '#94a3b8';
    };
  }

  // Reset View
  const resetViewBtn = document.getElementById("btn-reset-view");
  if (resetViewBtn) {
    resetViewBtn.onclick = () => {
      lon = 0;
      lat = 0;
      camera.fov = 75;
      camera.updateProjectionMatrix();
    };
  }

  // Room Audio Guide button
  const roomVoiceBtn = document.getElementById("btn-room-voice");
  if (roomVoiceBtn) {
    roomVoiceBtn.onclick = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = `Chào mừng quý khách đến với ${activeRoom.name}. ${activeRoom.description}. Hiện tại sảnh trưng bày có ${activeRoom.showcases.length} hiện vật tiêu biểu. Quý khách có thể bấm vào các vòng tròn sáng trên sàn để di chuyển giữa các góc nhìn.`;
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = "vi-VN";
        window.speechSynthesis.speak(utt);
      }
    };
  }

  // Room Switcher Buttons
  const roomBtns = document.querySelectorAll(".room-btn");
  roomBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const rId = btn.getAttribute("data-room-id");
      const found = rooms.find(r => r.id === rId);
      if (found) {
        activeRoom = found;
        activeNodeId = found.nodes[0]?.id || "node-1";
        roomBtns.forEach(b => {
          b.classList.remove("active");
          (b as HTMLElement).style.background = "rgba(255,255,255,0.08)";
        });
        btn.classList.add("active");
        (btn as HTMLElement).style.background = "linear-gradient(135deg, #0284c7, #0369a1)";

        const roomNameEl = document.getElementById("tour-current-room-name");
        if (roomNameEl) roomNameEl.textContent = activeRoom.name;

        // Change Sphere Texture
        sphereTexture.dispose();
        sphereTexture = createProceduralPhotosphere(activeRoom);
        sphereMat.map = sphereTexture;
        sphereMat.needsUpdate = true;

        // Reset camera position to room start
        camera.position.set(0, 0, 0);
        targetCameraPos.set(0, 0, 0);
        isGliding = false;

        const nodeLabel = document.getElementById("tour-active-node-name");
        if (nodeLabel) nodeLabel.textContent = activeRoom.nodes[0]?.name || "Trung tâm";

        refreshRoomObjects();
        updateRadar();
      }
    });
  });

  // Animation Loop
  let animationFrameId: number;
  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    // Auto rotate if not interacting
    if (autoRotate && !isUserInteracting) {
      lon += 0.08;
    }

    lat = Math.max(-85, Math.min(85, lat));
    phi = THREE.MathUtils.degToRad(90 - lat);
    theta = THREE.MathUtils.degToRad(lon);

    const targetX = 500 * Math.sin(phi) * Math.cos(theta);
    const targetY = 500 * Math.cos(phi);
    const targetZ = 500 * Math.sin(phi) * Math.sin(theta);

    // Glide camera smoothly to target walk node
    if (isGliding) {
      camera.position.lerp(targetCameraPos, 0.08);
      if (camera.position.distanceTo(targetCameraPos) < 0.5) {
        camera.position.copy(targetCameraPos);
        isGliding = false;
      }
    }

    camera.lookAt(camera.position.x + targetX, camera.position.y + targetY, camera.position.z + targetZ);

    // Animate Showcase Pins (gentle bobbing & rotation)
    const time = Date.now() * 0.002;
    showcasePinsGroup.children.forEach((group, idx) => {
      group.children[0].rotation.y += 0.02;
      group.children[0].position.y = Math.sin(time + idx) * 3;
    });

    renderer.render(scene, camera);
    updateRadar();
  }

  animate();

  // Resize handler
  const onResize = () => {
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener("resize", onResize);

  // Cleanup on hashchange
  const onHashChange = () => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("hashchange", onHashChange);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };
  window.addEventListener("hashchange", onHashChange);
}

// -------------------------------------------------------------
// PROCEDURAL PHOTOSPHERE CANVAS TEXTURE GENERATOR
// Generates photorealistic architectural museum hall interior
// -------------------------------------------------------------
function createProceduralPhotosphere(room: Tour360Room): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;

  const w = canvas.width;
  const h = canvas.height;

  // 1. Base Wall Atmosphere Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  if (room.id === "champa-hall") {
    grad.addColorStop(0, "#1c1917"); // Dark ceiling
    grad.addColorStop(0.2, "#292524");
    grad.addColorStop(0.5, "#451a03"); // Rich terracotta museum wall
    grad.addColorStop(0.7, "#78350f");
    grad.addColorStop(0.75, "#262626"); // Polished floor border
    grad.addColorStop(1, "#171717"); // Floor
  } else if (room.id === "oc-eo-hall") {
    grad.addColorStop(0, "#0f172a");
    grad.addColorStop(0.2, "#1e293b");
    grad.addColorStop(0.5, "#064e3b"); // Deep jade green stone
    grad.addColorStop(0.7, "#047857");
    grad.addColorStop(0.75, "#1e293b");
    grad.addColorStop(1, "#0f172a");
  } else {
    grad.addColorStop(0, "#18181b");
    grad.addColorStop(0.2, "#27272a");
    grad.addColorStop(0.5, "#713f12"); // Bronze ochre
    grad.addColorStop(0.7, "#854d0e");
    grad.addColorStop(0.75, "#18181b");
    grad.addColorStop(1, "#09090b");
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // 2. Ceiling Spotlights & Gallery Beams
  ctx.fillStyle = "rgba(255, 248, 220, 0.12)";
  for (let x = 100; x < w; x += 220) {
    const spotGrad = ctx.createRadialGradient(x, 120, 10, x, 120, 180);
    spotGrad.addColorStop(0, "rgba(254, 240, 138, 0.4)");
    spotGrad.addColorStop(1, "transparent");
    ctx.fillStyle = spotGrad;
    ctx.beginPath();
    ctx.arc(x, 120, 180, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Architectural Columns & Wall Panels
  for (let x = 50; x < w; x += 340) {
    // Column Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(x - 8, h * 0.15, 16, h * 0.6);

    // Marble Column Highlight
    const colGrad = ctx.createLinearGradient(x - 20, 0, x + 20, 0);
    colGrad.addColorStop(0, "rgba(255,255,255,0.05)");
    colGrad.addColorStop(0.5, "rgba(255,255,255,0.2)");
    colGrad.addColorStop(1, "rgba(0,0,0,0.3)");
    ctx.fillStyle = colGrad;
    ctx.fillRect(x - 20, h * 0.15, 40, h * 0.6);

    // Wall Exhibition Frame / Placard Silhouette
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(x + 60, h * 0.35, 140, 180);
    ctx.strokeStyle = "rgba(217, 119, 6, 0.7)";
    ctx.lineWidth = 4;
    ctx.strokeRect(x + 60, h * 0.35, 140, 180);

    // Placard Inner Glow
    ctx.fillStyle = "rgba(254, 243, 199, 0.15)";
    ctx.fillRect(x + 65, h * 0.35 + 5, 130, 170);

    // Simulated Exhibit Name on Wall
    ctx.fillStyle = "rgba(254, 243, 199, 0.8)";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("BẢO VẬT HOÀNG GIA", x + 75, h * 0.35 + 40);
  }

  // 4. Polished Museum Floor Grid & Reflection Line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 2;
  for (let y = h * 0.75; y < h; y += 35) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  for (let x = 0; x < w; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x, h * 0.75);
    ctx.lineTo(x + (x - w / 2) * 0.8, h);
    ctx.stroke();
  }

  // 5. Floor Warm Reflection of Showcases
  for (let x = 120; x < w; x += 340) {
    const reflGrad = ctx.createLinearGradient(0, h * 0.75, 0, h * 0.9);
    reflGrad.addColorStop(0, "rgba(251, 191, 36, 0.2)");
    reflGrad.addColorStop(1, "transparent");
    ctx.fillStyle = reflGrad;
    ctx.fillRect(x + 40, h * 0.75, 180, 120);
  }

  // Texture creation
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}
