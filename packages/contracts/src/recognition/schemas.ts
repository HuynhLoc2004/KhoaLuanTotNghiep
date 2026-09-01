import { z } from "zod";

export const RecognitionStatusSchema = z.enum(["MATCHED", "LOW_CONFIDENCE", "UNKNOWN"]);
export type RecognitionStatus = z.infer<typeof RecognitionStatusSchema>;

export const RecognitionCandidateSchema = z.object({
  artifactId: z.string(),
  title: z.string(),
  score: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  matchedZone: z.boolean(),
});
export type RecognitionCandidate = z.infer<typeof RecognitionCandidateSchema>;

export const RecognitionIdentifyRequestSchema = z.object({
  imageBase64: z.string().min(1),
  zoneHint: z.string().optional(),
});
export type RecognitionIdentifyRequest = z.infer<typeof RecognitionIdentifyRequestSchema>;

export const RecognitionIdentifyResponseSchema = z.object({
  status: RecognitionStatusSchema,
  candidates: z.array(RecognitionCandidateSchema),
  matchThreshold: z.number(),
  lowConfidenceThreshold: z.number(),
});
export type RecognitionIdentifyResponse = z.infer<typeof RecognitionIdentifyResponseSchema>;

export const RecognitionFeedbackRequestSchema = z.object({
  artifactId: z.string(),
  confirmed: z.boolean(),
  correctedArtifactId: z.string().optional(),
});
export type RecognitionFeedbackRequest = z.infer<typeof RecognitionFeedbackRequestSchema>;

export const RecognitionFeedbackResponseSchema = z.object({
  received: z.boolean(),
});
export type RecognitionFeedbackResponse = z.infer<typeof RecognitionFeedbackResponseSchema>;

export const RecognitionReferenceSchema = z.object({
  artifactId: z.string(),
  title: z.string().min(1),
  zoneId: z.string().optional(),
  descriptorDimensions: z.number().int().positive(),
  updatedAt: z.string(),
});
export type RecognitionReference = z.infer<typeof RecognitionReferenceSchema>;

export const RecognitionReferenceListResponseSchema = z.object({
  items: z.array(RecognitionReferenceSchema),
});
export type RecognitionReferenceListResponse = z.infer<
  typeof RecognitionReferenceListResponseSchema
>;

export const RecognitionReferenceUpsertRequestSchema = z.object({
  artifactId: z.string().min(1),
  title: z.string().min(1),
  imageBase64: z.string().min(1),
  zoneId: z.string().optional(),
});
export type RecognitionReferenceUpsertRequest = z.infer<
  typeof RecognitionReferenceUpsertRequestSchema
>;
