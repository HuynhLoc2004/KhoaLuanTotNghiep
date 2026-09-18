import { MuseumRoom, Hotspot, MuseumArtifact } from '../types';

export const API_ROOT = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3000'
      : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'));

export const API_BASE = `${API_ROOT}/api`;

export const formatMediaUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `${API_ROOT}${url.startsWith('/') ? '' : '/'}${url}`;
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
    const rawUrl = json.data.url;
    return {
      url: formatMediaUrl(rawUrl),
      filename: json.data.filename
    };
  },

  // ================= ARTIFACTS API =================
  async getArtifacts(): Promise<MuseumArtifact[]> {
    const res = await fetch(`${API_BASE}/artifacts`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải danh sách hiện vật');
    return json.data;
  },

  async getArtifact(id: string): Promise<MuseumArtifact> {
    const res = await fetch(`${API_BASE}/artifacts/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải chi tiết hiện vật');
    return json.data;
  },

  async createArtifact(data: Partial<MuseumArtifact>): Promise<MuseumArtifact> {
    const res = await fetch(`${API_BASE}/artifacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi thêm hiện vật');
    return json.data;
  },

  async updateArtifact(id: string, patch: Partial<MuseumArtifact>): Promise<MuseumArtifact> {
    const res = await fetch(`${API_BASE}/artifacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi cập nhật hiện vật');
    return json.data;
  },

  async deleteArtifact(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/artifacts/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi xóa hiện vật');
  },

  async uploadArtifactPhoto(file: File): Promise<{ url: string }> {
    const res = await this.uploadArtifactFrames([file]);
    return { url: res.thumbnail || res.images[0] || '' };
  },

  async uploadArtifactFrames(files: File[]): Promise<{ images: string[]; thumbnail: string }> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    const res = await fetch(`${API_BASE}/artifacts/upload-frames`, {
      method: 'POST',
      body: formData
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải chuỗi ảnh mâm xoay');
    return {
      images: (json.data.images || []).map(formatMediaUrl),
      thumbnail: formatMediaUrl(json.data.thumbnail || '')
    };
  },

  async uploadArtifactModel(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/artifacts/upload-model`, {
      method: 'POST',
      body: formData
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi tải mô hình 3D');
    return {
      url: formatMediaUrl(json.data.url),
      filename: json.data.filename
    };
  },

  async generate3DMesh(params: { file?: File; imageUrl?: string; artifactId?: string; depthScale?: number; resolution?: number }): Promise<{ model3dUrl: string; vertices: number; faces: number }> {
    const formData = new FormData();
    if (params.file) formData.append('file', params.file);
    if (params.imageUrl) formData.append('imageUrl', params.imageUrl);
    if (params.artifactId) formData.append('artifactId', params.artifactId);
    if (params.depthScale) formData.append('depthScale', String(params.depthScale));
    if (params.resolution) formData.append('resolution', String(params.resolution));

    const res = await fetch(`${API_BASE}/artifacts/generate-3d-mesh`, {
      method: 'POST',
      body: formData
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Lỗi sinh mô hình 3D từ ảnh');
    return {
      model3dUrl: formatMediaUrl(json.data.model3dUrl),
      vertices: json.data.vertices,
      faces: json.data.faces
    };
  }
};
