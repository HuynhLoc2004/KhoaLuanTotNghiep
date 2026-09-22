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
  Check
} from 'lucide-react';
import { api, API_ROOT } from '../../services/api';
import { Artifact, LanguageItem } from '../../types';
import { Turntable360Viewer } from '../../components/Turntable360Viewer';
import { useSystemBranding } from '../../context/SystemBrandingContext';

interface PublicArtifactViewProps {
  artifactId?: string;
  onBackToTour?: () => void;
}

export const PublicArtifactView: React.FC<PublicArtifactViewProps> = ({
  artifactId: propArtifactId,
  onBackToTour
}) => {
  const { branding } = useSystemBranding();
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [systemLanguages, setSystemLanguages] = useState<LanguageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const qArtifact = searchParams.get('artifact');
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
        const [data, langs] = await Promise.all([
          api.getArtifact(targetId),
          api.getLanguages().catch(() => [] as LanguageItem[])
        ]);
        setArtifact(data);
        if (langs && langs.length > 0) {
          setSystemLanguages(langs.filter((l) => l.isActive));
        }
        if (data.voiceLanguage) {
          setSelectedLanguage(data.voiceLanguage);
        }
      } catch (err: any) {
        setError(err.message || 'Không thể tải dữ liệu hiện vật');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [targetId]);

  // Audio handling
  const activeAudioUrl = React.useMemo(() => {
    if (!artifact) return null;
    if (selectedLanguage !== 'vi' && artifact.translations) {
      const trans = artifact.translations[selectedLanguage];
      if (trans && trans.audioNarrationUrl) {
        return trans.audioNarrationUrl.startsWith('http')
          ? trans.audioNarrationUrl
          : `${API_ROOT}${trans.audioNarrationUrl}`;
      }
    }
    if (artifact.audioNarrationUrl) {
      return artifact.audioNarrationUrl.startsWith('http')
        ? artifact.audioNarrationUrl
        : `${API_ROOT}${artifact.audioNarrationUrl}`;
    }
    return null;
  }, [artifact, selectedLanguage]);

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

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    // Tự động phát thuyết minh khi du khách quét mã QR xem cổ vật
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
          };
          window.addEventListener('click', handleFirstTouch, { once: true });
          window.addEventListener('touchstart', handleFirstTouch, { once: true });
        });
    }

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
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
          <button
            className="btn btn-primary"
            onClick={onBackToTour || (() => (window.location.href = '/'))}
          >
            <Compass size={18} />
            Quay lại tham quan gian phòng
          </button>
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
                    onClick={() => setSelectedLanguage(lang.code)}
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
                  onClick={() => setSelectedLanguage(code)}
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
                    : `${API_ROOT}${artifact.model3dUrl}`
                }
                artifactName={displayName}
                autoRotateSpeed={0.8}
                audioNarrationUrl={activeAudioUrl || undefined}
                height="100%"
              />
              <div className="stage-badge">
                <Sparkles size={14} className="sparkle-icon" />
                <span>MÔ PHỎNG 3D XOAY 360° ĐĨA NGỌC NERO MARQUINA</span>
              </div>
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
            <div className="voice-guide-player">
              <div className="player-top">
                <div className="player-info">
                  <div className="guide-icon-pulse">
                    <Volume2 size={16} />
                  </div>
                  <div>
                    <div className="guide-label">Thuyết minh giọng đọc Di sản AI</div>
                    <div className="guide-lang-sub">
                      Ngôn ngữ:{' '}
                      {systemLanguages.find((l) => l.code === selectedLanguage)?.nativeName ||
                        (selectedLanguage === 'vi'
                          ? 'Tiếng Việt'
                          : selectedLanguage === 'en'
                          ? 'English'
                          : selectedLanguage === 'fr'
                          ? 'Français'
                          : selectedLanguage === 'zh'
                          ? '中文'
                          : selectedLanguage.toUpperCase())}
                    </div>
                  </div>
                </div>

                <button
                  className="mute-btn"
                  onClick={toggleAudioMute}
                  title={isAudioMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
                >
                  {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              </div>

              {/* Progress Bar */}
              <div className="player-progress-row">
                <span className="player-time">{formatTime(audioCurrentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={audioDuration || 100}
                  step="0.1"
                  value={audioCurrentTime}
                  onChange={handleAudioSeek}
                  className="player-slider"
                />
                <span className="player-time">{formatTime(audioDuration)}</span>
              </div>

              <div className="player-actions">
                <button
                  className={`btn-play-pause ${isPlayingAudio ? 'playing' : ''}`}
                  onClick={toggleAudio}
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause size={16} />
                      <span>Tạm dừng</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      <span>Nghe thuyết minh</span>
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
              <h3>Mã QR Quét Xem Cổ Vật</h3>
              <p>Quét mã bằng camera điện thoại để mở trực tiếp mô hình 3D và nghe thuyết minh</p>
            </div>

            <div className="qr-image-wrapper">
              <img
                src={
                  artifact.qrCodeUrl ||
                  api.getArtifactQRDownloadUrl(artifact.id)
                }
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
                href={api.getArtifactQRDownloadUrl(artifact.id)}
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
