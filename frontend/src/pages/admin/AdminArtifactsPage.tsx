import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Sparkles,
  QrCode,
  Edit2,
  Trash2,
  RotateCw,
  Volume2,
  Box,
  Layers,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { api, API_ROOT } from '../../services/api';
import { Artifact } from '../../types';
import { Turntable360Viewer } from '../../components/Turntable360Viewer';

export const AdminArtifactsPage: React.FC = () => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingArtifact, setEditingArtifact] = useState<Partial<Artifact> | null>(null);
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
  const [activeViewerArtifact, setActiveViewerArtifact] = useState<Artifact | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [activeQRArtifact, setActiveQRArtifact] = useState<Artifact | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generatingArtifact, setGeneratingArtifact] = useState<Artifact | null>(null);
  const [depthScale, setDepthScale] = useState(0.35);
  const [meshResolution, setMeshResolution] = useState(160);
  const [isProcessing3D, setIsProcessing3D] = useState(false);

  // Polling ref cho các job 3D đang chạy
  const pollingTimerRef = useRef<any>(null);

  const fetchArtifacts = async () => {
    try {
      setLoading(true);
      const data = await api.getArtifacts({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery.trim() || undefined
      });
      setArtifacts(data);
    } catch (err: any) {
      console.error('Lỗi tải hiện vật:', err);
      showNotification('error', err.message || 'Không thể tải danh sách hiện vật');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtifacts();
  }, [selectedCategory]);

  // Polling kiểm tra trạng thái các tác vụ dựng 3D
  useEffect(() => {
    const processingItems = artifacts.filter((a) => a.processingStatus === 'processing');
    if (processingItems.length === 0) {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      return;
    }

    pollingTimerRef.current = setInterval(async () => {
      let hasChange = false;
      for (const item of processingItems) {
        try {
          const statusRes = await api.getArtifact3DStatus(item.id);
          if (statusRes.processingStatus !== 'processing') {
            hasChange = true;
            if (statusRes.processingStatus === 'completed') {
              showNotification('success', `Đã hoàn tất tái tạo 3D cho hiện vật: ${item.name}!`);
            } else {
              showNotification('error', `Tái tạo 3D thất bại cho hiện vật ${item.name}: ${statusRes.processingError || ''}`);
            }
          }
        } catch (e) {
          console.warn('Lỗi kiểm tra trạng thái 3D:', e);
        }
      }
      if (hasChange) {
        fetchArtifacts();
      }
    }, 2500);

    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [artifacts]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArtifacts();
  };

  const handleCreateNew = () => {
    setEditingArtifact({
      code: `HV_${Date.now().toString().slice(-4)}`,
      name: '',
      category: 'Cổ vật di sản',
      period: 'Thời Lý - Trần',
      origin: 'Bảo tàng Lịch sử TP.HCM',
      description: '',
      dimensions: '',
      images: [],
      thumbnailUrl: '',
      model3dUrl: '',
      audioNarrationUrl: '',
      voiceLanguage: 'vi',
      status: 'active'
    });
    setIsEditModalOpen(true);
  };

  const handleEdit = (artifact: Artifact) => {
    setEditingArtifact({ ...artifact });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hiện vật "${name}" khỏi hệ thống?`)) return;
    try {
      await api.deleteArtifact(id);
      showNotification('success', `Đã xóa hiện vật "${name}" thành công`);
      fetchArtifacts();
    } catch (err: any) {
      showNotification('error', err.message || 'Lỗi khi xóa hiện vật');
    }
  };

  const handleSaveArtifact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtifact || !editingArtifact.name || !editingArtifact.code) {
      showNotification('error', 'Vui lòng điền Tên và Mã hiện vật');
      return;
    }

    try {
      if (editingArtifact.id) {
        await api.updateArtifact(editingArtifact.id, editingArtifact);
        showNotification('success', 'Đã cập nhật hiện vật thành công!');
      } else {
        await api.createArtifact(editingArtifact);
        showNotification('success', 'Đã tạo hiện vật mới thành công!');
      }
      setIsEditModalOpen(false);
      fetchArtifacts();
    } catch (err: any) {
      showNotification('error', err.message || 'Lỗi lưu thông tin hiện vật');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await api.uploadArtifactImage(file);
      const url = res.url;
      setEditingArtifact((prev) => {
        if (!prev) return prev;
        const newImages = prev.images ? [...prev.images, url] : [url];
        return {
          ...prev,
          images: newImages,
          thumbnailUrl: prev.thumbnailUrl || url
        };
      });
      showNotification('success', 'Đã tải ảnh lên thành công');
    } catch (err: any) {
      showNotification('error', err.message || 'Lỗi tải ảnh hiện vật');
    }
  };

  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await api.uploadArtifactModel(file);
      setEditingArtifact((prev) => (prev ? { ...prev, model3dUrl: res.url } : prev));
      showNotification('success', 'Đã tải file mô hình 3D .GLB thành công');
    } catch (err: any) {
      showNotification('error', err.message || 'Lỗi tải file 3D');
    }
  };

  const handleOpenGenerate3D = (artifact: Artifact) => {
    setGeneratingArtifact(artifact);
    setDepthScale(0.35);
    setMeshResolution(160);
    setIsGenerateModalOpen(true);
  };

  const handleTrigger3DGeneration = async () => {
    if (!generatingArtifact) return;

    try {
      setIsProcessing3D(true);
      const res = await api.generate3DArtifact(generatingArtifact.id, {
        depthScale,
        resolution: meshResolution
      });

      if (res.cached) {
        showNotification('success', 'Mô hình 3D đã được tải ngay lập tức từ bộ nhớ đệm Cache!');
      } else {
        showNotification('success', 'Đã đưa vào hàng đợi xử lý AI. Mô hình sẽ hoàn tất sau vài giây!');
      }

      setIsGenerateModalOpen(false);
      fetchArtifacts();
    } catch (err: any) {
      showNotification('error', err.message || 'Lỗi kích hoạt tiến trình 3D');
    } finally {
      setIsProcessing3D(false);
    }
  };

  const handleOpenViewer = (artifact: Artifact) => {
    setActiveViewerArtifact(artifact);
    setIsViewerModalOpen(true);
  };

  const handleOpenQR = (artifact: Artifact) => {
    setActiveQRArtifact(artifact);
    setIsQRModalOpen(true);
  };

  return (
    <div className="admin-page-container" style={{ padding: '24px 32px' }}>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 20px',
            borderRadius: 10,
            background: notification.type === 'success' ? '#10b981' : '#ef4444',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            fontWeight: 500,
            animation: 'fadeIn 0.3s ease'
          }}
        >
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>
            Hiện Vật & Mô Phỏng 3D Cổ Vật
          </h1>
          <p style={{ margin: '4px 0 0 0', color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.88rem' }}>
            Tái tạo mô hình 3D lồi lõm thực tế từ 1 ảnh chụp tủ kính, trưng bày mâm xoay 360°, thuyết minh AI và xuất mã QR.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreateNew}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 10,
              fontWeight: 600
            }}
          >
            <Plus size={18} />
            <span>Thêm hiện vật mới</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div
        style={{
          display: 'flex',
          gap: 14,
          flexWrap: 'wrap',
          alignItems: 'center',
          background: 'var(--card-bg, #1a1e29)',
          padding: '14px 18px',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: 28
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <Search
            size={17}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo tên hiện vật, mã số, thời kỳ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 38, width: '100%' }}
          />
        </form>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Filter size={16} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
          <select
            className="form-control"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ minWidth: 160 }}
          >
            <option value="all">Tất cả danh mục</option>
            <option value="Cổ vật di sản">Cổ vật di sản</option>
            <option value="Gốm sứ">Gốm sứ</option>
            <option value="Kim loại / Đồ đồng">Kim loại / Đồ đồng</option>
            <option value="Điêu khắc đá / gỗ">Điêu khắc đá / gỗ</option>
            <option value="Trang phục cổ">Trang phục cổ</option>
          </select>
        </div>
      </div>

      {/* Grid Danh sách Hiện vật */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Loader2 size={36} className="animate-spin" style={{ color: 'var(--accent-gold, #d4af37)', margin: '0 auto 12px auto' }} />
          <p style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Đang tải danh sách hiện vật bảo tàng...</p>
        </div>
      ) : artifacts.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            background: 'var(--card-bg, #1a1e29)',
            borderRadius: 16,
            border: '1px dashed rgba(255, 255, 255, 0.15)'
          }}
        >
          <Box size={48} style={{ color: 'rgba(212, 175, 55, 0.4)', margin: '0 auto 16px auto' }} />
          <h3 style={{ color: '#fff', margin: '0 0 8px 0' }}>Chưa có hiện vật nào phù hợp</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.55)', maxWidth: 450, margin: '0 auto 20px auto' }}>
            Hãy bắt đầu bằng cách nhấn nút "Thêm hiện vật mới" để lưu trữ cổ vật và tự động mô phỏng 3D từ ảnh chụp.
          </p>
          <button type="button" className="btn btn-primary" onClick={handleCreateNew}>
            <Plus size={16} style={{ marginRight: 6 }} /> Thêm hiện vật đầu tiên
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24
          }}
        >
          {artifacts.map((art) => {
            const has3D = !!art.model3dUrl;
            const isProcessing = art.processingStatus === 'processing';
            const imgUrl = art.thumbnailUrl || (art.images && art.images.length > 0 ? art.images[0] : null);
            const fullImgUrl = imgUrl
              ? (imgUrl.startsWith('http') ? imgUrl : `${API_ROOT}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`)
              : null;

            return (
              <div
                key={art.id}
                className="artifact-card"
                style={{
                  background: 'var(--card-bg, #1a1e29)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: has3D ? '1px solid rgba(212, 175, 55, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.25s ease',
                  boxShadow: has3D ? '0 10px 30px rgba(0, 0, 0, 0.35)' : 'none'
                }}
              >
                {/* Thumbnail Header */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: 200,
                    background: '#11141c',
                    overflow: 'hidden'
                  }}
                >
                  {fullImgUrl ? (
                    <img
                      src={fullImgUrl}
                      alt={art.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      <ImageIcon size={40} />
                    </div>
                  )}

                  {/* Status Badges */}
                  <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 12,
                        background: 'rgba(0,0,0,0.65)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.15)'
                      }}
                    >
                      {art.code}
                    </span>
                    {has3D ? (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 12,
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Box size={12} />
                        3D Sẵn Sàng
                      </span>
                    ) : isProcessing ? (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 12,
                          background: 'rgba(245, 158, 11, 0.2)',
                          color: '#f59e0b',
                          border: '1px solid rgba(245, 158, 11, 0.4)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Loader2 size={12} className="animate-spin" />
                        Đang dựng 3D...
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 12,
                          background: 'rgba(0,0,0,0.65)',
                          color: 'rgba(255,255,255,0.55)'
                        }}
                      >
                        Ảnh 2D
                      </span>
                    )}
                  </div>

                  {/* Actions Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      display: 'flex',
                      gap: 6
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenQR(art)}
                      title="Xem và tải mã QR"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'rgba(0,0,0,0.65)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <QrCode size={16} />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold, #d4af37)', fontWeight: 600 }}>
                      {art.category} • {art.period}
                    </span>
                    <h3
                      style={{
                        margin: '4px 0 0 0',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: '#fff',
                        lineHeight: 1.3
                      }}
                    >
                      {art.name}
                    </h3>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.82rem',
                      color: 'rgba(255, 255, 255, 0.65)',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {art.description || 'Chưa có thông tin giới thiệu chi tiết.'}
                  </p>

                  {/* Card Actions */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: 12,
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap'
                    }}
                  >
                    {has3D ? (
                      <button
                        type="button"
                        onClick={() => handleOpenViewer(art)}
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: 'rgba(212, 175, 55, 0.15)',
                          color: 'var(--accent-gold, #d4af37)',
                          border: '1px solid rgba(212, 175, 55, 0.35)',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <RotateCw size={14} />
                        <span>Xem 3D mâm xoay</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenGenerate3D(art)}
                        disabled={isProcessing}
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: isProcessing ? 'rgba(255,255,255,0.05)' : 'rgba(59, 130, 246, 0.15)',
                          color: isProcessing ? 'rgba(255,255,255,0.4)' : '#60a5fa',
                          border: isProcessing ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(59, 130, 246, 0.3)',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: isProcessing ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        <span>{isProcessing ? 'Đang dựng 3D...' : 'Tái tạo 3D từ ảnh'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleEdit(art)}
                      title="Chỉnh sửa thông tin"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(art.id, art.name)}
                      title="Xóa hiện vật"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: XEM 3D MÂM XOAY 360° */}
      {isViewerModalOpen && activeViewerArtifact && (
        <div
          className="modal-backdrop"
          onClick={() => setIsViewerModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 9999
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 900,
              background: '#0d1017',
              borderRadius: 20,
              overflow: 'hidden',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontWeight: 700 }}>
                  {activeViewerArtifact.name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold, #d4af37)' }}>
                  {activeViewerArtifact.code} • {activeViewerArtifact.period}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsViewerModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: 6
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: 20 }}>
              <Turntable360Viewer
                modelUrl={activeViewerArtifact.model3dUrl}
                imageUrl={activeViewerArtifact.thumbnailUrl || (activeViewerArtifact.images?.[0])}
                artifactName={activeViewerArtifact.name}
                artifactPeriod={activeViewerArtifact.period}
                audioNarrationUrl={activeViewerArtifact.audioNarrationUrl}
                height={540}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TÙY CHỌN TÁI TẠO 3D TỪ ẢNH ĐƠN */}
      {isGenerateModalOpen && generatingArtifact && (
        <div
          className="modal-backdrop"
          onClick={() => setIsGenerateModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 9999
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 520,
              background: '#161a24',
              borderRadius: 18,
              padding: 24,
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sparkles size={20} style={{ color: 'var(--accent-gold, #d4af37)' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontWeight: 700 }}>
                  Tái tạo Mô hình 3D từ Ảnh
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGenerateModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.86rem', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              Hệ thống sử dụng mạng ước lượng độ sâu quang học kết hợp thuật toán Solid Manifold để biến ảnh chụp 1 mặt của <strong>{generatingArtifact.name}</strong> thành khối 3D đặc hoàn chỉnh gồm mặt trước, vách bên và mặt sau.
            </p>

            {/* Depth Scale Slider */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: '0.84rem', color: '#fff', fontWeight: 600 }}>
                  Độ dày lồi lõm hình học (Depth Scale):
                </label>
                <span style={{ fontSize: '0.84rem', color: 'var(--accent-gold, #d4af37)', fontWeight: 700 }}>
                  {depthScale}x
                </span>
              </div>
              <input
                type="range"
                min="0.15"
                max="0.65"
                step="0.05"
                value={depthScale}
                onChange={(e) => setDepthScale(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-gold, #d4af37)' }}
              />
              <span style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.45)' }}>
                • Thấp (0.20x): Phù hợp đĩa cổ, tiền xu, tranh phù điêu • Cao (0.45x): Bình gốm, tượng tròn, trống đồng
              </span>
            </div>

            {/* Mesh Resolution Slider */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: '0.84rem', color: '#fff', fontWeight: 600 }}>
                  Độ mịn lưới đa giác (Resolution Grid):
                </label>
                <span style={{ fontSize: '0.84rem', color: 'var(--accent-gold, #d4af37)', fontWeight: 700 }}>
                  {meshResolution} px
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="220"
                step="20"
                value={meshResolution}
                onChange={(e) => setMeshResolution(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-gold, #d4af37)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsGenerateModalOpen(false)}
                disabled={isProcessing3D}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleTrigger3DGeneration}
                disabled={isProcessing3D}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                {isProcessing3D ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>{isProcessing3D ? 'Đang xử lý...' : 'Bắt đầu dựng 3D'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: XEM VÀ TẢI MÃ QR CHO KHÁCH THAM QUAN */}
      {isQRModalOpen && activeQRArtifact && (
        <div
          className="modal-backdrop"
          onClick={() => setIsQRModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 9999
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 420,
              background: '#161a24',
              borderRadius: 18,
              padding: 24,
              textAlign: 'center',
              border: '1px solid rgba(212, 175, 55, 0.35)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff', fontWeight: 700 }}>
                Mã QR Bảng Trưng Bày Cổ Vật
              </h3>
              <button
                type="button"
                onClick={() => setIsQRModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                background: '#ffffff',
                padding: 18,
                borderRadius: 14,
                display: 'inline-block',
                margin: '12px auto 16px auto',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
              }}
            >
              {activeQRArtifact.qrCodeUrl ? (
                <img
                  src={activeQRArtifact.qrCodeUrl}
                  alt={`QR ${activeQRArtifact.code}`}
                  style={{ width: 220, height: 220, display: 'block' }}
                />
              ) : (
                <div style={{ width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 size={32} className="animate-spin" style={{ color: '#000' }} />
                </div>
              )}
            </div>

            <h4 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '1.05rem' }}>{activeQRArtifact.name}</h4>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              Mã số: {activeQRArtifact.code} • Quét bằng camera điện thoại để xem mâm xoay 3D và nghe thuyết minh AI
            </p>

            <a
              href={api.getArtifactQRDownloadUrl(activeQRArtifact.id)}
              download={`QR_${activeQRArtifact.code}.png`}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: '11px',
                borderRadius: 10,
                textDecoration: 'none'
              }}
            >
              <Download size={16} />
              <span>Tải file PNG chất lượng cao (In ấn)</span>
            </a>
          </div>
        </div>
      )}

      {/* MODAL 4: THÊM / SỬA HIỆN VẬT */}
      {isEditModalOpen && editingArtifact && (
        <div
          className="modal-backdrop"
          onClick={() => setIsEditModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 9999
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 680,
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#161a24',
              borderRadius: 20,
              padding: 28,
              border: '1px solid rgba(212, 175, 55, 0.25)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff', fontWeight: 700 }}>
                {editingArtifact.id ? 'Chỉnh sửa Cổ vật Di sản' : 'Thêm Cổ vật Di sản Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveArtifact}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: 6 }}>
                    Mã hiện vật (duy nhất) *
                  </label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={editingArtifact.code || ''}
                    onChange={(e) => setEditingArtifact({ ...editingArtifact, code: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: 6 }}>
                    Tên hiện vật cổ *
                  </label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={editingArtifact.name || ''}
                    onChange={(e) => setEditingArtifact({ ...editingArtifact, name: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: 6 }}>
                    Danh mục hiện vật
                  </label>
                  <select
                    className="form-control"
                    value={editingArtifact.category || 'Cổ vật di sản'}
                    onChange={(e) => setEditingArtifact({ ...editingArtifact, category: e.target.value })}
                  >
                    <option value="Cổ vật di sản">Cổ vật di sản</option>
                    <option value="Gốm sứ">Gốm sứ</option>
                    <option value="Kim loại / Đồ đồng">Kim loại / Đồ đồng</option>
                    <option value="Điêu khắc đá / gỗ">Điêu khắc đá / gỗ</option>
                    <option value="Trang phục cổ">Trang phục cổ</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: 6 }}>
                    Niên đại / Thời kỳ
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ví dụ: Thế kỷ XVII, Thời Lý - Trần..."
                    value={editingArtifact.period || ''}
                    onChange={(e) => setEditingArtifact({ ...editingArtifact, period: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: 6 }}>
                  Mô tả lịch sử và ý nghĩa văn hóa
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={editingArtifact.description || ''}
                  onChange={(e) => setEditingArtifact({ ...editingArtifact, description: e.target.value })}
                />
              </div>

              {/* Upload ảnh hiện vật */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: 6 }}>
                  Hình ảnh chụp hiện vật (Dùng để dựng 3D)
                </label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  {editingArtifact.thumbnailUrl && (
                    <img
                      src={editingArtifact.thumbnailUrl.startsWith('http') ? editingArtifact.thumbnailUrl : `${API_ROOT}${editingArtifact.thumbnailUrl}`}
                      alt="Preview"
                      style={{ width: 70, height: 70, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }}
                    />
                  )}
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 16px',
                      borderRadius: 8,
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '0.84rem'
                    }}
                  >
                    <Upload size={16} />
                    <span>Tải ảnh mới</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* File 3D GLB trực tiếp nếu có */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: 6 }}>
                  File mô hình 3D (.GLB, .GLTF) - Hoặc để trống để AI tự sinh từ ảnh
                </label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="/uploads/artifacts/models_3d/..."
                    value={editingArtifact.model3dUrl || ''}
                    onChange={(e) => setEditingArtifact({ ...editingArtifact, model3dUrl: e.target.value })}
                  />
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 8,
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Upload size={15} />
                    <span>Upload .glb</span>
                    <input type="file" accept=".glb,.gltf" onChange={handleModelUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* Âm thanh thuyết minh AI */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: 6 }}>
                  Đường dẫn âm thanh thuyết minh AI (.mp3, .wav)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://... hoặc /uploads/audio/..."
                  value={editingArtifact.audioNarrationUrl || ''}
                  onChange={(e) => setEditingArtifact({ ...editingArtifact, audioNarrationUrl: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu hiện vật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
