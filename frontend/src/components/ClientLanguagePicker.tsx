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
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Nút bấm chọn ngôn ngữ */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-stone-900/80 hover:bg-stone-800 text-stone-200 text-sm font-medium shadow-sm hover:border-amber-400/60 transition-all duration-200 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        title="Chuyển đổi ngôn ngữ hiển thị"
      >
        <span className="text-base leading-none">{activeLanguageInfo?.flagIcon || '🌐'}</span>
        {variant === 'full' && (
          <span className="truncate max-w-[110px] tracking-wide text-xs uppercase font-semibold text-amber-300">
            {activeLanguageInfo?.nativeName || currentLang.toUpperCase()}
          </span>
        )}
        <ChevronDown
          size={14}
          className={`text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
        {isLoading && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping ml-0.5" />
        )}
      </button>

      {/* Menu dropdown danh sách ngôn ngữ */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-stone-900/95 border border-stone-800 shadow-2xl backdrop-blur-xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-stone-800/80 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
              <Globe size={12} />
              Ngôn ngữ hiển thị
            </span>
            <span className="text-[10px] text-stone-400 bg-stone-800/80 px-1.5 py-0.5 rounded">
              {activeLanguages.length} khả dụng
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto py-1 custom-scrollbar">
            {activeLanguages.map((lang) => {
              const isSelected = lang.code.toLowerCase() === currentLang.toLowerCase();
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs transition-colors duration-150 text-left ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-300 font-semibold'
                      : 'text-stone-300 hover:bg-stone-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base leading-none">{lang.flagIcon || '🌐'}</span>
                    <div className="flex flex-col truncate">
                      <span className="truncate leading-snug">{lang.nativeName}</span>
                      <span className="text-[10px] text-stone-500 font-normal truncate">{lang.name}</span>
                    </div>
                  </div>
                  {isSelected && <Check size={14} className="text-amber-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
