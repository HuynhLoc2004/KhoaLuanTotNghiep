import QRCode from 'qrcode';

/**
 * Sinh mã QR code dạng Data URL (chuỗi base64 hiển thị trực tiếp trên web/mobile)
 */
export async function generateQRCodeDataURL(text: string, width = 300): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width,
      margin: 2,
      color: {
        dark: '#111827',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err: any) {
    console.error('[QR Service] Lỗi tạo QRCode DataURL:', err.message);
    throw err;
  }
}

/**
 * Sinh mã QR code dạng PNG Buffer (phục vụ download file in ấn độ phân giải cao)
 */
export async function generateQRCodeBuffer(text: string, width = 800): Promise<Buffer> {
  try {
    return await QRCode.toBuffer(text, {
      width,
      margin: 2,
      color: {
        dark: '#111827',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });
  } catch (err: any) {
    console.error('[QR Service] Lỗi tạo QRCode Buffer:', err.message);
    throw err;
  }
}
