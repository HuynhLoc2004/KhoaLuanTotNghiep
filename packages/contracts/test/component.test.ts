import { deepEqual, equal } from "node:assert/strict";
import { test } from "node:test";

import { packageIdentity } from "../src/index.js";

void test("exports stable contract package metadata without contract behavior", () => {
  deepEqual(packageIdentity, {
    kind: "package-boundary",
    name: "@hcmc-museum/contracts",
  });
  equal(Object.isFrozen(packageIdentity), true);
});
