import React, { useState, useEffect } from 'react';
import { MuseumArtifact, MuseumRoom } from '../../types';
import { api, API_BASE, API_ROOT, formatMediaUrl } from '../../services/api';
import { Turntable360Viewer } from '../../components/Turntable360Viewer';
import { AIVoiceNarrator } from '../../components/AIVoiceNarrator';
import {
  Box, Plus, Search, QrCode, Eye, Trash2, Edit3, Download, ExternalLink,
  Upload, X, Check, Loader2, Sparkles, ShieldCheck, MapPin, Calendar, Film
} from 'lucide-react';

interface AdminArtifactsPageProps {
  rooms: MuseumRoom[];
  onOpenStudio?: (room: MuseumRoom) => void;
  onPreviewPublicArtifact?: (artifactId: string) => void;
}

export const AdminArtifactsPage: React.FC<AdminArtifactsPageProps> = ({
  rooms,
  onOpenStudio,
  onPreviewPublicArtifact
}) => {
  const [artifacts, setArtifacts] = useState<MuseumArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRoom, setFilterRoom] = useState<string>('all');

  // Modals
  const [selectedArtifact, setSelectedArtifact] = useState<MuseumArtifact | null>(null);
  const [view3DModalOpen, setView3DModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [form, setForm] = useState<Partial<MuseumArtifact>>({
    code: '',
    name: '',
    period: '',
    roomId: '',
    material: '',
    dimensions: '',
    origin: '',
    description: '',
    audioText: '',
    thumbnailUrl: '',
    images360: [],
    featured: false
  });
  const [uploadingFrames, setUploadingFrames] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load all artifacts
  const loadArtifacts = async () => {
    try {
      setLoading(true);
      const data = await api.getArtifacts();
      setArtifacts(data);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tải danh sách hiện vật');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtifacts();
  }, []);

  // Filtered list
  const filtered = artifacts.filter(a => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase()) ||
      a.period.toLowerCase().includes(search.toLowerCase());
    const matchRoom = filterRoom === 'all' || a.roomId === filterRoom;
    return matchSearch && matchRoom;
  });

  // Open Create Modal
  const handleOpenView3D = (art: MuseumArtifact) => {
    setSelectedArtifact(art);
    setQrModalOpen(false);
    setEditModalOpen(false);
    setView3DModalOpen(true);
  };

  const handleOpenQr = (art: MuseumArtifact) => {
    setSelectedArtifact(art);
    setView3DModalOpen(false);
    setEditModalOpen(false);
    setQrModalOpen(true);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsCreating(true);
    setView3DModalOpen(false);
    setQrModalOpen(false);
    setForm({
      code: `HV-${Date.now().toString().slice(-4)}`,
      name: '',
      period: 'Thời kỳ Cổ đại',
      roomId: rooms[0]?.id || '',
      material: 'Đồng / Gỗ / Gốm',
      dimensions: '',
      origin: 'Bảo tàng Lịch sử TP. Hồ Chí Minh',
      description: '',
      audioText: '',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=600&q=80',
      images360: [],
      featured: false
    });
    setEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (art: MuseumArtifact) => {
    setIsCreating(false);
    setSelectedArtifact(art);
    setView3DModalOpen(false);
    setQrModalOpen(false);
    setForm({ ...art });
    setEditModalOpen(true);
  };

  const [generating3DId, setGenerating3DId] = useState<string | null>(null);
  const [isGeneratingForm3D, setIsGeneratingForm3D] = useState(false);
  const [autoGenerate3D, setAutoGenerate3D] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Upload 1 ảnh chụp hiện vật (mặt trước qua tủ kính)
  const handleSinglePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      const res = await api.uploadArtifactPhoto(file);
      setForm(prev => ({
        ...prev,
        thumbnailUrl: res.url,
        images360: [res.url]
      }));
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tải ảnh hiện vật');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Sinh mô hình 3D từ ảnh cho một hiện vật bất kỳ
  const handleGenerate3DMeshForArtifact = async (art: MuseumArtifact) => {
    try {
      setGenerating3DId(art.id);
      const imgUrl = art.thumbnailUrl || (art.images360 && art.images360[0]);
      if (!imgUrl) {
        alert('Hiện vật cần có ít nhất một ảnh để tạo mô hình 3D');
        return;
      }
      const res = await api.generate3DMesh({
        imageUrl: imgUrl,
        artifactId: art.id,
        depthScale: 0.35,
        resolution: 150
      });
      setArtifacts(prev => prev.map(a => a.id === art.id ? { ...a, model3dUrl: res.model3dUrl } : a));
      alert(`Đã tạo thành công mô hình 3D thực thụ (.GLB) với ${res.vertices.toLocaleString()} đỉnh và ${res.faces.toLocaleString()} mặt đa giác! Bấm "Xem 3D" để chiêm ngưỡng.`);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo mô hình 3D');
    } finally {
      setGenerating3DId(null);
    }
  };

  // Sinh mô hình 3D từ form đang tạo/sửa
  const handleGenerateForm3D = async () => {
    try {
      const imgUrl = form.thumbnailUrl || (form.images360 && form.images360[0]);
      if (!imgUrl) {
        alert('Vui lòng tải ảnh hiện vật lên trước khi tạo 3D');
        return;
      }
      setIsGeneratingForm3D(true);
      const res = await api.generate3DMesh({
        imageUrl: imgUrl,
        depthScale: 0.35,
        resolution: 150
      });
      setForm(prev => ({ ...prev, model3dUrl: res.model3dUrl }));
      alert(`Đã dựng xong khối 3D (.GLB) với ${res.vertices.toLocaleString()} đỉnh và ${res.faces.toLocaleString()} mặt đa giác!`);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo mô hình 3D');
    } finally {
      setIsGeneratingForm3D(false);
    }
  };

  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await api.uploadArtifactModel(file);
      setForm(prev => ({ ...prev, model3dUrl: res.url }));
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tải file 3D');
    }
  };

  // Save Artifact
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code) {
      alert('Vui lòng nhập Tên và Mã hiện vật');
      return;
    }

    try {
      setSaving(true);
      let payload = { ...form };

      // Tự động tạo giọng đọc thuyết minh nếu chưa nhập riêng
      if (!payload.audioText && payload.description) {
        payload.audioText = payload.description;
      }

      // Tự động tạo 3D từ ảnh nếu có ảnh và chọn autoGenerate3D nhưng chưa có file 3D
      if (autoGenerate3D && !payload.model3dUrl && payload.thumbnailUrl) {
        try {
          const res3d = await api.generate3DMesh({
            imageUrl: payload.thumbnailUrl,
            depthScale: 0.35,
            resolution: 150
          });
          payload.model3dUrl = res3d.model3dUrl;
        } catch (meshErr: any) {
          console.warn('Lỗi sinh 3D tự động khi lưu:', meshErr);
        }
      }

      if (isCreating) {
        const created = await api.createArtifact(payload);
        setArtifacts(prev => [...prev, created]);
      } else if (selectedArtifact) {
        const updated = await api.updateArtifact(selectedArtifact.id, payload);
        setArtifacts(prev => prev.map(a => a.id === updated.id ? updated : a));
      }
      setEditModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu thông tin hiện vật');
    } finally {
      setSaving(false);
    }
  };

  // Delete Artifact
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa hiện vật "${name}" không?`)) return;
    try {
      await api.deleteArtifact(id);
      setArtifacts(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa hiện vật');
    }
  };

  // Upload Turntable Multiple Frames
  const handleFramesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingFrames(true);
      const res = await api.uploadArtifactFrames(Array.from(files));
      setForm(prev => ({
        ...prev,
        images360: res.images,
        thumbnailUrl: res.thumbnail || prev.thumbnailUrl
      }));
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tải chuỗi ảnh mâm xoay');
    } finally {
      setUploadingFrames(false);
    }
  };

  return (
    <div className="admin-content" style={{ padding: 24, maxWidth: 1280, margin: '0 auto' }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Quản lý Hiện vật & Cổ vật di sản
            </h2>
            <span
              style={{
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '2px 8px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 700
              }}
            >
              {artifacts.length} hiện vật
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Số hóa hiện vật 3D trên mâm xoay 360°, tạo mã QR in dán tại bảo tàng và thuyết minh AI
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleOpenCreate}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Plus size={16} />
          <span>Thêm Hiện vật 3D mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="panel"
        style={{
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Tìm theo tên hiện vật, mã hoặc thời kỳ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36, width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Phòng trưng bày:</span>
          <select
            className="input"
            value={filterRoom}
            onChange={e => setFilterRoom(e.target.value)}
            style={{ minWidth: 180 }}
          >
            <option value="all">Tất cả gian phòng</option>
            {rooms.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Artifacts Grid */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px', color: 'var(--primary)' }} />
          <div>Đang nạp danh sách cổ vật di sản...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
          <Box size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p style={{ fontSize: 15, fontWeight: 600 }}>Không tìm thấy hiện vật nào</p>
          <p style={{ fontSize: 13 }}>Hãy tạo hiện vật mới hoặc thay đổi bộ lọc tìm kiếm.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20
          }}
        >
          {filtered.map(art => {
            const roomObj = rooms.find(r => r.id === art.roomId);
            const framesCount = art.images360 ? art.images360.length : 0;

            return (
              <div
                key={art.id}
                className="panel"
                style={{
                  borderRadius: 14,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative'
                }}
              >
                {/* Image & Badges */}
                <div style={{ position: 'relative', height: 200, background: '#111827', overflow: 'hidden' }}>
                  <img
                    src={art.thumbnailUrl || art.images360[0]}
                    alt={art.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }}
                  />

                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
                    <span
                      style={{
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(4px)',
                        color: '#F59E0B',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6
                      }}
                    >
                      {art.code}
                    </span>

                    {art.featured && (
                      <span
                        style={{
                          background: '#8B1818',
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3
                        }}
                      >
                        <Sparkles size={11} />
                        Bảo vật QG
                      </span>
                    )}
                  </div>

                  <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
                    <span
                      style={{
                        background: 'rgba(0,0,0,0.75)',
                        backdropFilter: 'blur(4px)',
                        color: '#E5E7EB',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 20,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Film size={11} color="#F59E0B" />
                      {framesCount > 0 ? `${framesCount} góc 360°` : 'Ảnh đơn'}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6, lineHeight: 1.3 }}>
                    {art.name}
                  </h3>

                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={13} color="var(--primary)" />
                    <span>{art.period}</span>
                  </div>

                  {roomObj && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={13} color="#D97706" />
                      <span style={{ fontWeight: 500 }}>{roomObj.name}</span>
                    </div>
                  )}

                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--text-main)',
                      opacity: 0.85,
                      lineHeight: 1.5,
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginBottom: 16
                    }}
                  >
                    {art.description}
                  </p>

                  {/* Actions Footer */}
                  <div
                    style={{
                      marginTop: 'auto',
                      borderTop: '1px solid var(--border)',
                      paddingTop: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8
                    }}
                  >
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleOpenView3D(art)}
                        style={{ padding: '6px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                        title="Trình chiếu mâm xoay 360°"
                      >
                        <Eye size={14} />
                        <span>Xem 3D</span>
                      </button>

                      <button
                        className="btn btn-secondary"
                        onClick={() => handleOpenQr(art)}
                        style={{ padding: '6px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                        title="Xem và tải mã QR"
                      >
                        <QrCode size={14} color="var(--primary)" />
                        <span>Mã QR</span>
                      </button>

                      {art.model3dUrl ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '4px 8px',
                            borderRadius: 6,
                            background: 'rgba(217, 119, 6, 0.15)',
                            color: '#d97706',
                            border: '1px solid rgba(217, 119, 6, 0.3)'
                          }}
                          title="Hiện vật đã có mô hình 3D thực thể .GLB"
                        >
                          <Box size={13} />
                          <span>3D GLB</span>
                        </span>
                      ) : (
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleGenerate3DMeshForArtifact(art)}
                          disabled={generating3DId === art.id}
                          style={{
                            padding: '4px 8px',
                            fontSize: 11,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            color: '#d97706',
                            borderColor: 'rgba(217, 119, 6, 0.4)',
                            background: 'rgba(217, 119, 6, 0.08)'
                          }}
                          title="Tự động bóc tách độ sâu và tạo file 3D (.GLB) từ ảnh"
                        >
                          {generating3DId === art.id ? <Loader2 size={13} className="spin" /> : <Sparkles size={13} />}
                          <span>{generating3DId === art.id ? 'Đang dựng...' : 'Tạo 3D'}</span>
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="icon-btn"
                        onClick={() => handleOpenEdit(art)}
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        className="icon-btn danger"
                        onClick={() => handleDelete(art.id, art.name)}
                        title="Xóa hiện vật"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL: XEM 3D TURNTABLE TRƯỚC ================= */}
      {view3DModalOpen && selectedArtifact && (
        <div className="modal-overlay" onClick={() => setView3DModalOpen(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: 780, width: '95%', padding: 20 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  Trình diễn 3D Mâm Xoay 360°: {selectedArtifact.name}
                </h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mã hiện vật: {selectedArtifact.code}</span>
              </div>
              <button className="icon-btn" onClick={() => setView3DModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <Turntable360Viewer
              images={selectedArtifact.images360 && selectedArtifact.images360.length > 0 ? selectedArtifact.images360 : [selectedArtifact.thumbnailUrl]}
              model3dUrl={selectedArtifact.model3dUrl}
              title={selectedArtifact.name}
              height={420}
            />

            <div style={{ marginTop: 16 }}>
              <AIVoiceNarrator
                text={selectedArtifact.audioText || selectedArtifact.description}
                title={`Thuyết minh: ${selectedArtifact.name}`}
              />
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              {onPreviewPublicArtifact && (
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setView3DModalOpen(false);
                    onPreviewPublicArtifact(selectedArtifact.id);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <ExternalLink size={15} />
                  <span>Mở giao diện Du khách</span>
                </button>
              )}
              <button className="btn btn-primary" onClick={() => setView3DModalOpen(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: MÃ QR CODE IN ẤN ================= */}
      {qrModalOpen && selectedArtifact && (
        <div className="modal-overlay" onClick={() => setQrModalOpen(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: 460, width: '95%', textAlign: 'center', padding: 24 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>
                Mã QR Hiện vật Bảo tàng
              </h3>
              <button className="icon-btn" onClick={() => setQrModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              In mã QR này để dán tại tủ kính hiện vật <strong>{selectedArtifact.name}</strong>. Khi du khách quét, máy tính hoặc điện thoại sẽ mở trực tiếp trang trình diễn 3D.
            </p>

            {/* QR Card Frame */}
            <div
              style={{
                background: '#fff',
                padding: 20,
                borderRadius: 16,
                display: 'inline-block',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                border: '2px solid #8B1818',
                marginBottom: 20
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: '#8B1818', letterSpacing: '0.5px', marginBottom: 8 }}>
                BẢO TÀNG LỊCH SỬ TP.HCM
              </div>

              {selectedArtifact.qrCodeDataUrl ? (
                <img
                  src={selectedArtifact.qrCodeDataUrl}
                  alt={`QR ${selectedArtifact.name}`}
                  style={{ width: 240, height: 240, display: 'block', margin: '0 auto' }}
                />
              ) : (
                <div style={{ width: 240, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 size={24} className="spin" />
                </div>
              )}

              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: '#111827' }}>
                {selectedArtifact.name}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>
                Mã: {selectedArtifact.code}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <a
                href={`${API_BASE}/artifacts/${selectedArtifact.id}/qr-download`}
                download={`QR_${selectedArtifact.code}.png`}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
              >
                <Download size={15} />
                <span>Tải PNG Khổ Lớn Để In</span>
              </a>

              {onPreviewPublicArtifact && (
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setQrModalOpen(false);
                    onPreviewPublicArtifact(selectedArtifact.id);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <ExternalLink size={15} />
                  <span>Mở thử trang khách</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: THÊM / SỬA HIỆN VẬT ================= */}
      {editModalOpen && (
        <div className="modal-backdrop" onClick={() => setEditModalOpen(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: 620, width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Box size={20} color="var(--primary)" />
                <h3 className="modal-title" style={{ margin: 0, fontSize: 16 }}>
                  {isCreating ? 'Thêm Hiện vật Di sản Mới' : 'Chỉnh sửa Hiện vật Di sản'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ maxHeight: 'calc(85vh - 120px)', overflowY: 'auto', padding: '18px 20px', gap: 12 }}>
                {/* Row 1: Mã & Tên */}
                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Mã hiện vật (*)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.code || ''}
                      onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                      placeholder="VD: BV-01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tên hiện vật (*)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.name || ''}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="VD: Tượng Phật Gỗ Cổ Óc Eo"
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Niên đại & Gian phòng */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Niên đại / Thời kỳ</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.period || ''}
                      onChange={e => setForm(f => ({ ...f, period: e.target.value }))}
                      placeholder="VD: Thế kỷ IV - Văn hóa Óc Eo"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gian phòng trưng bày Tour 360</label>
                    <select
                      className="form-control"
                      value={form.roomId || ''}
                      onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))}
                    >
                      <option value="">-- Chưa gắn vào phòng --</option>
                      {rooms.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Chất liệu & Kích thước */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Chất liệu</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.material || ''}
                      onChange={e => setForm(f => ({ ...f, material: e.target.value }))}
                      placeholder="VD: Đồng đúc / Gỗ sao"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kích thước</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.dimensions || ''}
                      onChange={e => setForm(f => ({ ...f, dimensions: e.target.value }))}
                      placeholder="VD: Cao 220cm, Rộng 60cm"
                    />
                  </div>
                </div>

                {/* Row 4: Xuất xứ */}
                <div className="form-group">
                  <label className="form-label">Xuất xứ khai quật / Nguồn gốc</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.origin || ''}
                    onChange={e => setForm(f => ({ ...f, origin: e.target.value }))}
                    placeholder="VD: Khai quật tại Giồng Xoài, Thoại Sơn, An Giang"
                  />
                </div>

                {/* Row 5: Mô tả */}
                <div className="form-group">
                  <label className="form-label">Mô tả lịch sử & Ý nghĩa khảo cổ</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.description || ''}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value, audioText: e.target.value }))}
                    placeholder="Nội dung lịch sử giới thiệu hiện vật (đồng thời dùng cho AI Voice đọc thuyết minh cho du khách)..."
                  />
                </div>

                {/* Row 6: Ảnh chụp hiện vật & Tự động 3D */}
                <div className="form-group">
                  <label className="form-label">Ảnh chụp hiện vật (Mặt trước qua tủ kính)</label>
                  <div
                    style={{
                      border: '1.5px dashed var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: 14,
                      background: '#FAFAFA',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14
                    }}
                  >
                    {/* Thumbnail Preview */}
                    {form.thumbnailUrl ? (
                      <div style={{ position: 'relative', width: 68, height: 68, flexShrink: 0 }}>
                        <img
                          src={formatMediaUrl(form.thumbnailUrl)}
                          alt="Thumbnail"
                          style={{ width: 68, height: 68, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-color)' }}
                        />
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, thumbnailUrl: '', images360: [], model3dUrl: undefined }))}
                          style={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: 18,
                            height: 18,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: 10,
                            lineHeight: 1
                          }}
                          title="Xóa ảnh"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          width: 68,
                          height: 68,
                          borderRadius: 8,
                          background: '#f1f5f9',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-muted)',
                          flexShrink: 0
                        }}
                      >
                        <Upload size={18} />
                        <span style={{ fontSize: 10, marginTop: 4 }}>Chưa có ảnh</span>
                      </div>
                    )}

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                        <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '6px 12px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {uploadingPhoto ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
                          <span>{form.thumbnailUrl ? 'Đổi ảnh chụp' : 'Chọn ảnh hiện vật'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSinglePhotoUpload}
                            style={{ display: 'none' }}
                            disabled={uploadingPhoto}
                          />
                        </label>

                        {form.model3dUrl ? (
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Check size={14} />
                            <span>Đã có khối 3D (.GLB)</span>
                          </span>
                        ) : (
                          <label style={{ fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}>
                            <span>Tải file .glb có sẵn (nếu có)</span>
                            <input
                              type="file"
                              accept=".glb,.gltf"
                              onChange={handleModelUpload}
                              style={{ display: 'none' }}
                            />
                          </label>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type="checkbox"
                          id="auto-gen-3d-toggle"
                          checked={autoGenerate3D}
                          onChange={e => setAutoGenerate3D(e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                        <label htmlFor="auto-gen-3d-toggle" style={{ fontSize: 12, color: 'var(--text-main)', cursor: 'pointer', userSelect: 'none' }}>
                          ✨ Tự động bóc tách độ sâu & tạo file 3D (.GLB) khi lưu
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Featured Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <input
                    type="checkbox"
                    id="featured-checkbox"
                    checked={form.featured || false}
                    onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="featured-checkbox" style={{ fontSize: 12.5, fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
                    ⭐ Đánh dấu là Bảo vật Quốc gia / Hiện vật tiêu biểu
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditModalOpen(false)}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || uploadingPhoto}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {saving ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
                  <span>{saving ? 'Đang tạo 3D & Lưu...' : (isCreating ? 'Tạo hiện vật & Sinh mã QR' : 'Lưu thay đổi')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
