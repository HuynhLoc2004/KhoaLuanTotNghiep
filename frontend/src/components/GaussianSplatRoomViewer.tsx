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
  FolderOpen
} from 'lucide-react';

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

export const GaussianSplatRoomViewer: React.FC<GaussianSplatRoomViewerProps> = ({
  initialPlyUrl,
  roomName = 'Không Gian 3D Gaussian Splatting',
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  const [activePlyUrl, setActivePlyUrl] = useState<string>(initialPlyUrl || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadPercent, setLoadPercent] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Khởi tạo không gian...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(true);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(!initialPlyUrl);
  const [savedScenes, setSavedScenes] = useState<SavedScene[]>([]);

  // State upload ảnh
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [customRoomName, setCustomRoomName] = useState<string>(roomName || 'Phòng Trưng Bày');
  const [isReconstructing, setIsReconstructing] = useState<boolean>(false);
  const [reconstructProgress, setReconstructProgress] = useState<string>('');

  // Fetch danh sách các scene đã lưu
  const fetchScenes = async () => {
    try {
      const res = await fetch('/api/splat/list');
      if (res.ok) {
        const data = await res.json();
        setSavedScenes(data.scenes || []);
        if (!activePlyUrl && data.scenes?.length > 0) {
          setActivePlyUrl(data.scenes[0].url);
        }
      }
    } catch (e) {
      console.warn('Lỗi lấy danh sách splat scenes:', e);
    }
  };

  useEffect(() => {
    fetchScenes();
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

  // Xử lý gửi 20-30 ảnh sang backend để Colab dựng phòng
  const handleUploadAndReconstruct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length < 3) {
      alert('Vui lòng chọn tối thiểu 3 ảnh chụp quanh phòng (khuyến nghị 20-30 ảnh)');
      return;
    }

    setIsReconstructing(true);
    setReconstructProgress('Đang đóng gói và gửi ảnh sang Colab GPU Worker...');

    try {
      const formData = new FormData();
      formData.append('roomName', customRoomName);
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      setReconstructProgress('AI DUSt3R + InstantSplat đang phân tích ma trận camera và huấn luyện 3DGS (Khoảng 2 - 4 phút)...');

      const response = await fetch('/api/splat/reconstruct', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${response.status}: Lỗi máy chủ`);
      }

      const data = await response.json();
      setReconstructProgress('Tái tạo thành công! Đang mở không gian 3D...');

      // Cập nhật lại danh sách và nạp cảnh vừa tạo
      await fetchScenes();
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
    <div className="relative w-full h-full min-h-[600px] bg-slate-950 overflow-hidden select-none font-sans">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Bar Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-2xl pointer-events-auto">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              {roomName}
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                3D Gaussian Splatting
              </span>
            </h1>
            <p className="text-xs text-slate-400">Không gian thực thể số hóa (Sparse-view 3DGS)</p>
          </div>
        </div>

        {/* Nút điều khiển nhanh bên phải */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-lg shadow-cyan-600/30 transition border border-cyan-400/30"
            title="Tái tạo phòng mới từ ảnh"
          >
            <Camera className="w-4 h-4" />
            <span>Tạo Phòng Mới</span>
          </button>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10 backdrop-blur-md transition shadow-lg"
            title="Hướng dẫn di chuyển"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10 backdrop-blur-md transition shadow-lg"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-red-950/80 hover:bg-red-900/80 text-red-200 border border-red-500/20 backdrop-blur-md transition shadow-lg"
              title="Đóng viewer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Loading Progress Bar */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-md z-30">
          <div className="max-w-md w-full mx-6 p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 animate-pulse">
              <Layers className="w-6 h-6 animate-spin" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">{statusText}</h3>
            <p className="text-xs text-slate-400 mb-5">
              Đang kết xuất hàng triệu hạt Gaussian đa hướng với độ chi tiết cao
            </p>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-200 rounded-full"
                style={{ width: `${loadPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-lg bg-red-950/90 border border-red-500/30 px-5 py-3.5 rounded-2xl text-red-200 text-xs flex items-center gap-3 backdrop-blur-md shadow-2xl">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
          <button
            onClick={() => setActivePlyUrl(activePlyUrl)}
            className="ml-auto px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded-lg text-xs"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Floating Navigation Controls Guide */}
      {showHelp && (
        <div className="absolute bottom-6 left-6 z-20 bg-slate-900/85 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl text-slate-200 max-w-xs transition-all">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> Điều Khiển Khám Phá
            </span>
            <button
              onClick={() => setShowHelp(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-300">
            <div className="flex items-center justify-between">
              <span>Xoay góc nhìn:</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-white/10">Giữ Chuột Trái</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Trượt vị trí (Pan):</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-white/10">Giữ Chuột Phải</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Bước đi quanh phòng:</span>
              <div className="flex gap-1">
                {['W', 'A', 'S', 'D'].map((k) => (
                  <kbd key={k} className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-white/10 font-bold">{k}</kbd>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Nâng / Hạ độ cao:</span>
              <div className="flex gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-white/10">E</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-white/10">Q</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tải 20-30 ảnh & Tái Tạo 3DGS */}
      {showUploadModal && (
        <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold">Khởi Tạo Không Gian 3DGS Mới</h2>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Danh sách phòng đã tạo */}
            {savedScenes.length > 0 && (
              <div className="mb-5 p-3.5 rounded-2xl bg-slate-800/60 border border-white/5">
                <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-cyan-400" />
                  Hoặc chọn không gian 3D đã tái tạo trước đó:
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {savedScenes.map((scene) => (
                    <button
                      key={scene.filename}
                      onClick={() => {
                        setActivePlyUrl(scene.url);
                        setShowUploadModal(false);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
                        activePlyUrl === scene.url
                          ? 'bg-cyan-500 text-white border-cyan-400'
                          : 'bg-slate-700/60 text-slate-300 border-white/10 hover:bg-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {scene.filename.replace('.ply', '')} ({scene.sizeMB} MB)
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleUploadAndReconstruct} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Tên Không Gian / Căn Phòng</label>
                <input
                  type="text"
                  value={customRoomName}
                  onChange={(e) => setCustomRoomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                  placeholder="Ví dụ: Phòng Khách Cổ Điển"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Chọn 20–30 bức ảnh chụp quanh phòng (Sparse-view)
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-6 text-center cursor-pointer bg-slate-800/30 transition">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        setSelectedFiles(Array.from(e.target.files));
                      }
                    }}
                    className="hidden"
                    id="splat-file-input"
                  />
                  <label htmlFor="splat-file-input" className="cursor-pointer block">
                    <Upload className="w-8 h-8 mx-auto text-cyan-400 mb-2" />
                    <p className="text-xs text-white font-medium">Bấm vào đây để chọn toàn bộ ảnh căn phòng</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      (Định dạng JPG, PNG - Khuyến nghị 20–30 ảnh có độ phủ 60%)
                    </p>
                  </label>
                </div>
                {selectedFiles.length > 0 && (
                  <p className="text-xs text-cyan-400 mt-2 font-medium">
                    ✓ Đã chọn {selectedFiles.length} bức ảnh
                  </p>
                )}
              </div>

              {isReconstructing ? (
                <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-center">
                  <RefreshCw className="w-6 h-6 mx-auto text-cyan-400 animate-spin mb-2" />
                  <p className="text-xs font-semibold text-cyan-300">{reconstructProgress}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Quá trình này chạy trên GPU T4 của Colab Worker</p>
                </div>
              ) : (
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={selectedFiles.length < 3}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition"
                  >
                    Bắt Đầu Tái Tạo 3DGS
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
