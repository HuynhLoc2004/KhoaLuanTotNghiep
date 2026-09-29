import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import {
  Upload,
  Box,
  Compass,
  Maximize2,
  Minimize2,
  RefreshCw,
  X,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FolderOpen,
  Eye,
  Footprints,
  Cpu
} from 'lucide-react';
import './room3DViewer.css';

interface Room3DReconstructionViewerProps {
  initialGlbUrl?: string;
  roomName?: string;
  onClose?: () => void;
}

interface Saved3DModel {
  filename: string;
  url: string;
  sizeMB: string;
  createdAt: string;
}

interface ReconstructionJobStatus {
  id: string;
  roomName: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  message: string;
  glbUrl?: string;
  fileSizeMB?: number;
  durationSeconds?: number;
  error?: string;
}

export const Room3DReconstructionViewer: React.FC<Room3DReconstructionViewerProps> = ({
  initialGlbUrl,
  roomName = 'Không Gian Bảo Tàng 3D (COLMAP + OpenMVS)',
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const fpsControlsRef = useRef<PointerLockControls | null>(null);
  const currentModelRef = useRef<THREE.Group | null>(null);

  // States
  const [activeGlbUrl, setActiveGlbUrl] = useState<string>(initialGlbUrl || '');
  const [controlMode, setControlMode] = useState<'orbit' | 'fps'>('orbit');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadPercent, setLoadPercent] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Khởi tạo không gian 3D...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(true);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(!initialGlbUrl);
  const [savedModels, setSavedModels] = useState<Saved3DModel[]>([]);
  const [toolsStatus, setToolsStatus] = useState<{ colmap: boolean; openMVS: boolean; details: string } | null>(null);

  // Form State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [customRoomName, setCustomRoomName] = useState<string>(roomName || 'Gian Phòng Trưng Bày');
  const [cameraModel, setCameraModel] = useState<string>('OPENCV_FISHEYE');
  const [isReconstructing, setIsReconstructing] = useState<boolean>(false);
  const [activeJob, setActiveJob] = useState<ReconstructionJobStatus | null>(null);

  // WASD Key State for FPS Walk
  const keysPressed = useRef<{ [key: string]: boolean }>({
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    Space: false,
    ShiftLeft: false
  });

  // 1. Fetch danh sách model đã tạo & trạng thái công cụ COLMAP/OpenMVS
  const fetchModelsAndTools = async () => {
    try {
      const res = await fetch('/api/rooms/3d-models');
      if (res.ok) {
        const data = await res.json();
        setSavedModels(data.models || []);
        if (!activeGlbUrl && data.models?.length > 0) {
          setActiveGlbUrl(data.models[0].url);
          setShowUploadModal(false);
        }
      }
    } catch (e) {
      console.warn('Lỗi lấy danh sách 3D models:', e);
    }

    try {
      const res = await fetch('/api/rooms/sfm-tools-status');
      if (res.ok) {
        const data = await res.json();
        setToolsStatus(data.tools || null);
      }
    } catch (e) {
      console.warn('Lỗi kiểm tra tools SfM:', e);
    }
  };

  useEffect(() => {
    fetchModelsAndTools();
  }, []);

  // 2. Khởi tạo Three.js Engine
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 1.6, 5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.9);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight1.position.set(10, 20, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa5f3fc, 1.0);
    dirLight2.position.set(-15, -10, -15);
    scene.add(dirLight2);

    // Controls: Orbit
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.05;
    orbit.maxDistance = 60;
    orbit.minDistance = 0.5;
    orbitControlsRef.current = orbit;

    // Controls: PointerLock (FPS Walk)
    const fps = new PointerLockControls(camera, renderer.domElement);
    fps.addEventListener('lock', () => setIsLocked(true));
    fps.addEventListener('unlock', () => setIsLocked(false));
    fpsControlsRef.current = fps;

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (fps.isLocked) {
        // Xử lý di chuyển WASD
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= velocity.y * 10.0 * delta;

        direction.z = Number(keysPressed.current.KeyW) - Number(keysPressed.current.KeyS);
        direction.x = Number(keysPressed.current.KeyD) - Number(keysPressed.current.KeyA);
        direction.normalize();

        const speed = 14.0;
        if (keysPressed.current.KeyW || keysPressed.current.KeyS) velocity.z -= direction.z * speed * delta;
        if (keysPressed.current.KeyA || keysPressed.current.KeyD) velocity.x -= direction.x * speed * delta;
        if (keysPressed.current.Space) velocity.y += speed * 0.6 * delta;
        if (keysPressed.current.ShiftLeft) velocity.y -= speed * 0.6 * delta;

        fps.moveRight(-velocity.x * delta);
        fps.moveForward(-velocity.z * delta);
        camera.position.y += velocity.y * delta;
      } else if (orbit.enabled) {
        orbit.update();
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Keyboard handlers
    const onKeyDown = (e: KeyboardEvent) => {
      if (keysPressed.current[e.code] !== undefined) {
        keysPressed.current[e.code] = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (keysPressed.current[e.code] !== undefined) {
        keysPressed.current[e.code] = false;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      orbit.dispose();
      renderer.dispose();
    };
  }, []);

  // 3. Switch Control Mode (Orbit vs FPS Walk)
  useEffect(() => {
    if (controlMode === 'orbit') {
      if (fpsControlsRef.current?.isLocked) {
        fpsControlsRef.current.unlock();
      }
      if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;
    } else {
      if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;
      // Nhấp chuột vào canvas để kích hoạt lock
    }
  }, [controlMode]);

  // 4. Load 3D Model GLB vào Scene
  useEffect(() => {
    if (!activeGlbUrl || !sceneRef.current) return;

    setLoading(true);
    setLoadPercent(0);
    setStatusText('Đang nạp mô hình không gian 3D...');
    setErrorMsg(null);

    // Dọn dẹp model cũ
    if (currentModelRef.current && sceneRef.current) {
      sceneRef.current.remove(currentModelRef.current);
      currentModelRef.current = null;
    }

    const loader = new GLTFLoader();
    loader.load(
      activeGlbUrl,
      (gltf) => {
        const model = gltf.scene;

        // Tự động căn giữa và đưa về kích thước phòng thực tế
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        model.position.x -= center.x;
        model.position.y -= center.y;
        model.position.z -= center.z;

        // Chuẩn hóa tỷ lệ nếu quá lớn hoặc quá nhỏ
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 50) {
          const s = 20 / maxDim;
          model.scale.set(s, s, s);
        } else if (maxDim < 2) {
          const s = 10 / maxDim;
          model.scale.set(s, s, s);
        }

        // Tối ưu vật liệu nhìn hai mặt (DoubleSide)
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach((m) => {
                  m.side = THREE.DoubleSide;
                });
              } else {
                mesh.material.side = THREE.DoubleSide;
              }
            }
          }
        });

        sceneRef.current?.add(model);
        currentModelRef.current = model;

        // Đặt camera nhìn vào phòng
        if (cameraRef.current) {
          cameraRef.current.position.set(0, 1.5, Math.max(size.z, 6));
          cameraRef.current.lookAt(0, 0, 0);
          if (orbitControlsRef.current) {
            orbitControlsRef.current.target.set(0, 0, 0);
            orbitControlsRef.current.update();
          }
        }

        setLoading(false);
      },
      (xhr) => {
        if (xhr.total > 0) {
          const p = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadPercent(p);
          setStatusText(`Đang nạp 3D... (${p}%)`);
        }
      },
      (err) => {
        console.error('Lỗi nạp GLB:', err);
        setErrorMsg('Không thể nạp mô hình 3D. Hãy kiểm tra lại file hoặc mạng kết nối.');
        setLoading(false);
      }
    );
  }, [activeGlbUrl]);

  // 5. Gửi 20-30 ảnh sang Backend để chạy COLMAP + OpenMVS
  const handleUploadAndReconstruct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length < 3) {
      alert('Vui lòng chọn tối thiểu 3 ảnh góc rộng (Khuyến nghị 20–30 ảnh xoay vòng quanh phòng)');
      return;
    }

    setIsReconstructing(true);

    try {
      const formData = new FormData();
      formData.append('roomName', customRoomName);
      formData.append('cameraModel', cameraModel);
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      const res = await fetch('/api/rooms/reconstruct', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}: Lỗi máy chủ`);
      }

      const data = await res.json();
      const jobId = data.job.id;
      setActiveJob(data.job);

      // Bắt đầu chu kỳ thăm dò tiến độ (Polling status) mỗi 2 giây
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/rooms/status/${jobId}`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            const job = statusData.job as ReconstructionJobStatus;
            setActiveJob(job);

            if (job.status === 'completed' && job.glbUrl) {
              clearInterval(pollInterval);
              setIsReconstructing(false);
              setActiveGlbUrl(job.glbUrl);
              setShowUploadModal(false);
              setSelectedFiles([]);
              fetchModelsAndTools();
            } else if (job.status === 'failed') {
              clearInterval(pollInterval);
              setIsReconstructing(false);
              alert(`Tái tạo thất bại: ${job.error || 'Lỗi không xác định'}`);
            }
          }
        } catch (pollErr) {
          console.warn('Lỗi thăm dò tiến độ:', pollErr);
        }
      }, 2000);
    } catch (err: any) {
      alert(`Lỗi khởi chạy: ${err.message}`);
      setIsReconstructing(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="r3d-wrapper">
      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        className="r3d-canvas-container"
        onClick={() => {
          if (controlMode === 'fps' && fpsControlsRef.current && !isLocked) {
            fpsControlsRef.current.lock();
          }
        }}
        style={{ cursor: controlMode === 'fps' && !isLocked ? 'pointer' : 'default' }}
      />

      {/* Crosshair khi ở chế độ FPS Walk */}
      {controlMode === 'fps' && isLocked && <div className="r3d-crosshair" />}

      {/* Banner hướng dẫn khóa chuột trong FPS */}
      {controlMode === 'fps' && !isLocked && (
        <div className="r3d-fps-banner">
          👉 Bấm vào màn hình để bắt đầu bước đi (Nhấn ESC để mở chuột)
        </div>
      )}

      {/* Top Header Bar */}
      <div className="r3d-header-bar">
        <div className="r3d-header-left">
          <div className="r3d-header-icon">
            <Box size={22} />
          </div>
          <div className="r3d-header-info">
            <div className="r3d-title-row">
              <h1 className="r3d-title">{roomName}</h1>
              <span className="r3d-badge-sfm">COLMAP SfM + OpenMVS</span>
            </div>
            <p className="r3d-subtitle">Mô hình thực thể 3D hình học không gian (Photogrammetry)</p>
          </div>
        </div>

        {/* Nút điều khiển bên phải */}
        <div className="r3d-header-right">
          {/* Toggle Chế độ Điều Khiển: Orbit vs Walk */}
          <div className="r3d-mode-toggle">
            <button
              onClick={() => setControlMode('orbit')}
              className={`r3d-mode-btn ${controlMode === 'orbit' ? 'active' : ''}`}
              title="Xoay quan sát toàn cảnh"
            >
              <Eye size={14} />
              <span>Xoay (Orbit)</span>
            </button>
            <button
              onClick={() => {
                setControlMode('fps');
                setTimeout(() => fpsControlsRef.current?.lock(), 100);
              }}
              className={`r3d-mode-btn ${controlMode === 'fps' ? 'active' : ''}`}
              title="Đi bộ tự do trong phòng bằng W-A-S-D"
            >
              <Footprints size={14} />
              <span>Bước Đi (WASD)</span>
            </button>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="r3d-btn-primary"
            title="Tái tạo phòng mới từ ảnh"
          >
            <Camera size={16} />
            <span>Tạo Phòng Mới</span>
          </button>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className="r3d-btn-icon"
            title="Hướng dẫn điều khiển"
          >
            <HelpCircle size={18} />
          </button>

          <button
            onClick={toggleFullscreen}
            className="r3d-btn-icon"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="r3d-btn-icon r3d-btn-close"
              title="Đóng viewer"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Loading Progress Bar */}
      {loading && (
        <div className="r3d-loading-overlay">
          <div className="r3d-loading-card">
            <div style={{ display: 'inline-flex', padding: 12, borderRadius: 14, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', marginBottom: 12 }}>
              <Box size={28} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px 0', color: '#ffffff' }}>{statusText}</h3>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
              Đang phân tích hình học lưới tam giác 3D và phủ texture
            </p>
            <div className="r3d-progress-bar-bg">
              <div
                className="r3d-progress-bar-fill"
                style={{ width: `${loadPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 40, background: 'rgba(127, 29, 29, 0.95)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '12px 18px', borderRadius: 14, color: '#fee2e2', fontSize: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertCircle size={18} style={{ color: '#f87171', flexShrink: 0 }} />
          <span>{errorMsg}</span>
          <button
            onClick={() => setActiveGlbUrl(activeGlbUrl)}
            style={{ marginLeft: 'auto', padding: '4px 10px', background: '#991b1b', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff', borderRadius: 8, fontSize: 11, cursor: 'pointer' }}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Hướng dẫn Điều Khiển (Bottom Left) */}
      {showHelp && (
        <div className="r3d-help-box">
          <div className="r3d-help-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Compass size={14} /> {controlMode === 'orbit' ? 'Điều Khiển Xoay (Orbit)' : 'Điều Khiển Bước Đi (FPS Walk)'}
            </span>
            <button
              onClick={() => setShowHelp(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}
            >
              ✕
            </button>
          </div>

          {controlMode === 'orbit' ? (
            <div>
              <div className="r3d-help-row">
                <span>Xoay phòng:</span>
                <kbd className="r3d-kbd">Kéo Chuột Trái</kbd>
              </div>
              <div className="r3d-help-row">
                <span>Trượt vị trí (Pan):</span>
                <kbd className="r3d-kbd">Kéo Chuột Phải</kbd>
              </div>
              <div className="r3d-help-row">
                <span>Phóng to / Thu nhỏ:</span>
                <kbd className="r3d-kbd">Cuộn Chuột</kbd>
              </div>
            </div>
          ) : (
            <div>
              <div className="r3d-help-row">
                <span>Bước đi trong phòng:</span>
                <span style={{ display: 'flex', gap: 4 }}>
                  {['W', 'A', 'S', 'D'].map((k) => (
                    <kbd key={k} className="r3d-kbd">{k}</kbd>
                  ))}
                </span>
              </div>
              <div className="r3d-help-row">
                <span>Xoay góc mắt nhìn:</span>
                <kbd className="r3d-kbd">Di Chuột</kbd>
              </div>
              <div className="r3d-help-row">
                <span>Nâng / Hạ độ cao:</span>
                <span style={{ display: 'flex', gap: 4 }}>
                  <kbd className="r3d-kbd">Space</kbd>
                  <kbd className="r3d-kbd">Shift</kbd>
                </span>
              </div>
              <div className="r3d-help-row">
                <span>Mở con trỏ chuột:</span>
                <kbd className="r3d-kbd">Phím ESC</kbd>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Tải 20-30 ảnh & Chạy Pipeline SfM */}
      {showUploadModal && (
        <div className="r3d-modal-overlay">
          <div className="r3d-modal-content">
            <div className="r3d-modal-header">
              <h2 className="r3d-modal-title">
                <Sparkles size={20} style={{ color: '#34d399' }} />
                Khởi Tạo Không Gian 3D (COLMAP + OpenMVS)
              </h2>
              {activeGlbUrl && (
                <button
                  onClick={() => setShowUploadModal(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Trạng thái công cụ */}
            <div className="r3d-tool-status">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e2e8f0' }}>
                <Cpu size={16} style={{ color: toolsStatus?.colmap ? '#34d399' : '#f87171' }} />
                <span>Thuật toán học thuật: <strong>{toolsStatus?.colmap ? 'COLMAP SfM Sẵn sàng' : 'Chưa cài đặt COLMAP'}</strong></span>
              </span>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>
                {toolsStatus?.openMVS ? 'OpenMVS: [OK]' : 'Mesh: COLMAP Native'}
              </span>
            </div>

            {/* Danh sách model 3D đã tái tạo trước đó */}
            {savedModels.length > 0 && (
              <div className="r3d-saved-models">
                <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FolderOpen size={16} style={{ color: '#34d399' }} />
                  Hoặc chọn không gian 3D đã tái tạo:
                </label>
                <div className="r3d-saved-list">
                  {savedModels.map((m) => (
                    <button
                      key={m.filename}
                      type="button"
                      onClick={() => {
                        setActiveGlbUrl(m.url);
                        setShowUploadModal(false);
                      }}
                      className={`r3d-saved-item ${activeGlbUrl === m.url ? 'active' : ''}`}
                    >
                      <CheckCircle2 size={14} />
                      {m.filename.replace('.glb', '')} ({m.sizeMB} MB)
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleUploadAndReconstruct}>
              <div className="r3d-form-group">
                <label className="r3d-label">Tên Không Gian / Căn Phòng</label>
                <input
                  type="text"
                  value={customRoomName}
                  onChange={(e) => setCustomRoomName(e.target.value)}
                  className="r3d-input"
                  placeholder="Ví dụ: Gian Trưng Bày Đồ Gốm Thời Lý"
                  required
                />
              </div>

              <div className="r3d-form-group">
                <label className="r3d-label">Mô Hình Camera Khử Méo (COLMAP Camera Model)</label>
                <select
                  value={cameraModel}
                  onChange={(e) => setCameraModel(e.target.value)}
                  className="r3d-select"
                >
                  <option value="OPENCV_FISHEYE">OPENCV_FISHEYE (Khuyên dùng cho Camera góc rộng 0.5x)</option>
                  <option value="RADIAL">RADIAL (Camera điện thoại tiêu chuẩn 1x)</option>
                  <option value="PINHOLE">PINHOLE (Góc hẹp / Không méo quang học)</option>
                </select>
              </div>

              <div className="r3d-form-group">
                <label className="r3d-label">
                  Chọn 20–30 ảnh chụp camera 0.5x quanh phòng (Multi-view SfM)
                </label>
                <div className="r3d-dropzone">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        setSelectedFiles(Array.from(e.target.files));
                      }
                    }}
                    style={{ display: 'none' }}
                    id="sfm-file-input"
                  />
                  <label htmlFor="sfm-file-input" style={{ cursor: 'pointer', display: 'block' }}>
                    <Upload className="r3d-dropzone-icon" />
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', margin: '0 0 4px 0' }}>
                      Bấm vào đây để chọn toàn bộ ảnh căn phòng
                    </p>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
                      (Định dạng JPG, PNG - Khuyến nghị 20–30 ảnh có độ gối đầu 60%)
                    </p>
                  </label>
                </div>
                {selectedFiles.length > 0 && (
                  <p style={{ fontSize: 12, color: '#34d399', marginTop: 8, fontWeight: 600 }}>
                    ✓ Đã chọn {selectedFiles.length} bức ảnh
                  </p>
                )}
              </div>

              {/* Tiến trình SfM */}
              {isReconstructing ? (
                <div style={{ padding: 16, borderRadius: 14, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', textAlign: 'center' }}>
                  <RefreshCw size={24} style={{ color: '#34d399', margin: '0 auto 8px', animation: 'spin 1.2s linear infinite' }} />
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#6ee7b7', margin: '0 0 4px 0' }}>
                    [{activeJob?.currentStep || 'Đang xử lý'}]: {activeJob?.message || 'Đang tính toán ma trận camera...'}
                  </p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 10px 0' }}>
                    Tiến độ: {activeJob?.progress || 10}% - Pipeline chạy trên nền VPS
                  </p>
                  <div className="r3d-progress-bar-bg">
                    <div
                      className="r3d-progress-bar-fill"
                      style={{ width: `${activeJob?.progress || 10}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="r3d-modal-actions">
                  {activeGlbUrl && (
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="r3d-btn-cancel"
                    >
                      Đóng
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={selectedFiles.length < 3 || isReconstructing}
                    className="r3d-btn-submit"
                  >
                    Bắt Đầu Tái Tạo 3D SfM ({selectedFiles.length} ảnh)
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room3DReconstructionViewer;
