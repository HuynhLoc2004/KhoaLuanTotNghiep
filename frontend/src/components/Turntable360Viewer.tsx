import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  RotateCw,
  Play,
  Pause,
  Maximize2,
  Volume2,
  VolumeX,
  Sparkles,
  Info,
  Layers,
  Sun,
  Camera,
  Loader2
} from 'lucide-react';
import { API_ROOT } from '../services/api';

interface Turntable360ViewerProps {
  modelUrl?: string;
  imageUrl?: string;
  artifactName?: string;
  artifactPeriod?: string;
  audioNarrationUrl?: string;
  onGenerate3DClick?: () => void;
  isGenerating3D?: boolean;
  height?: number | string;
  autoRotateSpeed?: number;
}

export const Turntable360Viewer: React.FC<Turntable360ViewerProps> = ({
  modelUrl,
  imageUrl,
  artifactName = 'Cổ vật di sản',
  artifactPeriod = 'Bảo tàng Lịch sử TP.HCM',
  audioNarrationUrl,
  onGenerate3DClick,
  isGenerating3D = false,
  height = 520,
  autoRotateSpeed = 1.2
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Trạng thái điều khiển 3D
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [lightingPreset, setLightingPreset] = useState<'museum' | 'daylight'>('museum');
  const [wireframeMode, setWireframeMode] = useState(false);
  const [modelStats, setModelStats] = useState<{ vertices: number; faces: number } | null>(null);
  const [showStats, setShowStats] = useState(false);

  // Trạng thái Thuyết minh Audio
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // References cho vòng lặp Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const turntableGroupRef = useRef<THREE.Group | null>(null);
  const modelObjectRef = useRef<THREE.Object3D | null>(null);
  const lightsRef = useRef<{ keyLight: THREE.DirectionalLight; fillLight: THREE.DirectionalLight; ambientLight: THREE.AmbientLight } | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Định dạng đường dẫn URL file 3D đầy đủ
  const fullModelUrl = modelUrl
    ? (modelUrl.startsWith('http') ? modelUrl : `${API_ROOT}${modelUrl.startsWith('/') ? '' : '/'}${modelUrl}`)
    : null;

  // Định dạng đường dẫn URL ảnh đầy đủ
  const fullImageUrl = imageUrl
    ? (imageUrl.startsWith('http') ? imageUrl : `${API_ROOT}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`)
    : null;

  // Định dạng đường dẫn Audio đầy đủ
  const fullAudioUrl = audioNarrationUrl
    ? (audioNarrationUrl.startsWith('http') ? audioNarrationUrl : `${API_ROOT}${audioNarrationUrl.startsWith('/') ? '' : '/'}${audioNarrationUrl}`)
    : null;

  // 1. Khởi tạo Three.js Scene, Camera, Lights, và Turntable Pedestal
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const heightNum = typeof height === 'number' ? height : 520;

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c10); // Nền phòng tối bảo tàng sang trọng
    sceneRef.current = scene;

    // CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / heightNum, 0.1, 100);
    camera.position.set(0, 1.8, 4.2);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, heightNum);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // CONTROLS (OrbitControls)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 8.5;
    controls.minDistance = 1.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Không cho camera nhìn lộn dưới sàn
    controls.target.set(0, 1.1, 0);
    controlsRef.current = controls;

    // LIGHTING (Hệ thống đèn chiếu sáng bảo tàng chuyên nghiệp)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e6, 2.6); // Đèn spotlight chính ấm áp
    keyLight.position.set(3.5, 4.5, 3.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdce7ff, 1.2); // Đèn phụ xanh nhạt làm dịu bóng râm
    fillLight.position.set(-3.5, 2.5, 2.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.4); // Đèn viền tóc nổi bật khối
    rimLight.position.set(0, 3.0, -3.5);
    scene.add(rimLight);

    lightsRef.current = { keyLight, fillLight, ambientLight };

    // TURNTABLE GROUP (Mâm xoay trưng bày hiện vật)
    const turntableGroup = new THREE.Group();
    scene.add(turntableGroup);
    turntableGroupRef.current = turntableGroup;

    // ĐĨA XOAY (Turntable Disc): Đá cẩm thạch Nero Marquina đen bóng viền kim loại vàng
    const discRadius = 1.65;
    const discHeight = 0.12;
    const discGeo = new THREE.CylinderGeometry(discRadius, discRadius * 1.03, discHeight, 64);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x16181f,
      roughness: 0.25,
      metalness: 0.15
    });
    const turntableDisc = new THREE.Mesh(discGeo, discMat);
    turntableDisc.position.y = discHeight / 2;
    turntableDisc.receiveShadow = true;
    turntableGroup.add(turntableDisc);

    // Vành kim loại ánh đồng hoàng gia viền quanh đĩa xoay
    const rimGeo = new THREE.TorusGeometry(discRadius * 1.01, 0.02, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Royal Gold Bronze
      roughness: 0.2,
      metalness: 0.85
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = discHeight;
    turntableGroup.add(rimMesh);

    // Bóng đổ tiếp xúc (Contact shadow ring) dưới nền phòng
    const shadowGeo = new THREE.RingGeometry(discRadius * 0.2, discRadius * 1.5, 64);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = Math.PI / 2;
    shadowMesh.position.y = 0.005;
    scene.add(shadowMesh);

    // Lưới tọa độ sàn bảo tàng tối giản
    const gridHelper = new THREE.GridHelper(10, 20, 0x242836, 0x151822);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // VÒNG LẶP ANIMATION (Tự động xoay đĩa xoay 360 độ)
    let lastTime = performance.now();
    const animate = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000.0;
      lastTime = now;

      // Xoay mâm trưng bày nếu đang bật chế độ tự xoay
      if (isAutoRotating && turntableGroupRef.current) {
        turntableGroupRef.current.rotation.y += (autoRotateSpeed * 0.25) * delta;
      }

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Responsive Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = typeof height === 'number' ? height : containerRef.current.clientHeight || 520;

      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      renderer.dispose();
    };
  }, [height, autoRotateSpeed]);

  // 2. Cập nhật tốc độ xoay khi người dùng toggle Auto-Rotate
  useEffect(() => {
    // Trạng thái được kiểm soát trực tiếp trong vòng lặp animate
  }, [isAutoRotating]);

  // 3. Tải và Gắn Mô hình 3D .GLB lên đĩa xoay
  useEffect(() => {
    if (!fullModelUrl || !turntableGroupRef.current) return;

    setIsLoadingModel(true);
    setModelError(null);

    // Xóa mô hình cũ nếu có
    if (modelObjectRef.current) {
      turntableGroupRef.current.remove(modelObjectRef.current);
      modelObjectRef.current = null;
    }

    const loader = new GLTFLoader();
    loader.load(
      fullModelUrl,
      (gltf) => {
        const root = gltf.scene;
        modelObjectRef.current = root;

        let totalVertices = 0;
        let totalFaces = 0;

        // Tính toán Bounding Box để căn giữa đỉnh cổ vật ngay trên mâm xoay
        const box = new THREE.Box3().setFromObject(root);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Chuẩn hóa tỷ lệ: Chiều cao tối ưu khoảng 2.0 mét trong không gian
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetScale = 2.0 / (maxDim || 1.0);
        root.scale.setScalar(targetScale);

        // Đặt cổ vật đứng vững trên mặt đĩa xoay (Y = 0.12)
        root.position.x = -center.x * targetScale;
        root.position.z = -center.z * targetScale;
        root.position.y = 0.13 - (box.min.y * targetScale);

        // Cấu hình vật liệu PBR cho toàn bộ mesh
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            if (mesh.geometry) {
              const posAttr = mesh.geometry.getAttribute('position');
              if (posAttr) totalVertices += posAttr.count;
              if (mesh.geometry.index) {
                totalFaces += mesh.geometry.index.count / 3;
              } else if (posAttr) {
                totalFaces += posAttr.count / 3;
              }
            }

            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.wireframe = wireframeMode;
              mat.roughness = Math.max(0.35, mat.roughness ?? 0.5);
              mat.metalness = Math.min(0.85, mat.metalness ?? 0.2);
              mat.needsUpdate = true;
            }
          }
        });

        setModelStats({ vertices: totalVertices, faces: Math.round(totalFaces) });
        turntableGroupRef.current?.add(root);
        setIsLoadingModel(false);
      },
      undefined,
      (err) => {
        console.error('[Turntable Viewer] Lỗi tải GLTF:', err);
        setModelError('Không thể nạp file 3D .glb. Vui lòng thử tạo lại mô hình.');
        setIsLoadingModel(false);
      }
    );
  }, [fullModelUrl, wireframeMode]);

  // 4. Thay đổi Preset Ánh Sáng
  useEffect(() => {
    if (!lightsRef.current) return;
    const { keyLight, fillLight, ambientLight } = lightsRef.current;

    if (lightingPreset === 'museum') {
      keyLight.color.setHex(0xfff4e6);
      keyLight.intensity = 2.6;
      fillLight.color.setHex(0xdce7ff);
      fillLight.intensity = 1.2;
      ambientLight.intensity = 0.85;
    } else {
      // Daylight trung tính
      keyLight.color.setHex(0xffffff);
      keyLight.intensity = 2.2;
      fillLight.color.setHex(0xf0f0f0);
      fillLight.intensity = 1.4;
      ambientLight.intensity = 1.0;
    }
  }, [lightingPreset]);

  // 5. Cập nhật Wireframe Mode
  const toggleWireframe = () => {
    setWireframeMode((prev) => {
      const next = !prev;
      if (modelObjectRef.current) {
        modelObjectRef.current.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              (mesh.material as THREE.MeshStandardMaterial).wireframe = next;
            }
          }
        });
      }
      return next;
    });
  };

  // 6. Reset góc nhìn về vị trí chuẩn bảo tàng
  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 1.8, 4.2);
    controlsRef.current.target.set(0, 1.1, 0);
    controlsRef.current.update();
  };

  // 7. Xử lý Audio Thuyết Minh AI
  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return;
    setAudioProgress(audioRef.current.currentTime);
    setAudioDuration(audioRef.current.duration || 0);
  };

  const handleAudioSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setAudioProgress(val);
    }
  };

  const toggleAudioMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioMuted;
    setAudioMuted(!audioMuted);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      className="turntable-360-container"
      style={{
        position: 'relative',
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: 16,
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 35%, #181d29 0%, #0a0c12 100%)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
      }}
    >
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {/* Header Info Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          pointerEvents: 'none',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '3px 10px',
              borderRadius: 20,
              background: 'rgba(212, 175, 55, 0.2)',
              color: 'var(--accent-gold, #d4af37)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <Sparkles size={12} />
            Mô phỏng 3D Đĩa Xoay 360°
          </span>
          {modelStats && (
            <span
              style={{
                fontSize: '0.7rem',
                color: 'rgba(255, 255, 255, 0.65)',
                background: 'rgba(0, 0, 0, 0.5)',
                padding: '3px 8px',
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              {modelStats.faces.toLocaleString()} đa giác
            </span>
          )}
        </div>
        <h3
          style={{
            margin: 0,
            fontSize: '1.2rem',
            fontWeight: 700,
            color: '#ffffff',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)'
          }}
        >
          {artifactName}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '0.82rem',
            color: 'rgba(255, 255, 255, 0.7)',
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)'
          }}
        >
          {artifactPeriod}
        </p>
      </div>

      {/* Fallback khi chưa có file 3D */}
      {!fullModelUrl && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10, 12, 18, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 15,
            padding: 24,
            textAlign: 'center'
          }}
        >
          {fullImageUrl ? (
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: 16,
                overflow: 'hidden',
                marginBottom: 16,
                border: '2px solid rgba(212, 175, 55, 0.4)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
              }}
            >
              <img
                src={fullImageUrl}
                alt={artifactName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold, #d4af37)',
                marginBottom: 16
              }}
            >
              <Camera size={32} />
            </div>
          )}

          <h4 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '1.1rem' }}>
            {isGenerating3D ? 'Đang tái tạo mô hình 3D từ ảnh...' : 'Chưa có mô hình 3D cho hiện vật này'}
          </h4>
          <p style={{ color: 'rgba(255, 255, 255, 0.65)', maxWidth: 420, margin: '0 0 20px 0', fontSize: '0.85rem' }}>
            {isGenerating3D
              ? 'Hệ thống AI đang phân đoạn tách nền, ước lượng độ sâu và dựng khối 3D đặc khép kín. Quá trình mất khoảng 3 - 6 giây.'
              : 'Bạn có thể kích hoạt thuật toán AI để tự động biến bức ảnh chụp tủ kính thành khối 3D đặc đặt trên đĩa xoay.'}
          </p>

          {onGenerate3DClick && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onGenerate3DClick}
              disabled={isGenerating3D}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 24,
                boxShadow: '0 4px 18px rgba(212, 175, 55, 0.35)',
                cursor: isGenerating3D ? 'not-allowed' : 'pointer'
              }}
            >
              {isGenerating3D ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Đang xử lý trong hàng đợi AI...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Kích hoạt tạo mô hình 3D ngay</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Loading Spinner khi tải file GLB */}
      {isLoadingModel && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10, 12, 18, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 12
          }}
        >
          <Loader2 size={36} style={{ color: 'var(--accent-gold, #d4af37)' }} className="animate-spin" />
          <p style={{ color: '#fff', marginTop: 12, fontSize: '0.88rem' }}>
            Đang tải mô hình 3D lên đĩa xoay...
          </p>
        </div>
      )}

      {/* Error Message */}
      {modelError && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'rgba(239, 68, 68, 0.9)',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: 8,
            fontSize: '0.82rem',
            zIndex: 20
          }}
        >
          {modelError}
        </div>
      )}

      {/* Control Buttons Bar (Góc phải trên) */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          gap: 8,
          zIndex: 10
        }}
      >
        {/* Toggle Tự xoay đĩa xoay */}
        <button
          type="button"
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          title={isAutoRotating ? 'Tạm dừng tự xoay' : 'Bật tự xoay 360°'}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: isAutoRotating ? 'rgba(212, 175, 55, 0.3)' : 'rgba(0, 0, 0, 0.6)',
            border: isAutoRotating ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.2)',
            color: isAutoRotating ? '#d4af37' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease'
          }}
        >
          <RotateCw size={17} style={{ transform: isAutoRotating ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s ease' }} />
        </button>

        {/* Toggle Ánh sáng Studio */}
        <button
          type="button"
          onClick={() => setLightingPreset(lightingPreset === 'museum' ? 'daylight' : 'museum')}
          title={`Đổi ánh sáng: ${lightingPreset === 'museum' ? 'Ánh sáng bảo tàng ấm' : 'Ánh sáng tự nhiên'}`}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: lightingPreset === 'museum' ? '#f59e0b' : '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)'
          }}
        >
          <Sun size={17} />
        </button>

        {/* Toggle Lưới Wireframe */}
        <button
          type="button"
          onClick={toggleWireframe}
          title="Bật / tắt lưới đa giác Wireframe"
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: wireframeMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0, 0, 0, 0.6)',
            border: wireframeMode ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.2)',
            color: wireframeMode ? '#60a5fa' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)'
          }}
        >
          <Layers size={17} />
        </button>

        {/* Reset Camera */}
        <button
          type="button"
          onClick={handleResetCamera}
          title="Căn lại góc nhìn ban đầu"
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)'
          }}
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Thanh Phát Audio Thuyết Minh AI (Nếu có audioNarrationUrl) */}
      {fullAudioUrl && (
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: 16,
            right: 16,
            background: 'rgba(15, 20, 29, 0.88)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: 14,
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            zIndex: 10,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
          }}
        >
          <audio
            ref={audioRef}
            src={fullAudioUrl}
            onTimeUpdate={handleAudioTimeUpdate}
            onEnded={() => setIsPlayingAudio(false)}
          />

          <button
            type="button"
            onClick={togglePlayAudio}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--accent-gold, #d4af37)',
              color: '#000000',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {isPlayingAudio ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: 2 }} />}
          </button>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.76rem', color: '#d4af37', fontWeight: 600 }}>
                Thuyết minh giọng đọc AI
              </span>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                {formatTime(audioProgress)} / {formatTime(audioDuration)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={audioDuration || 100}
              value={audioProgress}
              onChange={handleAudioSeek}
              style={{
                width: '100%',
                height: 4,
                accentColor: 'var(--accent-gold, #d4af37)',
                cursor: 'pointer'
              }}
            />
          </div>

          <button
            type="button"
            onClick={toggleAudioMute}
            style={{
              background: 'transparent',
              border: 'none',
              color: audioMuted ? '#ef4444' : 'rgba(255, 255, 255, 0.8)',
              cursor: 'pointer',
              padding: 4
            }}
          >
            {audioMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      )}

      {/* Hint chỉ dẫn góc xoay (Dưới cùng khi không có audio) */}
      {!fullAudioUrl && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <span
            style={{
              fontSize: '0.72rem',
              color: 'rgba(255, 255, 255, 0.55)',
              background: 'rgba(0, 0, 0, 0.5)',
              padding: '4px 14px',
              borderRadius: 20,
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            Chạm hoặc kéo chuột để xoay đa hướng 360° • Cuộn để phóng to / thu nhỏ
          </span>
        </div>
      )}
    </div>
  );
};
