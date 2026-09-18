import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

interface AIVoiceNarratorProps {
  text: string;
  title?: string;
  className?: string;
}

export const AIVoiceNarrator: React.FC<AIVoiceNarratorProps> = ({
  text,
  title = 'Thuyết minh Di sản AI',
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [rate, setRate] = useState<number>(1.0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
    }
  }, []);

  // Dừng phát khi component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text]);

  const startSpeaking = () => {
    if (!isSupported || !text) return;

    window.speechSynthesis.cancel(); // Dừng câu đang đọc cũ

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Tìm giọng đọc tiếng Việt nếu trình duyệt hỗ trợ
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VI'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn('Lỗi AI Voice TTS:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleToggle = () => {
    if (!isSupported) return;

    if (isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      startSpeaking();
    }
  };

  const handleStop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div
      className={`ai-voice-narrator-widget ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'linear-gradient(135deg, rgba(139, 24, 24, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
        border: '1px solid rgba(139, 24, 24, 0.2)',
        borderRadius: 14,
        gap: 12
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={handleToggle}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: isPlaying && !isPaused ? '#8B1818' : 'var(--primary)',
            color: '#fff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(139, 24, 24, 0.3)',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
          title={isPlaying && !isPaused ? 'Tạm dừng giọng đọc' : 'Nghe thuyết minh di sản'}
        >
          {isPlaying && !isPaused ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
              {title}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 10,
                fontWeight: 700,
                background: '#FEF3C7',
                color: '#B45309',
                padding: '1px 6px',
                borderRadius: 99
              }}
            >
              <Sparkles size={10} />
              AI TTS
            </span>
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {isPlaying && !isPaused
              ? 'Đang phát thuyết minh di sản...'
              : isPaused
              ? 'Đã tạm dừng'
              : 'Nhấn để nghe giọng thuyết minh tự động'}
          </div>
        </div>
      </div>

      {/* Dynamic Soundwave bars when playing */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {isPlaying && !isPaused && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              height: 20,
              padding: '0 6px'
            }}
          >
            <span className="voice-bar bar-1" />
            <span className="voice-bar bar-2" />
            <span className="voice-bar bar-3" />
            <span className="voice-bar bar-4" />
          </div>
        )}

        {isPlaying && (
          <button
            onClick={handleStop}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center'
            }}
            title="Dừng phát"
          >
            <VolumeX size={16} />
          </button>
        )}
      </div>

      <style>{`
        .voice-bar {
          width: 3px;
          background: #8B1818;
          border-radius: 2px;
          animation: soundWave 0.8s ease-in-out infinite alternate;
        }
        .bar-1 { height: 12px; animation-delay: 0.1s; }
        .bar-2 { height: 20px; animation-delay: 0.3s; }
        .bar-3 { height: 16px; animation-delay: 0.2s; }
        .bar-4 { height: 8px; animation-delay: 0.4s; }
        @keyframes soundWave {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};
