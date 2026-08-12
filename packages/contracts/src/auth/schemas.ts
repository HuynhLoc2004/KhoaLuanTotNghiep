import { z } from "zod";

export const AuthRoleSchema = z.enum([
  "visitor",
  "member",
  "editor",
  "reviewer",
  "admin",
  "super_admin",
]);

export type AuthRole = z.infer<typeof AuthRoleSchema>;

export const UserProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().optional(),
  fullName: z.string().optional(),
  avatarUrl: z.string().optional(),
  roles: z.array(AuthRoleSchema).default(["visitor"]),
  provider: z.string().default("keycloak"),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const AuthTokenRequestSchema = z.object({
  token: z.string().optional(),
  code: z.string().optional(),
  redirectUri: z.string().optional(),
  guestId: z.string().optional(),
});

export type AuthTokenRequest = z.infer<typeof AuthTokenRequestSchema>;

export const AuthTokenResponseSchema = z.object({
  accessToken: z.string(),
  tokenType: z.string().default("Bearer"),
  expiresIn: z.number().default(3600),
  user: UserProfileSchema,
});

export type AuthTokenResponse = z.infer<typeof AuthTokenResponseSchema>;

export const UserBookmarkItemSchema = z.object({
  id: z.string(),
  artifactId: z.string(),
  title: z.string(),
  type: z.string().default("artifact"),
  createdAt: z.string(),
});

export type UserBookmarkItem = z.infer<typeof UserBookmarkItemSchema>;

export const UserBookmarkRequestSchema = z.object({
  artifactId: z.string(),
  title: z.string(),
  type: z.string().default("artifact"),
});

export type UserBookmarkRequest = z.infer<typeof UserBookmarkRequestSchema>;

export const UserHistoryItemSchema = z.object({
  id: z.string(),
  action: z.string(),
  targetId: z.string(),
  title: z.string(),
  timestamp: z.string(),
});

export type UserHistoryItem = z.infer<typeof UserHistoryItemSchema>;

export const UserHistoryRequestSchema = z.object({
  action: z.string(),
  targetId: z.string(),
  title: z.string(),
});

export type UserHistoryRequest = z.infer<typeof UserHistoryRequestSchema>;

export const KeycloakConfigResponseSchema = z.object({
  realm: z.string(),
  clientId: z.string(),
  authServerUrl: z.string(),
  enabled: z.boolean(),
});

export type KeycloakConfigResponse = z.infer<typeof KeycloakConfigResponseSchema>;
