import React, { useState } from 'react';
import {
  Upload,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  Globe,
  ArrowRight,
  Info,
  Camera
} from 'lucide-react';
import { Pannellum360Viewer } from '../viewer360/Pannellum360Viewer';
import { LiveCameraSweepCapture } from '../components/LiveCameraSweepCapture';
import { API_BASE } from '../services/api';

interface StitchResult {
  panoramaUrl: string;
  filename: string;
  width: number;
  height: number;
  aspectRatio: string;
  message: string;
}

export const PocStitchingPage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stitchResult, setStitchResult] = useState<StitchResult | null>(null);
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);

  // Hàm sắp xếp tự nhiên theo tên file (img1, img2, ..., img10)
  const naturalSortFiles = (fileList: File[]): File[] => {
    return [...fileList].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
  };

  // Handle frames captured from live phone camera
  const handleCameraFramesCaptured = (files: File[]) => {
    setSelectedFiles(files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    setErrorMsg(null);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Tự động sắp xếp theo thứ tự số tự nhiên trong tên file (đặc biệt khi chụp từ điện thoại)
    const sorted = naturalSortFiles(files);

    setSelectedFiles((prev) => {
      const merged = [...prev, ...sorted];
      return naturalSortFiles(merged);
    });

    const urls = sorted.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...urls]);
    setErrorMsg(null);
  };

  // Remove one file from list
  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all
  const handleClearAll = () => {
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setSelectedFiles([]);
    setPreviewUrls([]);
    setErrorMsg(null);
  };

  // Execute Stitching API
  const handleExecuteStitch = async () => {
    if (selectedFiles.length < 1) {
      setErrorMsg('Vui lòng chọn ít nhất 1 ảnh (ảnh PANO toàn cảnh điện thoại) hoặc chùm ảnh rời (8-16 tấm).');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setCurrentStep(1);

    const formData = new FormData();
    selectedFiles.forEach((file, index) => {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const orderedName = `${String(index).padStart(4, '0')}_${cleanName}`;
      formData.append('images', file, orderedName);
    });

    try {
      // Giả lập cập nhật trạng thái bước thực tế của pipeline
      const stepTimer1 = setTimeout(() => setCurrentStep(2), 1500);
      const stepTimer2 = setTimeout(() => setCurrentStep(3), 3500);
      const stepTimer3 = setTimeout(() => setCurrentStep(4), 6000);

      const res = await fetch(`${API_BASE}/stitch`, {
        method: 'POST',
        body: formData
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      let json: any = null;
      try {
        json = await res.json();
      } catch (_) {
        throw new Error(`Máy chủ phản hồi mã lỗi HTTP ${res.status}`);
      }

      if (!res.ok || !json?.success) {
        throw new Error(json?.message || json?.detail || 'Quá trình ghép ảnh thất bại.');
      }

      setCurrentStep(5);
      setStitchResult(json.data);
    } catch (err: any) {
      console.error('[Stitch Error]:', err);
      setErrorMsg(err.message || 'Lỗi kết nối máy chủ hoặc thuật toán ghép ảnh.');
      setCurrentStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  // Load a demo result for testing immediately if user doesn't have photos handy
  const handleLoadDemoPano = () => {
    setStitchResult({
      panoramaUrl: 'https://pannellum.org/images/bma-0.jpg',
      filename: 'Bảo tàng Nghệ thuật & Di sản Lịch sử (BMA-360).jpg',
      width: 4096,
      height: 2048,
      aspectRatio: '2:1',
      message: 'Đã nạp thành công ảnh toàn cảnh 360° chuẩn quốc tế.'
    });
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', background: '#F8FAFC' }}>
      {/* LEFT PANEL: ADMIN UPLOADER */}
      <div
        style={{
          width: '460px',
          background: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}
      >
        <div style={{ padding: '20px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8B261D' }}>
            <Camera size={20} />
            <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase' }}>
              Admin: Chùm Ảnh Chụp Điện Thoại
            </h2>
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: 4 }}>
            Đứng tại tâm phòng, chụp xoay 360° (8–12 tấm ảnh có độ chồng lấp 30-40%).
          </p>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
          {/* Nút bấm trực tiếp Mở Camera Điện Thoại Quay Quét 360 */}
          <button
            type="button"
            onClick={() => setIsLiveCameraOpen(true)}
            disabled={isProcessing}
            style={{
              background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #3B82F6 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '13.5px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <Camera size={20} />
            <span>Mở Camera Điện Thoại Quay Quét 360° Trực Tiếp</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>HOẶC TẢI ẢNH TỪ MÁY</span>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
          </div>

          {/* Dropzone Upload */}
          <label
            style={{
              border: '2px dashed #CBD5E1',
              borderRadius: '8px',
              padding: '24px 16px',
              textAlign: 'center',
              cursor: isProcessing ? 'wait' : 'pointer',
              background: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              transition: 'border-color 0.2s'
            }}
          >
            <Upload size={28} style={{ color: '#8B261D' }} />
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1E293B' }}>
              Chọn 1 ảnh PANO hoặc chùm ảnh (8–16 tấm)
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748B', textAlign: 'center' }}>
              Hỗ trợ ảnh PANO toàn cảnh 360° hoặc chùm ảnh JPG, PNG, HEIC từ iPhone/Android
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={isProcessing}
            />
          </label>

          {/* Files Selected Info */}
          {selectedFiles.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8
                }}
              >
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1E293B' }}>
                  Đã chọn {selectedFiles.length} tấm ảnh
                </span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EF4444',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  disabled={isProcessing}
                >
                  Xóa tất cả
                </button>
              </div>

              {/* Grid Preview Thumbnails */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 8,
                  maxHeight: '180px',
                  overflowY: 'auto',
                  padding: '4px'
                }}
              >
                {previewUrls.map((url, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      height: '70px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <img
                      src={url}
                      alt={`Ảnh ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: 2,
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        fontSize: '9px',
                        padding: '1px 4px',
                        borderRadius: '2px'
                      }}
                    >
                      #{idx + 1}
                    </span>
                    {!isProcessing && (
                      <button
                        onClick={() => handleRemoveFile(idx)}
                        style={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          background: 'rgba(239, 68, 68, 0.9)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '16px',
                          height: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            className="btn btn-primary"
            onClick={handleExecuteStitch}
            disabled={isProcessing || selectedFiles.length < 2}
            style={{
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 600,
              justifyContent: 'center'
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>Đang xử lý thuật toán OpenCV...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Upload & Tự Động Ghép 360°</span>
              </>
            )}
          </button>

          {/* Progress Pipeline Indicator */}
          {isProcessing && (
            <div
              style={{
                background: '#F1F5F9',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>
                TIẾN TRÌNH THỊ GIÁC MÁY TÍNH (OPENCV PIPELINE):
              </div>
              <div style={{ fontSize: '11.5px', color: currentStep >= 1 ? '#059669' : '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={13} style={{ opacity: currentStep >= 1 ? 1 : 0.3 }} />
                <span>Bước 1: Tải chùm ảnh & Tối ưu kích thước đầu vào</span>
              </div>
              <div style={{ fontSize: '11.5px', color: currentStep >= 2 ? '#059669' : '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={13} style={{ opacity: currentStep >= 2 ? 1 : 0.3 }} />
                <span>Bước 2: Dò tìm điểm đặc trưng (Features Matching) & Homography</span>
              </div>
              <div style={{ fontSize: '11.5px', color: currentStep >= 3 ? '#059669' : '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={13} style={{ opacity: currentStep >= 3 ? 1 : 0.3 }} />
                <span>Bước 3: Uốn cong hình cầu (Spherical Warp) & Multi-band Blending</span>
              </div>
              <div style={{ fontSize: '11.5px', color: currentStep >= 4 ? '#059669' : '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={13} style={{ opacity: currentStep >= 4 ? 1 : 0.3 }} />
                <span>Bước 4: Cắt viền đen & Chuẩn hóa tỷ lệ Equirectangular 2:1</span>
              </div>
            </div>
          )}

          {/* Error Message with Advice */}
          {errorMsg && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                padding: '12px',
                borderRadius: '6px',
                color: '#991B1B',
                fontSize: '12.5px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 4 }}>
                <AlertTriangle size={15} />
                <span>Lỗi Ghép Ảnh</span>
              </div>
              <div>{errorMsg}</div>
              <div style={{ marginTop: 8, fontSize: '11.5px', color: '#7F1D1D', lineHeight: 1.4 }}>
                💡 <strong>Mẹo chụp bằng điện thoại:</strong> Đứng cố định tại 1 điểm giữa phòng, xoay máy từ từ theo chiều kim đồng hồ, giữ máy thẳng đứng và đảm bảo mỗi góc chụp có khoảng 30-40% cảnh chung với góc chụp trước đó.
              </div>
            </div>
          )}

          {/* Success Banner */}
          {stitchResult && !isProcessing && (
            <div
              style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                padding: '12px',
                borderRadius: '6px',
                color: '#065F46',
                fontSize: '12.5px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                <CheckCircle2 size={16} />
                <span>Ghép thành công ảnh 360°!</span>
              </div>
              <div style={{ marginTop: 4, fontSize: '11.5px' }}>
                Độ phân giải: <strong>{stitchResult.width} x {stitchResult.height}</strong> (Tỷ lệ {stitchResult.aspectRatio})
              </div>
            </div>
          )}

          {/* Test Demo Button */}
          <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #E2E8F0' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleLoadDemoPano}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Globe size={14} />
              <span>Xem thử mẫu 360° & Hiệu ứng Little Planet</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: CLIENT 360 INTERACTIVE VIEWER */}
      <div style={{ flex: 1, position: 'relative', background: '#000000' }}>
        {stitchResult ? (
          <Pannellum360Viewer
            panoramaUrl={stitchResult.panoramaUrl}
            title={`Kết quả: ${stitchResult.filename}`}
            autoStartLittlePlanet={true}
          />
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              gap: 16,
              padding: 40,
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B'
              }}
            >
              <Globe size={40} />
            </div>
            <div style={{ maxWidth: 440 }}>
              <h3 style={{ fontSize: '17px', color: '#FFFFFF', fontWeight: 600, marginBottom: 8 }}>
                Màn Hình Trải Nghiệm Client 360° (Little Planet)
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.5 }}>
                Chọn chùm ảnh từ điện thoại ở cột bên trái và bấm <strong>"Upload & Tự Động Ghép 360°"</strong>. Kết quả ảnh toàn cảnh Equirectangular 2:1 sẽ tự động xuất hiện tại đây với hiệu ứng chuyển cảnh Little Planet tương tự như vr.iuh.edu.vn!
              </p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleLoadDemoPano}
              style={{ marginTop: 8 }}
            >
              <span>Xem thử ngay ảnh mẫu</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Live Camera Sweep 360 Modal */}
      <LiveCameraSweepCapture
        isOpen={isLiveCameraOpen}
        onClose={() => setIsLiveCameraOpen(false)}
        onFramesCaptured={handleCameraFramesCaptured}
      />
    </div>
  );
};
