# DEV-HANDOFF — Adib Content Studio

## Current update: reliability and QA isolation

See [RELIABILITY-HANDOFF.md](docs/RELIABILITY-HANDOFF.md) for the 2026-11-03 pass: worker restart recovery, strict dates, guarded Playwright targets and Node version requirements. **39 backend tests and 9 Chrome tests passed**, as did full lint/typecheck and an isolated webpack production build. Original content was preserved. Production audit is clean; one development-tooling advisory remains. The live app build was not replaced. Runtime/process inventories and counts below are historical checkpoints.

## Previous update: published-only Obsidian and reject/delete

See PUBLICATION-HANDOFF.md. Manual owner-confirmed publication URL/time/version gates Obsidian export; draft export is disabled. Rejection now deletes unpublished draft data and completed worker payloads, preserving tiny dedup IDs. Existing notes and legacy data are not bulk-deleted. Prior UI/followup sections below are historical where superseded.

## Latest verified delivery — UI and local data

**Current handoff: UI-HANDOFF.md.** The new build now runs at **http://127.0.0.1:3002** and was separately browser-verified there using the preserved real DB. Dark/light/system appearance, database view and keyboard quick find are implemented. SQLite remains active by the user's local-first choice; Supabase is deferred. **28 backend/unit tests and 7 current UI Chrome tests pass; lint/typecheck/build pass; full npm audit 0 vulnerabilities.** All 7 original complete item documents are unchanged, including LI-01 v7 Ready to Publish. Backup, preservation hashes, screenshots, current process handle, run commands and remaining integration limits are documented in UI-HANDOFF.md. The old port-3002 blocker below is resolved; subsequent sections are historical evidence, not the current runtime inventory.

## Superseded by acceptance followup

Current changes, backup/preservation proof, 23 passing tests, real UI Hermes review/revision evidence, and integration status are in FOLLOWUP-HANDOFF.md. This document remains the historical v1 run record. NEW build uses real data at 127.0.0.1:3004; isolated verified followup QA uses 3003. Required migration of the stable URL 3002 is NOT complete: stale app PID 28844 could not be terminated under the session approval gate. Full dependency audit is now clean; old advisory status below is historical. Do not interpret historical 'not connected' local integration notes as current implementation status, nor interpret followup local integration as social publishing permission.

## Verified delivery

Working local v1 at D:/personal/projects/adib-content-studio. Production server launched on http://127.0.0.1:3002 (loopback only), process handle proc_c789b5d4b09b. Check availability after session ends; this is not an installed Windows service. Earlier development process on port 3000 and test production process on 3001 could not be fully stopped by the process wrapper. Force-kill was blocked by the session approval gate; do not use those stale ports. Close them interactively when convenient. Do not run build concurrently with dev sharing .next.

Stack actually exercised: Node v26.7.0, Next 16.4.2, React 19.3.1, TypeScript 5.9.3, built-in node:sqlite. No native DB dependency needed. No public deployment, push or commit. Existing bot profile, routines, source draft pack and old vault notes untouched.

## Acceptance evidence

- Real pack imported into data/studio.sqlite: 4 imported; repeat 0 imported / 4 skipped. All imported drafts remain Draft; source path and full section evidence preserved. No engagement data imported or invented.
- 18/18 node tests pass: create/edit/reopen, content snapshots, text/video workflow, invalid transitions, version conflict, approval invalidation across content/account/media/audience/time changes, idempotent intake, atomic validation, safe unique export, symlink ancestor rejection, worker output validation, concurrency, caps, subprocess timeout, stale Apply and explicit Apply.
- RED before implementation: artifacts/backend-red.txt. GREEN: artifacts/backend-green.txt and artifacts/all-tests.txt.
- Typecheck and lint passed. Production build passed; two nonfatal Turbopack dynamic-filesystem tracing warnings, retained in artifacts/build.txt.
- Playwright Chrome: 2/2 tests passed, 7.8 seconds. Full click path creates QA draft -> edits -> submits review -> opens approval inbox -> requests revision with owner Hermes -> edits -> approves exact stage -> edits again -> checks approval cleared and audit retained -> reloads/reopens saved content -> exports NEW Obsidian note -> reads file back -> tests filters/list/navigation -> checks 390px board/editor horizontal overflow. Console/page errors: [] on final run.
- HTTP test verifies wrong Origin/forged Host denied; browser paths rejected; publish transition denied; optimistic conflict returns 409; malformed intake rejected; unknown content 404.
- Live Hermes smoke: actual social-manager process, 18,712ms, done, valid Indonesian revised LI-01 body; originalUnchanged=true, automaticallyApplied=false. See artifacts/worker-smoke.json and worker-integration.md. Unit tests apply proposals; live model smoke does not apply proposal to initial drafts. Browser worker submission/apply not separately exercised in final e2e.

