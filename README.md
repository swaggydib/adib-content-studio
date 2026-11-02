# Adib Content Studio

A local-first content workspace with version-bound approvals and human-reviewed AI revision proposals.

It keeps draft versions, review decisions, and publication records in one place, so an approval for an older draft does not silently carry over to changed content.

**Next.js · React · TypeScript · SQLite · Local Hermes integration**

> Working local application, not a cloud deployment. SQLite remains the source of truth; Supabase is deferred. GitHub stores the source code, not the running web app or your content database. No social publishing is enabled.

## Workflow and architecture

```text
Browser UI (board, editor, calendar)
                  |
           Next.js server
             /         \
       SQLite       Hermes worker (optional)
     source of      review / revision proposal
       truth                 |
                    explicit human Apply
                             |
                    new unapproved version
```

- **Version-bound approval:** relevant content edits invalidate existing approvals. Stale updates are rejected using an expected-version check.
- **Human-reviewed AI output:** Hermes returns structured feedback or a revision proposal. A completed job does not automatically change the draft.
- **Publication snapshots:** after manually publishing, the owner records the post URL, time, and exact version. Obsidian export uses that frozen snapshot, not the latest editable draft.
- **Local-first persistence:** SQLite holds the working data. GitHub distributes the source, not personal drafts or a hosted service.

Publication records are **owner-confirmed**, not independently verified through a social platform API. Worker limits are application-level boundaries, not an OS sandbox.

## Features

- Content board and sortable database table with platform/status/search filters, versions, next owner, and local-plan properties.
- Focused caption/script editor with source evidence, account, media references, and audience.
- Version-bound stage approvals and immutable activity history. Relevant edits invalidate prior approval.
- Reject-and-delete flow: after confirmation, unpublished draft content/history and completed local worker inputs/results are removed; tiny IDs prevent re-import. Previously rejected legacy records are not bulk-deleted.
- Date/time pickers and month calendar in **Asia/Shanghai (UTC+08)**. Local plans are not platform schedules.
- Hermes review feedback and revision proposals; explicit **Apply** creates an unapproved version.
- Validated schema-v1 draft intake, provenance, duplicate skipping, and malformed-pack quarantine.
- Manual publication confirmation with URL/time/frozen version. Only confirmed publications enter Obsidian, with idempotent export and explicit retry; drafts never export.
- Light/dark/system appearance, remembered board/table view, and **Ctrl/Cmd+K** quick find.
- Responsive navigation, editor, calendar, connections, and dialogs.

**Ready to Publish is a workflow stage, not permission to publish.**

## Quick start

Requires **Node.js 26**, npm, and Git. The earlier local checkpoint used Node.js 26.7.0; this documentation revision does not constitute a fresh runtime verification. Chrome is used by the recorded Playwright browser suite. Hermes and an Obsidian vault are optional integrations.

The source repository is public; cloning does not require repository access approval:

```sh
git clone https://github.com/swaggydib/adib-content-studio.git
cd adib-content-studio
npm ci
npm run build
npm run start -- --port 3002
```

Open **http://127.0.0.1:3002** while the server is running. Keep its terminal open; stop a server you started with **Ctrl+C**.

**Local access only:** `127.0.0.1` refers to the device opening the address. There is no public deployment or login/auth layer. Do not expose this app through a public tunnel or network binding.

**Before using integrations on another machine:** configure the trusted server paths below. Some defaults and helper scripts refer to the original Windows setup; a fresh clone is not a portable, preconfigured integration demo. Do not run import/export helpers against personal data just to try the UI.

A fresh clone has no original drafts, approvals, database, credentials, or local test artifacts. Create content in the UI or import a validated JSON pack.

For development:

```sh
npm run dev -- --port 3002
```

Stop the owned app server before rebuilding its shared `.next` directory. Do not run production and development on the same port.

`npm run import:initial` is a **machine-specific adapter** for Adib's original draft pack, not a generic seed. It is not required for startup. Review its source path before using it elsewhere; an existing edited database does not need re-importing.

## Integrations: actual status

| Integration | Status |
| --- | --- |
| SQLite | Active persistent source of truth; tracked SQL schema |
| Draft inbox | Versioned validation, provenance, persistent receipts, non-overwriting deduplication |
| Existing bot routines | Intake instructions previously wired without schedule changes; first natural scheduled emission still unobserved |
| Hermes review/revision | Real bounded execution verified in the earlier acceptance pass; never auto-applied |
| Obsidian | Confirmed-publication snapshots only; legacy draft export returns 403; retry sync never exports drafts |
| LinkedIn | Existing bot-side read-only access; not dashboard publishing auth |
| Instagram/TikTok private analytics | Not connected; no fabricated metrics |
| Supabase | Deferred; not connected |
| Social publishing | Unavailable |

Provider badges reflect the last task outcome, not continuous monitoring. Launcher detection alone is not authentication.

### Trusted server settings

| Environment variable | Purpose / default |
| --- | --- |
| `STUDIO_DB` | SQLite file; `data/studio.sqlite` relative to project root |
| `STUDIO_INBOX_ROOT` | Trusted inbox; current-machine default `D:/Hermes/profiles/social-manager/workspace/studio-inbox` |
| `STUDIO_EXPORT_ROOT` | Trusted export root; current-machine default `D:/personal/obsidian/second_brain/02-Projects/social-media-manager/content-studio` |
| `STUDIO_HERMES_EXE` | Optional trusted native launcher path; otherwise discovered from PATH |
| `STUDIO_TEST_URL` | Browser-test target; defaults to `http://127.0.0.1:3002` |
| `STUDIO_REPORT_PATH` | Browser-test JSON report destination |

