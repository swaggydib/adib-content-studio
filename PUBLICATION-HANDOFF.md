# PUBLICATION-HANDOFF — published-only Obsidian + reject/delete

## Implemented behavior

- Drafts, ideas and rejected content never export from Content Studio to Obsidian. The old per-item `/export` endpoint now returns 403, even for a stage-approved item; it is not an alternate bypass.
- From a saved, stage-approved Ready to Publish item, **Tandai sudah dipublikasikan** opens a manual confirmation dialog: actual platform post URL, publication date/time in Asia/Shanghai, displayed frozen version/text, and an explicit matching-text checkbox.
- This records a past external action. It does not publish, verify the platform through an API, schedule a post, or grant the bot publication authority. Verification is `owner_confirmed` / Dikonfirmasi oleh Adib.
- Publication records live separately from production stage. Schema v3 adds `studio_publications` with immutable confirmation/snapshot document, unique post identity and unique item/version; export path/error are separate fields. Existing item documents/approval semantics are not rewritten.
- Confirmation validates current version, Ready to Publish, approval presence, platform-specific HTTPS post URL (not profile/credentials/foreign host), timezone-bearing time and no future date. Exact retries return the same record; conflicting versions/URLs/times are rejected without duplicating.
- Only the frozen final text, title, publication URL/time/version, owner-confirmation metadata and HTTPS references are exported. Raw draft source notes, local source paths, historical drafts and full audit JSON are not exported.
- Export failure never rolls back the publication. UI shows **Belum tersimpan ke Obsidian** and explicit retry. Connection sync retries pending publication records only; unpublished items are not a pending export queue.
- Export uses a stable UUID-based filename, exclusive create, trusted fixed root and symlink/junction checks. An existing identical crash-recovery file can be reconciled; a different file is never overwritten. Later draft edits do not alter the publication note.

## Rejection change requested during development

- **Tolak & hapus draft**, with a destructive confirmation, removes the unpublished item document—including body, version snapshots and audit history—from the active database.
- Completed local review/revision job documents and persisted prompts for that item are also deleted transactionally.
- Queued/running Hermes tasks block rejection until finished. A locked re-read when queueing prevents a concurrent deletion from retaining/recreating a private queued prompt.
- Items with publication records cannot be removed via rejection; UI and backend both enforce this.
- A tiny tombstone stores item/external/idea IDs and rejection time, not body/title/history. Intake consults tombstones so a replay or stable idea under a new external ID is skipped. The read-only intake-status helper exposes these IDs to the bot.
- New deleted drafts cannot be reopened. Legacy Rejected records are NOT automatically purged or silently migrated; existing notes remain untouched.
- This is not secure erasure or full source cleanup. Old SQLite backups, bot inbox/source files, external provider/session histories are not deleted. SQLite frees pages for reuse; the file need not immediately shrink. Tombstone dedup is ID-based, not semantic duplicate detection.

## Bot output-policy reconciliation

Read-only inspection found the existing social-manager rules and routine prompts still explicitly directed drafts/reports/plans into the vault. Those instructions conflicted with the new requested workflow.

Within the authorized social-manager content workflow only:

- Updated workspace `AGENTS.md`, `OBSIDIAN.md`, and `studio-intake-guide.md`: LinkedIn drafts go to validated inbox/dashboard; feedback/plans go to Bot Chat or bounded dated workspace notes, not automatic vault mirrors. Existing vault context can be read; unpublished material is not appended to the vault project index.
- Preserved LinkedIn-only scope and all Instagram/TikTok exclusions. No credentials, model/provider settings, SOUL, other profiles, Home/About notes or personal vault notes changed.
- Updated ONLY prompts for existing routine IDs `eeee27007806` and `9074747296c7`, through supported `hermes -p social-manager cron edit --prompt` CLI after checking help/docs.
- Read-back compared EVERY other job field: schedules, delivery, continuity, model/provider, skills, workdir, state and unrelated jobs unchanged. Evidence: `artifacts/publication-cron-verification.json`.
- Updated repository intake guide to the same policy. `scripts/apply-publication-policy.py` requires explicit `--apply`; normal startup does not reconfigure routines.
- The first natural routine run under this new policy has NOT been observed. No new model call was made for this feature; do not claim behavioral scheduled-run proof from a prompt edit.

## Backup and preservation

SQLite backup API snapshot and private policy backups:

`backups/publication-20261018-031202/`

Includes the pre-change DB and `bot-policy/` copies of the three workspace instruction files plus jobs.json. Backups stay outside public/static roots and git.

