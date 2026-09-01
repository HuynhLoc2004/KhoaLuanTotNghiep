import { Router } from "express";
import type { Request, Response } from "express";
import {
  ApiError,
  ErrorCode,
  RecognitionFeedbackRequestSchema,
  RecognitionIdentifyRequestSchema,
  RecognitionReferenceUpsertRequestSchema,
  type RecognitionFeedbackRequest,
  type RecognitionIdentifyRequest,
  type RecognitionReferenceUpsertRequest,
} from "@hcmc-museum/contracts";
import { recognitionService } from "../recognition/service.js";

export const recognitionRouter: Router = Router();

// POST /api/v1/recognition/identify — public, top-k candidates + confidence status.
recognitionRouter.post("/identify", (req: Request, res: Response) => {
  const parseResult = RecognitionIdentifyRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new ApiError(
      400,
      ErrorCode.VALIDATION_ERROR,
      "Yêu cầu nhận diện hiện vật không hợp lệ.",
      parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  const request: RecognitionIdentifyRequest = parseResult.data;
  res.json(recognitionService.identify(request.imageBase64, request.zoneHint));
});

// POST /api/v1/recognition/feedback — visitor confirms/corrects a candidate; never
// auto-retrains the reference set (INV-AI-004).
recognitionRouter.post("/feedback", (req: Request, res: Response) => {
  const parseResult = RecognitionFeedbackRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new ApiError(
      400,
      ErrorCode.VALIDATION_ERROR,
      "Phản hồi nhận diện không hợp lệ.",
      parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  const request: RecognitionFeedbackRequest = parseResult.data;
  res.json(recognitionService.recordFeedback(request));
});

// GET /api/v1/recognition/admin/references — Admin Portal reference management.
recognitionRouter.get("/admin/references", (_req: Request, res: Response) => {
  res.json(recognitionService.listReferences());
});

// POST /api/v1/recognition/admin/references — curator uploads/updates a reference photo.
recognitionRouter.post("/admin/references", (req: Request, res: Response) => {
  const parseResult = RecognitionReferenceUpsertRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new ApiError(
      400,
      ErrorCode.VALIDATION_ERROR,
      "Dữ liệu ảnh tham chiếu không hợp lệ.",
      parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  const request: RecognitionReferenceUpsertRequest = parseResult.data;
  res.status(201).json(recognitionService.upsertReference(request));
});
