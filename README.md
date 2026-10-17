# Adib Content Studio

A private, local-first workspace for turning ideas into reviewed, versioned drafts—with Adib in control of every approval.

**Next.js · React · TypeScript · SQLite · Local Hermes integration**

> Working local application, not a cloud deployment. SQLite remains the source of truth; Supabase is deferred. GitHub stores the source code, not the running web app or your content database. No social publishing is enabled.

## Access the web app

### On Adib's current laptop

Open **http://127.0.0.1:3002** while the local server is running.

After restarting the laptop, or if the server has stopped:

```sh
cd D:/personal/projects/adib-content-studio
npm run start -- --port 3002
```

Keep the terminal open. Stop a server you started there with **Ctrl+C**. If the port is already occupied and the dashboard opens normally, use the existing server instead of starting another one.

### From another device

`127.0.0.1` refers to the device opening the address, not to your laptop. A phone or another computer cannot access this loopback-only app using that URL. No public hosting or GitHub Pages deployment is configured.

**The app has no login/auth layer. Do not expose it through a public tunnel or network binding.** Remote access needs a separately authorized security/deployment setup. A private repository does not make an exposed server safe.

## Features

- Content board and sortable database table with platform/status/search filters, versions, next owner, and local-plan properties.
- Focused caption/script editor with source evidence, account, media references, and audience.
- Version-bound stage approvals and immutable activity history. Relevant edits invalidate prior approval.
- Reject/reopen flow; rejected ideas remain archived, not deleted.
- Date/time pickers and month calendar in **Asia/Shanghai (UTC+08)**. Local plans are not platform schedules.
- Hermes review feedback and revision proposals; explicit **Apply** creates an unapproved version.
- Validated schema-v1 draft intake, provenance, duplicate skipping, and malformed-pack quarantine.
- Explicit Obsidian snapshots to new files, not silent overwrites or bidirectional editing.
- Light/dark/system appearance, remembered board/table view, and **Ctrl/Cmd+K** quick find.
- Responsive navigation, editor, calendar, connections, and dialogs.

**Ready to Publish is a workflow stage, not permission to publish.**

## Quick start

Requires **Node.js 26** (verified with 26.7.0), npm, and Git. Chrome is used by the recorded Playwright browser suite. Hermes and an Obsidian vault are optional integrations.

Authenticate your Git client with an account that can access this private repository:

```sh
git clone https://github.com/swaggydib/adib-content-studio.git
cd adib-content-studio
npm ci
npm run build
npm run start -- --port 3002
```

Open **http://127.0.0.1:3002**. A fresh clone has no original drafts, approvals, database, credentials, or local test artifacts. Create content in the UI or import a validated JSON pack.

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
| Obsidian | Explicit unique snapshots and deduplicated snapshot sync |
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

The UI checkpoint preserved all **7 original complete item documents** byte-for-byte, including versions, approvals, history, and rejected items. Personal data and preservation artifacts remain local.

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
