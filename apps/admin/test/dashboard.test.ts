import assert from "node:assert/strict";
import { test } from "node:test";
import { renderAdminAnalyticsDashboardPage } from "../src/dashboard/page.js";

void test("renderAdminAnalyticsDashboardPage renders admin shell and dashboard metrics", () => {
  const html = renderAdminAnalyticsDashboardPage();

  assert.equal(html.includes("<!DOCTYPE html>"), true);
  assert.equal(
    html.includes("Bảng Điều Khiển &amp; Phân Tích Bảo Tàng") ||
      html.includes("Bảng Điều Khiển & Phân Tích Bảo Tàng"),
    true,
  );
  assert.equal(html.includes("Trống Đồng Đông Sơn"), true);
  assert.equal(html.includes("Huỳnh Tấn Lộc"), true);
});
