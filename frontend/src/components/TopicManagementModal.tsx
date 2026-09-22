import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Check, RotateCw, Layers, AlertCircle, HelpCircle } from 'lucide-react';
import { TopicItem } from '../types';
import { api } from '../services/api';
import { useToast } from './Toast';
import { ConfirmModal } from './ConfirmModal';

interface TopicManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopicCreated?: (newTopic: TopicItem) => void;
  onTopicsUpdated?: (topics: TopicItem[]) => void;
}

export const TopicManagementModal: React.FC<TopicManagementModalProps> = ({
  isOpen,
  onClose,
  onTopicCreated,
  onTopicsUpdated
}) => {
  const { showToast } = useToast();
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form tạo chuyên đề mới
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // State chỉnh sửa chuyên đề
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Custom Heritage Confirm Modal
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info';
    confirmText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const data = await api.getTopics();
      setTopics(data);
      if (onTopicsUpdated) onTopicsUpdated(data);
    } catch (err: any) {
      showToast('Lỗi tải danh mục chuyên đề: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTopics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Thêm chuyên đề mới
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      showToast('Vui lòng nhập tên chuyên đề', 'warning');
      return;
    }

    try {
      setIsCreating(true);
      const created = await api.createTopic({
        name: trimmed,
        description: newDesc.trim()
      });
      setNewName('');
      setNewDesc('');
      showToast(`Đã thêm chuyên đề "${created.name}" thành công`, 'success');
      const updatedList = [...topics, created];
      setTopics(updatedList);
      if (onTopicCreated) onTopicCreated(created);
      if (onTopicsUpdated) onTopicsUpdated(updatedList);
    } catch (err: any) {
      showToast(err.message || 'Lỗi thêm chuyên đề', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // Bắt đầu sửa
  const handleStartEdit = (t: TopicItem) => {
    setEditingId(t.id);
    setEditName(t.name);
    setEditDesc(t.description || '');
  };

  // Hủy sửa
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDesc('');
  };

  // Lưu sửa
  const handleSaveEdit = async (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      showToast('Tên chuyên đề không được để trống', 'warning');
      return;
    }

    try {
      setIsUpdating(true);
      const updated = await api.updateTopic(id, {
        name: trimmed,
        description: editDesc.trim()
      });
      showToast(`Đã cập nhật chuyên đề "${updated.name}" thành công`, 'success');
      const updatedList = topics.map((t) => (t.id === id ? updated : t));
      setTopics(updatedList);
      if (onTopicsUpdated) onTopicsUpdated(updatedList);
      handleCancelEdit();
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật chuyên đề', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Xóa chuyên đề
  const handleDelete = (t: TopicItem) => {
    if (t.roomCount && t.roomCount > 0) {
      showToast(`Không thể xóa chuyên đề "${t.name}" vì đang có ${t.roomCount} gian phòng trực thuộc`, 'warning');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Xóa chuyên đề trưng bày',
      message: `Bạn có chắc chắn muốn xóa chuyên đề "${t.name}" khỏi hệ thống? Thao tác này không thể hoàn tác.`,
      type: 'danger',
      confirmText: 'Xóa vĩnh viễn',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          await api.deleteTopic(t.id);
          showToast(`Đã xóa chuyên đề "${t.name}"`, 'success');
          const updatedList = topics.filter((item) => item.id !== t.id);
          setTopics(updatedList);
          if (onTopicsUpdated) onTopicsUpdated(updatedList);
        } catch (err: any) {
          showToast(err.message || 'Lỗi xóa chuyên đề', 'error');
        }
      }
    });
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 1300 }}>
      <div className="modal-card" style={{ maxWidth: 680, width: '92vw' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(212, 168, 106, 0.12)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={18} />
            </div>
            <div>
              <h2 className="modal-title">Quản lý Chuyên đề Trưng bày</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Hệ thống chuyên đề động: Tự do thêm, sửa tên và xóa các nhóm thời kỳ của bảo tàng
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Form thêm chuyên đề mới */}
          <form
            onSubmit={handleCreate}
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={15} style={{ color: 'var(--accent-gold)' }} />
              <span>Tạo thêm Chuyên đề trưng bày mới</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr auto', gap: 10, alignItems: 'center' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Tên chuyên đề mới *"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ fontSize: '13px' }}
                disabled={isCreating}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Mô tả tóm tắt (tùy chọn)..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                style={{ fontSize: '13px' }}
                disabled={isCreating}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isCreating || !newName.trim()}
                style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}
              >
                {isCreating ? <RotateCw size={14} className="spin" /> : <Plus size={14} />}
                <span>Thêm</span>
              </button>
            </div>
          </form>

          {/* Danh sách các chuyên đề hiện có */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Danh sách chuyên đề hiện có ({topics.length})
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--text-light)' }}>
                Tự động đồng bộ vào các bộ chọn của gian phòng
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                <RotateCw size={20} className="spin" style={{ margin: '0 auto 8px' }} />
                <span style={{ fontSize: '13px' }}>Đang tải danh mục chuyên đề...</span>
              </div>
            ) : topics.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span>Chưa có chuyên đề nào trong hệ thống.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {topics.map((t) => {
                  const isEditing = editingId === t.id;

                  return (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '10px 14px',
                        background: isEditing ? 'rgba(212, 168, 106, 0.08)' : 'var(--bg-subtle)',
                        border: isEditing ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isEditing ? (
                        /* Đang sửa */
                        <div style={{ display: 'flex', flex: 1, gap: 8, alignItems: 'center' }}>
                          <input
                            type="text"
                            className="form-control"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            style={{ flex: 1, fontSize: '13px' }}
                            autoFocus
                          />
                          <input
                            type="text"
                            className="form-control"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Mô tả..."
                            style={{ flex: 1.5, fontSize: '13px' }}
                          />
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleSaveEdit(t.id)}
                            disabled={isUpdating || !editName.trim()}
                            title="Lưu thay đổi"
                            style={{ padding: '6px 12px' }}
                          >
                            {isUpdating ? <RotateCw size={13} className="spin" /> : <Check size={13} />}
                            <span>Lưu</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={handleCancelEdit}
                            title="Hủy sửa"
                            style={{ padding: '6px 10px' }}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        /* Chế độ xem */
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--heading-color)' }}>
                                {t.name}
                              </span>
                              <span
                                style={{
                                  fontSize: '11px',
                                  padding: '1px 7px',
                                  borderRadius: 4,
                                  background: (t.roomCount || 0) > 0 ? 'rgba(212, 168, 106, 0.15)' : 'var(--bg-surface)',
                                  color: (t.roomCount || 0) > 0 ? 'var(--accent-gold)' : 'var(--text-muted)',
                                  border: '1px solid var(--border-color)',
                                  fontWeight: 600
                                }}
                              >
                                {t.roomCount || 0} phòng
                              </span>
                            </div>
                            {t.description && (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                {t.description}
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleStartEdit(t)}
                              title="Sửa tên chuyên đề"
                              style={{ width: 30, height: 30, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Edit2 size={13} />
                            </button>

                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleDelete(t)}
                              title={
                                (t.roomCount || 0) > 0
                                  ? `Đang có ${t.roomCount} phòng trực thuộc, không thể xóa`
                                  : 'Xóa chuyên đề'
                              }
                              disabled={(t.roomCount || 0) > 0}
                              style={{
                                width: 30,
                                height: 30,
                                padding: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: (t.roomCount || 0) > 0 ? 'var(--text-light)' : 'var(--error)',
                                opacity: (t.roomCount || 0) > 0 ? 0.4 : 1,
                                cursor: (t.roomCount || 0) > 0 ? 'not-allowed' : 'pointer'
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Custom Heritage Confirm Modal */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText={confirmDialog.confirmText}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
