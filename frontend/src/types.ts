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



export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  role: string;
  permissions: string[];
}

export interface RoleItem {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  email?: string;
  cooldownSeconds?: number;
  retryAfter?: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}

export interface MaintenanceStatus {
  enabled: boolean;
  title: string;
  message: string;
  estimatedMinutes: number;
  updatedAt: string;
  updatedBy: string;
  startTime?: string;
  expectedEndTime?: string;
  remainingMinutes?: number;
}

export interface SystemInfo {
  serverTime: string;
  uptimeSeconds: number;
  nodeVersion: string;
  platform: string;
  arch: string;
  memoryRssMb: number;
  memoryHeapUsedMb: number;
  redisConnected: boolean;
  environment: string;
  database?: {
    connected: boolean;
    name: string;
    roomsCount: number;
    panoramasCount: number;
    pingMs: number;
  };
  redis?: {
    connected: boolean;
    keysCount: number;
    pingMs: number;
    memoryUsedHuman?: string;
  };
  queue?: {
    name: string;
    pendingJobs: number;
    status: string;
  };
  publicIp?: string;
}

export interface SystemBranding {
  museumName: string;
  shortName: string;
  emblemText: string;
  logoUrl?: string;
  tagline: string;
  city: string;
  address: string;
  contactEmail: string;
  hotline: string;
  emailSenderName: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ArtifactTranslation {
  name?: string;
  period?: string;
  category?: string;
  origin?: string;
  description?: string;
  audioNarrationUrl?: string;
}

export interface ArtifactMetadata {
  vertices?: number;
  faces?: number;
  sizeBytes?: number;
  width?: number;
  height?: number;
  depth?: number;
  generatedAt?: string;
  inputImageSha256?: string;
}

export interface Artifact {
  id: string;
  code: string;
  name: string;
  category: string;
  period: string;
  origin: string;
  description: string;
  dimensions?: string;
  images: string[];
  thumbnailUrl: string;
  model3dUrl?: string;
  audioNarrationUrl?: string;
  voiceLanguage?: string;
  qrCodeUrl?: string;
  status: 'active' | 'archived' | 'draft';
  processingStatus: 'idle' | 'processing' | 'completed' | 'failed';
  processingError?: string;
  modelMetadata?: ArtifactMetadata;
  translations?: Record<string, ArtifactTranslation>;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}


