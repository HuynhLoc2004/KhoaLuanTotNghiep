import { z } from "zod";

export const ThreeDHotspotSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  position: z.tuple([z.number(), z.number(), z.number()]),
  audioUrl: z.string().optional(),
});

export type ThreeDHotspot = z.infer<typeof ThreeDHotspotSchema>;

export const ThreeDModelConfigSchema = z.object({
  artifactCode: z.string().min(1),
  title: z.string().min(1),
  modelUrl: z.string().min(1),
  thumbnailUrl: z.string().optional(),
  cameraPreset: z.object({
    position: z.tuple([z.number(), z.number(), z.number()]),
    target: z.tuple([z.number(), z.number(), z.number()]),
    fov: z.number().default(45),
  }),
  hotspots: z.array(ThreeDHotspotSchema).default([]),
  spatialDepthTheme: z.string().default("emerald-gold-3d"),
});

export type ThreeDModelConfig = z.infer<typeof ThreeDModelConfigSchema>;

export const ThreeDFloorPoiSchema = z.object({
  nodeId: z.string().min(1),
  label: z.string().min(1),
  floorLevel: z.number().int(),
  coordinates: z.tuple([z.number(), z.number()]),
});

export type ThreeDFloorPoi = z.infer<typeof ThreeDFloorPoiSchema>;

export const ThreeDRouteRequestSchema = z.object({
  startNodeId: z.string().min(1),
  targetNodeId: z.string().min(1),
  wheelchairAccessible: z.boolean().optional().default(false),
});

export type ThreeDRouteRequest = z.infer<typeof ThreeDRouteRequestSchema>;

export const ThreeDRouteResponseSchema = z.object({
  pathNodeIds: z.array(z.string()).min(1),
  totalDistanceMeters: z.number().nonnegative(),
  estimatedMinutes: z.number().nonnegative(),
  stepsInstruction: z.array(z.string()).default([]),
});

export type ThreeDRouteResponse = z.infer<typeof ThreeDRouteResponseSchema>;

/* 360° Museum Room Panorama Street View Schema (Google Street View style room navigation) */
export const RoomNavArrowSchema = z.object({
  targetRoomId: z.string().min(1),
  label: z.string().min(1),
  directionAngleDegrees: z.number().default(0),
});

export type RoomNavArrow = z.infer<typeof RoomNavArrowSchema>;

export const RoomPanoramaNodeSchema = z.object({
  roomId: z.string().min(1),
  roomName: z.string().min(1),
  floorLevel: z.number().int().default(1),
  panoramaImageUrl: z.string().min(1),
  qrCodeToken: z.string().min(1),
  navArrows: z.array(RoomNavArrowSchema).default([]),
  hotspots: z.array(ThreeDHotspotSchema).default([]),
});

export type RoomPanoramaNode = z.infer<typeof RoomPanoramaNodeSchema>;
