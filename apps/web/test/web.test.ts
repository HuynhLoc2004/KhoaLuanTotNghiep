import test from "node:test";
import assert from "node:assert/strict";
import {
  renderWebShellPage,
  getSampleMuseumPagePayload,
  renderHeader,
  renderFooter,
} from "../src/index.js";

void test("Public Web Shell & Page Renderer Test Suite", async (t) => {
  await t.test("renderHeader outputs brand, logo, and navigation links", () => {
    const header = renderHeader();
    assert.ok(header.includes("BẢO TÀNG LỊCH SỬ TP.HCM"));
    assert.ok(header.includes("nav-home"));
    assert.ok(header.includes("nav-artifacts"));
    assert.ok(header.includes("nav-timeline"));
    assert.ok(header.includes("nav-map-3d"));
    assert.ok(header.includes("nav-guide"));
  });

  await t.test("renderFooter outputs contact info and links", () => {
    const footer = renderFooter();
    assert.ok(footer.includes("2 Nguyễn Bỉnh Khiêm"));
    assert.ok(footer.includes("Bảo tàng Lịch sử TP. Hồ Chí Minh"));
    assert.ok(footer.includes("Bảo mật & Quyền riêng tư"));
  });

  await t.test("renderWebShellPage renders full HTML document with CMS blocks", () => {
    const payload = getSampleMuseumPagePayload();
    const page = renderWebShellPage(payload);

    assert.equal(page.title, "Trang chủ Trải nghiệm Bảo tàng Số");
    assert.equal(page.renderedBlocksCount, 4);
    assert.ok(page.html.includes("<!DOCTYPE html>"));
    assert.ok(page.html.includes('<header id="main-header"'));
    assert.ok(page.html.includes('<main id="app-content"'));
    assert.ok(page.html.includes('<footer id="main-footer"'));

    // Verifies CMS blocks rendered inside HTML
    assert.ok(page.html.includes("Hành Trình Khám Phá Di Sản Lịch Sử"));
    assert.ok(page.html.includes("Bảo Vật Quốc Gia & Hiện Vật Tiêu Biểu"));
    assert.ok(page.html.includes("Tượng Phật Lợi Mỹ"));
    assert.ok(page.html.includes("Dòng Thời Gian Lịch Sử Tiến Trình Vĩnh Cửu"));
  });
});
