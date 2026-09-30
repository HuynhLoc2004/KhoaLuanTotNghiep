import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Compass,
  Crown,
  Ticket,
  Headphones,
  Loader2,
  ArrowRight,
  Phone,
  Mail,
  Clock,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import { AIChatMessage, AIChatResponse, MuseumRoom, Artifact } from '../../types';
import { useSystemBranding } from '../../context/SystemBrandingContext';

interface ClientAIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRoomTour?: (roomId: string) => void;
  onSelectArtifact?: (artifact: Artifact) => void;
  allRooms?: MuseumRoom[];
}

type AITopicKey = 'general' | 'artifacts' | 'rooms' | 'tickets_info' | 'contact_admin';

interface TopicOptionDef {
  id: AITopicKey;
  label: string;
  icon: React.ReactNode;
}

const TOPIC_RADIO_OPTIONS: TopicOptionDef[] = [
  { id: 'general', label: 'Hỏi tự do', icon: <Sparkles size={13} /> },
  { id: 'artifacts', label: 'Cổ vật & 3D', icon: <Crown size={13} /> },
  { id: 'rooms', label: 'Gian phòng 360°', icon: <Compass size={13} /> },
  { id: 'tickets_info', label: 'Vé & Giờ mở cửa', icon: <Ticket size={13} /> },
  { id: 'contact_admin', label: 'Gặp Ban Quản lý', icon: <Headphones size={13} /> }
];

