import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import { createApp } from "../src/app.js";
import type { DashboardOverviewMetric, DashboardSummaryResponse } from "@hcmc-museum/contracts";

let server: ReturnType<typeof app.listen>;
let baseUrl = "";
const app = createApp();

before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address() as AddressInfo;
      baseUrl = `http://127.0.0.1:${String(addr.port)}`;
      resolve();
    });
  });
});

after(() => {
  server.close();
});

void test("GET /api/v1/dashboard/summary returns full metrics payload", async () => {
  const res = await fetch(`${baseUrl}/api/v1/dashboard/summary`);
  assert.equal(res.status, 200);

  const data = (await res.json()) as DashboardSummaryResponse;
  assert.equal(data.metrics.totalVisitors, 28450);
  assert.equal(data.topArtifacts.length > 0, true);
  assert.equal(data.trafficSeries.length > 0, true);
  assert.equal(data.systemHealthStatus, "HEALTHY");
});

void test("GET /api/v1/dashboard/metrics returns overview numbers", async () => {
  const res = await fetch(`${baseUrl}/api/v1/dashboard/metrics`);
  assert.equal(res.status, 200);

  const data = (await res.json()) as DashboardOverviewMetric;
  assert.equal(data.totalVisitors, 28450);
  assert.equal(data.qrScansTotal, 9820);
});
