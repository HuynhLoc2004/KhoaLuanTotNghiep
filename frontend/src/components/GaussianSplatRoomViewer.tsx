import React, { useEffect, useRef, useState } from 'react';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import {
  Upload,
  Layers,
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
  Wifi,
  WifiOff
} from 'lucide-react';
import './gaussianSplatViewer.css';

interface GaussianSplatRoomViewerProps {
  initialPlyUrl?: string;
  roomName?: string;
  onClose?: () => void;
}

interface SavedScene {
  filename: string;
  url: string;
  sizeMB: string;
  createdAt: string;
}

interface WorkerStatus {
  ok: boolean;
  status: string;
  gpu?: string;
  latencyMs?: number;
  url?: string;
}

export const GaussianSplatRoomViewer: React.FC<GaussianSplatRoomViewerProps> = ({
  initialPlyUrl,
  roomName = 'Không Gian 3D Gaussian Splatting',
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  // Lọc an toàn URL khởi tạo, tránh lấy giá trị chuỗi "true" từ query ?splat=true
  const sanitizeUrl = (url?: string) => {
    if (!url || url === 'true' || url === '1') return '';
    if (url.endsWith('.ply') || url.endsWith('.splat') || url.includes('/uploads/')) return url;
    return '';
  };

  const [activePlyUrl, setActivePlyUrl] = useState<string>(() => sanitizeUrl(initialPlyUrl));
  const [loading, setLoading] = useState<boolean>(false);
  const [loadPercent, setLoadPercent] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Khởi tạo không gian...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(true);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(!sanitizeUrl(initialPlyUrl));
  const [savedScenes, setSavedScenes] = useState<SavedScene[]>([]);
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus | null>(null);

  // State upload ảnh
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [customRoomName, setCustomRoomName] = useState<string>(roomName || 'Phòng Trưng Bày');
  const [isReconstructing, setIsReconstructing] = useState<boolean>(false);
  const [reconstructProgress, setReconstructProgress] = useState<string>('');

  // Fetch danh sách các scene đã lưu & trạng thái Colab Worker
  const fetchScenesAndStatus = async () => {
    try {
      const res = await fetch('/api/splat/list');
      if (res.ok) {
        const data = await res.json();
        setSavedScenes(data.scenes || []);
        if (!activePlyUrl && data.scenes?.length > 0) {
          setActivePlyUrl(data.scenes[0].url);
          setShowUploadModal(false);
        }
      }
    } catch (e) {
      console.warn('Lỗi lấy danh sách splat scenes:', e);
    }

    try {
      const statusRes = await fetch('/api/splat/status');
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setWorkerStatus(statusData.workerStatus || null);
      }
    } catch (e) {
      console.warn('Lỗi kiểm tra trạng thái Colab Worker:', e);
    }
  };

  useEffect(() => {
    fetchScenesAndStatus();
  }, []);

  // Khởi tạo và nạp 3DGS Viewer
  useEffect(() => {
    if (!activePlyUrl || !containerRef.current) return;

    let isDisposed = false;
    setLoading(true);
    setLoadPercent(0);
    setStatusText('Đang nạp dữ liệu đám mây Gaussian Splatting...');
    setErrorMsg(null);

    // Dọn dẹp viewer cũ nếu có
    if (viewerRef.current) {
      try {
        viewerRef.current.dispose();
      } catch (e) {
        console.warn('Dispose error:', e);
      }
      viewerRef.current = null;
    }

    try {
      const viewer = new GaussianSplats3D.Viewer({
        rootElement: containerRef.current,
        cameraUp: [0, -1, 0],
        initialCameraPosition: [0, 0, 3],
        initialCameraLookAt: [0, 0, 0],
        sphericalHarmonicsDegree: 2,
        halfPrecisionCovariancesOnGPU: true,
        sharedMemoryForWorkers: false
      });

      viewerRef.current = viewer;

      viewer
        .addSplatScene(activePlyUrl, {
          splatAlphaRemovalThreshold: 5,
          showLoadingUI: false,
          progressiveLoad: true,
          onProgress: (percent: number) => {
            if (!isDisposed) {
              setLoadPercent(Math.round(percent));
              setStatusText(`Đang tải 3DGS... (${Math.round(percent)}%)`);
            }
          }
        })
        .then(() => {
          if (!isDisposed) {
            setLoading(false);
            viewer.start();
          }
        })
        .catch((err: any) => {
          if (!isDisposed) {
            console.error('Lỗi nạp 3DGS scene:', err);
            setErrorMsg(`Không thể tải mô hình 3DGS: ${err.message || 'File không hợp lệ hoặc mạng gián đoạn'}`);
            setLoading(false);
          }
        });
    } catch (err: any) {
      setErrorMsg(`Lỗi khởi tạo WebGL 3DGS: ${err.message}`);
      setLoading(false);
    }

    return () => {
      isDisposed = true;
      if (viewerRef.current) {
        try {
          viewerRef.current.dispose();
        } catch {}
        viewerRef.current = null;
      }
    };
  }, [activePlyUrl]);

  // Xử lý gửi 15-30 ảnh sang backend để Colab dựng phòng
  const handleUploadAndReconstruct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length < 3) {
      alert('Vui lòng chọn tối thiểu 3 ảnh chụp quanh phòng (khuyến nghị 15-30 ảnh)');
      return;
    }

    setIsReconstructing(true);
    setReconstructProgress('Đang nén ZIP và gửi ảnh sang Colab GPU Worker...');

    try {
      const formData = new FormData();
      formData.append('roomName', customRoomName);
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      setReconstructProgress('AI DUSt3R + InstantSplat đang huấn luyện 3DGS (Khoảng 2 - 4 phút)...');

      const response = await fetch('/api/splat/reconstruct', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${response.status}: Lỗi máy chủ`);
      }

      const data = await response.json();
      setReconstructProgress('Tái tạo thành công! Đang kết xuất không gian 3D...');

      // Cập nhật lại danh sách và nạp cảnh vừa tạo
      await fetchScenesAndStatus();
      setActivePlyUrl(data.plyUrl);
      setShowUploadModal(false);
      setSelectedFiles([]);
    } catch (err: any) {
      alert(`Lỗi tái tạo: ${err.message}`);
    } finally {
      setIsReconstructing(false);
      setReconstructProgress('');
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
    <div className="gsv-wrapper">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="gsv-canvas-container" />

      {/* Top Bar Header */}
      <div className="gsv-header-bar">
        <div className="gsv-header-left">
          <div className="gsv-header-icon">
            <Sparkles size={20} />
          </div>
          <div className="gsv-header-info">
            <div className="gsv-title-row">
              <h1 className="gsv-title">{roomName}</h1>
              <span className="gsv-badge-3dgs">3D Gaussian Splatting</span>
            </div>
            <p className="gsv-subtitle">Không gian thực thể số hóa (Sparse-view 3DGS)</p>
          </div>
        </div>

        {/* Nút điều khiển nhanh bên phải */}
        <div className="gsv-header-right">
          <button
            onClick={() => setShowUploadModal(true)}
            className="gsv-btn-primary"
            title="Tái tạo phòng mới từ ảnh"
          >
            <Camera size={16} />
            <span>Tạo Phòng Mới</span>
          </button>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className="gsv-btn-icon"
            title="Hướng dẫn di chuyển"
          >
            <HelpCircle size={18} />
          </button>

          <button
            onClick={toggleFullscreen}
            className="gsv-btn-icon"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="gsv-btn-icon gsv-btn-close"
              title="Đóng viewer"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Loading Progress Bar */}
      {loading && (
        <div className="gsv-loading-overlay">
          <div className="gsv-loading-card">
            <div style={{ display: 'inline-flex', padding: 12, borderRadius: 14, background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', marginBottom: 12 }}>
              <Layers size={28} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px 0', color: '#ffffff' }}>{statusText}</h3>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
              Đang kết xuất hàng triệu hạt Gaussian đa hướng với độ chi tiết cao
            </p>
            <div className="gsv-progress-bar-bg">
              <div
                className="gsv-progress-bar-fill"
                style={{ width: `${loadPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="gsv-error-toast">
          <AlertCircle size={18} style={{ color: '#f87171', flexShrink: 0 }} />
          <span>{errorMsg}</span>
          <button
            onClick={() => setActivePlyUrl(activePlyUrl)}
            className="gsv-btn-retry"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Floating Navigation Controls Guide */}
      {showHelp && (
        <div className="gsv-help-box">
          <div className="gsv-help-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Compass size={14} /> Điều Khiển Khám Phá
            </span>
            <button
              onClick={() => setShowHelp(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}
            >
              ✕
            </button>
          </div>
          <div className="gsv-help-row">
            <span>Xoay góc nhìn:</span>
            <kbd className="gsv-kbd">Chuột Trái</kbd>
          </div>
          <div className="gsv-help-row">
            <span>Trượt vị trí (Pan):</span>
            <kbd className="gsv-kbd">Chuột Phải</kbd>
          </div>
          <div className="gsv-help-row">
            <span>Bước đi quanh phòng:</span>
            <span style={{ display: 'flex', gap: 4 }}>
              {['W', 'A', 'S', 'D'].map((k) => (
                <kbd key={k} className="gsv-kbd">{k}</kbd>
              ))}
            </span>
          </div>
          <div className="gsv-help-row">
            <span>Nâng / Hạ độ cao:</span>
            <span style={{ display: 'flex', gap: 4 }}>
              <kbd className="gsv-kbd">E</kbd>
              <kbd className="gsv-kbd">Q</kbd>
            </span>
          </div>
        </div>
      )}

      {/* Modal Tải 15-30 ảnh & Tái Tạo 3DGS */}
      {showUploadModal && (
        <div className="gsv-modal-overlay">
          <div className="gsv-modal-content">
            <div className="gsv-modal-header">
              <h2 className="gsv-modal-title">
                <Sparkles size={20} style={{ color: '#22d3ee' }} />
                Khởi Tạo Không Gian 3DGS Mới
              </h2>
              {activePlyUrl && (
                <button
                  onClick={() => setShowUploadModal(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Worker Status Badge */}
            <div className="gsv-worker-status-badge">
              <span style={{ display: 'flex', alignItems: 'center', color: '#e2e8f0' }}>
                <span className={`gsv-worker-indicator ${workerStatus?.ok ? 'gsv-worker-online' : 'gsv-worker-offline'}`} />
                {workerStatus?.ok ? (
                  <span>Máy chủ GPU Colab: <strong style={{ color: '#4ade80' }}>Sẵn sàng ({workerStatus.latencyMs}ms)</strong></span>
                ) : (
                  <span>Máy chủ GPU Colab: <strong style={{ color: '#f87171' }}>Chưa kết nối</strong></span>
                )}
              </span>
              {workerStatus?.ok ? <Wifi size={16} color="#4ade80" /> : <WifiOff size={16} color="#f87171" />}
            </div>

            {/* Danh sách phòng đã tạo */}
            {savedScenes.length > 0 && (
              <div className="gsv-saved-scenes">
                <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FolderOpen size={16} style={{ color: '#22d3ee' }} />
                  Hoặc chọn không gian 3D đã tái tạo trước đó:
                </label>
                <div className="gsv-saved-list">
                  {savedScenes.map((scene) => (
                    <button
                      key={scene.filename}
                      type="button"
                      onClick={() => {
                        setActivePlyUrl(scene.url);
                        setShowUploadModal(false);
                      }}
                      className={`gsv-saved-item ${activePlyUrl === scene.url ? 'active' : ''}`}
                    >
                      <CheckCircle2 size={14} />
                      {scene.filename.replace('.ply', '')} ({scene.sizeMB} MB)
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleUploadAndReconstruct}>
              <div className="gsv-form-group">
                <label className="gsv-label">Tên Không Gian / Căn Phòng</label>
                <input
                  type="text"
                  value={customRoomName}
                  onChange={(e) => setCustomRoomName(e.target.value)}
                  className="gsv-input"
                  placeholder="Ví dụ: Phòng Khách Cổ Điển"
                  required
                />
              </div>

              <div className="gsv-form-group">
                <label className="gsv-label">
                  Chọn 15–30 bức ảnh chụp quanh phòng (Sparse-view)
                </label>
                <div className="gsv-dropzone">
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
                    id="splat-file-input"
                  />
                  <label htmlFor="splat-file-input" style={{ cursor: 'pointer', display: 'block' }}>
                    <Upload className="gsv-dropzone-icon" />
                    <p className="gsv-dropzone-text">Bấm vào đây để chọn toàn bộ ảnh căn phòng</p>
                    <p className="gsv-dropzone-sub">
                      (Định dạng JPG, PNG - Khuyến nghị 15–30 ảnh xoay các góc)
                    </p>
                  </label>
                </div>
                {selectedFiles.length > 0 && (
                  <p style={{ fontSize: 12, color: '#22d3ee', marginTop: 8, fontWeight: 600 }}>
                    ✓ Đã chọn {selectedFiles.length} bức ảnh
                  </p>
                )}
              </div>

              {isReconstructing ? (
                <div style={{ padding: 16, borderRadius: 14, background: 'rgba(8, 145, 178, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', textAlign: 'center' }}>
                  <RefreshCw size={24} style={{ color: '#22d3ee', margin: '0 auto 8px', animation: 'spin 1s linear infinite' }} />
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#67e8f9', margin: '0 0 4px 0' }}>{reconstructProgress}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>Quá trình chạy trên GPU T4 của Colab Worker</p>
                </div>
              ) : (
                <div className="gsv-modal-actions">
                  {activePlyUrl && (
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="gsv-btn-cancel"
                    >
                      Đóng
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={selectedFiles.length < 3 || isReconstructing}
                    className="gsv-btn-submit"
                  >
                    Bắt Đầu Tái Tạo 3DGS ({selectedFiles.length} ảnh)
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

export default GaussianSplatRoomViewer;
