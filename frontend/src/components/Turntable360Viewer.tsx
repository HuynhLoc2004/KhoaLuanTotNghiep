import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  RotateCw,
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
  Box,
  Sparkles
} from 'lucide-react';
import { API_ROOT } from '../services/api';

interface Turntable360ViewerProps {
  modelUrl?: string;
  imageUrl?: string;
  artifactName?: string;
  artifactPeriod?: string;
  audioNarrationUrl?: string;
  translations?: Record<string, any>;
  autoPlayAudio?: boolean;
  onGenerate3DClick?: () => void;
  isGenerating3D?: boolean;
  height?: number | string;
  autoRotateSpeed?: number;
  hideControls?: boolean;
  onClick?: () => void;
}

const PLINTH_RADIUS = 1.25;
const PLINTH_HEIGHT = 0.06;

export const Turntable360Viewer: React.FC<Turntable360ViewerProps> = ({
  modelUrl,
  imageUrl,
  artifactName = 'Cổ vật di sản',
  artifactPeriod = 'Bảo tàng Lịch sử TP.HCM',
  audioNarrationUrl,
  translations,
  autoPlayAudio = true,
  onGenerate3DClick,
  isGenerating3D = false,
  height = 520,
  autoRotateSpeed = 1.2,
  hideControls = false,
  onClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Định dạng đường dẫn URL file 3D đầy đủ
  const fullModelUrl = React.useMemo(() => {
    if (!modelUrl || typeof modelUrl !== 'string') return null;
    const trimmed = modelUrl.trim();
    if (!trimmed || trimmed === 'undefined' || trimmed === 'null' || trimmed.endsWith('/undefined') || trimmed.endsWith('/null')) {
      return null;
    }
    if (trimmed.includes('r2.dev/models_3d/')) {
      const filename = trimmed.split('/models_3d/').pop();
      if (filename) return `${API_ROOT}/uploads/artifacts/models_3d/${filename}`;
    }
    return trimmed.startsWith('http') ? trimmed : `${API_ROOT}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
  }, [modelUrl]);

  // Định dạng đường dẫn URL ảnh đầy đủ
  const fullImageUrl = React.useMemo(() => {
    if (!imageUrl || typeof imageUrl !== 'string') return null;
    const trimmed = imageUrl.trim();
    if (!trimmed || trimmed === 'undefined' || trimmed === 'null' || trimmed.endsWith('/undefined') || trimmed.endsWith('/null')) {
      return null;
    }
    return trimmed.startsWith('http') ? trimmed : `${API_ROOT}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
  }, [imageUrl]);

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

  // Chế độ xem: '360' (Xoay tròn tự do toàn diện 3D) | 'parallax' (2.5D Parallax)
  const [viewMode, setViewMode] = useState<'parallax' | '360'>('360');
  const viewModeRef = useRef(viewMode);

  // Chế độ vân bề mặt: 'vertex' (Màu PBR 3D sắc nét từ file GLB) | 'photo' (Phủ ảnh phẳng 2D)
  const [textureMode, setTextureMode] = useState<'photo' | 'vertex'>('vertex');
  const textureModeRef = useRef<'photo' | 'vertex'>('vertex');
  const originalTextureRef = useRef<THREE.Texture | null>(null);

  // Lưu trữ texture gốc và toạ độ UV gốc từ file GLB (do AI TRELLIS tạo ra)
  const glbOriginalMapsRef = useRef<Map<THREE.Mesh, THREE.Texture | null>>(new Map());
  const glbOriginalUVsRef = useRef<Map<THREE.Mesh, THREE.BufferAttribute>>(new Map());
  const planarUVsRef = useRef<Map<THREE.Mesh, THREE.BufferAttribute>>(new Map());

  const applyTextureMode = (mode: 'photo' | 'vertex') => {
    textureModeRef.current = mode;
    setTextureMode(mode);
    if (!modelObjectRef.current) return;
    modelObjectRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const updateMat = (m: THREE.Material) => {
            const std = m as THREE.MeshStandardMaterial;
            const hasGLBTexture = !!glbOriginalMapsRef.current.get(mesh);

            if (mode === 'photo' && originalTextureRef.current) {
              // Chế độ: Phủ ảnh phẳng 2D
              const pUV = planarUVsRef.current.get(mesh);
              if (pUV) mesh.geometry.setAttribute('uv', pUV);
              std.map = originalTextureRef.current;
              std.vertexColors = false;
              std.color.setHex(0xffffff);
              std.roughness = 0.55;
              std.metalness = 0.08;
            } else if (hasGLBTexture) {
              // Chế độ mặc định: Dùng texture PBR 3D chính thống từ TRELLIS (đầy đủ màu đồng, chi tiết 360°)
              const oUV = glbOriginalUVsRef.current.get(mesh);
              if (oUV) mesh.geometry.setAttribute('uv', oUV);
              std.map = glbOriginalMapsRef.current.get(mesh) || null;
              std.vertexColors = false;
              std.color.setHex(0xffffff);
              std.roughness = 0.55;
              std.metalness = 0.15;
            } else {
              // Fallback nếu không có texture map
              std.map = null;
              std.vertexColors = !!mesh.geometry.getAttribute('color');
              std.color.setHex(0xffffff);
              std.roughness = 0.55;
              std.metalness = 0.1;
            }
            std.transparent = false;
            std.opacity = 1.0;
            std.depthWrite = true;
            std.depthTest = true;
            std.side = THREE.DoubleSide;
            std.needsUpdate = true;
          };
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(updateMat);
          } else {
            updateMat(mesh.material);
          }
        }
      }
    });
  };

  const toggleTextureMode = () => {
    applyTextureMode(textureMode === 'photo' ? 'vertex' : 'photo');
  };

  // Nạp texture ảnh gốc chất lượng cao để chiếu lên mặt 3D
  useEffect(() => {
    if (!fullImageUrl) return;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    loader.load(
      fullImageUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        originalTextureRef.current = tex;
        if (textureModeRef.current === 'photo') {
          applyTextureMode('photo');
        }
      },
      undefined,
      (err) => console.warn('[Turntable] Không tải được texture ảnh gốc:', err)
    );
  }, [fullImageUrl]);

  useEffect(() => {
    viewModeRef.current = viewMode;
    if (controlsRef.current) {
      if (viewMode === 'parallax') {
        controlsRef.current.minAzimuthAngle = -Math.PI * 0.20; // Giới hạn góc quay ngang ~ ±36 độ
        controlsRef.current.maxAzimuthAngle = Math.PI * 0.20;
        controlsRef.current.minPolarAngle = Math.PI / 2 - 0.25; // Giới hạn góc gật gù trên dưới
        controlsRef.current.maxPolarAngle = Math.PI / 2 + 0.18;
        if (turntableGroupRef.current) {
          turntableGroupRef.current.rotation.y = 0;
        }
        if (cameraRef.current) {
          cameraRef.current.position.set(0, 1.45, 4.0);
          controlsRef.current.target.set(0, 1.05, 0);
        }
      } else {
        controlsRef.current.minAzimuthAngle = -Infinity;
        controlsRef.current.maxAzimuthAngle = Infinity;
        controlsRef.current.minPolarAngle = 0;
        controlsRef.current.maxPolarAngle = Math.PI / 2 + 0.04;
      }
      controlsRef.current.update();
    }
  }, [viewMode]);

  // Tổng hợp danh sách các ngôn ngữ có thuyết minh giọng đọc
  const availableAudioLangs = React.useMemo(() => {
    const list: { code: string; label: string; url: string }[] = [];
    if (audioNarrationUrl) {
      list.push({ code: 'default', label: 'Mặc định', url: audioNarrationUrl });
    }
    if (translations) {
      Object.entries(translations).forEach(([langCode, trans]: [string, any]) => {
        if (trans && trans.audioNarrationUrl) {
          const already = list.find((x) => x.url === trans.audioNarrationUrl);
          if (!already) {
            list.push({
              code: langCode,
              label: langCode.toUpperCase(),
              url: trans.audioNarrationUrl
            });
          }
        }
      });
    }
    return list;
  }, [audioNarrationUrl, translations]);

  // Ngôn ngữ âm thanh đang chọn (ưu tiên 'vi', 'default', hoặc mục đầu tiên có voice)
  const [activeAudioLang, setActiveAudioLang] = useState<string>('default');

  useEffect(() => {
    if (availableAudioLangs.length > 0) {
      const hasVi = availableAudioLangs.find((x) => x.code === 'vi');
      const hasDefault = availableAudioLangs.find((x) => x.code === 'default');
      setActiveAudioLang(hasVi ? 'vi' : hasDefault ? 'default' : availableAudioLangs[0].code);
    }
  }, [availableAudioLangs]);

  const currentAudioItem = availableAudioLangs.find((x) => x.code === activeAudioLang) || availableAudioLangs[0] || null;
  const rawAudioUrl = currentAudioItem?.url || audioNarrationUrl || null;

  // Định dạng đường dẫn Audio đầy đủ
  const fullAudioUrl = React.useMemo(() => {
    if (!rawAudioUrl || typeof rawAudioUrl !== 'string') return null;
    const trimmed = rawAudioUrl.trim();
    if (!trimmed || trimmed === 'undefined' || trimmed === 'null' || trimmed.endsWith('/undefined') || trimmed.endsWith('/null')) {
      return null;
    }
    return trimmed.startsWith('http') ? trimmed : `${API_ROOT}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
  }, [rawAudioUrl]);

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
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25; // Phơi sáng 1.25 giúp tôn màu đồng cổ rực rỡ, trung thực như ảnh gốc
    rendererRef.current = renderer;

    // ENVIRONMENT MAP (Tạo ánh sáng môi trường 360° mềm mại - khử hoàn toàn bóng đen sẫm, tôn màu đồng cổ)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnvTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = roomEnvTexture;

    // CONTROLS (OrbitControls)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 8.5;
    controls.minDistance = 1.5;
    if (viewModeRef.current === 'parallax') {
      controls.minAzimuthAngle = -Math.PI * 0.20;
      controls.maxAzimuthAngle = Math.PI * 0.20;
      controls.minPolarAngle = Math.PI / 2 - 0.25;
      controls.maxPolarAngle = Math.PI / 2 + 0.18;
    } else {
      controls.maxPolarAngle = Math.PI / 2 + 0.04;
    }
    controls.target.set(0, 1.05, 0);
    controlsRef.current = controls;

    // LIGHTING (Hệ thống đèn bảo tàng dịu ấm, khử hoàn toàn bóng đen sẫm, tái hiện màu gốc 100%)
    // 1. Ánh sáng môi trường dịu nhẹ (khử bóng chết nhưng giữ chiều sâu màu sắc)
    const ambientLight = new THREE.AmbientLight(0xfff6ea, 1.15);
    scene.add(ambientLight);

    // 2. Ánh sáng bán cầu nhẹ dịu (HemisphereLight) phản chiếu từ vòm trần và sàn để khối đồng sáng tự nhiên
    const hemiLight = new THREE.HemisphereLight(0xffeedd, 0x333344, 0.75);
    scene.add(hemiLight);

    // 3. Đèn rọi trực diện (Front Key Light)
    const frontLight = new THREE.DirectionalLight(0xfff8f0, 0.95);
    frontLight.position.set(0, 1.8, 4.0);
    scene.add(frontLight);

    // 4. Đèn Spotlight nghệ thuật góc trên bên phải
    const keyLight = new THREE.DirectionalLight(0xffeed6, 1.25);
    keyLight.position.set(2.4, 3.5, 2.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    // 5. Đèn phụ bù sáng góc trái (Fill Light)
    const fillLight = new THREE.DirectionalLight(0xdce8ff, 0.65);
    fillLight.position.set(-2.4, 2.0, 2.0);
    scene.add(fillLight);

    // 6. Đèn viền sau (Rim Light: tôn đường bao vật thể)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.65);
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
        if (viewModeRef.current === 'parallax') {
          // Dao động con lắc mềm mại quanh trục chính diện (+- 14 độ) để tôn khối nổi và bắt sáng PBR
          const t = now * 0.001;
          turntableGroupRef.current.rotation.y = Math.sin(t * 0.9) * 0.24;
        } else {
          turntableGroupRef.current.rotation.y += (autoRotateSpeed * 0.25) * delta;
        }
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

    // Responsive Resize Handler (ResizeObserver + Window Listener)
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight || (typeof height === 'number' ? height : 520);
      if (newWidth === 0 || newHeight === 0) return;

      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      pmremGenerator.dispose();
      roomEnvTexture.dispose();
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

        root.updateMatrixWorld(true);
        const rootBox = new THREE.Box3().setFromObject(root);
        const rootSize = new THREE.Vector3();
        rootBox.getSize(rootSize);

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

              // 1. Lưu lại toạ độ UV gốc từ file GLB (do AI TRELLIS tạo ra với đầy đủ các mặt 360°)
              const origUv = mesh.geometry.getAttribute('uv');
              if (origUv) {
                glbOriginalUVsRef.current.set(mesh, origUv.clone() as THREE.BufferAttribute);
              }

              // 2. Tạo toạ độ UV phẳng dự phòng chuẩn xác theo toàn bộ khối vật thể (cho chế độ "Phủ ảnh phẳng 2D")
              if (posAttr) {
                const planarUvs = new Float32Array(posAttr.count * 2);
                const v = new THREE.Vector3();
                for (let i = 0; i < posAttr.count; i++) {
                  v.fromBufferAttribute(posAttr, i);
                  v.applyMatrix4(mesh.matrixWorld);
                  planarUvs[i * 2] = (v.x - rootBox.min.x) / (rootSize.x || 1.0);
                  planarUvs[i * 2 + 1] = (v.y - rootBox.min.y) / (rootSize.y || 1.0);
                }
                planarUVsRef.current.set(mesh, new THREE.BufferAttribute(planarUvs, 2));
              }
            }

            if (mesh.material) {
              const applySolidMaterial = (m: THREE.Material) => {
                const std = m as THREE.MeshStandardMaterial;
                std.wireframe = wireframeMode;
                // BẢO ĐẢM HIỆN VẬT ĐẶC ĐẶNG (OPAQUE), KHÔNG BỊ TRONG SUỐT / X-RAY DO VEC4 COLOR:
                std.transparent = false;
                std.opacity = 1.0;
                std.depthWrite = true;
                std.depthTest = true;
                std.side = THREE.DoubleSide; // Render 2 mặt, không bị rỗng thủng khi xoay

                // Lưu texture map gốc từ file GLB (chứa màu sắc đồng cổ thực tế do TRELLIS bake)
                if (std.map && !glbOriginalMapsRef.current.has(mesh)) {
                  std.map.colorSpace = THREE.SRGBColorSpace;
                  std.map.needsUpdate = true;
                  glbOriginalMapsRef.current.set(mesh, std.map);
                }

                const hasGLBTexture = !!glbOriginalMapsRef.current.get(mesh);

                if (textureModeRef.current === 'photo' && originalTextureRef.current) {
                  // Phủ ảnh phẳng 2D từ ảnh gốc
                  const pUV = planarUVsRef.current.get(mesh);
                  if (pUV) mesh.geometry.setAttribute('uv', pUV);
                  std.map = originalTextureRef.current;
                  std.vertexColors = false;
                  std.color.setHex(0xffffff);
                  std.roughness = 0.55;
                  std.metalness = 0.08;
                } else if (hasGLBTexture) {
                  // Mặc định: Giữ nguyên Texture PBR 3D chính thống từ TRELLIS, không đè UV!
                  const oUV = glbOriginalUVsRef.current.get(mesh);
                  if (oUV) mesh.geometry.setAttribute('uv', oUV);
                  std.map = glbOriginalMapsRef.current.get(mesh) || null;
                  std.vertexColors = false;
                  std.color.setHex(0xffffff);
                  std.roughness = 0.55;
                  std.metalness = 0.15;
                } else {
                  // Fallback cho mô hình chỉ có vertex colors
                  std.map = null;
                  std.vertexColors = !!mesh.geometry.getAttribute('color');
                  std.color.setHex(0xffffff);
                  std.roughness = 0.55;
                  std.metalness = 0.1;
                }
                std.needsUpdate = true;
              };

              if (Array.isArray(mesh.material)) {
                mesh.material.forEach(applySolidMaterial);
              } else {
                applySolidMaterial(mesh.material);
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
          frontLight.intensity = 0.85;
          keyLight.color.setHex(0xffeed6);
          keyLight.intensity = 1.1;
          fillLight.color.setHex(0xdce8ff);
          fillLight.intensity = 0.45;
          ambientLight.color.setHex(0xfff6ec);
          ambientLight.intensity = 0.75;
          sceneRef.current.background = new THREE.Color(0x0b0d13);
          rendererRef.current.toneMappingExposure = 1.02;
        } else {
          frontLight.color.setHex(0xffffff);
          frontLight.intensity = 0.95;
          keyLight.color.setHex(0xffffff);
          keyLight.intensity = 1.15;
          fillLight.color.setHex(0xf0f4f8);
          fillLight.intensity = 0.5;
          ambientLight.color.setHex(0xffffff);
          ambientLight.intensity = 0.8;
          sceneRef.current.background = new THREE.Color(0x181c24);
          rendererRef.current.toneMappingExposure = 1.0;
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
              const updateMat = (m: THREE.Material) => {
                const std = m as THREE.MeshStandardMaterial;
                std.wireframe = next;
                std.transparent = false;
                std.opacity = 1.0;
                std.depthWrite = true;
                std.depthTest = true;
                std.side = THREE.DoubleSide;
                std.needsUpdate = true;
              };
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach(updateMat);
              } else {
                updateMat(mesh.material);
              }
            }
          }
        });
      }
      return next;
    });
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
  // Tự động phát thuyết minh khi mở không gian trưng bày 3D (nếu có audio)
  useEffect(() => {
    if (!autoPlayAudio || !fullAudioUrl || !audioRef.current) return;

    // Reset về đầu và phát ngay
    audioRef.current.currentTime = 0;
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlayingAudio(true);
        })
        .catch((err) => {
          console.warn('[3D Viewer] Tự động phát bị giới hạn bởi chính sách âm thanh trình duyệt:', err);
          setIsPlayingAudio(false);
        });
    }
  }, [fullAudioUrl, autoPlayAudio]);

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

  // Xử lý phân biệt kéo xoay 3D vs bấm click chuyển trang
  const isDraggingRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    if (dx > 6 || dy > 6) {
      isDraggingRef.current = true;
    }
  };

  const handleContainerClick = () => {
    if (isDraggingRef.current) return;
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      ref={containerRef}
      className="turntable-360-container"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onClick={handleContainerClick}
      style={{
        position: 'relative',
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: isFullscreen ? 0 : 12,
        overflow: 'hidden',
        background: '#0c0e14',
        border: isFullscreen ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />



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
                cursor: isGenerating3D ? 'wait' : 'pointer'
              }}
            >
              {isGenerating3D ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Đang dựng 3D trong tiến trình nền...</span>
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
            background: 'rgba(12, 14, 20, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 12
          }}
        >
          <Loader2 size={36} style={{ color: 'var(--accent-gold, #d4a86a)' }} className="spin" />
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginTop: 12, fontSize: '0.88rem', fontWeight: 500 }}>
            Đang tải dữ liệu không gian 3D...
          </p>
        </div>
      )}

      {/* Error Message */}
      {modelError && (
        <div
          style={{
            position: 'absolute',
            top: 50,
            left: 12,
            right: 12,
            background: 'rgba(220, 38, 38, 0.92)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: 8,
            fontSize: '0.78rem',
            zIndex: 25,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            flexWrap: 'wrap'
          }}
        >
          <span>{modelError}</span>
          {onGenerate3DClick && (
            <button
              type="button"
              onClick={onGenerate3DClick}
              style={{
                background: '#ffffff',
                color: '#b91c1c',
                border: 'none',
                borderRadius: 4,
                padding: '3px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <RotateCw size={12} />
              Dựng lại mô hình 3D
            </button>
          )}
        </div>
      )}

      {/* Thanh Topbar: Thông tin hiện vật & Toolbar điều khiển (Responsive Flex chống đè) */}
      {!hideControls && (
        <div
          className="turntable-top-bar"
        style={{
          position: 'absolute',
          top: 10,
          left: 12,
          right: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 8,
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        {/* Góc trái: Thông tin & Badges */}
        <div
          className="turntable-header-info"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minWidth: 0,
            flexShrink: 1,
            pointerEvents: 'auto'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
                padding: '3px 8px',
                borderRadius: 16,
                background: 'rgba(212, 168, 106, 0.15)',
                color: 'var(--accent-gold, #d4a86a)',
                border: '1px solid rgba(212, 168, 106, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap'
              }}
            >
              {viewMode === 'parallax' ? <Sparkles size={12} /> : <Box size={12} />}
              {viewMode === 'parallax' ? '2.5D Parallax' : 'Không gian 3D 360°'}
            </span>
            {modelStats && (
              <span
                className="turntable-stats-badge"
                style={{
                  fontSize: '0.68rem',
                  color: 'rgba(255, 255, 255, 0.65)',
                  background: 'rgba(0, 0, 0, 0.5)',
                  padding: '2px 7px',
                  borderRadius: 12,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  whiteSpace: 'nowrap'
                }}
              >
                {modelStats.faces.toLocaleString()} mặt lưới
              </span>
            )}
          </div>
          <h3
            style={{
              margin: '3px 0 0 0',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#ffffff',
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.8)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {artifactName}
          </h3>
          {artifactPeriod && (
            <p
              style={{
                margin: 0,
                fontSize: '0.74rem',
                color: 'rgba(255, 255, 255, 0.65)',
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {artifactPeriod}
            </p>
          )}
        </div>

        {/* Góc phải: Thanh công cụ điều khiển */}
        <div
          className="turntable-toolbar"
          style={{
            display: 'flex',
            gap: 5,
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            alignItems: 'center',
            pointerEvents: 'auto',
            flexShrink: 0,
            maxWidth: '75%'
          }}
        >
          {/* Nút Chuyển Chế Độ: Xoay 360° vs 2.5D Parallax */}
          <button
            type="button"
            className="turntable-btn-text"
            onClick={() => {
              setViewMode((prev) => (prev === 'parallax' ? '360' : 'parallax'));
            }}
            title={
              viewMode === '360'
                ? 'Đang mở xoay tự do 360°. Nhấn để chuyển sang 2.5D Parallax'
                : 'Đang bật 2.5D Parallax. Nhấn để mở khóa xoay 360°'
            }
            style={{
              height: 34,
              padding: '0 10px',
              borderRadius: 8,
              background: viewMode === '360' ? 'rgba(20, 24, 33, 0.75)' : 'rgba(212, 168, 106, 0.28)',
              border: viewMode === '360' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #d4a86a',
              color: viewMode === '360' ? '#ffffff' : '#d4a86a',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <Sparkles size={14} />
            <span>{viewMode === '360' ? 'Xoay 360°' : '2.5D Parallax'}</span>
          </button>

          {/* Nút 1: Tự động xoay */}
          <button
            type="button"
            className="turntable-btn-icon"
            onClick={() => setIsAutoRotating((prev) => !prev)}
            title={isAutoRotating ? 'Tạm dừng xoay' : 'Tiếp tục tự xoay 360°'}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: isAutoRotating ? 'rgba(212, 168, 106, 0.25)' : 'rgba(20, 24, 33, 0.75)',
              border: isAutoRotating ? '1px solid #d4a86a' : '1px solid rgba(255, 255, 255, 0.15)',
              color: isAutoRotating ? '#d4a86a' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            <RotateCw size={15} />
          </button>

          {/* Nút 2: Đổi ánh sáng */}
          <button
            type="button"
            className="turntable-btn-icon"
            onClick={toggleLighting}
            title={`Đổi ánh sáng: ${lightingPreset === 'museum' ? 'Ánh sáng bảo tàng ấm (Bật)' : 'Ánh sáng ban ngày (Bật)'}`}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: lightingPreset === 'museum' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(20, 24, 33, 0.75)',
              border: lightingPreset === 'museum' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.15)',
              color: lightingPreset === 'museum' ? '#f59e0b' : '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            <Sun size={15} />
          </button>

          {/* Nút 3: Lưới đa giác Wireframe */}
          <button
            type="button"
            className="turntable-btn-icon"
            onClick={toggleWireframe}
            title={wireframeMode ? 'Tắt lưới đa giác' : 'Xem cấu trúc lưới đa giác 3D'}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: wireframeMode ? 'rgba(59, 130, 246, 0.25)' : 'rgba(20, 24, 33, 0.75)',
              border: wireframeMode ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.15)',
              color: wireframeMode ? '#60a5fa' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            <Layers size={15} />
          </button>


          {/* Nút 5: Toàn màn hình */}
          <button
            type="button"
            className="turntable-btn-icon"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Xem toàn màn hình'}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: isFullscreen ? 'rgba(212, 168, 106, 0.25)' : 'rgba(20, 24, 33, 0.75)',
              border: isFullscreen ? '1px solid #d4a86a' : '1px solid rgba(255, 255, 255, 0.15)',
              color: isFullscreen ? '#d4a86a' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>
      )}

      {/* Thanh Phát Audio Thuyết Minh */}
      {!hideControls && fullAudioUrl && (
        <div
          className="turntable-audio-bar"
          style={{
            position: 'absolute',
            bottom: 12,
            left: 14,
            right: 14,
            background: 'rgba(15, 18, 26, 0.92)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 10,
            padding: '8px 12px',
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
            preload="auto"
            onPlay={() => setIsPlayingAudio(true)}
            onPause={() => setIsPlayingAudio(false)}
            onTimeUpdate={handleAudioTimeUpdate}
            onEnded={() => setIsPlayingAudio(false)}
          />

          <button
            type="button"
            onClick={togglePlayAudio}
            title={isPlayingAudio ? 'Tạm dừng thuyết minh' : 'Phát thuyết minh tự động'}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.74rem', color: '#d4a86a', fontWeight: 600 }}>
                  Thuyết minh giọng đọc
                </span>
                {availableAudioLangs.length > 1 && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    {availableAudioLangs.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveAudioLang(item.code);
                        }}
                        style={{
                          fontSize: '0.65rem',
                          padding: '1px 6px',
                          borderRadius: 4,
                          border: activeAudioLang === item.code ? '1px solid #d4a86a' : '1px solid rgba(255, 255, 255, 0.2)',
                          background: activeAudioLang === item.code ? 'rgba(212, 168, 106, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                          color: activeAudioLang === item.code ? '#d4a86a' : 'rgba(255, 255, 255, 0.7)',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
      {!hideControls && !fullAudioUrl && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            right: 12,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <span
            style={{
              fontSize: '0.7rem',
              color: 'rgba(255, 255, 255, 0.75)',
              background: 'rgba(15, 18, 26, 0.85)',
              padding: '4px 14px',
              borderRadius: 16,
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}
          >
            {viewMode === 'parallax'
              ? 'Rê chuột hoặc chạm để nghiêng ngắm nổi khối 3D Parallax • Bấm nút trên thanh công cụ để mở khóa xoay 360°'
              : 'Chạm & xoay tự do 360° • Cuộn / chụm để phóng to'}
          </span>
        </div>
      )}
    </div>
  );
};
