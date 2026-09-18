import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCw, Play, Pause, ZoomIn, ZoomOut, Maximize2, Minimize2, RefreshCw, Box, Eye } from 'lucide-react';

interface Turntable360ViewerProps {
  images?: string[];
  model3dUrl?: string;
  title?: string;
  autoPlay?: boolean;
  autoPlaySpeedMs?: number;
  className?: string;
  height?: string | number;
}

export const Turntable360Viewer: React.FC<Turntable360ViewerProps> = ({
  images = [],
  model3dUrl,
  title,
  autoPlay = false, // KHÔNG tự động nhảy như video, đứng yên chờ người dùng xoay
  className = '',
  height = 460
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewAngle, setViewAngle] = useState(0);

  // References for Three.js
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const turntableGroupRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number | null>(null);

  // Frame scrubber state for multi-angle photos
  const [frameIndex, setFrameIndex] = useState(0);
  const isDraggingPhotoRef = useRef(false);
  const startXPhotoRef = useRef(0);

  const validImages = images && images.length > 0 ? images : [];
  const totalFrames = validImages.length;
  const isMultiAnglePhotography = totalFrames > 1;

  // ================= THREE.JS 3D SCENE SETUP =================
  useEffect(() => {
    if (!mountRef.current || !is3DMode) return;

    const width = mountRef.current.clientWidth || 600;
    const currentHeight = typeof height === 'number' ? height : parseInt(String(height)) || 460;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / currentHeight, 0.1, 100);
    camera.position.set(0, 2.2, 5.2);
    cameraRef.current = camera;

    // 3. Renderer with antialias and soft shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, currentHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.0;
    controls.maxDistance = 8.5;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Không cho camera chui xuống gầm sàn
    controls.autoRotate = isPlaying;
    controls.autoRotateSpeed = 1.8;
    controlsRef.current = controls;

    // 5. Studio Lighting
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.9);
    scene.add(ambientLight);

    // Warm overhead gallery spotlight
    const spotLight = new THREE.SpotLight(0xffeedd, 3.5);
    spotLight.position.set(2, 6, 3);
    spotLight.angle = Math.PI / 5;
    spotLight.penumbra = 0.8;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.bias = -0.001;
    scene.add(spotLight);

    // Subtle blue-gold rim fill light
    const rimLight = new THREE.DirectionalLight(0x88bbff, 1.2);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // Warm secondary fill
    const fillLight = new THREE.PointLight(0xd97706, 1.0, 10);
    fillLight.position.set(0, 0.5, 3.5);
    scene.add(fillLight);

    // 6. Turntable Group (Bục xoay tròn 3D)
    const turntable = new THREE.Group();
    scene.add(turntable);
    turntableGroupRef.current = turntable;

    // Bục xoay trên (Upper Pedestal Disc)
    const pedestalGeo = new THREE.CylinderGeometry(1.65, 1.7, 0.16, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      roughness: 0.35,
      metalness: 0.25
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.08;
    pedestal.receiveShadow = true;
    turntable.add(pedestal);

    // Vành đồng viền bục xoay (Brass Accent Rim)
    const rimGeo = new THREE.TorusGeometry(1.68, 0.025, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.25,
      metalness: 0.85
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.005;
    turntable.add(rim);

    // Sàn bảo tàng dưới bục để nhận bóng đổ
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.17;
    floor.receiveShadow = true;
    scene.add(floor);

    // 7. Tạo Hiện Vật 3D Đặt Trên Bục (3D Artifact Relic)
    // Dùng ảnh hiện vật chất lượng cao áp lên mô hình 3D hai mặt có độ dày và viền điêu khắc cổ
    const textureLoader = new THREE.TextureLoader();
    const mainImageUrl = validImages[0] || 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80';

    textureLoader.load(mainImageUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;

      // Kích thước hiện vật theo tỷ lệ ảnh
      const imgAspect = (tex.image.width && tex.image.height) ? (tex.image.width / tex.image.height) : 0.8;
      const relicHeight = 2.3;
      const relicWidth = relicHeight * imgAspect;

      // Khối hiện vật 3D có độ sâu (box with rounded feel)
      const relicGeo = new THREE.BoxGeometry(relicWidth, relicHeight, 0.12);

      // Chất liệu cổ vật đồng/gỗ với ánh kim di sản
      const frontMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.4,
        metalness: 0.15,
        transparent: true,
        alphaTest: 0.05
      });

      const sideMat = new THREE.MeshStandardMaterial({
        color: 0x3d2817, // Màu gỗ sồi / đồng cổ xẫm
        roughness: 0.7,
        metalness: 0.3
      });

      const relicMesh = new THREE.Mesh(relicGeo, [
        sideMat, sideMat, sideMat, sideMat, frontMat, frontMat
      ]);
      relicMesh.position.y = relicHeight / 2 + 0.01;
      relicMesh.castShadow = true;
      relicMesh.receiveShadow = true;
      turntable.add(relicMesh);

      // Đế hoa sen / chân đế bọc kim loại gắn dưới chân hiện vật
      const baseGeo = new THREE.CylinderGeometry(relicWidth * 0.45, relicWidth * 0.55, 0.12, 32);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x8b1818, // Màu đỏ son bảo tàng
        roughness: 0.3,
        metalness: 0.4
      });
      const relicBase = new THREE.Mesh(baseGeo, baseMat);
      relicBase.position.y = 0.06;
      relicBase.castShadow = true;
      turntable.add(relicBase);
    });

    // 8. Animation Loop
    let angle = 0;
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      controls.update();

      // Cập nhật góc quay hiển thị
      const azAngle = Math.round(((controls.getAzimuthalAngle() * 180 / Math.PI) % 360 + 360) % 360);
      setViewAngle(azAngle);

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize handler
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
  }, [is3DMode, height, validImages]);

  // Đồng bộ trạng thái Auto-Rotate với Controls
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isPlaying;
    }
  }, [isPlaying]);

  // Đặt lại góc nhìn Three.js
  const handleReset = () => {
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.set(0, 2.2, 5.2);
      controlsRef.current.target.set(0, 0.8, 0);
      controlsRef.current.reset();
      setIsPlaying(false);
    }
  };

  // Phóng to
  const handleZoom = (delta: number) => {
    if (cameraRef.current) {
      const dir = new THREE.Vector3();
      cameraRef.current.getWorldDirection(dir);
      cameraRef.current.position.addScaledVector(dir, delta * 0.4);
    }
  };

  // Toàn màn hình
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
        background: 'radial-gradient(circle at 50% 30%, #1e2430 0%, #0f131a 70%, #090b0e 100%)',
        borderRadius: isFullscreen ? 0 : 16,
        overflow: 'hidden',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 48px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.08)'
      }}
    >
      {/* Top Bar Header */}
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
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#F59E0B',
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 20,
              letterSpacing: '0.5px'
            }}
          >
            <Box size={13} />
            MÔ HÌNH 3D TRƯNG BÀY
          </span>
          {title && (
            <span
              style={{
                color: '#F8FAFC',
                fontSize: 13,
                fontWeight: 600,
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              {title}
            </span>
          )}
        </div>

        {/* Degree Pill */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#F3F4F6',
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 20,
            fontVariantNumeric: 'tabular-nums'
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

      {/* Touch Interaction Hint */}
      <div
        style={{
          position: 'absolute',
          bottom: 56,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: 'rgba(255,255,255,0.5)',
          fontSize: 11,
          fontWeight: 500,
          pointerEvents: 'none',
          background: 'rgba(0,0,0,0.4)',
          padding: '2px 10px',
          borderRadius: 20
        }}
      >
        <span>‹ Dùng chuột hoặc chạm vuốt để xoay hiện vật 360° đa chiều ›</span>
      </div>

      {/* Floating Control Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(12px)',
          padding: '4px 8px',
          borderRadius: 30,
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
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

        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)' }} />

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

        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)' }} />

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
