import { MuseumRoom, Hotspot } from '../types';

export const API_ROOT = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3000'
      : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'));

export const API_BASE = `${API_ROOT}/api`;

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
  }
};
