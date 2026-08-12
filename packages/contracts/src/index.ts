export const packageIdentity = Object.freeze({
  kind: "package-boundary",
  name: "@hcmc-museum/contracts",
} as const);

export * from "./common/error.js";
export * from "./common/health.js";
export * from "./timeline/schemas.js";
export * from "./search/schemas.js";
export * from "./auth/schemas.js";
export * from "./dashboard/schemas.js";
