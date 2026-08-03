export const packageIdentity = Object.freeze({
  kind: "package-boundary",
  name: "@hcmc-museum/ui",
} as const);

export * from "./tokens/theme.js";
export * from "./cms/types.js";
export * from "./cms/renderer.js";
export * from "./timeline/renderer.js";
