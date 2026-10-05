import { MuseumRoom, Hotspot, TopicItem, AuthUser, RoleItem, SendOtpResponse, AuthResponse, MaintenanceStatus, SystemBranding, Artifact, FloorPlanMap, UserItem, UserListResponse, AdminTicketListResponse, AISettings, AIChatResponse, AITopicOption, UserProfile, UserTicket, BookTicketPayload, TicketTypeItem, TicketTimeSlotItem, TicketCatalogData, TicketCheckoutPayload, TicketCheckoutResponse, AdminOrderItem, AdminOrdersResponse, NavigationResult, FloorPlanNavSettings, FloorPlanNavLog } from '../types';

export const API_ROOT = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3000'
      : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'));

export const API_BASE = `${API_ROOT}/api`;

export const getAuthHeaders = (contentType: boolean = true): Record<string, string> => {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers['Content-Type'] = 'application/json';
  }
  const token = typeof window !== 'undefined' ? localStorage.getItem('museum_admin_token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const safeJson = async (res: Response, defaultError = 'Lỗi kết nối máy chủ'): Promise<any> => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error('Máy chủ đang khởi động lại hoặc bảo trì. Vui lòng thử lại sau vài giây.');
    }
    throw new Error(defaultError);
  }
};

export const api = {
  async getRooms(): Promise<MuseumRoom[]> {
    const res = await fetch(`${API_BASE}/rooms?fresh=true&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    const json = await safeJson(res, 'Lỗi kết nối khi tải danh sách phòng');
    if (!json.success) throw new Error(json.message || 'Lỗi tải danh sách phòng');
    return json.data;
  },

  async getRoom(id: string): Promise<MuseumRoom> {
    const res = await fetch(`${API_BASE}/rooms/${id}?fresh=true&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    const json = await safeJson(res, 'Lỗi kết nối khi tải chi tiết phòng');
    if (!json.success) throw new Error(json.message || 'Lỗi tải chi tiết phòng');
    return json.data;
  },

  async createRoom(room: Partial<MuseumRoom>): Promise<MuseumRoom> {
    const res = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room)
    });
    const json = await safeJson(res, 'Lỗi kết nối khi thêm phòng mới');
    if (!json.success) throw new Error(json.message || 'Lỗi thêm phòng mới');
    return json.data;
  },

  async updateRoom(id: string, patch: Partial<MuseumRoom>): Promise<MuseumRoom> {
    const res = await fetch(`${API_BASE}/rooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    const json = await safeJson(res, 'Lỗi kết nối khi cập nhật phòng');
    if (!json.success) throw new Error(json.message || 'Lỗi cập nhật phòng');
    return json.data;
  },

  async deleteRoom(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/rooms/${id}`, {
      method: 'DELETE'
    });
    const json = await safeJson(res, 'Lỗi kết nối khi xóa phòng');
    if (!json.success) throw new Error(json.message || 'Lỗi xóa phòng');
  },

  async addHotspot(roomId: string, hotspot: Omit<Hotspot, 'id'>): Promise<Hotspot> {
    const res = await fetch(`${API_BASE}/rooms/${roomId}/hotspots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hotspot)
    });
    const json = await safeJson(res, 'Lỗi kết nối khi thêm điểm liên kết');
    if (!json.success) throw new Error(json.message || 'Lỗi thêm điểm liên kết');
    return json.data;
  },

  async deleteHotspot(roomId: string, hotspotId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/rooms/${roomId}/hotspots/${hotspotId}`, {
      method: 'DELETE'
    });
    const json = await safeJson(res, 'Lỗi kết nối khi xóa điểm liên kết');
    if (!json.success) throw new Error(json.message || 'Lỗi xóa điểm liên kết');
  },

  async seedHeritageRooms(): Promise<{ success: boolean; data: MuseumRoom[]; count: number; message?: string }> {
    const res = await fetch(`${API_BASE}/rooms/seed-heritage`, {
      method: 'POST',
      headers: getAuthHeaders(true)
    });
    return await safeJson(res, 'Lỗi khởi tạo dữ liệu di sản');
  },

  async clearAllRooms(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/rooms/all/clear`, {
      method: 'DELETE',
      headers: getAuthHeaders(true)
    });
    return await safeJson(res, 'Lỗi xóa toàn bộ phòng');
  },

  async uploadPanorama(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload/panorama`, {
      method: 'POST',
      body: formData
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải ảnh lên');
    const rawUrl = json.data.url || '';
    const finalUrl = (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))
      ? rawUrl
      : `${API_ROOT}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
    return {
      url: finalUrl,
      filename: json.data.filename
    };
  },

  // Language Registry APIs
  async getLanguages(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/languages?_t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    const json = await safeJson(res, 'Lỗi kết nối khi tải danh mục ngôn ngữ');
    if (!json.success) throw new Error(json.message || 'Lỗi tải danh mục ngôn ngữ');
    return json.data;
  },

  async getActiveLanguages(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/languages/active`);
    const json = await safeJson(res, 'Lỗi kết nối khi tải danh mục ngôn ngữ kích hoạt');
    if (!json.success) throw new Error(json.message || 'Lỗi tải danh mục ngôn ngữ kích hoạt');
    return json.data;
  },

  async createLanguage(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/languages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await safeJson(res, 'Lỗi kết nối khi thêm ngôn ngữ');
    if (!json.success) throw new Error(json.message || 'Lỗi thêm ngôn ngữ');
    return json.data;
  },

  async updateLanguage(code: string, patch: any): Promise<any> {
    const res = await fetch(`${API_BASE}/languages/${code}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    const json = await safeJson(res, 'Lỗi kết nối khi cập nhật ngôn ngữ');
    if (!json.success) throw new Error(json.message || 'Lỗi cập nhật ngôn ngữ');
    return json.data;
  },

  async deleteLanguage(code: string): Promise<void> {
    const res = await fetch(`${API_BASE}/languages/${code}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi xóa ngôn ngữ');
  },

  async translateDraft(payload: { targetLang: string; name?: string; period?: string; description?: string; narrationScript?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/languages/translate-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi dịch thuật AI');
    return json.data;
  },

  async generateTtsAudio(payload: { text: string; langCode: string; roomCode?: string }): Promise<{ audioUrl: string; duration: number }> {
    const res = await fetch(`${API_BASE}/languages/generate-tts`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload)
    });
    const json = await safeJson(res, 'Lỗi sinh file âm thanh Voice AI');
    if (!json.success) throw new Error(json.message || 'Lỗi sinh file âm thanh Voice AI');
    return json;
  },

  async deleteAudioFile(audioUrl: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/languages/audio`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl })
      });
    } catch (e) {
      console.warn('Lỗi xoá file audio:', e);
    }
  },

  // === QUẢN TRỊ CHUYÊN ĐỀ TRƯNG BÀY (TOPICS) ===
  async getTopics(): Promise<TopicItem[]> {
    const res = await fetch(`${API_BASE}/topics`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải danh mục chuyên đề');
    return json.data;
  },

  async createTopic(topic: Partial<TopicItem>): Promise<TopicItem> {
    const res = await fetch(`${API_BASE}/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topic)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi thêm chuyên đề mới');
    return json.data;
  },

  async updateTopic(id: string, patch: Partial<TopicItem>): Promise<TopicItem> {
    const res = await fetch(`${API_BASE}/topics/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi cập nhật chuyên đề');
    return json.data;
  },

  async deleteTopic(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/topics/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi xóa chuyên đề');
  },

  // === QUẢN TRỊ XÁC THỰC ADMIN & RBAC (OTP + CREDENTIALS) ===
  async sendOtp(email: string): Promise<SendOtpResponse> {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const json = await safeJson(res, 'Lỗi khi gửi mã xác thực OTP');
    if (!res.ok && res.status === 429) {
      // Bị chặn cooldown chống spam 60s
      return {
        success: false,
        message: json.message || 'Vui lòng chờ thêm trước khi yêu cầu mã mới',
        retryAfter: json.retryAfter || 60
      };
    }
    if (!json.success) throw new Error(json.message || 'Lỗi khi gửi mã xác thực OTP');
    return json;
  },

  async verifyOtp(email: string, otp: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const json = await safeJson(res, 'Lỗi xác thực mã OTP');
    if (!json.success) throw new Error(json.message || 'Lỗi xác thực mã OTP');
    return json;
  },

  async loginCredentials(usernameOrEmail: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login-credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password })
    });
    const json = await safeJson(res, 'Đăng nhập không thành công');
    if (!json.success) throw new Error(json.message || 'Đăng nhập không thành công');
    return json;
  },

  async getMe(): Promise<AuthUser> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(false)
    });
    if (!res.ok) {
      const err: any = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    const json = await res.json();
    if (!json.success) {
      const err: any = new Error(json.message || 'Phiên đăng nhập không hợp lệ');
      err.status = res.status;
      throw err;
    }
    return json.user;
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(true)
      });
    } catch {
      // Ignored
    }
  },

  async getRoles(): Promise<RoleItem[]> {
    const res = await fetch(`${API_BASE}/auth/roles`, {
      headers: getAuthHeaders(false)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải danh sách vai trò');
    return json.roles;
  },

  async createRole(role: Partial<RoleItem>): Promise<RoleItem> {
    const res = await fetch(`${API_BASE}/auth/roles`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(role)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tạo vai trò mới');
    return json.role;
  },

  async updateRole(id: string, patch: Partial<RoleItem>): Promise<RoleItem> {
    const res = await fetch(`${API_BASE}/auth/roles/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(patch)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi cập nhật vai trò');
    return json.role;
  },

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health?t=${Date.now()}`, {
        cache: 'no-store'
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getMaintenanceStatus(): Promise<MaintenanceStatus> {
    const res = await fetch(`${API_BASE}/system/maintenance?t=${Date.now()}`, {
      cache: 'no-store'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải trạng thái bảo trì');
    return json.maintenance;
  },

  async updateMaintenanceStatus(data: {
    enabled: boolean;
    title?: string;
    message?: string;
    estimatedMinutes?: number;
    startTime?: string;
    expectedEndTime?: string;
    remainingMinutes?: number;
  }): Promise<MaintenanceStatus> {
    const res = await fetch(`${API_BASE}/system/maintenance`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi cập nhật chế độ bảo trì');
    return json.maintenance;
  },

  async getSystemInfo(): Promise<import('../types').SystemInfo> {
    const res = await fetch(`${API_BASE}/system/info?t=${Date.now()}`, {
      headers: getAuthHeaders(true),
      cache: 'no-store'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải thông số hệ thống');
    return json.info;
  },

  // === QUẢN TRỊ NHẬN DIỆN THƯƠNG HIỆU ĐA BẢO TÀNG (SYSTEM BRANDING) ===
  async getBranding(): Promise<SystemBranding> {
    const res = await fetch(`${API_BASE}/system/branding?t=${Date.now()}`, {
      cache: 'no-store'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải nhận diện bảo tàng');
    return json.branding;
  },

  async updateBranding(data: Partial<SystemBranding>): Promise<SystemBranding> {
    const res = await fetch(`${API_BASE}/system/branding`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(20000)
    });
    const json = await safeJson(res, 'Không thể cập nhật cấu hình bảo tàng');
    if (!json.success) throw new Error(json.message || 'Lỗi cập nhật nhận diện bảo tàng');
    return json.branding;
  },

  async uploadBrandingLogo(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const headers = getAuthHeaders(false); // Không đặt application/json để trình duyệt tự set multipart/form-data boundary

    const res = await fetch(`${API_BASE}/upload/branding-logo`, {
      method: 'POST',
      headers,
      body: formData,
      signal: AbortSignal.timeout(30000)
    });
    const json = await safeJson(res, 'Không thể tải lên file ảnh logo');
    if (!json.success) throw new Error(json.message || 'Lỗi tải lên file ảnh logo');
    return { url: json.data.url };
  },

  async uploadBrandingImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const headers = getAuthHeaders(false);

    const res = await fetch(`${API_BASE}/upload/branding-image`, {
      method: 'POST',
      headers,
      body: formData,
      signal: AbortSignal.timeout(30000)
    });
    const json = await safeJson(res, 'Không thể tải lên file ảnh');
    if (!json.success) throw new Error(json.message || 'Lỗi tải lên file ảnh');
    return { url: json.data.url };
  },

  // === QUẢN TRỊ HIỆN VẬT & MÔ PHỎNG 3D CỔ VẬT (ARTIFACTS & 3D RECONSTRUCTION) ===
  async getArtifacts(params?: { category?: string; search?: string; status?: string }): Promise<Artifact[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);

    const res = await fetch(`${API_BASE}/artifacts?${query.toString()}`);
    const json = await safeJson(res, 'Lỗi kết nối khi tải danh sách hiện vật');
    if (!json.success) throw new Error(json.message || 'Lỗi tải danh sách hiện vật');
    const list = Array.isArray(json.data) ? json.data : [];
    return list.map((art: any) => ({
      ...art,
      id: String(art.id || art._id || '')
    }));
  },

  async getArtifact(id: string): Promise<Artifact> {
    const cleanId = encodeURIComponent(String(id || '').trim());
    const res = await fetch(`${API_BASE}/artifacts/${cleanId}`);
    const json = await safeJson(res, 'Lỗi kết nối khi tải chi tiết hiện vật');
    if (!json.success || !json.data) throw new Error(json.message || 'Không tìm thấy hiện vật');
    return { ...json.data, id: String(json.data.id || json.data._id || '') };
  },

  async createArtifact(artifact: Partial<Artifact>): Promise<Artifact> {
    const res = await fetch(`${API_BASE}/artifacts`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(artifact)
    });
    const json = await safeJson(res, 'Lỗi kết nối khi tạo hiện vật mới');
    if (!json.success) throw new Error(json.message || 'Lỗi tạo hiện vật mới');
    return { ...json.data, id: String(json.data.id || json.data._id || '') };
  },

  async updateArtifact(id: string, patch: Partial<Artifact>): Promise<Artifact> {
    const res = await fetch(`${API_BASE}/artifacts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(patch)
    });
    const json = await safeJson(res, 'Lỗi kết nối khi cập nhật hiện vật');
    if (!json.success) throw new Error(json.message || 'Lỗi cập nhật hiện vật');
    return { ...json.data, id: String(json.data.id || json.data._id || '') };
  },

  async deleteArtifact(id: string): Promise<void> {
    const cleanId = String(id || '').trim();
    if (!cleanId || cleanId === 'undefined') {
      throw new Error('ID hiện vật không hợp lệ để thực hiện thao tác xóa');
    }
    const res = await fetch(`${API_BASE}/artifacts/${cleanId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(true)
    });
    const json = await safeJson(res, 'Lỗi kết nối khi xóa hiện vật');
    if (!json.success) throw new Error(json.message || 'Lỗi xóa hiện vật');
  },

  async uploadArtifactImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const headers = getAuthHeaders(false);

    const res = await fetch(`${API_BASE}/artifacts/upload-image`, {
      method: 'POST',
      headers,
      body: formData
    });
    const json = await safeJson(res, 'Lỗi kết nối khi tải ảnh hiện vật lên');
    if (!json.success) throw new Error(json.message || 'Lỗi tải ảnh hiện vật');
    return json.data;
  },

  async isolateArtifactImage(imageUrl: string, artifactId?: string): Promise<{ url: string; originalUrl: string }> {
    const res = await fetch(`${API_BASE}/artifacts/isolate-image`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ imageUrl, artifactId })
    });
    const json = await safeJson(res, 'Lỗi kết nối khi bóc tách nền hiện vật');
    if (!json.success) throw new Error(json.message || 'Lỗi bóc tách nền hiện vật');
    return json.data;
  },

  async uploadArtifactModel(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const headers = getAuthHeaders(false);

    const res = await fetch(`${API_BASE}/artifacts/upload-model`, {
      method: 'POST',
      headers,
      body: formData
    });
    const json = await safeJson(res, 'Lỗi kết nối khi tải file 3D');
    if (!json.success) throw new Error(json.message || 'Lỗi tải file 3D');
    return json.data;
  },

  async generate3DArtifact(
    id: string,
    options?: { imageUrl?: string; depthScale?: number; resolution?: number }
  ): Promise<{ jobId: string; cached: boolean; model3dUrl?: string; status: string }> {
    const res = await fetch(`${API_BASE}/artifacts/${id}/generate-3d`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(options || {})
    });
    const json = await safeJson(res, 'Lỗi kết nối khi kích hoạt tiến trình dựng 3D');
    if (!json.success) throw new Error(json.message || 'Lỗi kích hoạt tiến trình dựng 3D');
    return json.data;
  },

  async getArtifact3DStatus(id: string): Promise<{
    artifactId: string;
    processingStatus: 'idle' | 'processing' | 'completed' | 'failed';
    processingError?: string;
    model3dUrl?: string;
    modelMetadata?: any;
  }> {
    const res = await fetch(`${API_BASE}/artifacts/${id}/3d-status`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi kiểm tra trạng thái 3D');
    return json.data;
  },

  getArtifactQRDownloadUrl(id: string): string {
    return `${API_BASE}/artifacts/${id}/qr-download`;
  },

  /**
   * Xin chữ ký số Signed Upload từ VPS để client tải ảnh trực tiếp lên Cloudinary
   * VPS không giữ file nhị phân -> Tiết kiệm 100% RAM VPS
   */
  async getCloudinarySignature(folder = 'museum/artifacts'): Promise<{
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
  }> {
    const res = await fetch(`${API_BASE}/upload/cloudinary-sign`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ folder })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi cấp chữ ký Cloudinary');
    return json.data;
  },

  /**
   * Tải ảnh trực tiếp từ trình duyệt lên Cloudinary bằng chữ ký số
   */
  async uploadImageSignedToCloudinary(file: File, folder = 'museum/artifacts'): Promise<string> {
    const signData = await this.getCloudinarySignature(folder);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signData.apiKey);
    formData.append('timestamp', String(signData.timestamp));
    formData.append('signature', signData.signature);
    formData.append('folder', signData.folder);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });
    const result = await res.json();
    if (result.error) throw new Error(result.error.message || 'Lỗi tải ảnh lên Cloudinary');
    return result.secure_url || result.url;
  },

  async getColabTunnelConfig(): Promise<{
    url: string;
    configured: boolean;
    ok: boolean;
    status: string;
    device?: string;
    model?: string;
    message?: string;
    latencyMs?: number;
  }> {
    const res = await fetch(`${API_BASE}/artifacts/colab-tunnel`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi kiểm tra cấu hình Colab Tunnel');
    return json.data;
  },

  async updateColabTunnelUrl(url: string): Promise<{
    url: string;
    configured: boolean;
    ok: boolean;
    status: string;
    device?: string;
    model?: string;
    message?: string;
    latencyMs?: number;
  }> {
    const res = await fetch(`${API_BASE}/artifacts/colab-tunnel`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ url })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi cập nhật Colab Tunnel URL');
    return json.data;
  },

  async getFloorPlan(): Promise<FloorPlanMap> {
    const res = await fetch(`${API_BASE}/floor-plan?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải sơ đồ mặt bằng');
    return json.data;
  },

  async analyzeFloorPlan(formData: FormData): Promise<{ data: FloorPlanMap; summary: any }> {
    const res = await fetch(`${API_BASE}/floor-plan/analyze`, {
      method: 'POST',
      headers: getAuthHeaders(false),
      body: formData
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi phân tích sơ đồ mặt bằng');
    return { data: json.data, summary: json.summary };
  },

  async getFloorPlansList(params?: { page?: number; limit?: number }): Promise<{
    data: FloorPlanMap[];
    activeId: string | null;
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    query.append('_t', Date.now().toString());
    const res = await fetch(`${API_BASE}/floor-plan/list?${query.toString()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải danh sách bản đồ trong kho');
    return { data: json.data, activeId: json.activeId, pagination: json.pagination };
  },

  async activateFloorPlan(id: string): Promise<FloorPlanMap> {
    const res = await fetch(`${API_BASE}/floor-plan/activate/${id}`, {
      method: 'POST',
      headers: getAuthHeaders(true)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi kích hoạt bản đồ');
    return json.data;
  },

  async deleteFloorPlan(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/floor-plan/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(true)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi xóa bản đồ');
  },

  async updateFloorPlanNodeMapping(mapId: string, nodeId: string, roomId: string | null): Promise<FloorPlanMap> {
    const res = await fetch(`${API_BASE}/floor-plan/${mapId}/node-mapping`, {
      method: 'PUT',
      headers: { ...getAuthHeaders(true), 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId, roomId })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi cập nhật gán gian phòng');
    return json.data;
  },

  async updateFloorPlanBatchMapping(mapId: string, mappings: Array<{ nodeId: string; roomId: string | null }>): Promise<FloorPlanMap> {
    const res = await fetch(`${API_BASE}/floor-plan/${mapId}/batch-mapping`, {
      method: 'PUT',
      headers: { ...getAuthHeaders(true), 'Content-Type': 'application/json' },
      body: JSON.stringify({ mappings })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi lưu liên kết sơ đồ');
    return json.data;
  },

  // === TRỢ LÝ BẢN ĐỒ & DẪN ĐƯỜNG VOICE AI (FLOOR PLAN NAVIGATION ASSISTANT) ===
  async navigateFloorPlan(payload: {
    floorPlanId?: string;
    startNodeId: string;
    endNodeId: string;
    lang?: string;
  }): Promise<NavigationResult> {
    const res = await fetch(`${API_BASE}/floor-plan/navigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tìm đường dẫn');
    return json.data;
  },

  async getFloorPlanNavSettings(floorPlanId?: string): Promise<FloorPlanNavSettings> {
    const query = floorPlanId ? `?floorPlanId=${encodeURIComponent(floorPlanId)}` : '';
    const res = await fetch(`${API_BASE}/floor-plan/nav-settings${query}`, {
      cache: 'no-store'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải cấu hình trợ lý dẫn đường');
    return json.data;
  },

  async updateFloorPlanNavSettings(payload: Partial<FloorPlanNavSettings>): Promise<FloorPlanNavSettings> {
    const res = await fetch(`${API_BASE}/floor-plan/nav-settings`, {
      method: 'PUT',
      headers: { ...getAuthHeaders(true), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi cập nhật cấu hình trợ lý');
    return json.data;
  },

  async getFloorPlanNavLogs(floorPlanId?: string, limit: number = 30): Promise<FloorPlanNavLog[]> {
    const query = new URLSearchParams();
    if (floorPlanId) query.append('floorPlanId', floorPlanId);
    query.append('limit', limit.toString());
    query.append('_t', Date.now().toString());

    const res = await fetch(`${API_BASE}/floor-plan/nav-logs?${query.toString()}`, {
      headers: getAuthHeaders(true),
      cache: 'no-store'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải lịch sử dẫn đường');
    return json.data;
  },

  // === QUẢN LÝ NGƯỜI DÙNG & KHÁCH THAM QUAN (USERS MANAGEMENT) ===
  async getUsers(params?: { search?: string; role?: string; status?: string; page?: number; limit?: number }): Promise<UserListResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.role) query.append('role', params.role);
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/users?${query.toString()}`, {
      headers: getAuthHeaders(true)
    });
    const json = await safeJson(res, 'Không thể tải danh sách người dùng');
    if (!json.success) throw new Error(json.message || 'Lỗi tải người dùng');
    return { data: json.data, pagination: json.pagination, stats: json.stats };
  },

  async getUserDetail(id: string): Promise<UserItem> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      headers: getAuthHeaders(true)
    });
    const json = await safeJson(res, 'Không thể đọc thông tin người dùng');
    if (!json.success) throw new Error(json.message || 'Lỗi tải chi tiết người dùng');
    return json.data;
  },

  async createUser(data: Partial<UserItem> & { password?: string }): Promise<UserItem> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data)
    });
    const json = await safeJson(res, 'Không thể tạo tài khoản');
    if (!json.success) throw new Error(json.message || 'Lỗi tạo người dùng');
    return json.data;
  },

  async updateUser(id: string, data: Partial<UserItem> & { password?: string }): Promise<UserItem> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data)
    });
    const json = await safeJson(res, 'Không thể cập nhật tài khoản');
    if (!json.success) throw new Error(json.message || 'Lỗi cập nhật người dùng');
    return json.data;
  },

  async toggleUserStatus(id: string): Promise<{ isActive: boolean }> {
    const res = await fetch(`${API_BASE}/users/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(true)
    });
    const json = await safeJson(res, 'Không thể đổi trạng thái');
    if (!json.success) throw new Error(json.message || 'Lỗi đổi trạng thái tài khoản');
    return { isActive: json.isActive };
  },

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(true)
    });
    const json = await safeJson(res, 'Không thể xóa tài khoản');
    if (!json.success) throw new Error(json.message || 'Lỗi xóa người dùng');
  },

  // ===================== QUẢN LÝ VÉ THAM QUAN BẢO TÀNG (ADMIN) =====================
  async getAdminTickets(params?: {
    search?: string;
    status?: string;
    ticketType?: string;
    visitDate?: string;
    page?: number;
    limit?: number;
  }): Promise<AdminTicketListResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.ticketType) query.append('ticketType', params.ticketType);
    if (params?.visitDate) query.append('visitDate', params.visitDate);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/admin/tickets?${query.toString()}`, {
      headers: getAuthHeaders(true)
    });
    const json = await safeJson(res, 'Không thể tải danh sách vé quản trị');
    if (!json.success) throw new Error(json.message || 'Lỗi tải danh sách vé');
    return json;
  },

  async adminCheckinTicket(code: string): Promise<{ success: boolean; message: string; data: any }> {
    const res = await fetch(`${API_BASE}/admin/tickets/${code}/checkin`, {
      method: 'PUT',
      headers: getAuthHeaders(true)
    });
    const json = await safeJson(res, 'Không thể thực hiện soát vé');
    if (!json.success) throw new Error(json.message || 'Lỗi soát vé');
    return json;
  },

  async adminCancelTicket(code: string): Promise<{ success: boolean; message: string; data: any }> {
    const res = await fetch(`${API_BASE}/admin/tickets/${code}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(true)
    });
    const json = await safeJson(res, 'Không thể hủy vé');
    if (!json.success) throw new Error(json.message || 'Lỗi hủy vé');
    return json;
  },

  async adminDeleteTicket(code: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/tickets/${code}`, {
      method: 'DELETE',
      headers: getAuthHeaders(true)
    });
    const json = await safeJson(res, 'Không thể xóa vé');
    if (!json.success) throw new Error(json.message || 'Lỗi xóa vé');
    return json;
  },

  // ===================== TRỢ LÝ AI & QUẢN LÝ MODEL =====================
  async getAITopics(): Promise<AITopicOption[]> {
    try {
      const res = await fetch(`${API_BASE}/ai/topics`);
      const json = await safeJson(res);
      return json.topics || [];
    } catch {
      return [
        { id: 'artifacts', label: 'Hiện vật & Cổ vật', description: 'Tra cứu cổ vật và xem 3D', icon: 'Crown' },
        { id: 'rooms', label: 'Không gian 360°', description: 'Khám phá các phòng trưng bày', icon: 'Compass' },
        { id: 'tickets_info', label: 'Vé & Tham quan', description: 'Giờ mở cửa, giá vé, di chuyển', icon: 'Ticket' },
        { id: 'general', label: 'Hỏi đáp tự do', description: 'Lịch sử, văn hóa và thông tin chung', icon: 'Sparkles' },
        { id: 'contact_admin', label: 'Liên hệ Ban Quản lý', description: 'Kết nối trực tiếp Ban Quản lý', icon: 'Headphones' }
      ];
    }
  },

  async sendAIChat(
    message: string,
    topic: string = 'general',
    history: Array<{ role: 'user' | 'model'; text: string }> = []
  ): Promise<AIChatResponse> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, topic, history })
    });
    const json = await safeJson(res, 'Trợ lý AI chưa thể phản hồi lúc này');
    if (!res.ok) {
      throw new Error(json.error || json.message || 'Lỗi gửi tin nhắn đến Trợ lý AI');
    }
    return json;
  },

  async sendAIContactAdmin(data: {
    visitorName: string;
    visitorContact: string;
    message: string;
    topic?: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/ai/contact-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await safeJson(res, 'Không thể gửi tin nhắn đến Ban Quản lý');
    if (!res.ok) {
      throw new Error(json.error || json.message || 'Lỗi gửi tin nhắn');
    }
    return json;
  },

  async getAISettings(): Promise<AISettings> {
    const res = await fetch(`${API_BASE}/ai/settings?_t=${Date.now()}`, {
      headers: getAuthHeaders(true)
    });
    const json = await safeJson(res, 'Không thể tải cấu hình Trợ lý AI');
    if (!res.ok) {
      throw new Error(json.error || 'Lỗi tải cấu hình AI');
    }
    return json;
  },

  async updateAISettings(settings: Partial<AISettings>): Promise<{ success: boolean; message: string; settings: AISettings }> {
    const res = await fetch(`${API_BASE}/ai/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(settings)
    });
    const json = await safeJson(res, 'Không thể cập nhật cấu hình Trợ lý AI');
    if (!res.ok) {
      throw new Error(json.error || 'Lỗi cập nhật cấu hình AI');
    }
    return json;
  },

  async testAIConnection(data: {
    provider?: string;
    modelName?: string;
    apiKey?: string;
  }): Promise<{ success: boolean; latencyMs: number; message: string; responseSnippet?: string }> {
    const res = await fetch(`${API_BASE}/ai/test-connection`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data)
    });
    const json = await safeJson(res, 'Không thể kiểm tra kết nối Model AI');
    return json;
  },

  // ==========================================
  // PROFILE & TICKETS API (100% CSDL THẬT POSTGRESQL & MONGODB)
  // ==========================================
  async getUserProfile(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/profile?_t=${Date.now()}`, {
      headers: getAuthHeaders(true)
    });
    const json = await safeJson(res, 'Không thể tải hồ sơ người dùng');
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Lỗi tải thông tin hồ sơ');
    }
    return json.data;
  },

  async updateUserProfile(data: { fullName: string; phone?: string; avatar?: string }): Promise<{ success: boolean; message: string; data: any }> {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data)
    });
    const json = await safeJson(res, 'Không thể cập nhật hồ sơ');
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Lỗi cập nhật hồ sơ');
    }
    return json;
  },

  async changePassword(data: { oldPassword: string; newPassword: string; confirmPassword?: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/profile/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data)
    });
    const json = await safeJson(res, 'Không thể đổi mật khẩu');
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Lỗi đổi mật khẩu');
    }
    return json;
  },

  async getMyTickets(): Promise<UserTicket[]> {
    const res = await fetch(`${API_BASE}/profile/tickets?_t=${Date.now()}`, {
      headers: getAuthHeaders(true)
    });
    const json = await safeJson(res, 'Không thể tải danh sách vé');
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Lỗi tải danh sách vé');
    }
    return json.data || [];
  },

  async bookTicket(data: BookTicketPayload): Promise<{ success: boolean; message: string; data: UserTicket }> {
    const res = await fetch(`${API_BASE}/profile/tickets`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data)
    });
    const json = await safeJson(res, 'Không thể khởi tạo vé');
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Lỗi đặt vé tham quan');
    }
    return json;
  },

  async cancelTicket(code: string): Promise<{ success: boolean; message: string; data: any }> {
    const res = await fetch(`${API_BASE}/profile/tickets/${code}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(true)
    });
    const json = await safeJson(res, 'Không thể hủy vé');
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Lỗi hủy vé tham quan');
    }
    return json;
  },

  // === CỔNG BÁN VÉ CLIENT & THANH TOÁN PAYOS ===
  async getTicketCatalog(): Promise<TicketCatalogData> {
    const res = await fetch(`${API_BASE}/tickets/catalog?_t=${Date.now()}`);
    const json = await safeJson(res, 'Không thể tải bảng giá vé');
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Lỗi tải bảng giá vé tham quan');
    }
    return json.data;
  },

  async checkoutTickets(payload: TicketCheckoutPayload): Promise<TicketCheckoutResponse> {
    const res = await fetch(`${API_BASE}/tickets/checkout`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload)
    });
    const json = await safeJson(res, 'Không thể khởi tạo đơn hàng thanh toán');
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Lỗi tạo đơn hàng thanh toán vé');
    }
    return json.data;
  },

  async getOrderStatus(orderCode: number | string): Promise<AdminOrderItem> {
    const res = await fetch(`${API_BASE}/tickets/orders/${orderCode}?_t=${Date.now()}`);
    const json = await safeJson(res, 'Không thể tra cứu trạng thái đơn hàng');
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Lỗi kiểm tra đơn hàng');
    }
    return json.data;
  },

  // === QUẢN TRỊ BẢNG GIÁ VÉ & KHUNG GIỜ THAM QUAN (ADMIN CMS) ===
  async getAdminTicketTypes(): Promise<TicketTypeItem[]> {
    const res = await fetch(`${API_BASE}/admin/ticket-settings/types?_t=${Date.now()}`, {
      headers: getAuthHeaders(true)
    });
    const json = await safeJson(res, 'Không thể tải danh sách loại vé');
    if (!res.ok || !json.success) throw new Error(json.message || 'Lỗi tải loại vé');
    return json.data || [];
  },

  async createAdminTicketType(data: Partial<TicketTypeItem>): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/ticket-settings/types`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data)
    });
    const json = await safeJson(res, 'Không thể thêm loại vé');
    if (!res.ok || !json.success) throw new Error(json.message || 'Lỗi thêm loại vé');
    return json;
  },

  async updateAdminTicketType(id: string, data: Partial<TicketTypeItem>): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/ticket-settings/types/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data)
    });
    const json = await safeJson(res, 'Không thể cập nhật loại vé');
    if (!res.ok || !json.success) throw new Error(json.message || 'Lỗi cập nhật loại vé');
    return json;
  },

  async deleteAdminTicketType(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/ticket-settings/types/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(true)
    });
    const json = await safeJson(res, 'Không thể xóa loại vé');
    if (!res.ok || !json.success) throw new Error(json.message || 'Lỗi xóa loại vé');
    return json;
  },

  async getAdminTicketSlots(): Promise<TicketTimeSlotItem[]> {
    const res = await fetch(`${API_BASE}/admin/ticket-settings/slots?_t=${Date.now()}`, {
      headers: getAuthHeaders(true)
    });
    const json = await safeJson(res, 'Không thể tải khung giờ');
    if (!res.ok || !json.success) throw new Error(json.message || 'Lỗi tải khung giờ');
    return json.data || [];
  },

  async createAdminTicketSlot(data: Partial<TicketTimeSlotItem>): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/ticket-settings/slots`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data)
    });
    const json = await safeJson(res, 'Không thể thêm khung giờ');
    if (!res.ok || !json.success) throw new Error(json.message || 'Lỗi thêm khung giờ');
    return json;
  },

  async updateAdminTicketSlot(id: string, data: Partial<TicketTimeSlotItem>): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/ticket-settings/slots/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data)
    });
    const json = await safeJson(res, 'Không thể cập nhật khung giờ');
    if (!res.ok || !json.success) throw new Error(json.message || 'Lỗi cập nhật khung giờ');
    return json;
  },

  async deleteAdminTicketSlot(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/ticket-settings/slots/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(true)
    });
    const json = await safeJson(res, 'Không thể xóa khung giờ');
    if (!res.ok || !json.success) throw new Error(json.message || 'Lỗi xóa khung giờ');
    return json;
  },

  // === QUẢN TRỊ LỊCH SỬ ĐƠN HÀNG PAYOS ===
  async getAdminOrders(params?: { status?: string; search?: string; page?: number; limit?: number }): Promise<AdminOrdersResponse> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/admin/ticket-settings/orders?${query.toString()}`, {
      headers: getAuthHeaders(true)
    });
    const json = await safeJson(res, 'Không thể tải danh sách đơn hàng');
    if (!res.ok || !json.success) throw new Error(json.message || 'Lỗi tải đơn hàng');
    return { data: json.data || [], pagination: json.pagination, stats: json.stats };
  }
};

