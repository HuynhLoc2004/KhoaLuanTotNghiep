import React, { useState, useRef } from 'react';
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
  Camera,
  ExternalLink,
  Download,
  Cloud,
  Eye
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

  const viewerSectionRef = useRef<HTMLDivElement>(null);

  // Sắp xếp tự nhiên theo tên file (img1, img2, ..., img10)
  const naturalSortFiles = (fileList: File[]): File[] => {
    return [...fileList].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
  };

  // Nhận chùm ảnh từ Camera quét không gian điện thoại
  const handleCameraFramesCaptured = (files: File[]) => {
    setSelectedFiles(files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    setErrorMsg(null);
  };

  // Chọn ảnh từ máy tính / thư viện ảnh điện thoại
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const sorted = naturalSortFiles(files);

    setSelectedFiles((prev) => {
      const merged = [...prev, ...sorted];
      return naturalSortFiles(merged);
    });

    const urls = sorted.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...urls]);
    setErrorMsg(null);
  };

  // Xóa 1 ảnh khỏi danh sách
  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Xóa toàn bộ ảnh
  const handleClearAll = () => {
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setSelectedFiles([]);
    setPreviewUrls([]);
    setErrorMsg(null);
  };

  // Thực thi ghép ảnh qua API OpenCV Backend
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

      // Tự động cuộn xuống phần kết quả 360° bên dưới để người dùng trải nghiệm ngay
      setTimeout(() => {
        viewerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 350);
    } catch (err: any) {
      console.error('[Stitch Error]:', err);
      setErrorMsg(err.message || 'Lỗi kết nối máy chủ hoặc thuật toán ghép ảnh.');
      setCurrentStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  // Nạp ảnh mẫu 360° kiểm thử nhanh
  const handleLoadDemoPano = () => {
    setStitchResult({
      panoramaUrl: 'https://pannellum.org/images/bma-0.jpg',
      filename: 'Bảo tàng Nghệ thuật & Di sản Lịch sử (BMA-360).jpg',
      width: 4096,
      height: 2048,
      aspectRatio: '2:1',
      message: 'Đã nạp thành công ảnh toàn cảnh 360° chuẩn quốc tế.'
    });
    setTimeout(() => {
      viewerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        background: '#F8FAFC',
        padding: '16px 12px 40px',
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          maxWidth: '1160px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        {/* CARD 1: BẢNG ĐIỀU KHIỂN & TẢI CHÙM ẢNH (NẰM TRÊN) */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '18px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8B261D' }}>
                <Camera size={20} />
                <h2 style={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>
                  Gian Trưng Bày & Quét Tour 360° (OpenCV 4K Pipeline)
                </h2>
              </div>
              <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: 4, margin: '4px 0 0' }}>
                Chụp quét toàn diện không gian phòng (độ chồng lấp 30–40%) hoặc tải ảnh Pano từ điện thoại.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#059669',
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 11.5,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <Cloud size={13} />
                <span>Cloudflare R2 & Cloudinary CDN</span>
              </span>
            </div>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* BẢNG HƯỚNG DẪN 2 CÁCH TẠO TOUR 360° ĐẸP NHẤT & KHÔNG BỊ CHÓNG MẶT */}
            <div
              style={{
                background: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)',
                border: '1px solid #FCD34D',
                borderRadius: '10px',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#92400E', fontWeight: 700, fontSize: '13.5px' }}>
                <span>💡 BÍ QUYẾT TẠO ẢNH 360° ĐẸP NHẤT, THẲNG TẮP & KHÔNG BỊ CHÓNG MẶT:</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, fontSize: '12.5px', color: '#78350F' }}>
                <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: 8, border: '1px solid #FDE68A' }}>
                  <strong style={{ color: '#B45309', display: 'block', marginBottom: 4 }}>
                    ⭐ CÁCH 1 (Khuyên Dùng - Đẹp & Nét 100%):
                  </strong>
                  Mở ứng dụng Camera mặc định trên iPhone / Android, chọn chế độ <strong>"Toàn cảnh (PANO)"</strong>. Xoay 1 vòng quanh phòng rồi bấm <strong>"Chọn 1 ảnh PANO"</strong> bên dưới. Con quay hồi chuyển phần cứng của điện thoại sẽ giữ tường thẳng tắp, không lượn sóng!
                </div>
                <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: 8, border: '1px solid #FDE68A' }}>
                  <strong style={{ color: '#2563EB', display: 'block', marginBottom: 4 }}>
                    📹 CÁCH 2: Quét trực tiếp bằng Web Camera:
                  </strong>
                  Bấm nút xanh bên dưới. Đứng yên tại giữa phòng, <strong>giữ điện thoại thẳng đứng ngang tầm mắt (không ngửa lên trần hay cắm xuống đất)</strong> và xoay tròn chầm chậm 1 vòng (chụp 12 tấm).
                </div>
              </div>
            </div>

            {/* Nút bấm trực tiếp Mở Camera Điện Thoại Quay Quét 360 */}
            <button
              type="button"
              onClick={() => setIsLiveCameraOpen(true)}
              disabled={isProcessing}
              style={{
                background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #3B82F6 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                fontSize: '14px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
            >
              <Camera size={20} />
              <span>Mở Camera Quét 360° (Cân Bằng Thước Thủy Tầm Mắt)</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
              <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>HOẶC CHỌN ẢNH TỪ MÁY / THƯ VIỆN</span>
              <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            </div>

            {/* Dropzone Upload */}
            <label
              style={{
                border: '2px dashed #CBD5E1',
                borderRadius: '10px',
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
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>
                Chọn 1 ảnh PANO hoặc chùm ảnh (8–24 tấm)
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', textAlign: 'center' }}>
                Hỗ trợ ảnh PANO toàn cảnh 360° hoặc chùm ảnh JPG, PNG, HEIC từ iPhone / Android
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

            {/* Danh sách ảnh đã chọn */}
            {selectedFiles.length > 0 && (
              <div style={{ background: '#F8FAFC', borderRadius: 8, padding: 14, border: '1px solid #E2E8F0' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                    Đã nạp {selectedFiles.length} tấm ảnh ({naturalSortFiles(selectedFiles).length} khung hình)
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EF4444',
                      fontSize: '12px',
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
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: 8,
                    maxHeight: '220px',
                    overflowY: 'auto',
                    padding: '4px'
                  }}
                >
                  {previewUrls.map((url, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        height: '75px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        border: '1.5px solid #CBD5E1'
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
                          background: 'rgba(0,0,0,0.75)',
                          color: '#fff',
                          fontSize: '9px',
                          padding: '1px 4px',
                          borderRadius: '3px'
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
                            width: '18px',
                            height: '18px',
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

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={handleExecuteStitch}
                disabled={isProcessing || selectedFiles.length < 1}
                style={{
                  flex: 1,
                  minWidth: '240px',
                  padding: '14px 24px',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  justifyContent: 'center',
                  background: isProcessing ? '#64748B' : 'linear-gradient(135deg, #8B261D, #B91C1C)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 14px rgba(139, 38, 29, 0.35)',
                  cursor: isProcessing || selectedFiles.length < 1 ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    <span>Đang xử lý thuật toán OpenCV (15-20s)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Upload & Tự Động Ghép 360° ({selectedFiles.length} ảnh)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleLoadDemoPano}
                style={{
                  padding: '14px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Globe size={16} />
                <span>Xem ảnh mẫu 360°</span>
              </button>
            </div>

            {/* Tiến trình Pipeline OpenCV */}
            {isProcessing && (
              <div
                style={{
                  background: '#F1F5F9',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E293B', marginBottom: 2 }}>
                  TIẾN TRÌNH THỊ GIÁC MÁY TÍNH (OPENCV 4K PIPELINE):
                </div>
                <div style={{ fontSize: '12px', color: currentStep >= 1 ? '#059669' : '#64748B', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={14} style={{ opacity: currentStep >= 1 ? 1 : 0.3 }} />
                  <span>Bước 1: Nạp chùm ảnh & Tối ưu kích thước đầu vào (Chống tràn RAM)</span>
                </div>
                <div style={{ fontSize: '12px', color: currentStep >= 2 ? '#059669' : '#64748B', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={14} style={{ opacity: currentStep >= 2 ? 1 : 0.3 }} />
                  <span>Bước 2: Dò tìm điểm đặc trưng & Tự động thử lại Fallback Confidence (0.30 ➔ 0.18)</span>
                </div>
                <div style={{ fontSize: '12px', color: currentStep >= 3 ? '#059669' : '#64748B', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={14} style={{ opacity: currentStep >= 3 ? 1 : 0.3 }} />
                  <span>Bước 3: Uốn cong hình cầu (Spherical Warp) & Multi-band Blending đa tầng</span>
                </div>
                <div style={{ fontSize: '12px', color: currentStep >= 4 ? '#059669' : '#64748B', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={14} style={{ opacity: currentStep >= 4 ? 1 : 0.3 }} />
                  <span>Bước 4: Nắn chuẩn Equirectangular 2:1 (4096x2048) & Bộ lọc Unsharp Masking siêu nét</span>
                </div>
              </div>
            )}

            {/* Error Message with Advice */}
            {errorMsg && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  padding: '14px',
                  borderRadius: '8px',
                  color: '#991B1B',
                  fontSize: '13px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 4 }}>
                  <AlertTriangle size={16} />
                  <span>Lỗi Ghép Ảnh</span>
                </div>
                <div>{errorMsg}</div>
                <div style={{ marginTop: 8, fontSize: '12px', color: '#7F1D1D', lineHeight: 1.5 }}>
                  💡 <strong>Mẹo chụp:</strong> Đứng tại một vị trí giữa phòng, lia máy chậm rãi theo chiều kim đồng hồ, đảm bảo mỗi bức ảnh kề nhau có ít nhất 30% cảnh chung để thuật toán tìm điểm nối.
                </div>
              </div>
            )}

            {/* Cloud Storage Information */}
            <div
              style={{
                fontSize: '12px',
                color: '#64748B',
                background: '#F8FAFC',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Info size={15} style={{ flexShrink: 0, color: '#2563EB' }} />
              <span>
                Ảnh sau khi ghép được tự động làm sắc nét bằng <strong>Unsharp Masking (USM)</strong> và lưu trữ trực tiếp trên <strong>Cloudflare R2 & Cloudinary CDN</strong> để phục vụ trải nghiệm người xem tốc độ cao.
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: MÀN HÌNH TRẢI NGHIỆM CLIENT 360° (NẰM Ở DƯỚI - RESPONSIVE 100%) */}
        <div
          ref={viewerSectionRef}
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Card 2 Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              background: '#0F172A',
              color: '#FFFFFF'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #8B261D, #DC2626)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Globe size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
                  Màn Hình Trải Nghiệm Không Gian 360° (Little Planet & VR Tour)
                </h3>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '2px 0 0' }}>
                  Kéo chuột hoặc vuốt tay trên màn hình điện thoại để xoay 360° tự do
                </p>
              </div>
            </div>

            {stitchResult && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34D399',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: 11.5,
                    fontWeight: 700
                  }}
                >
                  ✓ 4K ({stitchResult.width} x {stitchResult.height})
                </span>

                <a
                  href={stitchResult.panoramaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: '12px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: 600
                  }}
                >
                  <ExternalLink size={13} />
                  <span>Mở Link Gốc CDN</span>
                </a>
              </div>
            )}
          </div>

          {/* 360 Viewer Viewport */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '580px',
              background: '#000000'
            }}
          >
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
                  padding: 30,
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748B',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <Globe size={36} />
                </div>
                <div style={{ maxWidth: 460 }}>
                  <h4 style={{ fontSize: '16px', color: '#FFFFFF', fontWeight: 600, marginBottom: 8 }}>
                    Chưa có ảnh toàn cảnh 360°
                  </h4>
                  <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#94A3B8' }}>
                    Hãy mở camera điện thoại hoặc tải chùm ảnh ở phần trên, sau đó bấm <strong>"Upload & Tự Động Ghép 360°"</strong>. Kết quả không gian thực tế ảo sẽ hiển thị trực tiếp tại đây với hiệu ứng chuyển cảnh Little Planet!
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleLoadDemoPano}
                  style={{
                    marginTop: 4,
                    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: 20,
                    fontWeight: 600,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Eye size={14} />
                  <span>Xem thử ảnh mẫu 360° ngay</span>
                </button>
              </div>
            )}
          </div>

          {/* Success Banner Info under Viewer */}
          {stitchResult && (
            <div
              style={{
                padding: '14px 20px',
                background: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '12.5px', color: '#0F172A' }}>
                <CheckCircle2 size={16} style={{ color: '#10B981' }} />
                <span>
                  Đã lưu trữ vĩnh viễn: <strong style={{ color: '#2563EB', wordBreak: 'break-all' }}>{stitchResult.panoramaUrl}</strong>
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Chuẩn hóa Equirectangular 2:1 • 4K WebGL
              </div>
            </div>
          )}
        </div>
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
