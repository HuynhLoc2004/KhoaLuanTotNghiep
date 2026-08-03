export const packageIdentity = Object.freeze({
  kind: "service",
  name: "@hcmc-museum/api",
} as const);

export { createApp } from "./app.js";
export { dbRepository, DatabaseRepository } from "./db/client.js";
export { MigrationRunner, BASELINE_MIGRATIONS } from "./db/migrations.js";
export { SEED_ROLES, SEED_USERS, SEED_PAGES, SEED_ARTIFACTS, SEED_MEDIA } from "./db/seed.js";
export type {
  RoleEntity,
  UserEntity,
  CmsPageEntity,
  CmsSectionEntity,
  ArtifactEntity,
  MediaAssetEntity,
} from "./db/schema.js";
