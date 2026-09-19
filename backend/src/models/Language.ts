import mongoose, { Schema, Document } from 'mongoose';

export interface ILanguage extends Document {
  code: string;           // 'vi', 'en', 'fr', 'ja', 'zh', 'de', 'ko'
  name: string;           // 'Vietnamese', 'English', 'French'...
  nativeName: string;     // 'Tiếng Việt', 'English', 'Français', '日本語'...
  flagIcon: string;       // '🇻🇳', '🇬🇧', '🇫🇷', '🇯🇵', '🇨🇳', '🇰🇷', '🇩🇪'...
  isDefault: boolean;     // true for 'vi'
  isActive: boolean;      // Admin toggle
  order: number;
  ttsVoiceConfig: {
    provider: string;     // 'google' | 'edge' | 'gemini' | 'elevenlabs'
    voiceName: string;    // 'vi-VN-Standard-A', 'en-US-Neural2-F'...
    gender: 'female' | 'male';
    speed: number;
    pitch: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const LanguageSchema = new Schema<ILanguage>(
  {
    code: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    nativeName: { type: String, required: true },
    flagIcon: { type: String, default: '🌐' },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    order: { type: Number, default: 99 },
    ttsVoiceConfig: {
      provider: { type: String, default: 'google' },
      voiceName: { type: String, default: 'default' },
      gender: { type: String, enum: ['female', 'male'], default: 'female' },
      speed: { type: Number, default: 1.0 },
      pitch: { type: Number, default: 0.0 }
    }
  },
  { timestamps: true }
);

export const Language = mongoose.model<ILanguage>('Language', LanguageSchema);

export interface ILanguageSeed {
  code: string;
  name: string;
  nativeName: string;
  flagIcon: string;
  isDefault: boolean;
  isActive: boolean;
  order: number;
  ttsVoiceConfig: {
    provider: string;
    voiceName: string;
    gender: 'female' | 'male';
    speed: number;
    pitch: number;
  };
}

// Hạt giống danh mục ngôn ngữ chuẩn cho Bảo tàng Lịch sử TP.HCM
export const DEFAULT_LANGUAGES: ILanguageSeed[] = [
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flagIcon: '🇻🇳',
    isDefault: true,
    isActive: true,
    order: 1,
    ttsVoiceConfig: {
      provider: 'google',
      voiceName: 'vi-VN-Standard-A',
      gender: 'female',
      speed: 1.0,
      pitch: 0.0
    }
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flagIcon: '🇬🇧',
    isDefault: false,
    isActive: true,
    order: 2,
    ttsVoiceConfig: {
      provider: 'google',
      voiceName: 'en-US-Neural2-F',
      gender: 'female',
      speed: 1.0,
      pitch: 0.0
    }
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flagIcon: '🇫🇷',
    isDefault: false,
    isActive: true, // Lịch sử Bảo tàng có mối liên hệ kiến trúc Đông Dương (Pháp)
    order: 3,
    ttsVoiceConfig: {
      provider: 'google',
      voiceName: 'fr-FR-Neural2-A',
      gender: 'female',
      speed: 1.0,
      pitch: 0.0
    }
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flagIcon: '🇯🇵',
    isDefault: false,
    isActive: false,
    order: 4,
    ttsVoiceConfig: {
      provider: 'google',
      voiceName: 'ja-JP-Neural2-B',
      gender: 'female',
      speed: 1.0,
      pitch: 0.0
    }
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文 (简体)',
    flagIcon: '🇨🇳',
    isDefault: false,
    isActive: false,
    order: 5,
    ttsVoiceConfig: {
      provider: 'google',
      voiceName: 'cmn-CN-Wavenet-A',
      gender: 'female',
      speed: 1.0,
      pitch: 0.0
    }
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flagIcon: '🇰🇷',
    isDefault: false,
    isActive: false,
    order: 6,
    ttsVoiceConfig: {
      provider: 'google',
      voiceName: 'ko-KR-Neural2-A',
      gender: 'female',
      speed: 1.0,
      pitch: 0.0
    }
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flagIcon: '🇩🇪',
    isDefault: false,
    isActive: false,
    order: 7,
    ttsVoiceConfig: {
      provider: 'google',
      voiceName: 'de-DE-Neural2-F',
      gender: 'female',
      speed: 1.0,
      pitch: 0.0
    }
  }
];

export async function seedDefaultLanguages() {
  try {
    for (const lang of DEFAULT_LANGUAGES) {
      const exists = await Language.findOne({ code: lang.code });
      if (!exists) {
        await Language.create(lang);
      }
    }
    console.log('[Language Registry] Đã kiểm tra và nạp danh mục ngôn ngữ mặc định thành công.');
  } catch (err: any) {
    console.warn('[Language Registry Seed Warning]:', err.message);
  }
}
