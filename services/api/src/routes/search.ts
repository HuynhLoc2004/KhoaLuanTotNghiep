import { Router } from "express";
import type { Request, Response } from "express";
import {
  type SearchContentType,
  type SearchResponse,
  type SearchResultItem,
  type SearchSuggestResponse,
  SearchQueryRequestSchema,
  SearchSuggestRequestSchema,
} from "@hcmc-museum/contracts";

export const searchRouter: Router = Router();

// Helper to remove Vietnamese diacritics for normalization
export function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export const SAMPLE_SEARCH_CATALOG: SearchResultItem[] = [
  {
    id: "art-ds-01",
    code: "ART-DS-001",
    type: "artifact",
    title: "Trống Đồng Đông Sơn",
    subtitle: "Báu vật nghệ thuật đúc đồng cổ đại",
    summary: "Biểu tượng văn hóa đặc sắc của thời kỳ Đông Sơn rực rỡ với hoa văn mặt trời và chim lạc.",
    thumbnailUrl: "/assets/images/dong-son-drum.jpg",
    score: 0.98,
    highlights: [],
  },
  {
    id: "art-oe-01",
    code: "ART-OE-002",
    type: "artifact",
    title: "Tượng Thần Vishnu Óc Eo",
    subtitle: "Điêu khắc đá Phù Nam",
    summary: "Kiệt tác tạc tượng đá mịn màu xám đen thể hiện nét thẩm mỹ tinh xảo của nền văn minh Óc Eo.",
    thumbnailUrl: "/assets/images/vishnu.jpg",
    score: 0.91,
    highlights: [],
  },
  {
    id: "exh-dong-son-01",
    code: "EXH-001",
    type: "exhibition",
    title: "Triển Lãm Di Sản Văn Hóa Đông Sơn",
    subtitle: "Phòng trưng bày chuyên đề Cổ đại",
    summary: "Không gian trưng bày hơn 200 hiện vật đồ đồng, đồ gốm tiêu biểu thế kỷ V TCN.",
    thumbnailUrl: "/assets/images/exhibition-ds.jpg",
    score: 0.85,
    highlights: [],
  },
  {
    id: "news-museum-01",
    code: "NEWS-001",
    type: "news",
    title: "Bảo Tàng Lịch Sử TP.HCM Đón Báu Vật Quốc Gia Mới",
    subtitle: "Tin tức sự kiện",
    summary: "Lễ tiếp nhận và bảo tồn di vật khảo cổ quý hiếm triều Nguyễn.",
    thumbnailUrl: "/assets/images/news-01.jpg",
    score: 0.80,
    highlights: [],
  },
  {
    id: "tour-highlight-01",
    code: "TOUR-001",
    type: "tour",
    title: "Tour Khám Phá 30 Phút: Từ Cổ Đại Đến Triều Nguyễn",
    subtitle: "Hành trình điểm nhấn",
    summary: "Trải nghiệm dẫn đường 3D và hướng dẫn viên AI khám phá các bảo vật tiêu biểu nhất.",
    thumbnailUrl: "/assets/images/tour-01.jpg",
    score: 0.88,
    highlights: [],
  },
];

// GET /api/v1/search
searchRouter.get("/api/v1/search", (req: Request, res: Response) => {
  const parseResult = SearchQueryRequestSchema.safeParse({
    q: req.query.q,
    types: req.query.types
      ? Array.isArray(req.query.types)
        ? req.query.types
        : typeof req.query.types === "string"
        ? req.query.types.split(",")
        : undefined
      : undefined,
    locale: req.query.locale,
    cursor: req.query.cursor,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  });

  if (!parseResult.success) {
    return res.status(400).json({
      error: "INVALID_QUERY_PARAMS",
      details: parseResult.error.format(),
    });
  }

  const { q, types, limit } = parseResult.data;
  const normalizedQuery = removeVietnameseTones(q.trim());

  // Filter by query and content types
  let filtered = SAMPLE_SEARCH_CATALOG.filter((item) => {
    if (types && types.length > 0) {
      if (!types.includes(item.type)) return false;
    }

    if (!normalizedQuery) return true;

    const normTitle = removeVietnameseTones(item.title);
    const normSummary = removeVietnameseTones(item.summary);
    const normCode = removeVietnameseTones(item.code || "");
    const normSubtitle = removeVietnameseTones(item.subtitle || "");

    return (
      normTitle.includes(normalizedQuery) ||
      normSummary.includes(normalizedQuery) ||
      normCode.includes(normalizedQuery) ||
      normSubtitle.includes(normalizedQuery)
    );
  });

  // Highlight matches
  const itemsWithHighlights: SearchResultItem[] = filtered.slice(0, limit).map((item) => {
    const highlights: string[] = [];
    if (q.trim()) {
      if (removeVietnameseTones(item.title).includes(normalizedQuery)) {
        highlights.push(`Khớp tiêu đề: "${item.title}"`);
      }
      if (removeVietnameseTones(item.summary).includes(normalizedQuery)) {
        highlights.push(`Khớp mô tả: "${item.summary}"`);
      }
    }
    return {
      ...item,
      highlights,
    };
  });

  // Calculate facets count across all content types
  const ALL_TYPES: SearchContentType[] = ["artifact", "exhibition", "news", "tour"];
  const facets = ALL_TYPES.map((t) => ({
    type: t,
    count: SAMPLE_SEARCH_CATALOG.filter(
      (item) =>
        item.type === t &&
        (!normalizedQuery ||
          removeVietnameseTones(item.title).includes(normalizedQuery) ||
          removeVietnameseTones(item.summary).includes(normalizedQuery)),
    ).length,
  }));

  const response: SearchResponse = {
    items: itemsWithHighlights,
    total: filtered.length,
    facets,
    querySuggestion:
      filtered.length === 0 && q.trim().length > 0 ? "Đông Sơn" : undefined,
  };

  return res.json(response);
});

// GET /api/v1/search/suggest
searchRouter.get("/api/v1/search/suggest", (req: Request, res: Response) => {
  const parseResult = SearchSuggestRequestSchema.safeParse({
    q: req.query.q,
    locale: req.query.locale,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  });

  const query = parseResult.success ? parseResult.data.q.trim() : "";
  const normQuery = removeVietnameseTones(query);

  const allTitles = SAMPLE_SEARCH_CATALOG.map((i) => i.title);
  const suggestions = allTitles
    .filter((title) => removeVietnameseTones(title).includes(normQuery))
    .slice(0, parseResult.success ? parseResult.data.limit : 5);

  const featured = SAMPLE_SEARCH_CATALOG.slice(0, 2);

  const response: SearchSuggestResponse = {
    suggestions,
    featured,
  };

  return res.json(response);
});
