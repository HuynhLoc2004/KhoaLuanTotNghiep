import test from "node:test";
import assert from "node:assert/strict";
import {
  renderAdminShellPage,
  renderAdminSidebar,
  renderAdminHeader,
  renderCmsBlockFormEditor,
  validateBlockData,
} from "../src/index.js";

void test("Admin CMS Shell & Form Editor Test Suite", async (t) => {
  await t.test("renderAdminSidebar renders brand and navigation links", () => {
    const sidebar = renderAdminSidebar("cms-content");
    assert.ok(sidebar.includes("CMS ADMIN PORTAL"));
    assert.ok(sidebar.includes("admin-nav-dashboard"));
    assert.ok(sidebar.includes("admin-nav-cms-content"));
    assert.ok(sidebar.includes("admin-nav-artifacts"));
    assert.ok(sidebar.includes("admin-nav-timeline"));
  });

  await t.test("renderAdminHeader renders curator name and role", () => {
    const header = renderAdminHeader({
      name: "Trịnh Vĩ Thành",
      role: "Curator Admin",
    });
    assert.ok(header.includes("Trịnh Vĩ Thành"));
    assert.ok(header.includes("Curator Admin"));
  });

  await t.test("validateBlockData validates required block payload fields", () => {
    const invalid = validateBlockData("hero", { id: "", title: "" });
    assert.equal(invalid.isValid, false);
    assert.ok(invalid.errors.length >= 2);

    const valid = validateBlockData("hero", {
      id: "hero-1",
      title: "Hero Title",
      subtitle: "Hero Subtitle",
    });
    assert.equal(valid.isValid, true);
    assert.equal(valid.errors.length, 0);
  });

  await t.test("renderCmsBlockFormEditor outputs select options and input fields", () => {
    const form = renderCmsBlockFormEditor("hero");
    assert.ok(form.includes("select-block-type"));
    assert.ok(form.includes("input-hero-title"));
    assert.ok(form.includes("btn-validate-block"));
    assert.ok(form.includes("btn-save-block"));
  });

  await t.test("renderAdminShellPage renders full HTML document with Form and Live Preview", () => {
    const html = renderAdminShellPage();
    assert.ok(html.includes("<!DOCTYPE html>"));
    assert.ok(html.includes('<aside id="admin-sidebar"'));
    assert.ok(html.includes('<header id="admin-header"'));
    assert.ok(html.includes("live-preview-container"));
    assert.ok(html.includes("cms-block-form"));
  });
});
