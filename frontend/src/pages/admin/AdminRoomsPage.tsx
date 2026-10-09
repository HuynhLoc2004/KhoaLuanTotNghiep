import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Compass,
  MapPin,
  Clock,
  Layers,
  Search,
  ExternalLink,
  Trash2,
  Edit3,
  Camera,
  Globe,
  Eye,
  Copy,
  Check,
  RotateCw,
  X,
  Sparkles,
  FolderOpen,
  Info,
  Mic,
  BookOpen,
  Volume2,
  QrCode,
  Printer,
  SlidersHorizontal,
  LayoutGrid,
  List,
  CheckCircle2,
  FileText,
  Play,
  Download,
  AlertCircle
} from 'lucide-react';
import { MuseumRoom, TopicItem, LanguageItem } from '../../types';
import { NewRoomModal } from '../../components/NewRoomModal';
import { EditRoomModal } from '../../components/EditRoomModal';
import { TopicManagementModal } from '../../components/TopicManagementModal';
import { Pannellum360Viewer } from '../../viewer360/Pannellum360Viewer';
import { Pagination } from '../../components/Pagination';
import { api, API_BASE } from '../../services/api';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useSystemBranding } from '../../context/SystemBrandingContext';
import { useClientTranslation } from '../../context/ClientTranslationContext';