These are server-side settings, never browser-supplied paths. Some adapters/helper scripts remain specific to the original Windows setup; review/configure their paths on another machine. Inspect **Koneksi & akses** for integration status/errors.

Worker boundaries: fixed argv, no shell interpolation, concurrency **1**, queue cap **4**, timeout **90 seconds**, output cap **256 KB**, structured-result validation, and explicit Apply. Tool disabling uses the locally verified `-t none` sentinel plus tool-event rejection—not an OS sandbox or a portable guarantee across Hermes upgrades.

## Data and safety

- **GitHub stores source, not content.** Databases, backups, `.env` files, logs, local artifacts, and raw session briefs are excluded from version control.
- Keep separate private SQLite backups. Use SQLite's backup API for an active WAL database; copying only its main file can miss recent writes.
- Intake must not overwrite human-edited or approved content.
- Exports create unique files under a fixed trusted root and reject arbitrary paths and symlink/junction ancestors.
- Local writes require validated Host/Origin pairing and JSON. SQL is parameterized; content renders as text.
- Do not commit provider credentials or attach a working database to an issue.

The earlier UI checkpoint preserved all **7 original complete item documents** byte-for-byte, including versions, approvals, history, and rejected items. Personal data and preservation artifacts remain local.

## Published-only update

Only after you manually post: approve/save the exact final version, click **Tandai sudah dipublikasikan**, enter the real post URL and publication time, and confirm matching text. Verification is **owner-confirmed**, not API-verified. Failed Obsidian export does not lose the publication record; retry from the publication panel. Later draft edits never change the frozen published snapshot.

**Tolak & hapus draft** requires confirmation and permanently removes the active unpublished draft, versions/history and completed local task data. It blocks pending/running Hermes tasks and items with publication records. Small ID tombstones prevent re-import. This is not secure erasure: old backups, source inbox files and provider-side histories are not deleted; SQLite pages are reused and file size need not shrink immediately. Existing legacy rejected records and old vault notes are not automatically cleaned up.

Recorded verification and exact boundaries: [PUBLICATION-HANDOFF.md](PUBLICATION-HANDOFF.md). The UI evidence below is historical, not a fresh verification of the current checkout.

## Verification

Recorded local checkpoint—not GitHub CI or a full security/accessibility audit:

| Check | Result |
| --- | --- |
| Unit/integration suite | **28 passed**, 0 failed |
| Current UI Chrome suite | **7 passed**, 0 failed |
| Lint / typecheck / production build | Passed |
| Full dependency audit | 0 reported vulnerabilities at that checkpoint |
| Production browser check | New table/theme on port 3002; no console/page errors |

Dependency advisories can change. Run non-browser checks:

```sh
npm test
npm run lint
npm run typecheck
npm audit
```

**Browser QA must use an isolated database, inbox, and export root.** See [UI-HANDOFF.md](UI-HANDOFF.md) for preparation/server commands. Against that isolated server, in Git Bash:

```sh
STUDIO_TEST_URL=http://127.0.0.1:3012 STUDIO_REPORT_PATH=artifacts/ui-browser-results.json npx playwright test e2e/ui.spec.ts
```

The current UI suite covers theme persistence, OS/cross-tab changes, malformed/blocked storage, sorting, focus, dirty navigation, approval invalidation/reject/reopen, and mobile overflow. Older v1 browser tests contain outdated labels; not every historical browser suite is current. Live-model testing is separate and can use your provider allowance.

## Project structure

```text
app/                    Dashboard, editor, appearance, calendar, connections, API
lib/                    SQLite, workflow, integrations, worker, dates, search/sort
lib/schema.sql          Database schema
scripts/                Import, diagnostics, isolated QA, preservation utilities
tests/                  Unit/integration tests
e2e/                    Playwright suites
docs/                   Intake contract and UI design rationale
intake.schema.json      Versioned intake contract
DESIGN.md               Design direction and references
DEV-HANDOFF.md          Development handoff entry point
UI-HANDOFF.md           Latest UI verification and boundaries
FOLLOWUP-HANDOFF.md     Earlier workflow/integration evidence
```

`data/`, `backups/`, `artifacts/`, `.next/`, and dependencies remain local. Historical handoffs reference local artifacts; they are not downloadable GitHub fixtures.

## Known limitations

- Not a general-purpose Notion replacement: no arbitrary block editor, custom database builder, multi-user auth, or collaboration.
- No Supabase migration, cloud hosting, social publishing, private platform analytics, or real platform scheduling.
- Interrupted-job expiry is checked on worker initialization; an unexpired interrupted job may need another restart after its deadline.
- Inbox scans consider the first 100 sorted JSON files; large retained inboxes need paging/archiving work.
- Snapshot sync is explicit. A crash between file write and ledger insert may leave another new snapshot, never an overwritten note.
- Hermes jobs require provider/network availability and local authentication. This laptop is not an always-on worker host.
- Build reports two nonfatal dynamic-filesystem tracing warnings; standalone/cloud deployment is unverified.

## Development notes

See [DESIGN.md](DESIGN.md), [UI refinement](docs/UI-REFINEMENT.md), and the [intake guide](docs/STUDIO-INTAKE.md).

References: [shadcn/ui](https://github.com/shadcn-ui/ui) (MIT; targeted reference inspection) and [Plane](https://github.com/makeplane/plane) (AGPL-3.0; density/workflow inspiration only, not copied code/branding).

Do not indiscriminately run routine-wiring, model-smoke, import, or export scripts: some affect the local bot workspace or create content. Normal startup does not require changing bot schedules.
