# UI-HANDOFF — local workspace and complete appearance

Latest verification: [reliability handoff](docs/RELIABILITY-HANDOFF.md), 2026-11-03. It supersedes the old test counts and worker-expiry limit below; this file retains the earlier UI checkpoint and safe QA launch instructions.

## Current delivery

- Verified URL: http://127.0.0.1:3002 . This now serves the NEW UI build, not the stale acceptance server. Build ID: `Ld1PK9NNnnCH5VdlXhFcU`.
- Main server tracked handle: `proc_c6e39f5a5e82`, launch PID 24688. Loopback only; this is a local foreground app process, not an installed service or 24/7 bot host.
- Database remains SQLite, as explicitly chosen in the clarification: local data first, UI/dark mode now. No Supabase project, cloud migration, credentials, public hosting, subscriptions or publishing were created.
- Current original DB: 7 items; all 7 complete item documents remain byte-for-byte equal to the UI-pass backup, including human edits, stage approvals, version history and rejected content. LI-01 / Arah belajar is v7 Ready to Publish; it was NOT restored to the old imported copy.
- Private SQLite backup API snapshot: `backups/ui-20261017-210949/studio.sqlite`; original UI source backed up beside it. Proof: `artifacts/ui-preservation-before.json`, `ui-preservation-after.json`.

## Implemented

1. Light / dark / system appearance, persisted locally. Early head script applies the saved preference before hydration; native form controls use the appropriate color-scheme. Follows OS changes in system mode, synchronizes tabs, handles malformed and blocked browser storage without breaking content editing.
2. Semantic light/dark palettes across sidebar, board, editor, forms, approval/status chips, history, calendar, connections and dialogs. Background colors change atomically: a browser regression test caught and then verified removal of the pale intermediate frame caused by inherited button transitions. Normal/status text pairs tested at minimum WCAG 4.5:1; this is not a full accessibility audit.
3. Real database table, not a placeholder list: title/preview, platform, stage, version, planned local date/time, next owner; header sorting, numeric versions, internal horizontal scrolling at mobile widths, remembered board/table choice.
4. Keyboard quick find (Ctrl/Cmd+K), searches saved title/body/platform/stage including explicitly labelled archive results. Immediate input focus, Enter opens, Escape closes and restores focus. Canceled navigation does not discard an unsaved editor.
5. Quieter operating-workspace hierarchy with the existing ink/cobalt identity. No fake analytics, marketing hero, decorative gradients, remote fonts, or added dependency.

## Actual verification

- `npm test`: 28 tests pass, 0 fail. Includes existing SQLite/workflow/intake/export/worker guards and new appearance, sorting/search, contrast tests.
- `npm run lint`, `npm run build`, `npm run typecheck`: exit 0. Production build retains two nonfatal dynamic-filesystem tracing warnings; local-only operation from project root remains required.
- `npm audit --json`: total vulnerabilities 0, including dev dependencies.
- `e2e/ui.spec.ts`: 7/7 Chrome tests pass, 7.0 seconds, using isolated DB/inbox/vault roots. Covers malformed/blocked storage; light/dark/system, live OS changes, cross-tab/reload persistence; immediate card contrast; table sorting; quick-find focus and dirty-navigation guard; dark create/save/review-stage/approve/edit-invalidation/reject/reopen; 390px navigation/calendar/connections/table/dialog overflow.
- Console/page errors in the recorded appearance/editor flow: `[]`.
- Main URL independently exercised read-only after startup: HTTP 200, dark theme selector, visible new database table, correct 7 original records, no console/page errors. Evidence: `artifacts/ui-live-verification.json`.
- Final preservation script confirms all original documents unchanged; QA mutations were isolated and did not add records to the working DB.
- RED/GREEN evidence: `ui-theme-red.txt`, `ui-theme-green.txt`, `ui-record-view-red.txt`, `ui-record-view-green.txt`, `ui-transition-red.txt`, `ui-search-focus-red.txt`, then final `ui-tests.txt` / `ui-browser-tests.txt` / `ui-browser-results.json`.
- Source self-review only for this pass, not an independent security audit; no commit/push was requested or made. Real previous live Hermes review/revision evidence remains in FOLLOWUP-HANDOFF.md; this UI pass does not claim new model execution.

