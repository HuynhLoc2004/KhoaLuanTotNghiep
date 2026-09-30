import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Zap,
  Key,
  ShieldCheck,
  ShieldAlert,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Clock,
  Eye,
  EyeOff,
  Inbox,
  Send,
  MessageSquare
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../Toast';
import { AISettings } from '../../types';

interface VisitorInquiryItem {
  _id: string;
  visitorName: string;
  visitorContact: string;
  message: string;
  topic: string;
  status: string;
  createdAt: string;
}

const PRESET_MODELS = [
  { name: 'gemini-2.5-flash', tag: 'Mặc định • Tốc độ cao', provider: 'gemini' },
  { name: 'gemini-1.5-pro', tag: 'Chuyên sâu • Lịch sử', provider: 'gemini' },
  { name: 'gemini-2.0-flash', tag: 'Thế hệ mới • Siêu tốc', provider: 'gemini' },
  { name: 'gpt-4o-mini', tag: 'OpenAI Compatible', provider: 'openai' }
];

export const AdminAIAssistantSettingsTab: React.FC = () => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Form state
  const [isActive, setIsActive] = useState(true);
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'custom'>('gemini');
  const [modelName, setModelName] = useState('gemini-2.5-flash');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeyMasked, setApiKeyMasked] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [temperature, setTemperature] = useState(0.4);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [maxTokens, setMaxTokens] = useState(1024);
  const [antiSpamCooldownSec, setAntiSpamCooldownSec] = useState(3);
  const [maxRequestsPerMinute, setMaxRequestsPerMinute] = useState(15);

  // Test result state
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    message: string;
    responseSnippet?: string;
  } | null>(null);

  // Inquiries from visitors
  const [inquiries, setInquiries] = useState<VisitorInquiryItem[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  // Nạp cấu hình từ Backend
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getAISettings();
      setIsActive(data.isActive ?? true);
      setProvider(data.provider || 'gemini');
      setModelName(data.modelName || 'gemini-2.5-flash');
      setApiKeyMasked(data.apiKeyMasked || '');
      setHasApiKey(Boolean(data.hasApiKey));
      setTemperature(typeof data.temperature === 'number' ? data.temperature : 0.4);
      setSystemPrompt(data.systemPrompt || '');
      setMaxTokens(data.maxTokens || 1024);
      setAntiSpamCooldownSec(data.antiSpamCooldownSec || 3);
      setMaxRequestsPerMinute(data.maxRequestsPerMinute || 15);
    } catch (err: any) {
      showToast(err.message || 'Không thể tải cấu hình AI', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Nạp danh sách tin nhắn du khách
  const fetchInquiries = async () => {
    try {
      setLoadingInquiries(true);
      const res = await fetch('/api/ai/inquiries', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('museum_admin_token') || ''}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        setInquiries(json.inquiries || []);
      }
    } catch {
      // Ignored
    } finally {
      setLoadingInquiries(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchInquiries();
  }, []);

  // Kiểm tra kết nối Model
  const handleTestConnection = async () => {
    if (testing) return;
    setTesting(true);
    setTestResult(null);

    try {
      const res = await api.testAIConnection({
        provider,
        modelName,
        apiKey: apiKeyInput
      });

      setTestResult(res);
      if (res.success) {
        showToast(`Kết nối thành công tới model ${modelName} (${res.latencyMs}ms)`, 'success');
      } else {
        showToast(res.message || 'Kiểm tra kết nối thất bại', 'warning');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        latencyMs: 0,
        message: err.message || 'Lỗi kiểm tra kết nối'
      });
      showToast(err.message || 'Lỗi kiểm tra kết nối', 'error');
    } finally {
      setTesting(false);
    }
  };

  // Lưu cấu hình
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (!modelName.trim()) {
      showToast('Vui lòng nhập tên mã mô hình AI', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<AISettings> = {
        isActive,
        provider,
        modelName: modelName.trim(),
        temperature,
        systemPrompt: systemPrompt.trim(),
        maxTokens,
        antiSpamCooldownSec,
        maxRequestsPerMinute
      };

      // Chỉ gửi apiKey nếu quản trị viên gõ key mới
      if (apiKeyInput.trim()) {
        payload.apiKey = apiKeyInput.trim();
      }

      const res = await api.updateAISettings(payload);
      showToast(res.message || 'Đã lưu cấu hình Trợ lý AI thành công', 'success');

      if (res.settings) {
        setApiKeyMasked(res.settings.apiKeyMasked || '');
        setHasApiKey(Boolean(res.settings.hasApiKey));
        setApiKeyInput(''); // Xóa trường nhập sau khi lưu an toàn
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu cấu hình AI', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
        <Loader2 size={32} className="spin" style={{ color: 'var(--accent-gold, #c5a880)', margin: '0 auto 12px auto' }} />
        <p style={{ margin: 0, fontSize: 13.5 }}>Đang tải cấu hình Trợ lý AI & Model...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.2s ease-out' }}>
      {/* 1. THẺ TỔNG QUAN TRẠNG THÁI TRỢ LÝ AI */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14
        }}
      >
        <div
          style={{
            background: '#131d31',
            border: '1px solid rgba(148, 163, 184, 0.14)',
            borderRadius: 10,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ display: 'block', fontSize: 11.5, color: '#94a3b8', marginBottom: 2 }}>Trạng thái hoạt động</span>
            <strong style={{ fontSize: 14, color: isActive ? '#34d399' : '#f87171' }}>
              {isActive ? 'Đang Bật (Sẵn sàng)' : 'Đang Tắt (Tạm ngưng)'}
            </strong>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className="btn btn-sm"
            style={{
              background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              borderColor: isActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
              color: isActive ? '#34d399' : '#f87171',
              padding: '6px 12px',
              fontSize: 12
            }}
          >
            {isActive ? 'Tắt trợ lý' : 'Bật trợ lý'}
          </button>
        </div>

        <div
          style={{
            background: '#131d31',
            border: '1px solid rgba(148, 163, 184, 0.14)',
            borderRadius: 10,
            padding: '14px 16px'
          }}
        >
          <span style={{ display: 'block', fontSize: 11.5, color: '#94a3b8', marginBottom: 2 }}>Model AI đang vận hành</span>
          <strong style={{ fontSize: 14, color: '#f8fafc', fontFamily: 'monospace' }}>{modelName || 'Chưa gán'}</strong>
        </div>

        <div
          style={{
            background: '#131d31',
            border: '1px solid rgba(148, 163, 184, 0.14)',
            borderRadius: 10,
            padding: '14px 16px'
          }}
        >
          <span style={{ display: 'block', fontSize: 11.5, color: '#94a3b8', marginBottom: 2 }}>Khóa API (API Key)</span>
          <strong style={{ fontSize: 13, color: hasApiKey ? '#34d399' : '#fbbf24' }}>
            {hasApiKey ? `Đã cấu hình (${apiKeyMasked || '••••••••'})` : 'Dùng Env Máy Chủ'}
          </strong>
        </div>

        <div
          style={{
            background: '#131d31',
            border: '1px solid rgba(148, 163, 184, 0.14)',
            borderRadius: 10,
            padding: '14px 16px'
          }}
        >
          <span style={{ display: 'block', fontSize: 11.5, color: '#94a3b8', marginBottom: 2 }}>Bảo vệ chống Spam</span>
          <strong style={{ fontSize: 13, color: '#cbd5e1' }}>
            Giãn cách {antiSpamCooldownSec}s • Max {maxRequestsPerMinute} req/phút
          </strong>
        </div>
      </div>

      {/* 2. FORM CẤU HÌNH MODEL AI & THAM SỐ CHÍNH */}
      <form
        onSubmit={handleSaveSettings}
        style={{
          background: '#0f172a',
          border: '1px solid rgba(148, 163, 184, 0.16)',
          borderRadius: 12,
          padding: 22,
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.12)', paddingBottom: 14 }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: 15.5, fontWeight: 600, color: '#f8fafc' }}>
              Quản Trị Model & Khóa API Cho Trợ Lý Ảo
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
              Không fix cứng model. Quản trị viên chỉ cần gán tên model vào ô bên dưới và lưu lại, trợ lý sẽ ngay lập tức chuyển sang sử dụng model đó.
            </p>
          </div>
          <span
            style={{
              fontSize: 11.5,
              padding: '4px 10px',
              borderRadius: 6,
              background: 'rgba(197, 168, 128, 0.12)',
              border: '1px solid rgba(197, 168, 128, 0.3)',
              color: '#c5a880',
              fontWeight: 500
            }}
          >
            Đồng bộ thời gian thực
          </span>
        </div>

        {/* Lựa chọn Nhà cung cấp & Tên Model */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
              Nhà cung cấp AI (Provider):
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as any)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#131d31',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: 7,
                color: '#f8fafc',
                fontSize: 13,
                outline: 'none'
              }}
            >
              <option value="gemini">Google Gemini API (Khuyên dùng • Miễn phí & Sắc bén)</option>
              <option value="openai">OpenAI Compatible (ChatGPT / GPT-4o-mini)</option>
              <option value="custom">Custom REST API Model</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
              Mã / Tên Mô Hình AI (Model Identifier): <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Ví dụ: gemini-2.5-flash, gemini-1.5-pro, gpt-4o-mini..."
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#131d31',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: 7,
                color: '#f8fafc',
                fontSize: 13,
                fontFamily: 'monospace',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
            {/* Quick preset chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {PRESET_MODELS.map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => {
                    setModelName(m.name);
                    setProvider(m.provider as any);
                  }}
                  style={{
                    padding: '3px 8px',
                    fontSize: 11,
                    borderRadius: 5,
                    background: modelName === m.name ? 'rgba(197, 168, 128, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid ' + (modelName === m.name ? 'rgba(197, 168, 128, 0.6)' : 'rgba(148, 163, 184, 0.15)'),
                    color: modelName === m.name ? '#c5a880' : '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  {m.name} <span style={{ opacity: 0.7 }}>({m.tag})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Khóa API Key bí mật */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#cbd5e1' }}>
              Khóa API Key Bí Mật:
            </label>
            {hasApiKey && (
              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                Khóa hiện tại: <code style={{ color: '#c5a880' }}>{apiKeyMasked}</code>
              </span>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={hasApiKey ? 'Nhập khóa mới nếu muốn thay đổi (để trống giữ nguyên)...' : 'Dán API Key (Ví dụ: AIzaSy...)'}
              style={{
                width: '100%',
                padding: '10px 42px 10px 12px',
                background: '#131d31',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: 7,
                color: '#f8fafc',
                fontSize: 13,
                fontFamily: 'monospace',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 4
              }}
              title={showApiKey ? 'Ẩn khóa' : 'Hiện khóa'}
            >
              {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <span style={{ display: 'block', fontSize: 11, color: '#64748b', marginTop: 5 }}>
            Hệ thống lưu trữ bảo mật trong cơ sở dữ liệu và chỉ nạp qua máy chủ backend, tuyệt đối không lộ ra trình duyệt người dùng.
          </span>
        </div>

        {/* Kiểm tra kết nối Model */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}
          >
            {testing ? <Loader2 size={14} className="spin" /> : <Zap size={14} style={{ color: '#c5a880' }} />}
            <span>{testing ? 'Đang gửi ping thử nghiệm...' : 'Kiểm tra kết nối Model'}</span>
          </button>

          {testResult && (
            <div
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: testResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: '1px solid ' + (testResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'),
                color: testResult.success ? '#34d399' : '#f87171'
              }}
            >
              {testResult.success ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Tham số điều khiển: Nhiệt độ & Chống Spam */}
        <div
          style={{
            background: '#131d31',
            border: '1px solid rgba(148, 163, 184, 0.14)',
            borderRadius: 8,
            padding: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1' }}>Nhiệt độ (Temperature):</label>
              <span style={{ fontSize: 12, color: '#c5a880', fontWeight: 600 }}>{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#c5a880', cursor: 'pointer' }}
            />
            <span style={{ display: 'block', fontSize: 10.5, color: '#64748b', marginTop: 4 }}>
              0.0: Chính xác tuyệt đối • 0.4: Cân bằng (khuyên dùng) • 1.0: Sáng tạo văn học
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
              Giãn cách câu hỏi (Cooldown):
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                min="1"
                max="30"
                value={antiSpamCooldownSec}
                onChange={(e) => setAntiSpamCooldownSec(parseInt(e.target.value) || 3)}
                style={{
                  width: 90,
                  padding: '7px 10px',
                  background: '#0a0f1d',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: 6,
                  color: '#f8fafc',
                  fontSize: 13
                }}
              />
              <span style={{ fontSize: 12, color: '#94a3b8' }}>giây / câu (chống spam)</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
              Giới hạn tần suất:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                min="3"
                max="100"
                value={maxRequestsPerMinute}
                onChange={(e) => setMaxRequestsPerMinute(parseInt(e.target.value) || 15)}
                style={{
                  width: 90,
                  padding: '7px 10px',
                  background: '#0a0f1d',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: 6,
                  color: '#f8fafc',
                  fontSize: 13
                }}
              />
              <span style={{ fontSize: 12, color: '#94a3b8' }}>câu / phút / IP</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
              Giới hạn Token (Max Output):
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                min="256"
                max="4096"
                step="128"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value) || 1024)}
                style={{
                  width: 90,
                  padding: '7px 10px',
                  background: '#0a0f1d',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: 6,
                  color: '#f8fafc',
                  fontSize: 13
                }}
              />
              <span style={{ fontSize: 12, color: '#94a3b8' }}>tokens</span>
            </div>
          </div>
        </div>

        {/* Lời nhắc hệ thống (System Prompt) */}
        <div>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
            Lời Nhắc Hệ Thống (System Persona & Prompt):
          </label>
          <textarea
            rows={4}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Định nghĩa phong cách, vai trò và giới hạn của Trợ lý Di sản Ảo..."
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#131d31',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: 7,
              color: '#f8fafc',
              fontSize: 12.5,
              lineHeight: 1.5,
              fontFamily: 'inherit',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Nút lưu */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10, borderTop: '1px solid rgba(148, 163, 184, 0.12)' }}>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', fontSize: 13.5 }}
          >
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            <span>{saving ? 'Đang lưu cấu hình...' : 'Lưu Cấu Hình Model AI'}</span>
          </button>
        </div>
      </form>

      {/* 3. BẢNG DANH SÁCH YÊU CẦU / TIN NHẮN TỪ KHÁCH THAM QUAN */}
      <div
        style={{
          background: '#0f172a',
          border: '1px solid rgba(148, 163, 184, 0.16)',
          borderRadius: 12,
          padding: 22,
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 600, color: '#f8fafc' }}>
              Hộp Thư Yêu Cầu Du Khách (Gửi tới Ban Quản Lý)
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
              Danh sách các tin nhắn, yêu cầu hỗ trợ và đặt lịch do khách tham quan gửi qua chức năng "Liên hệ Ban Quản lý".
            </p>
          </div>
          <button
            type="button"
            onClick={fetchInquiries}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RotateCcw size={13} className={loadingInquiries ? 'spin' : ''} />
            <span>Làm mới hòm thư</span>
          </button>
        </div>

        {inquiries.length === 0 ? (
          <div
            style={{
              padding: '36px 20px',
              textAlign: 'center',
              background: '#131d31',
              borderRadius: 8,
              border: '1px dashed rgba(148, 163, 184, 0.2)'
            }}
          >
            <Inbox size={28} style={{ color: '#64748b', margin: '0 auto 8px auto' }} />
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>Hòm thư hiện chưa có tin nhắn nào từ du khách.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.15)', color: '#94a3b8', fontSize: 11.5 }}>
                  <th style={{ padding: '8px 12px' }}>Thời gian</th>
                  <th style={{ padding: '8px 12px' }}>Khách tham quan</th>
                  <th style={{ padding: '8px 12px' }}>Liên hệ</th>
                  <th style={{ padding: '8px 12px' }}>Nội dung yêu cầu</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => (
                  <tr key={inq._id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
                    <td style={{ padding: '10px 12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(inq.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#f8fafc', fontWeight: 600 }}>
                      {inq.visitorName}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#c5a880', fontFamily: 'monospace' }}>
                      {inq.visitorContact || 'Không để lại'}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#cbd5e1' }}>
                      {inq.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
