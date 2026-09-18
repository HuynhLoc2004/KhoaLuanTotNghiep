import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Sinh chuỗi Base64 Data URL (image/png) từ URL hoặc text
 */
export const generateQRCodeDataUrl = async (
  text: string,
  options: QRCodeOptions = {}
): Promise<string> => {
  const defaultOpts = {
    width: options.width || 400,
    margin: options.margin || 2,
    color: {
      dark: options.color?.dark || '#8B1818', // Màu đỏ thắm hoàng gia của Bảo tàng
      light: options.color?.light || '#FFFFFF'
    },
    errorCorrectionLevel: 'H' as const // High error correction để quét dễ dàng dù in nhỏ
  };

  return await QRCode.toDataURL(text, defaultOpts);
};

/**
 * Sinh Buffer ảnh PNG chất lượng cao phục vụ việc tải về in ấn
 */
export const generateQRCodeBuffer = async (
  text: string,
  width: number = 800
): Promise<Buffer> => {
  return await QRCode.toBuffer(text, {
    width,
    margin: 3,
    color: {
      dark: '#8B1818',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'H'
  });
};

/**
 * Sinh mã SVG vector
 */
export const generateQRCodeSVG = async (
  text: string
): Promise<string> => {
  return await QRCode.toString(text, {
    type: 'svg',
    margin: 2,
    color: {
      dark: '#8B1818',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'H'
  });
};
