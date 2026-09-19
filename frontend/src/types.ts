export interface Hotspot {
  id: string;
  type: 'navigation' | 'info';
  title: string;
  description?: string;
  targetRoomId?: string;
  pitch: number; // -85 đến 85 (độ)
  yaw: number;   // -180 đến 180 (độ)
}

export interface RoomTranslation {
  name?: string;
  period?: string;
  category?: string;
  description?: string;
  narrationScript?: string;
  audioUrl?: string;
  aiKnowledgePrompt?: string;
}

export interface MuseumRoom {
  id: string;
  code: string;
  name: string;
  period: string;
  category?: string;
  description: string;
  panoramaUrl: string;
  thumbnailUrl: string;
  initialView: {
    pitch: number;
    yaw: number;
    fov: number;
  };
  hotspots: Hotspot[];
  orderIndex: number;
  active: boolean;
  aiVoiceEnabled?: boolean;
  aiKnowledgePrompt?: string;
  aiScript?: string;
  aiVoiceLang?: string;
  qrScanCount?: number;
  scenesCount?: number;
  audioUrl?: string;
  translations?: Record<string, RoomTranslation>;
  createdAt: string;
  updatedAt: string;
}

export interface LanguageItem {
  _id?: string;
  code: string;
  name: string;
  nativeName: string;
  flagIcon: string;
  isDefault: boolean;
  isActive: boolean;
  order: number;
  ttsVoiceConfig?: {
    provider: string;
    voiceName: string;
    gender: 'female' | 'male';
    speed: number;
    pitch: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface TopicItem {
  id: string;
  name: string;
  description?: string;
  orderIndex?: number;
  active?: boolean;
  roomCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type AdminTab = 'rooms' | 'studio' | 'poc_stitching' | 'artifacts' | 'languages' | 'analytics' | 'settings';
