import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Plus,
  Search,
  RotateCw,
  Box,
  Layers,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  Image as ImageIcon,
  QrCode,
  Edit3,
  Trash2,
  Sparkles,
  LayoutGrid,
  List,
  Compass,
  MapPin,
  Calendar,
  Volume2,
  ExternalLink,
  Tag,
  Landmark,
  Share2,
  Check
} from 'lucide-react';
import { api, API_ROOT } from '../../services/api';
import { Artifact } from '../../types';
import { Turntable360Viewer } from '../../components/Turntable360Viewer';
import { Pagination } from '../../components/Pagination';
import { useToast } from '../../components/Toast';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';

export const AdminArtifactsPage: React.FC = () => {
  const { showToast } = useToast();
  const { branding } = useSystemBranding();
  const { t } = useClientTranslation();

  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus3D, setSelectedStatus3D] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingArtifact, setEditingArtifact] = useState<Partial<Artifact> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
  const [activeViewerArtifact, setActiveViewerArtifact] = useState<Artifact | null>(null);

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [activeQRArtifact, setActiveQRArtifact] = useState<Artifact | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generatingArtifact, setGeneratingArtifact] = useState<Artifact | null>(null);
  const [depthScale, setDepthScale] = useState(0.35);
  const [isProcessing3D, setIsProcessing3D] = useState(false);

  // Polling ref cho các job 3D đang chạy
  const pollingTimerRef = useRef<any>(null);

  const fetchArtifacts = async () => {
    try {
      setLoading(true);
      const data = await api.getArtifacts();
      setArtifacts(data);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải danh sách hiện vật', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtifacts();
  }, []);

  // Polling tự động khi có hiện vật đang trong trạng thái 'processing'
  useEffect(() => {
    const hasProcessing = artifacts.some((a) => a.processingStatus === 'processing');
    if (hasProcessing) {
      pollingTimerRef.current = setInterval(async () => {
        try {
          const freshList = await api.getArtifacts();
          setArtifacts(freshList);
          const stillProcessing = freshList.some((a) => a.processingStatus === 'processing');
          if (!stillProcessing && pollingTimerRef.current) {
            clearInterval(pollingTimerRef.current);
            showToast('Đã hoàn thành số hóa mô hình 3D cho các hiện vật trong hàng đợi', 'success');
          }
        } catch {
          // Ignored in polling
        }
      }, 4000);
    } else if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
    }

    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [artifacts]);

  // Danh sách danh mục thực tế từ dữ liệu hiện vật
  const availableCategories = useMemo(() => {
    const defaultCats = [
      'Cổ vật di sản',
      'Gốm sứ cổ',
      'Kim loại / Đồ đồng',
      'Điêu khắc đá / gỗ',
      'Trang phục cung đình',
      'Châu bản / Sắc phong'
    ];
    const fromData = artifacts.map((a) => a.category?.trim()).filter(Boolean) as string[];
    return Array.from(new Set([...defaultCats, ...fromData]));
  }, [artifacts]);

  // Lọc dữ liệu hiện vật
  const filteredArtifacts = useMemo(() => {
    return artifacts.filter((art) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        art.name.toLowerCase().includes(q) ||
        art.code.toLowerCase().includes(q) ||
        (art.period && art.period.toLowerCase().includes(q)) ||
        (art.origin && art.origin.toLowerCase().includes(q)) ||
        (art.description && art.description.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'all' ||
        art.category?.trim() === selectedCategory;

      const matches3D =
        selectedStatus3D === 'all' ||
        (selectedStatus3D === 'has_3d' && !!art.model3dUrl) ||
        (selectedStatus3D === 'processing' && art.processingStatus === 'processing') ||
        (selectedStatus3D === 'no_3d' && !art.model3dUrl && art.processingStatus !== 'processing');

      return matchesSearch && matchesCategory && matches3D;
    });
  }, [artifacts, searchQuery, selectedCategory, selectedStatus3D]);

  // Phân trang danh sách
  const paginatedArtifacts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredArtifacts.slice(start, start + pageSize);
  }, [filteredArtifacts, currentPage, pageSize]);

  // Thống kê di sản chuẩn mực của hệ thống
  const totalArtifacts = artifacts.length;
  const with3DCount = artifacts.filter((a) => !!a.model3dUrl).length;
  const percent3D = totalArtifacts > 0 ? Math.round((with3DCount / totalArtifacts) * 100) : 0;
  const withAudioCount = artifacts.filter((a) => !!a.audioNarrationUrl).length;
  const withQrCount = artifacts.filter((a) => !!a.qrCodeUrl).length;

  const handleCreateNew = () => {
    setEditingArtifact({
      code: `HV-${100 + Math.floor(Math.random() * 900)}`,
      name: '',
      category: 'Cổ vật di sản',
      period: 'Thời Lý - Trần (Thế kỷ XI - XIV)',
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
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ hiện vật "${name}" khỏi sổ đăng ký bảo tàng?`)) return;
    try {
      await api.deleteArtifact(id);
      showToast(`Đã xóa hiện vật "${name}" thành công`, 'success');
      fetchArtifacts();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa hiện vật', 'error');
    }
  };

  const handleSaveArtifact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtifact || !editingArtifact.name || !editingArtifact.code) {
      showToast('Vui lòng nhập đầy đủ Tên và Mã hiện vật', 'error');
      return;
    }

    try {
      setIsSaving(true);
      if (editingArtifact.id) {
        await api.updateArtifact(editingArtifact.id, editingArtifact);
        showToast('Đã cập nhật hồ sơ hiện vật thành công!', 'success');
      } else {
        await api.createArtifact(editingArtifact);
        showToast('Đã thêm hồ sơ hiện vật mới vào sổ lưu trữ di sản!', 'success');
      }
      setIsEditModalOpen(false);
      fetchArtifacts();
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu thông tin hiện vật', 'error');
    } finally {
      setIsSaving(false);
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
      showToast('Đã tải ảnh tư liệu hiện vật thành công', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi tải ảnh hiện vật', 'error');
    }
  };

  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await api.uploadArtifactModel(file);
      setEditingArtifact((prev) => (prev ? { ...prev, model3dUrl: res.url } : prev));
      showToast('Đã tải tệp mô hình 3D (.glb) thành công', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi tải file 3D', 'error');
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

  const handleOpenGenerate3D = (artifact: Artifact) => {
    setGeneratingArtifact(artifact);
    setDepthScale(0.35);
    setIsGenerateModalOpen(true);
  };

  const handleStart3DReconstruction = async () => {
    if (!generatingArtifact) return;
    try {
      setIsProcessing3D(true);
      const res = await api.generate3DArtifact(generatingArtifact.id, {
        depthScale: depthScale,
        resolution: 160
      });

      if (res.cached) {
        showToast('Mô hình 3D đã sẵn sàng từ bộ nhớ đệm (Cache)', 'success');
      } else {
        showToast('Đã đưa tác vụ dựng 3D vào hàng đợi xử lý nền', 'success');
      }

      setIsGenerateModalOpen(false);
      fetchArtifacts();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khởi chạy tác vụ dựng 3D', 'error');
    } finally {
      setIsProcessing3D(false);
    }
  };

  const handleCopyLink = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      showToast('Đã sao chép liên kết vào bộ nhớ tạm', 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  return (
    <div className="admin-content">
      {/* Tiêu đề trang chuẩn mực bảo tàng */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--heading-color)', margin: 0, lineHeight: 1.3 }}>
            Hiện vật & Cổ vật di sản
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Quản lý hồ sơ hiện vật, tư liệu khảo cứu, số hóa mô hình 3D tương tác và xuất thẻ QR trưng bày.
          </p>
        </div>
      </div>

      {/* BĂNG THỐNG KÊ DI SẢN (HERITAGE STATS BANNER) - Đồng bộ 100% với AdminRoomsPage */}
      <div className="heritage-stats-banner">
        {/* Cột 1: Tổng số Cổ vật */}
        <div className="heritage-stat-col">
          <div className="heritage-stat-header">
            <span className="heritage-stat-icon-wrapper">
              <Landmark size={15} />
            </span>
            <span className="heritage-stat-title">Hồ sơ Cổ vật</span>
          </div>
          <div className="heritage-stat-body">
            <div className="heritage-stat-metric">
              <span className="heritage-stat-number">{totalArtifacts}</span>
              <span className="heritage-stat-unit">hiện vật</span>
            </div>
            <div className="heritage-stat-sub">
              <span>Đăng ký sổ bảo tồn di sản</span>
            </div>
          </div>
        </div>

        {/* Cột 2: Đã số hóa 3D */}
        <div className="heritage-stat-col">
          <div className="heritage-stat-header">
            <span className="heritage-stat-icon-wrapper">
              <Box size={15} />
            </span>
            <span className="heritage-stat-title">Số hóa 3D Không gian</span>
          </div>
          <div className="heritage-stat-body">
            <div className="heritage-stat-metric">
              <span className="heritage-stat-number">{with3DCount}</span>
              <span className="heritage-stat-denom">/{totalArtifacts}</span>
              <span className="heritage-stat-unit">hiện vật</span>
            </div>
            <div className="heritage-stat-sub">
              <span>{percent3D}% Sẵn sàng đĩa xoay 360°</span>
            </div>
          </div>
        </div>

        {/* Cột 3: Thuyết minh Bản ngữ */}
        <div className="heritage-stat-col">
          <div className="heritage-stat-header">
            <span className="heritage-stat-icon-wrapper">
              <Volume2 size={15} />
            </span>
            <span className="heritage-stat-title">Thuyết minh Di sản</span>
          </div>
          <div className="heritage-stat-body">
            <div className="heritage-stat-metric">
              <span className="heritage-stat-number">{withAudioCount}</span>
              <span className="heritage-stat-denom">/{totalArtifacts}</span>
              <span className="heritage-stat-unit">bản ghi</span>
            </div>
            <div className="heritage-stat-sub">
              <span>Đồng bộ giọng đọc bản xứ</span>
            </div>
          </div>
        </div>

        {/* Cột 4: Thẻ tra cứu QR */}
        <div className="heritage-stat-col" style={{ borderRight: 'none' }}>
          <div className="heritage-stat-header">
            <span className="heritage-stat-icon-wrapper">
              <QrCode size={15} />
            </span>
            <span className="heritage-stat-title">Tương tác Thực địa</span>
          </div>
          <div className="heritage-stat-body">
            <div className="heritage-stat-metric">
              <span className="heritage-stat-number">{withQrCount}</span>
              <span className="heritage-stat-unit">mã QR</span>
            </div>
            <div className="heritage-stat-sub">
              <span>Sẵn sàng in ấn thẻ trưng bày</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="panel">
        {/* Navigation Sub-Tabs & Actions Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-color)',
            padding: '14px 20px',
            background: 'var(--bg-subtle)',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontWeight: 600,
                fontSize: '13px',
                background: 'var(--bg-surface)',
                color: 'var(--primary)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Compass size={15} />
              <span>Danh Mục Hiện Vật ({filteredArtifacts.length})</span>
            </div>

            {/* Chuyển đổi Grid / Table View */}
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: 2
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Chế độ lưới trực quan"
                style={{
                  background: viewMode === 'grid' ? 'var(--bg-subtle)' : 'transparent',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)'
                }}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Chế độ bảng dữ liệu"
                style={{
                  background: viewMode === 'table' ? 'var(--bg-subtle)' : 'transparent',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-muted)'
                }}
              >
                <List size={15} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={fetchArtifacts}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RotateCw size={14} className={loading ? 'spin' : ''} />
              <span>Làm mới</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleCreateNew}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={15} />
              <span>Thêm hiện vật mới</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            background: 'var(--bg-surface)'
          }}
        >
          {/* Search box */}
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <input
              type="text"
              placeholder="Tìm theo tên hiện vật, mã HV-..., niên đại..."
              className="form-control"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '100%', paddingLeft: 34, fontSize: '13px' }}
            />
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: 11,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
          </div>

          {/* Lọc danh mục */}
          <div style={{ minWidth: 200 }}>
            <select
              className="form-control"
              style={{ fontSize: '13px', width: '100%' }}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả danh mục ({artifacts.length})</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc trạng thái 3D */}
          <div style={{ minWidth: 180 }}>
            <select
              className="form-control"
              style={{ fontSize: '13px', width: '100%' }}
              value={selectedStatus3D}
              onChange={(e) => {
                setSelectedStatus3D(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả trạng thái 3D</option>
              <option value="has_3d">Đã có mô hình 3D ({with3DCount})</option>
              <option value="processing">Đang dựng 3D</option>
              <option value="no_3d">Chưa có 3D ({totalArtifacts - with3DCount})</option>
            </select>
          </div>
        </div>

        {/* Nội dung Hiện vật */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <Loader2 size={32} className="spin" style={{ color: 'var(--primary)', margin: '0 auto 12px auto' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
              Đang tải danh mục hiện vật di sản...
            </p>
          </div>
        ) : filteredArtifacts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)'
              }}
            >
              <Landmark size={28} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--heading-color)', margin: 0 }}>
              Chưa có hiện vật nào phù hợp
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: 460, margin: 0, lineHeight: 1.5 }}>
              Hệ thống chưa ghi nhận cổ vật phù hợp với bộ lọc hiện tại. Bạn có thể thêm hồ sơ hiện vật mới hoặc điều chỉnh tiêu chí tìm kiếm.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleCreateNew}
              style={{ marginTop: 6 }}
            >
              <Plus size={14} style={{ marginRight: 4 }} />
              Thêm hiện vật mới
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View Mode */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 18,
              padding: '20px'
            }}
          >
            {paginatedArtifacts.map((art) => {
              const has3D = !!art.model3dUrl;
              const isProcessing = art.processingStatus === 'processing';
              const imgUrl = art.thumbnailUrl || (art.images && art.images.length > 0 ? art.images[0] : null);
              const fullImgUrl = imgUrl
                ? imgUrl.startsWith('http')
                  ? imgUrl
                  : `${API_ROOT}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`
                : null;

              return (
                <div key={art.id} className="artifact-card">
                  {/* Khung ảnh thumbnail */}
                  <div className="artifact-thumbnail-wrapper">
                    {fullImgUrl ? (
                      <img src={fullImgUrl} alt={art.name} className="artifact-thumbnail" />
                    ) : (
                      <ImageIcon size={36} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                    )}

                    {/* Mã định danh */}
                    <span className="artifact-badge-code">{art.code}</span>

                    {/* Huy hiệu 3D */}
                    <div className="artifact-badge-status">
                      {has3D ? (
                        <span className="badge-3d-ready">
                          <Box size={11} />
                          3D Sẵn sàng
                        </span>
                      ) : isProcessing ? (
                        <span className="badge-3d-processing">
                          <Loader2 size={11} className="spin" />
                          Đang dựng 3D
                        </span>
                      ) : (
                        <span className="badge-3d-none">Ảnh 2D</span>
                      )}
                    </div>
                  </div>

                  {/* Thông tin cổ vật */}
                  <div className="artifact-info">
                    <div className="artifact-period">
                      {art.period || art.category || 'Cổ vật di sản'}
                    </div>

                    <h4 className="artifact-name" title={art.name}>
                      {art.name}
                    </h4>

                    {(art.origin || art.dimensions) && (
                      <div className="artifact-meta-text">
                        <MapPin size={11} style={{ flexShrink: 0 }} />
                        <span>{art.origin || 'Bảo tàng Lịch sử TP.HCM'}</span>
                        {art.dimensions && <span>• {art.dimensions}</span>}
                      </div>
                    )}

                    <p className="artifact-desc" title={art.description}>
                      {art.description || 'Chưa có thông tin khảo cứu lịch sử cho cổ vật này.'}
                    </p>
                  </div>

                  {/* Thanh tác vụ */}
                  <div className="artifact-actions">
                    {/* Tác vụ chính */}
                    {has3D ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => handleOpenViewer(art)}
                      >
                        <RotateCw size={13} style={{ marginRight: 6 }} />
                        <span>Xem 3D Đĩa Xoay 360°</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => handleOpenGenerate3D(art)}
                        disabled={isProcessing}
                      >
                        <Sparkles size={13} style={{ marginRight: 6, color: 'var(--accent-gold)' }} />
                        <span>{isProcessing ? 'Đang dựng 3D...' : 'Khởi tạo mô hình 3D'}</span>
                      </button>
                    )}

                    {/* Các nút phụ */}
                    <div className="artifact-actions-secondary">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenQR(art)}
                        title="Xem và tải mã QR trưng bày"
                      >
                        <QrCode size={13} style={{ marginRight: 4 }} />
                        <span>Mã QR</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEdit(art)}
                        title="Chỉnh sửa thông tin hiện vật"
                      >
                        <Edit3 size={13} style={{ marginRight: 4 }} />
                        <span>Sửa</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDelete(art.id, art.name)}
                        title="Xóa hiện vật khỏi sổ lưu trữ"
                        style={{ color: 'var(--error)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View Mode */
          <div style={{ overflowX: 'auto' }}>
            <table className="artifact-table">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>Mã số</th>
                  <th style={{ width: 64 }}>Hình ảnh</th>
                  <th>Tên hiện vật & Xuất xứ</th>
                  <th>Niên đại & Chuyên đề</th>
                  <th style={{ width: 140 }}>Trạng thái 3D</th>
                  <th style={{ width: 110 }}>Thuyết minh</th>
                  <th style={{ width: 190, textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedArtifacts.map((art) => {
                  const has3D = !!art.model3dUrl;
                  const isProcessing = art.processingStatus === 'processing';
                  const imgUrl = art.thumbnailUrl || (art.images && art.images.length > 0 ? art.images[0] : null);
                  const fullImgUrl = imgUrl
                    ? imgUrl.startsWith('http')
                      ? imgUrl
                      : `${API_ROOT}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`
                    : null;

                  return (
                    <tr key={art.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)' }}>
                        {art.code}
                      </td>
                      <td>
                        {fullImgUrl ? (
                          <img src={fullImgUrl} alt="" className="artifact-table-thumb" />
                        ) : (
                          <div className="artifact-table-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon size={18} style={{ color: 'var(--text-muted)' }} />
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--heading-color)', marginBottom: 2 }}>
                          {art.name}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {art.origin || 'Bảo tàng Lịch sử TP.HCM'}
                          {art.dimensions && ` • ${art.dimensions}`}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-gold)' }}>
                          {art.period || 'Chưa cập nhật'}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {art.category}
                        </div>
                      </td>
                      <td>
                        {has3D ? (
                          <span className="badge-3d-ready">
                            <Box size={11} /> 3D Sẵn sàng
                          </span>
                        ) : isProcessing ? (
                          <span className="badge-3d-processing">
                            <Loader2 size={11} className="spin" /> Đang dựng 3D
                          </span>
                        ) : (
                          <span className="badge-3d-none">Ảnh 2D</span>
                        )}
                      </td>
                      <td>
                        {art.audioNarrationUrl ? (
                          <span style={{ fontSize: '11.5px', color: 'var(--success-text)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Volume2 size={12} /> Đã có
                          </span>
                        ) : (
                          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            Chưa có
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {has3D && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => handleOpenViewer(art)}
                              title="Xem 3D đĩa xoay 360°"
                            >
                              <RotateCw size={13} />
                            </button>
                          )}
                          {!has3D && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenGenerate3D(art)}
                              title="Khởi tạo mô hình 3D từ ảnh"
                            >
                              <Sparkles size={13} style={{ color: 'var(--accent-gold)' }} />
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenQR(art)}
                            title="Mã QR tra cứu"
                          >
                            <QrCode size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleEdit(art)}
                            title="Chỉnh sửa"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDelete(art.id, art.name)}
                            title="Xóa"
                            style={{ color: 'var(--error)' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân trang chuẩn mực của hệ thống */}
        <div style={{ borderTop: '1px solid var(--border-color)', padding: '12px 20px', background: 'var(--bg-card-header)' }}>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredArtifacts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            itemLabel="cổ vật"
          />
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: THÊM / CHỈNH SỬA HỒ SƠ HIỆN VẬT
          ========================================================================= */}
      {isEditModalOpen && editingArtifact && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }}>
          <div className="modal-card" style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ fontSize: '16px', margin: 0 }}>
                {editingArtifact.id ? 'Cập nhật hồ sơ hiện vật' : 'Thêm hồ sơ cổ vật mới'}
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsEditModalOpen(false)}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveArtifact}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Hàng 1: Mã hiện vật & Tên */}
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Mã định danh *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingArtifact.code || ''}
                      onChange={(e) => setEditingArtifact({ ...editingArtifact, code: e.target.value })}
                      placeholder="HV-101..."
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tên cổ vật di sản *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingArtifact.name || ''}
                      onChange={(e) => setEditingArtifact({ ...editingArtifact, name: e.target.value })}
                      placeholder="Ví dụ: Tượng Bồ Tát Tara sa thạch..."
                      required
                    />
                  </div>
                </div>

                {/* Hàng 2: Danh mục & Niên đại */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Danh mục / Loại hình</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingArtifact.category || ''}
                      onChange={(e) => setEditingArtifact({ ...editingArtifact, category: e.target.value })}
                      placeholder="Gốm sứ, Đồ đồng, Điêu khắc..."
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Niên đại / Triều đại</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingArtifact.period || ''}
                      onChange={(e) => setEditingArtifact({ ...editingArtifact, period: e.target.value })}
                      placeholder="Thế kỷ VII - IX, Thời Lý - Trần..."
                    />
                  </div>
                </div>

                {/* Hàng 3: Nguồn gốc & Kích thước */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Nguồn gốc / Khảo cổ</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingArtifact.origin || ''}
                      onChange={(e) => setEditingArtifact({ ...editingArtifact, origin: e.target.value })}
                      placeholder="Đồng Nai, Quảng Nam, Huế..."
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kích thước đo đạc</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingArtifact.dimensions || ''}
                      onChange={(e) => setEditingArtifact({ ...editingArtifact, dimensions: e.target.value })}
                      placeholder="Cao 42cm, Rộng 28cm..."
                    />
                  </div>
                </div>

                {/* Giới thiệu lịch sử */}
                <div className="form-group">
                  <label className="form-label">Thông tin khảo cứu & Ý nghĩa lịch sử</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={editingArtifact.description || ''}
                    onChange={(e) => setEditingArtifact({ ...editingArtifact, description: e.target.value })}
                    placeholder="Mô tả nguồn gốc, hoa văn mỹ thuật và giá trị lịch sử của cổ vật..."
                  />
                </div>

                {/* Quản lý Ảnh tư liệu */}
                <div className="form-group">
                  <label className="form-label">Hình ảnh tư liệu hiện vật</label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    {editingArtifact.images &&
                      editingArtifact.images.map((img, i) => {
                        const url = img.startsWith('http') ? img : `${API_ROOT}${img}`;
                        return (
                          <div
                            key={i}
                            style={{
                              position: 'relative',
                              width: 64,
                              height: 64,
                              borderRadius: 'var(--radius-sm)',
                              overflow: 'hidden',
                              border: '1px solid var(--border-color)'
                            }}
                          >
                            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                              type="button"
                              onClick={() => {
                                const nextImgs = editingArtifact.images?.filter((_, idx) => idx !== i) || [];
                                setEditingArtifact({
                                  ...editingArtifact,
                                  images: nextImgs,
                                  thumbnailUrl: nextImgs[0] || ''
                                });
                              }}
                              style={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                background: 'rgba(0,0,0,0.7)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '50%',
                                width: 18,
                                height: 18,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <X size={10} />
                            </button>
                          </div>
                        );
                      })}

                    <label
                      className="btn btn-secondary btn-sm"
                      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Upload size={13} />
                      <span>Tải ảnh lên</span>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                    </label>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    Ảnh tư liệu đầu tiên sẽ được dùng làm ảnh gốc để tự động dựng mô hình 3D.
                  </span>
                </div>

                {/* File 3D (Tùy chọn) */}
                <div className="form-group">
                  <label className="form-label">Tệp mô hình 3D (.glb, .gltf)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="text"
                      className="form-control"
                      value={editingArtifact.model3dUrl || ''}
                      onChange={(e) => setEditingArtifact({ ...editingArtifact, model3dUrl: e.target.value })}
                      placeholder="/uploads/artifacts/models_3d/... hoặc đường dẫn URL"
                      style={{ flex: 1, fontSize: '12.5px' }}
                    />
                    <label
                      className="btn btn-secondary btn-sm"
                      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
                    >
                      <Upload size={13} />
                      <span>Chọn file 3D</span>
                      <input type="file" accept=".glb,.gltf" style={{ display: 'none' }} onChange={handleModelUpload} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSaving}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  {isSaving ? <Loader2 size={14} className="spin" /> : <CheckCircle2 size={14} />}
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu hồ sơ hiện vật'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: XEM 3D ĐĨA XOAY 360°
          ========================================================================= */}
      {isViewerModalOpen && activeViewerArtifact && (
        <div className="modal-backdrop" style={{ zIndex: 1250 }}>
          <div className="modal-card" style={{ maxWidth: 840 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Box size={18} style={{ color: 'var(--accent-gold)' }} />
                <div>
                  <h2 className="modal-title" style={{ fontSize: '16px', margin: 0 }}>
                    {activeViewerArtifact.name}
                  </h2>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Mã số: {activeViewerArtifact.code} • {activeViewerArtifact.period || activeViewerArtifact.category}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsViewerModalOpen(false)}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: 0, overflow: 'hidden', background: '#0d1118' }}>
              <Turntable360Viewer
                modelUrl={
                  activeViewerArtifact.model3dUrl?.startsWith('http')
                    ? activeViewerArtifact.model3dUrl
                    : `${API_ROOT}${activeViewerArtifact.model3dUrl}`
                }
                artifactName={activeViewerArtifact.name}
                artifactPeriod={activeViewerArtifact.period}
                audioNarrationUrl={
                  activeViewerArtifact.audioNarrationUrl
                    ? activeViewerArtifact.audioNarrationUrl.startsWith('http')
                      ? activeViewerArtifact.audioNarrationUrl
                      : `${API_ROOT}${activeViewerArtifact.audioNarrationUrl}`
                    : undefined
                }
                height={480}
              />
            </div>

            <div
              className="modal-footer"
              style={{
                borderTop: '1px solid var(--border-color)',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <a
                href={`/?artifact=${activeViewerArtifact.id}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <ExternalLink size={13} />
                <span>Xem trang công cộng (Giao diện Quét QR)</span>
              </a>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsViewerModalOpen(false)}
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: CẤU HÌNH KHỞI TẠO MÔ HÌNH 3D
          ========================================================================= */}
      {isGenerateModalOpen && generatingArtifact && (
        <div className="modal-backdrop" style={{ zIndex: 1250 }}>
          <div className="modal-card" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} style={{ color: 'var(--accent-gold)' }} />
                <h2 className="modal-title" style={{ fontSize: '15px', margin: 0 }}>
                  Khởi tạo mô hình 3D cho cổ vật
                </h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsGenerateModalOpen(false)}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Xem trước ảnh nguồn */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)'
                }}
              >
                {generatingArtifact.thumbnailUrl || (generatingArtifact.images && generatingArtifact.images[0]) ? (
                  <img
                    src={
                      (generatingArtifact.thumbnailUrl || generatingArtifact.images[0]).startsWith('http')
                        ? generatingArtifact.thumbnailUrl || generatingArtifact.images[0]
                        : `${API_ROOT}${generatingArtifact.thumbnailUrl || generatingArtifact.images[0]}`
                    }
                    alt=""
                    style={{ width: 68, height: 68, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                  />
                ) : (
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ImageIcon size={24} style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--heading-color)', marginBottom: 2 }}>
                    {generatingArtifact.name}
                  </div>
                  <span style={{ fontSize: '11.5px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                    Mã số: {generatingArtifact.code}
                  </span>
                </div>
              </div>

              {/* Lựa chọn độ dày nổi khối */}
              <div className="form-group">
                <label className="form-label" style={{ marginBottom: 6 }}>
                  Độ dày nổi khối hình học (Depth Scale): <strong>{depthScale}</strong>
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="0.55"
                  step="0.05"
                  value={depthScale}
                  onChange={(e) => setDepthScale(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>
                  <span>0.20 (Phù điêu mỏng)</span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>0.35 (Chuẩn cổ vật)</span>
                  <span>0.55 (Tượng tròn dày)</span>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-subtle)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                  border: '1px solid var(--border-color)'
                }}
              >
                Thuật toán sẽ tự động phân đoạn tách nền, ước tính độ phồng hình học và tạo khối đặc khép kín (Watertight Manifold) với mặt sau hài hòa.
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsGenerateModalOpen(false)}
                disabled={isProcessing3D}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleStart3DReconstruction}
                disabled={isProcessing3D}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {isProcessing3D ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
                <span>{isProcessing3D ? 'Đang kích hoạt...' : 'Bắt đầu dựng 3D'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: XUẤT MÃ QR TRƯNG BÀY
          ========================================================================= */}
      {isQRModalOpen && activeQRArtifact && (
        <div className="modal-backdrop" style={{ zIndex: 1250 }}>
          <div className="modal-card" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <QrCode size={16} style={{ color: 'var(--accent-gold)' }} />
                <h2 className="modal-title" style={{ fontSize: '15px', margin: 0 }}>
                  Thẻ Mã QR Tra Cứu Trưng Bày
                </h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsQRModalOpen(false)}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ textAlign: 'center', padding: '24px 20px' }}>
              {/* Thẻ QR trắng tinh khiết có bóng đổ */}
              <div
                style={{
                  background: '#ffffff',
                  padding: 16,
                  borderRadius: 12,
                  display: 'inline-block',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-md)',
                  marginBottom: 16
                }}
              >
                <img
                  src={activeQRArtifact.qrCodeUrl || api.getArtifactQRDownloadUrl(activeQRArtifact.id)}
                  alt={`QR ${activeQRArtifact.code}`}
                  style={{ width: 200, height: 200, display: 'block' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--heading-color)', margin: '0 0 4px 0' }}>
                  {activeQRArtifact.name}
                </h4>
                <div style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                  Mã số: {activeQRArtifact.code} • {activeQRArtifact.period || activeQRArtifact.category}
                </div>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Du khách dùng camera điện thoại quét mã QR trên bảng thông tin để mở ngay mô hình 3D và nghe thuyết minh Di sản.
              </p>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '12px 20px', display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleCopyLink(`${window.location.origin}/?artifact=${activeQRArtifact.id}`)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {copiedLink ? <Check size={13} style={{ color: 'var(--success-text)' }} /> : <Share2 size={13} />}
                <span>{copiedLink ? 'Đã sao chép' : 'Sao chép liên kết'}</span>
              </button>

              <a
                href={api.getArtifactQRDownloadUrl(activeQRArtifact.id)}
                download={`QR_${activeQRArtifact.code}.png`}
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
              >
                <Download size={13} />
                <span>Tải ảnh QR (In ấn)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
