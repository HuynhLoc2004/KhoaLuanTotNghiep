import assert from "node:assert/strict";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";
import { createApp } from "../src/app.js";
import { stableHash } from "../src/voice/hash.js";
import { VoiceGlossaryStore } from "../src/voice/glossary.js";
import { VoiceScriptStore } from "../src/voice/scriptStore.js";
import { WebSpeechClientEngine } from "../src/voice/engine.js";
import { interpretCommand } from "../src/voice/commandInterpreter.js";
import { VoiceAdminConfigStore } from "../src/voice/adminConfig.js";
import { VoiceService } from "../src/voice/service.js";

void describe("Voice Algorithm Unit Test Suite", () => {
  void it("stableHash is deterministic and sensitive to input changes", () => {
    assert.equal(stableHash("abc"), stableHash("abc"));
    assert.notEqual(stableHash("abc"), stableHash("abd"));
  });

  void it("VoiceGlossaryStore applies the longest term first and never regenerates unchanged pronunciation", () => {
    const glossary = new VoiceGlossaryStore([
      { term: "Đông Sơn", locale: "vi", pronunciation: "Đông Sơn" },
      { term: "Óc Eo", locale: "vi", pronunciation: "Óc Eo Ố Kèo" },
    ]);
    const result = glossary.applyPronunciation("Văn hóa Óc Eo và Đông Sơn", "vi");
    assert.ok(result.includes("Óc Eo Ố Kèo"));
    assert.ok(result.includes("Đông Sơn"));
  });

  void it("VoiceGlossaryStore.buildSsml wraps substituted terms with <sub alias>", () => {
    const glossary = new VoiceGlossaryStore([
      { term: "Óc Eo", locale: "vi", pronunciation: "Ốc Eo" },
    ]);
    const ssml = glossary.buildSsml("Văn hóa Óc Eo", "vi");
    assert.ok(ssml.startsWith("<speak>"));
    assert.ok(ssml.includes('<sub alias="Ốc Eo">'));
  });

  void it("VoiceScriptStore only returns PUBLISHED scripts from getPublished", () => {
    const store = new VoiceScriptStore([
      {
        id: "s1",
        locale: "vi",
        title: "A",
        text: "text a",
        status: "PUBLISHED",
        updatedAt: "2026-09-01T00:00:00.000Z",
      },
      {
        id: "s2",
        locale: "vi",
        title: "B",
        text: "text b",
        status: "DRAFT",
        updatedAt: "2026-09-01T00:00:00.000Z",
      },
    ]);
    const published = store.getPublished();
    assert.equal(published.length, 1);
    assert.equal(published[0]?.id, "s1");
    assert.equal(store.getAll().length, 2);
  });

  void it("WebSpeechClientEngine estimates zero cost and a positive duration", () => {
    const engine = new WebSpeechClientEngine();
    const result = engine.estimate("Xin chào quý khách tham quan bảo tàng", "vi", 1);
    assert.equal(result.costEstimate.amount, 0);
    assert.ok(result.estimatedDurationSeconds > 0);
  });

  void it("WebSpeechClientEngine speeds up estimated duration when speed increases", () => {
    const engine = new WebSpeechClientEngine();
    const normal = engine.estimate("a".repeat(300), "vi", 1);
    const fast = engine.estimate("a".repeat(300), "vi", 2);
    assert.ok(fast.estimatedDurationSeconds <= normal.estimatedDurationSeconds);
  });

  void it("interpretCommand recognizes PLAY/PAUSE/STOP/REPEAT keywords in Vietnamese", () => {
    assert.equal(interpretCommand("phát thuyết minh", "vi").intent, "PLAY");
    assert.equal(interpretCommand("tạm dừng lại", "vi").intent, "PAUSE");
    assert.equal(interpretCommand("dừng hẳn", "vi").intent, "STOP");
    assert.equal(interpretCommand("nghe lại từ đầu", "vi").intent, "REPEAT");
  });

  void it("interpretCommand recognizes navigation keywords and returns a target slug", () => {
    const result = interpretCommand("đi đến trang tìm kiếm", "vi");
    assert.equal(result.intent, "NAVIGATE");
    assert.equal(result.targetSlug, "/search");
  });

  void it("interpretCommand returns UNKNOWN with low confidence for unrelated speech", () => {
    const result = interpretCommand("hôm nay trời đẹp quá", "vi");
    assert.equal(result.intent, "UNKNOWN");
    assert.ok(result.confidence < 0.5);
  });

  void it("VoiceAdminConfigStore.update bumps version and applies immediately", () => {
    const store = new VoiceAdminConfigStore([]);
    const before = store.getConfig();
    const updated = store.update({ glossary: [{ term: "X", locale: "vi", pronunciation: "Y" }] });
    assert.ok(updated.version > before.version);
    assert.equal(updated.glossary.length, 1);
  });
});

