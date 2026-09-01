import assert from "node:assert/strict";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";
import { createApp } from "../src/app.js";
import { computeDescriptor, cosineSimilarity } from "../src/recognition/descriptor.js";
import { RecognitionReferenceStore, seedImageBytes } from "../src/recognition/referenceStore.js";
import { classifyStatus, rankReferences } from "../src/recognition/matcher.js";
import { RecognitionService } from "../src/recognition/service.js";

void describe("Recognition Algorithm Unit Test Suite", () => {
  void it("computeDescriptor is deterministic for identical bytes", () => {
    const bytes = seedImageBytes(7, 0);
    assert.deepEqual(computeDescriptor(bytes), computeDescriptor(bytes));
  });

  void it("cosineSimilarity is 1 for identical descriptors and 0 for an empty buffer", () => {
    const descriptor = computeDescriptor(seedImageBytes(7, 0));
    assert.ok(Math.abs(cosineSimilarity(descriptor, descriptor) - 1) < 1e-9);
    assert.equal(cosineSimilarity(computeDescriptor(Buffer.alloc(0)), descriptor), 0);
  });

  void it("rankReferences ranks the byte-identical reference first with confidence 1", () => {
    const store = new RecognitionReferenceStore();
    const uploaded = computeDescriptor(seedImageBytes(7, 0));
    const ranked = rankReferences(uploaded, store.getAll(), undefined);
    const top = ranked[0];

    assert.ok(top);
    assert.equal(top.artifactId, "art-001");
    assert.ok(Math.abs(top.confidence - 1) < 1e-6);
  });

  void it("rankReferences boosts a candidate's score when zoneHint matches its zoneId", () => {
    const store = new RecognitionReferenceStore();
    const uploaded = computeDescriptor(seedImageBytes(7, 0));
    const withoutZone = rankReferences(uploaded, store.getAll(), undefined);
    const withZone = rankReferences(uploaded, store.getAll(), "zone-a");

    const top = withZone.find((candidate) => candidate.artifactId === "art-001");
    const topWithoutZone = withoutZone.find((candidate) => candidate.artifactId === "art-001");
    assert.ok(top && topWithoutZone && top.score > topWithoutZone.score);
    assert.equal(top.matchedZone, true);
  });

  void it("classifyStatus applies MATCHED/LOW_CONFIDENCE/UNKNOWN thresholds", () => {
    assert.equal(classifyStatus(1), "MATCHED");
    assert.equal(classifyStatus(0.95), "LOW_CONFIDENCE");
    assert.equal(classifyStatus(0.5), "UNKNOWN");
    assert.equal(classifyStatus(undefined), "UNKNOWN");
  });
});

void describe("Recognition Service Test Suite", () => {
  void it("identify returns MATCHED with the correct artifactId for a byte-identical upload", () => {
    const service = new RecognitionService();
    const uploadBase64 = seedImageBytes(7, 0).toString("base64");
    const response = service.identify(uploadBase64, undefined);

    assert.equal(response.status, "MATCHED");
    assert.equal(response.candidates[0]?.artifactId, "art-001");
  });

  void it("identify returns UNKNOWN for an unrelated tiny upload", () => {
    const service = new RecognitionService();
    const response = service.identify(Buffer.from([1, 2, 3]).toString("base64"), undefined);

    assert.equal(response.status, "UNKNOWN");
  });

  void it("recordFeedback stores the feedback and returns received:true", () => {
    const service = new RecognitionService();
    const response = service.recordFeedback({ artifactId: "art-001", confirmed: true });

    assert.equal(response.received, true);
    assert.equal(service.listFeedback().length, 1);
  });

  void it("upsertReference adds a new reference visible in listReferences", () => {
    const service = new RecognitionService();
    const before = service.listReferences().items.length;
    service.upsertReference({
      artifactId: "art-003",
      title: "Hiện vật mới",
      imageBase64: seedImageBytes(19, 5).toString("base64"),
    });

    assert.equal(service.listReferences().items.length, before + 1);
  });
});

void describe("Recognition REST API Route Test Suite", () => {
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

  void it("POST /api/v1/recognition/identify returns MATCHED for a byte-identical upload", async () => {
    const response = await fetch(`${baseUrl}/api/v1/recognition/identify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: seedImageBytes(7, 0).toString("base64") }),
    });
    assert.equal(response.status, 200);
    const data = (await response.json()) as {
      status: string;
      candidates: { artifactId: string }[];
    };
    assert.equal(data.status, "MATCHED");
    assert.equal(data.candidates[0]?.artifactId, "art-001");
  });

  void it("POST /api/v1/recognition/identify rejects a request with no imageBase64", async () => {
    const response = await fetch(`${baseUrl}/api/v1/recognition/identify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.equal(response.status, 400);
  });

  void it("POST /api/v1/recognition/feedback accepts a confirmation", async () => {
    const response = await fetch(`${baseUrl}/api/v1/recognition/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artifactId: "art-001", confirmed: true }),
    });
    assert.equal(response.status, 200);
    const data = (await response.json()) as { received: boolean };
    assert.equal(data.received, true);
  });

  void it("GET /api/v1/recognition/admin/references then POST adds a new reference", async () => {
    const before = await fetch(`${baseUrl}/api/v1/recognition/admin/references`);
    const beforeData = (await before.json()) as { items: { artifactId: string }[] };

    const upsert = await fetch(`${baseUrl}/api/v1/recognition/admin/references`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artifactId: "art-004",
        title: "Hiện vật test",
        imageBase64: seedImageBytes(23, 9).toString("base64"),
      }),
    });
    assert.equal(upsert.status, 201);

    const after = await fetch(`${baseUrl}/api/v1/recognition/admin/references`);
    const afterData = (await after.json()) as { items: { artifactId: string }[] };
    assert.equal(afterData.items.length, beforeData.items.length + 1);
  });
});
