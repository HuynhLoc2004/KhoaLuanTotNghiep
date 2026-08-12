import { z } from "zod";

export const DashboardOverviewMetricSchema = z.object({
  totalVisitors: z.number().int().nonnegative(),
  activeExhibitions: z.number().int().nonnegative(),
  totalArtifacts: z.number().int().nonnegative(),
  qrScansTotal: z.number().int().nonnegative(),
  aiGuideQueriesCount: z.number().int().nonnegative(),
  periodLabel: z.string().min(1),
});
export type DashboardOverviewMetric = z.infer<typeof DashboardOverviewMetricSchema>;

export const DashboardPopularArtifactSchema = z.object({
  artifactId: z.string().min(1),
  code: z.string().min(1),
  title: z.string().min(1),
  viewsCount: z.number().int().nonnegative(),
  bookmarksCount: z.number().int().nonnegative(),
  category: z.string().min(1),
});
export type DashboardPopularArtifact = z.infer<typeof DashboardPopularArtifactSchema>;

export const DashboardTrafficSeriesSchema = z.object({
  timestamp: z.string().min(1),
  visitorsCount: z.number().int().nonnegative(),
  viewsCount: z.number().int().nonnegative(),
});
export type DashboardTrafficSeries = z.infer<typeof DashboardTrafficSeriesSchema>;

export const DashboardSummaryResponseSchema = z.object({
  metrics: DashboardOverviewMetricSchema,
  topArtifacts: z.array(DashboardPopularArtifactSchema),
  trafficSeries: z.array(DashboardTrafficSeriesSchema),
  systemHealthStatus: z.enum(["HEALTHY", "DEGRADED", "CRITICAL"]),
  lastUpdated: z.string().min(1),
});
export type DashboardSummaryResponse = z.infer<typeof DashboardSummaryResponseSchema>;
