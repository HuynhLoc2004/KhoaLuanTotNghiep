import React, { useState, useEffect } from 'react';
import { MuseumArtifact, MuseumRoom } from '../../types';
import { api, API_BASE, API_ROOT } from '../../services/api';
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
  const handleOpenCreate = () => {
    setIsCreating(true);
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
    setForm({ ...art });
    setEditModalOpen(true);
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
      if (isCreating) {
        const created = await api.createArtifact(form);
        setArtifacts(prev => [...prev, created]);
      } else if (selectedArtifact) {
        const updated = await api.updateArtifact(selectedArtifact.id, form);
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
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setSelectedArtifact(art);
                          setView3DModalOpen(true);
                        }}
                        style={{ padding: '6px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                        title="Trình chiếu mâm xoay 360°"
                      >
                        <Eye size={14} />
                        <span>Xem 3D</span>
                      </button>

                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setSelectedArtifact(art);
                          setQrModalOpen(true);
                        }}
                        style={{ padding: '6px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                        title="Xem và tải mã QR"
                      >
                        <QrCode size={14} color="var(--primary)" />
                        <span>Mã QR</span>
                      </button>
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
        <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: 700, width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: 24 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                {isCreating ? 'Thêm Hiện vật 3D mới' : 'Chỉnh sửa Hiện vật di sản'}
              </h3>
              <button className="icon-btn" onClick={() => setEditModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="label">Mã hiện vật (*)</label>
                  <input
                    type="text"
                    className="input"
                    value={form.code || ''}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                    placeholder="VD: BV-OCEO-01"
                    required
                  />
                </div>

                <div>
                  <label className="label">Tên hiện vật (*)</label>
                  <input
                    type="text"
                    className="input"
                    value={form.name || ''}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="VD: Tượng Phật Gỗ Cổ Óc Eo"
                    required
                  />
                </div>

                <div>
                  <label className="label">Niên đại / Thời kỳ</label>
                  <input
                    type="text"
                    className="input"
                    value={form.period || ''}
                    onChange={e => setForm(f => ({ ...f, period: e.target.value }))}
                    placeholder="VD: Thế kỷ IV - Văn hóa Óc Eo"
                  />
                </div>

                <div>
                  <label className="label">Gian phòng trưng bày Tour 360</label>
                  <select
                    className="input"
                    value={form.roomId || ''}
                    onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))}
                  >
                    <option value="">-- Chưa gắn vào phòng --</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Chất liệu</label>
                  <input
                    type="text"
                    className="input"
                    value={form.material || ''}
                    onChange={e => setForm(f => ({ ...f, material: e.target.value }))}
                    placeholder="VD: Đồng đúc / Gỗ sao"
                  />
                </div>

                <div>
                  <label className="label">Kích thước</label>
                  <input
                    type="text"
                    className="input"
                    value={form.dimensions || ''}
                    onChange={e => setForm(f => ({ ...f, dimensions: e.target.value }))}
                    placeholder="VD: Cao 220cm, Rộng 60cm"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="label">Xuất xứ khai quật / Nguồn gốc</label>
                <input
                  type="text"
                  className="input"
                  value={form.origin || ''}
                  onChange={e => setForm(f => ({ ...f, origin: e.target.value }))}
                  placeholder="VD: Khai quật tại Giồng Xoài, Thoại Sơn, An Giang"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="label">Mô tả lịch sử & Ý nghĩa khảo cổ</label>
                <textarea
                  className="input"
                  rows={3}
                  value={form.description || ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Nội dung lịch sử chi tiết về hiện vật..."
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label className="label" style={{ margin: 0 }}>Lời thoại AI Voice Thuyết minh (Tùy chọn)</label>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: 11, padding: '2px 8px' }}
                    onClick={() => setForm(f => ({ ...f, audioText: f.description || '' }))}
                  >
                    Lấy từ Mô tả
                  </button>
                </div>
                <textarea
                  className="input"
                  rows={2}
                  value={form.audioText || ''}
                  onChange={e => setForm(f => ({ ...f, audioText: e.target.value }))}
                  placeholder="Nội dung AI sẽ đọc khi du khách nhấn nút Thuyết minh (mặc định lấy theo Mô tả)..."
                />
              </div>

              {/* Turntable 360 Frames Upload */}
              <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 12, border: '1px dashed var(--primary)', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--primary)' }}>
                    Chuỗi ảnh Mâm xoay 360° (Turntable Frames)
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {form.images360 ? form.images360.length : 0} ảnh đã tải
                  </span>
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                  Tải lên chuỗi ảnh chụp quanh mâm xoay (12, 24, 36 hoặc 72 ảnh) để tạo chuyển động 360 mượt mà.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Upload size={14} />
                    <span>Chọn chuỗi ảnh mâm xoay</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFramesUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingFrames}
                    />
                  </label>

                  {uploadingFrames && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--primary)' }}>
                      <Loader2 size={16} className="spin" />
                      <span>Đang xử lý tải chuỗi ảnh lên Cloud...</span>
                    </div>
                  )}
                </div>

                {/* Preview thumbnails */}
                {form.images360 && form.images360.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginTop: 12, paddingBottom: 6 }}>
                    {form.images360.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`frame-${i}`}
                        style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Featured Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={form.featured || false}
                  onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                />
                <label htmlFor="featured-checkbox" style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Đánh dấu là Bảo vật Quốc gia / Hiện vật tiêu biểu
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
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
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {saving ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
                  <span>{isCreating ? 'Tạo hiện vật & Sinh mã QR' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
