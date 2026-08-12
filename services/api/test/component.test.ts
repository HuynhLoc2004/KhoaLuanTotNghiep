import { deepEqual, equal } from "node:assert/strict";
import { test } from "node:test";

import { packageIdentity } from "../src/index.js";

void test("exports stable API package metadata", () => {
  deepEqual(packageIdentity, {
    kind: "service",
    name: "@hcmc-museum/api",
  });
  equal(Object.isFrozen(packageIdentity), true);
});
