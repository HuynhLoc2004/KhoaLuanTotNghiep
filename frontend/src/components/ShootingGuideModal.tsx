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
        style={{ maxWidth: 580 }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Camera size={18} style={{ color: 'var(--primary)' }} />
            <h2 className="modal-title">Hướng dẫn kỹ thuật chụp ảnh 360°</h2>
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
              <span>Nguyên tắc cốt lõi: Đứng yên làm trụ tại tâm phòng</span>
            </div>
            <p className="guide-principle-desc">
              Không bước di chuyển chân khi chụp. Khi bạn bước đi, khoảng cách giữa các vật thể thay đổi tạo ra sai lệch góc nhìn (thị sai), làm méo hình. Giữ nguyên 2 chân tại chỗ và chỉ xoay thân người là bí quyết để có không gian chuẩn kiến trúc.
            </p>
          </div>

          {/* 3 Bước thực hiện */}
          <div className="guide-steps-list">
            <div className="guide-step-item">
              <div className="guide-step-badge">1</div>
              <div className="guide-step-info">
                <div className="guide-step-heading">Chọn vị trí trung tâm</div>
                <div className="guide-step-text">
                  Đứng ở khoảng giữa gian phòng, giữ điện thoại ngang tầm ngực và giữ máy cân bằng thẳng đứng.
                </div>
              </div>
            </div>

            <div className="guide-step-item">
              <div className="guide-step-badge">2</div>
              <div className="guide-step-info">
                <div className="guide-step-heading">Xoay người tại chỗ ~30° mỗi góc</div>
                <div className="guide-step-text">
                  Chụp một tấm, sau đó nhích xoay người sang bên một góc nhỏ (~30°) để chụp tiếp. Bạn chỉ cần khoảng 8 đến 12 góc là phủ trọn 360° gian phòng.
                </div>
              </div>
            </div>

            <div className="guide-step-item">
              <div className="guide-step-badge">3</div>
              <div className="guide-step-info">
                <div className="guide-step-heading">Tận dụng chế độ Pano có sẵn</div>
                <div className="guide-step-text">
                  Nếu bạn dùng điện thoại, mở camera mặc định chọn chế độ <strong>Panorama</strong> rồi lia tròn 360°. Sau đó nhấn nút <strong>"Chọn từ máy"</strong> để tải tấm ảnh Pano lên hệ thống.
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
                <strong>Trên máy tính & Android:</strong> Bấm vào biểu tượng ổ khóa bên trái đường link trình duyệt → Quyền cho trang web → Bật Máy ảnh thành <em>Cho phép</em>.
              </li>
              <li>
                <strong>Trên iPhone / iPad:</strong> Vào Cài đặt máy → Chọn ứng dụng Safari (hoặc Chrome) → Mục Camera → Chọn <em>Cho phép</em>.
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
            <span>Đã nắm rõ & Bắt đầu chụp</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
