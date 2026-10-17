# FOLLOWUP-HANDOFF — acceptance fixes, 2026-10-17

> Later UI pass: the old port-3002 blocker recorded below is resolved. The NEW theme/database/quick-find build now serves the preserved real DB at http://127.0.0.1:3002 and has separate browser evidence. See UI-HANDOFF.md for current 28-test/7-browser verification, byte-for-byte preservation of all 7 current items and remaining limits. This file retains the earlier followup evidence and historical process failure; its old PID/ports are not instructions to terminate anything now.

## Delivery status — NOT fully accepted

Existing app modified in place. NEW verified production build is running at http://127.0.0.1:3004 with the real preserved database. Isolated production QA ran at http://127.0.0.1:3003. Port 3002 replacement is BLOCKED: old app PID 28844 still owns it. Ownership was verified by CIM command line pointing to this project's Next start command. The terminal safety gate rejected taskkill /F; managed handles for the old server were not found, and interactive clarification was undeliverable in single-query mode. No unrelated Node/Hermes processes were killed and no safety bypass used. Ports 3000/3001 also still belong to old app processes; do not use them.

User-only local operation remaining: close ONLY the old Content Studio process for port 3002 (observed PID 28844, re-check identity before acting), then start the new build on 3002. Do not assume 3002 currently runs the new code. The build at 3004 is available for inspection meanwhile. New production process handle proc_ce6f0228a0e3; QA handle proc_613cb639af7d. Local processes are not installed persistent services.

## Preservation

Before any schema modification, Python sqlite3 backup API created:
D:/personal/projects/adib-content-studio/backups/20261017-201151/studio.sqlite

The private backup is outside public/static roots and ignored by git. Source snapshots and a SHA-256 manifest are beside it. Six original SQLite item documents were captured. After new startup/intake, ALL SIX item-document hashes remained byte-for-byte equal, including LI-01 `3f6484cb-3daa-49cc-b38e-10b05fe3aaae`, v4, Ready to Publish. No source-pack restoration or replay overwrote human edits/approvals. Proof: artifacts/followup-preservation-before.json, followup-preservation-after.json and followup-preservation-proof.txt.

One explicitly labelled QA bot-intake item was added to the working DB by the authorized smoke. Existing vault notes were not modified; followup automated exports used artifacts/followup-qa/vault/exports only.

## Root causes and changes

- Date was a plain ISO text field. Editor now has labelled native date/time controls, Asia/Shanghai UTC+08 label and clear control. Shared civil-date conversion prevents UTC midnight/month drift. Month calendar supports month navigation/jump, date selection, and clickable day agenda items.
- Stage revision previously only changed owner; real worker was a second box with silently disabled controls. One Review & revise panel now distinguishes feedback from replacement text, explains save/instruction/queue/rejected prerequisites, shows durable task status/results, permits explicit retry, and applies a proposal only through a new version. Review returns factual/content/style feedback and never writes the content item.
- Version-keyed editor remounts could erase instruction/local state. Editor now keys by item ID, preserves a dirty form through background polls, reconciles clean saved versions and saves against its ORIGINAL baseline version. Conflicts cannot silently overwrite a newer server edit. Sidebar, brand and Back warn about dirty content; reload uses beforeunload. Import/reject dialogs trap keyboard focus, close with Escape and restore focus. Connections are accessible at mobile width.
- Added Rejected state, explicit Tolak ide with optional reason, version/time/history record, approval clearing, default active-board exclusion, Rejected filter and explicit reopen to Draft. Outstanding worker output cannot apply to rejected content. Title-only creation saves an Idea; body is no longer required to capture an idea.
- Added bounded inbox integration at canonical physical workspace path D:/Hermes/profiles/social-manager/workspace/studio-inbox. C:/Users/LENOVO/AppData/Local/hermes is an actual junction, so configuration uses its verified canonical path rather than weakening symlink checks. Same workspace is referenced through the usual C alias in routine guide.
- Packs are schema-v1 validated atomically, hash/name receipts survive restart, malformed packs get new quarantine copies, source filename/hash provenance is recorded, stable duplicate external IDs are skipped, and rejected ideaId blocks new identity reimport. App startup and GET polling scan the inbox; browser polling is cleaned up on unmount. No always-on filesystem watcher exists.
- Explicit Obsidian sync exports changed current item/version snapshots once per ledger entry; repeated sync/polls do not duplicate them. Status reports last success/error and pending versions. Vault failure does not roll back DB content writes. Per-item manual export remains available.
- Connections view shows actual worker last job outcome, intake receipts and Obsidian sync status. Launcher existence alone is labelled unverified, not connected. Added strictly labelled, validated user-supplied metric JSON ingestion and observation listing; no fabricated metrics were seeded.
- Dev audit chain removed by replacing eslint-config-next (fast-glob -> micromatch -> vulnerable braces) with explicit ESLint JS/TypeScript and React hooks rules. No force audit fix, dependency suppression, or fake advisory override. npm install removed unused transitive packages; full npm audit reports 0 vulnerabilities.

## Actual verification

