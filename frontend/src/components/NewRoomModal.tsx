import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Upload,
  Loader2,
  Image as ImageIcon,
  Layers,
  Search,
  ChevronDown,
  Check,
  Globe,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { MuseumRoom, TopicItem } from '../types';
import { api } from '../services/api';
import { TopicManagementModal } from './TopicManagementModal';
import { useClientTranslation } from '../context/ClientTranslationContext';

export interface PanoramaItemOption {
  filename: string;
  url: string;
  thumbnailUrl?: string;
  date?: string;
  title?: string;
  usedInRooms?: string[];
  isUsed?: boolean;
}

interface NewRoomModalProps {
  onClose: () => void;
  onCreated: (room: MuseumRoom) => void;
  initialPanoramaUrl?: string;
  panoramas?: PanoramaItemOption[];
}

export const NewRoomModal: React.FC<NewRoomModalProps> = ({
  onClose,
  onCreated,
  initialPanoramaUrl,
  panoramas = []
}) => {
  const { t } = useClientTranslation();
  const [code, setCode] = useState(`P-${100 + Math.floor(Math.random() * 900)}`);
  const [name, setName] = useState('');
  const [period, setPeriod] = useState('');
  const [description, setDescription] = useState('');
  const [panoramaUrl, setPanoramaUrl] = useState(initialPanoramaUrl || '');
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bộ chọn trực quan không gian 360°
  const [isPanoDropdownOpen, setIsPanoDropdownOpen] = useState(false);
  const [panoFilterTab, setPanoFilterTab] = useState<'unused' | 'all' | 'used'>('unused');
  const [panoSearch, setPanoSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    api.getTopics().then((data) => {
      if (isMounted) {
        setTopics(data);
        if (data.length > 0 && !period) {
          setPeriod(data[0].name);
        }
      }
    }).catch(console.warn);
    return () => { isMounted = false; };
  }, []);

  // Lắng nghe phím Escape để đóng modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, onClose]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsPanoDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Phân loại danh sách không gian chưa dùng và đã dùng
  const unusedPanos = useMemo(() => {
    return panoramas.filter((p) => !p.isUsed && (!p.usedInRooms || p.usedInRooms.length === 0));
  }, [panoramas]);

  const usedPanos = useMemo(() => {
    return panoramas.filter((p) => p.isUsed || (p.usedInRooms && p.usedInRooms.length > 0));
  }, [panoramas]);

  // Nếu không có ảnh nào chưa dùng, tự động chuyển sang tab "Tất cả"
  useEffect(() => {
    if (panoramas.length > 0 && unusedPanos.length === 0 && panoFilterTab === 'unused') {
      setPanoFilterTab('all');
    }
  }, [panoramas.length, unusedPanos.length]);

  const filteredPanos = useMemo(() => {
    let list = panoramas;
    if (panoFilterTab === 'unused') list = unusedPanos;
    else if (panoFilterTab === 'used') list = usedPanos;

    if (panoSearch.trim()) {
      const q = panoSearch.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.filename.toLowerCase().includes(q) ||
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.usedInRooms && p.usedInRooms.some((r) => r.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [panoramas, panoFilterTab, unusedPanos, usedPanos, panoSearch]);

  const selectedPano = useMemo(() => {
    return panoramas.find((p) => p.url === panoramaUrl);
  }, [panoramas, panoramaUrl]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const file = files[0];
    try {
      setUploading(true);
      setError(null);
      const res = await api.uploadPanorama(file);
      setPanoramaUrl(res.url);
    } catch (err: any) {
      setError(err.message || t('rooms.uploadError', 'Lỗi khi tải ảnh lên'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !panoramaUrl.trim()) {
      setError(t('rooms.fillRequiredFields', 'Vui lòng nhập tên gian phòng và cung cấp ảnh Panorama 360'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const created = await api.createRoom({
        code: code.trim(),
        name: name.trim(),
        period: period.trim() || 'Hiện vật Lịch sử',
        category: period.trim() || 'Hiện vật Lịch sử',
        description: description.trim(),
        panoramaUrl: panoramaUrl.trim(),
        thumbnailUrl: panoramaUrl.trim(),
        initialView: { pitch: 0, yaw: 0, fov: 100 }
      });
      onCreated(created);
    } catch (err: any) {
      setError(err.message || t('rooms.createError', 'Lỗi thêm gian phòng mới'));
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        zIndex: 1200,
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px'
      }}
      onClick={handleClose}
    >
      <div
        className="modal-card"
        style={{
          maxWidth: 580,
          width: '100%',
          maxHeight: '92vh',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg, 12px)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with responsive touch-friendly close button */}
        <div
          className="modal-header"
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={18} style={{ color: 'var(--accent-gold)' }} />
            <h2 className="modal-title" style={{ fontSize: '16px', margin: 0, fontWeight: 600, color: 'var(--heading-color)' }}>
              {t('rooms.addNewRoomTitle', 'Thêm gian phòng trưng bày mới')}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            disabled={loading}
            aria-label={t('common.close', 'Đóng')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden'
          }}
        >
          <div
            className="modal-body"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14
            }}
          >
            {error && (
              <div
                style={{
                  background: 'var(--error-bg, rgba(239, 68, 68, 0.15))',
                  color: 'var(--error, #ef4444)',
                  border: '1px solid var(--error-border, rgba(239, 68, 68, 0.35))',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  fontSize: 12.5
                }}
              >
                {error}
              </div>
            )}

            {/* Mã phòng & Tên gian - Tự co giãn theo màn hình điện thoại */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">{t('rooms.roomCode', 'Mã phòng')} *</label>
                <input
                  type="text"
                  className="form-control"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="P-101, P-201..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('rooms.roomName', 'Tên gian trưng bày')} *</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('rooms.roomNamePlaceholder', 'Ví dụ: Gian Văn hóa Óc Eo...')}
                  required
                />
              </div>
            </div>

            {/* Chuyên đề trưng bày */}
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="form-label" style={{ margin: 0 }}>{t('rooms.exhibitionTopic', 'Chuyên đề trưng bày')} *</label>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowTopicModal(true)}
                  style={{ fontSize: '11px', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  title={t('rooms.manageTopicsTitle', 'Quản lý và thêm mới chuyên đề')}
                >
                  <Layers size={12} style={{ color: 'var(--accent-gold)' }} />
                  <span>{t('rooms.manageTopics', 'Quản lý chuyên đề')}</span>
                </button>
              </div>
              <select
                className="form-control"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                required
              >
                <option value="">{t('rooms.selectTopic', '-- Chọn chuyên đề trưng bày --')}</option>
                {topics.map((tItem) => (
                  <option key={tItem.id} value={tItem.name}>{tItem.name}</option>
                ))}
              </select>
            </div>

            {/* Giới thiệu tổng quan */}
            <div className="form-group">
              <label className="form-label">{t('rooms.generalIntro', 'Giới thiệu tổng quan')}</label>
              <textarea
                className="form-control"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('rooms.generalIntroPlaceholder', 'Mô tả tóm tắt nội dung, hiện vật trưng bày trong gian phòng...')}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Nguồn ảnh toàn cảnh 360° */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{t('rooms.panoramaLabel', 'Ảnh toàn cảnh 360° hoặc Video Tour')} *</span>
                {panoramaUrl && (
                  <span style={{ fontSize: 11.5, color: 'var(--accent-gold)', fontWeight: 600 }}>
                    {t('rooms.imageLoaded', 'Đã nạp tệp')}
                  </span>
                )}
              </label>

              {/* TÙY CHỌN 1: BỘ CHỌN TRỰC QUAN TỪ THƯ VIỆN KHO 360 (CÓ ẢNH & LỌC ĐÃ DÙNG) */}
              {panoramas && panoramas.length > 0 && (
                <div style={{ marginBottom: 10, position: 'relative' }} ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsPanoDropdownOpen(!isPanoDropdownOpen)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--bg-subtle)',
                      border: isPanoDropdownOpen
                        ? '1px solid var(--accent-gold)'
                        : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm, 6px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      color: 'var(--text-main)',
                      textAlign: 'left',
                      gap: 10
                    }}
                  >
                    {selectedPano ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                        <img
                          src={selectedPano.thumbnailUrl || selectedPano.url}
                          alt={selectedPano.filename}
                          style={{
                            width: 44,
                            height: 30,
                            borderRadius: 4,
                            objectFit: 'cover',
                            border: '1px solid var(--border-color)',
                            flexShrink: 0
                          }}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {selectedPano.filename}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', color: 'var(--text-muted)' }}>
                            {selectedPano.date && <span>{selectedPano.date}</span>}
                            {selectedPano.isUsed || (selectedPano.usedInRooms && selectedPano.usedInRooms.length > 0) ? (
                              <span style={{ color: 'var(--text-muted)' }}>• Đã dùng: {selectedPano.usedInRooms?.join(', ')}</span>
                            ) : (
                              <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>• Chưa gán phòng</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '12px' }}>
                        <ImageIcon size={15} style={{ color: 'var(--accent-gold)' }} />
                        <span>-- Chọn ảnh từ Kho 360° ({unusedPanos.length} chưa dùng / {panoramas.length} tổng) --</span>
                      </div>
                    )}
                    <ChevronDown
                      size={16}
                      style={{
                        color: 'var(--text-muted)',
                        flexShrink: 0,
                        transform: isPanoDropdownOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s'
                      }}
                    />
                  </button>

                  {/* Popover Menu danh sách ảnh 360 kèm bộ lọc */}
                  {isPanoDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        zIndex: 60,
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm, 6px)',
                        boxShadow: 'var(--shadow-lg)',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        maxHeight: '340px'
                      }}
                    >
                      {/* Tabs lọc */}
                      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-subtle)', padding: 3, borderRadius: 6 }}>
                        <button
                          type="button"
                          onClick={() => setPanoFilterTab('unused')}
                          style={{
                            flex: 1,
                            padding: '5px 6px',
                            fontSize: '11px',
                            fontWeight: panoFilterTab === 'unused' ? 600 : 400,
                            borderRadius: 4,
                            border: 'none',
                            background: panoFilterTab === 'unused' ? 'var(--accent-gold)' : 'transparent',
                            color: panoFilterTab === 'unused' ? '#000' : 'var(--text-muted)',
                            cursor: 'pointer'
                          }}
                        >
                          Chưa gán ({unusedPanos.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPanoFilterTab('all')}
                          style={{
                            flex: 1,
                            padding: '5px 6px',
                            fontSize: '11px',
                            fontWeight: panoFilterTab === 'all' ? 600 : 400,
                            borderRadius: 4,
                            border: 'none',
                            background: panoFilterTab === 'all' ? 'var(--accent-gold)' : 'transparent',
                            color: panoFilterTab === 'all' ? '#000' : 'var(--text-muted)',
                            cursor: 'pointer'
                          }}
                        >
                          Tất cả ({panoramas.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPanoFilterTab('used')}
                          style={{
                            flex: 1,
                            padding: '5px 6px',
                            fontSize: '11px',
                            fontWeight: panoFilterTab === 'used' ? 600 : 400,
                            borderRadius: 4,
                            border: 'none',
                            background: panoFilterTab === 'used' ? 'var(--accent-gold)' : 'transparent',
                            color: panoFilterTab === 'used' ? '#000' : 'var(--text-muted)',
                            cursor: 'pointer'
                          }}
                        >
                          Đã gán ({usedPanos.length})
                        </button>
                      </div>

                      {/* Ô tìm kiếm nhanh */}
                      <div style={{ position: 'relative' }}>
                        <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          value={panoSearch}
                          onChange={(e) => setPanoSearch(e.target.value)}
                          placeholder="Tìm theo tên file hoặc gian phòng..."
                          style={{
                            width: '100%',
                            padding: '5px 8px 5px 28px',
                            fontSize: '11.5px',
                            background: 'var(--bg-subtle)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 4,
                            color: 'var(--text-main)'
                          }}
                        />
                      </div>

                      {/* Danh sách các không gian kèm ảnh hiển thị trực quan */}
                      <div style={{ overflowY: 'auto', maxHeight: '200px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {filteredPanos.length === 0 ? (
                          <div style={{ padding: '20px', textAlign: 'center', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            Không tìm thấy ảnh 360° nào phù hợp với bộ lọc này
                          </div>
                        ) : (
                          filteredPanos.map((p) => {
                            const isSelected = p.url === panoramaUrl;
                            const isUsed = p.isUsed || (p.usedInRooms && p.usedInRooms.length > 0);
                            return (
                              <div
                                key={p.filename}
                                onClick={() => {
                                  setPanoramaUrl(p.url);
                                  setError(null);
                                  setIsPanoDropdownOpen(false);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 10,
                                  padding: '7px 9px',
                                  borderRadius: 6,
                                  cursor: 'pointer',
                                  background: isSelected ? 'rgba(212, 168, 106, 0.15)' : 'transparent',
                                  border: isSelected ? '1px solid rgba(212, 168, 106, 0.4)' : '1px solid transparent',
                                  transition: 'all 0.15s'
                                }}
                              >
                                <img
                                  src={p.thumbnailUrl || p.url}
                                  alt={p.filename}
                                  style={{
                                    width: 52,
                                    height: 34,
                                    borderRadius: 4,
                                    objectFit: 'cover',
                                    border: '1px solid var(--border-color)',
                                    flexShrink: 0
                                  }}
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {p.filename}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '10.5px', marginTop: 2 }}>
                                    {isUsed ? (
                                      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Đã dùng: {p.usedInRooms?.join(', ')}</span>
                                    ) : (
                                      <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>Chưa gán phòng</span>
                                    )}
                                    {p.date && <span style={{ color: 'var(--text-muted)' }}>• {p.date}</span>}
                                  </div>
                                </div>
                                {isSelected && <Check size={14} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tùy chọn 2 & 3: Tải tệp lên hoặc Dán đường dẫn trực tiếp */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                <input
                  type="text"
                  className="form-control"
                  value={panoramaUrl}
                  onChange={(e) => setPanoramaUrl(e.target.value)}
                  placeholder="Dán URL ảnh 360° hoặc tải tệp bên phải..."
                  style={{ fontSize: 12.5, flex: 1 }}
                  required
                />

                <label
                  className="btn btn-secondary btn-sm"
                  style={{
                    cursor: uploading ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Upload size={14} />
                  <span>{uploading ? t('common.uploading', 'Đang tải...') : 'Tải tệp'}</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                </label>
              </div>

              {uploading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: 'var(--text-muted)', marginTop: 6 }}>
                  <Loader2 size={13} className="spin" />
                  <span>{t('rooms.uploadingToServer', 'Đang tải tệp ảnh/video lên máy chủ...')}</span>
                </div>
              )}

              {/* Preview ảnh hoặc video nhỏ nếu đã có link */}
              {panoramaUrl && (
                <div style={{ position: 'relative', height: 110, borderRadius: 'var(--radius-md, 8px)', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', marginTop: 8 }}>
                  {panoramaUrl.endsWith('.mp4') || panoramaUrl.endsWith('.webm') || panoramaUrl.endsWith('.mov') || panoramaUrl.includes('/video/upload/') ? (
                    <video
                      src={panoramaUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <img
                      src={panoramaUrl}
                      alt="Preview 360"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                  <div style={{ position: 'absolute', bottom: 6, left: 8, background: 'rgba(22, 18, 14, 0.85)', color: 'var(--text-main)', padding: '2px 8px', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, border: '1px solid var(--border-color)' }}>
                    <Eye size={12} />
                    <span>{panoramaUrl.endsWith('.mp4') || panoramaUrl.endsWith('.webm') || panoramaUrl.endsWith('.mov') || panoramaUrl.includes('/video/upload/') ? 'Xem trước Video Tour' : t('rooms.preview360Spherical', 'Xem trước ảnh cầu 360°')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPanoramaUrl('')}
                    style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(239, 68, 68, 0.85)', color: '#FFFFFF', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    title={t('common.deleteImage', 'Xóa tệp này')}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Footer */}
          <div
            className="modal-footer"
            style={{
              padding: '12px 18px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              flexShrink: 0,
              backgroundColor: 'var(--bg-surface)'
            }}
          >
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>
              {t('common.cancel', 'Hủy bỏ')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
              {loading ? (
                <>
                  <Loader2 size={14} className="spin" />
                  <span>{t('common.saving', 'Đang lưu...')}</span>
                </>
              ) : (
                t('rooms.createRoomBtn', 'Tạo gian phòng')
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal Quản trị Chuyên đề trưng bày */}
      <TopicManagementModal
        isOpen={showTopicModal}
        onClose={() => setShowTopicModal(false)}
        onTopicCreated={(newT) => {
          setPeriod(newT.name);
          setTopics((prev) => [...prev, newT]);
        }}
        onTopicsUpdated={setTopics}
      />
    </div>
  );
};
