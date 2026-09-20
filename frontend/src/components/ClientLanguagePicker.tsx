import React, { useState, useRef, useEffect } from 'react';
import { useClientTranslation } from '../context/ClientTranslationContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface ClientLanguagePickerProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const ClientLanguagePicker: React.FC<ClientLanguagePickerProps> = ({
  className = '',
  variant = 'full'
}) => {
  const { currentLang, activeLanguages, changeLanguage, activeLanguageInfo, isLoading } = useClientTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
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
    <div style={{ position: 'relative', display: 'inline-block', textAlign: 'left' }} className={className} ref={dropdownRef}>
      {/* Nút bấm chọn ngôn ngữ */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '6px 12px',
          borderRadius: 9999,
          border: '1px solid var(--border-color)',
          background: 'var(--bg-surface)',
          color: 'var(--text-main)',
          fontSize: '12.5px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        title="Chuyển đổi ngôn ngữ hiển thị"
      >
        <span style={{ fontSize: '15px', lineHeight: 1 }}>{activeLanguageInfo?.flagIcon || '🌐'}</span>
        {variant === 'full' && (
          <span style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '11.5px', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            {activeLanguageInfo?.nativeName || currentLang.toUpperCase()}
          </span>
        )}
        <ChevronDown
          size={13}
          style={{
            color: 'var(--text-muted)',
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
        {isLoading && (
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-gold)' }} className="spin" />
        )}
      </button>

      {/* Menu dropdown danh sách ngôn ngữ */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            marginTop: 8,
            width: 220,
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
            zIndex: 1000,
            padding: '6px 0',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '8px 14px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Globe size={12} />
              Ngôn ngữ hiển thị
            </span>
            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: 4 }}>
              {activeLanguages.length} khả dụng
            </span>
          </div>

          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
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
                    padding: '8px 14px',
                    fontSize: '12.5px',
                    border: 'none',
                    background: isSelected ? 'rgba(212, 168, 106, 0.15)' : 'transparent',
                    color: isSelected ? 'var(--accent-gold)' : 'var(--text-main)',
                    fontWeight: isSelected ? 600 : 400,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--bg-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <span style={{ fontSize: '16px', lineHeight: 1 }}>{lang.flagIcon || '🌐'}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lang.nativeName}</span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lang.name}</span>
                    </div>
                  </div>
                  {isSelected && <Check size={14} style={{ color: 'var(--accent-gold)', marginLeft: 8, flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