void describe("Voice Service Test Suite", () => {
  void it("synthesize returns cached=false first, then cached=true for the identical request", () => {
    const service = new VoiceService();
    const request = { text: "Xin chào", locale: "vi" as const, voiceId: "default", speed: 1 };
    const first = service.synthesize(request);
    const second = service.synthesize(request);
    assert.equal(first.cached, false);
    assert.equal(second.cached, true);
    assert.equal(first.cacheKey, second.cacheKey);
  });

  void it("synthesize applies glossary pronunciation before hashing so cache key reflects it", () => {
    const service = new VoiceService();
    service.updateAdminConfig({
      glossary: [{ term: "Oc Eo", locale: "vi", pronunciation: "Oc Eo Corrected" }],
    });
    const result = service.synthesize({
      text: "Oc Eo",
      locale: "vi",
      voiceId: "default",
      speed: 1,
    });
    assert.ok(result.plainText.includes("Oc Eo Corrected"));
  });

  void it("synthesize resolves text from a scriptId when provided", () => {
    const service = new VoiceService();
    const scripts = service.listPublishedScripts("vi");
    const script = scripts.items[0];
    assert.ok(script);
    const result = service.synthesize({
      scriptId: script.id,
      locale: "vi",
      voiceId: "default",
      speed: 1,
    });
    assert.equal(result.plainText, script.text);
  });

  void it("estimateCost reports zero cost for the free default engine and counts cached vs new", () => {
    const service = new VoiceService();
    const scripts = service.listPublishedScripts("vi");
    const scriptId = scripts.items[0]?.id;
    assert.ok(scriptId);
    const beforeEstimate = service.estimateCost([scriptId]);
    assert.equal(beforeEstimate.estimatedCost, 0);
    assert.equal(beforeEstimate.scriptsToGenerate, 1);

    service.synthesize({ scriptId, locale: "vi", voiceId: "default", speed: 1 });
    const afterEstimate = service.estimateCost([scriptId]);
    assert.equal(afterEstimate.scriptsAlreadyCached, 1);
  });
});

void describe("Voice REST API Route Test Suite", () => {
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

  void it("GET /api/v1/voice/scripts returns only published scripts", async () => {
    const response = await fetch(`${baseUrl}/api/v1/voice/scripts?locale=vi`);
    assert.equal(response.status, 200);
    const data = (await response.json()) as { items: { status: string }[]; total: number };
    assert.ok(data.items.every((item) => item.status === "PUBLISHED"));
  });

  void it("GET /api/v1/voice/scripts rejects an invalid locale", async () => {
    const response = await fetch(`${baseUrl}/api/v1/voice/scripts?locale=fr`);
    assert.equal(response.status, 400);
    const data = (await response.json()) as { code: string; correlationId: string };
    assert.equal(data.code, "VALIDATION_ERROR");
    assert.ok(data.correlationId);
  });

  void it("POST /api/v1/voice/synthesize returns a real client-side speakable text", async () => {
    const response = await fetch(`${baseUrl}/api/v1/voice/synthesize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Chào mừng quý khách", locale: "vi" }),
    });
    assert.equal(response.status, 200);
    const data = (await response.json()) as {
      engine: string;
      plainText: string;
      costEstimate: { amount: number };
    };
    assert.equal(data.engine, "web-speech-client");
    assert.equal(data.costEstimate.amount, 0);
    assert.ok(data.plainText.length > 0);
  });

  void it("POST /api/v1/voice/synthesize rejects a request with neither scriptId nor text", async () => {
    const response = await fetch(`${baseUrl}/api/v1/voice/synthesize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: "vi" }),
    });
    assert.equal(response.status, 400);
  });

  void it("POST /api/v1/voice/command interprets a transcript into an intent", async () => {
    const response = await fetch(`${baseUrl}/api/v1/voice/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: "phát thuyết minh", locale: "vi" }),
    });
    assert.equal(response.status, 200);
    const data = (await response.json()) as { intent: string };
    assert.equal(data.intent, "PLAY");
  });

  void it("GET /api/v1/voice/admin/config then PUT applies a glossary change immediately", async () => {
    const beforeResponse = await fetch(`${baseUrl}/api/v1/voice/admin/config`);
    const beforeData = (await beforeResponse.json()) as { version: number };

    const putResponse = await fetch(`${baseUrl}/api/v1/voice/admin/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        glossary: [{ term: "Óc Eo", locale: "vi", pronunciation: "Ốc Eo" }],
      }),
    });
    assert.equal(putResponse.status, 200);
    const putData = (await putResponse.json()) as { version: number; glossary: unknown[] };
    assert.ok(putData.version > beforeData.version);
    assert.equal(putData.glossary.length, 1);
  });

  void it("POST /api/v1/voice/admin/scripts creates a script and it appears in the admin listing", async () => {
    const createResponse = await fetch(`${baseUrl}/api/v1/voice/admin/scripts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locale: "vi",
        title: "Hiện vật mới",
        text: "Nội dung thuyết minh cho hiện vật mới",
      }),
    });
    assert.equal(createResponse.status, 201);
    const created = (await createResponse.json()) as { id: string; status: string };
    assert.equal(created.status, "DRAFT");

    const listResponse = await fetch(`${baseUrl}/api/v1/voice/admin/scripts`);
    const listData = (await listResponse.json()) as { items: { id: string }[] };
    assert.ok(listData.items.some((item) => item.id === created.id));
  });

  void it("POST /api/v1/voice/admin/cost-estimate reports zero cost for the free engine", async () => {
    const scriptsResponse = await fetch(`${baseUrl}/api/v1/voice/admin/scripts`);
    const scriptsData = (await scriptsResponse.json()) as { items: { id: string }[] };
    const scriptId = scriptsData.items[0]?.id;
    assert.ok(scriptId);

    const response = await fetch(`${baseUrl}/api/v1/voice/admin/cost-estimate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scriptIds: [scriptId] }),
    });
    assert.equal(response.status, 200);
    const data = (await response.json()) as { estimatedCost: number; engine: string };
    assert.equal(data.estimatedCost, 0);
    assert.equal(data.engine, "web-speech-client");
  });
});
