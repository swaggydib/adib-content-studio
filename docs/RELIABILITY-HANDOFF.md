# Reliability verification — 2026-11-03

## Changes

- Interrupted Hermes jobs are rechecked at timeout plus 30 seconds, then marked failed. Queued work resumes without another restart or automatic retry of the interrupted task. Closing the worker cancels its recovery timer.
- Create, edit and intake share strict calendar validation with publication records. Impossible dates and times are rejected without changing existing content, approvals or batch contents.
- Playwright requires an explicit loopback origin and matching QA run token. Before tests run, the server verifies explicit database/inbox/export paths in a dedicated `artifacts/` subdirectory and rejects symlink/junction ancestors. Production servers leave the token unset. Standalone historical diagnostic scripts are outside this guard.
- Node 26.7.0 is pinned in `.nvmrc`; package/lock engines accept `>=26.7.0 <27`, enforced for installation through `.npmrc`.
- Publication browser tests discover their export root from the verified QA server instead of using a machine-specific hardcoded vault path.

## Verified

- Node 26.7.0: **39/39 backend tests**, full ESLint and TypeScript checks passed.
- Isolated Next.js 16.4.2 production build passed with `next build --webpack`. A nested-lockfile workspace-root warning occurred because the QA copy shares installed dependencies; no existing app build was overwritten. The default Turbopack build was not rerun in this pass.
- **9/9 Chrome tests** (`e2e/ui.spec.ts` and `e2e/publications.spec.ts`) passed against that production build. Coverage includes create/edit/review/approval invalidation/rejection, publication confirmation, idempotent export and frozen snapshots, themes, quick find, dirty navigation, reload persistence and 390px layouts.
- The Playwright preflight accepted the isolated production server. It also refused missing settings and an unverified HTTP server before any content request. The production QA endpoint returned 403 without the token.
- Recorded console errors in the monitored UI flow: `[]`. Desktop board and mobile publication-dialog screenshots were visually inspected.
- All **5 original complete content documents** matched their pre-QA hashes. QA used synthetic fixtures, a new database, a new inbox and a new vault. It did not copy original drafts or job queues.
- Node 22.14.0 installation dry-run was rejected with `EBADENGINE`; Node 26.7.0 offline installation dry-run passed. System Node and permanent PATH were not changed.

Local evidence (ignored by Git): `artifacts/final-check-9CS4aV/` contains build/lint/typecheck/test/browser logs, result JSON, preservation evidence and audit reports. Screenshots and the monitored-console report are under its `app/artifacts/` directory. These artifacts are local only.

## Security review and limits

Source self-review covered workflow/version callers, worker recovery/concurrency and shutdown, API validation, QA storage/token checks, publication exports and files intended for commit. This was not an independent penetration test.

`npm audit --omit=dev` reported **0 production vulnerabilities**. Full audit reported **11 moderate dependency findings from one minimatch advisory**, [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), through ESLint/typescript-eslint. The advisory concerns attacker-controlled glob amplification with `optimizationLevel >= 2`; browser content does not supply lint patterns. Installed minimatch versions are 3.1.5 and 10.2.6; the advisory lists 11.0.1 as patched. No forced major override or suggested ESLint downgrade was applied: the existing consumers use different APIs, and a forced change requires its own compatibility pass. This development-tooling issue remains open; the audit is not clean overall.

No live Hermes/provider request, real social publication, cloud deployment or production app restart was performed. The existing running app may still serve its previous build until rebuilt and restarted deliberately. Historical browser suites outside the two files above were not rerun.

Next actions: safely update the lint dependency chain for the minimatch advisory, then reduce list polling payloads if retained version history grows. No polling optimization was included in this change.
