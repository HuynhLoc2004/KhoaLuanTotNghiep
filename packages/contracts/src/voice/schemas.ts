import { z } from "zod";

export const VoiceLocaleSchema = z.enum(["vi", "en"]);
export type VoiceLocale = z.infer<typeof VoiceLocaleSchema>;

export const VoiceScriptStatusSchema = z.enum(["DRAFT", "REVIEWED", "PUBLISHED"]);
export type VoiceScriptStatus = z.infer<typeof VoiceScriptStatusSchema>;

export const VoiceScriptSchema = z.object({
  id: z.string(),
  artifactId: z.string().optional(),
  locale: VoiceLocaleSchema,
  title: z.string().min(1),
  text: z.string().min(1),
  status: VoiceScriptStatusSchema,
  updatedAt: z.string(),
});
export type VoiceScript = z.infer<typeof VoiceScriptSchema>;

export const VoiceScriptListResponseSchema = z.object({
  items: z.array(VoiceScriptSchema),
  total: z.number(),
});
export type VoiceScriptListResponse = z.infer<typeof VoiceScriptListResponseSchema>;

export const VoiceScriptUpsertRequestSchema = z.object({
  id: z.string().optional(),
  artifactId: z.string().optional(),
  locale: VoiceLocaleSchema,
  title: z.string().min(1),
  text: z.string().min(1),
  status: VoiceScriptStatusSchema.default("DRAFT"),
});
export type VoiceScriptUpsertRequest = z.infer<typeof VoiceScriptUpsertRequestSchema>;

export const VoiceGlossaryTermSchema = z.object({
  term: z.string().min(1),
  locale: VoiceLocaleSchema,
  pronunciation: z.string().min(1),
});
export type VoiceGlossaryTerm = z.infer<typeof VoiceGlossaryTermSchema>;

export const VoiceEngineSchema = z.enum(["web-speech-client", "cloud-provider"]);
export type VoiceEngine = z.infer<typeof VoiceEngineSchema>;

export const VoiceSynthesizeRequestSchema = z.object({
  scriptId: z.string().optional(),
  text: z.string().min(1).optional(),
  locale: VoiceLocaleSchema.default("vi"),
  voiceId: z.string().default("default"),
  speed: z.number().min(0.5).max(2).default(1),
});
export type VoiceSynthesizeRequest = z.infer<typeof VoiceSynthesizeRequestSchema>;

export const VoiceCostEstimateSchema = z.object({
  engine: VoiceEngineSchema,
  amount: z.number(),
  currency: z.string(),
});
export type VoiceCostEstimate = z.infer<typeof VoiceCostEstimateSchema>;

export const VoiceSynthesizeResponseSchema = z.object({
  cacheKey: z.string(),
  cached: z.boolean(),
  engine: VoiceEngineSchema,
  ssmlText: z.string(),
  plainText: z.string(),
  locale: VoiceLocaleSchema,
  voiceId: z.string(),
  speed: z.number(),
  estimatedDurationSeconds: z.number(),
  costEstimate: VoiceCostEstimateSchema,
});
export type VoiceSynthesizeResponse = z.infer<typeof VoiceSynthesizeResponseSchema>;

export const VoiceCommandIntentSchema = z.enum([
  "NAVIGATE",
  "PLAY",
  "PAUSE",
  "REPEAT",
  "STOP",
  "UNKNOWN",
]);
export type VoiceCommandIntent = z.infer<typeof VoiceCommandIntentSchema>;

export const VoiceCommandRequestSchema = z.object({
  transcript: z.string().min(1),
  locale: VoiceLocaleSchema.default("vi"),
});
export type VoiceCommandRequest = z.infer<typeof VoiceCommandRequestSchema>;

export const VoiceCommandResponseSchema = z.object({
  intent: VoiceCommandIntentSchema,
  targetSlug: z.string().optional(),
  confidence: z.number().min(0).max(1),
  message: z.string(),
});
export type VoiceCommandResponse = z.infer<typeof VoiceCommandResponseSchema>;

export const VoiceAdminConfigSchema = z.object({
  version: z.number().int().nonnegative(),
  glossary: z.array(VoiceGlossaryTermSchema),
  cloudEngineEnabled: z.boolean(),
  updatedAt: z.string(),
});
export type VoiceAdminConfig = z.infer<typeof VoiceAdminConfigSchema>;

export const VoiceAdminConfigUpdateSchema = z.object({
  glossary: z.array(VoiceGlossaryTermSchema).optional(),
  cloudEngineEnabled: z.boolean().optional(),
});
export type VoiceAdminConfigUpdate = z.infer<typeof VoiceAdminConfigUpdateSchema>;

export const VoiceCostEstimateRequestSchema = z.object({
  scriptIds: z.array(z.string()).min(1),
});
export type VoiceCostEstimateRequest = z.infer<typeof VoiceCostEstimateRequestSchema>;

export const VoiceCostEstimateResponseSchema = z.object({
  engine: VoiceEngineSchema,
  characterCount: z.number(),
  estimatedCost: z.number(),
  currency: z.string(),
  scriptsAlreadyCached: z.number(),
  scriptsToGenerate: z.number(),
  note: z.string(),
});
export type VoiceCostEstimateResponse = z.infer<typeof VoiceCostEstimateResponseSchema>;
