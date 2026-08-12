import { z } from "zod";

export const SearchContentTypeSchema = z.enum(["artifact", "exhibition", "news", "tour"]);
export type SearchContentType = z.infer<typeof SearchContentTypeSchema>;

export const SearchQueryRequestSchema = z.object({
  q: z.string().default(""),
  types: z.array(SearchContentTypeSchema).optional(),
  locale: z.enum(["vi", "en"]).default("vi"),
  cursor: z.string().optional(),
  limit: z.number().int().positive().max(100).default(20),
});
export type SearchQueryRequest = z.infer<typeof SearchQueryRequestSchema>;

export const SearchResultItemSchema = z.object({
  id: z.string().min(1),
  code: z.string().optional(),
  type: SearchContentTypeSchema,
  title: z.string().min(1),
  subtitle: z.string().optional(),
  summary: z.string(),
  thumbnailUrl: z.string().optional(),
  score: z.number(),
  highlights: z.array(z.string()).default([]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type SearchResultItem = z.infer<typeof SearchResultItemSchema>;

export const SearchFacetCountSchema = z.object({
  type: SearchContentTypeSchema,
  count: z.number().int().nonnegative(),
});
export type SearchFacetCount = z.infer<typeof SearchFacetCountSchema>;

export const SearchResponseSchema = z.object({
  items: z.array(SearchResultItemSchema),
  total: z.number().int().nonnegative(),
  facets: z.array(SearchFacetCountSchema),
  nextCursor: z.string().nullable().optional(),
  querySuggestion: z.string().optional(),
});
export type SearchResponse = z.infer<typeof SearchResponseSchema>;

export const SearchSuggestRequestSchema = z.object({
  q: z.string().default(""),
  locale: z.enum(["vi", "en"]).default("vi"),
  limit: z.number().int().positive().max(20).default(5),
});
export type SearchSuggestRequest = z.infer<typeof SearchSuggestRequestSchema>;

export const SearchSuggestResponseSchema = z.object({
  suggestions: z.array(z.string()),
  featured: z.array(SearchResultItemSchema).default([]),
});
export type SearchSuggestResponse = z.infer<typeof SearchSuggestResponseSchema>;
