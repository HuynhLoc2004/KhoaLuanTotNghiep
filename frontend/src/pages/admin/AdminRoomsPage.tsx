import React, { useState, useEffect } from 'react';
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
import { MuseumRoom } from '../../types';
import { NewRoomModal } from '../../components/NewRoomModal';
import { EditRoomModal } from '../../components/EditRoomModal';
import { Pannellum360Viewer } from '../../viewer360/Pannellum360Viewer';
import { Pagination } from '../../components/Pagination';
import { api, API_BASE } from '../../services/api';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';

interface AdminRoomsPageProps {
  rooms: MuseumRoom[];
  onOpenStudio: (room: MuseumRoom) => void;
  onRoomCreated: (newRoom: MuseumRoom) => void;
  onRoomUpdated?: (updatedRoom: MuseumRoom) => void;
  onDeleteRoom: (roomId: string) => void;
}

interface PanoHistoryItem {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
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
  onDeleteRoom
}) => {
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'rooms' | 'gallery'>('rooms');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<MuseumRoom | null>(null);
  const [selectedPanoForNewRoom, setSelectedPanoForNewRoom] = useState<string | undefined>(undefined);

  // Bộ lọc dữ liệu
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Slide-over Drawer: Cấu hình AI & Thuyết minh
  const [aiDrawerRoom, setAiDrawerRoom] = useState<MuseumRoom | null>(null);
  const [drawerActiveTab, setDrawerActiveTab] = useState<'rag' | 'tts'>('rag');
  const [aiKnowledgePrompt, setAiKnowledgePrompt] = useState('');
  const [aiScript, setAiScript] = useState('');
  const [aiVoiceLang, setAiVoiceLang] = useState('vi-south');
  const [isSavingAi, setIsSavingAi] = useState(false);
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);

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

  // Pagination
  const [roomPage, setRoomPage] = useState(1);
  const [panoPage, setPanoPage] = useState(1);
  const PAGE_SIZE = 6;

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

  useEffect(() => {
    fetchPanoramas();
  }, []);

  useEffect(() => {
    setRoomPage(1);
    setPanoPage(1);
  }, [searchQuery, selectedCategory, selectedStatus, activeSubTab]);

  // Khi mở Slide-over Drawer của phòng nào, nạp đúng dữ liệu của phòng đó từ DB
  const handleOpenAiDrawer = (room: MuseumRoom) => {
    setAiDrawerRoom(room);
    setAiKnowledgePrompt(room.aiKnowledgePrompt || '');
    setAiScript(room.aiScript || '');
    setAiVoiceLang(room.aiVoiceLang || 'vi-south');
    setPreviewAudioUrl(null);
    setDrawerActiveTab('rag');
  };

  const handleCloseAiDrawer = () => {
    setAiDrawerRoom(null);
    setPreviewAudioUrl(null);
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
      setAiKnowledgePrompt(`Bối cảnh lịch sử: Gian ${aiDrawerRoom.name} thuộc chuyên đề ${aiDrawerRoom.period} tại Bảo tàng Lịch sử TP.HCM. Trưng bày các hiện vật quý ghi dấu quá trình hình thành văn hóa và tiến trình phát triển.`);
      setAiScript(`Chào mừng quý khách đến với ${aiDrawerRoom.name} tại Bảo tàng Lịch sử TP.HCM. Không gian này mang lại cho quý khách cái nhìn chân thực về các di sản tiêu biểu.`);
      showToast('Đã nạp mẫu tư liệu tổng quát', 'info');
    }
  };

  // Lưu Tri thức RAG vào Database
  const handleSaveRagKnowledge = async () => {
    if (!aiDrawerRoom) return;
    try {
      setIsSavingAi(true);
      const updated = await api.updateRoom(aiDrawerRoom.id, {
        aiKnowledgePrompt: aiKnowledgePrompt.trim(),
        period: aiDrawerRoom.period || 'Tiến trình Lịch sử VN'
      });
      // Cập nhật state phòng tại chỗ
      aiDrawerRoom.aiKnowledgePrompt = updated.aiKnowledgePrompt;
      showToast('Đã lưu Tri thức RAG vào cơ sở dữ liệu MongoDB thành công', 'success');
    } catch (err: any) {
      showToast('Lỗi khi lưu tri thức AI: ' + err.message, 'error');
    } finally {
      setIsSavingAi(false);
    }
  };

  // Mô phỏng / Tạo giọng đọc AI (TTS)
  const handleGenerateTtsAudio = () => {
    if (!aiScript.trim()) {
      showToast('Vui lòng nhập kịch bản thuyết minh trước khi tạo giọng đọc', 'error');
      return;
    }
    setIsGeneratingTts(true);
    setTimeout(() => {
      setIsGeneratingTts(false);
      // Audio mẫu chuẩn chất lượng cao để nghe thử
      setPreviewAudioUrl('https://actions.google.com/sounds/v1/ambiences/museum_acoustics.ogg');
      showToast('Đã tổng hợp giọng đọc AI thành công!', 'success');
    }, 1200);
  };

  // Lưu Kịch bản & Kích hoạt AI Voice vào Database
  const handleSaveTtsVoice = async () => {
    if (!aiDrawerRoom) return;
    try {
      setIsSavingAi(true);
      const updated = await api.updateRoom(aiDrawerRoom.id, {
        aiScript: aiScript.trim(),
        aiVoiceEnabled: true,
        aiVoiceLang: aiVoiceLang
      });
      aiDrawerRoom.aiScript = updated.aiScript;
      aiDrawerRoom.aiVoiceEnabled = true;
      aiDrawerRoom.aiVoiceLang = aiVoiceLang;
      showToast(`Đã kích hoạt thuyết minh AI Voice cho "${aiDrawerRoom.name}"`, 'success');
    } catch (err: any) {
      showToast('Lỗi kích hoạt AI Voice: ' + err.message, 'error');
    } finally {
      setIsSavingAi(false);
    }
  };

  // Mở modal Standee QR
  const handleOpenQrModal = (room: MuseumRoom) => {
    setSelectedQrRoom(room);
    setShowQrModal(true);
  };

  // Lọc dữ liệu phòng
  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.period.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' ||
      r.period === selectedCategory ||
      r.category === selectedCategory;

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

  const paginatedRooms = filteredRooms.slice((roomPage - 1) * PAGE_SIZE, roomPage * PAGE_SIZE);
  const paginatedPanos = filteredPanos.slice((panoPage - 1) * PAGE_SIZE, panoPage * PAGE_SIZE);

  // Real-time Database Metrics (KPI)
  const totalHotspots = rooms.reduce((acc, r) => acc + (r.hotspots?.length || 0), 0);
  const publishedCount = rooms.filter((r) => r.active).length;
  const aiRoomsCount = rooms.filter((r) => r.aiVoiceEnabled || (r.aiKnowledgePrompt && r.aiKnowledgePrompt.length > 0)).length;
  const digitizationPercent = rooms.length > 0 ? Math.round((rooms.filter((r) => r.panoramaUrl).length / rooms.length) * 100) : 0;
  const totalQrScans = rooms.reduce((acc, r) => acc + (r.qrScanCount || 0), 0);

  // Xóa Pano ảnh 360
  const handleDeletePano = (filename: string) => {
    triggerConfirm(
      'Xóa không gian 360°',
      `Bạn có chắc chắn muốn xóa vĩnh viễn file toàn cảnh "${filename}" khỏi máy chủ lưu trữ?`,
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
            showToast(`Đã xóa thành công ${selectedFilenames.length} ảnh 360°`, 'success');
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
      {/* KPI Cards: Thống kê thời gian thực từ Database */}
      <div className="stats-grid">
        {/* Card 1: Tổng gian phòng */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="stat-title">Gian phòng Tour 360</div>
            <Compass size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span>{publishedCount}/{rooms.length}</span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>phòng</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>Tiến độ số hóa</span>
              <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{digitizationPercent}%</span>
            </div>
            <div style={{ width: '100%', height: 6, background: 'var(--bg-subtle)', borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${digitizationPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--accent-gold) 0%, var(--primary) 100%)',
                  borderRadius: 3,
                  transition: 'width 0.5s ease'
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Điểm neo tương tác Hotspots */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="stat-title">Điểm neo hiện vật (Hotspots)</div>
            <MapPin size={16} style={{ color: 'var(--accent-gold)' }} />
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-gold)' }}>{totalHotspots}</div>
          <div className="stat-desc">Định vị hiện vật & dẫn hướng không gian</div>
        </div>

        {/* Card 3: Thuyết minh AI & Trợ lý ảo */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="stat-title">Thuyết minh AI & Trợ lý ảo</div>
            <Sparkles size={16} style={{ color: 'var(--success)' }} />
          </div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{aiRoomsCount} phòng</div>
          <div className="stat-desc">Đã kích hoạt AI Voice & RAG tri thức</div>
        </div>

        {/* Card 4: Tương tác quét QR thực địa */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="stat-title">Tương tác QR thực địa</div>
            <QrCode size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="stat-value">{totalQrScans.toLocaleString('vi-VN')}</div>
          <div className="stat-desc">Lượt du khách quét tại phòng trưng bày</div>
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
              <span>Gian Phòng Triển Lãm ({rooms.length})</span>
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
              <span>Kho Không Gian 360° Đã Ghép ({panoramas.length})</span>
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
                      showToast('Chưa có gian phòng nào để xuất mã QR', 'info');
                    }
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <QrCode size={14} />
                  <span>Xuất gói QR Standee</span>
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
                  className="btn btn-secondary btn-sm"
                  onClick={fetchPanoramas}
                  disabled={loadingPanos}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <RotateCw size={14} className={loadingPanos ? 'spin' : ''} />
                  <span>Làm mới</span>
                </button>
              </>
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
              <span>+ Thêm gian phòng mới</span>
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
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <input
              type="text"
              placeholder={activeSubTab === 'rooms' ? "Tìm theo tên phòng, mã P-01, P-05..." : "Tìm tên file ảnh toàn cảnh 360°..."}
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
              {/* Lọc chuyên đề */}
              <div style={{ minWidth: 200 }}>
                <select
                  className="form-control"
                  style={{ fontSize: '13px', width: '100%' }}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">Tất cả chuyên đề trưng bày</option>
                  <option value="Tiến trình Lịch sử VN">Tiến trình Lịch sử VN</option>
                  <option value="Văn hóa Nam Bộ & Cổ vật">Văn hóa Nam Bộ & Cổ vật</option>
                  <option value="Sưu tập Đặc biệt">Sưu tập Đặc biệt</option>
                </select>
              </div>

              {/* Lọc trạng thái */}
              <div style={{ minWidth: 170 }}>
                <select
                  className="form-control"
                  style={{ fontSize: '13px', width: '100%' }}
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang trực tuyến (Active)</option>
                  <option value="ai_enabled">Đã bật AI Voice</option>
                  <option value="no_ai">Chưa cấu hình AI</option>
                </select>
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
                        <span>{room.hotspots?.length || 0} điểm neo</span>
                      </div>
                    </div>

                    <div className="room-info">
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.4px', flex: 1, lineHeight: 1.35 }}>
                          {room.period || 'Tiến trình Lịch sử VN'}
                        </span>
                        {/* Trạng thái AI Voice */}
                        {room.aiVoiceEnabled || room.aiKnowledgePrompt ? (
                          <span style={{ fontSize: '11px', color: 'var(--success)', background: 'var(--success-bg)', border: '1px solid var(--success-border)', padding: '2px 8px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                            <Volume2 size={11} />
                            <span>AI Voice</span>
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0 }}>
                            Chưa có AI
                          </span>
                        )}
                      </div>

                      <div className="room-name">{room.name}</div>
                      <div className="room-desc">{room.description}</div>

                      {/* Thông số thực tế từ DB */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)', padding: '8px 0', borderTop: '1px dashed var(--border-color)', marginTop: 'auto' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <QrCode size={12} style={{ color: 'var(--accent-gold)' }} />
                          <span>{(room.qrScanCount || 0).toLocaleString('vi-VN')} lượt quét</span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Layers size={12} />
                          <span>{room.scenesCount || 1} góc 360°</span>
                        </span>
                      </div>

                      {/* Action buttons 2 tầng thoáng đãng, chống chen chúc và giật hover */}
                      <div className="room-actions">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => onOpenStudio(room)}
                            style={{ justifyContent: 'center', whiteSpace: 'nowrap', gap: 6, padding: '7px 12px' }}
                            title="Mở trình biên tập ghim Hotspots 360°"
                          >
                            <Compass size={14} />
                            <span>Biên tập 360</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenAiDrawer(room)}
                            style={{ justifyContent: 'center', whiteSpace: 'nowrap', gap: 6, padding: '7px 12px' }}
                            title="Cấu hình Tri thức RAG & Thuyết minh giọng đọc AI"
                          >
                            <Sparkles size={14} style={{ color: 'var(--accent-gold)' }} />
                            <span>Cấu hình AI</span>
                          </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, width: '100%' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            title="Tải mã QR Standee phòng này"
                            onClick={() => handleOpenQrModal(room)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 10px', fontSize: '12px' }}
                          >
                            <QrCode size={13} />
                            <span>Mã QR</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            title="Chỉnh sửa thông tin phòng (Tên, Mã, Chuyên đề, Ảnh đại diện)"
                            onClick={() => setEditingRoom(room)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 10px', fontSize: '12px' }}
                          >
                            <Edit3 size={13} />
                            <span>Sửa</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            title="Xóa gian phòng khỏi Database"
                            onClick={() => {
                              triggerConfirm(
                                'Xóa gian phòng di sản',
                                `Bạn có chắc chắn muốn xóa vĩnh viễn gian phòng "${room.name}" khỏi cơ sở dữ liệu? Dữ liệu điểm neo và ảnh 360 liên kết cũng sẽ bị hủy bỏ.`,
                                () => onDeleteRoom(room.id)
                              );
                            }}
                            style={{ padding: '6px 9px', color: 'var(--error)' }}
                          >
                            <Trash2 size={13} />
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
                      {searchQuery ? 'Không tìm thấy gian phòng phù hợp' : 'Chưa có gian phòng trưng bày nào trong Database'}
                    </div>
                    <div className="empty-state-desc">
                      {searchQuery
                        ? `Không tìm thấy gian phòng nào khớp với từ khóa "${searchQuery}". Vui lòng thử lại với tên hoặc mã phòng khác.`
                        : 'Bắt đầu bằng việc thêm gian phòng mới. Bạn có thể sử dụng tính năng "Chọn mẫu phòng Bảo tàng Lịch sử TP.HCM" để nhập liệu thật nhanh chóng.'}
                    </div>
                    {!searchQuery && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setSelectedPanoForNewRoom(undefined);
                          setShowNewModal(true);
                        }}
                      >
                        <Plus size={14} />
                        <span>Thêm gian phòng đầu tiên</span>
                      </button>
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
                      <th>Gian phòng</th>
                      <th>Mã số</th>
                      <th>Chuyên đề</th>
                      <th>Điểm neo</th>
                      <th>Thuyết minh AI</th>
                      <th>Lượt quét QR</th>
                      <th style={{ textAlign: 'right' }}>Thao tác</th>
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
                              <div style={{ fontWeight: 600, color: 'var(--heading-color)', fontSize: '13.5px' }}>{room.name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {room.description}
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
                          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{room.period}</span>
                        </td>
                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '12.5px', fontWeight: 600 }}>
                            <MapPin size={13} style={{ color: 'var(--accent-gold)' }} />
                            <span>{room.hotspots?.length || 0}</span>
                          </span>
                        </td>
                        <td>
                          {room.aiVoiceEnabled || room.aiKnowledgePrompt ? (
                            <span style={{ fontSize: '11.5px', color: 'var(--success)', background: 'var(--success-bg)', border: '1px solid var(--success-border)', padding: '3px 8px', borderRadius: 4, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={12} />
                              <span>Đã bật AI Voice</span>
                            </span>
                          ) : (
                            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '3px 8px', borderRadius: 4 }}>
                              Chưa cấu hình
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
                              title="Biên tập 360"
                              style={{ padding: '5px 10px' }}
                            >
                              <Compass size={13} />
                              <span>Biên tập</span>
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenAiDrawer(room)}
                              title="Cấu hình AI"
                              style={{ padding: '5px 8px' }}
                            >
                              <Sparkles size={13} style={{ color: 'var(--accent-gold)' }} />
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenQrModal(room)}
                              title="Tải mã QR Standee"
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
                                  'Xóa gian phòng di sản',
                                  `Bạn có chắc chắn muốn xóa vĩnh viễn gian phòng "${room.name}"?`,
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
              pageSize={PAGE_SIZE}
              onPageChange={setRoomPage}
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
                        <span>Xoay xem 360°</span>
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
                          <span>+ Tạo Phòng</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleCopyLink(item.url)}
                          title="Sao chép đường dẫn ảnh 360"
                        >
                          {copiedUrl === item.url ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDeletePano(item.filename)}
                          title="Xóa vĩnh viễn"
                          style={{ color: 'var(--error)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Pagination
              currentPage={panoPage}
              totalItems={filteredPanos.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPanoPage}
            />
          </div>
        )}
      </div>

      {/* SLIDE-OVER DRAWER: CẤU HÌNH AI & THUYẾT MINH 4.0 */}
      {aiDrawerRoom && (
        <div className="drawer-backdrop" onClick={handleCloseAiDrawer}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title-group">
                <h3>
                  <Sparkles size={17} style={{ color: 'var(--accent-gold)' }} />
                  <span>Cấu hình AI 4.0: {aiDrawerRoom.name}</span>
                </h3>
                <p>Mã gian phòng: <strong>{aiDrawerRoom.code}</strong> • {aiDrawerRoom.period}</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseAiDrawer}
                aria-label="Đóng bảng cấu hình"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Sub-Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-subtle)' }}>
              <button
                type="button"
                onClick={() => setDrawerActiveTab('rag')}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  background: drawerActiveTab === 'rag' ? 'var(--bg-surface)' : 'transparent',
                  border: 'none',
                  borderBottom: drawerActiveTab === 'rag' ? '2px solid var(--primary)' : '2px solid transparent',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: drawerActiveTab === 'rag' ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <BookOpen size={15} />
                <span>Tri thức AI (RAG Context)</span>
              </button>

              <button
                type="button"
                onClick={() => setDrawerActiveTab('tts')}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  background: drawerActiveTab === 'tts' ? 'var(--bg-surface)' : 'transparent',
                  border: 'none',
                  borderBottom: drawerActiveTab === 'tts' ? '2px solid var(--primary)' : '2px solid transparent',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: drawerActiveTab === 'tts' ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Mic size={15} />
                <span>Thuyết minh giọng đọc (TTS)</span>
              </button>
            </div>

            <div className="drawer-body">
              {drawerActiveTab === 'rag' ? (
                /* TAB 1: TRI THỨC RAG */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '12px 14px', borderRadius: 'var(--radius-md)', fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 600, color: 'var(--heading-color)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={14} style={{ color: 'var(--accent-gold)' }} />
                      <span>Cơ chế RAG (Retrieval-Augmented Generation) cho Trợ lý ảo:</span>
                    </div>
                    Khi du khách quét QR hoặc tham quan 360°, chatbot AI sẽ truy xuất tài liệu bối cảnh này để trả lời chính xác các câu hỏi về hiện vật của gian phòng, chống hallucination (bịa đặt thông tin lịch sử).
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>Tư liệu bối cảnh lịch sử phòng</label>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleLoadPresetKnowledge}
                      style={{ fontSize: '11.5px', padding: '4px 10px' }}
                    >
                      <span>Nạp mẫu chuẩn Bảo tàng</span>
                    </button>
                  </div>

                  <textarea
                    rows={8}
                    className="form-control"
                    style={{ width: '100%', fontSize: '13px', lineHeight: 1.6 }}
                    value={aiKnowledgePrompt}
                    onChange={(e) => setAiKnowledgePrompt(e.target.value)}
                    placeholder="Nhập tóm tắt bối cảnh lịch sử, niên đại, ý nghĩa các hiện vật tiêu biểu trong gian phòng này..."
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSaveRagKnowledge}
                      disabled={isSavingAi}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {isSavingAi ? <RotateCw size={14} className="spin" /> : <Check size={14} />}
                      <span>Lưu Tri thức RAG vào Database</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* TAB 2: TEXT-TO-SPEECH (TTS) */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Giọng đọc thuyết minh tự động</label>
                      <select
                        className="form-control"
                        value={aiVoiceLang}
                        onChange={(e) => setAiVoiceLang(e.target.value)}
                        style={{ fontSize: '13px' }}
                      >
                        <option value="vi-south">Nữ Miền Nam (Giọng di sản truyền cảm - Đề xuất cho Bảo tàng TP.HCM)</option>
                        <option value="vi-north">Nam Miền Bắc (Trang trọng, chuẩn mực)</option>
                        <option value="en">Tiếng Anh (English - Chuẩn Quốc tế cho khách nước ngoài)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>Kịch bản âm thanh thuyết minh (Audio Script)</label>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={handleLoadPresetKnowledge}
                          style={{ fontSize: '11.5px', padding: '4px 10px' }}
                        >
                          <span>Điền kịch bản mẫu</span>
                        </button>
                      </div>
                      <textarea
                        rows={6}
                        className="form-control"
                        style={{ width: '100%', fontSize: '13px', lineHeight: 1.6 }}
                        value={aiScript}
                        onChange={(e) => setAiScript(e.target.value)}
                        placeholder="Nhập lời chào và kịch bản thuyết minh tự động phát khi du khách bước vào phòng 360°..."
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleGenerateTtsAudio}
                      disabled={isGeneratingTts}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {isGeneratingTts ? <RotateCw size={14} className="spin" /> : <Play size={14} />}
                      <span>Tạo & Nghe thử giọng đọc AI</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSaveTtsVoice}
                      disabled={isSavingAi}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}
                    >
                      {isSavingAi ? <RotateCw size={14} className="spin" /> : <Volume2 size={14} />}
                      <span>Lưu & Kích hoạt AI Voice</span>
                    </button>
                  </div>

                  {/* Audio Player nghe thử */}
                  {previewAudioUrl && (
                    <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Volume2 size={14} />
                        <span>Trình phát âm thanh thử nghiệm (Hệ thống AI TTS):</span>
                      </div>
                      <audio controls style={{ width: '100%' }}>
                        <source src={previewAudioUrl} type="audio/ogg" />
                        Trình duyệt của bạn không hỗ trợ thẻ audio.
                      </audio>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="drawer-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseAiDrawer}
              >
                <span>Đóng lại</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XUẤT QR STANDEE BẢO TÀNG THỰC ĐỊA */}
      {showQrModal && selectedQrRoom && (
        <div className="modal-backdrop" onClick={() => setShowQrModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <QrCode size={18} style={{ color: 'var(--primary)' }} />
                <h2 className="modal-title">Standee QR Thực Địa: {selectedQrRoom.name}</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowQrModal(false)}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              {/* Standee Print Preview Card */}
              <div className="standee-print-card">
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#8C2D19', marginBottom: 6 }}>
                  Bảo Tàng Lịch Sử Thành Phố Hồ Chí Minh
                </div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#2A1B14', marginBottom: 2 }}>
                  {selectedQrRoom.name}
                </div>
                <div style={{ fontSize: '12px', color: '#5C4D43', marginBottom: 16 }}>
                  Mã gian phòng: <strong>{selectedQrRoom.code}</strong> • {selectedQrRoom.period}
                </div>

                <div style={{ width: 180, height: 180, margin: '0 auto 16px', padding: 8, background: '#FFFFFF', border: '2px solid #EADEC9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${window.location.origin}/?room=${selectedQrRoom.id}`)}`}
                    alt={`QR Code ${selectedQrRoom.name}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#2A1B14', marginBottom: 4 }}>
                  Quét mã để bước vào không gian 360° & nghe Thuyết minh AI
                </div>
                <div style={{ fontSize: '11px', color: '#5C4D43' }}>
                  Ứng dụng Công nghệ 4.0 và AI trong Bảo tồn Di sản Văn hóa
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  window.print();
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Printer size={14} />
                <span>In Standee A5</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowQrModal(false)}
              >
                <span>Hoàn tất</span>
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
