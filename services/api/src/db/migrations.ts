export interface Migration {
  id: string;
  name: string;
  sql: string;
}

export const BASELINE_MIGRATIONS: Migration[] = [
  {
    id: "001_create_roles_table",
    name: "Tạo bảng roles (Phân quyền RBAC)",
    sql: `
      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        permissions JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `.trim(),
  },
  {
    id: "002_create_users_table",
    name: "Tạo bảng users (Tài khoản người dùng)",
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        role_id VARCHAR(64) NOT NULL REFERENCES roles(id),
        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
    `.trim(),
  },
  {
    id: "003_create_cms_tables",
    name: "Tạo bảng cms_pages và cms_sections (Quản lý trang CMS)",
    sql: `
      CREATE TABLE IF NOT EXISTS cms_pages (
        id VARCHAR(64) PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
        published_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON cms_pages(slug);

      CREATE TABLE IF NOT EXISTS cms_sections (
        id VARCHAR(64) PRIMARY KEY,
        page_id VARCHAR(64) NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        config_json JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_cms_sections_page_id ON cms_sections(page_id);
    `.trim(),
  },
  {
    id: "004_create_artifacts_table",
    name: "Tạo bảng artifacts (Quản lý hiện vật di sản)",
    sql: `
      CREATE TABLE IF NOT EXISTS artifacts (
        id VARCHAR(64) PRIMARY KEY,
        code VARCHAR(100) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        period VARCHAR(100) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
        metadata_json JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_artifacts_code ON artifacts(code);
      CREATE INDEX IF NOT EXISTS idx_artifacts_status ON artifacts(status);
    `.trim(),
  },
  {
    id: "005_create_media_assets_table",
    name: "Tạo bảng media_assets (Tài nguyên hình ảnh & 3D)",
    sql: `
      CREATE TABLE IF NOT EXISTS media_assets (
        id VARCHAR(64) PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        url TEXT NOT NULL,
        size_bytes BIGINT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `.trim(),
  },
];

export class MigrationRunner {
  private appliedMigrations: Set<string> = new Set();

  public getAppliedMigrations(): string[] {
    return Array.from(this.appliedMigrations);
  }

  public runMigrations(): Array<{ id: string; name: string; status: "APPLIED" | "SKIPPED" }> {
    const results: Array<{ id: string; name: string; status: "APPLIED" | "SKIPPED" }> = [];

    for (const migration of BASELINE_MIGRATIONS) {
      if (this.appliedMigrations.has(migration.id)) {
        results.push({ id: migration.id, name: migration.name, status: "SKIPPED" });
      } else {
        this.appliedMigrations.add(migration.id);
        results.push({ id: migration.id, name: migration.name, status: "APPLIED" });
      }
    }

    return results;
  }
}