## Screenshots

- `artifacts/ui-live-dark-database.png`: NEW production port 3002, real preserved working data; visually inspected.
- `artifacts/ui-dark-board-desktop.png`, `ui-light-board-desktop.png`: isolated QA content; final dark board visually inspected.
- `artifacts/ui-dark-editor-desktop.png`, `ui-light-editor-desktop.png`: real workflow controls on an isolated copy; dark editor visually inspected. Full-page captures after scrolling can place the sticky rail lower than a top-of-page viewport; production database image is the clean delivery overview.
- `artifacts/ui-dark-board-mobile.png`, `ui-dark-database-mobile.png`, `ui-dark-calendar-mobile.png`, `ui-dark-connections-mobile.png`, `ui-dark-import-mobile.png`, `ui-dark-reject-dialog.png`.

## Run / reproduce safely

From `D:/personal/projects/adib-content-studio`, Node 26:

```sh
npm ci
npm run build
npm run start -- --port 3002
```

Use the existing running server first. Before rebuilding, stop only the owned app process serving that build. Never kill unrelated Node/Hermes processes. Do not run QA writes against the original DB. For UI QA, first `python scripts/prepare-ui-qa.py`, then start the production build on an unused loopback port with server-only env paths:

```sh
STUDIO_DB=D:/personal/projects/adib-content-studio/artifacts/ui-qa/studio.sqlite \
STUDIO_QA_TOKEN=replace-with-a-unique-run-token \
STUDIO_INBOX_ROOT=D:/personal/projects/adib-content-studio/artifacts/ui-qa/inbox \
STUDIO_EXPORT_ROOT=D:/personal/projects/adib-content-studio/artifacts/ui-qa/vault/exports \
node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3012
```

In a separate terminal:

```sh
STUDIO_TEST_URL=http://127.0.0.1:3012 STUDIO_QA_TOKEN=replace-with-a-unique-run-token STUDIO_REPORT_PATH=artifacts/ui-browser-results.json npx playwright test e2e/ui.spec.ts
npm test
npm run lint
npm run typecheck
python scripts/ui-preservation.py
```

No initial-import reset is required for an existing working DB. The preparation script copies SQLite using its backup API and is only for isolated QA.

Browser tests now require an explicit loopback URL and the same unique 16–128 character URL-safe `STUDIO_QA_TOKEN` on both server and runner. Global setup calls only `/api/studio/qa-check` before tests: the server refuses unless its database is in a dedicated `artifacts/` subdirectory and its explicit inbox/export roots are inside that same directory, without symlink/junction ancestors. Normal servers leave the token unset and reject this check. Restart a QA server with the updated code before testing; an older build cannot pass the check.

## Boundaries / remaining work

- This is Content Studio, not a general-purpose Notion clone: no arbitrary block editor, collaboration/auth, or universal custom database builder.
- Supabase is intentionally deferred, not partially connected. A later migration needs project authorization, schema/RLS/auth decisions and a tested preservation/rollback plan; keep SQLite source of truth until then.
- Existing bot integration remains: fixed validated inbox, provenance, non-overwriting dedup, real bounded Hermes review/revision plus explicit Apply, explicit non-overwriting Obsidian snapshots. No routine, bot-profile or Obsidian-source changes were made in this UI pass.
- First natural scheduled routine emission is still unobserved. Previous real UI model runs are recorded in FOLLOWUP-HANDOFF.md; no new paid/background model run was added just to refresh a badge.
- Prior durability limits remain: startup-only interrupted-job expiry; first 100 sorted inbox files per scan; explicit snapshot sync with a possible extra NEW snapshot after a write/ledger crash. Do not call these enterprise/24x7 guarantees.
- Private platform insights and social publishing remain unavailable pending proper developer/OAuth setup and separate permission. Ready to Publish is not publishing authorization.
- Broad old v1 browser suites still contain old workflow labels; do not claim the entire historical e2e directory was rerun. The current UI suite and backend suite above were rerun; prior comprehensive followup live-model evidence is retained separately.