Production read-only startup confirmed marker `published-only-1`, all 7 original complete item documents byte-for-byte unchanged from the backup, zero real publication records, and zero draft items pending Obsidian export. No original content was marked published or rejected for QA. Existing Obsidian notes were not deleted or rewritten. Evidence: `artifacts/publication-before.json`, `publication-preservation.json`.

## Actual verification

- **33/33 Node tests pass**, 0 failures; includes original workflow/intake/worker guards, publication-only gate, immutable snapshot after later edit, idempotence, bad URL/time/version rejection, unavailable-vault retry, rejected-item/job cleanup, anti-reimport and concurrent deletion/queue regression.
- **9/9 current Chrome browser tests pass**, 0 failures, 9.8 seconds: desktop confirmation -> real isolated Markdown readback -> exact retry -> legacy export denied -> later edit leaves note unchanged -> published-item reject disabled -> separate rejected draft deleted; mobile confirmation/cancel; existing appearance/database/keyboard/dirty-navigation tests.
- Lint, production build and typecheck: exit 0. Build retains two nonfatal local filesystem tracing warnings; not a cloud-deployment claim.
- Full npm audit: 0 vulnerabilities at this checkpoint.
- No page errors in the new publication browser flow; existing appearance/editor console checks remained empty.
- RED artifacts: `publication-export-red.txt`, `publication-service-red.txt`, `publication-sync-red.txt`, `publication-reject-red.txt`, `publication-reject-race-red.txt`. Final output: `publication-all-tests.txt`, `publication-browser-tests.txt`, `publication-browser-results.json`, `publication-lint.txt`, `publication-build.txt`, `publication-typecheck.txt`, `publication-audit.json`.
- Chrome QA used only `artifacts/publication-qa/db.sqlite`, isolated inbox and `artifacts/publication-qa/vault/exports`. URLs/titles are explicitly labelled synthetic QA, not evidence of actual social posts. Actual exported files were read back and assertions checked no private source notes/audit/future edit leaked.
- Final test scratch was the physical `D:/Hermes/cache/scratch`. The C: Hermes home alias is a junction; using that alias as an export fixture correctly triggers the path-safety guard. The guard was not weakened.
- Older broad v1/followup browser suites contain historic export/archive assumptions and are not claimed current. Run the selected current UI/publication suites against isolated data.

## Screenshots

- `artifacts/publication-confirm-dialog.png`: desktop dark confirmation, visually inspected.
- `artifacts/publication-confirm-mobile.png`: 390px dialog, overflow assertion passed.
- `artifacts/publication-confirmed-desktop.png`: publication + successful isolated export.
- `artifacts/publication-reject-delete.png`: explicit deletion warning.

## Run / reproduce

Normal app: `npm run start -- --port 3002` from project root. It remains loopback-only and unauthenticated. Both temporary main verification and QA servers were stopped to preserve the user's earlier stop-web request. No public deployment or social publishing.

For isolated browser QA, copy the working DB using SQLite backup API into `artifacts/publication-qa/db.sqlite`, create its `inbox/` and `vault/` parent, start production on an unused port with STUDIO_DB / STUDIO_INBOX_ROOT / STUDIO_EXPORT_ROOT all pointing there, then:

```sh
STUDIO_TEST_URL=http://127.0.0.1:3031 STUDIO_REPORT_PATH=artifacts/publication-browser-results.json npx playwright test e2e/ui.spec.ts e2e/publications.spec.ts
```

The publication test intentionally asserts its export destination is exactly the isolated publication-qa vault. Never run it against real data/vault. No fresh original-draft import is needed.

## Delivery boundaries

Feature is local; no automatic push to the private GitHub repo was performed. Supabase, authentication, scheduling and automatic publishing remain deferred.

## Independent review and corrections

Read-only independent review found no concrete security blocker and two logic issues: a rejection/queue race across processes and normalization of impossible publication dates. Both were addressed with RED/GREEN regression tests: the worker re-reads item existence/version after acquiring BEGIN IMMEDIATE; publication time checks actual calendar/clock components instead of trusting Date.parse normalization. Tests reject 30 February, a non-leap 29 February, 31 April and hour 24. The review's additional retry suggestion was also implemented: exact retries validate against the frozen publication platform, so changing the editable draft platform does not break an existing confirmation's idempotence. The full Node suite, lint/build/typecheck and current browser suites were rerun after corrections. The earlier standalone review saw the pre-correction source; this is not a claim of a second independent audit.
