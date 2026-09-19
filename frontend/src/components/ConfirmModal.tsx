import React from 'react';
import { AlertTriangle, HelpCircle, Info, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  type = 'warning',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle size={22} style={{ color: 'var(--error)' }} />;
      case 'warning':
        return <HelpCircle size={22} style={{ color: 'var(--accent-gold)' }} />;
      case 'info':
      default:
        return <Info size={22} style={{ color: 'var(--primary)' }} />;
    }
  };

  const getConfirmButtonClass = () => {
    if (type === 'danger') return 'btn btn-danger';
    return 'btn btn-primary';
  };

  return (
    <div className="modal-backdrop" onClick={onCancel} style={{ zIndex: 1100 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 440, padding: 0, overflow: 'hidden' }}
      >
        <div className="modal-header" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {getIcon()}
            <h2 className="modal-title" style={{ fontSize: '15px' }}>{title}</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onCancel}
            aria-label="Đóng"
          >
            <X size={17} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px', fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {message}
        </div>

        <div
          className="modal-footer"
          style={{
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            background: 'var(--bg-card-header)'
          }}
        >
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onCancel}
          >
            <span>{cancelText}</span>
          </button>
          <button
            type="button"
            className={`${getConfirmButtonClass()} btn-sm`}
            onClick={() => {
              onConfirm();
            }}
          >
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
