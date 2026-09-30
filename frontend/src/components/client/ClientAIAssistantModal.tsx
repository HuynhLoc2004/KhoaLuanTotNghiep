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

export const ClientAIAssistantModal: React.FC<ClientAIAssistantModalProps> = ({
  isOpen,
  onClose,
  onOpenRoomTour,
  onSelectArtifact,
  allRooms = []
}) => {
  const { branding } = useSystemBranding();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lời chào mở đầu gọn gàng, tinh tế
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: `Kính chào Quý khách! Tôi là Trợ lý AI của ${branding.shortName || 'Bảo tàng Lịch sử'}.\nQuý khách muốn tìm hiểu cổ vật, phòng 360° hay thông tin tham quan?`,
          createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          suggestedQuestions: [
            'Giá vé & giờ mở cửa?',
            'Phòng 360° nổi bật?',
            'Bảo vật quốc gia?'
          ]
        }
      ]);
    }
  }, [branding.shortName]);

  // Tự động cuộn xuống cuối
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus ô nhập khi mở
  useEffect(() => {
    if (isOpen && window.innerWidth > 768) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

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

      const res: AIChatResponse = await api.sendAIChat(query, 'general', historyPayload);

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

  // Làm mới hội thoại
  const handleResetChat = () => {
    setMessages([
      {
        id: 'reset-' + Date.now(),
        role: 'model',
        text: `Cuộc trò chuyện đã được làm mới. Tôi sẵn sàng hỗ trợ Quý khách giải đáp về ${branding.shortName || 'Bảo tàng Lịch sử'}.`,
        createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: [
          'Giá vé & giờ mở cửa?',
          'Khám phá phòng 360° nổi bật',
          'Tra cứu bảo vật quốc gia'
        ]
      }
    ]);
    setErrorMessage(null);
  };

  return (
    <div className="ai-widget-backdrop" onClick={onClose}>
      <div className="ai-widget-window" onClick={(e) => e.stopPropagation()}>
        {/* HEADER GIAO DIỆN BẢO TÀNG SỐ ĐỒNG BỘ CLIENT */}
        <div className="ai-widget-header">
          <div className="ai-widget-header-brand">
            <div className="ai-brand-avatar">
              <Bot size={15} />
            </div>
            <div className="ai-brand-text">
              <span className="ai-brand-title">Trợ Lý Bảo Tàng</span>
              <span className="ai-brand-desc">
                {branding.shortName || 'Bảo tàng Lịch sử TP.HCM'} • Hỗ trợ trực tuyến
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
              <X size={15} />
            </button>
          </div>
        </div>

        {/* KHÔNG GIAN HỘI THOẠI AI CHÍNH THỨC */}
        <div className="ai-widget-chat-pane">
          <div className="ai-chat-stream">
              {messages.map((msg, mIdx) => (
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

                    {/* Câu hỏi gợi ý dưới tin nhắn bot - chỉ hiện cho tin nhắn mới nhất để không choán màn hình */}
                    {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && mIdx === messages.length - 1 && (
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
                  placeholder="Nhập câu hỏi của Quý khách về bảo tàng..."
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
      </div>
    </div>
  );
};
