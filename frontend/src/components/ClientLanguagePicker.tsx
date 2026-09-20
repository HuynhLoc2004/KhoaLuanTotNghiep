import React, { useState, useRef, useEffect } from 'react';
import { useClientTranslation } from '../context/ClientTranslationContext';
import { Check, ChevronDown } from 'lucide-react';

interface ClientLanguagePickerProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const ClientLanguagePicker: React.FC<ClientLanguagePickerProps> = ({
  className = ''
}) => {
  const { currentLang, activeLanguages, changeLanguage, activeLanguageInfo } = useClientTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi bấm ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (code: string) => {
    setIsOpen(false);
    await changeLanguage(code);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }} className={className} ref={dropdownRef}>
      {/* Nút chọn đồng bộ chính xác với header-tour-link của hệ thống */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="header-tour-link"
        style={{ cursor: 'pointer', outline: 'none', gap: 6 }}
        title="Chuyển đổi ngôn ngữ hiển thị"
      >
        <span style={{ fontSize: '13px' }}>{activeLanguageInfo?.flagIcon || '🌐'}</span>
        <span style={{ fontSize: '12px', fontWeight: 500 }}>
          {activeLanguageInfo?.nativeName || 'Tiếng Việt'}
        </span>
        <ChevronDown
          size={12}
          style={{
            color: 'var(--text-muted)',
            transition: 'transform 0.15s ease',
            transform: isOpen ? 'rotate(180deg)' : 'none'
          }}
        />
      </button>

      {/* Dropdown danh sách ngôn ngữ */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: 6,
            minWidth: 180,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 1000,
            padding: '4px 0',
            overflow: 'hidden'
          }}
        >
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {activeLanguages.map((lang) => {
              const isSelected = lang.code.toLowerCase() === currentLang.toLowerCase();
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    fontSize: '12px',
                    border: 'none',
                    background: isSelected ? 'rgba(140, 45, 25, 0.12)' : 'transparent',
                    color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: isSelected ? 600 : 400,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.1s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--bg-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '14px' }}>{lang.flagIcon || '🌐'}</span>
                    <span>{lang.nativeName}</span>
                  </div>
                  {isSelected && <Check size={13} style={{ color: 'var(--primary)' }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
