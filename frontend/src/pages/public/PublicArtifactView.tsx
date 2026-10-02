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
  Maximize2,
  Tag,
  Info,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  RefreshCw
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
  const { currentLang, changeLanguage } = useClientTranslation();
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [systemLanguages, setSystemLanguages] = useState<LanguageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Audio player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('vi');
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

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
          // Fallback: Tìm trong danh sách hiện vật (hỗ trợ theo code, id, mongoId)
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

        // Tự động xác định ngôn ngữ thuyết minh tương ứng với ngôn ngữ du khách đang xem trên trang
        const clientLang = currentLang || localStorage.getItem('museum_client_lang') || 'vi';
        const hasClientLangVoice =
          clientLang === 'vi'
            ? !!(data.audioNarrationUrl || data.translations?.vi?.audioNarrationUrl)
            : !!(data.translations?.[clientLang]?.audioNarrationUrl);

        if (hasClientLangVoice) {
          // Ngôn ngữ client chọn có sẵn giọng đọc thuyết minh
          setSelectedLanguage(clientLang);
        } else {
          // Ngôn ngữ du khách đang dùng không có text/voice -> tự động fallback về tiếng Việt (ngôn ngữ chính của website)
          const hasViVoice = !!(data.audioNarrationUrl || data.translations?.vi?.audioNarrationUrl);
          if (hasViVoice) {
            setSelectedLanguage('vi');
          } else {
            // Nếu tiếng Việt cũng chưa có, lấy ngôn ngữ đầu tiên có sẵn voice
            const anyLang = Object.entries(data.translations || {}).find(
              ([_, trans]: [string, any]) => !!trans?.audioNarrationUrl
            );
            setSelectedLanguage(anyLang ? anyLang[0] : clientLang);
          }
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

  // Đồng bộ khi du khách chuyển đổi ngôn ngữ trên trang
  useEffect(() => {
    if (!artifact) return;
    const clientLang = currentLang || localStorage.getItem('museum_client_lang') || 'vi';
    const hasClientLangVoice =
      clientLang === 'vi'
        ? !!(artifact.audioNarrationUrl || artifact.translations?.vi?.audioNarrationUrl)
        : !!(artifact.translations?.[clientLang]?.audioNarrationUrl);

    if (hasClientLangVoice) {
      setSelectedLanguage(clientLang);
    } else {
      const hasViVoice = !!(artifact.audioNarrationUrl || artifact.translations?.vi?.audioNarrationUrl);
      if (hasViVoice) {
        setSelectedLanguage('vi');
      }
    }
  }, [currentLang, artifact]);

  // Xác định ngôn ngữ thực tế của giọng đọc phát ra (dùng để hiển thị nhãn thuyết minh chính xác)
  const actualSpokenLang = React.useMemo(() => {
    if (!artifact) return 'vi';
    if (selectedLanguage !== 'vi' && artifact.translations?.[selectedLanguage]?.audioNarrationUrl) {
      return selectedLanguage;
    }
    if (artifact.audioNarrationUrl || artifact.translations?.vi?.audioNarrationUrl) {
      return 'vi';
    }
    if (artifact.translations) {
      const anyLang = Object.entries(artifact.translations).find(([_, t]: [string, any]) => !!t?.audioNarrationUrl);
      if (anyLang) return anyLang[0];
    }
    return selectedLanguage;
  }, [artifact, selectedLanguage]);

  // Audio handling: ưu tiên ngôn ngữ chọn, tự động fallback về tiếng Việt nếu ngôn ngữ chọn không có voice
  const activeAudioUrl = React.useMemo(() => {
    if (!artifact) return null;
    let url: string | null = null;
    if (selectedLanguage !== 'vi' && artifact.translations) {
      const trans = artifact.translations[selectedLanguage];
      if (trans && trans.audioNarrationUrl) {
        url = trans.audioNarrationUrl;
      }
    }
    // Nếu ngôn ngữ đang xem không có voice -> fallback về tiếng Việt (ngôn ngữ chính gốc)
    if (!url) {
      url = artifact.translations?.vi?.audioNarrationUrl || artifact.audioNarrationUrl || null;
    }
    // Nếu vẫn chưa có, lấy bất kỳ ngôn ngữ nào có voice
    if (!url && artifact.translations) {
      const anyVoice = Object.values(artifact.translations).find((t: any) => !!t?.audioNarrationUrl) as any;
      if (anyVoice?.audioNarrationUrl) {
        url = anyVoice.audioNarrationUrl;
      }
    }
    if (!url) return null;
    return url.startsWith('http') ? url : `${API_ROOT}${url.startsWith('/') ? '' : '/'}${url}`;
  }, [artifact, selectedLanguage]);

  // Tự động phát thuyết minh Voice AI khi vào xem hiện vật 3D
  useEffect(() => {
    if (!activeAudioUrl) {
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

    // Tự động phát ngay lập tức khi vào xem mô hình 3D cổ vật
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlayingAudio(true);
        })
        .catch(() => {
          // Trình duyệt di động hạn chế autoplay khi chưa có cử chỉ người dùng
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

  const toggleAudio = () => {
    if (!audioRef) return;
    if (isPlayingAudio) {
      audioRef.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.play().then(() => setIsPlayingAudio(true)).catch(console.error);
    }
  };

  const handleSelectLanguage = (langCode: string) => {
    setSelectedLanguage(langCode);
    if (changeLanguage) {
      changeLanguage(langCode).catch(() => {});
    }
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
      }
    } catch {}

    if (!copied) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        copied = true;
      } catch {}
    }

    if (copied) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Get active translation or default content
  const activeTranslation = React.useMemo(() => {
    if (!artifact || selectedLanguage === 'vi' || !artifact.translations) return null;
    return artifact.translations[selectedLanguage] || null;
  }, [artifact, selectedLanguage]);

  const displayName = activeTranslation?.name || artifact?.name || '';
  const displayPeriod = activeTranslation?.period || artifact?.period || '';
  const displayDescription =
    activeTranslation?.narrationScript ||
    activeTranslation?.description ||
    artifact?.description ||
    '';

  if (loading) {
    return (
      <div className="public-artifact-loading-screen">
        <div className="artifact-spinner" />
        <p className="loading-text">Đang tải không gian di sản 3D...</p>
        <span className="loading-subtext">{branding.museumName}</span>
      </div>
    );
  }

  if (error || !artifact) {
    return (
      <div className="public-artifact-error-screen">
        <div className="error-card">
          <Info size={48} className="error-icon" />
          <h2>Không tìm thấy cổ vật</h2>
          <p>{error || 'Hiện vật không tồn tại hoặc đã được chuyển vào kho lưu trữ bảo quản.'}</p>
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
              Thử tải lại
            </button>
            <button
              className="btn btn-primary"
              onClick={onBackToTour || (() => (window.location.href = '/'))}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}
            >
              <Compass size={18} />
              Quay lại tham quan gian phòng
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
            title="Quay lại tham quan"
          >
            <ArrowLeft size={18} />
            <span className="back-text">Không gian trưng bày</span>
          </button>
          <div className="divider-vertical" />
          <div className="brand-group">
            <span className="museum-name">{branding.museumName || 'BẢO TÀNG LỊCH SỬ TP. HỒ CHÍ MINH'}</span>
            <span className="artifact-code-badge">{artifact.code}</span>
          </div>
        </div>

        <div className="header-right">
          {/* Language Switcher */}
          <div className="lang-selector-group">
            {systemLanguages.length > 0 ? (
              systemLanguages.map((lang) => {
                const hasVoice =
                  lang.code === 'vi'
                    ? !!(artifact.audioNarrationUrl || artifact.translations?.vi?.audioNarrationUrl)
                    : !!artifact.translations?.[lang.code]?.audioNarrationUrl;

                return (
                  <button
                    key={lang.code}
                    className={`lang-btn ${selectedLanguage === lang.code ? 'active' : ''}`}
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
                        title="Có giọng đọc Voice AI"
                      />
                    )}
                  </button>
                );
              })
            ) : (
              ['vi', 'en', 'fr', 'zh'].map((code) => (
                <button
                  key={code}
                  className={`lang-btn ${selectedLanguage === code ? 'active' : ''}`}
                  onClick={() => handleSelectLanguage(code)}
                >
                  {code.toUpperCase()}
                </button>
              ))
            )}
          </div>

          <button
            className="action-icon-btn"
            onClick={() => setIsQRModalOpen(true)}
            title="Chia sẻ hoặc quét mã QR"
          >
            <QrCode size={18} />
          </button>
          <button
            className="action-icon-btn"
            onClick={handleCopyLink}
            title="Sao chép liên kết"
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
                <span>Hiện vật đang được số hóa tạo lập mô hình 3D</span>
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
          {activeAudioUrl && (
            <div className={`voice-guide-player ${isPlayingAudio ? 'is-playing' : ''}`}>
              <div className="player-top">
                <div className="player-info">
                  <div className={`guide-icon-pulse ${isPlayingAudio ? 'anim-pulse' : ''}`}>
                    <Volume2 size={20} />
                  </div>
                  <div className="guide-meta-texts">
                    <div className="guide-title-row">
                      <span className="guide-label">Giới thiệu hiện vật</span>
                      <span className="guide-badge-ai">Voice AI</span>
                    </div>
                    <div className="guide-lang-sub">
                      <span className="lang-status-dot" />
                      Ngôn ngữ:{' '}
                      <strong className="lang-highlight">
                        {systemLanguages.find((l) => l.code === actualSpokenLang)?.nativeName ||
                          (actualSpokenLang === 'vi'
                            ? 'Tiếng Việt'
                            : actualSpokenLang === 'en'
                            ? 'English'
                            : actualSpokenLang === 'fr'
                            ? 'Français'
                            : actualSpokenLang === 'zh'
                            ? '中文'
                            : actualSpokenLang.toUpperCase())}
                      </strong>
                      {actualSpokenLang !== selectedLanguage && (
                        <span className="lang-fallback-tag">
                          (Dùng bản Tiếng Việt)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className={`mute-btn ${isAudioMuted ? 'muted' : ''}`}
                  onClick={toggleAudioMute}
                  title={isAudioMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
                >
                  {isAudioMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>

              {/* Progress Bar & Slider */}
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

              <div className="player-actions">
                <button
                  type="button"
                  className={`btn-play-pause ${isPlayingAudio ? 'playing' : ''}`}
                  onClick={toggleAudio}
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause size={17} />
                      <span>Tạm dừng nghe</span>
                    </>
                  ) : (
                    <>
                      <Play size={17} />
                      <span>Nghe giới thiệu hiện vật</span>
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
              Thông số di sản & Hồ sơ khoa học
            </h3>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">Mã định danh</span>
                <span className="spec-val highlight-gold">{artifact.code}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Niên đại lịch sử</span>
                <span className="spec-val">{displayPeriod || artifact.period || 'Chưa cập nhật'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Nguồn gốc phát hiện</span>
                <span className="spec-val">{artifact.origin || 'Bảo tàng Lịch sử TP.HCM'}</span>
              </div>
              {artifact.dimensions && (
                <div className="spec-item">
                  <span className="spec-label">Kích thước đo đạc</span>
                  <span className="spec-val">{artifact.dimensions}</span>
                </div>
              )}
              {artifact.modelMetadata && (
                <>
                  <div className="spec-item">
                    <span className="spec-label">Độ phân giải lưới 3D</span>
                    <span className="spec-val">{artifact.modelMetadata.vertices?.toLocaleString()} đỉnh (Vertices)</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Cấu trúc hình học</span>
                    <span className="spec-val">Vỏ kín đa diện Manifold</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Narrative / History Description */}
          <div className="description-box">
            <h3 className="section-heading">
              <Info size={15} />
              Giá trị lịch sử & Ý nghĩa văn hóa
            </h3>
            <div className="description-text">
              {displayDescription ? (
                displayDescription.split('\n\n').map((paragraph: string, idx: number) => (
                  <p key={idx}>{paragraph}</p>
                ))
              ) : (
                <p className="empty-text">Đang cập nhật câu chuyện lịch sử cho cổ vật này...</p>
              )}
            </div>
          </div>

          {/* Photographic Archive Gallery */}
          {artifact.images && artifact.images.length > 0 && (
            <div className="photo-gallery-section">
              <h3 className="section-heading">
                <Layers size={15} />
                Hình ảnh lưu trữ tư liệu ({artifact.images.length})
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
              <h3>Mã QR Khám Phá Cổ Vật</h3>
              <p>Quét mã bằng camera điện thoại để chiêm ngưỡng mô hình 3D và nghe giới thiệu hiện vật</p>
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
              <span>Mã: {artifact.code}</span>
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
