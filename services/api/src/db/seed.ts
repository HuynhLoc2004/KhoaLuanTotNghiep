import type {
  RoleEntity,
  UserEntity,
  CmsPageEntity,
  CmsSectionEntity,
  ArtifactEntity,
  MediaAssetEntity,
} from "./schema.js";

export const SEED_ROLES: RoleEntity[] = [
  {
    id: "role-admin",
    name: "ADMIN",
    permissions: ["*"],
    createdAt: "2026-08-03T12:00:00Z",
    updatedAt: "2026-08-03T12:00:00Z",
  },
  {
    id: "role-curator",
    name: "CURATOR",
    permissions: ["cms:read", "cms:write", "artifact:read", "artifact:write"],
    createdAt: "2026-08-03T12:00:00Z",
    updatedAt: "2026-08-03T12:00:00Z",
  },
  {
    id: "role-visitor",
    name: "VISITOR",
    permissions: ["public:read"],
    createdAt: "2026-08-03T12:00:00Z",
    updatedAt: "2026-08-03T12:00:00Z",
  },
];

export const SEED_USERS: UserEntity[] = [
  {
    id: "user-thanh",
    username: "vithanh135",
    email: "trinhvidanhthanh@gmail.com",
    roleId: "role-admin",
    status: "ACTIVE",
    createdAt: "2026-08-03T12:00:00Z",
    updatedAt: "2026-08-03T12:00:00Z",
  },
  {
    id: "user-loc",
    username: "huynhtanloc2004",
    email: "huynhtanlocpp09@gmail.com",
    roleId: "role-admin",
    status: "ACTIVE",
    createdAt: "2026-08-03T12:00:00Z",
    updatedAt: "2026-08-03T12:00:00Z",
  },
];

export const SEED_PAGES: CmsPageEntity[] = [
  {
    id: "page-home",
    slug: "home",
    title: "Trang Chủ Bảo Tàng Lịch Sử TP.HCM",
    status: "PUBLISHED",
    publishedAt: "2026-08-03T12:00:00Z",
    createdAt: "2026-08-03T12:00:00Z",
    updatedAt: "2026-08-03T12:00:00Z",
  },
];

export const SEED_SECTIONS: CmsSectionEntity[] = [
  {
    id: "sec-hero-01",
    pageId: "page-home",
    type: "hero",
    order: 1,
    configJson: {
      title: "Hành Trình Khám Phá Di Sản Số",
      subtitle: "Bảo tàng Lịch sử Thành phố Hồ Chí Minh",
      ctaText: "Khám Phá Bản Đồ 3D",
      ctaLink: "/map-3d",
    },
    createdAt: "2026-08-03T12:00:00Z",
  },
];

export const SEED_ARTIFACTS: ArtifactEntity[] = [
  {
    id: "art-dong-son-01",
    code: "ART-DS-001",
    title: "Trống Đồng Đông Sơn",
    period: "Văn hóa Đông Sơn (Thế kỷ V - I TCN)",
    status: "PUBLISHED",
    metadataJson: {
      material: "Đồng thau",
      dimensions: "Đường kính 60cm, cao 50cm",
      "3dModelUrl": "/models/dong-son-drum.glb",
    },
    createdAt: "2026-08-03T12:00:00Z",
    updatedAt: "2026-08-03T12:00:00Z",
  },
  {
    id: "art-oc-eo-01",
    code: "ART-OE-002",
    title: "Tượng Thần Vishnu Óc Eo",
    period: "Văn hóa Óc Eo (Thế kỷ II - VII)",
    status: "PUBLISHED",
    metadataJson: {
      material: "Đá sa thạch",
      "3dModelUrl": "/models/vishnu-statue.glb",
    },
    createdAt: "2026-08-03T12:00:00Z",
    updatedAt: "2026-08-03T12:00:00Z",
  },
];

export const SEED_MEDIA: MediaAssetEntity[] = [
  {
    id: "media-drum-thumb",
    filename: "dong-son-drum-thumb.webp",
    mimeType: "image/webp",
    url: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?q=80&w=800",
    sizeBytes: 245000,
    createdAt: "2026-08-03T12:00:00Z",
  },
];
