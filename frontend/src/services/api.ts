import { MuseumRoom, Hotspot, TopicItem, AuthUser, RoleItem, SendOtpResponse, AuthResponse } from '../types';

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
    const res = await fetch(`${API_BASE}/languages`);
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
  }
};
