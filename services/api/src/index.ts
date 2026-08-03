export const packageIdentity = Object.freeze({
  kind: "service",
  name: "@hcmc-museum/api",
} as const);

export { createApp } from "./app.js";
export { correlationIdMiddleware } from "./middleware/correlationId.js";
export { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
export { validateRequest } from "./middleware/validate.js";
