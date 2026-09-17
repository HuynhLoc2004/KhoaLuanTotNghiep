import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '..', '.env') });
dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || 'huynhtanlocpp09@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'csvopdsnfnonsuxy';
const SMTP_FROM = process.env.SMTP_FROM || `"Bảo Tàng Lịch Sử TP.HCM" <${SMTP_USER}>`;

// Khởi tạo Transporter gửi email
export const mailTransporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

/**
 * Gửi email thông báo / đặt lịch tham quan / liên hệ
 */
export const sendMail = async ({
  to,
  subject,
  html,
  text
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const info = await mailTransporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      html
    });
    console.log(`[Mail Service] Đã gửi email thành công tới ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[Mail Service Error]:`, err);
    return { success: false, error: err.message };
  }
};

/**
 * Gửi email thông báo hệ thống đã xử lý xong chùm ảnh 360
 */
export const sendStitchCompletionEmail = async (
  toEmail: string,
  roomTitle: string,
  panoramaUrl: string
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
        🏛️ Bảo Tàng Lịch Sử TP. Hồ Chí Minh - Hệ Thống Tour 360°
      </h2>
      <p>Xin chào quản trị viên,</p>
      <p>Không gian 360° cho gian phòng <strong>"${roomTitle}"</strong> đã được thuật toán OpenCV ghép nối thành công và lưu trữ an toàn trên Cloudinary CDN!</p>
      
      <div style="margin: 20px 0; text-align: center;">
        <a href="${panoramaUrl}" target="_blank" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          🔍 Xem Ảnh Toàn Cảnh 360° (Cloudinary)
        </a>
      </div>

      <p style="font-size: 12px; color: #64748b;">URL Ảnh: <a href="${panoramaUrl}">${panoramaUrl}</a></p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 11px; color: #94a3b8; text-align: center;">
        Hệ thống Tự động hóa Tour 360° - Khóa luận Tốt nghiệp Ứng dụng Công nghệ 4.0 & AI trong Bảo tồn Di sản
      </p>
    </div>
  `;

  return sendMail({
    to: toEmail,
    subject: `[Bảo Tàng 360°] Ghép hoàn tất không gian: ${roomTitle}`,
    html
  });
};

export const verifyMailConnection = async (): Promise<boolean> => {
  try {
    await mailTransporter.verify();
    return true;
  } catch {
    return false;
  }
};
