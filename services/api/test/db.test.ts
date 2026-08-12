import test from "node:test";
import assert from "node:assert/strict";
import { MigrationRunner, BASELINE_MIGRATIONS, DatabaseRepository } from "../src/index.js";

void test("Database Migration & Entity Repository Test Suite", async (t) => {
  await t.test("MigrationRunner executes baseline migrations without error", () => {
    const runner = new MigrationRunner();
    const results = runner.runMigrations();

    assert.equal(results.length, BASELINE_MIGRATIONS.length);
    assert.equal(
      results.every((r) => r.status === "APPLIED"),
      true,
    );
    assert.equal(runner.getAppliedMigrations().length, BASELINE_MIGRATIONS.length);

    // Running second time should skip applied migrations
    const reRun = runner.runMigrations();
    assert.equal(
      reRun.every((r) => r.status === "SKIPPED"),
      true,
    );
  });

  await t.test("DatabaseRepository seeds baseline users and roles", () => {
    const repo = new DatabaseRepository();
    const adminRole = repo.getRoleById("role-admin");
    assert.ok(adminRole);
    assert.equal(adminRole.name, "ADMIN");

    const thanhUser = repo.getUserByUsername("vithanh135");
    assert.ok(thanhUser);
    assert.equal(thanhUser.email, "trinhvidanhthanh@gmail.com");
    assert.equal(thanhUser.roleId, "role-admin");
  });

  await t.test("DatabaseRepository queries seed artifacts and sections", () => {
    const repo = new DatabaseRepository();
    const artifacts = repo.getAllArtifacts();
    assert.ok(artifacts.length >= 2);

    const drum = repo.getArtifactByCode("ART-DS-001");
    assert.ok(drum);
    assert.equal(drum.title, "Trống Đồng Đông Sơn");

    const page = repo.getCmsPageBySlug("home");
    assert.ok(page);

    const sections = repo.getCmsSectionsByPageId(page.id);
    assert.ok(sections.length >= 1);
    assert.equal(sections[0]?.type, "hero");
  });

  await t.test("DatabaseRepository createArtifact adds new artifact", () => {
    const repo = new DatabaseRepository();
    const newArt = repo.createArtifact({
      id: "art-test-01",
      code: "ART-TEST-001",
      title: "Bát Đĩa Gốm Chu Đậu",
      period: "Thế kỷ XV",
      status: "PUBLISHED",
      metadataJson: { material: "Gốm men cống" },
      createdAt: "2026-08-03T12:00:00Z",
      updatedAt: "2026-08-03T12:00:00Z",
    });

    assert.equal(newArt.id, "art-test-01");
    const queried = repo.getArtifactByCode("ART-TEST-001");
    assert.ok(queried);
    assert.equal(queried.title, "Bát Đĩa Gốm Chu Đậu");
  });
});
