import test from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { correlationIdMiddleware } from "../src/middleware/correlationId.js";
import { errorHandler, notFoundHandler } from "../src/middleware/errorHandler.js";
import { healthRouter } from "../src/routes/health.js";
import { z } from "zod";
import { validateRequest } from "../src/middleware/validate.js";
import { ApiError } from "@hcmc-museum/contracts";

void test("API Skeleton & Error Contract Test Suite", async (t) => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(correlationIdMiddleware);
  app.use(healthRouter);

  // Test routes attached before error handlers
  app.post(
    "/test-validate",
    validateRequest({
      body: z.object({
        age: z.number().min(18),
      }),
    }),
    (_req, res) => {
      res.json({ success: true });
    },
  );

  app.get("/test-custom-error", (_req, _res, next) => {
    next(new ApiError(403, "FORBIDDEN", "Access denied to resource"));
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  const server = app.listen(0);
  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${String(address.port)}`;

  t.after(() => {
    server.close();
  });

  await t.test("GET /health returns 200 and healthy status", async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as { status: string; service: string };
    assert.equal(body.status, "ok");
    assert.equal(body.service, "@hcmc-museum/api");
    assert.ok(res.headers.get("x-correlation-id"));
  });

  await t.test("GET /api/v1/health returns 200 and preserves X-Correlation-Id header", async () => {
    const customCorrelationId = "123e4567-e89b-12d3-a456-426614174000";
    const res = await fetch(`${baseUrl}/api/v1/health`, {
      headers: { "x-correlation-id": customCorrelationId },
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("x-correlation-id"), customCorrelationId);
  });

  await t.test("GET /non-existent-route returns 404 structured error", async () => {
    const res = await fetch(`${baseUrl}/non-existent-route`);
    assert.equal(res.status, 404);
    const body = (await res.json()) as {
      code: string;
      message: string;
      correlationId: string;
    };
    assert.equal(body.code, "NOT_FOUND");
    assert.ok(body.message.includes("Route not found"));
    assert.ok(body.correlationId);
  });

  await t.test("Zod validation failure returns 400 structured error", async () => {
    const res = await fetch(`${baseUrl}/test-validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ age: 10 }),
    });

    assert.equal(res.status, 400);
    const body = (await res.json()) as {
      code: string;
      message: string;
      details: { field?: string; message: string }[];
    };
    assert.equal(body.code, "VALIDATION_ERROR");
    assert.ok(Array.isArray(body.details));
    assert.ok(body.details.length > 0);
  });

  await t.test("Custom ApiError returns custom status code and structured response", async () => {
    const res = await fetch(`${baseUrl}/test-custom-error`);
    assert.equal(res.status, 403);
    const body = (await res.json()) as { code: string; message: string };
    assert.equal(body.code, "FORBIDDEN");
    assert.equal(body.message, "Access denied to resource");
  });
});
