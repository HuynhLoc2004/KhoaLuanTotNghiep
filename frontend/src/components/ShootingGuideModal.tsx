import React from 'react';
import { X, Camera, RotateCw, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface ShootingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShootingGuideModal: React.FC<ShootingGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card shooting-guide-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 580, width: '100%' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Camera size={18} style={{ color: 'var(--primary)' }} />
            <h2 className="modal-title">Hướng dẫn tạo ảnh không gian 360° (Video & Ảnh)</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Đóng hướng dẫn"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Nguyên tắc cốt lõi */}
          <div className="guide-principle-card">
            <div className="guide-principle-title">
              <CheckCircle2 size={17} style={{ color: 'var(--success)' }} />
              <span>Nguyên tắc vàng: Đứng yên làm trụ tại tâm phòng</span>
            </div>
            <p className="guide-principle-desc">
              Giữ cố định vị trí đứng ở chính giữa gian phòng, chỉ xoay thân người khi quay hoặc chụp. Tuyệt đối không bước chân di chuyển qua lại để các góc nhìn đồng trục, giúp ảnh 360° liền mạch và không bị méo lệch.
            </p>
          </div>

          {/* 3 Phương pháp thực hiện */}
          <div className="guide-steps-list">
            <div className="guide-step-item">
              <div className="guide-step-badge">1</div>
              <div className="guide-step-info">
                <div className="guide-step-heading">Cách 1 (Nhanh nhất): Quay video quét phòng</div>
                <div className="guide-step-text">
                  Đứng ở giữa phòng, cầm điện thoại ngang ngực. Bấm quay video và xoay người chậm rãi, đều tay trọn một vòng 360° (khoảng 15 – 30 giây). Bấm nút <strong>"Tải Video quét phòng"</strong>, kiểm tra và xác nhận tải lên để hệ thống tự động lọc các khung hình đẹp nhất.
                </div>
              </div>
            </div>

            <div className="guide-step-item">
              <div className="guide-step-badge">2</div>
              <div className="guide-step-info">
                <div className="guide-step-heading">Cách 2: Chụp từng góc ảnh (Điện thoại hoặc Webcam)</div>
                <div className="guide-step-text">
                  Đứng yên tại chỗ, chụp một tấm rồi nhích xoay người sang bên một góc nhỏ (~30°) để chụp tiếp cho đến khi đủ một vòng tròn (khoảng 8 – 24 tấm). Chọn <strong>"Chọn từ máy"</strong> hoặc <strong>"Chụp bằng webcam"</strong> để nạp ảnh.
                </div>
              </div>
            </div>

            <div className="guide-step-item">
              <div className="guide-step-badge">3</div>
              <div className="guide-step-info">
                <div className="guide-step-heading">Cách 3: Tải ảnh Panorama chụp sẵn</div>
                <div className="guide-step-text">
                  Nếu điện thoại của bạn có chế độ chụp <strong>Panorama</strong> hoặc bạn dùng camera 360° chuyên dụng, hãy chụp một tấm ảnh toàn cảnh rồi bấm <strong>"Chọn từ máy"</strong> để tải trực tiếp lên.
                </div>
              </div>
            </div>
          </div>

          {/* Hướng dẫn mở quyền Camera */}
          <div className="guide-permission-box">
            <div className="guide-permission-header">
              <ShieldCheck size={16} style={{ color: 'var(--accent-gold)' }} />
              <span>Cách bật quyền Camera nếu trình duyệt chặn</span>
            </div>
            <ul className="guide-permission-list">
              <li>
                <strong>Trên máy tính & Android:</strong> Bấm vào biểu tượng ổ khóa bên trái thanh địa chỉ trình duyệt → Quyền trang web → Bật Máy ảnh thành <em>Cho phép</em>.
              </li>
              <li>
                <strong>Trên iPhone / iPad:</strong> Vào Cài đặt máy → Chọn Safari (hoặc Chrome) → Mục Camera → Chọn <em>Cho phép</em>.
              </li>
            </ul>
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '16px 20px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
            style={{ width: '100%', justifyContent: 'center', padding: '12px 32px', fontSize: '14px', fontWeight: 600, gap: 8 }}
          >
            <span>Đã nắm rõ & Bắt đầu thực hiện</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
