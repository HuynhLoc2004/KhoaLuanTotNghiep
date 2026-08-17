import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { Server } from "node:http";
import { createApp } from "../src/app.js";

void describe("3D Digital Twin & A* Graph Navigation API Suite", () => {
  let appServer: Server;
  let baseUrl: string;

  before(async () => {
    const app = createApp();
    await new Promise<void>((resolve) => {
      appServer = app.listen(0, "127.0.0.1", () => {
        const addr = appServer.address();
        if (addr && typeof addr === "object") {
          baseUrl = `http://127.0.0.1:${String(addr.port)}`;
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

  void it("GET /api/v1/3d/scenes returns available scenes and POIs", async () => {
    const response = await fetch(`${baseUrl}/api/v1/3d/scenes`);
    assert.equal(response.status, 200);

    const data = (await response.json()) as {
      scenes: { id: string }[];
      pois: { nodeId: string; label: string }[];
    };

    assert.equal(data.scenes.length, 1);
    assert.ok(data.pois.length >= 4);
  });

  void it("GET /api/v1/3d/models/:code returns 3D Digital Twin configuration", async () => {
    const response = await fetch(`${baseUrl}/api/v1/3d/models/ART-DS-001`);
    assert.equal(response.status, 200);

    const data = (await response.json()) as {
      artifactCode: string;
      modelUrl: string;
      hotspots: { id: string; title: string }[];
    };

    assert.equal(data.artifactCode, "ART-DS-001");
    assert.ok(data.modelUrl.includes(".glb"));
    assert.equal(data.hotspots.length, 2);
  });

  void it("GET /api/v1/3d/models/invalid returns 404 error", async () => {
    const response = await fetch(`${baseUrl}/api/v1/3d/models/INVALID_CODE`);
    assert.equal(response.status, 404);
  });

  void it("POST /api/v1/3d/route/calculate calculates shortest path using A* algorithm", async () => {
    const response = await fetch(`${baseUrl}/api/v1/3d/route/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startNodeId: "N01_ENTRANCE",
        targetNodeId: "N03_PREHISTORIC_HALL",
        wheelchairAccessible: true,
      }),
    });

    assert.equal(response.status, 200);

    const data = (await response.json()) as {
      pathNodeIds: string[];
      totalDistanceMeters: number;
      stepsInstruction: string[];
    };

    assert.deepEqual(data.pathNodeIds, ["N01_ENTRANCE", "N02_LOBBY", "N03_PREHISTORIC_HALL"]);
    assert.equal(data.totalDistanceMeters, 25);
    assert.equal(data.stepsInstruction.length, 3);
  });
});
