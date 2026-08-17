import assert from "node:assert/strict";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";
import { createApp } from "../src/app.js";

void describe("Express API AI Guide Router Test Suite", () => {
  let appServer: Server;
  let baseUrl: string;

  before(async () => {
    const app = createApp();
    await new Promise<void>((resolve) => {
      appServer = app.listen(0, () => {
        const address = appServer.address();
        if (address && typeof address === "object") {
          baseUrl = `http://127.0.0.1:${String(address.port)}`;
        }
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => {
      appServer.close(() => {
        resolve();
      });
    });
  });

  void it("POST /api/v1/ai/guide/query answers heritage query with sources", async () => {
    const response = await fetch(`${baseUrl}/api/v1/ai/guide/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "Cho tôi biết thông tin bống bống dầu?",
        locale: "vi",
      }),
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as {
      answer: string;
      confidenceScore: number;
      isGated: boolean;
      sources: { title: string }[];
    };

    assert.equal(data.isGated, false);
    assert.equal(data.confidenceScore, 0.96);
    assert.ok(data.answer.includes("Bống bống dầu"));
    assert.ok(data.sources.length >= 1);
  });

  void it("POST /api/v1/ai/guide/query gates off-topic questions (Hallucination defense)", async () => {
    const response = await fetch(`${baseUrl}/api/v1/ai/guide/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "Hãy viết code C++ giải thuật toán quicksort",
        locale: "vi",
      }),
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as {
      answer: string;
      confidenceScore: number;
      isGated: boolean;
    };

    assert.equal(data.isGated, true);
    assert.equal(data.confidenceScore, 0.1);
    assert.ok(data.answer.includes("Trợ Lý Thuyết Minh Viên AI Bảo Tàng"));
  });

  void it("POST /api/v1/ai/guide/speak synthesizes speech audio URL", async () => {
    const response = await fetch(`${baseUrl}/api/v1/ai/guide/speak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Bảo tàng mở cửa đón khách tham quan mỗi ngày",
        locale: "vi",
      }),
    });

    assert.equal(response.status, 200);
    const data = (await response.json()) as {
      audioUrl: string;
      durationSeconds: number;
      format: string;
    };

    assert.ok(data.audioUrl.startsWith("/audio/tts-vi-"));
    assert.ok(data.durationSeconds > 0);
  });
});
