import React, { useState, useEffect } from 'react';
import {
  Compass,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCw,
  Share2,
  QrCode,
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  Info,
  Layers,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { api, API_ROOT } from '../../services/api';
import { Artifact, LanguageItem } from '../../types';
import { Turntable360Viewer } from '../../components/Turntable360Viewer';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import '../../styles/artifacts.css';

interface PublicArtifactViewProps {
  artifactId?: string;
  onBackToTour?: () => void;
}

export const PublicArtifactView: React.FC<PublicArtifactViewProps> = ({
  artifactId: propArtifactId,
  onBackToTour
}) => {
  const { branding } = useSystemBranding();
  const { currentLang, changeLanguage, t, activeLanguages } = useClientTranslation();
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [systemLanguages, setSystemLanguages] = useState<LanguageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Dynamic on-the-fly translation cache (cho các ngôn ngữ chưa có bản dịch thủ công trong DB)
  const [dynamicTranslations, setDynamicTranslations] = useState<
    Record<string, { name: string; period: string; description: string }>
  >({});
  const [isTranslatingDraft, setIsTranslatingDraft] = useState(false);

  // Audio player state & Dynamic TTS
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [generatedAudios, setGeneratedAudios] = useState<Record<string, string>>({});
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);

  // Gallery lightbox
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // QR Modal
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Determine artifact ID from props or URL
  const targetId = React.useMemo(() => {
    if (propArtifactId) return propArtifactId;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const qArtifact = searchParams.get('artifact') || searchParams.get('id') || searchParams.get('code');
      if (qArtifact) return qArtifact;

      const path = window.location.pathname;
      if (path.startsWith('/artifact/')) {
        const segments = path.split('/artifact/');
        if (segments[1]) return segments[1].split('/')[0];
      }
    } catch {}
    return null;
  }, [propArtifactId]);

  useEffect(() => {
    if (!targetId) {
      setError('Không tìm thấy mã hiện vật trong đường dẫn');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        let data: Artifact | null = null;
        try {
          data = await api.getArtifact(targetId);
        } catch (singleErr: any) {
          console.warn('[PublicArtifactView] Direct getArtifact failed, attempting list fallback lookup:', singleErr);
          try {
            const allArtifacts = await api.getArtifacts();
            const cleanTarget = targetId.trim().toLowerCase();
            const found = allArtifacts.find((item: any) =>
              (item.id && String(item.id).toLowerCase() === cleanTarget) ||
              (item._id && String(item._id).toLowerCase() === cleanTarget) ||
              (item.code && String(item.code).toLowerCase() === cleanTarget)
            );
            if (found) {
              data = found;
            } else {
              throw singleErr;
            }
          } catch {
            throw singleErr;
          }
        }

        const langs = await api.getLanguages().catch(() => [] as LanguageItem[]);
        setArtifact(data);
        if (langs && langs.length > 0) {
          setSystemLanguages(langs.filter((l) => l.isActive));
        }
      } catch (err: any) {
        const raw = err.message || '';
        if (raw.includes('<!DOCTYPE') || raw.includes('JSON') || raw.includes('Unexpected token')) {
          setError('Hệ thống máy chủ đang khởi động hoặc cập nhật. Vui lòng bấm "Thử tải lại".');
        } else {
          setError(raw || 'Không thể tải dữ liệu hiện vật');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [targetId, retryTrigger]);

  // Danh sách ngôn ngữ hiển thị: hợp nhất giữa API và context
  const displayLanguages = React.useMemo(() => {
    if (systemLanguages.length > 0) return systemLanguages;
    if (activeLanguages.length > 0) return activeLanguages;
    return [
      { code: 'vi', name: 'Tiếng Việt', nativeName: 'Tiếng Việt', flagIcon: '🇻🇳', isDefault: true, isActive: true, order: 1 },
      { code: 'en', name: 'English', nativeName: 'English', flagIcon: '🇬🇧', isDefault: false, isActive: true, order: 2 },
      { code: 'fr', name: 'French', nativeName: 'Français', flagIcon: '🇫🇷', isDefault: false, isActive: true, order: 3 },
      { code: 'zh', name: 'Chinese', nativeName: '中文', flagIcon: '🇨🇳', isDefault: false, isActive: true, order: 4 }
    ];
  }, [systemLanguages, activeLanguages]);

  // Bản dịch hiện tại của hiện vật
  const activeTranslation = React.useMemo(() => {
    if (!artifact) return null;
    if (currentLang === 'vi') return null;
    return artifact.translations?.[currentLang] || dynamicTranslations[currentLang] || null;
  }, [artifact, currentLang, dynamicTranslations]);

  // Tự động dịch On-The-Fly nếu cổ vật chưa có bản dịch lưu sẵn trong DB cho ngôn ngữ đang chọn
  useEffect(() => {
    if (!artifact || currentLang === 'vi') return;

    // Đã có bản dịch hoàn chỉnh trong artifact.translations
    const existing = artifact.translations?.[currentLang];
    if (existing && existing.name && existing.description) {
      return;
    }

    // Đã có bản dịch trong cache động
    if (dynamicTranslations[currentLang]?.name) {
      return;
    }

    let isMounted = true;
    setIsTranslatingDraft(true);

    api.translateDraft({
      targetLang: currentLang,
      name: artifact.name,
      period: artifact.period,
      description: artifact.description,
      narrationScript: (artifact as any).narrationScript || artifact.description
    })
      .then((draft) => {
        if (!isMounted || !draft) return;
        setDynamicTranslations((prev) => ({
          ...prev,
          [currentLang]: {
            name: draft.name || artifact.name,
            period: draft.period || artifact.period,
            description: draft.description || draft.narrationScript || artifact.description
          }
        }));
      })
      .catch((err) => {
        console.warn(`[PublicArtifactView] Translate draft for ${currentLang} failed:`, err);
      })
      .finally(() => {
        if (isMounted) setIsTranslatingDraft(false);
      });

    return () => {
      isMounted = false;
    };
  }, [artifact, currentLang, dynamicTranslations]);

  const displayName = activeTranslation?.name || (currentLang === 'vi' ? artifact?.name : dynamicTranslations[currentLang]?.name || artifact?.name || '');
  const displayPeriod = activeTranslation?.period || (currentLang === 'vi' ? artifact?.period : dynamicTranslations[currentLang]?.period || artifact?.period || '');
  const displayDescription =
    (activeTranslation as any)?.narrationScript ||
    activeTranslation?.description ||
    (currentLang === 'vi'
      ? artifact?.description || ''
      : dynamicTranslations[currentLang]?.description || artifact?.description || '');

  // Xác định file âm thanh Voice AI:
  // TUYỆT ĐỐI KHÔNG BAO GIỜ PHÁT TIẾNG VIỆT CHO KHÁCH ĐANG XEM NGÔN NGỮ NƯỚC NGOÀI!
  const activeAudioUrl = React.useMemo(() => {
    if (!artifact) return null;

    if (currentLang === 'vi') {
      const viUrl = artifact.translations?.vi?.audioNarrationUrl || artifact.audioNarrationUrl || null;
      if (!viUrl) return null;
      return viUrl.startsWith('http') ? viUrl : `${API_ROOT}${viUrl.startsWith('/') ? '' : '/'}${viUrl}`;
    }

    // 1. Kiểm tra audio lưu sẵn cho ngôn ngữ này trong translations
    const langTrans = artifact.translations?.[currentLang];
    if (langTrans?.audioNarrationUrl) {
      const u = langTrans.audioNarrationUrl;
      return u.startsWith('http') ? u : `${API_ROOT}${u.startsWith('/') ? '' : '/'}${u}`;
    }

    // 2. Kiểm tra audio đã được tạo động On-the-fly cho ngôn ngữ này
    if (generatedAudios[currentLang]) {
      const u = generatedAudios[currentLang];
      return u.startsWith('http') ? u : `${API_ROOT}${u.startsWith('/') ? '' : '/'}${u}`;
    }

    // KHÔNG fallback về tiếng Việt nếu ngôn ngữ đang xem khác 'vi'
    return null;
  }, [artifact, currentLang, generatedAudios]);

  // Quản lý audio element và tự động phát
  useEffect(() => {
    if (!activeAudioUrl) {
      if (audioRef) {
        audioRef.pause();
      }
      setIsPlayingAudio(false);
      return;
    }

    const audio = new Audio(activeAudioUrl);
    setAudioRef(audio);

    const onTimeUpdate = () => setAudioCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setAudioDuration(audio.duration);
    const onEnded = () => setIsPlayingAudio(false);
    const onPlay = () => setIsPlayingAudio(true);
    const onPause = () => setIsPlayingAudio(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlayingAudio(true))
        .catch(() => {
          setIsPlayingAudio(false);
          const handleFirstTouch = () => {
            audio.play().then(() => setIsPlayingAudio(true)).catch(() => {});
            window.removeEventListener('click', handleFirstTouch);
            window.removeEventListener('touchstart', handleFirstTouch);
            window.removeEventListener('pointerdown', handleFirstTouch);
          };
          window.addEventListener('click', handleFirstTouch, { once: true });
          window.addEventListener('touchstart', handleFirstTouch, { once: true });
          window.addEventListener('pointerdown', handleFirstTouch, { once: true });
        });
    }

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [activeAudioUrl]);

  // Phát âm thanh hoặc tự động sinh TTS theo đúng ngôn ngữ đang xem
  const toggleAudio = async () => {
    if (isPlayingAudio && audioRef) {
      audioRef.pause();
      setIsPlayingAudio(false);
      return;
    }

    if (activeAudioUrl && audioRef) {
      audioRef.play().then(() => setIsPlayingAudio(true)).catch(console.error);
      return;
    }

    // Nếu chưa có file âm thanh cho ngôn ngữ này -> tự động gọi Voice AI Engine sinh ngay tức thì
    if (currentLang !== 'vi' && displayDescription && !isGeneratingTts) {
      setIsGeneratingTts(true);
      try {
        const textToSpeak = displayDescription.slice(0, 450);
        const res = await api.generateTtsAudio({
          text: textToSpeak,
          langCode: currentLang,
          roomCode: artifact?.code || 'artifact'
        });

        if (res && res.audioUrl) {
          setGeneratedAudios((prev) => ({ ...prev, [currentLang]: res.audioUrl }));
        }
      } catch (err) {
        console.warn('[PublicArtifactView] Live TTS failed, falling back to Web Speech API:', err);
        // Fallback sang Web Speech API theo đúng ngôn ngữ hiện tại
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(displayDescription.slice(0, 300));
          utterance.lang = currentLang;
          utterance.onstart = () => setIsPlayingAudio(true);
          utterance.onend = () => setIsPlayingAudio(false);
          utterance.onerror = () => setIsPlayingAudio(false);
          window.speechSynthesis.speak(utterance);
        }
      } finally {
        setIsGeneratingTts(false);
      }
    }
  };

  const handleSelectLanguage = (langCode: string) => {
    if (audioRef) {
      audioRef.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    changeLanguage(langCode).catch(console.error);
  };

  const handleAudioSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef) return;
    const time = Number(e.target.value);
    audioRef.currentTime = time;
    setAudioCurrentTime(time);
  };

  const toggleAudioMute = () => {
    if (!audioRef) return;
    audioRef.muted = !isAudioMuted;
    setIsAudioMuted(!isAudioMuted);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopyLink = () => {
    const text = window.location.href;
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
        copied = true;
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copied = document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch {
      copied = false;
    }
    if (copied) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="public-artifact-loading-screen">
        <div className="artifact-spinner" />
        <p className="loading-text">{t('artifact.loading', 'Đang tải không gian di sản 3D...')}</p>
        <span className="loading-subtext">{branding.museumName}</span>
      </div>
    );
  }

  if (error || !artifact) {
    return (
      <div className="public-artifact-error-screen">
        <div className="error-card">
          <Info size={48} className="error-icon" />
          <h2>{t('artifact.notFound', 'Không tìm thấy cổ vật')}</h2>
          <p>{error || t('artifact.notFoundDesc', 'Hiện vật không tồn tại hoặc đã được chuyển vào kho lưu trữ bảo quản.')}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '18px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setError(null);
                setRetryTrigger((prev) => prev + 1);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}
            >
              <RefreshCw size={18} />
              {t('artifact.retry', 'Thử tải lại')}
            </button>
            <button
              className="btn btn-primary"
              onClick={onBackToTour || (() => (window.location.href = '/'))}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}
            >
              <Compass size={18} />
              {t('artifact.backToTour', 'Quay lại tham quan gian phòng')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-artifact-viewport">
      {/* Top Navigation Bar */}
      <header className="public-artifact-header">
        <div className="header-left">
          <button
            className="back-btn"
            onClick={onBackToTour || (() => (window.location.href = '/'))}
            title={t('artifact.backToRooms', 'Không gian trưng bày')}
          >
            <ArrowLeft size={18} />
            <span className="back-text">{t('artifact.backToRooms', 'Không gian trưng bày')}</span>
          </button>
          <div className="divider-vertical" />
          <div className="brand-group">
            <span className="museum-name">{branding.museumName || 'BẢO TÀNG LỊCH SỬ TP. HỒ CHÍ MINH'}</span>
            <span className="artifact-code-badge" data-no-auto-translate="true">{artifact.code}</span>
          </div>
        </div>

        <div className="header-right">
          {/* Language Switcher */}
          <div className="lang-selector-group">
            {displayLanguages.map((lang) => {
              const isCurrent = currentLang === lang.code;
              const hasVoice =
                lang.code === 'vi'
                  ? !!(artifact.audioNarrationUrl || artifact.translations?.vi?.audioNarrationUrl)
                  : !!(artifact.translations?.[lang.code]?.audioNarrationUrl || generatedAudios[lang.code]);

              return (
                <button
                  key={lang.code}
                  className={`lang-btn ${isCurrent ? 'active' : ''}`}
                  onClick={() => handleSelectLanguage(lang.code)}
                  title={`${lang.nativeName} (${lang.name})`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <span>{lang.flagIcon || lang.code.toUpperCase()}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>{lang.code.toUpperCase()}</span>
                  {hasVoice && (
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                        display: 'inline-block'
                      }}
                      title="Voice AI"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <button
            className="action-icon-btn"
            onClick={() => setIsQRModalOpen(true)}
            title={t('artifact.shareQr', 'Chia sẻ hoặc quét mã QR')}
          >
            <QrCode size={18} />
          </button>
          <button
            className="action-icon-btn"
            onClick={handleCopyLink}
            title={t('artifact.copyLinkSuccess', 'Sao chép liên kết')}
          >
            {copiedLink ? <Check size={18} color="#10B981" /> : <Share2 size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="public-artifact-main">
        {/* Left Column: 3D Turntable / Visual Presentation */}
        <section className="artifact-visual-stage">
          {artifact.model3dUrl ? (
            <div className="turntable-360-wrapper">
              <Turntable360Viewer
                modelUrl={
                  artifact.model3dUrl.startsWith('http')
                    ? artifact.model3dUrl
                    : `${API_ROOT}${artifact.model3dUrl.startsWith('/') ? '' : '/'}${artifact.model3dUrl}`
                }
                imageUrl={
                  artifact.thumbnailUrl ||
                  artifact.images?.[0] ||
                  undefined
                }
                artifactName={displayName}
                autoRotateSpeed={0.8}
                audioNarrationUrl={undefined}
                translations={artifact.translations}
                autoPlayAudio={false}
                height="100%"
              />
            </div>
          ) : (
            <div className="artifact-static-hero">
              <img
                src={
                  artifact.thumbnailUrl
                    ? (artifact.thumbnailUrl.startsWith('http')
                        ? artifact.thumbnailUrl
                        : `${API_ROOT}${artifact.thumbnailUrl}`)
                    : artifact.images?.[0]
                    ? (artifact.images[0].startsWith('http')
                        ? artifact.images[0]
                        : `${API_ROOT}${artifact.images[0]}`)
                    : '/placeholder.jpg'
                }
                alt={displayName}
                className="hero-image"
              />
              <div className="hero-gradient-overlay" />
              <div className="no-3d-notice">
                <Layers size={20} />
                <span>{t('artifact.model3dCreating', 'Hiện vật đang được số hóa tạo lập mô hình 3D')}</span>
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Information, Heritage Context & Audio Guide */}
        <aside className="artifact-info-sidebar">
          {/* Category & Status Badges */}
          <div className="meta-badge-row">
            <span className="category-pill">{artifact.category}</span>
            {displayPeriod && (
              <span className="period-pill">
                <Calendar size={13} />
                {displayPeriod}
              </span>
            )}
            {artifact.origin && (
              <span className="origin-pill">
                <MapPin size={13} />
                {artifact.origin}
              </span>
            )}
          </div>

          {/* Title & Name */}
          <h1 className="artifact-title">{displayName}</h1>

          {/* AI Voice Narration Guide Player */}
          {(activeAudioUrl || displayDescription) && (
            <div className={`voice-guide-player ${isPlayingAudio ? 'is-playing' : ''}`}>
              <div className="player-top">
                <div className="player-info">
                  <div className={`guide-icon-pulse ${isPlayingAudio ? 'anim-pulse' : ''}`}>
                    <Volume2 size={20} />
                  </div>
                  <div className="guide-meta-texts">
                    <div className="guide-title-row">
                      <span className="guide-label">{t('artifact.narrationGuide', 'Giới thiệu hiện vật')}</span>
                      <span className="guide-badge-ai">Voice AI</span>
                    </div>
                    <div className="guide-lang-sub">
                      <span className="lang-status-dot" />
                      {t('artifact.language', 'Ngôn ngữ')}:{' '}
                      <strong className="lang-highlight">
                        {displayLanguages.find((l) => l.code === currentLang)?.nativeName || currentLang.toUpperCase()}
                      </strong>
                    </div>
                  </div>
                </div>

                {activeAudioUrl && (
                  <button
                    type="button"
                    className={`mute-btn ${isAudioMuted ? 'muted' : ''}`}
                    onClick={toggleAudioMute}
                    title={isAudioMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
                  >
                    {isAudioMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                )}
              </div>

              {/* Progress Bar & Slider */}
              {activeAudioUrl && (
                <div className="player-progress-row">
                  <span className="player-time current">{formatTime(audioCurrentTime)}</span>
                  <div className="slider-wrapper">
                    <input
                      type="range"
                      min="0"
                      max={audioDuration || 100}
                      step="0.1"
                      value={audioCurrentTime}
                      onChange={handleAudioSeek}
                      className="player-slider"
                    />
                  </div>
                  <span className="player-time total">{formatTime(audioDuration)}</span>
                </div>
              )}

              <div className="player-actions">
                <button
                  type="button"
                  className={`btn-play-pause ${isPlayingAudio ? 'playing' : ''}`}
                  onClick={toggleAudio}
                  disabled={isGeneratingTts}
                >
                  {isGeneratingTts ? (
                    <>
                      <Loader2 size={17} className="anim-spin" />
                      <span>Voice AI...</span>
                    </>
                  ) : isPlayingAudio ? (
                    <>
                      <Pause size={17} />
                      <span>{t('artifact.pauseAudio', 'Tạm dừng nghe')}</span>
                    </>
                  ) : (
                    <>
                      <Play size={17} />
                      <span>{t('artifact.playAudio', 'Nghe giới thiệu hiện vật')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Technical Specifications Matrix */}
          <div className="specifications-box">
            <h3 className="section-heading">
              <Tag size={15} />
              <span>{t('artifact.specsTitle', 'Thông số di sản & Hồ sơ khoa học')}</span>
            </h3>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">{t('artifact.identifier', 'Mã định danh')}</span>
                <span className="spec-val highlight-gold" data-no-auto-translate="true">{artifact.code}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">{t('artifact.chronology', 'Niên đại lịch sử')}</span>
                <span className="spec-val">{displayPeriod || artifact.period || 'Chưa cập nhật'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">{t('artifact.originDiscovery', 'Nguồn gốc phát hiện')}</span>
                <span className="spec-val">{artifact.origin || 'Bảo tàng Lịch sử TP.HCM'}</span>
              </div>
              {artifact.dimensions && (
                <div className="spec-item">
                  <span className="spec-label">{t('artifact.measurements', 'Kích thước đo đạc')}</span>
                  <span className="spec-val" data-no-auto-translate="true">{artifact.dimensions}</span>
                </div>
              )}
              {artifact.modelMetadata && (
                <>
                  <div className="spec-item">
                    <span className="spec-label">{t('artifact.meshResolution', 'Độ phân giải lưới 3D')}</span>
                    <span className="spec-val">
                      <span data-no-auto-translate="true">{artifact.modelMetadata.vertices?.toLocaleString()}</span>{' '}
                      <span>{t('artifact.vertices', 'đỉnh (Vertices)')}</span>
                    </span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">{t('artifact.geometricStructure', 'Cấu trúc hình học')}</span>
                    <span className="spec-val">{t('artifact.manifoldHousing', 'Vỏ kín đa diện Manifold')}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Narrative / History Description */}
          <div className="description-box">
            <h3 className="section-heading">
              <Info size={15} />
              <span>{t('artifact.significanceTitle', 'Giá trị lịch sử & Ý nghĩa văn hóa')}</span>
              {isTranslatingDraft && (
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold, #d4a86a)', marginLeft: 8 }}>
                  (AI Translating...)
                </span>
              )}
            </h3>
            <div className="description-text">
              {displayDescription ? (
                displayDescription.split('\n\n').map((paragraph: string, idx: number) => (
                  <p key={idx}>{paragraph}</p>
                ))
              ) : (
                <p className="empty-text">{t('artifact.emptyStory', 'Đang cập nhật câu chuyện lịch sử cho cổ vật này...')}</p>
              )}
            </div>
          </div>

          {/* Photographic Archive Gallery */}
          {artifact.images && artifact.images.length > 0 && (
            <div className="photo-gallery-section">
              <h3 className="section-heading">
                <Layers size={15} />
                <span>{t('artifact.archivedImages', 'Hình ảnh lưu trữ tư liệu')}</span>
                <span className="spec-count" data-no-auto-translate="true">({artifact.images.length})</span>
              </h3>
              <div className="photo-grid">
                {artifact.images.map((imgUrl, i) => {
                  const fullUrl = imgUrl.startsWith('http') ? imgUrl : `${API_ROOT}${imgUrl}`;
                  return (
                    <div
                      key={i}
                      className={`photo-thumb ${i === activeImageIndex ? 'active' : ''}`}
                      onClick={() => {
                        setActiveImageIndex(i);
                        setIsLightboxOpen(true);
                      }}
                    >
                      <img src={fullUrl} alt={`${displayName} ${i + 1}`} loading="lazy" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </main>

      {/* Lightbox Modal */}
      {isLightboxOpen && artifact.images && (
        <div className="artifact-lightbox-modal" onClick={() => setIsLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setIsLightboxOpen(false)}>
            <X size={24} />
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={
                artifact.images[activeImageIndex].startsWith('http')
                  ? artifact.images[activeImageIndex]
                  : `${API_ROOT}${artifact.images[activeImageIndex]}`
              }
              alt=""
            />
            {artifact.images.length > 1 && (
              <>
                <button
                  className="lightbox-nav-btn prev"
                  onClick={() =>
                    setActiveImageIndex((prev) =>
                      prev > 0 ? prev - 1 : artifact.images.length - 1
                    )
                  }
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  className="lightbox-nav-btn next"
                  onClick={() =>
                    setActiveImageIndex((prev) =>
                      prev < artifact.images.length - 1 ? prev + 1 : 0
                    )
                  }
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* QR Code Share Modal */}
      {isQRModalOpen && (
        <div className="artifact-qr-modal-overlay" onClick={() => setIsQRModalOpen(false)}>
          <div className="artifact-qr-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsQRModalOpen(false)}>
              <X size={20} />
            </button>
            <div className="qr-card-header">
              <QrCode size={28} className="gold-icon" />
              <h3>{t('rooms.qrModalTitle', 'Mã QR Khám Phá Cổ Vật')}</h3>
              <p>{t('rooms.scanToExplore', 'Quét mã bằng camera điện thoại để chiêm ngưỡng mô hình 3D và nghe giới thiệu hiện vật')}</p>
            </div>

            <div className="qr-image-wrapper">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${window.location.origin}/?artifact=${encodeURIComponent(artifact.code || artifact.id)}`)}`}
                alt={`QR ${artifact.code}`}
                className="qr-img"
              />
            </div>

            <div className="qr-artifact-meta">
              <strong>{displayName}</strong>
              <span data-no-auto-translate="true">Mã: {artifact.code}</span>
            </div>

            <div className="qr-modal-actions">
              <button className="btn btn-secondary" onClick={handleCopyLink}>
                {copiedLink ? <Check size={16} /> : <Share2 size={16} />}
                {copiedLink ? 'Đã sao chép' : 'Sao chép liên kết'}
              </button>
              <a
                href={api.getArtifactQRDownloadUrl(artifact.code || artifact.id)}
                download={`QR_${artifact.code}.png`}
                className="btn btn-primary"
              >
                Tải ảnh mã QR
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