interface AdminRoomsPageProps {
  rooms: MuseumRoom[];
  onOpenStudio: (room: MuseumRoom) => void;
  onRoomCreated: (newRoom: MuseumRoom) => void;
  onRoomUpdated?: (updatedRoom: MuseumRoom) => void;
  onDeleteRoom: (roomId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

interface PanoHistoryItem {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
  usedInRooms?: string[];
  isUsed?: boolean;
}

// Tư liệu mẫu chuẩn xác của Bảo tàng Lịch sử TP.HCM phục vụ RAG và TTS
const HCMC_MUSEUM_PRESETS_KNOWLEDGE: Record<string, { prompt: string; script: string }> = {
  'P-01': {
    prompt: 'Gian trưng bày P-01: Thời kỳ Tiền - Sơ sử Việt Nam tại Bảo tàng Lịch sử TP.HCM. Nơi lưu giữ các hiện vật đá, đồ gốm, kim loại từ văn hóa Sơn Vi, Hòa Bình, Bắc Sơn đến Đông Sơn, Sa Huỳnh, Đồng Nai.',
    script: 'Kính chào quý khách đến với Gian trưng bày Thời tiền sử và sơ sử Việt Nam. Nơi đây tái hiện dòng chảy lịch sử hàng vạn năm của dân tộc qua hàng trăm cổ vật đá, đồ đồng Đông Sơn và mộ chum Sa Huỳnh độc bản.'
  },
  'P-05': {
    prompt: 'Gian trưng bày P-05: Triều đại Nhà Nguyễn & Mỹ thuật Cung đình Huế (1802-1945). Trưng bày ngai vàng, long bào, sắc phong, đồ ngự dụng gốm sứ và bảo kiếm hoàng triều.',
    script: 'Kính chào quý khách. Đây là không gian trưng bày di sản triều Nguyễn - triều đại phong kiến cuối cùng của Việt Nam. Nơi quý khách được chiêm ngưỡng đỉnh cao của nghệ thuật pháp lam, trang phục cung đình và những cổ vật gắn liền với công cuộc định đô khai hoang phương Nam.'
  },
  'P-09': {
    prompt: 'Bối cảnh tri thức: Gian Di sản Văn hóa Vương quốc Phù Nam - Óc Eo (Thế kỷ 1 - 7 SCN) tại Bảo tàng Lịch sử TP.HCM. Lưu giữ các bảo vật quốc gia như tượng thần Vishnu đá sa thạch, tượng thần Surya, trang sức vàng lá chạm nổi thần linh và tiền cổ La Mã minh chứng cho thương cảng sầm uất bậc nhất cổ đại.',
    script: 'Chào mừng quý khách đến với không gian Di sản Óc Eo - Phù Nam. Hơn một thiên niên kỷ trước, nơi châu thổ sông Cửu Long từng tồn tại một vương quốc thương cảng lừng lẫy, nơi giao thoa giữa các nền văn minh Ấn Độ, La Mã và văn hóa bản địa Nam Bộ.'
  },
  'P-12': {
    prompt: 'Bối cảnh tri thức: Gian Điêu khắc Phật giáo & Ấn Độ giáo Champa (Thế kỷ 7 - 13) tại Bảo tàng Lịch sử TP.HCM. Trưng bày tượng Bồ Tát Tara, thần Shiva múa, vũ nữ Apsara, tượng thần Brahma và bệ thờ Yoni - Linga sa thạch phong cách Trà Kiệu, Mỹ Sơn và Tháp Mẫm.',
    script: 'Kính mời quý khách chiêm ngưỡng nghệ thuật điêu khắc sa thạch Champa huyền bí. Từng khối đá vô tri qua bàn tay tài hoa của nghệ nhân xưa đã trở thành những tượng thần Shiva uy nghiêm và vũ nữ Apsara mềm mại uyển chuyển lưu dấu ngàn năm.'
  },
  'P-16': {
    prompt: 'Bối cảnh tri thức: Gian Bộ sưu tập Cổ vật Vương Hồng Sển tại Bảo tàng Lịch sử TP.HCM. Học giả Vương Hồng Sển đã hiến tặng 849 cổ vật quý giá năm 1996, gồm gốm men lam Huế (Bleu de Huế), đồ gốm thời Minh - Thanh, bình vôi cổ, đồ bạc và tượng Phật cổ phương Nam.',
    script: 'Quý khách đang hiện diện trước Bộ sưu tập của Cụ Vương Hồng Sển - học giả, nhà văn hóa lỗi lạc đã dành trọn cuộc đời sưu tầm và hiến tặng toàn bộ gia tài di sản vô giá này cho nhân dân và khách tham quan Bảo tàng Lịch sử TP.HCM.'
  }
};

export const AdminRoomsPage: React.FC<AdminRoomsPageProps> = ({
  rooms,
  onOpenStudio,
  onRoomCreated,
  onRoomUpdated,
  onDeleteRoom,
  onNavigateTab
}) => {
  const { showToast } = useToast();
  const { branding } = useSystemBranding();
  const { t, localize, currentLang } = useClientTranslation();
  const [activeSubTab, setActiveSubTab] = useState<'rooms' | 'gallery'>('rooms');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<MuseumRoom | null>(null);
  const [selectedPanoForNewRoom, setSelectedPanoForNewRoom] = useState<string | undefined>(undefined);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [showTopicModal, setShowTopicModal] = useState(false);

  // Bộ lọc dữ liệu
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Slide-over Drawer: Cấu hình AI & Thuyết minh Đa ngôn ngữ
  const [aiDrawerRoom, setAiDrawerRoom] = useState<MuseumRoom | null>(null);
  const [drawerActiveTab, setDrawerActiveTab] = useState<'rag' | 'tts'>('rag');
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<string>('vi');
  const [workingTranslations, setWorkingTranslations] = useState<Record<string, any>>({});
  const [isTranslatingAi, setIsTranslatingAi] = useState(false);
  const [aiKnowledgePrompt, setAiKnowledgePrompt] = useState('');
  const [aiScript, setAiScript] = useState('');
  const [aiVoiceLang, setAiVoiceLang] = useState('vi-south');
  const [isSavingAi, setIsSavingAi] = useState(false);
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [isGeneratingAllVoices, setIsGeneratingAllVoices] = useState(false);
  const [generatingAllStatus, setGeneratingAllStatus] = useState<string>('');

  // Modal QR Standee
  const [selectedQrRoom, setSelectedQrRoom] = useState<MuseumRoom | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // Custom Confirm Dialog (Không dùng alert/confirm mặc định của trình duyệt)
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

  const triggerConfirm = (
    title: string,
    message: string,
    onConfirmAction: () => void,
    type: 'danger' | 'warning' | 'info' = 'danger',
    confirmText: string = 'Xóa vĩnh viễn'
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      onConfirm: () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        onConfirmAction();
      }
    });
  };

  // Kho ảnh 360° đã tạo
  const [panoramas, setPanoramas] = useState<PanoHistoryItem[]>([]);
  const [selectedFilenames, setSelectedFilenames] = useState<string[]>([]);
  const [loadingPanos, setLoadingPanos] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewPanoUrl, setPreviewPanoUrl] = useState<{ url: string; title: string } | null>(null);

  // Pagination (Theo chuẩn bội số 3 cho lưới thẻ: 6 - 9 - 12 - 18 - 24)
  const [roomPage, setRoomPage] = useState(1);
  const [roomPageSize, setRoomPageSize] = useState(6);
  const [panoPage, setPanoPage] = useState(1);
  const [panoPageSize, setPanoPageSize] = useState(6);

  // Lắng nghe phím Escape để đóng nhanh các modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (aiDrawerRoom) handleCloseAiDrawer();
        if (showQrModal) setShowQrModal(false);
        if (previewPanoUrl) setPreviewPanoUrl(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aiDrawerRoom, showQrModal, previewPanoUrl]);

  const fetchPanoramas = async () => {
    try {
      setLoadingPanos(true);
      const res = await fetch(`${API_BASE}/stitch/history`);
      const data = await res.json();
      if (data.success && Array.isArray(data.panoramas)) {
        setPanoramas(data.panoramas);
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách ảnh 360:', err);
    } finally {
      setLoadingPanos(false);
    }
  };

  const loadTopics = async () => {
    try {
      const data = await api.getTopics();
      setTopics(data);
    } catch (err) {
      console.warn('Lỗi tải danh mục chuyên đề:', err);
    }
  };

  const fetchLanguages = async () => {
    try {
      const data = await api.getLanguages();
      const active = data.filter((l: any) => l.isActive);
      if (active.length > 0) {
        setLanguages(active);
      } else {
        setLanguages([
          { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flagIcon: '🇻🇳', isDefault: true, isActive: true, order: 1 },
          { code: 'en', name: 'English', nativeName: 'English', flagIcon: '🇬🇧', isDefault: false, isActive: true, order: 2 },
          { code: 'fr', name: 'French', nativeName: 'Français', flagIcon: '🇫🇷', isDefault: false, isActive: true, order: 3 }
        ]);
      }
    } catch {
      setLanguages([
        { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flagIcon: '🇻🇳', isDefault: true, isActive: true, order: 1 },
        { code: 'en', name: 'English', nativeName: 'English', flagIcon: '🇬🇧', isDefault: false, isActive: true, order: 2 },
        { code: 'fr', name: 'French', nativeName: 'Français', flagIcon: '🇫🇷', isDefault: false, isActive: true, order: 3 }
      ]);
    }
  };

  useEffect(() => {
    fetchPanoramas();
    loadTopics();
    fetchLanguages();
  }, []);

  const [isSeedingHeritage, setIsSeedingHeritage] = useState(false);
  const handleSeedHeritage = async () => {
    try {
      setIsSeedingHeritage(true);
      const res = await api.seedHeritageRooms();
      if (res.success) {
        showToast(res.message || 'Đã khởi tạo thành công 18 gian phòng di sản!', 'success');
        const refreshed = await api.getRooms();
        refreshed.forEach((r) => onRoomCreated(r));
        window.location.reload();
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi khởi tạo dữ liệu di sản mẫu', 'error');
    } finally {
      setIsSeedingHeritage(false);
    }
  };

  const [isClearingAll, setIsClearingAll] = useState(false);
  const handleClearAllRooms = () => {
    triggerConfirm(
      'Xác nhận xóa toàn bộ gian phòng',
      'Bạn có chắc chắn muốn xóa toàn bộ các gian phòng trưng bày hiện có không? Dữ liệu phòng và các điểm liên kết sẽ được dọn dẹp sạch sẽ để bạn tạo phòng mới.',
      async () => {
        try {
          setIsClearingAll(true);
          const res = await api.clearAllRooms();
          showToast(res.message || 'Đã xóa toàn bộ gian phòng thành công!', 'success');
          window.location.reload();
        } catch (err: any) {
          showToast(err.message || 'Lỗi khi xóa toàn bộ gian phòng', 'error');
        } finally {
          setIsClearingAll(false);
        }
      },
      'danger',
      'Xóa sạch tất cả phòng'
    );
  };

  useEffect(() => {
    setRoomPage(1);
    setPanoPage(1);
  }, [searchQuery, selectedCategory, selectedStatus, activeSubTab]);

  // Khi mở Slide-over Drawer của phòng nào, nạp đúng dữ liệu của phòng đó từ DB và Translations
  const handleOpenAiDrawer = (room: MuseumRoom) => {
    setAiDrawerRoom(room);
    setSelectedVoiceLang('vi');

    // Khởi tạo map bản dịch từ room.translations hỗ trợ chuỗi JSON, Map và Object
    let existingTrans: Record<string, any> = {};
    if (typeof room.translations === 'string') {
      try {
        existingTrans = JSON.parse(room.translations);
      } catch {
        existingTrans = {};
      }
    } else if (room.translations instanceof Map) {
      existingTrans = Object.fromEntries(room.translations);
    } else if (room.translations && typeof (room.translations as any).entries === 'function') {
      try {
        existingTrans = Object.fromEntries((room.translations as any).entries());
      } catch {
        existingTrans = { ...room.translations };
      }
    } else if (room.translations && typeof room.translations === 'object') {
      existingTrans = JSON.parse(JSON.stringify(room.translations));
    }

    // Chuẩn bị sẵn tiếng Việt nếu chưa có trong map
    if (!existingTrans.vi) {
      existingTrans.vi = {
        name: room.name,
        period: room.period,
        description: room.description,
        narrationScript: room.aiScript || '',
        audioUrl: (room as any).audioUrl || '',
        aiKnowledgePrompt: room.aiKnowledgePrompt || room.description || ''
      };
    } else {
      if (!existingTrans.vi.narrationScript && room.aiScript) {
        existingTrans.vi.narrationScript = room.aiScript;
      }
      if (!existingTrans.vi.aiKnowledgePrompt && room.aiKnowledgePrompt) {
        existingTrans.vi.aiKnowledgePrompt = room.aiKnowledgePrompt;
      }
      if (!existingTrans.vi.audioUrl && (room as any).audioUrl) {
        existingTrans.vi.audioUrl = (room as any).audioUrl;
      }
    }

    // Bảo tồn triệt để mọi bản dịch đã có, chỉ loại bỏ audio rác nếu trùng hệt audio tiếng Việt
    const viAudio = (existingTrans.vi.audioUrl || (room as any).audioUrl || '').trim();
    for (const [code, val] of Object.entries(existingTrans)) {
      if (code !== 'vi' && val) {
        if (!val.narrationScript?.trim() && val.description?.trim()) {
          val.narrationScript = val.description.trim();
        }
        if (viAudio && val.audioUrl?.trim() === viAudio) {
          val.audioUrl = '';
        }
      }
    }

    setWorkingTranslations(existingTrans);

    const viData = existingTrans.vi;
    setAiKnowledgePrompt(viData.aiKnowledgePrompt || room.aiKnowledgePrompt || room.description || '');
    setAiScript(viData.narrationScript || room.aiScript || '');
    setAiVoiceLang(room.aiVoiceLang || 'vi-south');
    setPreviewAudioUrl(viData.audioUrl || (room as any).audioUrl || null);

    setDrawerActiveTab('tts');
  };

  const handleCloseAiDrawer = () => {
    // Nếu người dùng có nội dung chưa lưu trong ô nhập hiện tại, tự động đồng bộ ngầm trước khi đóng
    if (aiDrawerRoom && aiScript.trim()) {
      const currentScript = aiScript.trim();
      const currentAudio = previewAudioUrl || workingTranslations[selectedVoiceLang]?.audioUrl || '';
      const updated = {
        ...(aiDrawerRoom.translations || {}),
        ...workingTranslations,
        [selectedVoiceLang]: {
          ...(workingTranslations[selectedVoiceLang] || aiDrawerRoom.translations?.[selectedVoiceLang] || {}),
          name: workingTranslations[selectedVoiceLang]?.name || (selectedVoiceLang === 'vi' ? aiDrawerRoom.name : undefined),
          period: workingTranslations[selectedVoiceLang]?.period || (selectedVoiceLang === 'vi' ? aiDrawerRoom.period : undefined),
          description: workingTranslations[selectedVoiceLang]?.description || (selectedVoiceLang === 'vi' ? aiDrawerRoom.description : undefined),
          aiKnowledgePrompt: aiKnowledgePrompt.trim(),
          narrationScript: currentScript,
          audioUrl: currentAudio
        }
      };
      api.updateRoom(aiDrawerRoom.id, { translations: updated }).then(updatedRoom => {
        if (onRoomUpdated) onRoomUpdated(updatedRoom);
      }).catch(err => console.warn('[Auto-sync close warning]:', err));
    }

    setAiDrawerRoom(null);
    setPreviewAudioUrl(null);
    setWorkingTranslations({});
  };

  // Tìm nguồn ngôn ngữ có sẵn nội dung để dịch tự động (Ưu tiên Tiếng Việt, hoặc bất kỳ ngôn ngữ nào đã có script)
  const getBestTranslationSource = () => {
    // 1. Kiểm tra text đang gõ trong tab hiện tại nếu là tiếng Việt
    if (selectedVoiceLang === 'vi' && aiScript.trim()) {
      return { lang: 'vi', script: aiScript.trim(), knowledge: aiKnowledgePrompt.trim() };
    }
    // 2. Kiểm tra workingTranslations.vi
    const viTrans = workingTranslations.vi;
    if (viTrans?.narrationScript?.trim()) {
      return { lang: 'vi', script: viTrans.narrationScript.trim(), knowledge: viTrans.aiKnowledgePrompt?.trim() || '' };
    }
    // 3. Kiểm tra aiDrawerRoom.aiScript
    if (aiDrawerRoom?.aiScript?.trim()) {
      return { lang: 'vi', script: aiDrawerRoom.aiScript.trim(), knowledge: aiDrawerRoom.aiKnowledgePrompt?.trim() || aiDrawerRoom.description?.trim() || '' };
    }
    // 4. Tìm bất kỳ ngôn ngữ nào khác trong workingTranslations có narrationScript
    for (const [code, val] of Object.entries(workingTranslations)) {
      if (code !== selectedVoiceLang && (val as any)?.narrationScript?.trim()) {
        return { lang: code, script: (val as any).narrationScript.trim(), knowledge: (val as any).aiKnowledgePrompt?.trim() || '' };
      }
    }
    // 5. Tìm trong aiDrawerRoom.translations
    if (aiDrawerRoom?.translations) {
      for (const [code, val] of Object.entries(aiDrawerRoom.translations)) {
        if (code !== selectedVoiceLang && (val as any)?.narrationScript?.trim()) {
          return { lang: code, script: (val as any).narrationScript.trim(), knowledge: (val as any).aiKnowledgePrompt?.trim() || '' };
        }
      }
    }
    return null;
  };

  // Chuyển đổi giữa các ngôn ngữ trong Drawer
  const handleSwitchDrawerLanguage = (targetLangCode: string) => {
    if (!aiDrawerRoom) return;

    // Lưu nội dung ngôn ngữ hiện tại vào workingTranslations
    const currentScript = aiScript.trim();
    const currentKnowledge = aiKnowledgePrompt.trim();
    const updated = {
      ...(aiDrawerRoom.translations || {}),
      ...workingTranslations,
      [selectedVoiceLang]: {
        ...(workingTranslations[selectedVoiceLang] || aiDrawerRoom.translations?.[selectedVoiceLang] || {}),
        name: workingTranslations[selectedVoiceLang]?.name || (selectedVoiceLang === 'vi' ? aiDrawerRoom.name : undefined),
        period: workingTranslations[selectedVoiceLang]?.period || (selectedVoiceLang === 'vi' ? aiDrawerRoom.period : undefined),
        description: workingTranslations[selectedVoiceLang]?.description || (selectedVoiceLang === 'vi' ? aiDrawerRoom.description : undefined),
        aiKnowledgePrompt: currentKnowledge,
        narrationScript: currentScript,
        audioUrl: currentScript ? (previewAudioUrl || workingTranslations[selectedVoiceLang]?.audioUrl || '') : (workingTranslations[selectedVoiceLang]?.audioUrl || '')
      }
    };
    setWorkingTranslations(updated);

    setSelectedVoiceLang(targetLangCode);

    // Nạp dữ liệu của targetLangCode
    const targetData = updated[targetLangCode] || aiDrawerRoom.translations?.[targetLangCode];
    if (targetLangCode === 'vi') {
      const viScript = targetData?.narrationScript || aiDrawerRoom.aiScript || '';
      setAiKnowledgePrompt(targetData?.aiKnowledgePrompt || aiDrawerRoom.aiKnowledgePrompt || aiDrawerRoom.description || '');
      setAiScript(viScript);
      setPreviewAudioUrl(viScript.trim() ? (targetData?.audioUrl || (aiDrawerRoom as any).audioUrl || null) : null);
      setAiVoiceLang(aiDrawerRoom.aiVoiceLang || 'vi-south');
    } else {
      const targetScript = targetData?.narrationScript || targetData?.description || '';
      setAiKnowledgePrompt(targetData?.aiKnowledgePrompt || '');
      setAiScript(targetScript);

      // Tuyệt đối không lấy audio của tiếng Việt hoặc khi chưa có text!
      const viAudio = ((aiDrawerRoom as any).audioUrl || updated.vi?.audioUrl || '').trim();
      const rawAudio = targetData?.audioUrl || null;
      const validAudio = (rawAudio && rawAudio.trim() !== viAudio) ? rawAudio : null;
      setPreviewAudioUrl(validAudio);
      setAiVoiceLang(targetLangCode === 'en' ? 'en-us' : targetLangCode === 'fr' ? 'fr-fr' : targetLangCode);
    }
  };

  // Dịch tự động từ nguồn ngôn ngữ có sẵn sang ngôn ngữ đang chọn VÀ ĐIỀN VÀO Ô INPUT
  const handleAutoTranslateCurrentLang = async () => {
    if (!aiDrawerRoom) return;
    const source = getBestTranslationSource();
    if (!source || !source.script) {
      showToast('Chưa có nội dung văn bản ở bất kỳ ngôn ngữ nào để dịch thuật. Vui lòng nhập nội dung thuyết minh trước!', 'warning');
      return;
    }

    try {
      setIsTranslatingAi(true);
      const sourceLangObj = languages.find(l => l.code === source.lang);
      const targetLangObj = languages.find(l => l.code === selectedVoiceLang);
      const sourceName = sourceLangObj?.nativeName || (source.lang === 'vi' ? 'Tiếng Việt' : source.lang.toUpperCase());
      const targetName = targetLangObj?.nativeName || selectedVoiceLang.toUpperCase();

      // Dịch văn bản với AI Di sản & Heritage Glossary
      const draft = await api.translateDraft({
        targetLang: selectedVoiceLang,
        name: aiDrawerRoom.name,
        period: aiDrawerRoom.period,
        description: source.knowledge || source.script,
        narrationScript: source.script
      });

      const translatedKnowledge = draft.description || draft.narrationScript || '';
      const translatedScript = draft.narrationScript || '';

      if (translatedKnowledge) setAiKnowledgePrompt(translatedKnowledge);
      if (translatedScript) setAiScript(translatedScript);

      // Reset audio vì văn bản mới dịch chưa thu âm voice
      setPreviewAudioUrl(null);

      const updatedTrans = {
        ...(aiDrawerRoom.translations || {}),
        ...workingTranslations,
        [selectedVoiceLang]: {
          ...(workingTranslations[selectedVoiceLang] || aiDrawerRoom.translations?.[selectedVoiceLang] || {}),
          name: draft.name || aiDrawerRoom.name,
          period: draft.period || aiDrawerRoom.period,
          description: draft.description || '',
          aiKnowledgePrompt: translatedKnowledge,
          narrationScript: translatedScript,
          audioUrl: '' // Reset audioUrl vì nội dung văn bản mới dịch chưa tạo voice
        }
      };

      setWorkingTranslations(updatedTrans);

      // TỰ ĐỘNG LƯU NGAY VÀO SERVER ĐỂ KHÔNG BỊ MẤT NẾU ĐÓNG MODAL
      try {
        const patchPayload: any = {
          translations: updatedTrans
        };
        const updatedRoom = await api.updateRoom(aiDrawerRoom.id, patchPayload);
        setAiDrawerRoom(updatedRoom);
        if (onRoomUpdated) onRoomUpdated(updatedRoom);
      } catch (autoSaveErr) {
        console.warn('Lỗi tự động lưu bản dịch:', autoSaveErr);
      }

      showToast(`Đã tự động dịch từ ${sourceName} sang ${targetName} và lưu vào hệ thống! Bây giờ bạn hãy bấm "Tạo giọng đọc & Nghe thử" để sinh Voice AI.`, 'success');
    } catch (err: any) {
      showToast('Lỗi khi dịch thuật: ' + err.message, 'error');
    } finally {
      setIsTranslatingAi(false);
    }
  };

  // Tự động Dịch và Tạo Voice AI cho TẤT CẢ các ngôn ngữ còn lại từ đoạn text đang có (Ngôn ngữ A -> B, C...)
  const handleGenerateAllLanguagesVoice = async () => {
    if (!aiDrawerRoom) return;
    const sourceScript = aiScript.trim();
    const sourceKnowledge = aiKnowledgePrompt.trim();

    if (!sourceScript) {
      showToast('Vui lòng nhập lời đọc thuyết minh trước khi tạo tự động cho các ngôn ngữ khác', 'warning');
      return;
    }

    try {
      setIsGeneratingAllVoices(true);
      const sourceLangCode = selectedVoiceLang;
      const targetLangs = languages.filter(l => l.code !== sourceLangCode);

      // 1. Tạo audio cho ngôn ngữ hiện tại (A) nếu chưa có
      setGeneratingAllStatus(`Đang tạo Voice AI cho ${languages.find(l => l.code === sourceLangCode)?.nativeName || sourceLangCode.toUpperCase()}...`);
      let sourceAudio = previewAudioUrl;
      try {
        const sourceRes = await api.generateTtsAudio({
          text: sourceScript,
          langCode: sourceLangCode,
          roomCode: aiDrawerRoom.code
        });
        sourceAudio = sourceRes.audioUrl.startsWith('http')
          ? sourceRes.audioUrl
          : `${API_BASE.replace('/api', '')}${sourceRes.audioUrl}`;
        setPreviewAudioUrl(sourceAudio);
      } catch (e: any) {
        console.warn('Lỗi tạo audio ngôn ngữ gốc:', e.message);
      }

      const newTranslations: Record<string, any> = {
        ...(aiDrawerRoom.translations || {}),
        ...workingTranslations,
        [sourceLangCode]: {
          ...(workingTranslations[sourceLangCode] || aiDrawerRoom.translations?.[sourceLangCode] || {}),
          name: workingTranslations[sourceLangCode]?.name || (sourceLangCode === 'vi' ? aiDrawerRoom.name : undefined),
          period: workingTranslations[sourceLangCode]?.period || (sourceLangCode === 'vi' ? aiDrawerRoom.period : undefined),
          description: workingTranslations[sourceLangCode]?.description || (sourceLangCode === 'vi' ? aiDrawerRoom.description : undefined),
          aiKnowledgePrompt: sourceKnowledge,
          narrationScript: sourceScript,
          audioUrl: sourceAudio || workingTranslations[sourceLangCode]?.audioUrl || ''
        }
      };

      // 2. Dịch và tạo Voice AI lần lượt cho các ngôn ngữ B, C...
      for (const targetLang of targetLangs) {
        setGeneratingAllStatus(`Đang dịch thuật và tạo Voice AI cho ${targetLang.nativeName || targetLang.code.toUpperCase()}...`);
        try {
          // Dịch AI kết hợp từ điển Heritage Glossary
          const draft = await api.translateDraft({
            targetLang: targetLang.code,
            name: aiDrawerRoom.name,
            period: aiDrawerRoom.period,
            description: sourceKnowledge || aiDrawerRoom.description || '',
            narrationScript: sourceScript
          });

          const transScript = draft.narrationScript || sourceScript;
          const transKnowledge = draft.description || sourceKnowledge;

          // Sinh file âm thanh Voice AI thật bằng Google TTS
          let audioUrl = '';
          try {
            const ttsRes = await api.generateTtsAudio({
              text: transScript,
              langCode: targetLang.code,
              roomCode: aiDrawerRoom.code
            });
            audioUrl = ttsRes.audioUrl.startsWith('http')
              ? ttsRes.audioUrl
              : `${API_BASE.replace('/api', '')}${ttsRes.audioUrl}`;
          } catch (ttsErr: any) {
            console.warn(`Lỗi tạo TTS cho ${targetLang.code}:`, ttsErr.message);
          }

          newTranslations[targetLang.code] = {
            name: draft.name || aiDrawerRoom.name,
            period: draft.period || aiDrawerRoom.period,
            description: draft.description || '',
            aiKnowledgePrompt: transKnowledge,
            narrationScript: transScript,
            audioUrl: audioUrl || newTranslations[targetLang.code]?.audioUrl || ''
          };
        } catch (langErr: any) {
          console.warn(`Lỗi dịch cho ${targetLang.code}:`, langErr.message);
        }
      }

      setWorkingTranslations(newTranslations);

      // 3. Tự động lưu luôn vào Database (MongoDB & PostgreSQL)
      setGeneratingAllStatus('Đang đồng bộ dữ liệu vào cơ sở dữ liệu...');
      const payload: any = {
        translations: newTranslations
      };
      if (sourceLangCode === 'vi') {
        payload.aiKnowledgePrompt = sourceKnowledge;
        payload.aiScript = sourceScript;
        payload.aiVoiceEnabled = true;
        payload.aiVoiceLang = aiVoiceLang;
        if (sourceAudio) payload.audioUrl = sourceAudio;
      }

      const updated = await api.updateRoom(aiDrawerRoom.id, payload);
      aiDrawerRoom.translations = updated.translations;
      if (sourceLangCode === 'vi') {
        aiDrawerRoom.aiKnowledgePrompt = updated.aiKnowledgePrompt;
        aiDrawerRoom.aiScript = updated.aiScript;
        aiDrawerRoom.aiVoiceEnabled = true;
        aiDrawerRoom.aiVoiceLang = aiVoiceLang;
        if (sourceAudio) (aiDrawerRoom as any).audioUrl = sourceAudio;
      }
      if (onRoomUpdated) onRoomUpdated(updated);

      showToast(`⚡ Đã tự động tạo Voice AI và dịch thành công cho toàn bộ ngôn ngữ (${languages.map(l => l.nativeName || l.code.toUpperCase()).join(', ')})!`, 'success');
    } catch (err: any) {
      showToast('Lỗi khi tạo tự động đa ngôn ngữ: ' + err.message, 'error');
    } finally {
      setIsGeneratingAllVoices(false);
      setGeneratingAllStatus('');
    }
  };

  // Nạp tư liệu mẫu nếu phòng này là một trong các phòng chuẩn của Bảo tàng Lịch sử TP.HCM
  const handleLoadPresetKnowledge = () => {
    if (!aiDrawerRoom) return;
    const preset = HCMC_MUSEUM_PRESETS_KNOWLEDGE[aiDrawerRoom.code];
    if (preset) {
      setAiKnowledgePrompt(preset.prompt);
      setAiScript(preset.script);
      showToast(`Đã nạp tư liệu lịch sử chuẩn cho ${aiDrawerRoom.name}`, 'info');
    } else {
      // Mẫu tổng quát nếu là phòng tùy biến
      const museumTitle = branding.shortName || 'Bảo tàng';
      setAiKnowledgePrompt(`Bối cảnh lịch sử: Gian ${aiDrawerRoom.name} thuộc chuyên đề ${aiDrawerRoom.period} tại ${museumTitle}. Trưng bày các hiện vật quý ghi dấu quá trình hình thành văn hóa và tiến trình phát triển.`);
      setAiScript(`Chào mừng quý khách đến với ${aiDrawerRoom.name} tại ${museumTitle}. Không gian này mang lại cho quý khách cái nhìn chân thực về các di sản tiêu biểu.`);
      showToast('Đã nạp văn bản mẫu gợi ý', 'info');
    }
  };

  // Tạo bản nghe thử giọng đọc thuyết minh thật theo đúng ngôn ngữ đang chọn
  const handleGenerateTtsAudio = async () => {
    if (!aiScript || !aiScript.trim()) {
      showToast('Chưa có nội dung văn bản để tạo giọng đọc Voice AI! Vui lòng nhập lời đọc hoặc bấm "Dịch tự động".', 'warning');
      return;
    }
    try {
      setIsGeneratingTts(true);
      const res = await api.generateTtsAudio({
        text: aiScript.trim(),
        langCode: selectedVoiceLang,
        roomCode: aiDrawerRoom?.code || 'room'
      });
      const resolvedUrl = res.audioUrl.startsWith('http')
        ? res.audioUrl
        : `${API_BASE.replace('/api', '')}${res.audioUrl}`;
      setPreviewAudioUrl(resolvedUrl);

      const currentLangData = {
        ...(workingTranslations[selectedVoiceLang] || aiDrawerRoom?.translations?.[selectedVoiceLang] || {}),
        name: workingTranslations[selectedVoiceLang]?.name || (selectedVoiceLang === 'vi' ? aiDrawerRoom?.name : undefined),
        period: workingTranslations[selectedVoiceLang]?.period || (selectedVoiceLang === 'vi' ? aiDrawerRoom?.period : undefined),
        description: workingTranslations[selectedVoiceLang]?.description || (selectedVoiceLang === 'vi' ? aiDrawerRoom?.description : undefined),
        aiKnowledgePrompt: aiKnowledgePrompt.trim(),
        narrationScript: aiScript.trim(),
        audioUrl: resolvedUrl
      };

      const updatedTranslations = {
        ...(aiDrawerRoom?.translations || {}),
        ...workingTranslations,
        [selectedVoiceLang]: currentLangData
      };

      setWorkingTranslations(updatedTranslations);

      // TỰ ĐỘNG LƯU NGAY LẬP TỨC VÀO CSDL ĐỂ DÙ THOÁT MODAL CŨNG KHÔNG BAO GIỜ BỊ MẤT
      if (aiDrawerRoom) {
        try {
          const patchPayload: any = {
            translations: updatedTranslations
          };
          if (selectedVoiceLang === 'vi') {
            patchPayload.aiKnowledgePrompt = aiKnowledgePrompt.trim();
            patchPayload.aiScript = aiScript.trim();
            patchPayload.aiVoiceEnabled = true;
            patchPayload.aiVoiceLang = aiVoiceLang;
            patchPayload.audioUrl = resolvedUrl;
          }
          const updated = await api.updateRoom(aiDrawerRoom.id, patchPayload);
          setAiDrawerRoom(updated);
          if (onRoomUpdated) onRoomUpdated(updated);
        } catch (autoSaveErr) {
          console.warn('[Auto-save TTS Warning]:', autoSaveErr);
        }
      }

      const langObj = languages.find(l => l.code === selectedVoiceLang);
      showToast(`Đã xuất bản và lưu vĩnh viễn Voice AI (${langObj?.nativeName || selectedVoiceLang.toUpperCase()}) thành công!`, 'success');
    } catch (err: any) {
      showToast('Lỗi khi tạo Voice AI: ' + err.message, 'error');
    } finally {
      setIsGeneratingTts(false);
    }
  };

  // Lưu toàn bộ dữ liệu thuyết minh & tư liệu thật vào Database (Cả MongoDB và PostgreSQL)
  const handleSaveAiData = async () => {
    if (!aiDrawerRoom) return;
    try {
      setIsSavingAi(true);

      const hasScript = Boolean(aiScript.trim());
      let currentAudio = previewAudioUrl || workingTranslations[selectedVoiceLang]?.audioUrl || '';

      if (hasScript && !currentAudio) {
        // Tự động sinh Voice AI nếu chưa có file âm thanh mà người dùng đã nhập lời đọc thuyết minh
        try {
          const ttsRes = await api.generateTtsAudio({
            text: aiScript.trim(),
            langCode: selectedVoiceLang,
            roomCode: aiDrawerRoom.code
          });
          currentAudio = ttsRes.audioUrl.startsWith('http')
            ? ttsRes.audioUrl
            : `${API_BASE.replace('/api', '')}${ttsRes.audioUrl}`;
          setPreviewAudioUrl(currentAudio);
        } catch (e: any) {
          console.warn('Lỗi tự động sinh Voice AI khi lưu:', e.message);
        }
      }

      const finalTranslations = {
        ...(aiDrawerRoom.translations || {}),
        ...workingTranslations,
        [selectedVoiceLang]: {
          ...(workingTranslations[selectedVoiceLang] || aiDrawerRoom.translations?.[selectedVoiceLang] || {}),
          name: workingTranslations[selectedVoiceLang]?.name || (selectedVoiceLang === 'vi' ? aiDrawerRoom.name : undefined),
          period: workingTranslations[selectedVoiceLang]?.period || (selectedVoiceLang === 'vi' ? aiDrawerRoom.period : undefined),
          description: workingTranslations[selectedVoiceLang]?.description || (selectedVoiceLang === 'vi' ? aiDrawerRoom.description : undefined),
          aiKnowledgePrompt: aiKnowledgePrompt.trim(),
          narrationScript: aiScript.trim(),
          audioUrl: currentAudio
        }
      };

      const payload: any = {
        translations: finalTranslations
      };

      if (selectedVoiceLang === 'vi') {
        payload.aiKnowledgePrompt = aiKnowledgePrompt.trim();
        payload.aiScript = aiScript.trim();
        payload.aiVoiceEnabled = Boolean(hasScript && currentAudio);
        payload.aiVoiceLang = aiVoiceLang;
        payload.audioUrl = currentAudio;
      }

      const updated = await api.updateRoom(aiDrawerRoom.id, payload);

      setAiDrawerRoom(updated);
      setWorkingTranslations(finalTranslations);
      if (onRoomUpdated) onRoomUpdated(updated);

      const langObj = languages.find(l => l.code === selectedVoiceLang);
      showToast(`Đã lưu thuyết minh & Voice AI (${langObj?.nativeName || selectedVoiceLang.toUpperCase()}) thành công!`, 'success');
      handleCloseAiDrawer();
    } catch (err: any) {
      showToast('Lỗi khi lưu dữ liệu: ' + err.message, 'error');
    } finally {
      setIsSavingAi(false);
    }
  };

  const handleSaveRagKnowledge = handleSaveAiData;
  const handleSaveTtsVoice = handleSaveAiData;

  // Mở modal Standee QR
  const handleOpenQrModal = (room: MuseumRoom) => {
    setSelectedQrRoom(room);
    setShowQrModal(true);
  };

  // Lấy danh sách các chuyên đề/thời kỳ thực tế từ Topic DB và phòng hiện tại
  const availablePeriods = useMemo(() => {
    const topicNames = topics.map((t) => t.name?.trim()).filter(Boolean);
    const roomPeriods = rooms.map((r) => r.period?.trim()).filter(Boolean) as string[];
    return Array.from(new Set([...topicNames, ...roomPeriods]));
  }, [topics, rooms]);

  // Lọc dữ liệu phòng
  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.period && r.period.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' ||
      r.period?.trim() === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'active' && r.active) ||
      (selectedStatus === 'inactive' && !r.active) ||
      (selectedStatus === 'ai_enabled' && (r.aiVoiceEnabled || r.aiKnowledgePrompt)) ||
      (selectedStatus === 'no_ai' && !r.aiVoiceEnabled && !r.aiKnowledgePrompt);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredPanos = panoramas.filter((p) =>
    p.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedRooms = filteredRooms.slice((roomPage - 1) * roomPageSize, roomPage * roomPageSize);
  const paginatedPanos = filteredPanos.slice((panoPage - 1) * panoPageSize, panoPage * panoPageSize);

  // Real-time Database Metrics (KPI)
  const totalHotspots = rooms.reduce((acc, r) => acc + (r.hotspots?.length || 0), 0);
  const publishedCount = rooms.filter((r) => r.active).length;
  const aiRoomsCount = rooms.filter((r) => r.aiVoiceEnabled || (r.aiKnowledgePrompt && r.aiKnowledgePrompt.length > 0)).length;
  const digitizationPercent = rooms.length > 0 ? Math.round((rooms.filter((r) => r.panoramaUrl).length / rooms.length) * 100) : 0;
  const totalQrScans = rooms.reduce((acc, r) => acc + (r.qrScanCount || 0), 0);

  // Xóa Pano ảnh 360
  const handleDeletePano = (filename: string, usedInRooms?: string[]) => {
    if (usedInRooms && usedInRooms.length > 0) {
      showToast(`Không thể xóa ảnh toàn cảnh này vì đang được sử dụng trong gian phòng "${usedInRooms.join(', ')}". Vui lòng thay đổi hoặc gỡ ảnh trong gian phòng trước khi xóa.`, 'warning');
      return;
    }

    triggerConfirm(
      'Xóa không gian 360°',
      `Bạn có chắc chắn muốn xóa file toàn cảnh "${filename}"?`,
      async () => {
        try {
          const res = await fetch(`${API_BASE}/stitch/panoramas/${encodeURIComponent(filename)}`, {
            method: 'DELETE'
          });
          const data = await res.json();
          if (data.success) {
            setPanoramas((prev) => prev.filter((p) => p.filename !== filename));
            setSelectedFilenames((prev) => prev.filter((f) => f !== filename));
            showToast('Đã xóa không gian 360° thành công', 'success');
          } else {
            showToast(data.message || 'Lỗi khi xóa file ảnh', 'error');
          }
        } catch (err: any) {
          showToast('Lỗi kết nối máy chủ: ' + err.message, 'error');
        }
      }
    );
  };

  const handleToggleSelect = (filename: string) => {
    setSelectedFilenames((prev) =>
      prev.includes(filename) ? prev.filter((f) => f !== filename) : [...prev, filename]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedFilenames.length === 0) return;
    const inUseItems = panoramas.filter((p) => selectedFilenames.includes(p.filename) && p.usedInRooms && p.usedInRooms.length > 0);
    if (inUseItems.length > 0 && inUseItems.length === selectedFilenames.length) {
      const roomNames = Array.from(new Set(inUseItems.flatMap((i) => i.usedInRooms || []))).join(', ');
      showToast(`Không thể xóa các ảnh đã chọn vì đều đang được sử dụng trong gian phòng "${roomNames}". Vui lòng gỡ ảnh trong gian phòng trước khi xóa.`, 'warning');
      return;
    }

    triggerConfirm(
      'Xóa hàng loạt không gian 360°',
      `Bạn có chắc muốn xóa vĩnh viễn ${selectedFilenames.length} file ảnh 360° đã chọn khỏi máy chủ lưu trữ?`,
      async () => {
        try {
          const res = await fetch(`${API_BASE}/stitch/panoramas/batch-delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filenames: selectedFilenames })
          });
          const data = await res.json();
          if (data.success) {
            setPanoramas((prev) => prev.filter((p) => !selectedFilenames.includes(p.filename)));
            setSelectedFilenames([]);
            showToast(data.message || `Đã xóa thành công ${selectedFilenames.length} ảnh 360°`, 'success');
          } else {
            showToast(data.message || 'Lỗi khi xóa ảnh', 'error');
          }
        } catch (err: any) {
          showToast('Lỗi kết nối máy chủ: ' + err.message, 'error');
        }
      }
    );
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    showToast('Đã sao chép liên kết ảnh 360° vào bộ nhớ tạm', 'success');
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleCreateRoomFromPano = (panoUrl: string) => {
    setSelectedPanoForNewRoom(panoUrl);
    setShowNewModal(true);
  };

  return (
    <div className="admin-content">
      {/* BĂNG THỐNG KÊ DI SẢN: Thiết kế độc bản, trang trọng, xóa bỏ hoàn toàn phong cách AI SaaS */}
      <div className="heritage-stats-banner">
        {/* Mục 1: Không gian Gian phòng Tour 360 */}
        <div className="heritage-stat-col">
          <div className="heritage-stat-header">
            <span className="heritage-stat-icon-wrapper">
              <Compass size={15} />
            </span>
            <span className="heritage-stat-title">{t('stats.roomsTitle', 'Phòng Trưng Bày')}</span>
          </div>
          <div className="heritage-stat-body">
            <div className="heritage-stat-metric">
              <span className="heritage-stat-number">{publishedCount}</span>
              <span className="heritage-stat-denom">/{rooms.length}</span>
              <span className="heritage-stat-unit">{t('stats.roomsUnit', 'phòng')}</span>
            </div>
            <div className="heritage-stat-sub">
              <span>{rooms.length > 0 ? `${publishedCount} phòng đang mở cửa tham quan` : 'Chưa có phòng trưng bày'}</span>
            </div>
          </div>
        </div>

        {/* Mục 2: Cổ vật & Điểm thông tin */}
        <div className="heritage-stat-col">
          <div className="heritage-stat-header">
            <span className="heritage-stat-icon-wrapper">
              <MapPin size={15} />
            </span>
            <span className="heritage-stat-title">{t('stats.artifactsTitle', 'Hiện Vật & Điểm Tham Quan')}</span>
          </div>
          <div className="heritage-stat-body">
            <div className="heritage-stat-metric">
              <span className="heritage-stat-number">{totalHotspots}</span>
              <span className="heritage-stat-unit">{t('stats.artifactsUnit', 'điểm thông tin')}</span>
            </div>
            <div className="heritage-stat-sub">
              <span>{t('stats.artifactsSub', 'Gắn thông tin hiện vật & chỉ dẫn tham quan 360°')}</span>
            </div>
          </div>
        </div>

        {/* Mục 3: Thuyết minh Giọng đọc */}
        <div className="heritage-stat-col">
          <div className="heritage-stat-header">
            <span className="heritage-stat-icon-wrapper">
              <BookOpen size={15} />
            </span>
            <span className="heritage-stat-title">{t('stats.narrationTitle', 'Thuyết Minh Tự Động')}</span>
          </div>
          <div className="heritage-stat-body">
            <div className="heritage-stat-metric">
              <span className="heritage-stat-number">{aiRoomsCount}</span>
              <span className="heritage-stat-denom">/{rooms.length}</span>
              <span className="heritage-stat-unit">{t('stats.narrationUnit', 'phòng có giọng đọc')}</span>
            </div>
            <div className="heritage-stat-sub">
              <span>{t('stats.narrationSub', 'Giới thiệu hiện vật & âm thanh thuyết minh')}</span>
            </div>
          </div>
        </div>

        {/* Mục 4: Khách tham quan quét mã QR */}
        <div className="heritage-stat-col" style={{ borderRight: 'none' }}>
          <div className="heritage-stat-header">
            <span className="heritage-stat-icon-wrapper">
              <QrCode size={15} />
            </span>
            <span className="heritage-stat-title">{t('stats.scansTitle', 'Lượt Quét Mã QR')}</span>
          </div>
          <div className="heritage-stat-body">
            <div className="heritage-stat-metric">
              <span className="heritage-stat-number">{totalQrScans.toLocaleString('vi-VN')}</span>
              <span className="heritage-stat-unit">{t('stats.scansUnit', 'lượt quét')}</span>
            </div>
            <div className="heritage-stat-sub">
              <span>{t('stats.scansSub', 'Khách tham quan quét mã tại bảo tàng')}</span>
            </div>
          </div>
        </div>
      </div>


      {/* Main Panel */}
      <div className="panel">
        {/* Navigation Sub-Tabs & Global Actions */}
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
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setActiveSubTab('rooms')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid ' + (activeSubTab === 'rooms' ? 'var(--border-color)' : 'transparent'),
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                background: activeSubTab === 'rooms' ? 'var(--bg-surface)' : 'transparent',
                color: activeSubTab === 'rooms' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeSubTab === 'rooms' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <Compass size={15} />
              <span>{t('rooms.tabRooms', 'Danh Sách Phòng Trưng Bày')} ({rooms.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('gallery')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid ' + (activeSubTab === 'gallery' ? 'var(--border-color)' : 'transparent'),
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                background: activeSubTab === 'gallery' ? 'var(--bg-surface)' : 'transparent',
                color: activeSubTab === 'gallery' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeSubTab === 'gallery' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <Globe size={15} />
              <span>{t('rooms.tabStorage', 'Kho Ảnh Toàn Cảnh 360°')} ({panoramas.length})</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {activeSubTab === 'rooms' && (
              <>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    if (rooms.length > 0) {
                      handleOpenQrModal(rooms[0]);
                    } else {
                      showToast('Chưa có phòng trưng bày nào để xuất mã QR', 'info');
                    }
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <QrCode size={14} />
                  <span>{t('rooms.exportStandee', 'Tải mã QR trưng bày')}</span>
                </button>

                <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: 2 }}>
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
              </>
            )}

            {activeSubTab === 'gallery' && (
              <>
                {selectedFilenames.length > 0 && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 size={14} />
                    <span>Xóa {selectedFilenames.length} ảnh đã chọn</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowTopicModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  title="Quản lý danh sách chuyên đề / thời kỳ trưng bày"
                >
                  <Layers size={14} style={{ color: 'var(--accent-gold)' }} />
                  <span>Quản lý chuyên đề</span>
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={fetchPanoramas}
                  disabled={loadingPanos}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <RotateCw size={14} className={loadingPanos ? 'spin' : ''} />
                  <span>{t('common.refresh', 'Làm mới')}</span>
                </button>
              </>
            )}


            {rooms.length > 0 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleClearAllRooms}
                disabled={isClearingAll}
                style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                title="Xóa toàn bộ các gian phòng hiện tại để làm mới hoàn toàn"
              >
                <Trash2 size={14} />
                <span>{isClearingAll ? 'Đang xóa...' : 'Xóa tất cả'}</span>
              </button>
            )}

            {onNavigateTab && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigateTab('poc_stitching')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, borderColor: '#D4A86A', color: '#D4A86A' }}
                title="Tải 16-24 ảnh chụp quanh phòng để server tự ghép thành không gian 360°"
              >
                <Camera size={15} />
                <span>Ghép ảnh 360° từ tập ảnh</span>
              </button>
            )}

            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setSelectedPanoForNewRoom(undefined);
                setShowNewModal(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={15} />
              <span>{t('rooms.addRoom', 'Thêm gian phòng mới')}</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar: Search + Category + Status */}
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
          {/* Ô tìm kiếm */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 'min(100%, 180px)' }}>
            <input
              type="text"
              placeholder={activeSubTab === 'rooms' ? t('rooms.searchPlaceholder', "Tìm theo tên phòng, mã P-01, P-05...") : t('rooms.searchPlaceholderPano', "Tìm tên file ảnh toàn cảnh 360°...")}
              className="form-control"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          {activeSubTab === 'rooms' && (
            <>
              {/* Lọc chuyên đề thực tế từ DB */}
              <div style={{ flex: '0 1 200px', minWidth: 'min(100%, 150px)' }}>
                <select
                  className="form-control"
                  style={{ fontSize: '13px', width: '100%' }}
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setRoomPage(1);
                  }}
                >
                  <option value="all">{t('rooms.allThemes', 'Tất cả chuyên đề trưng bày')} ({rooms.length})</option>
                  {availablePeriods.map((p) => {
                    const count = rooms.filter((r) => r.period?.trim() === p).length;
                    return (
                      <option key={p} value={p}>
                        {p} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Lọc trạng thái */}
              <div style={{ flex: '0 1 160px', minWidth: 'min(100%, 130px)' }}>
                <select
                  className="form-control"
                  style={{ fontSize: '13px', width: '100%' }}
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setRoomPage(1);
                  }}
                >
                  <option value="all">{t('rooms.allStatuses', 'Tất cả trạng thái')}</option>
                  <option value="active">{t('rooms.statusActive', 'Đang hoạt động')}</option>
                  <option value="ai_enabled">{t('rooms.statusAiEnabled', 'Đã bật AI Voice')}</option>
                  <option value="no_ai">{t('rooms.statusNoAi', 'Chưa cấu hình AI')}</option>
                </select>
              </div>

              {/* Chuyển đổi chế độ xem: Lưới thẻ / Danh sách bảng */}
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-subtle)', padding: 3, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('grid');
                    setRoomPageSize(6);
                    setRoomPage(1);
                  }}
                  style={{
                    padding: '5px 9px',
                    borderRadius: 4,
                    border: 'none',
                    background: viewMode === 'grid' ? 'var(--accent-gold)' : 'transparent',
                    color: viewMode === 'grid' ? '#160F0C' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '12px',
                    fontWeight: viewMode === 'grid' ? 600 : 500,
                    transition: 'all 0.15s ease'
                  }}
                  title="Chế độ xem Lưới Thẻ (3 cột, 6-9-12 thẻ/trang)"
                >
                  <LayoutGrid size={13} />
                  <span>{t('rooms.viewGrid', 'Lưới')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('table');
                    setRoomPageSize(5);
                    setRoomPage(1);
                  }}
                  style={{
                    padding: '5px 9px',
                    borderRadius: 4,
                    border: 'none',
                    background: viewMode === 'table' ? 'var(--accent-gold)' : 'transparent',
                    color: viewMode === 'table' ? '#160F0C' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '12px',
                    fontWeight: viewMode === 'table' ? 600 : 500,
                    transition: 'all 0.15s ease'
                  }}
                  title="Chế độ xem Danh Sách Bảng (1 hàng, 5-10-20 mục/trang)"
                >
                  <List size={13} />
                  <span>{t('rooms.viewTable', 'Bảng')}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* TAB 1: GIAN PHÒNG TOUR 360 (GRID HOẶC TABLE) */}
        {activeSubTab === 'rooms' && (
          <>
            {viewMode === 'grid' ? (
              /* Dạng Grid Card trực quan */
              <div className="rooms-grid">
                {paginatedRooms.map((room) => (
                  <div key={room.id} className="room-card">
                    <div className="room-thumbnail-wrapper">
                      <img src={room.thumbnailUrl} alt={room.name} className="room-thumbnail" />
                      <div className="room-badge-code">{room.code}</div>
                      <div className="room-badge-hotspots">
                        <MapPin size={11} />
                        <span>{room.hotspots?.length || 0} {t('rooms.anchorPoints', 'điểm thông tin')}</span>
                      </div>
                    </div>

                    <div className="room-info">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.4px', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {localize(room, 'period', room.period) || 'Hiện vật Lịch sử'}
                        </span>
                        {room.aiVoiceEnabled || room.aiKnowledgePrompt ? (
                          <span style={{ fontSize: '10.5px', color: 'var(--accent-gold)', background: 'rgba(212, 168, 106, 0.12)', border: '1px solid rgba(212, 168, 106, 0.28)', padding: '2px 7px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                            <Volume2 size={10} />
                            <span>{t('rooms.aiEnabled', 'Đã có thuyết minh')}</span>
                          </span>
                        ) : (
                          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '2px 7px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {t('rooms.notConfigured', 'Chưa cấu hình')}
                          </span>
                        )}
                      </div>

                      <div className="room-name" title={room.name}>{localize(room, 'name', room.name)}</div>
                      <div className="room-desc" title={room.description}>{localize(room, 'description', room.description) || 'Chưa có thông tin mô tả chi tiết cho phòng này.'}</div>

                      {/* Thông số thực tế từ DB */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', padding: '6px 0', borderTop: '1px dashed var(--border-color)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <QrCode size={11} style={{ color: 'var(--accent-gold)' }} />
                          <span>{(room.qrScanCount || 0).toLocaleString('vi-VN')} {t('rooms.scans', 'lượt quét')}</span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Layers size={11} />
                          <span>{room.scenesCount || 1} {t('rooms.angle360', 'góc 360°')}</span>
                        </span>
                      </div>

                      {/* Action buttons chuẩn mực, responsive đa tầng */}
                      <div className="room-card-actions-wrapper">
                        {/* Hàng 1: Hai nút chức năng chính */}
                        <div className="room-card-actions-row">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm room-card-btn-action"
                            onClick={() => onOpenStudio(room)}
                            title={t('rooms.explore360', 'Mở trình chỉnh sửa ảnh và điểm tương tác 360°')}
                          >
                            <Compass size={13} style={{ flexShrink: 0 }} />
                            <span className="room-card-btn-label">{t('rooms.explore360', 'Biên tập 360')}</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm room-card-btn-action"
                            onClick={() => handleOpenAiDrawer(room)}
                            title={t('rooms.narration', 'Thuyết minh & Trợ lý ảo cho phòng')}
                          >
                            <Volume2 size={13} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                            <span className="room-card-btn-label">{t('rooms.narration', 'Thuyết minh')}</span>
                          </button>
                        </div>

                        {/* Hàng 2: Nút công cụ phụ */}
                        <div className="room-card-actions-row">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm room-card-btn-action"
                            title="Tải mã QR phòng này"
                            onClick={() => handleOpenQrModal(room)}
                          >
                            <QrCode size={12} style={{ flexShrink: 0 }} />
                            <span className="room-card-btn-label">{t('rooms.qrCode', 'Mã QR')}</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm room-card-btn-action-tool"
                            title="Chỉnh sửa thông tin phòng"
                            onClick={() => setEditingRoom(room)}
                          >
                            <Edit3 size={12} style={{ flexShrink: 0 }} />
                            <span className="room-card-btn-label">{t('rooms.edit', 'Sửa')}</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm room-card-btn-action-tool room-card-btn-delete"
                            title="Xóa phòng trưng bày"
                            onClick={() => {
                              triggerConfirm(
                                'Xóa phòng trưng bày',
                                `Bạn có chắc chắn muốn xóa phòng trưng bày "${room.name}"? Dữ liệu các điểm thông tin và ảnh 360 liên kết cũng sẽ bị xóa.`,
                                () => onDeleteRoom(room.id)
                              );
                            }}
                          >
                            <Trash2 size={12} style={{ flexShrink: 0 }} />
                            <span className="room-card-btn-label">{t('rooms.delete', 'Xóa')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredRooms.length === 0 && (
                  <div className="empty-state-card" style={{ gridColumn: '1 / -1' }}>
                    <div className="empty-state-icon">
                      <Compass size={26} />
                    </div>
                    <div className="empty-state-title">
                      {searchQuery ? 'Không tìm thấy phòng trưng bày phù hợp' : 'Chưa có phòng trưng bày nào'}
                    </div>
                    <div className="empty-state-desc">
                      {searchQuery
                        ? `Không tìm thấy phòng trưng bày nào khớp với từ khóa "${searchQuery}". Vui lòng thử lại với tên hoặc mã phòng khác.`
                        : 'Hãy thêm phòng trưng bày đầu tiên để bắt đầu xây dựng không gian tham quan 360° cho bảo tàng.'}
                    </div>
                    {!searchQuery && (
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setSelectedPanoForNewRoom(undefined);
                            setShowNewModal(true);
                          }}
                        >
                          <Plus size={14} />
                          <span>Thêm phòng trưng bày mới</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Dạng Table chuyên nghiệp */
              <div className="rooms-table-container">
                <table className="rooms-table">
                  <thead>
                    <tr>
                      <th>{t('rooms.thRoom', 'Phòng trưng bày')}</th>
                      <th>{t('rooms.thCode', 'Mã số')}</th>
                      <th>{t('rooms.thTopic', 'Chuyên đề')}</th>
                      <th>{t('rooms.thHotspots', 'Điểm thông tin')}</th>
                      <th>{t('rooms.thNarration', 'Thuyết minh')}</th>
                      <th>{t('rooms.thScans', 'Lượt quét QR')}</th>
                      <th style={{ textAlign: 'right' }}>{t('rooms.thActions', 'Thao tác')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRooms.map((room) => (
                      <tr key={room.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img
                              src={room.thumbnailUrl}
                              alt={room.name}
                              style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--border-color)' }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--heading-color)', fontSize: '13.5px' }}>
                                {localize(room, 'name', room.name)}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {localize(room, 'description', room.description)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: 4, fontSize: '12px' }}>
                            {room.code}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                            {localize(room, 'period', room.period)}
                          </span>
                        </td>
                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '12.5px', fontWeight: 600 }}>
                            <MapPin size={13} style={{ color: 'var(--accent-gold)' }} />
                            <span>{room.hotspots?.length || 0}</span>
                          </span>
                        </td>
                        <td>
                          {room.aiVoiceEnabled || room.aiKnowledgePrompt ? (
                            <span style={{ fontSize: '11.5px', color: 'var(--accent-gold)', background: 'rgba(212, 168, 106, 0.1)', border: '1px solid rgba(212, 168, 106, 0.25)', padding: '3px 8px', borderRadius: 4, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={12} />
                              <span>{t('rooms.aiEnabled', 'Đã có thuyết minh')}</span>
                            </span>
                          ) : (
                            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '3px 8px', borderRadius: 4 }}>
                              {t('rooms.notConfigured', 'Chưa cấu hình')}
                            </span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                            {(room.qrScanCount || 0).toLocaleString('vi-VN')}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => onOpenStudio(room)}
                              title={t('rooms.explore360', 'Biên tập 360')}
                              style={{ padding: '5px 10px' }}
                            >
                              <Compass size={13} />
                              <span>{t('rooms.explore360', 'Biên tập')}</span>
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenAiDrawer(room)}
                              title="Thuyết minh & Trợ lý ảo cho phòng"
                              style={{ padding: '5px 8px' }}
                            >
                              <Volume2 size={13} style={{ color: 'var(--accent-gold)' }} />
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenQrModal(room)}
                              title="Tải mã QR phòng"
                              style={{ padding: '5px 8px' }}
                            >
                              <QrCode size={13} />
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setEditingRoom(room)}
                              title="Chỉnh sửa thông tin phòng"
                              style={{ padding: '5px 8px' }}
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                triggerConfirm(
                                  'Xóa phòng trưng bày',
                                  `Bạn có chắc chắn muốn xóa phòng trưng bày "${room.name}"?`,
                                  () => onDeleteRoom(room.id)
                                );
                              }}
                              title="Xóa phòng"
                              style={{ padding: '5px 8px', color: 'var(--error)' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredRooms.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
                          Không có gian phòng nào phù hợp với điều kiện tìm kiếm.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <Pagination
              currentPage={roomPage}
              totalItems={filteredRooms.length}
              pageSize={roomPageSize}
              onPageChange={setRoomPage}
              onPageSizeChange={(newSize) => {
                setRoomPageSize(newSize);
                setRoomPage(1);
              }}
              pageSizeOptions={[6, 9, 12, 18, 24]}
              itemLabel={t('rooms.unit')}
            />
          </>
        )}

        {/* TAB 2: KHO KHÔNG GIAN 360° ĐÃ TẠO */}
        {activeSubTab === 'gallery' && (
          <div style={{ padding: '20px' }}>
            {loadingPanos && panoramas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <RotateCw size={28} className="spin" style={{ margin: '0 auto 10px', color: 'var(--primary)' }} />
                <div>Đang tải kho ảnh toàn cảnh 360° từ hệ thống...</div>
              </div>
            ) : filteredPanos.length === 0 ? (
              <div className="empty-state-card">
                <div className="empty-state-icon">
                  <FolderOpen size={28} />
                </div>
                <div className="empty-state-title">
                  {searchQuery ? 'Không tìm thấy ảnh 360° phù hợp' : 'Chưa có ảnh 360° nào trong kho lưu trữ'}
                </div>
                <div className="empty-state-desc">
                  {searchQuery
                    ? `Không tìm thấy ảnh 360° nào khớp với từ khóa "${searchQuery}". Vui lòng thử tìm kiếm với tên file khác.`
                    : 'Hãy sử dụng tính năng "Tạo ảnh toàn cảnh 360°" ở thanh điều hướng bên trái để chụp hoặc ghép ảnh đầu tiên.'}
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '20px'
                }}
              >
                {paginatedPanos.map((item, idx) => (
                  <div
                    key={item.filename || idx}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      background: 'var(--bg-surface)',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '160px',
                        background: '#1A110B',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                      onClick={() => setPreviewPanoUrl({ url: item.url, title: item.filename })}
                      title="Bấm để xoay xem toàn cảnh 360°"
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 3,
                          background: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: 4,
                          padding: '3px 5px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFilenames.includes(item.filename)}
                          onChange={() => handleToggleSelect(item.filename)}
                          style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--primary)' }}
                          title="Chọn ảnh này để dọn dẹp hàng loạt"
                        />
                      </div>

                      <img
                        src={item.url}
                        alt={item.filename}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          opacity: 0.9,
                          transition: 'transform 0.3s ease'
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          background: 'rgba(26, 17, 11, 0.75)',
                          color: '#FFFFFF',
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontSize: '11px',
                          fontWeight: 700,
                          backdropFilter: 'blur(4px)'
                        }}
                      >
                        4K Equirectangular
                      </div>

                      <div
                        style={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          background: 'var(--primary)',
                          color: '#FFFFFF',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: '11.5px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5
                        }}
                      >
                        <Eye size={13} />
                        <span>{t('stitching.rotateView', 'Xoay xem 360°')}</span>
                      </div>
                    </div>

                    <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          wordBreak: 'break-all',
                          lineHeight: 1.4
                        }}
                      >
                        {item.filename}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '11.5px',
                          color: 'var(--text-muted)'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} />
                          <span>{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                        </span>
                        <span>{(item.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>

                      <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 6 }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleCreateRoomFromPano(item.url)}
                          style={{
                            flex: 1,
                            justifyContent: 'center',
                            fontSize: '12px',
                            padding: '7px 8px',
                            fontWeight: 700,
                            gap: 5
                          }}
                        >
                          <Plus size={14} />
                          <span>{t('rooms.createRoomBtn', 'Tạo Phòng')}</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleCopyLink(item.url)}
                          title={t('common.copyLink', 'Sao chép đường dẫn ảnh 360')}
                        >
                          {copiedUrl === item.url ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDeletePano(item.filename, item.usedInRooms)}
                          title={item.usedInRooms?.length ? `Đang sử dụng trong gian phòng "${item.usedInRooms.join(', ')}"` : "Xóa vĩnh viễn"}
                          style={{ color: 'var(--error)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {item.usedInRooms && item.usedInRooms.length > 0 && (
                        <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 500, marginTop: 4 }}>
                          Đang sử dụng trong: {item.usedInRooms.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Pagination
              currentPage={panoPage}
              totalItems={filteredPanos.length}
              pageSize={panoPageSize}
              onPageChange={setPanoPage}
              onPageSizeChange={(newSize) => {
                setPanoPageSize(newSize);
                setPanoPage(1);
              }}
              pageSizeOptions={[6, 9, 12, 18, 24]}
              itemLabel={t('rooms.angle360')}
            />
          </div>
        )}
      </div>

      {/* MODAL CẤU HÌNH THUYẾT MINH & TRỢ LÝ ẢO DI SẢN */}
      {aiDrawerRoom && (
        <div
          className="modal-backdrop"
        >
          <div
            className="modal-card"
            style={{ maxWidth: 640, width: 'min(640px, 94vw)', maxHeight: 'min(90vh, 760px)', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: 'rgba(212, 168, 106, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-gold)'
                }}>
                  <Volume2 size={18} />
                </div>
                <div>
                  <h2 className="modal-title" style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--heading-color)' }}>
                    Thuyết minh & Trợ lý ảo: {aiDrawerRoom.name}
                  </h2>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
                    Mã phòng: <strong style={{ color: 'var(--heading-color)' }}>{aiDrawerRoom.code}</strong> • {aiDrawerRoom.period}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseAiDrawer}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            {/* Thanh chuyển đổi ngôn ngữ đa quốc gia */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                background: 'var(--bg-subtle)',
                borderBottom: '1px solid var(--border-color)',
                overflowX: 'auto'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginRight: 6, flexShrink: 0 }}>
                <Globe size={14} />
                <span>Ngôn ngữ:</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', overflowX: 'auto' }}>
                {languages.map((lang) => {
                  const isSelected = selectedVoiceLang === lang.code;
                  const langTrans = workingTranslations[lang.code] || aiDrawerRoom.translations?.[lang.code];
                  const hasData = lang.code === 'vi'
                    ? !!(aiDrawerRoom.aiScript || aiDrawerRoom.aiKnowledgePrompt || langTrans?.narrationScript)
                    : !!(langTrans?.narrationScript || langTrans?.aiKnowledgePrompt || langTrans?.audioUrl);

                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSwitchDrawerLanguage(lang.code)}
                      style={{
                        padding: '6px 12px',
                        background: isSelected ? 'var(--bg-surface)' : 'transparent',
                        border: '1px solid ' + (isSelected ? 'var(--accent-gold)' : 'var(--border-color)'),
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '12px',
                        color: isSelected ? 'var(--accent-gold)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.2)' : 'none'
                      }}
                    >
                      <span>{lang.flagIcon || '🌐'}</span>
                      <span>{lang.nativeName || lang.name}</span>
                      {hasData && (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: '#10B981',
                            display: 'inline-block'
                          }}
                          title="Đã có dữ liệu thuyết minh"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-Tabs dạng thanh chuyển đổi di sản */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-subtle)' }}>
              <button
                type="button"
                onClick={() => setDrawerActiveTab('rag')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: drawerActiveTab === 'rag' ? 'var(--bg-surface)' : 'transparent',
                  border: 'none',
                  borderBottom: drawerActiveTab === 'rag' ? '2px solid var(--accent-gold)' : '2px solid transparent',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: drawerActiveTab === 'rag' ? 'var(--accent-gold)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.15s ease'
                }}
              >
                <BookOpen size={15} />
                <span>Tư liệu lịch sử (Trợ lý ảo)</span>
              </button>

              <button
                type="button"
                onClick={() => setDrawerActiveTab('tts')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: drawerActiveTab === 'tts' ? 'var(--bg-surface)' : 'transparent',
                  border: 'none',
                  borderBottom: drawerActiveTab === 'tts' ? '2px solid var(--accent-gold)' : '2px solid transparent',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: drawerActiveTab === 'tts' ? 'var(--accent-gold)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.15s ease'
                }}
              >
                <Mic size={15} />
                <span>Thuyết minh âm thanh</span>
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: 'calc(80vh - 140px)', overflowY: 'auto', padding: '20px' }}>
              {drawerActiveTab === 'rag' ? (
                /* TAB 1: TƯ LIỆU HỎI ĐÁP LỊCH SỬ */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12.5px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.55
                  }}>
                    <div style={{ fontWeight: 600, color: 'var(--heading-color)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Info size={14} style={{ color: 'var(--accent-gold)' }} />
                      <span>Tư liệu bối cảnh phục vụ giải đáp du khách ({languages.find(l => l.code === selectedVoiceLang)?.nativeName || selectedVoiceLang.toUpperCase()}):</span>
                    </div>
                    Hệ thống sẽ dựa vào nội dung tư liệu này để trả lời chính xác các câu hỏi của khách tham quan khi quét mã QR hoặc trò chuyện với trợ lý ảo tại gian phòng theo đúng ngôn ngữ đã chọn.
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label className="form-label" style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>
                        Nội dung tóm tắt lịch sử gian phòng ({languages.find(l => l.code === selectedVoiceLang)?.nativeName || selectedVoiceLang.toUpperCase()})
                      </label>
                      {selectedVoiceLang === 'vi' ? (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={handleLoadPresetKnowledge}
                          style={{ fontSize: '11.5px', padding: '3px 8px' }}
                        >
                          <BookOpen size={12} />
                          <span>Gợi ý mẫu</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={handleAutoTranslateCurrentLang}
                          disabled={isTranslatingAi}
                          style={{ fontSize: '11.5px', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                          {isTranslatingAi ? <RotateCw size={12} className="spin" /> : <Globe size={12} />}
                          <span>{isTranslatingAi ? 'Đang dịch...' : 'Dịch từ Tiếng Việt'}</span>
                        </button>
                      )}
                    </div>

                    <textarea
                      rows={7}
                      className="form-control"
                      style={{ width: '100%', fontSize: '13px', lineHeight: 1.6, resize: 'vertical' }}
                      value={aiKnowledgePrompt}
                      onChange={(e) => setAiKnowledgePrompt(e.target.value)}
                      placeholder={`Nhập tóm tắt bối cảnh lịch sử, niên đại, các hiện vật tiêu biểu và câu chuyện nổi bật của gian phòng bằng ${languages.find(l => l.code === selectedVoiceLang)?.nativeName || selectedVoiceLang.toUpperCase()}...`}
                    />
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
                      {aiKnowledgePrompt.length} ký tự
                    </div>
                  </div>
                </div>
              ) : (
                /* TAB 2: THUYẾT MINH ÂM THANH */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', marginBottom: 6 }}>
                      Chọn giọng đọc ({languages.find(l => l.code === selectedVoiceLang)?.nativeName || selectedVoiceLang.toUpperCase()})
                    </label>
                    <select
                      className="form-control"
                      value={aiVoiceLang}
                      onChange={(e) => setAiVoiceLang(e.target.value)}
                      style={{ fontSize: '13px' }}
                    >
                      {selectedVoiceLang === 'vi' ? (
                        <>
                          <option value="vi-south">Nữ Miền Nam (Giọng truyền cảm - Phù hợp Bảo tàng TP.HCM)</option>
                          <option value="vi-north">Nam Miền Bắc (Trang trọng, chuẩn mực)</option>
                        </>
                      ) : selectedVoiceLang === 'en' ? (
                        <>
                          <option value="en-us">English - US (Standard International Voice)</option>
                          <option value="en-gb">English - UK (Academic Heritage Voice)</option>
                        </>
                      ) : selectedVoiceLang === 'fr' ? (
                        <>
                          <option value="fr-fr">Français (Standard Voice - Chuẩn Pháp)</option>
                        </>
                      ) : selectedVoiceLang === 'zh' ? (
                        <>
                          <option value="zh-cn">中文普通话 (Standard Mandarin Voice)</option>
                        </>
                      ) : selectedVoiceLang === 'ja' ? (
                        <>
                          <option value="ja-jp">日本語 (Standard Japanese Voice)</option>
                        </>
                      ) : (
                        <option value={selectedVoiceLang}>Giọng bản ngữ ({selectedVoiceLang.toUpperCase()})</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                      <label className="form-label" style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>
                        Lời đọc thuyết minh ({languages.find(l => l.code === selectedVoiceLang)?.nativeName || selectedVoiceLang.toUpperCase()})
                      </label>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {selectedVoiceLang === 'vi' ? (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={handleLoadPresetKnowledge}
                            style={{ fontSize: '11.5px', padding: '3px 8px' }}
                          >
                            <BookOpen size={12} />
                            <span>Gợi ý mẫu</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={handleAutoTranslateCurrentLang}
                            disabled={isTranslatingAi}
                            style={{ fontSize: '11.5px', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 5 }}
                            title="Tự động dịch nội dung từ ngôn ngữ đã có sang ngôn ngữ này"
                          >
                            {isTranslatingAi ? <RotateCw size={12} className="spin" /> : <Globe size={12} />}
                            <span>{isTranslatingAi ? 'Đang dịch...' : 'Dịch tự động'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Banner gợi ý dịch tự động nếu ngôn ngữ hiện tại chưa có nội dung */}
                    {selectedVoiceLang !== 'vi' && !aiScript.trim() && (
                      <div style={{
                        background: 'rgba(212, 168, 106, 0.08)',
                        border: '1px dashed rgba(212, 168, 106, 0.4)',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        marginBottom: 10
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <Globe size={15} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                          <span style={{ fontSize: '12px', color: 'var(--text-main)' }}>
                            Chưa có nội dung ({languages.find(l => l.code === selectedVoiceLang)?.nativeName || selectedVoiceLang.toUpperCase()}). Bạn có thể bấm nút bên để tự động dịch:
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={handleAutoTranslateCurrentLang}
                          disabled={isTranslatingAi}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: '#D4A86A',
                            borderColor: 'rgba(212, 168, 106, 0.5)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {isTranslatingAi ? <RotateCw size={12} className="spin" /> : <Globe size={12} />}
                          <span>{isTranslatingAi ? 'Đang dịch...' : 'Dịch tự động'}</span>
                        </button>
                      </div>
                    )}

                    <textarea
                      rows={5}
                      className="form-control"
                      style={{ width: '100%', fontSize: '13px', lineHeight: 1.6, resize: 'vertical' }}
                      value={aiScript}
                      onChange={(e) => setAiScript(e.target.value)}
                      placeholder={`Nhập nội dung thuyết minh phát tự động khi khách tham quan gian phòng (${languages.find(l => l.code === selectedVoiceLang)?.nativeName || selectedVoiceLang.toUpperCase()})...`}
                    />
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
                      {aiScript.length} ký tự
                    </div>
                  </div>

                  {/* Audio Player nghe thử */}
                  {(() => {
                    const viAudio = ((aiDrawerRoom as any).audioUrl || '').trim();
                    const currentLangAudio = selectedVoiceLang === 'vi'
                      ? (previewAudioUrl || workingTranslations.vi?.audioUrl || aiDrawerRoom.translations?.vi?.audioUrl || (aiDrawerRoom as any).audioUrl || '')
                      : (previewAudioUrl || workingTranslations[selectedVoiceLang]?.audioUrl || (aiDrawerRoom.translations?.[selectedVoiceLang]?.audioUrl !== viAudio ? aiDrawerRoom.translations?.[selectedVoiceLang]?.audioUrl : '') || '');

                    // TUYỆT ĐỐI KHÔNG HIỂN THỊ NẾU CHƯA CÓ VĂN BẢN HOẶC CHƯA CÓ FILE ÂM THANH CỦA ĐÚNG NGÔN NGỮ NÀY
                    if (!aiScript.trim() || !currentLangAudio) return null;

                    return (
                      <div style={{
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8
                      }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Volume2 size={14} style={{ color: 'var(--accent-gold)' }} />
                            <span>File âm thanh ({languages.find(l => l.code === selectedVoiceLang)?.nativeName || selectedVoiceLang.toUpperCase()}):</span>
                          </div>
                          <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 500 }}>
                            ✓ Sẵn sàng phát khi tham quan
                          </span>
                        </div>
                        <audio
                          controls
                          key={currentLangAudio}
                          style={{ width: '100%', height: 36 }}
                        >
                          <source src={currentLangAudio} />
                          Trình duyệt không hỗ trợ thẻ audio.
                        </audio>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', background: 'var(--bg-card-header)', flexWrap: 'wrap', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseAiDrawer}
              >
                <span>Đóng</span>
              </button>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                {drawerActiveTab === 'tts' && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleGenerateTtsAudio}
                    disabled={isGeneratingTts}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    title={`Tạo giọng đọc ${languages.find(l => l.code === selectedVoiceLang)?.nativeName || selectedVoiceLang.toUpperCase()}`}
                  >
                    {isGeneratingTts ? <RotateCw size={14} className="spin" /> : <Play size={14} />}
                    <span>{isGeneratingTts ? 'Đang tạo...' : 'Tạo giọng đọc & Nghe thử'}</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveAiData}
                  disabled={isSavingAi}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {isSavingAi ? <RotateCw size={14} className="spin" /> : <Check size={14} />}
                  <span>Lưu ({languages.find(l => l.code === selectedVoiceLang)?.nativeName || selectedVoiceLang.toUpperCase()})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XUẤT QR STANDEE BẢO TÀNG THỰC ĐỊA */}
      {showQrModal && selectedQrRoom && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowQrModal(false);
          }}
        >
          <div
            className="modal-card"
            style={{ maxWidth: 500, width: 'min(500px, 94vw)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <QrCode size={18} style={{ color: 'var(--primary)' }} />
                <h2 className="modal-title">
                  {t('rooms.qrModalTitle', 'Mã QR Tham Quan')}: {localize(selectedQrRoom, 'name', selectedQrRoom.name)}
                </h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowQrModal(false)}
                aria-label={t('common.close', 'Đóng')}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              {/* Standee Print Preview Card */}
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
                  {currentLang === 'vi' ? (branding.museumName?.toUpperCase() || 'BẢO TÀNG LỊCH SỬ THÀNH PHỐ HỒ CHÍ MINH') : t('nav.museumTitle', 'Museum of History in Ho Chi Minh City').toUpperCase()}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1A110B', marginBottom: 4, lineHeight: 1.3 }}>
                  {localize(selectedQrRoom, 'name', selectedQrRoom.name)}
                </div>
                <div style={{ fontSize: '12px', color: '#6B584C', marginBottom: 16 }}>
                  {t('rooms.roomCode', 'Mã phòng')}: <strong>{selectedQrRoom.code}</strong> • {localize(selectedQrRoom, 'period', selectedQrRoom.period)}
                </div>

                <div style={{ width: 190, height: 190, margin: '0 auto 16px', padding: 8, background: '#FFFFFF', border: '2px solid #D4A86A', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`${window.location.origin}/?room=${selectedQrRoom.code || selectedQrRoom.id}`)}`}
                    alt={`QR Code ${selectedQrRoom.name}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1A110B', marginBottom: 3 }}>
                  {t('rooms.scanToExplore', 'Quét mã để tham quan không gian 360°')}
                </div>
                <div style={{ fontSize: '11.5px', color: '#8C7769', letterSpacing: '0.2px' }}>
                  {t('rooms.scanToExploreSub', 'Scan to explore 360° virtual tour')}
                </div>
              </div>

              {/* Đường dẫn trực tiếp & nút sao chép */}
              <div style={{ marginTop: 14, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)', marginRight: 5 }}>Link:</span>
                  <code style={{ color: 'var(--primary)', fontSize: '11.5px' }}>{`${window.location.origin}/?room=${selectedQrRoom.code || selectedQrRoom.id}`}</code>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={() => {
                    const link = `${window.location.origin}/?room=${selectedQrRoom.code || selectedQrRoom.id}`;
                    navigator.clipboard.writeText(link);
                    showToast(t('rooms.copiedLink', 'Đã sao chép liên kết tham quan'), 'success');
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, padding: '4px 8px' }}
                  title={t('common.copy', 'Sao chép')}
                >
                  <Copy size={12} />
                  <span>{t('common.copy', 'Sao chép')}</span>
                </button>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    window.print();
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Printer size={14} />
                  <span>{t('rooms.printStandee', 'In Standee')}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowQrModal(false);
                    onOpenStudio(selectedQrRoom);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  title={t('rooms.enter360', 'Vào phòng 360°')}
                >
                  <ExternalLink size={14} />
                  <span>{t('rooms.enter360', 'Vào phòng 360°')}</span>
                </button>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowQrModal(false)}
              >
                <span>{t('common.close', 'Đóng')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal tạo phòng mới */}
      {showNewModal && (
        <NewRoomModal
          onClose={() => setShowNewModal(false)}
          onCreated={(newRoom) => {
            onRoomCreated(newRoom);
            setShowNewModal(false);
          }}
          initialPanoramaUrl={selectedPanoForNewRoom}
          panoramas={panoramas}
        />
      )}

      {/* Modal chỉnh sửa phòng */}
      {editingRoom && (
        <EditRoomModal
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onUpdated={(updated) => {
            if (onRoomUpdated) {
              onRoomUpdated(updated);
            }
            setEditingRoom(null);
          }}
        />
      )}

      {/* Modal Preview 360° */}
      {previewPanoUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setPreviewPanoUrl(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 960,
              height: '80vh',
              background: '#0F172A',
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '14px 20px',
                background: '#1E293B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #334155'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '14px', fontWeight: 600 }}>
                <Eye size={16} style={{ color: '#38BDF8' }} />
                <span>Xem trước không gian 360°: {previewPanoUrl.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPanoUrl(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
              <Pannellum360Viewer
                panoramaUrl={previewPanoUrl.url}
                title={previewPanoUrl.title}
                hotspots={[]}
                initialPitch={0}
                initialYaw={0}
                initialHfov={100}
              />
            </div>
          </div>
        </div>
      )}
      {/* Modal Quản lý chuyên đề trưng bày */}
      <TopicManagementModal
        isOpen={showTopicModal}
        onClose={() => setShowTopicModal(false)}
        onTopicsUpdated={(updatedTopics) => {
          setTopics(updatedTopics);
        }}
      />

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
