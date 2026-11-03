import React, { useState, useEffect, useRef } from 'react';
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
  const newNameInputRef = useRef<HTMLInputElement>(null);

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

  // Lắng nghe phím Escape để đóng modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isCreating && !isUpdating) {
        if (editingId) {
          handleCancelEdit();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreating, isUpdating, editingId, onClose]);

  useEffect(() => {
    if (isOpen) {
      fetchTopics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Thêm chuyên đề mới - Tuyệt đối không đóng modal để người dùng tiếp tục thao tác
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

      // Giữ focus lại ở ô nhập để người dùng có thể thêm tiếp chuyên đề khác
      setTimeout(() => {
        newNameInputRef.current?.focus();
      }, 50);
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

  // Lưu sửa - Tuyệt đối không đóng modal
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
    <div
      className="modal-backdrop"
      style={{ zIndex: 1300 }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isCreating && !isUpdating) onClose();
      }}
    >
      <div
        className="modal-card topic-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="topic-modal-header-content">
            <div className="topic-modal-header-icon">
              <Layers size={18} />
            </div>
            <div className="topic-modal-header-text">
              <h2 className="modal-title">Quản lý Chuyên đề Trưng bày</h2>
              <p className="topic-modal-header-sub">
                Hệ thống chuyên đề động: Tự do thêm, sửa tên và xóa các nhóm thời kỳ của bảo tàng
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            title="Đóng (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body topic-modal-body">
          {/* Form thêm chuyên đề mới */}
          <form
            onSubmit={handleCreate}
            className="topic-modal-create-box"
          >
            <div className="topic-modal-create-title">
              <Plus size={15} style={{ color: 'var(--accent-gold)' }} />
              <span>Tạo thêm Chuyên đề trưng bày mới</span>
            </div>

            <div className="topic-modal-create-row">
              <input
                ref={newNameInputRef}
                type="text"
                className="form-control topic-modal-input-name"
                placeholder="Tên chuyên đề mới *"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={isCreating}
              />
              <input
                type="text"
                className="form-control topic-modal-input-desc"
                placeholder="Mô tả tóm tắt (tùy chọn)..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                disabled={isCreating}
              />
              <button
                type="submit"
                className="btn btn-primary topic-modal-btn-add"
                disabled={isCreating || !newName.trim()}
              >
                {isCreating ? <RotateCw size={14} className="spin" /> : <Plus size={14} />}
                <span>Thêm</span>
              </button>
            </div>
          </form>

          {/* Danh sách các chuyên đề hiện có */}
          <div>
            <div className="topic-modal-list-header">
              <span className="topic-modal-list-title">
                Danh sách chuyên đề hiện có ({topics.length})
              </span>
              <span className="topic-modal-list-hint">
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
                  const roomCount = t.roomCount || 0;

                  return (
                    <div
                      key={t.id}
                      className={`topic-modal-item ${isEditing ? 'is-editing' : ''}`}
                    >
                      {isEditing ? (
                        /* Đang sửa */
                        <div className="topic-modal-edit-box">
                          <input
                            type="text"
                            className="form-control topic-modal-edit-name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveEdit(t.id);
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                handleCancelEdit();
                              }
                            }}
                            autoFocus
                          />
                          <input
                            type="text"
                            className="form-control topic-modal-edit-desc"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Mô tả..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveEdit(t.id);
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                handleCancelEdit();
                              }
                            }}
                          />
                          <div className="topic-modal-edit-actions">
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => handleSaveEdit(t.id)}
                              disabled={isUpdating || !editName.trim()}
                              title="Lưu thay đổi (Enter)"
                              style={{ padding: '6px 14px' }}
                            >
                              {isUpdating ? <RotateCw size={13} className="spin" /> : <Check size={13} />}
                              <span>Lưu</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={handleCancelEdit}
                              title="Hủy sửa (Esc)"
                              style={{ padding: '6px 12px' }}
                            >
                              <X size={13} />
                              <span>Hủy</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Chế độ xem */
                        <>
                          <div className="topic-modal-item-content">
                            <div className="topic-modal-item-title-row">
                              <span className="topic-modal-item-title">
                                {t.name}
                              </span>
                              <span
                                className={`topic-modal-item-badge ${roomCount > 0 ? 'has-rooms' : 'no-rooms'}`}
                              >
                                {roomCount} phòng
                              </span>
                            </div>
                            {t.description && (
                              <span className="topic-modal-item-desc">
                                {t.description}
                              </span>
                            )}
                          </div>

                          <div className="topic-modal-item-actions">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleStartEdit(t)}
                              title="Sửa tên chuyên đề"
                              style={{ width: 32, height: 32, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Edit2 size={13} />
                            </button>

                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleDelete(t)}
                              title={
                                roomCount > 0
                                  ? `Đang có ${roomCount} phòng trực thuộc, không thể xóa`
                                  : 'Xóa chuyên đề'
                              }
                              disabled={roomCount > 0}
                              style={{
                                width: 32,
                                height: 32,
                                padding: 0,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: roomCount > 0 ? 'var(--text-light)' : 'var(--error)',
                                opacity: roomCount > 0 ? 0.4 : 1,
                                cursor: roomCount > 0 ? 'not-allowed' : 'pointer'
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
