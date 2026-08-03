import { z } from "zod";

export const HealthStatusResponseSchema = z.object({
  status: z.enum(["ok", "degraded", "error"]),
  service: z.string(),
  version: z.string(),
  timestamp: z.string(),
  uptime: z.number(),
});

export type HealthStatusResponse = z.infer<typeof HealthStatusResponseSchema>;
