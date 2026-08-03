import { deepEqual, equal } from "node:assert/strict";
import { test } from "node:test";

import { packageIdentity } from "../src/index.js";

void test("exports stable admin package metadata", () => {
  deepEqual(packageIdentity, {
    kind: "application",
    name: "@hcmc-museum/admin",
  });
  equal(Object.isFrozen(packageIdentity), true);
});
