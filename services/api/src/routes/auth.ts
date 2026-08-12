import { Router } from "express";
import type { Request, Response } from "express";
import {
  AuthTokenRequestSchema,
  UserBookmarkRequestSchema,
  UserHistoryRequestSchema,
} from "@hcmc-museum/contracts";
import type { UserBookmarkItem, UserHistoryItem, UserProfile } from "@hcmc-museum/contracts";

export const authRouter: Router = Router();

// In-memory data store for Bookmarks & History MVP
const sampleBookmarks: UserBookmarkItem[] = [
  {
    id: "bm-01",
    artifactId: "art-001",
    title: "Trống Đồng Đông Sơn",
    type: "artifact",
    createdAt: "2026-08-12T10:00:00.000Z",
  },
  {
    id: "bm-02",
    artifactId: "art-002",
    title: "Tượng Thần Vishnu Óc Eo",
    type: "artifact",
    createdAt: "2026-08-12T11:30:00.000Z",
  },
];

const sampleHistory: UserHistoryItem[] = [
  {
    id: "hist-01",
    action: "VIEW_ARTIFACT",
    targetId: "art-001",
    title: "Trống Đồng Đông Sơn",
    timestamp: "2026-08-12T15:30:00.000Z",
  },
  {
    id: "hist-02",
    action: "SEARCH",
    targetId: "query-oc-eo",
    title: "Tìm kiếm 'Óc Eo'",
    timestamp: "2026-08-12T16:00:00.000Z",
  },
];

// Keycloak Server Configuration endpoint
authRouter.get("/config", (_req: Request, res: Response) => {
  const realm = process.env.KEYCLOAK_REALM ?? "hcmc-museum";
  const clientId = process.env.KEYCLOAK_CLIENT_ID ?? "hcmc-museum-web";
  const hostPort = process.env.KEYCLOAK_HOST_PORT ?? "18080";
  const authServerUrl = process.env.KEYCLOAK_URL ?? `http://localhost:${hostPort}`;

  res.json({
    realm,
    clientId,
    authServerUrl,
    enabled: true,
  });
});

// Login / Token exchange endpoint
authRouter.post("/login", (req: Request, res: Response) => {
  const parseResult = AuthTokenRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "INVALID_AUTH_REQUEST",
      details: parseResult.error.issues,
    });
  }

  const { token, guestId } = parseResult.data;

  const mockUser: UserProfile = {
    id: token ? "usr-keycloak-01" : (guestId ?? "usr-guest-999"),
    username: token ? "loc_huynh_kc" : "khach_tham_quan",
    email: token ? "loc@hcmc-museum.vn" : undefined,
    fullName: token ? "Huỳnh Tấn Lộc (Keycloak SSO)" : "Khách tham quan",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    roles: token ? ["member", "editor"] : ["visitor"],
    provider: token ? "keycloak" : "guest",
  };

  const accessToken =
    token ?? `jwt_mock_${String(Date.now())}_${Math.random().toString(36).slice(2)}`;

  return res.json({
    accessToken,
    tokenType: "Bearer",
    expiresIn: 3600,
    user: mockUser,
  });
});

// User Profile endpoint (/me)
authRouter.get("/me", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const isKeycloakToken = authHeader?.startsWith("Bearer keycloak_");

  const user: UserProfile = {
    id: isKeycloakToken ? "usr-kc-777" : "usr-loc-01",
    username: isKeycloakToken ? "keycloak_visitor" : "huynh_tan_loc",
    email: "huynhtanlocpp09@gmail.com",
    fullName: "Huỳnh Tấn Lộc",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    roles: ["member", "editor"],
    provider: "keycloak",
  };

  return res.json({ user });
});

// Get user bookmarks
authRouter.get("/bookmarks", (_req: Request, res: Response) => {
  return res.json({
    items: sampleBookmarks,
    total: sampleBookmarks.length,
  });
});

// Add user bookmark
authRouter.post("/bookmarks", (req: Request, res: Response) => {
  const parseResult = UserBookmarkRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "INVALID_BOOKMARK_DATA",
      details: parseResult.error.issues,
    });
  }

  const newBookmark: UserBookmarkItem = {
    id: `bm-${String(Date.now())}`,
    artifactId: parseResult.data.artifactId,
    title: parseResult.data.title,
    type: parseResult.data.type,
    createdAt: new Date().toISOString(),
  };

  sampleBookmarks.unshift(newBookmark);

  return res.status(201).json({
    message: "Lưu hiện vật thành công",
    item: newBookmark,
  });
});

// Get user browsing history
authRouter.get("/history", (_req: Request, res: Response) => {
  return res.json({
    items: sampleHistory,
    total: sampleHistory.length,
  });
});

// Add user history entry
authRouter.post("/history", (req: Request, res: Response) => {
  const parseResult = UserHistoryRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "INVALID_HISTORY_DATA",
      details: parseResult.error.issues,
    });
  }

  const newHistory: UserHistoryItem = {
    id: `hist-${String(Date.now())}`,
    action: parseResult.data.action,
    targetId: parseResult.data.targetId,
    title: parseResult.data.title,
    timestamp: new Date().toISOString(),
  };

  sampleHistory.unshift(newHistory);

  return res.status(201).json({
    message: "Ghi nhận lịch sử thành công",
    item: newHistory,
  });
});
