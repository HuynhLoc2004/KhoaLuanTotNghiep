export const packageIdentity = Object.freeze({
  kind: "application",
  name: "@hcmc-museum/admin",
} as const);

export { renderAdminShellPage } from "./shell/adminShell.js";
export { renderAdminSidebar, renderAdminHeader } from "./shell/layout.js";
export { renderCmsBlockFormEditor, validateBlockData } from "./forms/cmsFormBuilder.js";
export { renderAdminAnalyticsDashboardPage } from "./dashboard/page.js";
