import React, { useState, useEffect } from 'react';
import { AlertTriangle, HelpCircle, Info, X, RefreshCw } from 'lucide-react';
import { useClientTranslation } from '../context/ClientTranslationContext';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  type = 'warning',
  onConfirm,
  onCancel
}) => {
  const { t } = useClientTranslation();
  const effectiveConfirmText = confirmText || t('common.confirm', 'Xác nhận');
  const effectiveCancelText = cancelText || t('common.cancel', 'Hủy bỏ');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onCancel]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onConfirm();
    } catch (err) {
      console.error('[ConfirmModal Error]:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle size={20} />,
          iconBg: 'var(--error-bg)',
          iconBorder: 'var(--error-border)',
          iconColor: 'var(--error)',
          confirmBtnClass: 'btn btn-danger'
        };
      case 'warning':
        return {
          icon: <HelpCircle size={20} />,
          iconBg: 'var(--warning-bg)',
          iconBorder: 'var(--warning-border)',
          iconColor: 'var(--warning)',
          confirmBtnClass: 'btn btn-primary'
        };
      case 'info':
      default:
        return {
          icon: <Info size={20} />,
          iconBg: 'var(--primary-light)',
          iconBorder: 'var(--primary-border)',
          iconColor: 'var(--primary)',
          confirmBtnClass: 'btn btn-primary'
        };
    }
  };

  const config = getTypeConfig();

  return (
    <div
      className="modal-backdrop"
      style={{ zIndex: 1100 }}
      onClick={onCancel}
    >
      <div
        className="modal-card"
        style={{ maxWidth: 440, padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: config.iconBg,
                border: `1px solid ${config.iconBorder}`,
                color: config.iconColor,
                flexShrink: 0
              }}
            >
              {config.icon}
            </div>
            <h2 id="confirm-modal-title" className="modal-title">
              {title}
            </h2>
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

        <div className="modal-body">
          {message}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <span>{effectiveCancelText}</span>
          </button>
          <button
            type="button"
            className={`${config.confirmBtnClass} btn-sm`}
            onClick={handleConfirm}
            disabled={isSubmitting}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {isSubmitting && <RefreshCw size={13} className="spin" />}
            <span>{isSubmitting ? 'Đang xử lý...' : effectiveConfirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
