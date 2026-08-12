import { deepEqual, equal } from "node:assert/strict";
import { test } from "node:test";

import { packageIdentity } from "../src/index.js";

void test("exports stable UI package metadata without UI behavior", () => {
  deepEqual(packageIdentity, {
    kind: "package-boundary",
    name: "@hcmc-museum/ui",
  });
  equal(Object.isFrozen(packageIdentity), true);
});
