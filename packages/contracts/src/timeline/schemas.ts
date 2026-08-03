import { z } from "zod";

export const ExplorationModeSchema = z.enum(["FREE_EXPLORE", "GUIDED_JOURNEY"]);
export type ExplorationMode = z.infer<typeof ExplorationModeSchema>;

export const NarrativeNodeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  period: z.string().min(1),
  description: z.string(),
  artifactId: z.string().optional(),
  artifactCode: z.string().optional(),
  mediaUrl: z.string().optional(),
});
export type NarrativeNode = z.infer<typeof NarrativeNodeSchema>;

export const NarrativeJourneySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  theme: z.string().min(1),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  nodes: z.array(NarrativeNodeSchema),
});
export type NarrativeJourney = z.infer<typeof NarrativeJourneySchema>;

export const RelationTypeSchema = z.enum([
  "SAME_PERIOD",
  "SAME_CULTURE",
  "SAME_DYNASTY",
  "RELATED_THEME",
]);
export type RelationType = z.infer<typeof RelationTypeSchema>;

export const RelatedArtifactSchema = z.object({
  artifactId: z.string().min(1),
  code: z.string().min(1),
  title: z.string().min(1),
  relationType: RelationTypeSchema,
  reason: z.string().min(1),
});
export type RelatedArtifact = z.infer<typeof RelatedArtifactSchema>;

export const TimelineJourneysResponseSchema = z.object({
  data: z.array(NarrativeJourneySchema),
});
export type TimelineJourneysResponse = z.infer<typeof TimelineJourneysResponseSchema>;
