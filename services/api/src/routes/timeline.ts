import { Router } from "express";
import type { Request, Response } from "express";
import {
  type NarrativeJourney,
  type RelatedArtifact,
  ApiError,
  ErrorCode,
} from "@hcmc-museum/contracts";

export const timelineRouter: Router = Router();

const SAMPLE_JOURNEYS: NarrativeJourney[] = [
  {
    id: "journey-dong-son-to-oc-eo",
    title: "Từ Văn Hóa Đông Sơn Đến Nền Văn Minh Óc Eo",
    theme: "Lịch sử cổ đại Việt Nam",
    status: "PUBLISHED",
    nodes: [
      {
        id: "node-ds-01",
        title: "Kỷ Nguyên Kim Khí & Trống Đồng Đông Sơn",
        period: "Thế kỷ V - I TCN",
        description: "Thời kỳ đỉnh cao của kỹ thuật đúc đồng thau miền Bắc Việt Nam.",
        artifactId: "art-dong-son-01",
        artifactCode: "ART-DS-001",
      },
      {
        id: "node-oe-02",
        title: "Thương Cảng Cổ & Văn Hóa Óc Eo",
        period: "Thế kỷ II - VII",
        description: "Nền văn minh sông nước Phù Nam với nghệ thuật tạc tượng đá tinh xảo.",
        artifactId: "art-oc-eo-01",
        artifactCode: "ART-OE-002",
      },
    ],
  },
];

const SAMPLE_RELATED_ARTIFACTS: Record<string, RelatedArtifact[]> = {
  "ART-DS-001": [
    {
      artifactId: "art-oc-eo-01",
      code: "ART-OE-002",
      title: "Tượng Thần Vishnu Óc Eo",
      relationType: "RELATED_THEME",
      reason: "Cùng đại diện cho hai nền văn hóa cổ đại lớn trên lãnh thổ Việt Nam.",
    },
  ],
  "ART-OE-002": [
    {
      artifactId: "art-dong-son-01",
      code: "ART-DS-001",
      title: "Trống Đồng Đông Sơn",
      relationType: "RELATED_THEME",
      reason: "Giao thoa văn hóa và di sản tạo tiền đề cho mỹ thuật cổ truyền.",
    },
  ],
};

// GET /api/v1/timeline/journeys
timelineRouter.get("/api/v1/timeline/journeys", (_req: Request, res: Response) => {
  res.json({ data: SAMPLE_JOURNEYS });
});

// GET /api/v1/timeline/journeys/:id
timelineRouter.get("/api/v1/timeline/journeys/:id", (req: Request, res: Response) => {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const journey = SAMPLE_JOURNEYS.find((j) => j.id === id);

  if (!journey) {
    throw new ApiError(
      404,
      ErrorCode.NOT_FOUND,
      `Không tìm thấy hành trình dòng thời gian với ID ${id ?? ""}`,
    );
  }

  res.json({ data: journey });
});

// GET /api/v1/timeline/artifacts/:code/related
timelineRouter.get("/api/v1/timeline/artifacts/:code/related", (req: Request, res: Response) => {
  const codeParam = req.params.code;
  const code = Array.isArray(codeParam) ? codeParam[0] : codeParam;
  const upperCode = (code ?? "").toUpperCase();
  const related = SAMPLE_RELATED_ARTIFACTS[upperCode] ?? [];

  res.json({ data: related });
});
