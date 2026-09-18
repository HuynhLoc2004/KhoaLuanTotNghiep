import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box, Play, Pause, ZoomIn, ZoomOut, Maximize2, Minimize2, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

interface Turntable360ViewerProps {
  images?: string[];
  model3dUrl?: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
  height?: string | number;
}

export const Turntable360Viewer: React.FC<Turntable360ViewerProps> = ({
  images = [],
  model3dUrl,
  title = 'Hiện vật Di sản',
  autoPlay = false,
  className = '',
  height = 460
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewAngle, setViewAngle] = useState(0);
  const [loading, setLoading] = useState(true);

  // Three.js References
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const turntableRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number | null>(null);

  const validImages = images && images.length > 0 ? images : [];
  const mainImageUrl = validImages[0] || 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80';

  // Xác định loại hiện vật để tạo mô hình 3D tương ứng
  const isBronzeDrum = title.toLowerCase().includes('trống') || title.toLowerCase().includes('cảnh thịnh') || title.toLowerCase().includes('đông sơn');

  // ================= TẠO TEXTURE MẶT TRỐNG ĐỒNG BẰNG CANVAS =================
  const createBronzeDrumheadCanvas = (): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } => {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = size;
    bumpCanvas.height = size;
    const bCtx = bumpCanvas.getContext('2d')!;

    const cx = size / 2;
    const cy = size / 2;

    // Nền đồng cổ (antique bronze with patina)
    ctx.fillStyle = '#4b5548';
    ctx.fillRect(0, 0, size, size);
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, size, size);

    // Ngôi sao mặt trời 14 cánh ở tâm (14-pointed solar star)
    const points = 14;
    const outerR = 180;
    const innerR = 70;

    ctx.save();
    ctx.translate(cx, cy);
    bCtx.save();
    bCtx.translate(cx, cy);

    // Vẽ tâm sao
    ctx.beginPath();
    bCtx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(x, y);
        bCtx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
        bCtx.lineTo(x, y);
      }
    }
    ctx.closePath();
    bCtx.closePath();

    ctx.fillStyle = '#C5A059'; // Vàng đồng sáng
    ctx.fill();
    ctx.strokeStyle = '#2d3728';
    ctx.lineWidth = 4;
    ctx.stroke();

    bCtx.fillStyle = '#ffffff';
    bCtx.fill();
    bCtx.strokeStyle = '#000000';
    bCtx.lineWidth = 4;
    bCtx.stroke();

    ctx.restore();
    bCtx.restore();

    // Các vành hoa văn đồng tâm (Concentric decorative bands)
    const rings = [210, 240, 275, 320, 360, 400, 440, 475];
    rings.forEach((r, idx) => {
      // Vòng tròn phân cách
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = '#C5A059';
      ctx.lineWidth = idx % 2 === 0 ? 5 : 2.5;
      ctx.stroke();

      bCtx.beginPath();
      bCtx.arc(cx, cy, r, 0, Math.PI * 2);
      bCtx.strokeStyle = '#ffffff';
      bCtx.lineWidth = idx % 2 === 0 ? 5 : 2.5;
      bCtx.stroke();

      // Hoa văn chấm tròn hoặc răng cưa giữa các vành
      if (idx === 2 || idx === 4) {
        const count = idx === 2 ? 36 : 48;
        for (let i = 0; i < count; i++) {
          const ang = (i * Math.PI * 2) / count;
          const px = cx + (r - 18) * Math.cos(ang);
          const py = cy + (r - 18) * Math.sin(ang);
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#C5A059';
          ctx.fill();

          bCtx.beginPath();
          bCtx.arc(px, py, 4, 0, Math.PI * 2);
          bCtx.fillStyle = '#ffffff';
          bCtx.fill();
        }
      }
    });

    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    const bump = new THREE.CanvasTexture(bumpCanvas);
    return { map, bump };
  };

  // ================= TỰ ĐỘNG CẮT NỀN TRONG SUỐT CHO TƯỢNG =================
  const createCutoutTexture = (imgUrl: string, callback: (tex: THREE.Texture) => void) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const w = img.naturalWidth || 800;
      const h = img.naturalHeight || 800;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);

      // Thuật toán tách nền: Lấy màu nền ở 4 góc
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Lấy màu mẫu từ 4 góc
      const bgSamples = [
        [data[0], data[1], data[2]], // Top-left
        [data[(w - 1) * 4], data[(w - 1) * 4 + 1], data[(w - 1) * 4 + 2]], // Top-right
        [data[((h - 1) * w) * 4], data[((h - 1) * w) * 4 + 1], data[((h - 1) * w) * 4 + 2]] // Bottom-left
      ];
      const avgR = (bgSamples[0][0] + bgSamples[1][0] + bgSamples[2][0]) / 3;
      const avgG = (bgSamples[0][1] + bgSamples[1][1] + bgSamples[2][1]) / 3;
      const avgB = (bgSamples[0][2] + bgSamples[1][2] + bgSamples[2][2]) / 3;

      // Nếu nền là màu đen/tối hoặc trắng/xám đồng nhất, làm trong suốt nền
      const isDarkBg = avgR < 45 && avgG < 45 && avgB < 45;
      const isLightBg = avgR > 215 && avgG > 215 && avgB > 215;

      if (isDarkBg || isLightBg) {
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const diff = Math.sqrt((r - avgR) ** 2 + (g - avgG) ** 2 + (b - avgB) ** 2);
          if (diff < 42) {
            data[i + 3] = 0; // Làm trong suốt
          } else if (diff < 65) {
            data[i + 3] = Math.round(((diff - 42) / 23) * 255); // Khử răng cưa viền
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      callback(tex);
    };

    img.onerror = () => {
      const loader = new THREE.TextureLoader();
      loader.load(imgUrl, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        callback(tex);
      });
    };
  };

  // ================= KHỞI TẠO KHÔNG GIAN 3D THREE.JS =================
  useEffect(() => {
    if (!mountRef.current) return;

    setLoading(true);
    const width = mountRef.current.clientWidth || 700;
    const currentHeight = typeof height === 'number' ? height : parseInt(String(height)) || 460;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera: Góc nhìn bảo tàng chuẩn (hơi nghiêng từ trên xuống)
    const camera = new THREE.PerspectiveCamera(40, width / currentHeight, 0.1, 100);
    camera.position.set(0, 2.1, 4.8);
    cameraRef.current = camera;

    // 3. Renderer cao cấp với bóng mềm PCF
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, currentHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls: Giới hạn xoay mượt mà
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.85, 0);
    controls.minDistance = 2.2;
    controls.maxDistance = 7.5;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // Không nhìn dưới gầm sàn
    controls.autoRotate = isPlaying;
    controls.autoRotateSpeed = 1.4;
    controlsRef.current = controls;

    // 5. Hệ thống Ánh sáng Phòng trưng bày Nghệ thuật (Museum Studio Lighting)
    // Ánh sáng môi trường dịu nhẹ
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.2);
    scene.add(ambientLight);

    // Đèn rọi Spotlight chính chiếu từ trên xuống góc 45 độ (Key Spotlight)
    const keySpot = new THREE.SpotLight(0xffeedb, 4.5);
    keySpot.position.set(2.5, 6.0, 3.5);
    keySpot.angle = Math.PI / 4.8;
    keySpot.penumbra = 0.75;
    keySpot.castShadow = true;
    keySpot.shadow.mapSize.width = 1024;
    keySpot.shadow.mapSize.height = 1024;
    keySpot.shadow.bias = -0.0008;
    scene.add(keySpot);

    // Đèn viền sau ánh xanh ngọc (Rim light) tạo khối 3D sắc nét
    const rimLight = new THREE.DirectionalLight(0x99ccff, 1.8);
    rimLight.position.set(-3.5, 4.0, -3.0);
    scene.add(rimLight);

    // Đèn hắt vàng ấm từ bục xoay lên (Uplight glow)
    const uplight = new THREE.PointLight(0xf59e0b, 1.5, 6);
    uplight.position.set(0, 0.2, 1.2);
    scene.add(uplight);

    // 6. Turntable Group (Bục Xoay Trưng Bày Hạng Sang)
    const turntable = new THREE.Group();
    scene.add(turntable);
    turntableRef.current = turntable;

    // Tầng 1: Đế đá đen cẩm thạch nguyên khối (Black Nero Marquina Marble Base)
    const baseGeo = new THREE.CylinderGeometry(1.82, 1.88, 0.12, 64);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x181c22,
      roughness: 0.18,
      metalness: 0.12
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.06;
    baseMesh.receiveShadow = true;
    turntable.add(baseMesh);

    // Vành đồng viền đế bục (Beveled Gold Rim)
    const rimGeo = new THREE.TorusGeometry(1.84, 0.022, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Vàng kim loại Champagne
      roughness: 0.22,
      metalness: 0.92
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 0.002;
    turntable.add(rimMesh);

    // Tầng 2: Mâm xoay đồng phay xước (Brushed Champagne Brass Turntable Platter)
    const platterGeo = new THREE.CylinderGeometry(1.58, 1.62, 0.05, 64);
    const platterMat = new THREE.MeshStandardMaterial({
      color: 0xc5a059,
      roughness: 0.32,
      metalness: 0.88
    });
    const platterMesh = new THREE.Mesh(platterGeo, platterMat);
    platterMesh.position.y = 0.025;
    platterMesh.receiveShadow = true;
    turntable.add(platterMesh);

    // Mặt nỉ bảo quản cổ vật ở tâm mâm xoay (Center Museum Velvet Pad)
    const padGeo = new THREE.CylinderGeometry(1.35, 1.35, 0.008, 64);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x1e2430,
      roughness: 0.85,
      metalness: 0.05
    });
    const padMesh = new THREE.Mesh(padGeo, padMat);
    padMesh.position.y = 0.054;
    padMesh.receiveShadow = true;
    turntable.add(padMesh);

    // Bảng tên đồng khắc chìm trước bục (Engraved Brass Plaque)
    const plaqueGeo = new THREE.BoxGeometry(0.85, 0.16, 0.02);
    const plaqueMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.2
    });
    const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaqueMesh.position.set(0, 0.02, 1.78);
    turntable.add(plaqueMesh);

    // Sàn bảo tàng hứng bóng đổ mềm
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.55 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.125;
    floor.receiveShadow = true;
    scene.add(floor);

    // 7. DỰNG MÔ HÌNH HIỆN VẬT 3D ĐÍCH THỰC (TRUE 3D RELIC)
    if (model3dUrl) {
      // Nếu có file 3D .glb / .gltf
      const loader = new GLTFLoader();
      loader.load(
        model3dUrl,
        (gltf) => {
          const model = gltf.scene;
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          // Chuẩn hóa tỷ lệ kích thước về độ cao ~2.0m
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 2.0 / (maxDim || 1);
          model.scale.setScalar(scale);

          // Căn giữa trên bục
          box.setFromObject(model);
          model.position.y = 0.06 - box.min.y * scale;
          turntable.add(model);
          setLoading(false);
        },
        undefined,
        () => {
          // Fallback nếu tải file 3D lỗi
          setupFallbackArtifact();
        }
      );
    } else if (isBronzeDrum) {
      // ================= DỰNG TRỐNG ĐỒNG 3D THẬT 100% BẰNG LATHE =================
      const drumPts: THREE.Vector2[] = [
        new THREE.Vector2(0.98, 0.0),    // Chân choãi đáy
        new THREE.Vector2(0.94, 0.08),   // Bo gờ chân
        new THREE.Vector2(0.72, 0.52),   // Thu hẹp eo trống
        new THREE.Vector2(0.70, 0.98),   // Thân trụ đứng eo
        new THREE.Vector2(0.94, 1.34),   // Tang trống phình trên
        new THREE.Vector2(0.91, 1.48),   // Gờ mép mặt
        new THREE.Vector2(0.88, 1.50),   // Viền mặt trống
        new THREE.Vector2(0.0, 1.50)     // Tâm mặt trống
      ];

      const drumGeo = new THREE.LatheGeometry(drumPts, 64);
      const drumheadTextures = createBronzeDrumheadCanvas();

      // Chất liệu đồng cổ Champa/Đông Sơn phong hóa (Antique Patinated Bronze)
      const bronzeMat = new THREE.MeshStandardMaterial({
        color: 0x5a6552, // Màu rỉ đồng verdigris cổ kính pha ánh kim
        roughness: 0.38,
        metalness: 0.82,
        map: drumheadTextures.map,
        bumpMap: drumheadTextures.bump,
        bumpScale: 0.025
      });

      const drumMesh = new THREE.Mesh(drumGeo, bronzeMat);
      drumMesh.position.y = 0.06;
      drumMesh.castShadow = true;
      drumMesh.receiveShadow = true;
      turntable.add(drumMesh);

      // Thêm 4 quai bện đôi đặc trưng của Trống đồng Đông Sơn / Cảnh Thịnh
      const handleGeo = new THREE.TorusGeometry(0.18, 0.035, 12, 24, Math.PI);
      const handleMat = new THREE.MeshStandardMaterial({
        color: 0x4a5542,
        roughness: 0.45,
        metalness: 0.78
      });

      const angles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
      angles.forEach((ang) => {
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.rotation.z = Math.PI / 2;
        handle.rotation.y = ang;
        handle.position.set(0.71 * Math.cos(ang), 0.82, 0.71 * Math.sin(ang));
        handle.castShadow = true;
        turntable.add(handle);
      });

      setLoading(false);
    } else {
      setupFallbackArtifact();
    }

    // Hàm hiển thị Cổ vật Tượng nghệ thuật trên Đài Trưng Bày Bảo Tàng
    function setupFallbackArtifact() {
      createCutoutTexture(mainImageUrl, (cutoutTex) => {
        const img = cutoutTex.image as HTMLImageElement | HTMLCanvasElement;
        const aspect = (img && img.width && img.height) ? (img.width / img.height) : 0.75;

        const relicHeight = 2.45;
        const relicWidth = Math.min(2.2, relicHeight * aspect);

        // 1. Tấm trưng bày pha lê bảo tàng trong suốt (Crystal Museum Plaque)
        // Tạo viền pha lê khúc xạ ánh sáng sang trọng ôm trọn cổ vật
        const glassGeo = new THREE.BoxGeometry(relicWidth + 0.12, relicHeight + 0.12, 0.04);
        const glassMat = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transmission: 0.88,
          opacity: 1,
          transparent: true,
          roughness: 0.08,
          ior: 1.5,
          metalness: 0.05
        });
        const glassMesh = new THREE.Mesh(glassGeo, glassMat);
        glassMesh.position.y = relicHeight / 2 + 0.14;
        glassMesh.castShadow = false;
        turntable.add(glassMesh);

        // 2. Mặt trước và mặt sau hiện vật với hình ảnh sắc nét
        const planeGeo = new THREE.PlaneGeometry(relicWidth, relicHeight);
        const relicMat = new THREE.MeshStandardMaterial({
          map: cutoutTex,
          transparent: true,
          roughness: 0.35,
          metalness: 0.15,
          side: THREE.DoubleSide
        });
        const relicMesh = new THREE.Mesh(planeGeo, relicMat);
        relicMesh.position.y = relicHeight / 2 + 0.14;
        relicMesh.position.z = 0.022; // Nằm sát mặt trước tấm pha lê
        relicMesh.castShadow = true;
        relicMesh.receiveShadow = true;
        turntable.add(relicMesh);

        // Mặt sau tương ứng
        const backRelicMesh = relicMesh.clone();
        backRelicMesh.position.z = -0.022;
        backRelicMesh.rotation.y = Math.PI;
        turntable.add(backRelicMesh);

        // 3. Chân đế hoa sen mạ vàng đồng nâng niu hiện vật (Carved Lotus Relic Mount)
        const mountGeo = new THREE.CylinderGeometry(relicWidth * 0.42, relicWidth * 0.52, 0.15, 32);
        const mountMat = new THREE.MeshStandardMaterial({
          color: 0x8b1818, // Đỏ son cung đình
          roughness: 0.3,
          metalness: 0.45
        });
        const mountMesh = new THREE.Mesh(mountGeo, mountMat);
        mountMesh.position.y = 0.12;
        mountMesh.castShadow = true;
        mountMesh.receiveShadow = true;
        turntable.add(mountMesh);

        // Vành kẹp vàng bảo tàng dưới chân
        const clampGeo = new THREE.BoxGeometry(relicWidth * 0.7, 0.06, 0.12);
        const clampMat = new THREE.MeshStandardMaterial({
          color: 0xd4af37,
          roughness: 0.2,
          metalness: 0.95
        });
        const clampMesh = new THREE.Mesh(clampGeo, clampMat);
        clampMesh.position.y = 0.20;
        clampMesh.castShadow = true;
        turntable.add(clampMesh);

        setLoading(false);
      });
    }

    // 8. Vòng lặp Render & Animation
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      controls.update();

      // Tính góc quay hiện tại theo độ (0 - 360)
      const azAngle = Math.round(((controls.getAzimuthalAngle() * 180 / Math.PI) % 360 + 360) % 360);
      setViewAngle(azAngle);

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Listener
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = typeof height === 'number' ? height : parseInt(String(height)) || 460;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (renderer.domElement && mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [height, mainImageUrl, model3dUrl, isBronzeDrum]);

  // Đồng bộ trạng thái Auto-Rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isPlaying;
    }
  }, [isPlaying]);

  // Đặt lại góc nhìn chính diện
  const handleReset = () => {
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.set(0, 2.1, 4.8);
      controlsRef.current.target.set(0, 0.85, 0);
      controlsRef.current.reset();
      setIsPlaying(false);
    }
  };

  // Phóng to / Thu nhỏ
  const handleZoom = (delta: number) => {
    if (cameraRef.current) {
      const dir = new THREE.Vector3();
      cameraRef.current.getWorldDirection(dir);
      cameraRef.current.position.addScaledVector(dir, delta * 0.45);
    }
  };

  // Chế độ Toàn màn hình
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`turntable-360-container ${className} ${isFullscreen ? 'fullscreen-mode' : ''}`}
      style={{
        position: 'relative',
        width: '100%',
        height: isFullscreen ? '100vh' : height,
        background: 'radial-gradient(ellipse at 50% 30%, #1a202c 0%, #0d1117 65%, #07090c 100%)',
        borderRadius: isFullscreen ? 0 : 18,
        overflow: 'hidden',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      {/* Gallery Spotlight Overhead Halo */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '65%',
          height: '45%',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(245, 158, 11, 0.18) 0%, rgba(245, 158, 11, 0) 75%)',
          pointerEvents: 'none'
        }}
      />

      {/* Top Header Bar */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 16,
          right: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              color: '#F59E0B',
              fontSize: 11,
              fontWeight: 800,
              padding: '4px 11px',
              borderRadius: 20,
              letterSpacing: '0.6px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
            }}
          >
            <Box size={13} />
            {isBronzeDrum ? 'MÔ HÌNH 3D TRỐNG ĐỒNG' : 'MÔ HÌNH 3D BẢO TÀNG'}
          </span>

          <span
            style={{
              color: '#F8FAFC',
              fontSize: 13,
              fontWeight: 700,
              textShadow: '0 2px 8px rgba(0,0,0,0.9)'
            }}
          >
            {title}
          </span>
        </div>

        {/* Degree Counter Pill */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#F3F4F6',
            fontSize: 12,
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: 20,
            fontVariantNumeric: 'tabular-nums',
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
          }}
        >
          Góc xoay: {viewAngle}°
        </div>
      </div>

      {/* WebGL 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          cursor: 'grab'
        }}
      />

      {/* Touch Interaction Prompt */}
      <div
        style={{
          position: 'absolute',
          bottom: 58,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: 'rgba(255,255,255,0.65)',
          fontSize: 11.5,
          fontWeight: 600,
          pointerEvents: 'none',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          padding: '4px 14px',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <span>‹ Rê chuột hoặc vuốt tay để xoay hiện vật 360° đa chiều ›</span>
      </div>

      {/* Floating Control Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(14px)',
          padding: '5px 10px',
          borderRadius: 30,
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 10px 28px rgba(0,0,0,0.6)',
          zIndex: 10
        }}
      >
        <button
          className="viewer-ctrl-btn"
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Dừng tự động xoay' : 'Tự động xoay chậm quanh bục'}
          style={ctrlBtnStyle}
        >
          {isPlaying ? <Pause size={15} color="#F59E0B" /> : <Play size={15} color="#F3F4F6" />}
        </button>

        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.18)' }} />

        <button
          className="viewer-ctrl-btn"
          onClick={() => handleZoom(1)}
          title="Phóng to chi tiết"
          style={ctrlBtnStyle}
        >
          <ZoomIn size={15} color="#F3F4F6" />
        </button>

        <button
          className="viewer-ctrl-btn"
          onClick={() => handleZoom(-1)}
          title="Thu nhỏ"
          style={ctrlBtnStyle}
        >
          <ZoomOut size={15} color="#F3F4F6" />
        </button>

        <button
          className="viewer-ctrl-btn"
          onClick={handleReset}
          title="Đặt lại góc nhìn chính diện"
          style={ctrlBtnStyle}
        >
          <RefreshCw size={14} color="#F3F4F6" />
        </button>

        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.18)' }} />

        <button
          className="viewer-ctrl-btn"
          onClick={toggleFullscreen}
          title="Toàn màn hình"
          style={ctrlBtnStyle}
        >
          {isFullscreen ? <Minimize2 size={15} color="#F3F4F6" /> : <Maximize2 size={15} color="#F3F4F6" />}
        </button>
      </div>
    </div>
  );
};

const ctrlBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.15s ease'
};