## Browser bug fixed

Production NextRequest normalized URL origin differed from request Host. Initial same-origin comparison rejected valid local writes (403). Guard now verifies exact `Origin === http://<validated-loopback-Host>`, independent of Next's internal normalized URL. Final production browser and HTTP tests passed. An earlier test locator using getByLabel after React remount timed out even though the field appeared in the accessibility snapshot; role-based textbox locator fixed the harness, not weakened the assertion. Failed intermediate logs were superseded; final results are in browser-tests.txt and browser-results.json.

## Artifacts

- artifacts/desktop-initial.png — actual initial four-draft board, visually inspected.
- artifacts/desktop-board.png — final e2e desktop board (includes QA drafts).
- artifacts/desktop-editor-approved.png — actual approved-stage editor, visually inspected.
- artifacts/mobile-board.png, artifacts/mobile-editor.png — actual narrow-width screenshots; board visually inspected.
- artifacts/browser-tests.txt, browser-results.json, browser-vertical-slice.json — exact output, export path, console result and assertions.
- artifacts/worker-smoke.json, worker-integration.md, worker-tests.log.
- artifacts/npm-audit-initial.json, all-tests.txt, lint.txt, typecheck.txt, build.txt.

New Obsidian snapshot read back successfully:
D:/personal/obsidian/second_brain/02-Projects/social-media-manager/content-studio/2026-10-17-studio-0d87ba67-0d2b-40fb-838e-4c7fc76385a4.md

It is labelled QA/local content and is not publication evidence. Two clearly labelled QA drafts were created in working DB during browser verification; they are retained rather than silently deleted. Source drafts were not approved or edited.

## Security/code review before handoff (not an external audit)

Reviewed route dispatch, validation and parameterized DB paths; fixed same-origin bug against actual production responses. No shell interpolation. Browser cannot choose executable, command args or export destination. HTML content is React text, not dangerouslySetInnerHTML. Source evidence is not dereferenced. Worker output is exact validated JSON, separate from original content until Apply; tools disabled against installed source and tool events rejected. Export uses fixed server root, traversal/junction checks and exclusive-create. Audit history preserves invalidated approvals.

npm audit --omit=dev returned zero vulnerabilities. Full audit has 5 HIGH dev-only findings rooted in braces through eslint-config-next/fast-glob/micromatch. No fixed braces version was offered by registry. Dependency removal command was blocked by approval gate; no workaround bypass used. This remains unresolved, so do NOT claim full security gate clean. No commit was requested or made.

## Incomplete / next actions

1. Resolve dev lint dependency advisory when an interactive approval/session can change dependency chain; preserve lint coverage. Re-audit.
2. Add global unsaved-edit navigation guard; current editor Back warns but sidebar/brand can discard unsaved form changes. Add focus trap/Escape/restore to JSON import dialog and mobile access to connection settings. Current core keyboard controls and 390px layout work; full accessibility audit not done.
3. Hermes zero-tool sentinel `-t none` is verified implementation-specific, not documented portable API. Recheck tool resolution after upgrades before enabling worker. Provider availability is not implied by launcher availability. Worker is local in-process, not supervised service; interrupted running jobs fail on later expiry, no automatic retry. No automatic routine ingestion.
4. Add direct item URLs/router selection and richer calendar once needed. Current agenda uses saved local date proposals, not actual platform schedules. Imported proposals intentionally remain evidence until reviewed.
5. No media uploads, analytics, production account connectors, publication-approval flow, Scheduled/Posted/manual-publication records or publishing endpoints. All unavailable, not simulated.
6. Dynamic filesystem tracing warnings remain; run from project root. Local backup procedure and start commands in README. No public deployment until separate security/auth/data review and permission.

Next useful product action: open one original draft, review its factual claims/media needs, edit and submit the stage through the existing vertical slice. Do not mistake test approvals or Ready to Publish for permission to publish.
