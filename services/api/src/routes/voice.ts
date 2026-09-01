import { Router } from "express";
import type { Request, Response } from "express";
import {
  ApiError,
  ErrorCode,
  VoiceAdminConfigUpdateSchema,
  VoiceCommandRequestSchema,
  VoiceCostEstimateRequestSchema,
  VoiceScriptUpsertRequestSchema,
  VoiceSynthesizeRequestSchema,
  type VoiceAdminConfigUpdate,
  type VoiceCommandRequest,
  type VoiceCostEstimateRequest,
  type VoiceLocale,
  type VoiceScriptUpsertRequest,
  type VoiceSynthesizeRequest,
} from "@hcmc-museum/contracts";
import { voiceService } from "../voice/service.js";

export const voiceRouter: Router = Router();

const ALLOWED_LOCALES: readonly VoiceLocale[] = ["vi", "en"];

function parseLocaleParam(rawLocale: unknown): VoiceLocale | undefined {
  if (rawLocale === undefined) {
    return undefined;
  }
  if (typeof rawLocale !== "string" || !ALLOWED_LOCALES.includes(rawLocale as VoiceLocale)) {
    throw new ApiError(400, ErrorCode.VALIDATION_ERROR, "Locale không hợp lệ.", [
      { field: "locale", message: `Giá trị hợp lệ: ${ALLOWED_LOCALES.join(", ")}` },
    ]);
  }
  return rawLocale as VoiceLocale;
}

function parseArtifactIdParam(rawArtifactId: unknown): string | undefined {
  return typeof rawArtifactId === "string" && rawArtifactId.length > 0 ? rawArtifactId : undefined;
}

// GET /api/v1/voice/scripts — public, published-only, filterable by locale/artifact.
voiceRouter.get("/scripts", (req: Request, res: Response) => {
  const locale = parseLocaleParam(req.query.locale);
  const artifactId = parseArtifactIdParam(req.query.artifactId);
  res.json(voiceService.listPublishedScripts(locale, artifactId));
});

// POST /api/v1/voice/synthesize — prepares pronunciation-corrected text/SSML + cache
// metadata for the client's Web Speech API to actually render the audio.
voiceRouter.post("/synthesize", (req: Request, res: Response) => {
  const parseResult = VoiceSynthesizeRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new ApiError(
      400,
      ErrorCode.VALIDATION_ERROR,
      "Yêu cầu tổng hợp giọng nói không hợp lệ.",
      parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  const request: VoiceSynthesizeRequest = parseResult.data;
  if (!request.scriptId && !request.text) {
    throw new ApiError(400, ErrorCode.VALIDATION_ERROR, "Cần cung cấp scriptId hoặc text.", [
      { field: "text", message: "scriptId hoặc text là bắt buộc" },
    ]);
  }

  res.json(voiceService.synthesize(request));
});

// POST /api/v1/voice/command — interprets a transcript captured client-side via
// SpeechRecognition into an actionable intent.
voiceRouter.post("/command", (req: Request, res: Response) => {
  const parseResult = VoiceCommandRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new ApiError(
      400,
      ErrorCode.VALIDATION_ERROR,
      "Yêu cầu voice command không hợp lệ.",
      parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  const request: VoiceCommandRequest = parseResult.data;
  res.json(voiceService.interpretVoiceCommand(request.transcript, request.locale));
});

// GET /api/v1/voice/admin/scripts — all scripts including drafts (Admin Portal management).
voiceRouter.get("/admin/scripts", (_req: Request, res: Response) => {
  res.json(voiceService.listAllScripts());
});

// POST /api/v1/voice/admin/scripts — create/update a script.
voiceRouter.post("/admin/scripts", (req: Request, res: Response) => {
  const parseResult = VoiceScriptUpsertRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new ApiError(
      400,
      ErrorCode.VALIDATION_ERROR,
      "Dữ liệu script không hợp lệ.",
      parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  const request: VoiceScriptUpsertRequest = parseResult.data;
  const script = voiceService.upsertScript(request);
  res.status(201).json(script);
});

// GET /api/v1/voice/admin/config — glossary + engine flag.
voiceRouter.get("/admin/config", (_req: Request, res: Response) => {
  res.json(voiceService.getAdminConfig());
});

// PUT /api/v1/voice/admin/config — update glossary/engine flag, effective immediately.
voiceRouter.put("/admin/config", (req: Request, res: Response) => {
  const parseResult = VoiceAdminConfigUpdateSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new ApiError(
      400,
      ErrorCode.VALIDATION_ERROR,
      "Cấu hình voice admin không hợp lệ.",
      parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  const patch: VoiceAdminConfigUpdate = parseResult.data;
  res.json(voiceService.updateAdminConfig(patch));
});

// POST /api/v1/voice/admin/cost-estimate — admin sees cost before batch-generating audio.
voiceRouter.post("/admin/cost-estimate", (req: Request, res: Response) => {
  const parseResult = VoiceCostEstimateRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new ApiError(
      400,
      ErrorCode.VALIDATION_ERROR,
      "Yêu cầu ước tính chi phí không hợp lệ.",
      parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  const request: VoiceCostEstimateRequest = parseResult.data;
  res.json(voiceService.estimateCost(request.scriptIds));
});
