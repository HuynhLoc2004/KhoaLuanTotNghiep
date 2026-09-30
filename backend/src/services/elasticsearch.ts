/**
 * Dịch vụ Elasticsearch (ES) tối ưu hóa tìm kiếm & lọc nhanh vé tham quan
 * Hỗ trợ Full-Text Search, Fuzzy Search trên nhiều trường: ticketCode, userName, userEmail, userPhone
 * Tự động dự phòng (graceful fallback) nếu cụm Elasticsearch đang khởi động hoặc chưa sẵn sàng.
 */

interface TicketDoc {
  id?: string;
  ticketCode: string;
  userId?: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  ticketType: string;
  ticketTitle?: string;
  quantity?: number;
  unitPrice?: number;
  totalAmount?: number;
  visitDate: string;
  timeSlot?: string;
  status: string;
  paymentMethod?: string;
  qrCodeData?: string;
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const ES_URL = process.env.ELASTICSEARCH_URL || 'http://elasticsearch:9200';
const ES_INDEX = 'museum_tickets';

let isEsConnected = false;
let lastCheckTime = 0;

/**
 * Kiểm tra trạng thái sẵn sàng của Elasticsearch (cache kết quả 30s)
 */
export async function checkElasticsearchHealth(): Promise<boolean> {
  const now = Date.now();
  if (now - lastCheckTime < 30000 && isEsConnected) {
    return isEsConnected;
  }
  lastCheckTime = now;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${ES_URL}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      isEsConnected = true;
      await ensureTicketIndexExists();
      return true;
    }
    isEsConnected = false;
    return false;
  } catch {
    isEsConnected = false;
    return false;
  }
}

/**
 * Khởi tạo Index và Mapping chuẩn mực cho Vé tham quan
 */
async function ensureTicketIndexExists(): Promise<void> {
  try {
    const checkRes = await fetch(`${ES_URL}/${ES_INDEX}`, { method: 'HEAD' });
    if (checkRes.status === 404) {
      console.log(`[Elasticsearch] Đang khởi tạo index ${ES_INDEX} với analyzer chuẩn...`);
      await fetch(`${ES_URL}/${ES_INDEX}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            analysis: {
              analyzer: {
                ticket_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'asciifolding']
                }
              }
            }
          },
          mappings: {
            properties: {
              ticketCode: { type: 'keyword', boost: 3.0 },
              userName: { type: 'text', analyzer: 'ticket_analyzer', fields: { keyword: { type: 'keyword' } } },
              userEmail: { type: 'keyword' },
              userPhone: { type: 'keyword' },
              ticketType: { type: 'keyword' },
              visitDate: { type: 'date', format: 'yyyy-MM-dd||strict_date_optional_time||epoch_millis' },
              status: { type: 'keyword' },
              totalAmount: { type: 'integer' },
              createdAt: { type: 'date' }
            }
          }
        })
      });
      console.log(`[Elasticsearch] Đã tạo index ${ES_INDEX} thành công!`);
    }
  } catch (err: any) {
    console.warn('[Elasticsearch] Warning khi kiểm tra index:', err.message);
  }
}

/**
 * Đẩy/Cập nhật document vé vào Elasticsearch
 */
export async function esIndexTicket(ticket: TicketDoc): Promise<boolean> {
  try {
    const isReady = await checkElasticsearchHealth();
    if (!isReady) return false;

    const res = await fetch(`${ES_URL}/${ES_INDEX}/_doc/${encodeURIComponent(ticket.ticketCode)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket)
    });
    return res.ok;
  } catch (err: any) {
    console.warn('[Elasticsearch] Lỗi index vé:', err.message);
    return false;
  }
}

/**
 * Xóa document vé khỏi Elasticsearch
 */
export async function esDeleteTicket(ticketCode: string): Promise<boolean> {
  try {
    const isReady = await checkElasticsearchHealth();
    if (!isReady) return false;

    const res = await fetch(`${ES_URL}/${ES_INDEX}/_doc/${encodeURIComponent(ticketCode)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err: any) {
    console.warn('[Elasticsearch] Lỗi xóa document vé:', err.message);
    return false;
  }
}

export interface EsSearchParams {
  search?: string;
  status?: string;
  ticketType?: string;
  visitDate?: string;
  from?: number;
  size?: number;
}

/**
 * Thực hiện tìm kiếm và lọc tốc độ cao qua Elasticsearch
 */
export async function esSearchTickets(params: EsSearchParams): Promise<{ total: number; hits: TicketDoc[] } | null> {
  try {
    const isReady = await checkElasticsearchHealth();
    if (!isReady) return null;

    const mustClauses: any[] = [];
    const filterClauses: any[] = [];

    // Full text & fuzzy matching qua các trường tìm kiếm chính
    if (params.search && params.search.trim()) {
      const term = params.search.trim();
      mustClauses.push({
        bool: {
          should: [
            { term: { ticketCode: term.toUpperCase() } },
            { prefix: { ticketCode: term.toUpperCase() } },
            {
              multi_match: {
                query: term,
                fields: ['userName^2', 'userEmail', 'userPhone'],
                fuzziness: 'AUTO',
                operator: 'or'
              }
            }
          ],
          minimum_should_match: 1
        }
      });
    }

    // Bộ lọc Trạng thái
    if (params.status && params.status !== 'all') {
      filterClauses.push({ term: { status: params.status } });
    }

    // Bộ lọc Loại vé
    if (params.ticketType && params.ticketType !== 'all') {
      filterClauses.push({ term: { ticketType: params.ticketType } });
    }

    // Bộ lọc Ngày tham quan
    if (params.visitDate && params.visitDate.trim()) {
      filterClauses.push({
        range: {
          visitDate: {
            gte: `${params.visitDate.trim()}||/d`,
            lte: `${params.visitDate.trim()}||/d`
          }
        }
      });
    }

    const queryBody: any = {
      from: params.from || 0,
      size: params.size || 10,
      sort: [{ createdAt: { order: 'desc' } }],
      query: {
        bool: {
          must: mustClauses.length > 0 ? mustClauses : [{ match_all: {} }],
          filter: filterClauses
        }
      }
    };

    const res = await fetch(`${ES_URL}/${ES_INDEX}/_search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryBody)
    });

    if (!res.ok) return null;

    const data: any = await res.json();
    const total = data.hits?.total?.value || 0;
    const hits: TicketDoc[] = (data.hits?.hits || []).map((h: any) => ({
      ...h._source,
      id: h._id
    }));

    return { total, hits };
  } catch (err: any) {
    console.warn('[Elasticsearch] Truy vấn search vé lỗi, chuyển fallback:', err.message);
    return null;
  }
}
