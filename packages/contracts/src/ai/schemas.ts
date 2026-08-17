import { z } from "zod";

export const AiGuideSourceSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  sourceUrl: z.string().min(1),
  snippet: z.string().min(1),
});

export type AiGuideSource = z.infer<typeof AiGuideSourceSchema>;

export const AiGuideQueryRequestSchema = z.object({
  query: z.string().min(1, "Query must not be empty"),
  artifactId: z.string().optional(),
  journeyId: z.string().optional(),
  locale: z.enum(["vi", "en"]).default("vi"),
});

export type AiGuideQueryRequest = z.infer<typeof AiGuideQueryRequestSchema>;

export const AiGuideQueryResponseSchema = z.object({
  answer: z.string().min(1),
  confidenceScore: z.number().min(0).max(1),
  isGated: z.boolean(),
  sources: z.array(AiGuideSourceSchema),
  suggestedQuestions: z.array(z.string()),
  audioUrl: z.string().optional(),
});

export type AiGuideQueryResponse = z.infer<typeof AiGuideQueryResponseSchema>;

export const AiGuideAudioSpeakRequestSchema = z.object({
  text: z.string().min(1, "Text is required for speech synthesis"),
  locale: z.enum(["vi", "en"]).default("vi"),
  voiceId: z.string().default("vi-VN-Standard-A"),
});

export type AiGuideAudioSpeakRequest = z.infer<typeof AiGuideAudioSpeakRequestSchema>;

export const AiGuideAudioSpeakResponseSchema = z.object({
  audioUrl: z.string().min(1),
  durationSeconds: z.number().min(0),
  format: z.string().min(1),
});

export type AiGuideAudioSpeakResponse = z.infer<typeof AiGuideAudioSpeakResponseSchema>;
