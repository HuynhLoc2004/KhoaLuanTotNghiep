import { deepEqual, equal } from "node:assert/strict";
import { test } from "node:test";

import { packageIdentity } from "../src/index.js";

void test("exports stable web package metadata", () => {
  deepEqual(packageIdentity, {
    kind: "application",
    name: "@hcmc-museum/web",
  });
  equal(Object.isFrozen(packageIdentity), true);
});
