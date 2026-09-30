import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Crown,
  Compass,
  Ticket,
  Headphones,
  MessageSquare,
  Loader2,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock
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

type AITopicKey = 'artifacts' | 'rooms' | 'tickets_info' | 'general' | 'contact_admin';

interface TopicOptionDef {
  id: AITopicKey;
  label: string;
  subLabel: string;
  icon: React.ReactNode;
}

const TOPIC_RADIO_OPTIONS: TopicOptionDef[] = [
  {
    id: 'artifacts',
    label: 'Cổ vật & Hiện vật',
    subLabel: 'Niên đại, thông tin & 3D',
    icon: <Crown size={15} />
  },
  {
    id: 'rooms',
    label: 'Không gian 360°',
    subLabel: 'Khám phá các phòng trưng bày',
    icon: <Compass size={15} />
  },
  {
    id: 'tickets_info',
    label: 'Vé & Tham quan',
    subLabel: 'Giờ mở cửa, giá vé, bãi xe',
    icon: <Ticket size={15} />
  },
  {
    id: 'general',
    label: 'Hỏi đáp tự do',
    subLabel: 'Lịch sử và văn hóa',
    icon: <Sparkles size={15} />
  },
  {
    id: 'contact_admin',
    label: 'Liên hệ Ban Quản lý',
    subLabel: 'Kết nối trực tiếp quản trị viên',
    icon: <Headphones size={15} />
  }
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

  // Form liên hệ trực tiếp Ban Quản lý
  const [contactName, setContactName] = useState('');
  const [contactPhoneEmail, setContactPhoneEmail] = useState('');
  const [contactContent, setContactContent] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccessMessage, setContactSuccessMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Khởi tạo lời chào ban đầu của Trợ lý AI
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-msg',
          role: 'model',
          text: `Xin kính chào Quý khách! Tôi là Trợ lý Di sản Ảo của ${branding.museumName || 'Bảo tàng Lịch sử TP. Hồ Chí Minh'}.\n\nTôi có thể hỗ trợ Quý khách tra cứu thông tin cổ vật, niên đại lịch sử, trải nghiệm tour thực tế ảo 360° các gian phòng hoặc cung cấp thông tin giờ mở cửa, giá vé và hướng dẫn tham quan.\n\nQuý khách vui lòng chọn một chủ đề bên trên hoặc đặt câu hỏi tự do bất kỳ!`,
          createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          suggestedQuestions: [
            'Bảo tàng có những phòng trưng bày 360° nào?',
            'Giờ mở cửa và giá vé tham quan là bao nhiêu?',
            'Những bảo vật quốc gia tiêu biểu đang trưng bày?'
          ]
        }
      ]);
    }
  }, [branding.museumName]);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Tự động focus ô nhập khi mở modal (trừ khi trên thiết bị di động để tránh bật bàn phím đột ngột)
  useEffect(() => {
    if (isOpen && window.innerWidth > 768) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Bộ đếm lùi thời gian hồi phục chống spam (Cooldown Timer)
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  if (!isOpen) return null;

  // Gửi câu hỏi đến Backend AI Service
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

    // Kích hoạt cooldown 3 giây chống spam
    setCooldownRemaining(3);

    try {
      // Chuẩn bị lịch sử rút gọn
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res: AIChatResponse = await api.sendAIChat(query, selectedTopic, historyPayload);

      const aiReply: AIChatMessage = {
        id: 'ai-' + Date.now(),
        role: 'model',
        text: res.reply || 'Cảm ơn Quý khách đã đặt câu hỏi. Quý khách có muốn tìm hiểu thêm thông tin nào khác không?',
        createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: res.suggestedQuestions,
        relatedRooms: res.relatedRooms,
        relatedArtifacts: res.relatedArtifacts
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Hệ thống đang bận. Vui lòng thử lại sau giây lát.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý gửi tin nhắn trực tiếp đến Ban Quản Lý (khi chọn radio Liên hệ Ban Quản lý)
  const handleSubmitContactAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactContent.trim() || contactSubmitting) return;

    setContactSubmitting(true);
    setContactSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await api.sendAIContactAdmin({
        visitorName: contactName.trim() || 'Khách tham quan',
        visitorContact: contactPhoneEmail.trim(),
        message: contactContent.trim(),
        topic: 'contact_admin'
      });

      setContactSuccessMessage(res.message || 'Đã chuyển yêu cầu thành công đến Ban Quản lý!');
      setContactContent('');

      // Thêm thông báo phản hồi vào luồng chat
      setMessages((prev) => [
        ...prev,
        {
          id: 'admin-contact-ack-' + Date.now(),
          role: 'model',
          text: `✅ **Đã tiếp nhận yêu cầu gửi Ban Quản lý**\n\nNội dung của Quý khách đã được chuyển trực tiếp tới hòm thư quản trị viên của bảo tàng. Quản trị viên sẽ liên hệ lại với Quý khách qua thông tin "${contactPhoneEmail || 'đã cung cấp'}" trong thời gian sớm nhất.\n\nHotline hỗ trợ trực tiếp: **${branding.hotline || '(028) 3829 8146'}**`,
          createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể gửi tin nhắn đến Ban Quản lý lúc này.');
    } finally {
      setContactSubmitting(false);
    }
  };

  // Làm mới cuộc trò chuyện
  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset-' + Date.now(),
        role: 'model',
        text: `Cuộc trò chuyện đã được làm mới. Tôi sẵn sàng hỗ trợ Quý khách giải đáp các thắc mắc về ${branding.shortName || 'Bảo tàng Lịch sử'}.`,
        createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: [
          'Giá vé và khung giờ mở cửa tham quan?',
          'Khám phá gian phòng 360° nổi bật',
          'Tra cứu bảo vật lịch sử'
        ]
      }
    ]);
    setErrorMessage(null);
    setContactSuccessMessage(null);
  };

  return (
    <div className="ai-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="ai-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* HEADER TRANG TRỌNG THEO PHONG CÁCH BẢO TÀNG */}
        <div className="ai-modal-header">
          <div className="ai-modal-header-left">
            <div className="ai-avatar-badge">
              <Bot size={22} className="ai-avatar-icon" />
              <span className="ai-status-pulse" />
            </div>
            <div>
              <div className="ai-header-title-row">
                <h3 className="ai-header-title">Trợ Lý Di Sản Ảo</h3>
                <span className="ai-header-badge">AI Assistant</span>
              </div>
              <p className="ai-header-sub">
                {branding.shortName || 'Bảo tàng Lịch sử TP. Hồ Chí Minh'} • Hỏi đáp dữ liệu thực tế
              </p>
            </div>
          </div>

          <div className="ai-modal-header-actions">
            <button
              type="button"
              className="ai-header-btn"
              onClick={handleResetChat}
              title="Làm mới cuộc trò chuyện"
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              className="ai-header-btn ai-close-btn"
              onClick={onClose}
              title="Đóng cửa sổ"
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* BỘ CHỌN CHỦ ĐỀ: CHÍNH XÁC LÀ CHECK RADIO (KHÔNG CHECKBOX) THEO YÊU CẦU */}
        <div className="ai-topic-selection-section">
          <div className="ai-topic-header-label">
            <span>Chọn chủ đề cần hỗ trợ:</span>
            <span className="ai-topic-note">(Chọn 1 danh mục để trợ lý trả lời chính xác nhất)</span>
          </div>

          <div className="ai-radio-group" role="radiogroup" aria-label="Chủ đề hỏi đáp AI">
            {TOPIC_RADIO_OPTIONS.map((opt) => {
              const isChecked = selectedTopic === opt.id;
              return (
                <label
                  key={opt.id}
                  className={`ai-radio-card ${isChecked ? 'is-selected' : ''}`}
                  htmlFor={`ai-radio-${opt.id}`}
                >
                  <input
                    type="radio"
                    id={`ai-radio-${opt.id}`}
                    name="ai_assistant_topic"
                    value={opt.id}
                    checked={isChecked}
                    onChange={() => setSelectedTopic(opt.id)}
                    className="ai-radio-input"
                  />
                  <div className="ai-radio-custom-indicator">
                    <span className="ai-radio-dot" />
                  </div>
                  <div className="ai-radio-content">
                    <div className="ai-radio-title-row">
                      <span className="ai-radio-icon">{opt.icon}</span>
                      <strong className="ai-radio-title">{opt.label}</strong>
                    </div>
                    <span className="ai-radio-sub">{opt.subLabel}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* NỘI DUNG CHÍNH: NẾU CHỌN RADIO 'LIÊN HỆ BAN QUẢN LÝ' THÌ HIỆN BẢNG LIÊN HỆ TRỰC TIẾP */}
        {selectedTopic === 'contact_admin' ? (
          <div className="ai-contact-admin-view">
            <div className="ai-contact-info-card">
              <div className="ai-contact-info-header">
                <Headphones size={20} style={{ color: 'var(--accent-gold, #c5a880)' }} />
                <h4>Kênh Thông Tin Liên Hệ Ban Quản Lý</h4>
              </div>
              <p className="ai-contact-info-desc">
                Quý khách có thể liên hệ trực tiếp với bộ phận điều hành & thuyết minh của Bảo tàng qua các kênh sau:
              </p>
              <div className="ai-contact-channels-grid">
                <div className="ai-contact-channel-item">
                  <Phone size={15} />
                  <div>
                    <span className="ai-channel-label">Hotline tiếp đón</span>
                    <strong className="ai-channel-val">{branding.hotline || '(028) 3829 8146'}</strong>
                  </div>
                </div>
                <div className="ai-contact-channel-item">
                  <Mail size={15} />
                  <div>
                    <span className="ai-channel-label">Hộp thư hỗ trợ</span>
                    <strong className="ai-channel-val">{branding.contactEmail || 'btls.tphcm@gmail.com'}</strong>
                  </div>
                </div>
                <div className="ai-contact-channel-item">
                  <MapPin size={15} />
                  <div>
                    <span className="ai-channel-label">Văn phòng tại bảo tàng</span>
                    <span className="ai-channel-val">{branding.address || 'Số 2 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM'}</span>
                  </div>
                </div>
                <div className="ai-contact-channel-item">
                  <Clock size={15} />
                  <div>
                    <span className="ai-channel-label">Giờ tiếp khách</span>
                    <span className="ai-channel-val">08:00 - 11:30 | 13:00 - 17:00 (Thứ 3 - Chủ Nhật)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FORM GỬI TIN NHẮN TỚI BAN QUẢN LÝ */}
            <form onSubmit={handleSubmitContactAdmin} className="ai-contact-form">
              <h5>Gửi Tin Nhắn / Yêu Cầu Trực Tiếp Đến Quản Trị Viên</h5>

              {contactSuccessMessage && (
                <div className="ai-alert-box ai-alert-success">
                  <CheckCircle2 size={16} />
                  <span>{contactSuccessMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="ai-alert-box ai-alert-error">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="ai-contact-form-row">
                <div className="ai-contact-field">
                  <label>Họ và tên của Quý khách:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="ai-contact-input"
                  />
                </div>
                <div className="ai-contact-field">
                  <label>Số điện thoại hoặc Email liên hệ:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 0901234567 hoặc email@domain.com"
                    value={contactPhoneEmail}
                    onChange={(e) => setContactPhoneEmail(e.target.value)}
                    className="ai-contact-input"
                    required
                  />
                </div>
              </div>

              <div className="ai-contact-field">
                <label>Nội dung câu hỏi / yêu cầu hợp tác / đặt đoàn tham quan:</label>
                <textarea
                  rows={3}
                  placeholder="Quý khách vui lòng mô tả nội dung cần hỗ trợ..."
                  value={contactContent}
                  onChange={(e) => setContactContent(e.target.value)}
                  className="ai-contact-textarea"
                  required
                />
              </div>

              <div className="ai-contact-actions">
                <button
                  type="submit"
                  disabled={contactSubmitting || !contactContent.trim()}
                  className="btn btn-primary ai-submit-btn"
                >
                  {contactSubmitting ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      <span>Đang chuyển tin nhắn...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Gửi tin nhắn đến Ban Quản lý</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* KHÔNG GIAN TRÒ CHUYỆN HỎI ĐÁP AI */
          <div className="ai-chat-body">
            <div className="ai-messages-scroll-area">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`ai-message-row ${msg.role === 'user' ? 'is-user' : 'is-model'}`}
                >
                  {msg.role === 'model' && (
                    <div className="ai-msg-avatar">
                      <Bot size={15} />
                    </div>
                  )}

                  <div className="ai-msg-bubble-wrap">
                    <div className="ai-msg-bubble">
                      <div className="ai-msg-text">{msg.text}</div>

                      {/* Hiển thị các liên kết phòng trưng bày liên quan nếu có */}
                      {msg.relatedRooms && msg.relatedRooms.length > 0 && (
                        <div className="ai-related-items-box">
                          <span className="ai-related-title">
                            <Compass size={13} />
                            Khám phá không gian liên quan:
                          </span>
                          <div className="ai-related-tags">
                            {msg.relatedRooms.map((rm) => (
                              <button
                                key={rm.id}
                                type="button"
                                className="ai-chip-link"
                                onClick={() => {
                                  onClose();
                                  if (onOpenRoomTour) onOpenRoomTour(rm.id);
                                }}
                              >
                                <span>{rm.name}</span>
                                <ArrowRight size={12} />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Hiển thị các hiện vật liên quan nếu có */}
                      {msg.relatedArtifacts && msg.relatedArtifacts.length > 0 && (
                        <div className="ai-related-items-box">
                          <span className="ai-related-title">
                            <Crown size={13} />
                            Hiện vật được đề cập:
                          </span>
                          <div className="ai-related-tags">
                            {msg.relatedArtifacts.map((art) => (
                              <span key={art.id} className="ai-chip-static">
                                <strong>{art.name}</strong>
                                {art.period ? ` (${art.period})` : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Gợi ý câu hỏi nhanh dưới tin nhắn của AI */}
                    {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                      <div className="ai-suggestions-row">
                        {msg.suggestedQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="ai-suggestion-chip"
                            onClick={() => handleSendMessage(q)}
                            disabled={isLoading}
                          >
                            <MessageSquare size={12} />
                            <span>{q}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <span className="ai-msg-time">{msg.createdAt}</span>
                  </div>
                </div>
              ))}

              {/* Trạng thái AI đang chuẩn bị câu trả lời */}
              {isLoading && (
                <div className="ai-message-row is-model">
                  <div className="ai-msg-avatar">
                    <Bot size={15} />
                  </div>
                  <div className="ai-msg-bubble-wrap">
                    <div className="ai-msg-bubble is-loading-bubble">
                      <div className="ai-typing-indicator">
                        <span className="dot" />
                        <span className="dot" />
                        <span className="dot" />
                      </div>
                      <span className="ai-loading-text">
                        Trợ lý đang truy vấn dữ liệu bảo tàng...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Thông báo lỗi nếu có */}
              {errorMessage && (
                <div className="ai-alert-box ai-alert-error" style={{ margin: '8px 0' }}>
                  <AlertCircle size={15} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* THANH NHẬP LIỆU CÂU HỎI Ở ĐÁY VỚI CHỐNG SPAM VÀ COOLDOWN */}
            <div className="ai-chat-input-bar">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="ai-input-form"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    selectedTopic === 'artifacts'
                      ? 'Hỏi về niên đại, ý nghĩa hoặc thông tin cổ vật...'
                      : selectedTopic === 'rooms'
                        ? 'Hỏi về gian phòng trưng bày hoặc tour thực tế ảo 360°...'
                        : selectedTopic === 'tickets_info'
                          ? 'Hỏi về giá vé, giờ mở cửa, tuyến xe buýt hoặc bãi gửi xe...'
                          : 'Nhập câu hỏi của Quý khách về di sản bảo tàng...'
                  }
                  className="ai-chat-input"
                  disabled={isLoading}
                  maxLength={500}
                />

                <button
                  type="submit"
                  disabled={isLoading || !inputText.trim() || cooldownRemaining > 0}
                  className="btn btn-primary ai-send-btn"
                  title={cooldownRemaining > 0 ? `Vui lòng đợi ${cooldownRemaining}s` : 'Gửi câu hỏi'}
                >
                  {isLoading ? (
                    <Loader2 size={16} className="spin" />
                  ) : cooldownRemaining > 0 ? (
                    <span className="ai-cooldown-num">{cooldownRemaining}s</span>
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </form>
              <div className="ai-input-hint">
                <span>Dữ liệu được xác thực trực tiếp từ CSDL Bảo tàng • Tốc độ phản hồi tức thì</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
