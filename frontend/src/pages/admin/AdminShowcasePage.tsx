import React, { useState, useEffect, useRef, useMemo } from 'react';
import { api, API_ROOT } from '../../services/api';
import { useToast } from '../../components/Toast';
import { SystemBranding, MuseumRoom, Artifact } from '../../types';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import {
  SlidersHorizontal,
  Save,
  ExternalLink,
  Compass,
  Box,
  Image,
  Search,
  Check,
  Trash2,
  Upload,
  RotateCcw,
  Info,
  CheckCircle2,
  Eye,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowRight
} from 'lucide-react';

interface AdminShowcasePageProps {
  onNavigateTab?: (tab: string) => void;
}

export const AdminShowcasePage: React.FC<AdminShowcasePageProps> = ({ onNavigateTab }) => {
  const { showToast } = useToast();
  const { branding, updateBranding } = useSystemBranding();
  const { t } = useClientTranslation();

  const [form, setForm] = useState<SystemBranding>(branding);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Dữ liệu thực tế từ cơ sở dữ liệu
  const [rooms, setRooms] = useState<MuseumRoom[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Bộ lọc tìm kiếm
  const [roomSearch, setRoomSearch] = useState('');
  const [artifactSearch, setArtifactSearch] = useState('');
  const [artifactFilter3DOnly, setArtifactFilter3DOnly] = useState(false);

  // Upload trạng thái
  const [uploadingIntro, setUploadingIntro] = useState(false);
  const [uploadingRoomShowcase, setUploadingRoomShowcase] = useState(false);
  const [uploadingArtifactShowcase, setUploadingArtifactShowcase] = useState(false);

  const introInputRef = useRef<HTMLInputElement>(null);
  const roomShowcaseInputRef = useRef<HTMLInputElement>(null);
  const artifactShowcaseInputRef = useRef<HTMLInputElement>(null);

  // Nạp dữ liệu phòng và hiện vật từ API
  useEffect(() => {
    let isMounted = true;
    setLoadingData(true);

    Promise.all([
      api.getRooms().catch((err) => {
        console.warn('[AdminShowcase] Lỗi nạp danh sách phòng:', err);
        return [] as MuseumRoom[];
      }),
      api.getArtifacts().catch((err) => {
        console.warn('[AdminShowcase] Lỗi nạp danh sách hiện vật:', err);
        return [] as Artifact[];
      })
    ]).then(([roomsData, artifactsData]) => {
      if (!isMounted) return;
      setRooms(roomsData || []);
      setArtifacts(artifactsData || []);
      setLoadingData(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Cập nhật form khi branding từ context thay đổi nếu chưa chỉnh sửa dở
  useEffect(() => {
    if (!isDirty) {
      setForm(branding);
    }
  }, [branding, isDirty]);

  const handleChange = (field: keyof SystemBranding, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  // Upload ảnh kiến trúc (Khối 1)
  const handleUploadIntro = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingIntro(true);
      const res = await api.uploadBrandingImage(file);
      handleChange('introImageUrl', res.url);
      showToast('Đã tải lên ảnh kiến trúc thành công.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải ảnh kiến trúc', 'error');
    } finally {
      setUploadingIntro(false);
      if (introInputRef.current) introInputRef.current.value = '';
    }
  };

  // Upload ảnh bìa tùy chỉnh cho phòng 360 (Khối 2)
  const handleUploadRoomShowcase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingRoomShowcase(true);
      const res = await api.uploadBrandingImage(file);
      handleChange('roomsShowcaseImageUrl', res.url);
      showToast('Đã tải lên ảnh bìa gian phòng thành công.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải ảnh bìa gian phòng', 'error');
    } finally {
      setUploadingRoomShowcase(false);
      if (roomShowcaseInputRef.current) roomShowcaseInputRef.current.value = '';
    }
  };

  // Upload ảnh bìa tùy chỉnh cho cổ vật 3D (Khối 3)
  const handleUploadArtifactShowcase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingArtifactShowcase(true);
      const res = await api.uploadBrandingImage(file);
      handleChange('artifactsShowcaseImageUrl', res.url);
      showToast('Đã tải lên ảnh bìa cổ vật thành công.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải ảnh bìa cổ vật', 'error');
    } finally {
      setUploadingArtifactShowcase(false);
      if (artifactShowcaseInputRef.current) artifactShowcaseInputRef.current.value = '';
    }
  };

  // Lưu cấu hình trưng bày
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateBranding(form);
      setIsDirty(false);
      showToast('Đã lưu cấu hình trưng bày trang chủ! Hệ thống đã đồng bộ tức thì sang người xem.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu cấu hình trưng bày', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Lọc danh sách phòng theo từ khóa
  const filteredRooms = useMemo(() => {
    if (!roomSearch.trim()) return rooms;
    const q = roomSearch.trim().toLowerCase();
    return rooms.filter((r) =>
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.code && r.code.toLowerCase().includes(q)) ||
      ((r as any).period && (r as any).period.toLowerCase().includes(q))
    );
  }, [rooms, roomSearch]);

  // Lọc danh sách hiện vật theo từ khóa & có 3D
  const filteredArtifacts = useMemo(() => {
    return artifacts.filter((a) => {
      if (artifactFilter3DOnly && !a.model3dUrl) return false;
      if (!artifactSearch.trim()) return true;
      const q = artifactSearch.trim().toLowerCase();
      return (
        (a.name && a.name.toLowerCase().includes(q)) ||
        (a.code && a.code.toLowerCase().includes(q)) ||
        (a.period && a.period.toLowerCase().includes(q)) ||
        (a.category && a.category.toLowerCase().includes(q))
      );
    });
  }, [artifacts, artifactSearch, artifactFilter3DOnly]);

  // Phòng hiện đang được chọn
  const selectedRoom = useMemo(() => {
    if (form.roomsFeaturedId) {
      return (
        rooms.find(
          (r) =>
            r.id === form.roomsFeaturedId ||
            (r as any)._id === form.roomsFeaturedId ||
            (r as any).code === form.roomsFeaturedId
        ) || null
      );
    }
    return rooms[0] || null;
  }, [rooms, form.roomsFeaturedId]);

  // Danh sách ID các cổ vật được chọn chỉ định cụ thể
  const selectedArtifactIds = useMemo(() => {
    return form.artifactsFeaturedId
      ? form.artifactsFeaturedId.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
  }, [form.artifactsFeaturedId]);

  // Danh sách cổ vật thực tế sẽ trưng bày trên Trang chủ (Đồng bộ 100% với Client)
  const showcaseArtifacts = useMemo(() => {
    if (!artifacts || artifacts.length === 0) return [];

    if (selectedArtifactIds.length > 0) {
      const selected: Artifact[] = [];
      for (const fid of selectedArtifactIds) {
        const found = artifacts.find(
          (a) =>
            a.id === fid ||
            (a as any)._id === fid ||
            (a as any).code === fid
        );
        if (found && !selected.some((s) => s.id === found.id)) {
          selected.push(found);
        }
      }
      if (selected.length > 0) return selected;
    }

    // Tự động: Ưu tiên có mô hình 3D, lấy tối đa 4 hiện vật
    const sorted = [...artifacts].sort((a, b) => {
      if (a.model3dUrl && !b.model3dUrl) return -1;
      if (!a.model3dUrl && b.model3dUrl) return 1;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });
    return sorted.slice(0, 4);
  }, [artifacts, selectedArtifactIds]);

  const selectedArtifact = showcaseArtifacts[0] || null;

  // Thêm / gỡ 1 cổ vật khỏi danh sách trưng bày
  const handleToggleArtifact = (artifactId: string) => {
    let currentIds = [...selectedArtifactIds];
    if (!form.artifactsFeaturedId) {
      currentIds = showcaseArtifacts.map((a) => a.id);
    }
    const idx = currentIds.indexOf(artifactId);
    if (idx >= 0) {
      currentIds.splice(idx, 1);
    } else {
      if (currentIds.length >= 6) {
        showToast('Bạn chỉ nên chọn tối đa 6 cổ vật tiêu biểu để bố cục trang chủ cân đối nhất.', 'warning');
        return;
      }
      currentIds.push(artifactId);
    }
    handleChange('artifactsFeaturedId', currentIds.join(','));
  };

  // Di chuyển thứ tự cổ vật
  const handleMoveArtifact = (index: number, direction: 'up' | 'down') => {
    let currentIds = [...selectedArtifactIds];
    if (!form.artifactsFeaturedId) {
      currentIds = showcaseArtifacts.map((a) => a.id);
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentIds.length) return;
    const temp = currentIds[index];
    currentIds[index] = currentIds[targetIndex];
    currentIds[targetIndex] = temp;
    handleChange('artifactsFeaturedId', currentIds.join(','));
  };

  // Gỡ bỏ 1 cổ vật khỏi danh sách
  const handleRemoveArtifact = (artifactId: string) => {
    let currentIds = [...selectedArtifactIds];
    if (!form.artifactsFeaturedId) {
      currentIds = showcaseArtifacts.map((a) => a.id);
    }
    currentIds = currentIds.filter((id) => id !== artifactId);
    handleChange('artifactsFeaturedId', currentIds.join(','));
  };

  const getMediaUrl = (path?: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${API_ROOT}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  return (
    <div className="admin-content" style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header trang cấu hình */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
          paddingBottom: 20,
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(212, 168, 106, 0.12)',
                border: '1px solid rgba(212, 168, 106, 0.3)',
                color: 'var(--gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <SlidersHorizontal size={20} />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
              Cấu hình Trưng bày Trang chủ
            </h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, maxWidth: 780, lineHeight: 1.5 }}>
            Tùy chọn không gian gian phòng 360° và cổ vật 3D đại diện hiển thị cố định trên Trang chủ.
            Hệ thống tuân thủ lựa chọn của quản trị viên và không tự động thay đổi khi thêm mới dữ liệu.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Eye size={14} />
            <span>Xem trước Trang chủ</span>
          </a>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={isSaving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 150, justifyContent: 'center' }}
          >
            <Save size={14} />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}</span>
          </button>
        </div>
      </div>

      {/* Thanh thông tin tóm tắt */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14,
          marginBottom: 24
        }}
      >
        <div
          style={{
            padding: '14px 16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 8
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
            Gian phòng 360° đang trưng bày
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>
            {selectedRoom ? (
              <>
                {selectedRoom.code ? `[${selectedRoom.code}] ` : ''}
                {selectedRoom.name}
              </>
            ) : (
              'Chưa có dữ liệu gian phòng'
            )}
          </span>
          <span style={{ fontSize: 11, color: form.roomsFeaturedId ? 'var(--gold)' : 'var(--text-muted)', marginTop: 4, display: 'block' }}>
            {form.roomsFeaturedId ? 'Đang cố định theo chỉ định' : 'Tự động lấy phòng đầu tiên'}
          </span>
        </div>

        <div
          style={{
            padding: '14px 16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 8
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
            Cổ vật đang trưng bày Trang chủ ({showcaseArtifacts.length} hiện vật)
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {showcaseArtifacts.length > 0 ? (
              showcaseArtifacts.map((a) => a.name).join(' • ')
            ) : (
              'Chưa có dữ liệu cổ vật'
            )}
          </span>
          <span style={{ fontSize: 11, color: form.artifactsFeaturedId ? 'var(--gold)' : 'var(--text-muted)', marginTop: 4, display: 'block' }}>
            {form.artifactsFeaturedId ? `Đang chỉ định ${selectedArtifactIds.length} hiện vật` : `Tự động lấy ${showcaseArtifacts.length} cổ vật 3D mới nhất`}
          </span>
        </div>

        <div
          style={{
            padding: '14px 16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 8
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
            Hình ảnh Kiến trúc & Khuôn viên
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>
            {form.introImageUrl ? 'Đã thiết lập ảnh kiến trúc' : 'Chưa tải ảnh (đang dùng ô trống)'}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
            Hiển thị tại Khối 1 phần giới thiệu
          </span>
        </div>
      </div>

      {/* DANH SÁCH 3 KHỐI TRƯNG BÀY NỔI BẬT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ============================================================ */}
        {/* KHỐI 1: GIAN PHÒNG TOUR 360° TRƯNG BÀY TRANG CHỦ */}
        {/* ============================================================ */}
        <section
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            overflow: 'hidden'
          }}
        >
          {/* Section Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-main)'
                }}
              >
                <Compass size={17} />
              </div>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                  1. Gian phòng Tour 360° Trưng bày Trang chủ
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Khách tham quan sẽ trực tiếp xoay ngắm và khám phá không gian 360° của phòng này tại Trang chủ
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {form.roomsFeaturedId && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleChange('roomsFeaturedId', '')}
                  title="Chuyển về chế độ tự động lấy phòng đầu tiên"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5 }}
                >
                  <RotateCcw size={12} />
                  <span>Đặt lại tự động</span>
                </button>
              )}
            </div>
          </div>

          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(300px, 1fr)', gap: 20 }}>
              {/* Cột trái: Bộ chọn gian phòng */}
              <div>
                {/* Chế độ chọn */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>
                    Cơ chế hiển thị:
                  </label>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: 'var(--text-main)' }}>
                      <input
                        type="radio"
                        name="room_selection_mode"
                        checked={!form.roomsFeaturedId}
                        onChange={() => handleChange('roomsFeaturedId', '')}
                      />
                      <span>Tự động (Lấy gian phòng đầu tiên)</span>
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: 'var(--text-main)' }}>
                      <input
                        type="radio"
                        name="room_selection_mode"
                        checked={Boolean(form.roomsFeaturedId)}
                        onChange={() => {
                          if (!form.roomsFeaturedId && rooms[0]) {
                            handleChange('roomsFeaturedId', rooms[0].id);
                          }
                        }}
                      />
                      <span style={{ fontWeight: 600, color: form.roomsFeaturedId ? 'var(--gold)' : 'inherit' }}>
                        Chỉ định phòng cụ thể (Cố định)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Dropdown & tìm kiếm phòng */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                    Chọn gian phòng đại diện ({rooms.length} phòng sẵn có):
                  </label>
                  <select
                    value={form.roomsFeaturedId || ''}
                    onChange={(e) => handleChange('roomsFeaturedId', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 8,
                      color: 'var(--text-main)',
                      fontSize: 13
                    }}
                  >
                    <option value="">-- Mặc định: Tự động lấy phòng đầu tiên --</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.code ? `[${r.code}] ` : ''}{r.name} {(r as any).period ? `— ${(r as any).period}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bộ lọc nhanh danh sách phòng bên dưới */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        value={roomSearch}
                        onChange={(e) => setRoomSearch(e.target.value)}
                        placeholder="Tìm theo tên hoặc mã gian phòng..."
                        style={{
                          width: '100%',
                          padding: '7px 10px 7px 32px',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 6,
                          color: 'var(--text-main)',
                          fontSize: 12
                        }}
                      />
                    </div>
                  </div>

                  {/* Danh sách phòng dạng thẻ nhỏ */}
                  <div
                    style={{
                      maxHeight: 220,
                      overflowY: 'auto',
                      border: '1px solid var(--border-color)',
                      borderRadius: 8,
                      background: 'var(--bg-surface)',
                      padding: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4
                    }}
                  >
                    {filteredRooms.length === 0 ? (
                      <div style={{ padding: '16px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                        Không tìm thấy gian phòng nào phù hợp
                      </div>
                    ) : (
                      filteredRooms.map((r) => {
                        const isSelected = form.roomsFeaturedId === r.id;
                        return (
                          <div
                            key={r.id}
                            onClick={() => handleChange('roomsFeaturedId', r.id)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: 6,
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(212, 168, 106, 0.12)' : 'transparent',
                              border: isSelected ? '1px solid rgba(212, 168, 106, 0.4)' : '1px solid transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 10,
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                              {r.thumbnailUrl ? (
                                <img
                                  src={getMediaUrl(r.thumbnailUrl)}
                                  alt=""
                                  style={{ width: 38, height: 26, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                                />
                              ) : (
                                <div style={{ width: 38, height: 26, background: 'rgba(255,255,255,0.05)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Compass size={13} style={{ opacity: 0.5 }} />
                                </div>
                              )}
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 12.5, fontWeight: isSelected ? 600 : 500, color: isSelected ? 'var(--gold)' : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {r.code ? `[${r.code}] ` : ''}{r.name}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                  {(r as any).period || 'Gian trưng bày chuyên đề'} • {r.hotspots?.length || 0} điểm chú thích
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <div style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}>
                                <Check size={13} />
                                <span>Đang chọn</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Tuỳ chọn ảnh bìa riêng */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed var(--border-color)' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                    Ảnh bìa đại diện riêng (Tùy chọn - thay thế ảnh 360 mặc định):
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={form.roomsShowcaseImageUrl || ''}
                      onChange={(e) => handleChange('roomsShowcaseImageUrl', e.target.value)}
                      placeholder="Dán link ảnh hoặc bấm tải lên..."
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 6,
                        color: 'var(--text-main)',
                        fontSize: 12.5
                      }}
                    />
                    <input
                      type="file"
                      ref={roomShowcaseInputRef}
                      accept="image/*"
                      onChange={handleUploadRoomShowcase}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => roomShowcaseInputRef.current?.click()}
                      disabled={uploadingRoomShowcase}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}
                    >
                      <Upload size={13} />
                      <span>{uploadingRoomShowcase ? 'Đang tải...' : 'Tải ảnh'}</span>
                    </button>
                    {form.roomsShowcaseImageUrl && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleChange('roomsShowcaseImageUrl', '')}
                        title="Xóa ảnh riêng và dùng ảnh 360 của phòng"
                        style={{ color: '#EF4444' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Cột phải: Khung xem trước gian phòng (Live Preview) */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Xem trước hiển thị Trang chủ</span>
                  <span style={{ fontSize: 11, color: 'var(--gold)' }}>
                    {form.roomsFeaturedId ? 'Cố định theo chỉ định' : 'Mặc định'}
                  </span>
                </div>

                {selectedRoom ? (
                  <div>
                    {/* Media Preview Box */}
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: 180,
                        borderRadius: 6,
                        overflow: 'hidden',
                        background: '#05070A',
                        border: '1px solid var(--border-color)',
                        marginBottom: 12
                      }}
                    >
                      {form.roomsShowcaseImageUrl || selectedRoom.panoramaUrl || selectedRoom.thumbnailUrl ? (
                        <img
                          src={getMediaUrl(form.roomsShowcaseImageUrl || selectedRoom.thumbnailUrl || selectedRoom.panoramaUrl)}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                          <Compass size={24} />
                        </div>
                      )}
                      <div
                        style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          padding: '3px 8px',
                          borderRadius: 4,
                          background: 'rgba(0,0,0,0.75)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: '#FDE68A',
                          fontSize: 10.5,
                          fontWeight: 600
                        }}
                      >
                        Không gian 360° thực tế
                      </div>
                    </div>

                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--heading-color)', marginBottom: 4 }}>
                      {selectedRoom.code ? `[${selectedRoom.code}] ` : ''}{selectedRoom.name}
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.4 }}>
                      {(selectedRoom as any).period || 'Thời kỳ lịch sử'} • {selectedRoom.hotspots?.length || 0} hiện vật và điểm chú thích
                    </div>

                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                      Khách tham quan bấm nút "{form.roomsCtaText || 'Khám phá tất cả gian phòng 360°'}" để vào tour đầy đủ.
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 12 }}>
                    Chưa có dữ liệu gian phòng trong cơ sở dữ liệu.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* KHỐI 2: CỔ VẬT & BẢO VẬT 3D TRƯNG BÀY TRANG CHỦ */}
        {/* ============================================================ */}
        <section
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            overflow: 'hidden'
          }}
        >
          {/* Section Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-main)'
                }}
              >
                <Box size={17} />
              </div>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                  2. Cổ vật & Bảo vật 3D Trưng bày Trang chủ
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Khách tham quan sẽ chiêm ngưỡng các cổ vật di sản và đĩa xoay tương tác 360° tại Trang chủ ({showcaseArtifacts.length} hiện vật đang hiển thị)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {form.artifactsFeaturedId && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleChange('artifactsFeaturedId', '')}
                  title="Chuyển về chế độ tự động lấy cổ vật 3D mới nhất"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5 }}
                >
                  <RotateCcw size={12} />
                  <span>Đặt lại tự động</span>
                </button>
              )}
            </div>
          </div>

          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.25fr) minmax(320px, 1fr)', gap: 20 }}>
              {/* Cột trái: Bộ chọn & sắp xếp cổ vật */}
              <div>
                {/* Chế độ chọn */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>
                    Cơ chế hiển thị Trang chủ:
                  </label>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: 'var(--text-main)' }}>
                      <input
                        type="radio"
                        name="artifact_selection_mode"
                        checked={!form.artifactsFeaturedId}
                        onChange={() => handleChange('artifactsFeaturedId', '')}
                      />
                      <span>Tự động (Lấy {showcaseArtifacts.length} cổ vật 3D mới nhất)</span>
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: 'var(--text-main)' }}>
                      <input
                        type="radio"
                        name="artifact_selection_mode"
                        checked={Boolean(form.artifactsFeaturedId)}
                        onChange={() => {
                          if (!form.artifactsFeaturedId) {
                            handleChange('artifactsFeaturedId', showcaseArtifacts.map((a) => a.id).join(','));
                          }
                        }}
                      />
                      <span style={{ fontWeight: 600, color: form.artifactsFeaturedId ? 'var(--gold)' : 'inherit' }}>
                        Tùy chọn chỉ định ({selectedArtifactIds.length} hiện vật đã chọn)
                      </span>
                    </label>
                  </div>
                </div>

                {/* DANH SÁCH HIỆN VẬT ĐÃ CHỌN (KHI Ở CHẾ ĐỘ CHỈ ĐỊNH) */}
                {Boolean(form.artifactsFeaturedId) && (
                  <div style={{
                    marginBottom: 16,
                    padding: 12,
                    background: 'rgba(212, 168, 106, 0.06)',
                    border: '1px solid rgba(212, 168, 106, 0.25)',
                    borderRadius: 8
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>
                        Thứ tự hiển thị trên Trang chủ ({selectedArtifactIds.length} hiện vật):
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Tối đa 6 hiện vật
                      </span>
                    </div>

                    {showcaseArtifacts.length === 0 ? (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
                        Chưa chọn hiện vật nào. Hãy bấm vào các hiện vật bên dưới để đưa lên Trang chủ.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {showcaseArtifacts.map((art, idx) => (
                          <div
                            key={art.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 10px',
                              background: 'var(--bg-surface)',
                              borderRadius: 6,
                              border: '1px solid var(--border-color)',
                              gap: 10
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                              <span style={{
                                width: 22,
                                height: 22,
                                borderRadius: 11,
                                background: 'var(--gold)',
                                color: '#000',
                                fontSize: 11,
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                {idx + 1}
                              </span>
                              {art.thumbnailUrl || (art.images && art.images[0]) ? (
                                <img
                                  src={getMediaUrl(art.thumbnailUrl || (art.images && art.images[0]))}
                                  alt=""
                                  style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                                />
                              ) : (
                                <Box size={14} style={{ opacity: 0.5 }} />
                              )}
                              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {art.code ? `[${art.code}] ` : ''}{art.name}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                disabled={idx === 0}
                                onClick={() => handleMoveArtifact(idx, 'up')}
                                title="Đưa lên trên"
                                style={{ padding: '3px 6px', height: 'auto', fontSize: 11 }}
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                disabled={idx === showcaseArtifacts.length - 1}
                                onClick={() => handleMoveArtifact(idx, 'down')}
                                title="Đưa xuống dưới"
                                style={{ padding: '3px 6px', height: 'auto', fontSize: 11 }}
                              >
                                <ArrowDown size={12} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => handleRemoveArtifact(art.id)}
                                title="Gỡ khỏi Trang chủ"
                                style={{ padding: '3px 6px', height: 'auto', fontSize: 11, color: '#EF4444' }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Kho tất cả cổ vật để tìm kiếm & tick chọn */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>
                      Kho hiện vật bảo tàng ({artifacts.length} hiện vật sẵn có):
                    </label>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Bấm vào hiện vật để Thêm / Bỏ khỏi Trang chủ
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        value={artifactSearch}
                        onChange={(e) => setArtifactSearch(e.target.value)}
                        placeholder="Tìm theo tên, mã hiện vật, thời kỳ..."
                        style={{
                          width: '100%',
                          padding: '7px 10px 7px 32px',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 6,
                          color: 'var(--text-main)',
                          fontSize: 12
                        }}
                      />
                    </div>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'var(--text-muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      <input
                        type="checkbox"
                        checked={artifactFilter3DOnly}
                        onChange={(e) => setArtifactFilter3DOnly(e.target.checked)}
                      />
                      <span>Chỉ cổ vật có 3D</span>
                    </label>
                  </div>

                  {/* Danh sách hiện vật dạng thẻ nhỏ */}
                  <div
                    style={{
                      maxHeight: 250,
                      overflowY: 'auto',
                      border: '1px solid var(--border-color)',
                      borderRadius: 8,
                      background: 'var(--bg-surface)',
                      padding: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4
                    }}
                  >
                    {filteredArtifacts.length === 0 ? (
                      <div style={{ padding: '16px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                        Không tìm thấy cổ vật nào phù hợp
                      </div>
                    ) : (
                      filteredArtifacts.map((a) => {
                        const isSelected = form.artifactsFeaturedId
                          ? selectedArtifactIds.includes(a.id)
                          : showcaseArtifacts.some((sa) => sa.id === a.id);
                        const selectedIdx = form.artifactsFeaturedId
                          ? selectedArtifactIds.indexOf(a.id)
                          : showcaseArtifacts.findIndex((sa) => sa.id === a.id);
                        const has3D = Boolean(a.model3dUrl);

                        return (
                          <div
                            key={a.id}
                            onClick={() => handleToggleArtifact(a.id)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: 6,
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(212, 168, 106, 0.12)' : 'transparent',
                              border: isSelected ? '1px solid rgba(212, 168, 106, 0.4)' : '1px solid transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 10,
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                              {a.thumbnailUrl || (a.images && a.images[0]) ? (
                                <img
                                  src={getMediaUrl(a.thumbnailUrl || (a.images && a.images[0]))}
                                  alt=""
                                  style={{ width: 34, height: 34, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                                />
                              ) : (
                                <div style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.05)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Box size={14} style={{ opacity: 0.5 }} />
                                </div>
                              )}
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 12.5, fontWeight: isSelected ? 600 : 500, color: isSelected ? 'var(--gold)' : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {a.code ? `[${a.code}] ` : ''}{a.name}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span>{a.period || a.category || 'Di sản lịch sử'}</span>
                                  {has3D && (
                                    <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: 'rgba(212, 168, 106, 0.15)', color: 'var(--gold)' }}>
                                      Mô hình 3D
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div>
                              {isSelected ? (
                                <div style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}>
                                  <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(212, 168, 106, 0.25)', border: '1px solid rgba(212, 168, 106, 0.5)' }}>
                                    Vị trí #{selectedIdx + 1}
                                  </span>
                                  <Check size={13} />
                                </div>
                              ) : (
                                <div style={{ color: 'var(--text-muted)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Plus size={12} />
                                  <span>Thêm</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Tuỳ chọn ảnh bìa riêng */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed var(--border-color)' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                    Ảnh bìa đại diện riêng (Tùy chọn - áp dụng nếu chỉ trưng bày 1 hiện vật duy nhất):
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={form.artifactsShowcaseImageUrl || ''}
                      onChange={(e) => handleChange('artifactsShowcaseImageUrl', e.target.value)}
                      placeholder="Dán link ảnh hoặc bấm tải lên..."
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 6,
                        color: 'var(--text-main)',
                        fontSize: 12.5
                      }}
                    />
                    <input
                      type="file"
                      ref={artifactShowcaseInputRef}
                      accept="image/*"
                      onChange={handleUploadArtifactShowcase}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => artifactShowcaseInputRef.current?.click()}
                      disabled={uploadingArtifactShowcase}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}
                    >
                      <Upload size={13} />
                      <span>{uploadingArtifactShowcase ? 'Đang tải...' : 'Tải ảnh'}</span>
                    </button>
                    {form.artifactsShowcaseImageUrl && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleChange('artifactsShowcaseImageUrl', '')}
                        title="Xóa ảnh riêng và dùng thumbnail hiện vật"
                        style={{ color: '#EF4444' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Cột phải: Khung xem trước cổ vật (Live Preview giống hệt Client Homepage) */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Eye size={13} style={{ color: 'var(--primary)' }} />
                    <span style={{ color: 'var(--text-main)' }}>Xem trước hiển thị Trang chủ</span>
                  </div>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: form.artifactsFeaturedId ? 'rgba(212, 168, 106, 0.15)' : 'rgba(255, 255, 255, 0.05)', color: form.artifactsFeaturedId ? 'var(--gold)' : 'var(--text-muted)', fontWeight: 600 }}>
                    {form.artifactsFeaturedId ? `Chỉ định (${showcaseArtifacts.length} hiện vật)` : `Tự động (${showcaseArtifacts.length} hiện vật 3D)`}
                  </span>
                </div>

                {/* Tiêu đề phân khu thu nhỏ như trên Trang chủ */}
                <div style={{ textAlign: 'center', marginBottom: 14, padding: '10px 12px', background: 'rgba(0,0,0,0.25)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 3 }}>
                    {form.artifactsTag || 'BẢO VẬT DI SẢN & MÔ HÌNH 3D'}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--heading-color)', marginBottom: 4 }}>
                    {form.artifactsTitle || 'Kho Tàng Cổ Vật & Bảo Vật Di Sản'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, maxWidth: 440, margin: '0 auto' }}>
                    {form.artifactsDesc || 'Chiêm ngưỡng các bảo vật quốc gia và hiện vật lịch sử quý giá được phục dựng 3D sắc nét, hỗ trợ xoay đĩa 360° tương tác và hệ thống thuyết minh âm thanh đa ngôn ngữ.'}
                  </div>
                </div>

                {showcaseArtifacts.length > 0 ? (
                  showcaseArtifacts.length === 1 ? (
                    /* DẠNG 1 HIỆN VẬT DUY NHẤT (HERO TEASER) */
                    <div style={{
                      background: 'rgba(18, 15, 12, 0.85)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 8,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <div style={{ position: 'relative', width: '100%', height: 180, background: '#05070A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {getMediaUrl(form.artifactsShowcaseImageUrl || showcaseArtifacts[0].thumbnailUrl || (showcaseArtifacts[0].images && showcaseArtifacts[0].images[0])) ? (
                          <img
                            src={getMediaUrl(form.artifactsShowcaseImageUrl || showcaseArtifacts[0].thumbnailUrl || (showcaseArtifacts[0].images && showcaseArtifacts[0].images[0]))}
                            alt=""
                            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                          />
                        ) : (
                          <Box size={32} style={{ color: 'var(--text-muted)' }} />
                        )}
                        <div style={{ position: 'absolute', top: 8, left: 8, padding: '2px 8px', borderRadius: 4, background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.15)', color: '#FDE68A', fontSize: 10, fontWeight: 600 }}>
                          {showcaseArtifacts[0].model3dUrl ? 'Bảo vật số hóa 3D' : 'Hiện vật di sản'}
                        </div>
                      </div>
                      <div style={{ padding: '12px' }}>
                        <div style={{ fontSize: 10.5, color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>
                          {showcaseArtifacts[0].period || 'Cổ vật di sản'}
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--heading-color)', marginBottom: 4 }}>
                          {showcaseArtifacts[0].code ? `[${showcaseArtifacts[0].code}] ` : ''}{showcaseArtifacts[0].name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 10 }}>
                          {(showcaseArtifacts[0] as any).description || 'Hiện vật quý giá được lưu giữ tại Bảo tàng Lịch sử TP. Hồ Chí Minh...'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                          <span>Chiêm ngưỡng chi tiết hiện vật</span>
                          <ArrowRight size={12} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* DẠNG NHIỀU HIỆN VẬT (LƯỚI CARDS GIỐNG HỆT TRANG CHỦ CLIENT) */
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: 10
                    }}>
                      {showcaseArtifacts.map((art, idx) => {
                        const thumb = getMediaUrl(art.thumbnailUrl || (art.images && art.images[0]));
                        return (
                          <div
                            key={art.id}
                            style={{
                              background: 'rgba(18, 15, 12, 0.85)',
                              border: '1px solid var(--border-color)',
                              borderRadius: 8,
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column',
                              position: 'relative'
                            }}
                          >
                            {/* Thứ tự */}
                            <div style={{
                              position: 'absolute',
                              top: 6,
                              left: 6,
                              zIndex: 2,
                              background: 'rgba(0,0,0,0.85)',
                              border: '1px solid rgba(212, 168, 106, 0.4)',
                              color: 'var(--gold)',
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: 4
                            }}>
                              #{idx + 1}
                            </div>

                            {/* Khối Media ảnh */}
                            <div style={{
                              position: 'relative',
                              width: '100%',
                              height: 120,
                              background: '#07090c',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {thumb ? (
                                <img
                                  src={thumb}
                                  alt={art.name}
                                  style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                                />
                              ) : (
                                <Box size={24} style={{ color: 'var(--text-muted)' }} />
                              )}
                              {art.model3dUrl && (
                                <div style={{
                                  position: 'absolute',
                                  top: 6,
                                  right: 6,
                                  background: 'rgba(212, 168, 106, 0.25)',
                                  border: '1px solid rgba(212, 168, 106, 0.6)',
                                  color: '#FDE68A',
                                  fontSize: 9.5,
                                  fontWeight: 700,
                                  padding: '1px 5px',
                                  borderRadius: 3
                                }}>
                                  3D Scan
                                </div>
                              )}
                            </div>

                            {/* Thân thẻ */}
                            <div style={{ padding: '8px 10px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <div style={{
                                fontSize: 10,
                                color: 'var(--text-muted)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                marginBottom: 2
                              }}>
                                {art.period || 'Cổ vật di sản'}
                              </div>
                              <div style={{
                                fontSize: 11.5,
                                fontWeight: 600,
                                color: 'var(--heading-color)',
                                lineHeight: 1.3,
                                marginBottom: 6,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                minHeight: 30
                              }} title={art.name}>
                                {art.name}
                              </div>
                              <div style={{
                                marginTop: 'auto',
                                fontSize: 10.5,
                                color: 'var(--gold)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                                fontWeight: 600
                              }}>
                                <span>Chiêm ngưỡng</span>
                                <ArrowRight size={10} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 12 }}>
                    Chưa có dữ liệu cổ vật trong cơ sở dữ liệu.
                  </div>
                )}

                {/* Nút Khám phá toàn bộ ở chân Preview */}
                <div style={{ textAlign: 'center', marginTop: 14 }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--text-main)',
                    fontSize: 11,
                    fontWeight: 600
                  }}>
                    {form.artifactsCtaText || `Khám phá toàn bộ kho hiện vật (${artifacts.length})`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* KHỐI 3: KIẾN TRÚC & KHUÔN VIÊN BẢO TÀNG (KHỐI GIỚI THIỆU) */}
        {/* ============================================================ */}
        <section
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            overflow: 'hidden'
          }}
        >
          {/* Section Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-main)'
                }}
              >
                <Image size={17} />
              </div>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                  3. Kiến Trúc & Khuôn Viên Bảo Tàng (Khối Giới thiệu Trang chủ)
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Hình ảnh công trình kiến trúc bảo tàng hiển thị tại Khối 1 phần giới thiệu
                </span>
              </div>
            </div>
          </div>

          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(300px, 1fr)', gap: 20 }}>
              {/* Cột trái: Cài đặt thông tin khối kiến trúc */}
              <div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                    Ảnh chụp kiến trúc bảo tàng:
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={form.introImageUrl || ''}
                      onChange={(e) => handleChange('introImageUrl', e.target.value)}
                      placeholder="Dán link ảnh hoặc bấm tải lên..."
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 6,
                        color: 'var(--text-main)',
                        fontSize: 12.5
                      }}
                    />
                    <input
                      type="file"
                      ref={introInputRef}
                      accept="image/*"
                      onChange={handleUploadIntro}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => introInputRef.current?.click()}
                      disabled={uploadingIntro}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}
                    >
                      <Upload size={13} />
                      <span>{uploadingIntro ? 'Đang tải...' : 'Tải ảnh kiến trúc'}</span>
                    </button>
                    {form.introImageUrl && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleChange('introImageUrl', '')}
                        title="Xóa ảnh"
                        style={{ color: '#EF4444' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    Khuyên dùng ảnh tỷ lệ 16:9 hoặc 4:3, độ phân giải sắc nét từ 1920x1080.
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 5 }}>
                      Dòng nhãn phụ (Tag):
                    </label>
                    <input
                      type="text"
                      value={form.introTag || ''}
                      onChange={(e) => handleChange('introTag', e.target.value)}
                      placeholder="Kiến Trúc & Không Gian"
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 6,
                        color: 'var(--text-main)',
                        fontSize: 12.5
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 5 }}>
                      Huy hiệu nổi góc ảnh:
                    </label>
                    <input
                      type="text"
                      value={form.introBadgeText || ''}
                      onChange={(e) => handleChange('introBadgeText', e.target.value)}
                      placeholder="Di tích Kiến trúc Nghệ thuật Cấp Quốc gia"
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 6,
                        color: 'var(--text-main)',
                        fontSize: 12.5
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 5 }}>
                    Bài viết giới thiệu kiến trúc:
                  </label>
                  <textarea
                    rows={3}
                    value={form.introDesc || ''}
                    onChange={(e) => handleChange('introDesc', e.target.value)}
                    placeholder="Mô tả công trình kiến trúc bảo tàng..."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 6,
                      color: 'var(--text-main)',
                      fontSize: 12.5,
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              {/* Cột phải: Khung xem trước kiến trúc (Live Preview) */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>
                  Xem trước ảnh kiến trúc
                </div>

                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: 180,
                    borderRadius: 6,
                    overflow: 'hidden',
                    background: '#05070A',
                    border: '1px solid var(--border-color)',
                    marginBottom: 12
                  }}
                >
                  {form.introImageUrl ? (
                    <img
                      src={getMediaUrl(form.introImageUrl)}
                      alt="Kiến trúc Bảo tàng"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 6, padding: 16, textAlign: 'center' }}>
                      <Image size={24} />
                      <span style={{ fontSize: 11 }}>Chưa có ảnh (Trang chủ sẽ hiển thị thông báo chưa bổ sung hình ảnh)</span>
                    </div>
                  )}

                  {form.introBadgeText && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: 'rgba(0,0,0,0.75)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: 'var(--text-main)',
                        fontSize: 10.5,
                        fontWeight: 600
                      }}
                    >
                      {form.introBadgeText}
                    </div>
                  )}
                </div>

                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--heading-color)', marginBottom: 4 }}>
                  {form.introTitle || form.museumName || 'Bảo Tàng Lịch Sử TP. Hồ Chí Minh'}
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {form.introDesc ? (form.introDesc.slice(0, 140) + '...') : 'Chưa có đoạn văn giới thiệu.'}
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Nút lưu ở chân trang */}
      <div
        style={{
          marginTop: 28,
          paddingTop: 18,
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {isDirty ? 'Có thay đổi chưa được lưu.' : 'Tất cả cấu hình trưng bày đã được đồng bộ.'}
        </span>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isSaving}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 160, justifyContent: 'center' }}
        >
          <Save size={14} />
          <span>{isSaving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}</span>
        </button>
      </div>
    </div>
  );
};
