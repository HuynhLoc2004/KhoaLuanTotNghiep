export type CmsBlockType = "hero" | "artifact_grid" | "timeline_preview" | "banner";

export interface CmsHeroBlock {
  type: "hero";
  id: string;
  title: string;
  subtitle: string;
  ctaText?: string | undefined;
  ctaLink?: string | undefined;
  backgroundImageUrl?: string | undefined;
}

export interface ArtifactSummary {
  id: string;
  name: string;
  period: string;
  imageUrl?: string | undefined;
  category: string;
  is3dAvailable: boolean;
}

export interface CmsArtifactGridBlock {
  type: "artifact_grid";
  id: string;
  title: string;
  subtitle?: string | undefined;
  artifacts: ArtifactSummary[];
}

export interface TimelineEventSummary {
  year: string;
  title: string;
  description: string;
}

export interface CmsTimelinePreviewBlock {
  type: "timeline_preview";
  id: string;
  title: string;
  events: TimelineEventSummary[];
}

export interface CmsBannerBlock {
  type: "banner";
  id: string;
  title: string;
  message: string;
  variant: "info" | "warning" | "announcement";
}

export type CmsBlock =
  CmsHeroBlock | CmsArtifactGridBlock | CmsTimelinePreviewBlock | CmsBannerBlock;

export interface CmsPagePayload {
  pageId: string;
  slug: string;
  title: string;
  metaDescription?: string | undefined;
  blocks: CmsBlock[];
}

export interface CmsRenderedBlock {
  blockId: string;
  type: CmsBlockType;
  html: string;
  metadata: Record<string, unknown>;
}