- Baseline 18 tests preserved. Followup suite: 23/23 pass. Includes date boundary, title-only rejection/reopen, stale/duplicate rejection, persistent inbox restart/dedupe, human-edit/rejection protection, malformed quarantine, symlink rejection, snapshot dedupe, nonmutating review and worker apply rejection. Prior worker timeout/output-cap/concurrency tests still pass.
- RED artifacts: followup-red.txt, followup-intake-red.txt, followup-review-red.txt, followup-date-red.txt, followup-ui-red.json. Initial browser repro saw datePicker=0, timePicker=0, reviewButton=0, rejectButton=0, revisionDisabled=true.
- Production browser followup: 1 comprehensive test PASSED in 45.2 seconds. Actual clicks cover title-only idea -> dirty navigation cancel -> date/time save and November midnight agenda roundtrip -> stage approval -> REAL model review -> REAL revision -> explicit Apply -> approval invalidation -> reject/reason -> archive filter -> reopen -> import modal focus/Escape/restore -> inbox scan -> idempotent Obsidian sync -> desktop/mobile screenshots. Console/page errors: [].
- Live UI review job 199b69cd-d2bc-4e0a-ae0f-7d13fa78bbf2 finished done; exact item document remained unchanged by review. Live UI revision beada3bb-8f07-49da-97b9-cd9f352dead0 finished done and was explicitly applied to a new unapproved QA version. Original user content was not involved.
- Initial followup browser run reached real review/revision/apply/reject, then caught a Back navigation bug (label promised board but returned calendar). Fixed onBack to return board; final comprehensive test passed. This was not an ignored test failure.
- Typecheck, lint and production build pass. Build still has two nonfatal dynamic-filesystem tracing warnings (local-only, no deployment claim).
- artifacts/followup-tests.txt, followup-browser-tests.txt, followup-browser-results.json, followup-browser-evidence.json, followup-build.txt, followup-typecheck.txt, followup-lint.txt, followup-audit.json retain actual outputs.

## Cron and bot-to-inbox integration

Only existing jobs eeee27007806 and 9074747296c7 were edited via native `hermes -p social-manager cron edit <id> --prompt ...`. Their existing prompts were preserved verbatim and an intake supplement appended. Exact read-back compared EVERY other job field unchanged: schedule, next run, delivery, skills, context_from self/continuity, workdir, state and model/provider. Before/after JSON and CLI listings: artifacts/followup-cron-*.json / followup-cron-list-*.txt. A NEW workspace studio-intake-guide.md was created from docs/STUDIO-INTAKE.md; no old profile files/SOUL/skills modified.

The guide requires genuinely new drafts only, stable IDs, rejection-state check through a fixed read-only script, and no new spam drafts for feedback-only runs. Existing Bot Chat and NEW Obsidian deliverables remain intact.

Bounded actual smoke: model revision generated by REAL UI process -> app-side strict schema-v1 wrapping/validation -> exclusive NEW QA pack in actual bot workspace inbox -> new production app starts -> QA item appears -> rescan count stable. artifacts/followup-bot-inbox-emission.json and followup-preservation-after.json prove it. This is NOT a claim that a scheduled weekly cron run already executed; future routine emission is prompt-wired and its first natural scheduled run has not occurred. The smoke used real model output, not fabricated API responses.

## Screenshots

artifacts/followup-browser-calendar-desktop.png
artifacts/followup-browser-calendar-mobile.png
artifacts/followup-browser-review-desktop.png
artifacts/followup-browser-rejected-desktop.png
artifacts/followup-browser-connections-desktop.png
artifacts/followup-browser-connections-mobile.png

Desktop calendar/review and final mobile calendar were visually inspected. Narrow checks assert no horizontal overflow at 390px. QA item titles/timestamps in images are test data, not public content.

## Remaining blockers and known limitations

1. REQUIRED acceptance blocker: replace old server at 3002 after user closes the app-owned stale process. QA/new real build are 3003/3004, NOT 3002. Session cannot approve force termination. Final handoff must disclose this.
2. Actual Instagram/TikTok private insights/publishing OAuth requires approved developer apps/products, appropriate account capabilities and user authorization. No signup, paid actor, account change or external publication was attempted. User can import real labelled insight observations now. LinkedIn bot read-only access is not dashboard publishing authentication. Version-bound publication approvals/manual URL publication tracking were optional and are not implemented; publishing remains unavailable.
3. Worker tool disabling remains the installed-source-verified `-t none` sentinel with stream tool-event rejection. This is not an OS sandbox or portable future guarantee; reverify after Hermes/plugin upgrades. Startup plugin/profile setup is trusted local configuration. Capability reflects last outcome, not ongoing provider monitoring.
4. Worker interrupted-running expiry is checked on initialization; an unexpired interrupted claim may require another restart after its deadline. No automatic retries. File intake bounds one scan to first 100 sorted JSON files; large historical inboxes need paging/archiving to avoid starvation beyond the first batch. These are real remaining durability limits, not complete enterprise queue claims.
5. Sync is explicit, not automatic on every action; current item/version ledger prevents repeated sync exports. Crash exactly between file write and ledger insert may leave an extra NEW snapshot (never overwrite). Full cross-process/crash-atomic export transaction not implemented.
6. Full original v1 browser suite has old labels and must be updated before rerunning; new followup browser suite covers modified vertical slice. No real user insight exports were available, so metrics validation is implemented but real-account analytics are not verified.

No git commits/pushes or public deployment were made. No social content was published.
