import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/index.js";

void test("Living Timeline REST API Route Test Suite", async (t) => {
  const app = createApp();
  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  const baseUrl = `http://localhost:${String(port)}`;

  t.after(() => {
    server.close();
  });

  await t.test(
    "GET /api/v1/timeline/journeys returns 200 and published journeys list",
    async () => {
      const res = await fetch(`${baseUrl}/api/v1/timeline/journeys`);
      assert.equal(res.status, 200);

      const json = (await res.json()) as { data: { id: string; title: string }[] };
      assert.ok(Array.isArray(json.data));
      assert.ok(json.data.length >= 1);
      assert.equal(json.data[0]?.id, "journey-dong-son-to-oc-eo");
    },
  );

  await t.test("GET /api/v1/timeline/journeys/:id returns 200 and journey nodes", async () => {
    const res = await fetch(`${baseUrl}/api/v1/timeline/journeys/journey-dong-son-to-oc-eo`);
    assert.equal(res.status, 200);

    const json = (await res.json()) as { data: { id: string; nodes: { id: string }[] } };
    assert.equal(json.data.id, "journey-dong-son-to-oc-eo");
    assert.ok(json.data.nodes.length >= 2);
  });

  await t.test(
    "GET /api/v1/timeline/journeys/invalid-id returns 404 structured error",
    async () => {
      const res = await fetch(`${baseUrl}/api/v1/timeline/journeys/invalid-id`);
      assert.equal(res.status, 404);

      const json = (await res.json()) as { code: string; message: string };
      assert.equal(json.code, "NOT_FOUND");
      assert.ok(json.message.includes("invalid-id"));
    },
  );

  await t.test(
    "GET /api/v1/timeline/artifacts/:code/related returns related artifacts",
    async () => {
      const res = await fetch(`${baseUrl}/api/v1/timeline/artifacts/ART-DS-001/related`);
      assert.equal(res.status, 200);

      const json = (await res.json()) as { data: { code: string; relationType: string }[] };
      assert.ok(Array.isArray(json.data));
      assert.ok(json.data.length >= 1);
      const firstRelated = json.data[0];
      assert.ok(firstRelated);
      assert.equal(firstRelated.code, "ART-OE-002");
      assert.equal(firstRelated.relationType, "RELATED_THEME");
    },
  );
});
