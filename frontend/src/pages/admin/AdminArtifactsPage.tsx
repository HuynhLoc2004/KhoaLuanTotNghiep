import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Plus,
  Search,
  RotateCw,
  Box,
  Layers,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  Camera,
  Image as ImageIcon,
  QrCode,
  Edit3,
  Trash2,
  Sparkles,
  LayoutGrid,
  List,
  Compass,
  MapPin,
  Calendar,
  Volume2,
  ExternalLink,
  Tag,
  Landmark,
  Share2,
  Check,
  Printer,
  Copy,
  Play,
  Languages,
  BookOpen,
  Mic,
  Info,
  Globe
} from 'lucide-react';
import { api, API_ROOT } from '../../services/api';
import { Artifact, LanguageItem } from '../../types';
import { Turntable360Viewer } from '../../components/Turntable360Viewer';
import { Pagination } from '../../components/Pagination';
import { useToast } from '../../components/Toast';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { ConfirmModal } from '../../components/ConfirmModal';

export const AdminArtifactsPage: React.FC = () => {
  const { showToast } = useToast();
  const { branding } = useSystemBranding();
  const { t, currentLang } = useClientTranslation();

  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus3D, setSelectedStatus3D] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingArtifact, setEditingArtifact] = useState<Partial<Artifact> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
  const [activeViewerArtifact, setActiveViewerArtifact] = useState<Artifact | null>(null);

  // Standee QR Modal
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [activeQRArtifact, setActiveQRArtifact] = useState<Artifact | null>(null);

  // 3D Generation Modal
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generatingArtifact, setGeneratingArtifact] = useState<Artifact | null>(null);
  const [depthScale, setDepthScale] = useState(0.35);
  const [isProcessing3D, setIsProcessing3D] = useState(false);
  const [autoGenerate3D, setAutoGenerate3D] = useState(true);

  // Multilingual Voice AI Drawer / Modal
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [activeVoiceArtifact, setActiveVoiceArtifact] = useState<Artifact | null>(null);
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<string>('vi');
  const [voiceName, setVoiceName] = useState<string>('');
  const [voicePeriod, setVoicePeriod] = useState<string>('');
  const [voiceScript, setVoiceScript] = useState<string>('');
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [isSavingVoice, setIsSavingVoice] = useState(false);

  // Heritage Confirm Dialog
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

  // Polling ref cho các job 3D đang chạy
  const pollingTimerRef = useRef<any>(null);

  const fetchArtifacts = async () => {
    try {
      setLoading(true);
      const data = await api.getArtifacts();
      setArtifacts(data);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải danh sách hiện vật', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLanguages = async () => {
    try {
      const data = await api.getLanguages();
      setLanguages(data.filter((l) => l.isActive));
    } catch {
      // Fallback default languages
      setLanguages([
        { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flagIcon: '🇻🇳', isDefault: true, isActive: true, order: 1 },
        { code: 'en', name: 'English', nativeName: 'English', flagIcon: '🇬🇧', isDefault: false, isActive: true, order: 2 },
        { code: 'fr', name: 'French', nativeName: 'Français', flagIcon: '🇫🇷', isDefault: false, isActive: true, order: 3 },
        { code: 'zh', name: 'Chinese', nativeName: '中文', flagIcon: '🇨🇳', isDefault: false, isActive: true, order: 4 },
        { code: 'ja', name: 'Japanese', nativeName: '日本語', flagIcon: '🇯🇵', isDefault: false, isActive: true, order: 5 }
      ]);
    }
  };

  useEffect(() => {
    fetchArtifacts();
    fetchLanguages();
  }, []);

  // Polling tự động khi có hiện vật đang trong trạng thái 'processing'
  useEffect(() => {
    const hasProcessing = artifacts.some((a) => a.processingStatus === 'processing');
    if (hasProcessing) {
      pollingTimerRef.current = setInterval(async () => {
        try {
          const freshList = await api.getArtifacts();
          setArtifacts(freshList);

          // Tự động đồng bộ modal xem 3D nếu người dùng đang mở đĩa xoay của hiện vật này
          setActiveViewerArtifact((prev) => {
            if (!prev) return null;
            const updated = freshList.find((a) => (a.id || (a as any)._id) === (prev.id || (prev as any)._id));
            return updated || prev;
          });

          const stillProcessing = freshList.some((a) => a.processingStatus === 'processing');
          if (!stillProcessing && pollingTimerRef.current) {
            clearInterval(pollingTimerRef.current);
            showToast('Đã hoàn thành số hóa mô hình 3D cho các hiện vật trong hàng đợi!', 'success');
          }
        } catch {
          // Ignored in polling
        }
      }, 2500);
    } else if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
    }

    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [artifacts]);

  // Danh sách danh mục thực tế từ dữ liệu hiện vật
  const availableCategories = useMemo(() => {
    const defaultCats = [
      'Cổ vật di sản',
      'Gốm sứ cổ',
      'Kim loại / Đồ đồng',
      'Điêu khắc đá / gỗ',
      'Trang phục cung đình',
      'Châu bản / Sắc phong'
    ];
    const fromData = artifacts.map((a) => a.category?.trim()).filter(Boolean) as string[];
    return Array.from(new Set([...defaultCats, ...fromData]));
  }, [artifacts]);

  // Lọc dữ liệu hiện vật
  const filteredArtifacts = useMemo(() => {
    return artifacts.filter((art) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        art.name.toLowerCase().includes(q) ||
        art.code.toLowerCase().includes(q) ||
        (art.period && art.period.toLowerCase().includes(q)) ||
        (art.origin && art.origin.toLowerCase().includes(q)) ||
        (art.description && art.description.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'all' ||
        art.category?.trim() === selectedCategory;

      const matches3D =
        selectedStatus3D === 'all' ||
        (selectedStatus3D === 'has_3d' && !!art.model3dUrl) ||
        (selectedStatus3D === 'processing' && art.processingStatus === 'processing') ||
        (selectedStatus3D === 'no_3d' && !art.model3dUrl && art.processingStatus !== 'processing');

      return matchesSearch && matchesCategory && matches3D;
    });
  }, [artifacts, searchQuery, selectedCategory, selectedStatus3D]);

  // Phân trang danh sách
  const paginatedArtifacts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredArtifacts.slice(start, start + pageSize);
  }, [filteredArtifacts, currentPage, pageSize]);

  // Thống kê di sản chuẩn mực của hệ thống
  const totalArtifacts = artifacts.length;
  const with3DCount = artifacts.filter((a) => !!a.model3dUrl).length;
  const percent3D = totalArtifacts > 0 ? Math.round((with3DCount / totalArtifacts) * 100) : 0;
  const withAudioCount = artifacts.filter((a) => !!a.audioNarrationUrl || (a.translations && Object.values(a.translations).some((t) => !!t.audioNarrationUrl))).length;
  const withQrCount = artifacts.filter((a) => !!a.qrCodeUrl).length;

  const handleCreateNew = () => {
    setAutoGenerate3D(true);
    setEditingArtifact({
      code: `HV-${100 + Math.floor(Math.random() * 900)}`,
      name: '',
      category: 'Cổ vật di sản',
      period: 'Thời Lý - Trần (Thế kỷ XI - XIV)',
      origin: 'Bảo tàng Lịch sử TP.HCM',
      description: '',
      dimensions: '',
      images: [],
      thumbnailUrl: '',
      model3dUrl: '',
      audioNarrationUrl: '',
      voiceLanguage: 'vi',
      status: 'active'
    });
    setIsEditModalOpen(true);
  };

  const handleEdit = (artifact: Artifact) => {
    const targetId = artifact.id || (artifact as any)._id;
    setAutoGenerate3D(!artifact.model3dUrl);
    setEditingArtifact({ ...artifact, id: targetId });
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    const validId = (id && id !== 'undefined' && id !== 'null') ? String(id).trim() : '';
    if (!validId) {
      showToast('Lỗi: Không tìm thấy mã định danh hiện vật để xóa', 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Xóa hồ sơ hiện vật',
      message: `Bạn có chắc chắn muốn xóa hồ sơ hiện vật "${name}" khỏi sổ đăng ký bảo tàng? Mọi điểm liên kết trong gian phòng 360° cũng sẽ được tự động giải phóng. Thao tác này không thể hoàn tác.`,
      type: 'danger',
      confirmText: 'Xóa vĩnh viễn',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          await api.deleteArtifact(validId);
          showToast(`Đã xóa hiện vật "${name}" thành công`, 'success');
          fetchArtifacts();
        } catch (err: any) {
          showToast(err.message || 'Lỗi khi xóa hiện vật', 'error');
        }
      }
    });
  };

  const handleSaveArtifact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtifact || !editingArtifact.name || !editingArtifact.code) {
      showToast('Vui lòng nhập đầy đủ Tên và Mã hiện vật', 'error');
      return;
    }

    try {
      setIsSaving(true);
      let savedArtifact: Artifact;
      if (editingArtifact.id) {
        savedArtifact = await api.updateArtifact(editingArtifact.id, editingArtifact);
        showToast('Đã cập nhật hồ sơ hiện vật thành công!', 'success');
      } else {
        savedArtifact = await api.createArtifact(editingArtifact);
        showToast('Đã thêm hồ sơ hiện vật mới vào sổ lưu trữ di sản!', 'success');
      }

      const targetId = savedArtifact.id || (savedArtifact as any)._id;
      const hasImage = (savedArtifact.images && savedArtifact.images.length > 0) || savedArtifact.thumbnailUrl;
      const hasModel = !!savedArtifact.model3dUrl;

      // Tự động kích hoạt tạo mô hình 3D trong nền nếu người dùng bật và hiện vật có ảnh nhưng chưa có model
      if (autoGenerate3D && targetId && hasImage && !hasModel) {
        try {
          const genRes = await api.generate3DArtifact(targetId, {
            depthScale: 0.35,
            resolution: 160
          });
          if (genRes.cached) {
            showToast('Mô hình 3D đã sẵn sàng từ bộ nhớ đệm (Cache)!', 'success');
          } else {
            showToast('Đang tiến hành số hóa mô hình 3D trong tiến trình nền...', 'info');
          }
        } catch (genErr: any) {
          console.warn('[Auto 3D Error]:', genErr);
          showToast('Hồ sơ đã lưu, nhưng tác vụ 3D gặp lỗi: ' + (genErr.message || 'Không thể khởi động'), 'warning');
        }
      }

      setIsEditModalOpen(false);
      fetchArtifacts();
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu thông tin hiện vật', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await api.uploadArtifactImage(file);
      const url = res.url;
      setEditingArtifact((prev) => {
        if (!prev) return prev;
        const newImages = prev.images ? [...prev.images, url] : [url];
        return {
          ...prev,
          images: newImages,
          thumbnailUrl: prev.thumbnailUrl || url
        };
      });
      showToast('Đã tải ảnh tư liệu hiện vật thành công', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi tải ảnh hiện vật', 'error');
    }
  };

  const handleSlotUpload = async (e: React.ChangeEvent<HTMLInputElement>, slot: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const res = await api.uploadArtifactImage(file);
      const url = res.url;
      setEditingArtifact((prev) => {
        if (!prev) return prev;
        const currentImgs = [...(prev.images || [])];
        if (slot === 0) {
          if (currentImgs.length === 0) currentImgs.push(url);
          else currentImgs[0] = url;
        } else {
          if (currentImgs.length === 0) {
            currentImgs.push(url); // slot 0 placeholder
            currentImgs.push(url);
          } else if (currentImgs.length === 1) {
            currentImgs.push(url);
          } else {
            currentImgs[1] = url;
          }
        }
        return {
          ...prev,
          images: currentImgs,
          thumbnailUrl: currentImgs[0] || url
        };
      });
      showToast(slot === 0 ? 'Đã tải ảnh mặt trước thành công' : 'Đã tải ảnh mặt sau thành công', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi tải ảnh hiện vật', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await api.uploadArtifactModel(file);
      setEditingArtifact((prev) => (prev ? { ...prev, model3dUrl: res.url } : prev));
      showToast('Đã tải tệp mô hình 3D (.glb) thành công', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi tải file 3D', 'error');
    }
  };

  const handleOpenViewer = (artifact: Artifact) => {
    const targetId = artifact.id || (artifact as any)._id;
    setActiveViewerArtifact({ ...artifact, id: targetId });
    setIsViewerModalOpen(true);
  };

  const handleOpenQR = (artifact: Artifact) => {
    const targetId = artifact.id || (artifact as any)._id;
    setActiveQRArtifact({ ...artifact, id: targetId });
    setIsQRModalOpen(true);
  };

  const handleOpenGenerate3D = (artifact: Artifact) => {
    const targetId = artifact.id || (artifact as any)._id;
    setGeneratingArtifact({ ...artifact, id: targetId });
    setDepthScale(0.35);
    setIsGenerateModalOpen(true);
  };

  const handleStart3DReconstruction = async () => {
    if (!generatingArtifact) return;
    const targetId = generatingArtifact.id || (generatingArtifact as any)._id;
    if (!targetId) {
      showToast('Lỗi: Không tìm thấy ID hiện vật để dựng 3D', 'error');
      return;
    }
    try {
      setIsProcessing3D(true);
      const res = await api.generate3DArtifact(targetId, {
        depthScale: depthScale,
        resolution: 160
      });

      // Cập nhật ngay trạng thái processing vào danh sách cục bộ để nút lập tức chuyển sang hiệu ứng loading xoay mượt mà
      setArtifacts((prev) =>
        prev.map((a) =>
          (a.id === targetId || (a as any)._id === targetId)
            ? { ...a, processingStatus: res.cached ? 'completed' : 'processing', model3dUrl: res.model3dUrl || a.model3dUrl }
            : a
        )
      );

      setActiveViewerArtifact((prev) => {
        if (!prev || (prev.id !== targetId && (prev as any)._id !== targetId)) return prev;
        return {
          ...prev,
          processingStatus: res.cached ? 'completed' : 'processing',
          model3dUrl: res.model3dUrl || prev.model3dUrl
        };
      });

      if (res.cached) {
        showToast('Mô hình 3D đã sẵn sàng từ bộ nhớ đệm (Cache)', 'success');
      } else {
        showToast('Đang tiến hành số hóa mô hình 3D trong tiến trình nền...', 'info');
      }

      setIsGenerateModalOpen(false);
      fetchArtifacts();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khởi chạy tác vụ dựng 3D', 'error');
    } finally {
      setIsProcessing3D(false);
    }
  };

  // Sao chép liên kết có cơ chế Fallback tương thích 100% với HTTP (IP VPS)
  const handleCopyLink = (text: string) => {
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
      showToast('Đã sao chép liên kết tham quan: ' + text, 'success');
    } else {
      showToast('Vui lòng chọn và nhấn Ctrl+C để sao chép liên kết', 'info');
    }
  };

  // === QUẢN TRỊ THUYẾT MINH & VOICE AI ĐA NGÔN NGỮ ===
  const handleOpenVoiceModal = (artifact: Artifact) => {
    const targetId = artifact.id || (artifact as any)._id;
    setActiveVoiceArtifact({ ...artifact, id: targetId });
    const initialLang = 'vi';
    setSelectedVoiceLang(initialLang);

    const trans = artifact.translations?.[initialLang];
    setVoiceName(trans?.name || artifact.name);
    setVoicePeriod(trans?.period || artifact.period);
    setVoiceScript(trans?.narrationScript || trans?.description || artifact.description || '');
    setPreviewAudioUrl(trans?.audioNarrationUrl || artifact.audioNarrationUrl || null);

    setIsVoiceModalOpen(true);
  };

  const handleSwitchVoiceLanguage = (langCode: string) => {
    if (!activeVoiceArtifact) return;
    setSelectedVoiceLang(langCode);

    if (langCode === 'vi') {
      const trans = activeVoiceArtifact.translations?.vi;
      setVoiceName(trans?.name || activeVoiceArtifact.name);
      setVoicePeriod(trans?.period || activeVoiceArtifact.period);
      setVoiceScript(trans?.narrationScript || trans?.description || activeVoiceArtifact.description || '');
      setPreviewAudioUrl(trans?.audioNarrationUrl || activeVoiceArtifact.audioNarrationUrl || null);
    } else {
      const trans = activeVoiceArtifact.translations?.[langCode];
      setVoiceName(trans?.name || '');
      setVoicePeriod(trans?.period || '');
      setVoiceScript(trans?.narrationScript || trans?.description || '');
      setPreviewAudioUrl(trans?.audioNarrationUrl || null);
    }
  };

  const handleLoadPresetKnowledge = () => {
    if (!activeVoiceArtifact) return;
    const museumTitle = branding.museumName || 'Bảo tàng Lịch sử TP.HCM';

    if (selectedVoiceLang === 'vi') {
      const script = `Kính chào quý khách đến chiêm ngưỡng hiện vật ${activeVoiceArtifact.name}. Cổ vật có niên đại thuộc ${activeVoiceArtifact.period || 'thời kỳ cổ'}, được sưu tầm và bảo tồn tại ${activeVoiceArtifact.origin || museumTitle}. Đây là di sản văn hóa quý giá minh chứng cho đỉnh cao nghệ thuật tạo tác và dòng chảy lịch sử dân tộc.`;
      setVoiceScript(script);
      if (!voiceName) setVoiceName(activeVoiceArtifact.name);
      if (!voicePeriod) setVoicePeriod(activeVoiceArtifact.period);
      showToast('Đã nạp lời đọc gợi ý tiếng Việt', 'info');
    } else if (selectedVoiceLang === 'en') {
      const script = `Welcome to the exhibition of ${voiceName || activeVoiceArtifact.name}. Dating back to ${voicePeriod || activeVoiceArtifact.period || 'ancient times'} and preserved at ${activeVoiceArtifact.origin || museumTitle}, this precious heritage artifact exemplifies artistic excellence and rich historical significance.`;
      setVoiceScript(script);
      if (!voiceName) setVoiceName(activeVoiceArtifact.name);
      if (!voicePeriod) setVoicePeriod(activeVoiceArtifact.period);
      showToast('Loaded English narration suggestion', 'info');
    } else if (selectedVoiceLang === 'fr') {
      const script = `Bienvenue à l'exposition de ${voiceName || activeVoiceArtifact.name}. Datant de ${voicePeriod || activeVoiceArtifact.period || 'l\'époque ancienne'} et conservé au Musée d'Histoire de Hô Chi Minh-Ville, ce trésor patrimonial inestimable témoigne de l'excellence artistique et de l'histoire séculaire.`;
      setVoiceScript(script);
      showToast('Suggestion en français chargée', 'info');
    } else if (selectedVoiceLang === 'zh') {
      const script = `欢迎莅临参观${voiceName || activeVoiceArtifact.name}。该文物源自${voicePeriod || activeVoiceArtifact.period || '古代'}，珍藏于胡志明市历史博物馆，展现了深厚的历史文化底蕴与精湛的传统工艺。`;
      setVoiceScript(script);
      showToast('已加载中文语音解说建议', 'info');
    } else {
      const script = `Welcome to the exhibition of ${activeVoiceArtifact.name}. Dating back to ${activeVoiceArtifact.period}, preserved at ${museumTitle}.`;
      setVoiceScript(script);
      showToast('Đã nạp văn bản gợi ý', 'info');
    }
  };

  const handleGenerateVoiceAudio = async () => {
    if (!voiceScript.trim()) {
      showToast('Vui lòng nhập lời đọc thuyết minh trước khi tạo giọng đọc Voice AI', 'error');
      return;
    }
    if (!activeVoiceArtifact) return;

    try {
      setIsGeneratingTts(true);
      const res = await api.generateTtsAudio({
        text: voiceScript.trim(),
        langCode: selectedVoiceLang,
        roomCode: activeVoiceArtifact.code
      });

      const fullUrl = res.audioUrl.startsWith('http')
        ? res.audioUrl
        : `${API_ROOT}${res.audioUrl}`;

      setPreviewAudioUrl(fullUrl);

      // Tự động lưu và cập nhật ngay vào cơ sở dữ liệu để đồng bộ tức thì
      const existingTranslations = activeVoiceArtifact.translations || {};
      const updatedTranslations = {
        ...existingTranslations,
        [selectedVoiceLang]: {
          ...(existingTranslations[selectedVoiceLang] || {}),
          name: voiceName.trim() || activeVoiceArtifact.name,
          period: voicePeriod.trim() || activeVoiceArtifact.period,
          narrationScript: voiceScript.trim(),
          description: voiceScript.trim(),
          audioNarrationUrl: res.audioUrl
        }
      };

      const patchPayload: Partial<Artifact> = {
        translations: updatedTranslations
      };

      if (selectedVoiceLang === 'vi' || !activeVoiceArtifact.audioNarrationUrl) {
        patchPayload.audioNarrationUrl = res.audioUrl;
      }

      const updated = await api.updateArtifact(activeVoiceArtifact.id, patchPayload);
      setActiveVoiceArtifact(updated);
      setArtifacts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));

      showToast(`Đã xuất bản và đồng bộ giọng đọc Voice AI (${selectedVoiceLang.toUpperCase()}) thành công!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tạo giọng đọc Voice AI', 'error');
    } finally {
      setIsGeneratingTts(false);
    }
  };

  const handleSaveVoiceNarration = async () => {
    if (!activeVoiceArtifact) return;

    try {
      setIsSavingVoice(true);
      const existingTranslations = activeVoiceArtifact.translations || {};

      const updatedTranslations = {
        ...existingTranslations,
        [selectedVoiceLang]: {
          ...(existingTranslations[selectedVoiceLang] || {}),
          name: voiceName.trim() || activeVoiceArtifact.name,
          period: voicePeriod.trim() || activeVoiceArtifact.period,
          narrationScript: voiceScript.trim(),
          description: voiceScript.trim(),
          audioNarrationUrl: previewAudioUrl || existingTranslations[selectedVoiceLang]?.audioNarrationUrl || ''
        }
      };

      const patchPayload: Partial<Artifact> = {
        translations: updatedTranslations
      };

      if ((selectedVoiceLang === 'vi' || !activeVoiceArtifact.audioNarrationUrl) && previewAudioUrl) {
        patchPayload.audioNarrationUrl = previewAudioUrl;
      }

      const updated = await api.updateArtifact(activeVoiceArtifact.id, patchPayload);

      // Cập nhật state cục bộ
      setActiveVoiceArtifact(updated);
      setArtifacts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));

      showToast(`Đã lưu thuyết minh và đồng bộ Voice AI (${selectedVoiceLang.toUpperCase()}) thành công!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu thuyết minh', 'error');
    } finally {
      setIsSavingVoice(false);
    }
  };

  return (
    <div className="admin-content">
      {/* Tiêu đề trang chuẩn mực bảo tàng */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--heading-color)', margin: 0, lineHeight: 1.3 }}>
            Hiện vật & Cổ vật di sản
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Quản lý danh mục cổ vật, tư liệu khảo cứu, số hóa mô hình 3D tương tác và xuất thẻ QR trưng bày.
          </p>
        </div>
      </div>

      {/* BĂNG THỐNG KÊ DI SẢN (HERITAGE STATS BANNER) */}
      <div className="heritage-stats-banner">
        {/* Cột 1: Tổng số Cổ vật */}
        <div className="heritage-stat-col">
          <div className="heritage-stat-header">
            <span className="heritage-stat-icon-wrapper">
              <Landmark size={15} />
            </span>
            <span className="heritage-stat-title">Hồ sơ Cổ vật</span>
          </div>
          <div className="heritage-stat-body">
            <div className="heritage-stat-metric">
              <span className="heritage-stat-number">{totalArtifacts}</span>
              <span className="heritage-stat-unit">hiện vật</span>
            </div>
            <div className="heritage-stat-sub">
              <span>Đăng ký sổ bảo tồn di sản</span>
            </div>
          </div>
        </div>

        {/* Cột 2: Đã số hóa 3D */}
        <div className="heritage-stat-col">
          <div className="heritage-stat-header">
            <span className="heritage-stat-icon-wrapper">
              <Box size={15} />
            </span>
            <span className="heritage-stat-title">Số hóa 3D Không gian</span>
          </div>
          <div className="heritage-stat-body">
            <div className="heritage-stat-metric">
              <span className="heritage-stat-number">{with3DCount}</span>
              <span className="heritage-stat-denom">/{totalArtifacts}</span>
              <span className="heritage-stat-unit">hiện vật</span>
            </div>
            <div className="heritage-stat-sub">
              <span>{percent3D}% Sẵn sàng đĩa xoay 360°</span>
            </div>
          </div>
        </div>

        {/* Cột 3: Thuyết minh Bản ngữ */}
        <div className="heritage-stat-col">
          <div className="heritage-stat-header">
            <span className="heritage-stat-icon-wrapper">
              <Volume2 size={15} />
            </span>
            <span className="heritage-stat-title">Thuyết minh Di sản</span>
          </div>
          <div className="heritage-stat-body">
            <div className="heritage-stat-metric">
              <span className="heritage-stat-number">{withAudioCount}</span>
              <span className="heritage-stat-denom">/{totalArtifacts}</span>
              <span className="heritage-stat-unit">bản ghi</span>
            </div>
            <div className="heritage-stat-sub">
              <span>Đồng bộ giọng đọc bản xứ</span>
            </div>
          </div>
        </div>

        {/* Cột 4: Thẻ tra cứu QR */}
        <div className="heritage-stat-col" style={{ borderRight: 'none' }}>
          <div className="heritage-stat-header">
            <span className="heritage-stat-icon-wrapper">
              <QrCode size={15} />
            </span>
            <span className="heritage-stat-title">Tương tác Thực địa</span>
          </div>
          <div className="heritage-stat-body">
            <div className="heritage-stat-metric">
              <span className="heritage-stat-number">{withQrCount}</span>
              <span className="heritage-stat-unit">mã QR</span>
            </div>
            <div className="heritage-stat-sub">
              <span>Sẵn sàng in ấn thẻ trưng bày</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="panel">
        {/* Navigation Sub-Tabs & Actions Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-color)',
            padding: '14px 20px',
            background: 'var(--bg-subtle)',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontWeight: 600,
                fontSize: '13px',
                background: 'var(--bg-surface)',
                color: 'var(--primary)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Compass size={15} />
              <span>Danh Mục Hiện Vật ({filteredArtifacts.length})</span>
            </div>

            {/* Chuyển đổi Grid / Table View */}
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: 2
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Chế độ lưới trực quan"
                style={{
                  background: viewMode === 'grid' ? 'var(--bg-subtle)' : 'transparent',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)'
                }}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Chế độ bảng dữ liệu"
                style={{
                  background: viewMode === 'table' ? 'var(--bg-subtle)' : 'transparent',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-muted)'
                }}
              >
                <List size={15} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={fetchArtifacts}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RotateCw size={14} className={loading ? 'spin' : ''} />
              <span>Làm mới</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleCreateNew}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={15} />
              <span>Thêm hiện vật mới</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            background: 'var(--bg-surface)'
          }}
        >
          {/* Search box */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 'min(100%, 180px)' }}>
            <input
              type="text"
              placeholder="Tìm theo tên hiện vật, mã HV-..., niên đại..."
              className="form-control"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '100%', paddingLeft: 34, fontSize: '13px' }}
            />
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: 11,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
          </div>

          {/* Lọc danh mục */}
          <div style={{ flex: '0 1 180px', minWidth: 'min(100%, 140px)' }}>
            <select
              className="form-control"
              style={{ fontSize: '13px', width: '100%' }}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả danh mục ({artifacts.length})</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc trạng thái 3D */}
          <div style={{ flex: '0 1 180px', minWidth: 'min(100%, 140px)' }}>
            <select
              className="form-control"
              style={{ fontSize: '13px', width: '100%' }}
              value={selectedStatus3D}
              onChange={(e) => {
                setSelectedStatus3D(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả trạng thái 3D</option>
              <option value="has_3d">Đã có mô hình 3D ({with3DCount})</option>
              <option value="processing">Đang dựng 3D</option>
              <option value="no_3d">Chưa có 3D ({totalArtifacts - with3DCount})</option>
            </select>
          </div>
        </div>

        {/* Nội dung Hiện vật */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 20px' }}>
            <Loader2 size={32} className="spin" style={{ color: 'var(--primary)', margin: '0 auto 12px auto' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
              Đang tải danh mục hiện vật di sản...
            </p>
          </div>
        ) : filteredArtifacts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)'
              }}
            >
              <Landmark size={28} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--heading-color)', margin: 0 }}>
              Chưa có hiện vật nào phù hợp
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: 460, margin: 0, lineHeight: 1.5 }}>
              Hệ thống chưa ghi nhận cổ vật phù hợp với bộ lọc hiện tại. Bạn có thể thêm hồ sơ hiện vật mới hoặc điều chỉnh tiêu chí tìm kiếm.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleCreateNew}
              style={{ marginTop: 6 }}
            >
              <Plus size={14} style={{ marginRight: 4 }} />
              Thêm hiện vật mới
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View Mode - Đồng bộ 100% với AdminRoomsPage */
          <div className="rooms-grid">
            {paginatedArtifacts.map((art) => {
              const has3D = !!art.model3dUrl;
              const isProcessing = art.processingStatus === 'processing';
              const imgUrl = art.thumbnailUrl || (art.images && art.images.length > 0 ? art.images[0] : null);
              const fullImgUrl = imgUrl
                ? imgUrl.startsWith('http')
                  ? imgUrl
                  : `${API_ROOT}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`
                : null;

              const transCount = art.translations ? Object.keys(art.translations).length : 0;

              return (
                <div key={art.id} className="room-card">
                  {/* Khung ảnh thumbnail chuẩn mực 135px */}
                  <div className="room-thumbnail-wrapper">
                    {fullImgUrl ? (
                      <img src={fullImgUrl} alt={art.name} className="room-thumbnail" />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          background: 'linear-gradient(135deg, rgba(212, 168, 106, 0.08) 0%, rgba(140, 45, 25, 0.08) 100%)'
                        }}
                      >
                        <Landmark size={24} style={{ color: 'var(--accent-gold)', opacity: 0.7 }} />
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Chưa tải ảnh tư liệu</span>
                      </div>
                    )}

                    {/* Mã định danh di sản */}
                    <div className="room-badge-code">{art.code}</div>

                    {/* Huy hiệu trạng thái 3D */}
                    <div className="room-badge-hotspots">
                      {has3D ? (
                        <>
                          <Sparkles size={11} />
                          <span>Mô hình 3D</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon size={11} />
                          <span>Ảnh 2D</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Thông tin cổ vật */}
                  <div className="room-info">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.4px', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {art.period || art.category || 'Cổ vật di sản'}
                      </span>
                      {transCount > 0 ? (
                        <span style={{ fontSize: '10.5px', color: 'var(--accent-gold)', background: 'rgba(212, 168, 106, 0.12)', border: '1px solid rgba(212, 168, 106, 0.28)', padding: '2px 7px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          <Volume2 size={10} />
                          <span>{transCount} ngôn ngữ</span>
                        </span>
                      ) : (
                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '2px 7px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          Chưa có voice
                        </span>
                      )}
                    </div>

                    <div className="room-name" title={art.name}>{art.name}</div>
                    <div className="room-desc" title={art.description}>{art.description || 'Chưa có thông tin tư liệu khảo cứu cho hiện vật này.'}</div>

                    {/* Thông số phụ từ DB */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', padding: '6px 0', borderTop: '1px dashed var(--border-color)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={11} style={{ color: 'var(--accent-gold)' }} />
                        <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{art.origin || 'Bảo tàng Lịch sử TP.HCM'}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Tag size={11} />
                        <span>{art.category || 'Hiện vật'}</span>
                      </span>
                    </div>

                    {/* Action buttons 2 hàng chuẩn mực, responsive đa tầng */}
                    <div className="room-card-actions-wrapper">
                      {/* Hàng 1: Hai nút chức năng chính */}
                      <div className="room-card-actions-row">
                        {has3D && !isProcessing ? (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm room-card-btn-action"
                            onClick={() => handleOpenViewer(art)}
                            title="Xem mô hình 3D xoay 360° trên đĩa ngọc"
                          >
                            <RotateCw size={13} style={{ flexShrink: 0 }} />
                            <span className="room-card-btn-label">Xem 3D 360°</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={`btn btn-primary btn-sm room-card-btn-action ${isProcessing ? 'btn-processing' : ''}`}
                            onClick={() => handleOpenGenerate3D(art)}
                            disabled={isProcessing}
                            title={isProcessing ? "Hệ thống đang xử lý và dựng mô hình 3D..." : "Khởi tạo mô hình 3D từ ảnh chụp"}
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 size={13} className="spin" style={{ flexShrink: 0 }} />
                                <span className="room-card-btn-label">Đang dựng 3D...</span>
                              </>
                            ) : (
                              <>
                                <Box size={13} style={{ flexShrink: 0 }} />
                                <span className="room-card-btn-label">Số hóa 3D</span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm room-card-btn-action"
                          onClick={() => handleOpenVoiceModal(art)}
                          title="Quản lý thuyết minh & Voice AI đa ngôn ngữ"
                        >
                          <Volume2 size={13} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                          <span className="room-card-btn-label">Thuyết minh</span>
                        </button>
                      </div>

                      {/* Hàng 2: Nút công cụ phụ */}
                      <div className="room-card-actions-row">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm room-card-btn-action"
                          title="Xem và in thẻ Standee QR trưng bày"
                          onClick={() => handleOpenQR(art)}
                        >
                          <QrCode size={12} style={{ flexShrink: 0 }} />
                          <span className="room-card-btn-label">Mã QR</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm room-card-btn-action-tool"
                          title="Chỉnh sửa thông tin hiện vật"
                          onClick={() => handleEdit(art)}
                        >
                          <Edit3 size={12} style={{ flexShrink: 0 }} />
                          <span className="room-card-btn-label">Sửa</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm room-card-btn-action-tool room-card-btn-delete"
                          title="Xóa hiện vật khỏi sổ lưu trữ"
                          onClick={() => handleDelete(art.id || (art as any)._id, art.name)}
                        >
                          <Trash2 size={12} style={{ flexShrink: 0 }} />
                          <span className="room-card-btn-label">Xóa</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View Mode */
          <div style={{ overflowX: 'auto' }}>
            <table className="artifact-table">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>Mã số</th>
                  <th style={{ width: 64 }}>Hình ảnh</th>
                  <th>Tên hiện vật & Xuất xứ</th>
                  <th>Niên đại & Chuyên đề</th>
                  <th style={{ width: 140 }}>Trạng thái 3D</th>
                  <th style={{ width: 130 }}>Thuyết minh AI</th>
                  <th style={{ width: 190, textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedArtifacts.map((art) => {
                  const has3D = !!art.model3dUrl;
                  const isProcessing = art.processingStatus === 'processing';
                  const imgUrl = art.thumbnailUrl || (art.images && art.images.length > 0 ? art.images[0] : null);
                  const fullImgUrl = imgUrl
                    ? imgUrl.startsWith('http')
                      ? imgUrl
                      : `${API_ROOT}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`
                    : null;

                  const transCount = art.translations ? Object.keys(art.translations).length : 0;

                  return (
                    <tr key={art.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)' }}>
                        {art.code}
                      </td>
                      <td>
                        {fullImgUrl ? (
                          <img src={fullImgUrl} alt="" className="artifact-table-thumb" />
                        ) : (
                          <div className="artifact-table-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon size={18} style={{ color: 'var(--text-muted)' }} />
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--heading-color)', marginBottom: 2 }}>
                          {art.name}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {art.origin || 'Bảo tàng Lịch sử TP.HCM'}
                          {art.dimensions && ` • ${art.dimensions}`}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-gold)' }}>
                          {art.period || 'Chưa cập nhật'}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {art.category}
                        </div>
                      </td>
                      <td>
                        {has3D && !isProcessing && (
                          <span className="badge-3d-ready">
                            <Box size={11} /> 3D Sẵn sàng
                          </span>
                        )}
                        {isProcessing && (
                          <span className="badge-3d-processing" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <Loader2 size={12} className="spin" /> Đang dựng 3D...
                          </span>
                        )}
                        {!has3D && !isProcessing && (
                          <span className="badge-3d-none">Ảnh 2D</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => handleOpenVoiceModal(art)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 8px' }}
                        >
                          <Volume2 size={12} style={{ color: 'var(--accent-gold)' }} />
                          <span>{transCount > 0 ? `${transCount} ngôn ngữ` : 'Thêm voice'}</span>
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {has3D && !isProcessing && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => handleOpenViewer(art)}
                              title="Xem 3D đĩa xoay 360°"
                            >
                              <RotateCw size={13} />
                            </button>
                          )}
                          {isProcessing && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm btn-processing"
                              disabled
                              title="Đang tiến hành dựng mô hình 3D trong tiến trình nền..."
                            >
                              <Loader2 size={13} className="spin" style={{ color: 'var(--accent-gold)' }} />
                            </button>
                          )}
                          {!has3D && !isProcessing && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenGenerate3D(art)}
                              title="Khởi tạo mô hình 3D từ ảnh"
                            >
                              <Sparkles size={13} style={{ color: 'var(--accent-gold)' }} />
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenQR(art)}
                            title="Thẻ Standee QR"
                          >
                            <QrCode size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleEdit(art)}
                            title="Chỉnh sửa"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDelete(art.id || (art as any)._id, art.name)}
                            title="Xóa"
                            style={{ color: 'var(--error)' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân trang chuẩn mực của hệ thống */}
        {filteredArtifacts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredArtifacts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 9, 12, 18, 24]}
            itemLabel="cổ vật"
          />
        )}
      </div>

      {/* =========================================================================
          MODAL 1: THÊM / CHỈNH SỬA HỒ SƠ HIỆN VẬT
          ========================================================================= */}
      {isEditModalOpen && editingArtifact && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }}>
          <div className="modal-card" style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ fontSize: '16px', margin: 0 }}>
                {editingArtifact.id ? 'Cập nhật hồ sơ hiện vật' : 'Thêm hồ sơ cổ vật mới'}
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsEditModalOpen(false)}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveArtifact}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Hàng 1: Mã hiện vật & Tên */}
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Mã định danh *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingArtifact.code || ''}
                      onChange={(e) => setEditingArtifact({ ...editingArtifact, code: e.target.value })}
                      placeholder="HV-101..."
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tên cổ vật di sản *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingArtifact.name || ''}
                      onChange={(e) => setEditingArtifact({ ...editingArtifact, name: e.target.value })}
                      placeholder="Ví dụ: Tượng Bồ Tát Tara sa thạch..."
                      required
                    />
                  </div>
                </div>

                {/* Hàng 2: Danh mục & Niên đại */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Danh mục / Loại hình</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingArtifact.category || ''}
                      onChange={(e) => setEditingArtifact({ ...editingArtifact, category: e.target.value })}
                      placeholder="Gốm sứ, Đồ đồng, Điêu khắc..."
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Niên đại / Triều đại</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingArtifact.period || ''}
                      onChange={(e) => setEditingArtifact({ ...editingArtifact, period: e.target.value })}
                      placeholder="Thế kỷ VII - IX, Thời Lý - Trần..."
                    />
                  </div>
                </div>

                {/* Hàng 3: Nguồn gốc & Kích thước */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Nguồn gốc / Khảo cổ</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingArtifact.origin || ''}
                      onChange={(e) => setEditingArtifact({ ...editingArtifact, origin: e.target.value })}
                      placeholder="Đồng Nai, Quảng Nam, Huế..."
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kích thước đo đạc</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingArtifact.dimensions || ''}
                      onChange={(e) => setEditingArtifact({ ...editingArtifact, dimensions: e.target.value })}
                      placeholder="Cao 42cm, Rộng 28cm..."
                    />
                  </div>
                </div>

                {/* Giới thiệu lịch sử */}
                <div className="form-group">
                  <label className="form-label">Thông tin khảo cứu & Ý nghĩa lịch sử</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={editingArtifact.description || ''}
                    onChange={(e) => setEditingArtifact({ ...editingArtifact, description: e.target.value })}
                    placeholder="Mô tả nguồn gốc, hoa văn mỹ thuật và giá trị lịch sử của cổ vật..."
                  />
                </div>

                {/* Quản lý Ảnh tư liệu 2 mặt: Mặt Trước & Mặt Sau */}
                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      Hình ảnh tư liệu cổ vật (Hỗ trợ 2 mặt Trước & Sau)
                    </label>
                    <span style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>
                      💡 Có thể chụp cả 2 mặt để mô hình 3D hoàn hảo 100%
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    {/* KHUNG 1: ẢNH MẶT TRƯỚC */}
                    <div style={{
                      padding: 10,
                      borderRadius: 'var(--radius-sm, 6px)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-subtle)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--heading-color)' }}>
                          1. Ảnh Mặt Trước (Chính)
                        </span>
                        {editingArtifact.images && editingArtifact.images[0] && (
                          <span style={{ fontSize: '10.5px', color: 'var(--success)', fontWeight: 600 }}>✓ Đã có ảnh</span>
                        )}
                      </div>

                      {editingArtifact.images && editingArtifact.images[0] ? (
                        <div style={{ position: 'relative', height: 110, borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border-color)', background: '#111' }}>
                          <img
                            src={editingArtifact.images[0].startsWith('http') ? editingArtifact.images[0] : `${API_ROOT}${editingArtifact.images[0]}`}
                            alt="Mặt trước"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...(editingArtifact.images || [])];
                              next.splice(0, 1);
                              setEditingArtifact({ ...editingArtifact, images: next, thumbnailUrl: next[0] || '' });
                            }}
                            style={{
                              position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)',
                              color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}
                            title="Xóa ảnh mặt trước"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <label
                          className="btn btn-secondary btn-sm"
                          style={{
                            width: '100%', height: 110, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer',
                            border: '1px dashed var(--border-color)'
                          }}
                        >
                          <Upload size={16} style={{ color: 'var(--accent-gold)' }} />
                          <span style={{ fontSize: '12px', fontWeight: 500 }}>Tải ảnh mặt trước</span>
                          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Bắt buộc để dựng 3D</span>
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleSlotUpload(e, 0)} />
                        </label>
                      )}
                    </div>

                    {/* KHUNG 2: ẢNH MẶT SAU */}
                    <div style={{
                      padding: 10,
                      borderRadius: 'var(--radius-sm, 6px)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-subtle)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--heading-color)' }}>
                          2. Ảnh Mặt Sau (Tùy chọn)
                        </span>
                        {editingArtifact.images && editingArtifact.images[1] && (
                          <span style={{ fontSize: '10.5px', color: 'var(--success)', fontWeight: 600 }}>✓ Đã có ảnh</span>
                        )}
                      </div>

                      {editingArtifact.images && editingArtifact.images[1] ? (
                        <div style={{ position: 'relative', height: 110, borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border-color)', background: '#111' }}>
                          <img
                            src={editingArtifact.images[1].startsWith('http') ? editingArtifact.images[1] : `${API_ROOT}${editingArtifact.images[1]}`}
                            alt="Mặt sau"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...(editingArtifact.images || [])];
                              next.splice(1, 1);
                              setEditingArtifact({ ...editingArtifact, images: next });
                            }}
                            style={{
                              position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)',
                              color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}
                            title="Xóa ảnh mặt sau"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <label
                          className="btn btn-secondary btn-sm"
                          style={{
                            width: '100%', height: 110, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer',
                            border: '1px dashed var(--border-color)'
                          }}
                        >
                          <Camera size={16} style={{ color: 'var(--accent-gold)' }} />
                          <span style={{ fontSize: '12px', fontWeight: 500 }}>Tải ảnh mặt sau</span>
                          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Để 3D chân thực cả 2 mặt</span>
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleSlotUpload(e, 1)} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tùy chọn tự động Dựng mô hình 3D AI ngay khi lưu */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    background: 'rgba(212, 168, 106, 0.08)',
                    border: '1px solid rgba(212, 168, 106, 0.25)',
                    marginTop: 2
                  }}
                >
                  <input
                    type="checkbox"
                    id="autoGenerate3DCheckbox"
                    checked={autoGenerate3D}
                    onChange={(e) => setAutoGenerate3D(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <label htmlFor="autoGenerate3DCheckbox" style={{ fontSize: '12.5px', color: 'var(--heading-color)', fontWeight: 500, cursor: 'pointer', flex: 1, margin: 0 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Box size={13} style={{ color: 'var(--accent-gold)' }} />
                      <strong>Tự động số hóa mô hình 3D sau khi lưu</strong>
                    </span>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
                      Hệ thống sẽ xử lý ảnh tư liệu để tái tạo mô hình 3D xoay 360° trong tiến trình nền.
                    </span>
                  </label>
                </div>

                {/* File 3D (Tùy chọn) */}
                <div className="form-group">
                  <label className="form-label">Tệp mô hình 3D (.glb, .gltf)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="text"
                      className="form-control"
                      value={editingArtifact.model3dUrl || ''}
                      onChange={(e) => setEditingArtifact({ ...editingArtifact, model3dUrl: e.target.value })}
                      placeholder="/uploads/artifacts/models_3d/... hoặc đường dẫn URL"
                      style={{ flex: 1, fontSize: '12.5px' }}
                    />
                    <label
                      className="btn btn-secondary btn-sm"
                      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
                    >
                      <Upload size={13} />
                      <span>Chọn file 3D</span>
                      <input type="file" accept=".glb,.gltf" style={{ display: 'none' }} onChange={handleModelUpload} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSaving}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  {isSaving ? <Loader2 size={14} className="spin" /> : <CheckCircle2 size={14} />}
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu hồ sơ hiện vật'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: XEM 3D ĐĨA XOAY 360°
          ========================================================================= */}
      {isViewerModalOpen && activeViewerArtifact && (
        <div className="modal-backdrop" style={{ zIndex: 1250 }}>
          <div
            className="modal-card"
            style={{
              maxWidth: 840,
              width: '95vw',
              maxHeight: '92vh',
              margin: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Box size={18} style={{ color: 'var(--accent-gold)' }} />
                <div>
                  <h2 className="modal-title" style={{ fontSize: '16px', margin: 0 }}>
                    {activeViewerArtifact.name}
                  </h2>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Mã số: {activeViewerArtifact.code} • {activeViewerArtifact.period || activeViewerArtifact.category}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsViewerModalOpen(false)}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: 0, overflow: 'hidden', background: '#0d1118', flex: 1, minHeight: 0 }}>
              <Turntable360Viewer
                modelUrl={
                  activeViewerArtifact.model3dUrl && activeViewerArtifact.model3dUrl.trim() !== ''
                    ? (activeViewerArtifact.model3dUrl.startsWith('http')
                        ? activeViewerArtifact.model3dUrl
                        : `${API_ROOT}${activeViewerArtifact.model3dUrl.startsWith('/') ? '' : '/'}${activeViewerArtifact.model3dUrl}`)
                    : undefined
                }
                artifactName={activeViewerArtifact.name}
                artifactPeriod={activeViewerArtifact.period}
                audioNarrationUrl={
                  activeViewerArtifact.audioNarrationUrl ||
                  activeViewerArtifact.translations?.vi?.audioNarrationUrl ||
                  (activeViewerArtifact.translations &&
                    Object.values(activeViewerArtifact.translations).find((t: any) => !!t?.audioNarrationUrl)?.audioNarrationUrl)
                }
                translations={activeViewerArtifact.translations}
                autoPlayAudio={true}
                height={typeof window !== 'undefined' && window.innerWidth < 640 ? Math.min(380, Math.round(window.innerHeight * 0.52)) : 480}
                onGenerate3DClick={() => {
                  setIsViewerModalOpen(false);
                  handleOpenGenerate3D(activeViewerArtifact);
                }}
                isGenerating3D={activeViewerArtifact.processingStatus === 'processing'}
              />
            </div>

            <div
              className="modal-footer"
              style={{
                borderTop: '1px solid var(--border-color)',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <a
                href={`/?artifact=${activeViewerArtifact.code || activeViewerArtifact.id}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <ExternalLink size={13} />
                <span>Mở trang xem công cộng (Quét QR)</span>
              </a>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsViewerModalOpen(false)}
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: CẤU HÌNH KHỞI TẠO MÔ HÌNH 3D
          ========================================================================= */}
      {isGenerateModalOpen && generatingArtifact && (
        <div className="modal-backdrop" style={{ zIndex: 1250 }}>
          <div className="modal-card" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} style={{ color: 'var(--accent-gold)' }} />
                <h2 className="modal-title" style={{ fontSize: '15px', margin: 0 }}>
                  Khởi tạo mô hình 3D cho cổ vật
                </h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsGenerateModalOpen(false)}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Xem trước ảnh nguồn */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {/* Ảnh trước */}
                  {generatingArtifact.images && generatingArtifact.images[0] ? (
                    <div style={{ textAlign: 'center' }}>
                      <img
                        src={generatingArtifact.images[0].startsWith('http') ? generatingArtifact.images[0] : `${API_ROOT}${generatingArtifact.images[0]}`}
                        alt="Trước"
                        style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                      />
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>Mặt trước</span>
                    </div>
                  ) : null}

                  {/* Ảnh sau */}
                  {generatingArtifact.images && generatingArtifact.images[1] ? (
                    <div style={{ textAlign: 'center' }}>
                      <img
                        src={generatingArtifact.images[1].startsWith('http') ? generatingArtifact.images[1] : `${API_ROOT}${generatingArtifact.images[1]}`}
                        alt="Sau"
                        style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-gold)' }}
                      />
                      <span style={{ fontSize: '10px', color: 'var(--accent-gold)', display: 'block', marginTop: 2 }}>Mặt sau ✓</span>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', opacity: 0.6 }}>
                      <div style={{ width: 56, height: 56, border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Camera size={16} style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>Chưa có mặt sau</span>
                    </div>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--heading-color)', marginBottom: 2 }}>
                    {generatingArtifact.name}
                  </div>
                  <span style={{ fontSize: '11.5px', color: 'var(--accent-gold)', fontWeight: 600, display: 'block' }}>
                    Mã số: {generatingArtifact.code}
                  </span>
                  <span style={{ fontSize: '11px', color: generatingArtifact.images && generatingArtifact.images[1] ? 'var(--success)' : 'var(--text-muted)', marginTop: 3, display: 'block' }}>
                    {generatingArtifact.images && generatingArtifact.images[1]
                      ? '✨ Đầy đủ ảnh 2 mặt: Tái tạo chi tiết mặt trước và mặt sau thực tế'
                      : 'ℹ️ Dựng từ ảnh mặt trước (tự động đồng bộ màu sắc và khối lưng)'}
                  </span>
                </div>
              </div>

              {/* Lựa chọn độ dày nổi khối */}
              <div className="form-group">
                <label className="form-label" style={{ marginBottom: 6 }}>
                  Độ dày nổi khối hình học (Depth Scale): <strong>{depthScale}</strong>
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="0.55"
                  step="0.05"
                  value={depthScale}
                  onChange={(e) => setDepthScale(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>
                  <span>0.20 (Phù điêu mỏng)</span>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>0.35 (Chuẩn cổ vật)</span>
                  <span>0.55 (Tượng tròn dày)</span>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-subtle)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                  border: '1px solid var(--border-color)'
                }}
              >
                Hệ thống tự động xử lý hình ảnh, ước tính độ sâu và tái tạo mô hình 3D đặc khép kín (Watertight) chuẩn bảo tàng.
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsGenerateModalOpen(false)}
                disabled={isProcessing3D}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className={`btn btn-primary btn-sm ${isProcessing3D ? 'btn-processing' : ''}`}
                onClick={handleStart3DReconstruction}
                disabled={isProcessing3D}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {isProcessing3D ? (
                  <>
                    <Loader2 size={14} className="spin" />
                    <span>Đang đưa vào hàng đợi...</span>
                  </>
                ) : (
                  <>
                    <Box size={14} />
                    <span>Bắt đầu số hóa 3D</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: XUẤT THẺ STANDEE QR BẢO TÀNG (Đồng bộ 100% với AdminRoomsPage)
          ========================================================================= */}
      {isQRModalOpen && activeQRArtifact && (
        <div className="modal-backdrop" style={{ zIndex: 1250 }}>
          <div className="modal-card" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <QrCode size={18} style={{ color: 'var(--primary)' }} />
                <h2 className="modal-title" style={{ fontSize: '16px', margin: 0 }}>
                  Thẻ QR Tham Quan: {activeQRArtifact.name}
                </h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsQRModalOpen(false)}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto', padding: '20px' }}>
              {/* Standee Print Preview Card - Chuẩn Bảo Tàng */}
              <div className="standee-print-card" style={{ padding: '28px 20px', borderRadius: 16 }}>
                {branding.logoUrl && (
                  <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center', height: 46, alignItems: 'center' }}>
                    <img
                      src={branding.logoUrl}
                      alt=""
                      style={{ maxHeight: 44, maxWidth: 160, width: 'auto', height: 'auto', objectFit: 'contain' }}
                    />
                  </div>
                )}
                <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#8C2D19', marginBottom: 6 }}>
                  {currentLang === 'vi' ? (branding.museumName?.toUpperCase() || 'BẢO TÀNG LỊCH SỬ THÀNH PHỐ HỒ CHÍ MINH') : 'MUSEUM OF HISTORY IN HO CHI MINH CITY'}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1A110B', marginBottom: 4, lineHeight: 1.3 }}>
                  {activeQRArtifact.name}
                </div>
                <div style={{ fontSize: '12px', color: '#6B584C', marginBottom: 16 }}>
                  Mã hiện vật: <strong>{activeQRArtifact.code}</strong> • {activeQRArtifact.period || activeQRArtifact.category}
                </div>

                {/* Khung QR vuông vức cân xứng tuyệt đối, viền vàng hoàng gia */}
                <div
                  style={{
                    width: 190,
                    height: 190,
                    margin: '0 auto 16px',
                    padding: 8,
                    background: '#FFFFFF',
                    border: '2px solid #D4A86A',
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
                  }}
                >
                  <img
                    src={
                      activeQRArtifact.qrCodeUrl ||
                      `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`${window.location.origin}/?artifact=${activeQRArtifact.code || activeQRArtifact.id}`)}`
                    }
                    alt={`QR Code ${activeQRArtifact.name}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                </div>

                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1A110B', marginBottom: 3 }}>
                  Quét mã để chiêm ngưỡng mô hình 3D 360° & nghe thuyết minh
                </div>
                <div style={{ fontSize: '11.5px', color: '#8C7769', letterSpacing: '0.2px' }}>
                  Scan to explore 360° 3D artifact & audio tour
                </div>
              </div>

              {/* Đường dẫn trực tiếp & nút sao chép (Hỗ trợ 100% HTTP/HTTPS) */}
              <div
                style={{
                  marginTop: 14,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)', marginRight: 5 }}>Link:</span>
                  <code style={{ color: 'var(--primary)', fontSize: '11.5px' }}>
                    {`${window.location.origin}/?artifact=${activeQRArtifact.code || activeQRArtifact.id}`}
                  </code>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={() =>
                    handleCopyLink(`${window.location.origin}/?artifact=${activeQRArtifact.code || activeQRArtifact.id}`)
                  }
                  style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, padding: '4px 8px' }}
                  title="Sao chép liên kết"
                >
                  <Copy size={12} />
                  <span>Sao chép</span>
                </button>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => window.print()}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Printer size={14} />
                  <span>In Standee</span>
                </button>

                <a
                  href={api.getArtifactQRDownloadUrl(activeQRArtifact.id)}
                  download={`QR_${activeQRArtifact.code}.png`}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                >
                  <Download size={14} />
                  <span>Tải ảnh QR</span>
                </a>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsQRModalOpen(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: THUYẾT MINH & VOICE AI ĐA NGÔN NGỮ (ĐỒNG BỘ VỚI HỆ THỐNG)
          ========================================================================= */}
      {isVoiceModalOpen && activeVoiceArtifact && (
        <div className="modal-backdrop" style={{ zIndex: 1250 }}>
          <div className="modal-card" style={{ maxWidth: 660, width: '100%' }}>
            {/* Modal Header */}
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: 'rgba(212, 168, 106, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-gold)'
                  }}
                >
                  <Volume2 size={18} />
                </div>
                <div>
                  <h2 className="modal-title" style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--heading-color)' }}>
                    Thuyết minh & Voice AI: {activeVoiceArtifact.name}
                  </h2>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
                    Mã hiện vật: <strong style={{ color: 'var(--heading-color)' }}>{activeVoiceArtifact.code}</strong> • {activeVoiceArtifact.period || activeVoiceArtifact.category}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsVoiceModalOpen(false)}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            {/* Thanh Tab Ngôn Ngữ Đồng Bộ Từ DB */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--bg-subtle)',
                overflowX: 'auto',
                padding: '4px 8px 0 8px',
                gap: 4
              }}
            >
              {languages.map((lang) => {
                const isSelected = selectedVoiceLang === lang.code;
                const hasVoice =
                  lang.code === 'vi'
                    ? !!(activeVoiceArtifact.audioNarrationUrl || activeVoiceArtifact.translations?.vi?.audioNarrationUrl)
                    : !!activeVoiceArtifact.translations?.[lang.code]?.audioNarrationUrl;

                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSwitchVoiceLanguage(lang.code)}
                    style={{
                      padding: '8px 14px',
                      background: isSelected ? 'var(--bg-surface)' : 'transparent',
                      border: '1px solid ' + (isSelected ? 'var(--border-color)' : 'transparent'),
                      borderBottom: isSelected ? '2px solid var(--accent-gold)' : '2px solid transparent',
                      borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '12.5px',
                      color: isSelected ? 'var(--accent-gold)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{lang.flagIcon || '🌐'}</span>
                    <span>{lang.nativeName}</span>
                    {hasVoice && (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: 'var(--success)',
                          display: 'inline-block'
                        }}
                        title="Đã có file âm thanh Voice AI"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ maxHeight: 'calc(80vh - 150px)', overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Thông tin giải thích */}
              <div
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12.5px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.55
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--heading-color)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Info size={14} style={{ color: 'var(--accent-gold)' }} />
                  <span>Thuyết minh tự động cho khách tham quan:</span>
                </div>
                Khi du khách quét mã QR hoặc bấm xem mô hình 3D trên điện thoại, hệ thống sẽ tự động phát lời thuyết minh giọng đọc của ngôn ngữ tương ứng để dẫn hướng du khách chiêm ngưỡng cổ vật.
              </div>

              {/* Tên và Niên đại dịch */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '12.5px' }}>
                    Tên hiện vật ({selectedVoiceLang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                    placeholder="Tên hiện vật bản ngữ..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '12.5px' }}>
                    Niên đại / Chuyên đề ({selectedVoiceLang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={voicePeriod}
                    onChange={(e) => setVoicePeriod(e.target.value)}
                    placeholder="Thời kỳ, triều đại..."
                  />
                </div>
              </div>

              {/* Lời đọc thuyết minh */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: 600, fontSize: '12.5px' }}>
                    Lời đọc thuyết minh ({selectedVoiceLang.toUpperCase()})
                  </label>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleLoadPresetKnowledge}
                    style={{ fontSize: '11.5px', padding: '3px 10px' }}
                  >
                    <RotateCw size={11} style={{ marginRight: 4 }} />
                    <span>Nạp lời đọc mẫu</span>
                  </button>
                </div>

                <textarea
                  rows={5}
                  className="form-control"
                  style={{ width: '100%', fontSize: '13px', lineHeight: 1.6, resize: 'vertical' }}
                  value={voiceScript}
                  onChange={(e) => setVoiceScript(e.target.value)}
                  placeholder="Nhập lời chào và câu chuyện lịch sử tự động phát khi khách chiêm ngưỡng cổ vật 3D..."
                />
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
                  {voiceScript.length} ký tự
                </div>
              </div>

              {/* Audio Player nghe thử */}
              {previewAudioUrl && (
                <div
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Volume2 size={14} />
                    <span>Bản nghe thử giọng đọc Voice AI ({selectedVoiceLang.toUpperCase()}):</span>
                  </div>
                  <audio controls key={previewAudioUrl} style={{ width: '100%', height: 36 }}>
                    <source src={previewAudioUrl} />
                    Trình duyệt không hỗ trợ thẻ audio.
                  </audio>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className="modal-footer"
              style={{
                borderTop: '1px solid var(--border-color)',
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsVoiceModalOpen(false)}
              >
                Đóng
              </button>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleGenerateVoiceAudio}
                  disabled={isGeneratingTts || !voiceScript.trim()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  {isGeneratingTts ? <RotateCw size={13} className="spin" /> : <Play size={13} />}
                  <span>{isGeneratingTts ? 'Đang tạo âm thanh...' : 'Tạo giọng đọc (Voice AI)'}</span>
                </button>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveVoiceNarration}
                  disabled={isSavingVoice}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  {isSavingVoice ? <RotateCw size={13} className="spin" /> : <Check size={13} />}
                  <span>{isSavingVoice ? 'Đang lưu...' : 'Lưu thuyết minh'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
