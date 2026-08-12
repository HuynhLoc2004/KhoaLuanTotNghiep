import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import {
  ApiError,
  ErrorCode,
  type ApiErrorResponse,
  type ApiErrorDetail,
} from "@hcmc-museum/contracts";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const correlationId = req.correlationId || "unknown";

  if (err instanceof ApiError) {
    const errorResponse: ApiErrorResponse = {
      code: err.code,
      message: err.message,
      correlationId,
    };
    if (err.details !== undefined && err.details.length > 0) {
      errorResponse.details = err.details;
    }
    res.status(err.statusCode).json(errorResponse);
    return;
  }

  if (err instanceof ZodError) {
    const details: ApiErrorDetail[] = err.issues.map((issue) => {
      const detail: ApiErrorDetail = {
        message: issue.message,
      };
      if (issue.path.length > 0) {
        detail.field = issue.path.join(".");
      }
      detail.code = issue.code;
      return detail;
    });

    const errorResponse: ApiErrorResponse = {
      code: ErrorCode.VALIDATION_ERROR,
      message: "Input validation failed",
      details,
      correlationId,
    };

    res.status(400).json(errorResponse);
    return;
  }

  const isDev = process.env.NODE_ENV === "development";
  const message = isDev && err instanceof Error ? err.message : "Internal Server Error";

  const errorResponse: ApiErrorResponse = {
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message,
    correlationId,
  };

  res.status(500).json(errorResponse);
}

export function notFoundHandler(req: Request, res: Response): void {
  const correlationId = req.correlationId || "unknown";
  const errorResponse: ApiErrorResponse = {
    code: ErrorCode.NOT_FOUND,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    correlationId,
  };
  res.status(404).json(errorResponse);
}
