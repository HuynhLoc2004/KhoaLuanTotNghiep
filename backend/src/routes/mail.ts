import { Router, Request, Response } from 'express';
import { sendMail } from '../services/mail.js';
import { getSystemBrandingConfig } from '../models/SystemBranding.js';

export const mailRouter = Router();

/**
 * POST /api/mail/test
 * Gửi email kiểm tra kết nối SMTP
 */
mailRouter.post('/test', async (req: Request, res: Response) => {
  try {
    const branding = await getSystemBrandingConfig();
    const to = req.body.to || process.env.SMTP_USER || branding.contactEmail || 'huynhtanlocpp09@gmail.com';
    const result = await sendMail({
      to,
      subject: `✅ [Kiểm Tra Hệ Thống] Kết Nối Dịch Vụ Mail ${branding.shortName} Thành Công`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #10b981;">🎉 Dịch Vụ Email Hoạt Động Hoàn Hảo!</h2>
          <p>Xin chào quản trị viên,</p>
          <p>Hệ thống Tour 360° <strong>${branding.museumName}</strong> đã kết nối thành công với máy chủ gửi thư SMTP.</p>
          <p><strong>Thời gian kiểm tra:</strong> ${new Date().toLocaleString('vi-VN')}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8;">${branding.museumName} • ${branding.address}</p>
        </div>
      `
    });

    if (result.success) {
      res.json({ success: true, message: `Đã gửi email kiểm tra thành công tới ${to}`, messageId: result.messageId });
    } else {
      res.status(500).json({ success: false, message: 'Gửi email thất bại', error: result.error });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/mail/contact
 * Nhận thông tin liên hệ / đặt vé / câu hỏi từ khách tham quan Tour 360
 */
mailRouter.post('/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đủ tên, email và nội dung liên hệ.' });
    }

    const branding = await getSystemBrandingConfig();
    const adminEmail = process.env.SMTP_USER || branding.contactEmail || 'huynhtanlocpp09@gmail.com';
    const result = await sendMail({
      to: adminEmail,
      subject: `📩 [Liên Hệ Khách Tham Quan] Từ: ${name} (${email})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #cbd5e1; border-radius: 8px;">
          <h3 style="color: #8C2D19; margin-top: 0;">Khách Tham Quan Gửi Thư Liên Hệ</h3>
          <p><strong>Họ tên:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Số điện thoại:</strong> ${phone || 'Không cung cấp'}</p>
          <p><strong>Nội dung:</strong></p>
          <div style="background: #f8fafc; padding: 12px; border-left: 4px solid #8C2D19; border-radius: 4px;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
            Gửi từ hệ thống Tour 360° ${branding.museumName} lúc ${new Date().toLocaleString('vi-VN')}
          </p>
        </div>
      `
    });

    res.json({ success: true, message: 'Cảm ơn bạn! Thông tin liên hệ đã được chuyển tới ban quản lý bảo tàng.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});
