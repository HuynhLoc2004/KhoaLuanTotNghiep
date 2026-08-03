import type {
  RoleEntity,
  UserEntity,
  CmsPageEntity,
  CmsSectionEntity,
  ArtifactEntity,
  MediaAssetEntity,
} from "./schema.js";
import {
  SEED_ROLES,
  SEED_USERS,
  SEED_PAGES,
  SEED_SECTIONS,
  SEED_ARTIFACTS,
  SEED_MEDIA,
} from "./seed.js";

export class DatabaseRepository {
  private rolesMap = new Map<string, RoleEntity>();
  private usersMap = new Map<string, UserEntity>();
  private pagesMap = new Map<string, CmsPageEntity>();
  private sectionsMap = new Map<string, CmsSectionEntity>();
  private artifactsMap = new Map<string, ArtifactEntity>();
  private mediaMap = new Map<string, MediaAssetEntity>();

  constructor() {
    this.seedDefaults();
  }

  public seedDefaults(): void {
    SEED_ROLES.forEach((r) => this.rolesMap.set(r.id, { ...r }));
    SEED_USERS.forEach((u) => this.usersMap.set(u.id, { ...u }));
    SEED_PAGES.forEach((p) => this.pagesMap.set(p.id, { ...p }));
    SEED_SECTIONS.forEach((s) => this.sectionsMap.set(s.id, { ...s }));
    SEED_ARTIFACTS.forEach((a) => this.artifactsMap.set(a.id, { ...a }));
    SEED_MEDIA.forEach((m) => this.mediaMap.set(m.id, { ...m }));
  }

  // Users & Roles
  public getRoleById(id: string): RoleEntity | undefined {
    return this.rolesMap.get(id);
  }

  public getUserById(id: string): UserEntity | undefined {
    return this.usersMap.get(id);
  }

  public getUserByUsername(username: string): UserEntity | undefined {
    return Array.from(this.usersMap.values()).find((u) => u.username === username);
  }

  // CMS Pages & Sections
  public getCmsPageBySlug(slug: string): CmsPageEntity | undefined {
    return Array.from(this.pagesMap.values()).find((p) => p.slug === slug);
  }

  public getCmsSectionsByPageId(pageId: string): CmsSectionEntity[] {
    return Array.from(this.sectionsMap.values())
      .filter((s) => s.pageId === pageId)
      .sort((a, b) => a.order - b.order);
  }

  // Artifacts
  public getAllArtifacts(): ArtifactEntity[] {
    return Array.from(this.artifactsMap.values());
  }

  public getArtifactByCode(code: string): ArtifactEntity | undefined {
    return Array.from(this.artifactsMap.values()).find((a) => a.code === code);
  }

  public createArtifact(artifact: ArtifactEntity): ArtifactEntity {
    this.artifactsMap.set(artifact.id, artifact);
    return artifact;
  }

  // Media
  public getMediaById(id: string): MediaAssetEntity | undefined {
    return this.mediaMap.get(id);
  }
}

export const dbRepository = new DatabaseRepository();
