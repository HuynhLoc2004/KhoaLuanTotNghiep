export interface RoleEntity {
  id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserEntity {
  id: string;
  username: string;
  email: string;
  roleId: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
}

export interface CmsPageEntity {
  id: string;
  slug: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface CmsSectionEntity {
  id: string;
  pageId: string;
  type: "hero" | "artifact_grid" | "timeline_preview" | "banner";
  order: number;
  configJson: Record<string, unknown>;
  createdAt: string;
}

export interface ArtifactEntity {
  id: string;
  code: string;
  title: string;
  period: string;
  status: "DRAFT" | "PUBLISHED";
  metadataJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAssetEntity {
  id: string;
  filename: string;
  mimeType: string;
  url: string;
  sizeBytes: number;
  createdAt: string;
}

export interface DatabaseSchema {
  roles: RoleEntity[];
  users: UserEntity[];
  cms_pages: CmsPageEntity[];
  cms_sections: CmsSectionEntity[];
  artifacts: ArtifactEntity[];
  media_assets: MediaAssetEntity[];
}
