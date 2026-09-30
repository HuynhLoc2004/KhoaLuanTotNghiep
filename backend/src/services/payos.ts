import { PayOS } from '@payos/node';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '..', '.env') });
dotenv.config();

const clientId = process.env.PAYOS_CLIENT_ID || '';
const apiKey = process.env.PAYOS_API_KEY || '';
const checksumKey = process.env.PAYOS_CHECKSUM_KEY || '';

let payosInstance: PayOS | null = null;

if (clientId && apiKey && checksumKey) {
  try {
    payosInstance = new PayOS({
      clientId,
      apiKey,
      checksumKey
    });
    console.log('[PayOS] Cổng thanh toán PayOS đã khởi tạo thành công với Client ID:', clientId.slice(0, 8) + '...');
  } catch (err: any) {
    console.error('[PayOS Init Error]:', err.message);
  }
} else {
  console.warn('[PayOS Warning] Chưa cấu hình đủ PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY trong .env');
}

export const isPayOSConfigured = (): boolean => {
  return payosInstance !== null;
};

export interface PayOSCreateLinkParams {
  orderCode: number;
  amount: number;
  description: string;
  cancelUrl: string;
  returnUrl: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  expiredAt?: number; // Unix timestamp in seconds
}

/**
 * Tạo link thanh toán PayOS (VietQR)
 */
export const createPayOSPaymentLink = async (params: PayOSCreateLinkParams) => {
  if (!payosInstance) {
    throw new Error('Cổng thanh toán PayOS chưa được cấu hình khóa API trong hệ thống.');
  }

  // PayOS giới hạn độ dài description tối đa 25 ký tự
  let cleanDesc = (params.description || `Ve ${params.orderCode}`)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim();
  if (cleanDesc.length > 25) {
    cleanDesc = cleanDesc.slice(0, 25);
  }

  const paymentData: any = {
    orderCode: params.orderCode,
    amount: params.amount,
    description: cleanDesc || `Ve ${params.orderCode}`,
    cancelUrl: params.cancelUrl,
    returnUrl: params.returnUrl,
    items: params.items || [],
    buyerName: params.buyerName,
    buyerEmail: params.buyerEmail,
    buyerPhone: params.buyerPhone,
    expiredAt: params.expiredAt
  };

  return await payosInstance.paymentRequests.create(paymentData);
};

/**
 * Xác thực dữ liệu webhook nhận từ PayOS
 */
export const verifyPayOSWebhook = (webhookBody: any) => {
  if (!payosInstance) {
    throw new Error('PayOS chưa được cấu hình');
  }
  return payosInstance.webhooks.verify(webhookBody);
};

/**
 * Tra cứu thông tin thanh toán theo mã đơn hàng
 */
export const getPayOSPaymentInfo = async (orderCode: number) => {
  if (!payosInstance) {
    throw new Error('PayOS chưa được cấu hình');
  }
  return await payosInstance.paymentRequests.get(orderCode);
};

/**
 * Hủy link thanh toán PayOS
 */
export const cancelPayOSPaymentLink = async (orderCode: number, reason: string = 'Đơn hàng hết hạn thanh toán') => {
  if (!payosInstance) return null;
  try {
    return await payosInstance.paymentRequests.cancel(orderCode, reason);
  } catch (err: any) {
    // Nếu link đã hủy hoặc đã hết hạn thì bỏ qua
    return null;
  }
};
