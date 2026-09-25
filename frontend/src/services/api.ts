import { MuseumRoom, Hotspot, TopicItem, AuthUser, RoleItem, SendOtpResponse, AuthResponse, MaintenanceStatus, SystemBranding, Artifact, FloorPlanMap } from '../types';

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

export const api = {
  async getRooms(): Promise<MuseumRoom[]> {
    const res = await fetch(`${API_BASE}/rooms`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải danh sách phòng');
    return json.data;
  },

  async getRoom(id: string): Promise<MuseumRoom> {
    const res = await fetch(`${API_BASE}/rooms/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải chi tiết phòng');
    return json.data;
  },

  async createRoom(room: Partial<MuseumRoom>): Promise<MuseumRoom> {
    const res = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi thêm phòng mới');
    return json.data;
  },

  async updateRoom(id: string, patch: Partial<MuseumRoom>): Promise<MuseumRoom> {
    const res = await fetch(`${API_BASE}/rooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi cập nhật phòng');
    return json.data;
  },

  async deleteRoom(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/rooms/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi xóa phòng');
  },

  async addHotspot(roomId: string, hotspot: Omit<Hotspot, 'id'>): Promise<Hotspot> {
    const res = await fetch(`${API_BASE}/rooms/${roomId}/hotspots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hotspot)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi thêm điểm liên kết');
    return json.data;
  },

  async deleteHotspot(roomId: string, hotspotId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/rooms/${roomId}/hotspots/${hotspotId}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi xóa điểm liên kết');
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
    return {
      url: `http://localhost:3000${json.data.url}`,
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
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải danh mục ngôn ngữ');
    return json.data;
  },

  async getActiveLanguages(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/languages/active`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải danh mục ngôn ngữ kích hoạt');
    return json.data;
  },

  async createLanguage(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/languages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi thêm ngôn ngữ');
    return json.data;
  },

  async updateLanguage(code: string, patch: any): Promise<any> {
    const res = await fetch(`${API_BASE}/languages/${code}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    const json = await res.json();
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
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
    const json = await res.json();
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
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi xác thực mã OTP');
    return json;
  },

  async loginCredentials(usernameOrEmail: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login-credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password })
    });
    const json = await res.json();
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
      body: JSON.stringify(data)
    });
    const json = await res.json();
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
      body: formData
    });
    const json = await res.json();
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
      body: formData
    });
    const json = await res.json();
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
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải danh sách hiện vật');
    const list = Array.isArray(json.data) ? json.data : [];
    return list.map((art: any) => ({
      ...art,
      id: String(art.id || art._id || '')
    }));
  },

  async getArtifact(id: string): Promise<Artifact> {
    const res = await fetch(`${API_BASE}/artifacts/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải chi tiết hiện vật');
    return { ...json.data, id: String(json.data.id || json.data._id || '') };
  },

  async createArtifact(artifact: Partial<Artifact>): Promise<Artifact> {
    const res = await fetch(`${API_BASE}/artifacts`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(artifact)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tạo hiện vật mới');
    return { ...json.data, id: String(json.data.id || json.data._id || '') };
  },

  async updateArtifact(id: string, patch: Partial<Artifact>): Promise<Artifact> {
    const res = await fetch(`${API_BASE}/artifacts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(patch)
    });
    const json = await res.json();
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
    const json = await res.json();
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
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải ảnh hiện vật');
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
    const json = await res.json();
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
    const json = await res.json();
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

  async getFloorPlan(): Promise<FloorPlanMap> {
    const res = await fetch(`${API_BASE}/floor-plan`);
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
  }

};

