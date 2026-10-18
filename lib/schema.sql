PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
CREATE TABLE IF NOT EXISTS studio_items (
  id TEXT PRIMARY KEY,
  external_id TEXT UNIQUE,
  version INTEGER NOT NULL CHECK(version > 0),
  document TEXT NOT NULL CHECK(json_valid(document)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS studio_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);
INSERT OR IGNORE INTO studio_migrations(version, applied_at) VALUES(1, strftime('%Y-%m-%dT%H:%M:%fZ','now'));
CREATE TABLE IF NOT EXISTS studio_publications (
 id TEXT PRIMARY KEY,
 item_id TEXT NOT NULL REFERENCES studio_items(id) ON DELETE RESTRICT,
 version INTEGER NOT NULL,
 post_key TEXT NOT NULL UNIQUE,
 document TEXT NOT NULL CHECK(json_valid(document)),
 path TEXT,
 error TEXT,
 UNIQUE(item_id,version)
);
CREATE TABLE IF NOT EXISTS studio_rejected_ids (
 item_id TEXT PRIMARY KEY,
 external_id TEXT UNIQUE,
 idea_id TEXT NOT NULL,
 rejected_at TEXT NOT NULL
);
INSERT OR IGNORE INTO studio_migrations(version,applied_at) VALUES(3,strftime('%Y-%m-%dT%H:%M:%fZ','now'));