export const ClientAIAssistantModal: React.FC<ClientAIAssistantModalProps> = ({
  isOpen,
  onClose,
  onOpenRoomTour,
  onSelectArtifact,
  allRooms = []
}) => {
  const { branding } = useSystemBranding();
  const [selectedTopic, setSelectedTopic] = useState<AITopicKey>('general');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Form liên hệ Ban Quản lý khi chọn radio này
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactNote, setContactNote] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lời chào mở đầu trang trọng và gọn gàng
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: `Kính chào Quý khách! Tôi là Trợ lý Di sản Ảo của ${branding.museumName || 'Bảo tàng Lịch sử TP. Hồ Chí Minh'}.\n\nTôi có thể hỗ trợ Quý khách giải đáp thông tin cổ vật, niên đại, tham quan phòng 360° hoặc tra cứu giá vé và giờ mở cửa. Quý khách cần hỗ trợ nội dung gì?`,
          createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          suggestedQuestions: [
            'Giá vé và khung giờ mở cửa tham quan?',
            'Bảo tàng có những phòng 360° nào?',
            'Những bảo vật quốc gia tiêu biểu?'
          ]
        }
      ]);
    }
  }, [branding.museumName]);

  // Tự động cuộn xuống cuối
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading, selectedTopic]);

  // Focus ô nhập khi mở
  useEffect(() => {
    if (isOpen && window.innerWidth > 768) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, selectedTopic]);

  // Bộ đếm chống spam
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  if (!isOpen) return null;

  // Gửi câu hỏi đến server
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading || cooldownRemaining > 0) return;

    setErrorMessage(null);

    const userMessage: AIChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      text: query,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setCooldownRemaining(3);

    try {
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res: AIChatResponse = await api.sendAIChat(query, selectedTopic, historyPayload);

      const aiReply: AIChatMessage = {
        id: 'ai-' + Date.now(),
        role: 'model',
        text: res.reply || 'Cảm ơn Quý khách. Quý khách cần tìm hiểu thêm thông tin nào khác không?',
        createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: res.suggestedQuestions,
        relatedRooms: res.relatedRooms,
        relatedArtifacts: res.relatedArtifacts
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Hệ thống đang bận. Vui lòng thử lại sau vài giây.');
    } finally {
      setIsLoading(false);
    }
  };

  // Gửi tin nhắn đến Ban Quản Lý
  const handleSendToAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactNote.trim() || contactSubmitting) return;

    setContactSubmitting(true);
    setContactSuccess(null);
    setErrorMessage(null);

    try {
      const res = await api.sendAIContactAdmin({
        visitorName: contactName.trim() || 'Khách tham quan',
        visitorContact: contactPhone.trim(),
        message: contactNote.trim(),
        topic: 'contact_admin'
      });

      setContactSuccess(res.message || 'Đã chuyển tin nhắn đến Ban Quản lý thành công!');
      setContactNote('');

      setMessages((prev) => [
        ...prev,
        {
          id: 'admin-ack-' + Date.now(),
          role: 'model',
          text: `Đã chuyển tiếp tin nhắn của Quý khách tới Ban Quản lý Bảo tàng thành công. Quản trị viên sẽ sớm liên hệ lại qua "${contactPhone || 'thông tin của Quý khách'}".\n\nHotline hỗ trợ: ${branding.hotline || '(028) 3829 8146'}.`,
          createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể gửi tin nhắn lúc này.');
    } finally {
      setContactSubmitting(false);
    }
  };

  // Làm mới hội thoại
  const handleResetChat = () => {
    setMessages([
      {
        id: 'reset-' + Date.now(),
        role: 'model',
        text: `Cuộc trò chuyện đã được làm mới. Tôi sẵn sàng hỗ trợ Quý khách giải đáp về ${branding.shortName || 'Bảo tàng Lịch sử'}.`,
        createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: [
          'Giá vé và khung giờ mở cửa?',
          'Khám phá phòng 360° nổi bật',
          'Tra cứu bảo vật quốc gia'
        ]
      }
    ]);
    setErrorMessage(null);
    setContactSuccess(null);
  };

  return (
    <div className="ai-widget-backdrop" onClick={onClose}>
      <div className="ai-widget-window" onClick={(e) => e.stopPropagation()}>
        {/* HEADER DÁNG NỔI BẢO TÀNG SỐ SANG TRỌNG */}
        <div className="ai-widget-header">
          <div className="ai-widget-header-brand">
            <div className="ai-brand-avatar">
              <Bot size={18} />
              <span className="ai-brand-dot" />
            </div>
            <div className="ai-brand-text">
              <div className="ai-brand-title-wrap">
                <span className="ai-brand-title">Trợ Lý Di Sản Ảo</span>
                <span className="ai-brand-chip">AI</span>
              </div>
              <span className="ai-brand-desc">
                {branding.shortName || 'Bảo tàng Lịch sử TP.HCM'} • CSDL Trực tuyến
              </span>
            </div>
          </div>

          <div className="ai-widget-header-controls">
            <button
              type="button"
              className="ai-ctrl-btn"
              onClick={handleResetChat}
              title="Làm mới cuộc trò chuyện"
            >
              <RotateCcw size={14} />
            </button>
            <button
              type="button"
              className="ai-ctrl-btn ai-ctrl-close"
              onClick={onClose}
              title="Thu nhỏ cửa sổ"
              aria-label="Đóng"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* BỘ CHỌN CHỦ ĐỀ: CHECK RADIO DẠNG PILL THANH THOÁT (KHÔNG BỊ CẮT CHỮ) */}
        <div className="ai-widget-radio-strip">
          <div className="ai-radio-pill-track" role="radiogroup" aria-label="Chủ đề trợ lý AI">
            {TOPIC_RADIO_OPTIONS.map((opt) => {
              const isChecked = selectedTopic === opt.id;
              return (
                <label
                  key={opt.id}
                  className={`ai-radio-pill ${isChecked ? 'is-active' : ''}`}
                  htmlFor={`ai-topic-${opt.id}`}
                >
                  <input
                    type="radio"
                    id={`ai-topic-${opt.id}`}
                    name="ai_concierge_topic"
                    value={opt.id}
                    checked={isChecked}
                    onChange={() => setSelectedTopic(opt.id)}
                    className="ai-radio-hidden-native"
                  />
                  <span className="ai-pill-dot" />
                  <span className="ai-pill-icon">{opt.icon}</span>
                  <span className="ai-pill-text">{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* NỘI DUNG CHÍNH */}
        {selectedTopic === 'contact_admin' ? (
          /* GIAO DIỆN KẾT NỐI BAN QUẢN LÝ */
          <div className="ai-widget-contact-pane">
            <div className="ai-contact-quick-card">
              <div className="ai-card-headline">
                <Headphones size={15} style={{ color: '#d4af37' }} />
                <span>Liên Hệ Trực Tiếp Ban Quản Lý</span>
              </div>
              <div className="ai-contact-rows">
                <a href={`tel:${branding.hotline || '02838298146'}`} className="ai-contact-row-item">
                  <Phone size={13} />
                  <span>Hotline: <strong>{branding.hotline || '(028) 3829 8146'}</strong></span>
                </a>
                <a href={`mailto:${branding.contactEmail || 'btls.tphcm@gmail.com'}`} className="ai-contact-row-item">
                  <Mail size={13} />
                  <span>Email: <strong>{branding.contactEmail || 'btls.tphcm@gmail.com'}</strong></span>
                </a>
                <div className="ai-contact-row-item">
                  <Clock size={13} />
                  <span>08:00 - 11:30 | 13:00 - 17:00 (Thứ 3 - CN)</span>
                </div>
                <div className="ai-contact-row-item">
                  <MapPin size={13} />
                  <span>{branding.address || 'Số 2 Nguyễn Bỉnh Khiêm, Q.1, TP.HCM'}</span>
                </div>
              </div>
            </div>

            {/* FORM GỬI TIN NHẮN ĐẾN BAN QUẢN LÝ */}
            <form onSubmit={handleSendToAdmin} className="ai-contact-simple-form">
              <span className="ai-form-prompt">Gửi yêu cầu / câu hỏi tới Quản trị viên:</span>

              {contactSuccess && (
                <div className="ai-status-alert is-success">
                  <CheckCircle2 size={14} />
                  <span>{contactSuccess}</span>
                </div>
              )}

              {errorMessage && (
                <div className="ai-status-alert is-error">
                  <AlertCircle size={14} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="ai-input-grid-2">
                <input
                  type="text"
                  placeholder="Họ tên của Quý khách..."
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="ai-input-glass"
                />
                <input
                  type="text"
                  placeholder="Số điện thoại hoặc Email..."
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="ai-input-glass"
                  required
                />
              </div>

              <textarea
                rows={3}
                placeholder="Nhập nội dung Quý khách cần Ban Quản lý hỗ trợ..."
                value={contactNote}
                onChange={(e) => setContactNote(e.target.value)}
                className="ai-input-glass ai-textarea-glass"
                required
              />

              <button
                type="submit"
                disabled={contactSubmitting || !contactNote.trim()}
                className="ai-btn-gold-submit"
              >
                {contactSubmitting ? (
                  <>
                    <Loader2 size={14} className="spin" />
                    <span>Đang chuyển tin nhắn...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Gửi tin nhắn đến Ban Quản lý</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* KHÔNG GIAN HỘI THOẠI AI */
          <div className="ai-widget-chat-pane">
            <div className="ai-chat-stream">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`ai-stream-row ${msg.role === 'user' ? 'is-user-msg' : 'is-bot-msg'}`}
                >
                  {msg.role === 'model' && (
                    <div className="ai-bot-avatar-tiny">
                      <Bot size={13} />
                    </div>
                  )}

                  <div className="ai-bubble-col">
                    <div className="ai-chat-bubble">
                      <div className="ai-bubble-content">{msg.text}</div>

                      {/* Phòng 360 liên quan */}
                      {msg.relatedRooms && msg.relatedRooms.length > 0 && (
                        <div className="ai-bubble-attach">
                          <span className="ai-attach-title">
                            <Compass size={12} />
                            Gian phòng 360° liên quan:
                          </span>
                          <div className="ai-attach-chips">
                            {msg.relatedRooms.map((rm) => (
                              <button
                                key={rm.id}
                                type="button"
                                className="ai-attach-pill"
                                onClick={() => {
                                  onClose();
                                  if (onOpenRoomTour) onOpenRoomTour(rm.id);
                                }}
                              >
                                <span>{rm.name}</span>
                                <ArrowRight size={11} />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cổ vật liên quan */}
                      {msg.relatedArtifacts && msg.relatedArtifacts.length > 0 && (
                        <div className="ai-bubble-attach">
                          <span className="ai-attach-title">
                            <Crown size={12} />
                            Hiện vật được đề cập:
                          </span>
                          <div className="ai-attach-chips">
                            {msg.relatedArtifacts.map((art) => (
                              <span key={art.id} className="ai-attach-static">
                                {art.name} {art.period ? `(${art.period})` : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Câu hỏi gợi ý dưới tin nhắn bot */}
                    {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                      <div className="ai-followup-chips">
                        {msg.suggestedQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="ai-followup-pill"
                            onClick={() => handleSendMessage(q)}
                            disabled={isLoading}
                          >
                            <span>{q}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <span className="ai-time-label">{msg.createdAt}</span>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="ai-stream-row is-bot-msg">
                  <div className="ai-bot-avatar-tiny">
                    <Bot size={13} />
                  </div>
                  <div className="ai-bubble-col">
                    <div className="ai-chat-bubble ai-loading-bubble">
                      <div className="ai-dots-bounce">
                        <span />
                        <span />
                        <span />
                      </div>
                      <span className="ai-thinking-text">Đang truy vấn CSDL Bảo tàng...</span>
                    </div>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="ai-status-alert is-error" style={{ margin: '6px 0' }}>
                  <AlertCircle size={13} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* KHUNG NHẬP LIỆU GỌN GÀNG ĐỒNG BỘ MÀU BẢO TÀNG */}
            <div className="ai-widget-input-footer">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="ai-footer-form"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    selectedTopic === 'artifacts'
                      ? 'Hỏi về niên đại, hoa văn, hiện vật 3D...'
                      : selectedTopic === 'rooms'
                        ? 'Hỏi về phòng trưng bày, tour 360°...'
                        : selectedTopic === 'tickets_info'
                          ? 'Hỏi về giá vé, giờ mở cửa, gửi xe...'
                          : 'Nhập câu hỏi của Quý khách về bảo tàng...'
                  }
                  className="ai-footer-input"
                  disabled={isLoading}
                  maxLength={500}
                />

                <button
                  type="submit"
                  disabled={isLoading || !inputText.trim() || cooldownRemaining > 0}
                  className="ai-footer-send-btn"
                  title={cooldownRemaining > 0 ? `Đợi ${cooldownRemaining}s` : 'Gửi'}
                >
                  {isLoading ? (
                    <Loader2 size={15} className="spin" />
                  ) : cooldownRemaining > 0 ? (
                    <span className="ai-cooldown-count">{cooldownRemaining}s</span>
                  ) : (
                    <Send size={15} />
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
