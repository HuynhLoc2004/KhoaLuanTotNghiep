import React, { useState, useEffect } from 'react';
import {
  Bot,
  Zap,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  EyeOff,
  Inbox,
  ShieldCheck,
  SlidersHorizontal,
  Mail,
  User,
  Clock
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

export const AdminAIAssistantSettingsTab: React.FC = () => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Form state
  const [isActive, setIsActive] = useState(true);
  const [modelName, setModelName] = useState('gemini-2.5-flash');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeyMasked, setApiKeyMasked] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [temperature, setTemperature] = useState(0.4);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [maxTokens, setMaxTokens] = useState(1024);
  const [antiSpamCooldownSec, setAntiSpamCooldownSec] = useState(3);
  const [maxRequestsPerMinute, setMaxRequestsPerMinute] = useState(15);

  // Validation errors
  const [modelError, setModelError] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

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

  // Validation functions (Chống Injection & bảo vệ form)
  const validateModelName = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setModelError('Tên mô hình AI không được để trống.');
      return false;
    }
    // Chỉ chấp nhận ký tự an toàn: a-z, A-Z, 0-9, ., -, _, :, /
    if (!/^[a-zA-Z0-9._\-\/:]{2,80}$/.test(trimmed)) {
      setModelError('Tên mô hình chỉ gồm chữ cái, chữ số, dấu gạch ngang (-), gạch dưới (_) hoặc chấm (.).');
      return false;
    }
    setModelError(null);
    return true;
  };

  const validateApiKey = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setApiKeyError(null);
      return true;
    }
    if (trimmed.includes(' ') || !/^[A-Za-z0-9_\-\.\:\+]{6,256}$/.test(trimmed)) {
      setApiKeyError('Định dạng API Key không hợp lệ. Vui lòng kiểm tra lại mã khóa.');
      return false;
    }
    setApiKeyError(null);
    return true;
  };

  // Nạp cấu hình từ Backend
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getAISettings();
      setIsActive(data.isActive ?? true);
      setModelName(data.modelName || 'gemini-2.5-flash');
      setApiKeyMasked(data.apiKeyMasked || '');
      setHasApiKey(Boolean(data.hasApiKey));
      setTemperature(typeof data.temperature === 'number' ? data.temperature : 0.4);
      setSystemPrompt(
        data.systemPrompt ||
          'Bạn là Trợ lý Di sản Ảo của Bảo tàng Lịch sử TP. Hồ Chí Minh. Nhiệm vụ của bạn là giải đáp thông tin, hướng dẫn du khách tham quan các gian phòng 360°, giới thiệu chi tiết các cổ vật, hiện vật lịch sử và cung cấp thông tin vé, giờ mở cửa một cách lịch sự, trang trọng và chính xác tuyệt đối dựa trên cơ sở dữ liệu của bảo tàng.'
      );
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

    if (!validateModelName(modelName)) {
      showToast('Vui lòng kiểm tra lại tên mô hình AI trước khi thử nghiệm', 'warning');
      return;
    }

    if (apiKeyInput && !validateApiKey(apiKeyInput)) {
      showToast('API Key nhập vào không hợp lệ', 'warning');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await api.testAIConnection({
        modelName: modelName.trim(),
        apiKey: apiKeyInput.trim()
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

    const isModelValid = validateModelName(modelName);
    const isKeyValid = validateApiKey(apiKeyInput);

    if (!isModelValid || !isKeyValid) {
      showToast('Vui lòng khắc phục các lỗi định dạng trước khi lưu cấu hình.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<AISettings> = {
        isActive,
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
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Loader2 size={30} className="spin" style={{ color: 'var(--primary)', margin: '0 auto 12px auto' }} />
        <p style={{ margin: 0, fontSize: 13.5 }}>Đang nạp cấu hình Trợ lý AI...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', boxSizing: 'border-box' }}>
      {/* KHỐI 1: CẤU HÌNH TRỢ LÝ AI & MÔ HÌNH VẬN HÀNH */}
      <form onSubmit={handleSaveSettings} className="settings-card" style={{ width: '100%', boxSizing: 'border-box' }}>
        {/* Card Header chuẩn Admin */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: '1px solid var(--border-color)'
          }}
        >
          <div style={{ minWidth: 260, flex: 1 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
              Cấu Hình Trợ Lý AI & Quản Lý Mô Hình
            </h2>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Quản trị viên có thể nhập bất kỳ tên mô hình AI nào (Gemini, OpenAI,...). Hệ thống sẽ tự động liên kết dữ liệu thật và đồng bộ ngay lập tức.
            </p>
          </div>

          {/* Toggle trạng thái hoạt động */}
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              fontSize: 12.5,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Bot size={15} />
            <span>{isActive ? 'Đang Bật (Hoạt động)' : 'Đang Tắt (Tạm ngưng)'}</span>
          </button>
        </div>

        {/* Cột 1: Tên Mô hình AI (Không fix cứng, nhập tự do) */}
        <div className="settings-form-field" style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
            Tên Mô Hình AI (Model Name) <span style={{ color: 'var(--primary)' }}>*</span>
          </label>
          <input
            type="text"
            className="input-field"
            value={modelName}
            onChange={(e) => {
              setModelName(e.target.value);
              validateModelName(e.target.value);
            }}
            placeholder="Ví dụ: gemini-2.5-flash, gemini-2.0-flash, gpt-4o..."
            required
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 14px',
              fontSize: 13.5,
              fontFamily: 'monospace',
              backgroundColor: 'var(--bg-subtle)',
              border: `1px solid ${modelError ? 'var(--error, #e53e3e)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-sm, 6px)',
              color: 'var(--text-main)'
            }}
          />
          {modelError ? (
            <span style={{ fontSize: 11.5, color: 'var(--error, #e53e3e)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={12} />
              {modelError}
            </span>
          ) : (
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 5, display: 'block', wordBreak: 'break-word' }}>
              Quản trị viên có thể nhập bất kỳ mã model nào (khuyên dùng: <code>gemini-2.5-flash</code> hoặc <code>gemini-2.0-flash</code>). Hệ thống sẽ tự nhận diện nhà cung cấp tương ứng.
            </span>
          )}
        </div>

        {/* Cột 2: Khóa API Key */}
        <div className="settings-form-field" style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
              Khóa API (API Key)
            </label>
            {hasApiKey && (
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                Khóa hiện dùng: <code style={{ color: 'var(--primary)' }}>{apiKeyMasked}</code>
              </span>
            )}
          </div>

          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showApiKey ? 'text' : 'password'}
              className="input-field"
              value={apiKeyInput}
              onChange={(e) => {
                setApiKeyInput(e.target.value);
                validateApiKey(e.target.value);
              }}
              placeholder={
                hasApiKey
                  ? 'Đã cấu hình khóa bảo mật (để trống nếu muốn giữ nguyên khóa này)...'
                  : 'Nhập API Key nếu có (để trống sẽ tự động dùng khóa mặc định trên máy chủ)...'
              }
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 42px 10px 14px',
                fontSize: 13.5,
                fontFamily: 'monospace',
                backgroundColor: 'var(--bg-subtle)',
                border: `1px solid ${apiKeyError ? 'var(--error, #e53e3e)' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-sm, 6px)',
                color: 'var(--text-main)'
              }}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center'
              }}
              title={showApiKey ? 'Ẩn khóa' : 'Hiện khóa'}
            >
              {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {apiKeyError ? (
            <span style={{ fontSize: 11.5, color: 'var(--error, #e53e3e)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={12} />
              {apiKeyError}
            </span>
          ) : (
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 5, display: 'block' }}>
              Khóa API được mã hóa an toàn trên máy chủ. Nếu để trống, hệ thống sẽ sử dụng khóa môi trường (Environment Variable) được cấu hình sẵn.
            </span>
          )}
        </div>

        {/* Nút Kiểm tra kết nối & Hiển thị kết quả */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}
          >
            {testing ? <Loader2 size={14} className="spin" /> : <Zap size={14} />}
            <span>{testing ? 'Đang gửi tín hiệu thử nghiệm...' : 'Kiểm tra kết nối Model'}</span>
          </button>

          {testResult && (
            <div
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm, 6px)',
                fontSize: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: testResult.success ? 'var(--success-bg, #f0ede4)' : 'var(--error-bg, #fdf3f3)',
                border: `1px solid ${testResult.success ? 'var(--success-border, #d8d1c2)' : 'var(--error-border, #f7bfbf)'}`,
                color: testResult.success ? 'var(--success-text, #3d5a45)' : 'var(--error-text, #7f1d1d)'
              }}
            >
              {testResult.success ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Lời nhắc hệ thống (System Persona / Prompt) */}
        <div className="settings-form-field" style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
            Lời Nhắc Hệ Thống (System Persona & Prompt)
          </label>
          <textarea
            rows={4}
            className="input-field"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Định nghĩa phong cách xưng hô, vai trò và chuẩn mực hướng dẫn của Trợ lý AI..."
            maxLength={3000}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 14px',
              fontSize: 13,
              lineHeight: 1.55,
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm, 6px)',
              color: 'var(--text-main)',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 5, display: 'block' }}>
            Quy định phong cách phản hồi của Trợ lý AI khi du khách tương tác trên cổng di sản ảo.
          </span>
        </div>

        {/* Cài đặt nâng cao: Nhiệt độ & Kiểm soát tần suất */}
        <div
          style={{
            padding: 16,
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            marginBottom: 22
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <SlidersHorizontal size={14} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)' }}>
              Tham Số Vận Hành & Chống Tấn Công Spam (Anti-Spam)
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16
            }}
          >
            {/* Nhiệt độ sáng tạo */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-main)' }}>Độ sáng tạo (Temperature):</label>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                0.0: Chuẩn xác dữ liệu • 0.4: Cân bằng (khuyên dùng)
              </span>
            </div>

            {/* Giãn cách câu hỏi */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-main)', marginBottom: 6 }}>
                Giãn cách câu hỏi (Cooldown):
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={antiSpamCooldownSec}
                  onChange={(e) => setAntiSpamCooldownSec(parseInt(e.target.value) || 3)}
                  className="input-field"
                  style={{
                    width: 80,
                    padding: '6px 10px',
                    fontSize: 13,
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm, 6px)',
                    color: 'var(--text-main)'
                  }}
                />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>giây / câu hỏi</span>
              </div>
            </div>

            {/* Giới hạn số câu hỏi mỗi phút */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-main)', marginBottom: 6 }}>
                Giới hạn lượt hỏi / phút:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={maxRequestsPerMinute}
                  onChange={(e) => setMaxRequestsPerMinute(parseInt(e.target.value) || 15)}
                  className="input-field"
                  style={{
                    width: 80,
                    padding: '6px 10px',
                    fontSize: 13,
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm, 6px)',
                    color: 'var(--text-main)'
                  }}
                />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>câu / phút / IP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hàng nút bấm Lưu cấu hình */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: 16,
            borderTop: '1px solid var(--border-color)'
          }}
        >
          <button
            type="submit"
            disabled={saving || Boolean(modelError) || Boolean(apiKeyError)}
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 22px',
              fontSize: 13.5
            }}
          >
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            <span>{saving ? 'Đang lưu cấu hình...' : 'Lưu Cấu Hình Trợ Lý AI'}</span>
          </button>
        </div>
      </form>

      {/* KHỐI 2: HỘP THƯ DU KHÁCH (GỬI ĐẾN BAN QUẢN LÝ) */}
      <div className="settings-card" style={{ width: '100%', boxSizing: 'border-box' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 16,
            paddingBottom: 14,
            borderBottom: '1px solid var(--border-color)'
          }}
        >
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
              Hộp Thư Yêu Cầu Du Khách (Gửi tới Ban Quản Lý)
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              Danh sách các tin nhắn, yêu cầu hỗ trợ và đặt lịch do khách tham quan gửi qua chức năng "Liên hệ Ban Quản lý".
            </p>
          </div>

          <button
            type="button"
            onClick={fetchInquiries}
            disabled={loadingInquiries}
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
              padding: '40px 20px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px dashed var(--border-color)'
            }}
          >
            <Inbox size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 8px auto' }} />
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
              Hòm thư hiện chưa có tin nhắn nào từ du khách.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 11.5 }}>
                  <th style={{ padding: '8px 12px' }}>Thời gian</th>
                  <th style={{ padding: '8px 12px' }}>Khách tham quan</th>
                  <th style={{ padding: '8px 12px' }}>Thông tin liên hệ</th>
                  <th style={{ padding: '8px 12px' }}>Nội dung yêu cầu</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => (
                  <tr key={inq._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(inq.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-main)', fontWeight: 600 }}>
                      {inq.visitorName}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--primary)', fontFamily: 'monospace' }}>
                      {inq.visitorContact || 'Không để lại'}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-main)', wordBreak: 'break-word' }}>
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
