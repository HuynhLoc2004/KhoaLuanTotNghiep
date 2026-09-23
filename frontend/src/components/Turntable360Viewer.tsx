import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  RotateCw,
  RotateCcw,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Layers,
  Sun,
  Camera,
  Loader2,
  Box
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

const PLINTH_RADIUS = 1.25;
const PLINTH_HEIGHT = 0.06;

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
  const isAutoRotatingRef = useRef(isAutoRotating);
  useEffect(() => {
    isAutoRotatingRef.current = isAutoRotating;
  }, [isAutoRotating]);

  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [lightingPreset, setLightingPreset] = useState<'museum' | 'daylight'>('museum');
  const [wireframeMode, setWireframeMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modelStats, setModelStats] = useState<{ vertices: number; faces: number } | null>(null);

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
  const lightsRef = useRef<{
    keyLight: THREE.DirectionalLight;
    fillLight: THREE.DirectionalLight;
    ambientLight: THREE.AmbientLight;
    rimLight: THREE.DirectionalLight;
    frontLight: THREE.DirectionalLight;
  } | null>(null);
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

  // 1. Khởi tạo Three.js Scene, Camera, Lights, và Bục trưng bày Bảo tàng
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const heightNum = typeof height === 'number' ? height : 520;

    // SCENE: Không gian tối trầm sang trọng của phòng trưng bày bảo tàng (#0b0d13)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0d13);
    sceneRef.current = scene;

    // CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / heightNum, 0.1, 100);
    camera.position.set(0, 1.45, 4.0);
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
    renderer.toneMappingExposure = 1.35; // Cường độ phơi sáng chuẩn giúp hiện vật nổi bật, rực rỡ, không bị tối
    rendererRef.current = renderer;

    // CONTROLS (OrbitControls)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 8.5;
    controls.minDistance = 1.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.04;
    controls.target.set(0, 1.05, 0);
    controlsRef.current = controls;

    // LIGHTING (Hệ thống đèn bảo tàng chuyên dụng hài hòa cho Dark Mode)
    // 1. Ánh sáng môi trường dịu ấm (khử bóng chết ở mọi góc nhìn)
    const ambientLight = new THREE.AmbientLight(0xfff6ec, 1.6);
    scene.add(ambientLight);

    // 2. Đèn rọi trực diện (Front Key Light): Rọi thẳng mặt trước hiện vật, sáng rõ chi tiết và màu sắc
    const frontLight = new THREE.DirectionalLight(0xfff8f0, 2.0);
    frontLight.position.set(0, 1.8, 4.0);
    scene.add(frontLight);

    // 3. Đèn Spotlight nghệ thuật góc trên bên phải (Tạo khối nổi 3D sang trọng)
    const keyLight = new THREE.DirectionalLight(0xffeed6, 1.7);
    keyLight.position.set(2.4, 3.5, 2.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    // 4. Đèn phụ bù sáng góc trái (Fill Light: khử bóng tối gắt bên sườn)
    const fillLight = new THREE.DirectionalLight(0xdce8ff, 1.3);
    fillLight.position.set(-2.4, 2.0, 2.0);
    scene.add(fillLight);

    // 5. Đèn viền sau (Rim Light: tôn đường bao vật thể)
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.3);
    rimLight.position.set(0, 3.0, -3.0);
    scene.add(rimLight);

    lightsRef.current = { keyLight, fillLight, ambientLight, rimLight, frontLight };

    // TURNTABLE GROUP (Bục trưng bày đá đen mờ Obsidian chống lóa)
    const turntableGroup = new THREE.Group();
    scene.add(turntableGroup);
    turntableGroupRef.current = turntableGroup;

    // Bục hình trụ đá đen mờ (Matte Obsidian: roughness 0.95 để KHÔNG BỊ HẮT TRẮNG BẠC)
    const plinthGeo = new THREE.CylinderGeometry(PLINTH_RADIUS, PLINTH_RADIUS * 1.015, PLINTH_HEIGHT, 64);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x14161d, // Đen than đá trầm tối
      roughness: 0.95, // Nhám mịn mờ hoàn toàn, triệt tiêu lóa sáng
      metalness: 0.02
    });
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.position.y = PLINTH_HEIGHT / 2;
    plinthMesh.receiveShadow = true;
    turntableGroup.add(plinthMesh);

    // Đường viền kim loại đồng cổ tối màu ở chân bục (tinh tế, kín đáo)
    const trimGeo = new THREE.CylinderGeometry(PLINTH_RADIUS * 1.018, PLINTH_RADIUS * 1.022, 0.012, 64);
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x423522, // Đồng cổ tối màu trang nhã
      roughness: 0.65,
      metalness: 0.35
    });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.y = 0.006;
    turntableGroup.add(trimMesh);

    // Tạo bóng đổ tiếp xúc mềm mại tự nhiên dưới chân cổ vật (Radial Gradient)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const shadowCtx = shadowCanvas.getContext('2d');
    if (shadowCtx) {
      const grad = shadowCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      shadowCtx.fillStyle = grad;
      shadowCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);

    // Bóng đổ tiếp xúc nhỏ gọn vừa vặn ngay dưới chân hiện vật
    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 1.2),
      new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, opacity: 0.55, depthWrite: false })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = PLINTH_HEIGHT + 0.001;
    turntableGroup.add(contactShadow);

    // Bóng đổ dưới sàn phòng
    const floorShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(PLINTH_RADIUS * 2.2, PLINTH_RADIUS * 2.2),
      new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, opacity: 0.35, depthWrite: false })
    );
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.y = 0.001;
    scene.add(floorShadow);

    // VÒNG LẶP ANIMATION (Tự động xoay bục 360 độ - sử dụng Ref để không bị lỗi stale closure)
    let lastTime = performance.now();
    const animate = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000.0;
      lastTime = now;

      if (isAutoRotatingRef.current && turntableGroupRef.current) {
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

  // 2. Tải và Gắn Mô hình 3D .GLB lên đĩa xoay (Chỉ tải lại khi URL thay đổi)
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

        // Đặt chân cổ vật đứng vững VỪA KHÍT trên mặt bục trưng bày (Y = PLINTH_HEIGHT)
        // Không bị chìm xuống bục và không bị lơ lửng
        root.position.x = -center.x * targetScale;
        root.position.z = -center.z * targetScale;
        root.position.y = PLINTH_HEIGHT - (box.min.y * targetScale) + 0.001;

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
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach((m) => {
                  (m as THREE.MeshStandardMaterial).wireframe = wireframeMode;
                });
              } else {
                (mesh.material as THREE.MeshStandardMaterial).wireframe = wireframeMode;
              }
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
  }, [fullModelUrl]);

  // 3. Chuyển đổi Ánh sáng: Trưng bày Bảo tàng vs Studio Ban ngày
  const toggleLighting = () => {
    setLightingPreset((prev) => {
      const next = prev === 'museum' ? 'daylight' : 'museum';
      if (lightsRef.current && sceneRef.current && rendererRef.current) {
        const { keyLight, fillLight, ambientLight, frontLight } = lightsRef.current;
        if (next === 'museum') {
          frontLight.color.setHex(0xfff8f0);
          frontLight.intensity = 2.0;
          keyLight.color.setHex(0xffeed6);
          keyLight.intensity = 1.7;
          fillLight.color.setHex(0xdce8ff);
          fillLight.intensity = 1.3;
          ambientLight.color.setHex(0xfff6ec);
          ambientLight.intensity = 1.6;
          sceneRef.current.background = new THREE.Color(0x0b0d13);
          rendererRef.current.toneMappingExposure = 1.35;
        } else {
          frontLight.color.setHex(0xffffff);
          frontLight.intensity = 1.8;
          keyLight.color.setHex(0xffffff);
          keyLight.intensity = 1.8;
          fillLight.color.setHex(0xf0f4f8);
          fillLight.intensity = 1.3;
          ambientLight.color.setHex(0xffffff);
          ambientLight.intensity = 1.8;
          sceneRef.current.background = new THREE.Color(0x181c24);
          rendererRef.current.toneMappingExposure = 1.30;
        }
      }
      return next;
    });
  };

  // 4. Bật / Tắt Lưới Đa giác Wireframe (Cập nhật trực tiếp trên GPU, không tải lại file)
  const toggleWireframe = () => {
    setWireframeMode((prev) => {
      const next = !prev;
      if (modelObjectRef.current) {
        modelObjectRef.current.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach((m) => {
                  (m as THREE.MeshStandardMaterial).wireframe = next;
                  m.needsUpdate = true;
                });
              } else {
                (mesh.material as THREE.MeshStandardMaterial).wireframe = next;
                mesh.material.needsUpdate = true;
              }
            }
          }
        });
      }
      return next;
    });
  };

  // 5. Căn lại góc nhìn ban đầu
  const handleResetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 1.8, 4.2);
    controlsRef.current.target.set(0, 1.1, 0);
    controlsRef.current.update();
  };

  // 6. Toàn màn hình (Fullscreen)
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => {
        if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      }, 100);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // 7. Xử lý Audio Thuyết Minh
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
        borderRadius: isFullscreen ? 0 : 12,
        overflow: 'hidden',
        background: '#0c0e14',
        border: isFullscreen ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {/* Header Info Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          pointerEvents: 'none',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              padding: '3px 10px',
              borderRadius: 16,
              background: 'rgba(212, 168, 106, 0.15)',
              color: 'var(--accent-gold, #d4a86a)',
              border: '1px solid rgba(212, 168, 106, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <Box size={13} />
            Không gian trưng bày 3D
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
              {modelStats.faces.toLocaleString()} mặt lưới
            </span>
          )}
        </div>
        <h3
          style={{
            margin: '4px 0 0 0',
            fontSize: '1.15rem',
            fontWeight: 600,
            color: '#ffffff',
            textShadow: '0 2px 6px rgba(0, 0, 0, 0.8)'
          }}
        >
          {artifactName}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.65)',
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
            background: 'rgba(12, 14, 20, 0.9)',
            backdropFilter: 'blur(8px)',
            zIndex: 15,
            padding: 24,
            textAlign: 'center'
          }}
        >
          {fullImageUrl ? (
            <div
              style={{
                width: 130,
                height: 130,
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 16,
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
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
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(212, 168, 106, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold, #d4a86a)',
                marginBottom: 16
              }}
            >
              <Camera size={28} />
            </div>
          )}

          <h4 style={{ color: '#fff', margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 600 }}>
            {isGenerating3D ? 'Đang số hóa mô hình 3D...' : 'Chưa có mô hình 3D cho hiện vật này'}
          </h4>
          <p style={{ color: 'rgba(255, 255, 255, 0.65)', maxWidth: 400, margin: '0 0 18px 0', fontSize: '0.84rem', lineHeight: 1.5 }}>
            {isGenerating3D
              ? 'Hệ thống đang tiến hành xử lý hình ảnh và tái tạo khối 3D đa giác. Quá trình xử lý mất khoảng vài giây.'
              : 'Bạn có thể tạo mô hình 3D tương tác từ hình ảnh tư liệu của hiện vật.'}
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
                padding: '9px 20px',
                borderRadius: 20,
                cursor: isGenerating3D ? 'not-allowed' : 'pointer'
              }}
            >
              {isGenerating3D ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Đang xử lý trong tiến trình nền...</span>
                </>
              ) : (
                <>
                  <Box size={15} />
                  <span>Tạo mô hình 3D ngay</span>
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
            background: 'rgba(12, 14, 20, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 12
          }}
        >
          <Loader2 size={32} style={{ color: 'var(--accent-gold, #d4a86a)' }} className="animate-spin" />
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', marginTop: 12, fontSize: '0.85rem' }}>
            Đang tải dữ liệu không gian 3D...
          </p>
        </div>
      )}

      {/* Error Message */}
      {modelError && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(239, 68, 68, 0.9)',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: 6,
            fontSize: '0.8rem',
            zIndex: 20
          }}
        >
          {modelError}
        </div>
      )}

      {/* Thanh Công Cụ Điều Khiển (Góc phải trên) */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          display: 'flex',
          gap: 6,
          zIndex: 10
        }}
      >
        {/* Nút 1: Tự động xoay */}
        <button
          type="button"
          onClick={() => setIsAutoRotating((prev) => !prev)}
          title={isAutoRotating ? 'Tạm dừng xoay' : 'Tiếp tục tự xoay 360°'}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: isAutoRotating ? 'rgba(212, 168, 106, 0.25)' : 'rgba(20, 24, 33, 0.75)',
            border: isAutoRotating ? '1px solid #d4a86a' : '1px solid rgba(255, 255, 255, 0.15)',
            color: isAutoRotating ? '#d4a86a' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.15s ease'
          }}
        >
          <RotateCw size={16} />
        </button>

        {/* Nút 2: Đổi ánh sáng */}
        <button
          type="button"
          onClick={toggleLighting}
          title={`Đổi ánh sáng: ${lightingPreset === 'museum' ? 'Ánh sáng bảo tàng ấm (Bật)' : 'Ánh sáng ban ngày (Bật)'}`}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: lightingPreset === 'museum' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(20, 24, 33, 0.75)',
            border: lightingPreset === 'museum' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.15)',
            color: lightingPreset === 'museum' ? '#f59e0b' : '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.15s ease'
          }}
        >
          <Sun size={16} />
        </button>

        {/* Nút 3: Lưới đa giác Wireframe */}
        <button
          type="button"
          onClick={toggleWireframe}
          title={wireframeMode ? 'Tắt lưới đa giác' : 'Xem cấu trúc lưới đa giác 3D'}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: wireframeMode ? 'rgba(59, 130, 246, 0.25)' : 'rgba(20, 24, 33, 0.75)',
            border: wireframeMode ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.15)',
            color: wireframeMode ? '#60a5fa' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.15s ease'
          }}
        >
          <Layers size={16} />
        </button>

        {/* Nút 4: Căn lại góc nhìn chuẩn */}
        <button
          type="button"
          onClick={handleResetCamera}
          title="Căn lại góc nhìn ban đầu"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'rgba(20, 24, 33, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.15s ease'
          }}
        >
          <RotateCcw size={16} />
        </button>

        {/* Nút 5: Toàn màn hình */}
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Xem toàn màn hình'}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: isFullscreen ? 'rgba(212, 168, 106, 0.25)' : 'rgba(20, 24, 33, 0.75)',
            border: isFullscreen ? '1px solid #d4a86a' : '1px solid rgba(255, 255, 255, 0.15)',
            color: isFullscreen ? '#d4a86a' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.15s ease'
          }}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* Thanh Phát Audio Thuyết Minh */}
      {fullAudioUrl && (
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: 16,
            right: 16,
            background: 'rgba(15, 18, 26, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 10,
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            zIndex: 10,
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)'
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
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--accent-gold, #d4a86a)',
              color: '#000000',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {isPlayingAudio ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: 2 }} />}
          </button>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', color: '#d4a86a', fontWeight: 600 }}>
                Thuyết minh tự động
              </span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.55)' }}>
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
                accentColor: 'var(--accent-gold, #d4a86a)',
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
              color: audioMuted ? '#ef4444' : 'rgba(255, 255, 255, 0.75)',
              cursor: 'pointer',
              padding: 4
            }}
          >
            {audioMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
        </div>
      )}

      {/* Chỉ dẫn tương tác bảo tàng */}
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
              color: 'rgba(255, 255, 255, 0.6)',
              background: 'rgba(15, 18, 26, 0.75)',
              padding: '4px 14px',
              borderRadius: 16,
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            Kéo chuột để xoay 360° • Cuộn để phóng to / thu nhỏ
          </span>
        </div>
      )}
    </div>
  );
};
