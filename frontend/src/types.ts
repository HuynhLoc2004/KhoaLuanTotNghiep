export interface Hotspot {
  id: string;
  type: 'navigation' | 'info';
  title: string;
  description?: string;
  targetRoomId?: string;
  pitch: number; // -85 đến 85 (độ)
  yaw: number;   // -180 đến 180 (độ)
}

export interface MuseumRoom {
  id: string;
  code: string;
  name: string;
  period: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface MuseumArtifact {
  id: string;
  code: string;
  name: string;
  period: string;
  roomId?: string;
  material?: string;
  dimensions?: string;
  origin?: string;
  description: string;
  audioNarrationUrl?: string;
  audioText?: string;
  images360: string[];
  model3dUrl?: string;
  thumbnailUrl: string;
  qrCodeDataUrl?: string;
  qrTargetUrl?: string;
  featured: boolean;
  orderIndex: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AdminTab = 'rooms' | 'studio' | 'poc_stitching' | 'artifacts' | 'analytics' | 'settings';
