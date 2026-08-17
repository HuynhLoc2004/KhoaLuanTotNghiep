import type { AiGuideAudioSpeakResponse, AiGuideQueryResponse } from "@hcmc-museum/contracts";
import { AiGuideAudioSpeakRequestSchema, AiGuideQueryRequestSchema } from "@hcmc-museum/contracts";
import { Router } from "express";

export const aiRouter: Router = Router();

// In-memory Museum Heritage Knowledge Base (RAG Dataset)
const KNOWLEDGE_BASE = [
  {
    keywords: ["bống bống dầu", "dầu", "khảo cổ", "hiện vật 001", "chiêng", "trống đống"],
    answer:
      "Bống bống dầu là vật phẩm di sản khảo cổ học độc đáo thuộc bộ sưu tập Văn hóa Đồng Nai, thể hiện đời sống tín ngưỡng và kỹ thuật đúc kim loại tinh xảo của cư dân cổ Nam Bộ.",
    sources: [
      {
        title: "Tư liệu Nghiên cứu Khảo cổ học Nam Bộ",
        author: "Bảo tàng Lịch sử TP.HCM",
        sourceUrl: "https://hcmc-museum.gov.vn/docs/khao-co-dong-nai",
        snippet: "Khai quật năm 1998 tại di chỉ khảo cổ Bình Đa, chất liệu đồng pha thiếc.",
      },
    ],
    suggestedQuestions: ["Chất liệu của bống bống dầu là gì?", "Di chỉ khảo cổ này nằm ở đâu?"],
  },
  {
    keywords: ["áo dài", "trang phục", "triều nguyễn", "hoàng cung"],
    answer:
      "Bộ sưu tập Áo dài Hoàng cung Triều Nguyễn thể hiện đỉnh cao nghệ thuật thêu tay, gấm vóc tơ lụa truyền thống Việt Nam với các họa tiết Rồng - Phượng tinh xảo dành cho hoàng tộc.",
    sources: [
      {
        title: "Trang phục Hoàng cung Triều Nguyễn",
        author: "Phân viện Văn hóa Nghệ thuật Quốc gia",
        sourceUrl: "https://hcmc-museum.gov.vn/docs/trang-phuc-trieu-nguyen",
        snippet: "Nghệ thuật thêu chỉ vàng trên nền gấm tía thế kỷ XIX.",
      },
    ],
    suggestedQuestions: [
      "Áo dài hoàng cung khác gì áo dài tân thời?",
      "Chất liệu lụa được dệt từ đâu?",
    ],
  },
  {
    keywords: ["giờ mở cửa", "giá vé", "địa chỉ", "bảo tàng", "tham quan"],
    answer:
      "Bảo tàng Lịch sử TP.HCM mở cửa từ 8:00 đến 17:00 tất cả các ngày trong tuần. Địa chỉ: Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh.",
    sources: [
      {
        title: "Thông tin Tham quan Chính thức",
        author: "Ban Quản lý Bảo tàng Lịch sử TP.HCM",
        sourceUrl: "https://hcmc-museum.gov.vn/visiting-info",
        snippet: "Lịch mở cửa và giá vé niêm yết công khai.",
      },
    ],
    suggestedQuestions: [
      "Bảo tàng có thuyết minh viên trực tiếp không?",
      "Giá vé sinh viên là bao nhiêu?",
    ],
  },
];

aiRouter.post("/guide/query", (req, res) => {
  const parseResult = AiGuideQueryRequestSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid AI Guide query request payload",
        details: parseResult.error.issues,
      },
    });
    return;
  }

  const { query, locale } = parseResult.data;
  const normalizedQuery = query.toLowerCase().trim();

  // Search RAG Knowledge base
  const matchedEntry = KNOWLEDGE_BASE.find((entry) =>
    entry.keywords.some((kw) => normalizedQuery.includes(kw)),
  );

  if (matchedEntry) {
    const responsePayload: AiGuideQueryResponse = {
      answer: matchedEntry.answer,
      confidenceScore: 0.96,
      isGated: false,
      sources: matchedEntry.sources,
      suggestedQuestions: matchedEntry.suggestedQuestions,
      audioUrl: `/api/v1/ai/audio/${encodeURIComponent(normalizedQuery.slice(0, 20))}.mp3`,
    };
    res.status(200).json(responsePayload);
    return;
  }

  // Generic Museum AI Guide fallback for unindexed museum questions
  if (
    normalizedQuery.includes("hiện vật") ||
    normalizedQuery.includes("lịch sử") ||
    normalizedQuery.includes("văn hóa") ||
    normalizedQuery.includes("museum")
  ) {
    const defaultResponse: AiGuideQueryResponse = {
      answer:
        locale === "en"
          ? "The Museum AI Guide is retrieving historical archives for your request. Please ask about specific artifacts, exhibitions, or dynasties."
          : "Trợ lý AI Bảo tàng đang đối soát kho tư liệu lịch sử cho câu hỏi của quý khách. Quý khách có thể hỏi chi tiết về hiện vật, thời kỳ lịch sử hoặc khu trưng bày.",
      confidenceScore: 0.85,
      isGated: false,
      sources: [
        {
          title: "Kho Lưu trữ Di sản Bảo tàng Lịch sử TP.HCM",
          author: "Hội đồng Khoa học Bảo tàng",
          sourceUrl: "https://hcmc-museum.gov.vn/archive",
          snippet: "Tư liệu lịch sử và văn hóa Việt Nam qua các thời kỳ.",
        },
      ],
      suggestedQuestions: [
        "Giới thiệu bộ sưu tập khảo cổ nổi bật?",
        "Bảo tàng có những phòng trưng bày nào?",
      ],
    };
    res.status(200).json(defaultResponse);
    return;
  }

  // Hallucination Defense Gating for completely unrelated topics
  const gatedResponse: AiGuideQueryResponse = {
    answer:
      locale === "en"
        ? "I am the Museum AI Tour Guide trained exclusively on verified historical heritage. I cannot answer questions outside the museum data scope."
        : "Xin lỗi quý khách, tôi là Trợ Lý Thuyết Minh Viên AI Bảo Tàng chỉ trả lời các thông tin di sản lịch sử đã được kiểm định. Quý khách vui lòng đặt câu hỏi liên quan đến hiện vật hoặc bảo tàng.",
    confidenceScore: 0.1,
    isGated: true,
    sources: [],
    suggestedQuestions: [
      "Bảo tàng mở cửa vào những giờ nào?",
      "Cho tôi biết thông tin về Bống bống dầu?",
    ],
  };

  res.status(200).json(gatedResponse);
});

aiRouter.post("/guide/speak", (req, res) => {
  const parseResult = AiGuideAudioSpeakRequestSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid speech synthesis payload",
        details: parseResult.error.issues,
      },
    });
    return;
  }

  const { text, locale, voiceId } = parseResult.data;
  const durationEstimated = Math.max(2, Math.round(text.length / 15));

  const audioResponse: AiGuideAudioSpeakResponse = {
    audioUrl: `/audio/tts-${locale}-${voiceId}-${String(Date.now())}.mp3`,
    durationSeconds: durationEstimated,
    format: "audio/mp3",
  };

  res.status(200).json(audioResponse);
});
