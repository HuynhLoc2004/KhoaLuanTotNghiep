export const packageIdentity = Object.freeze({
  kind: "application",
  name: "@hcmc-museum/web",
} as const);

export { renderWebShellPage, getSampleMuseumPagePayload } from "./shell/webShell.js";
export { renderHeader, renderFooter } from "./shell/layout.js";
export { renderLivingTimelinePage } from "./timeline/page.js";
export { renderPublicSearchPage } from "./search/page.js";
export { renderPublicProfilePage } from "./auth/page.js";
export { renderPublicAiGuidePage } from "./ai/page.js";
