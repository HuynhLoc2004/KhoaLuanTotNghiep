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
  Eye
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

  // Cổ vật hiện đang được chọn
  const selectedArtifact = useMemo(() => {
    if (form.artifactsFeaturedId) {
      return (
        artifacts.find(
          (a) =>
            a.id === form.artifactsFeaturedId ||
            (a as any)._id === form.artifactsFeaturedId ||
            (a as any).code === form.artifactsFeaturedId
        ) || null
      );
    }
    // Mặc định: hiện vật có 3D đầu tiên
    const has3D = artifacts.find((a) => !!a.model3dUrl);
    return has3D || artifacts[0] || null;
  }, [artifacts, form.artifactsFeaturedId]);

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
            Cổ vật 3D đang trưng bày
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>
            {selectedArtifact ? (
              <>
                {selectedArtifact.code ? `[${selectedArtifact.code}] ` : ''}
                {selectedArtifact.name}
              </>
            ) : (
              'Chưa có dữ liệu cổ vật'
            )}
          </span>
          <span style={{ fontSize: 11, color: form.artifactsFeaturedId ? 'var(--gold)' : 'var(--text-muted)', marginTop: 4, display: 'block' }}>
            {form.artifactsFeaturedId ? 'Đang cố định theo chỉ định' : 'Tự động lấy cổ vật 3D mới nhất'}
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
                  Khách tham quan sẽ chiêm ngưỡng đĩa xoay tương tác 360° của cổ vật này tại Trang chủ
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
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(300px, 1fr)', gap: 20 }}>
              {/* Cột trái: Bộ chọn cổ vật */}
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
                        name="artifact_selection_mode"
                        checked={!form.artifactsFeaturedId}
                        onChange={() => handleChange('artifactsFeaturedId', '')}
                      />
                      <span>Tự động (Lấy cổ vật 3D mới nhất)</span>
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: 'var(--text-main)' }}>
                      <input
                        type="radio"
                        name="artifact_selection_mode"
                        checked={Boolean(form.artifactsFeaturedId)}
                        onChange={() => {
                          if (!form.artifactsFeaturedId && artifacts[0]) {
                            handleChange('artifactsFeaturedId', artifacts[0].id);
                          }
                        }}
                      />
                      <span style={{ fontWeight: 600, color: form.artifactsFeaturedId ? 'var(--gold)' : 'inherit' }}>
                        Chỉ định cổ vật cụ thể (Cố định)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Dropdown & tìm kiếm cổ vật */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
                    Chọn cổ vật đại diện ({artifacts.length} hiện vật sẵn có):
                  </label>
                  <select
                    value={form.artifactsFeaturedId || ''}
                    onChange={(e) => handleChange('artifactsFeaturedId', e.target.value)}
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
                    <option value="">-- Mặc định: Tự động lấy cổ vật 3D mới nhất --</option>
                    {artifacts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code ? `[${a.code}] ` : ''}{a.name} {a.model3dUrl ? '(Có mô hình 3D)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bộ lọc nhanh danh sách cổ vật */}
                <div>
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
                    {filteredArtifacts.length === 0 ? (
                      <div style={{ padding: '16px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                        Không tìm thấy cổ vật nào phù hợp
                      </div>
                    ) : (
                      filteredArtifacts.map((a) => {
                        const isSelected = form.artifactsFeaturedId === a.id;
                        const has3D = Boolean(a.model3dUrl);
                        return (
                          <div
                            key={a.id}
                            onClick={() => handleChange('artifactsFeaturedId', a.id)}
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
                    Ảnh bìa đại diện riêng (Tùy chọn - thay thế thumbnail mặc định):
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

              {/* Cột phải: Khung xem trước cổ vật (Live Preview) */}
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
                    {form.artifactsFeaturedId ? 'Cố định theo chỉ định' : 'Mặc định'}
                  </span>
                </div>

                {selectedArtifact ? (
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
                        marginBottom: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {form.artifactsShowcaseImageUrl || selectedArtifact.thumbnailUrl || (selectedArtifact.images && selectedArtifact.images[0]) ? (
                        <img
                          src={getMediaUrl(form.artifactsShowcaseImageUrl || selectedArtifact.thumbnailUrl || (selectedArtifact.images && selectedArtifact.images[0]))}
                          alt=""
                          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <Box size={32} style={{ color: 'var(--text-muted)' }} />
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
                        {selectedArtifact.model3dUrl ? 'Mô hình 3D tương tác' : 'Ảnh hiện vật 2D'}
                      </div>
                    </div>

                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--heading-color)', marginBottom: 4 }}>
                      {selectedArtifact.code ? `[${selectedArtifact.code}] ` : ''}{selectedArtifact.name}
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.4 }}>
                      {selectedArtifact.period || 'Thời kỳ di sản'} • Phân loại: {selectedArtifact.category || 'Hiện vật quý'}
                    </div>

                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                      Khách tham quan bấm nút "{form.artifactsCtaText || 'Khám phá toàn bộ kho hiện vật'}" để tra cứu hồ sơ hiện vật.
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 12 }}>
                    Chưa có dữ liệu cổ vật trong cơ sở dữ liệu.
                  </div>
                )}
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
