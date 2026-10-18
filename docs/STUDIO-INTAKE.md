# Content Studio inbox protocol v1

Published-only Obsidian policy: Content Studio SQLite is canonical for drafts, versions, approvals and owner-confirmed publication records. Genuinely new LinkedIn drafts go to the validated inbox/dashboard, not Obsidian. Planning/feedback stays in Bot Chat or bounded dated local workspace notes. Only the dashboard exports a frozen final version after Adib confirms real publication URL, time and version. Never export drafts, rejected ideas, routine reports or plans into the vault. Existing notes are not deleted. No publishing, profile changes, paid APIs or extra schedules.

Inbox: D:/Hermes/profiles/social-manager/workspace/studio-inbox
SQLite source of truth: D:/personal/projects/adib-content-studio/data/studio.sqlite

After producing genuinely NEW drafts, create one NEW unique dated .json pack in the inbox. Use write_file with exclusive/new file semantics; write .pending first and rename to .json when complete if using a script. No tokens, credentials, private identifiers, invented expertise or invented engagement. Never re-emit existing drafts with new IDs. Use stable externalId per deliverable and stable ideaId per underlying idea across runs/platforms. Keep IDs in the dated report for continuity. A revision of an existing item goes through dashboard review/revise, not a new intake identity.

Before proposing a previously covered idea, read app state read-only using this fixed command from app root:
    node scripts/intake-status.ts
It returns existing title/platform/ideaId/externalId/stage and tiny rejected/deleted ID tombstones (no deleted body, title or history). Only Adib may confirm rejection/deletion in the dashboard; the bot must not delete records. Deleted ideas cannot be reopened; retain stable IDs to avoid resurrection. Rejected/Dropped ideas must not be regenerated under new IDs. Do not read credential files or edit DB. If app/DB unavailable, reuse known IDs from prior routine continuity/report and explicitly flag inability to check rejection state; do not invent replacement IDs for old topics.

Exact JSON object (all content fields shown are required except ideaId, which this workflow MUST supply for rejection dedupe):
{
  "schemaVersion": 1,
  "items": [{
    "externalId": "stable-deliverable-id",
    "ideaId": "stable-idea-id",
    "title": "New draft title",
    "platform": "linkedin",
    "format": "text",
    "body": "Actual newly drafted content; DRAFT not approved",
    "source": "Exact source artifact path and factual caveats",
    "owner": "Adib",
    "account": "Exact known account URL or empty string",
    "media": "Reference and rights/availability caveat, or empty string",
    "audience": "Proposed audience, not approved",
    "plannedAt": ""
  }]
}

The application schema supports platform: linkedin | instagram | tiktok; the social-manager bot's active authorized output is LinkedIn ONLY. Do not touch existing Instagram/TikTok content. format: text | video. owner: Adib | Hermes. Do not include stage, approvals, metrics or commands. plannedAt may be empty or timezone-bearing ISO, e.g. YYYY-MM-DDTHH:mm:00+08:00; proposed time is NOT platform-scheduled. Max 100 items, 1.5 MB pack, source/body each <=100000 chars, IDs <=128 chars using letters/digits/_.:- with alphanumeric first. Full schema: D:/personal/projects/adib-content-studio/intake.schema.json.

The app validates the entire pack atomically, preserves human-edited/approved records, skips duplicate externalId and blocked ideaId, records source filename/hash, quarantines malformed packs and rescans on startup/while dashboard is open. Source pack is never permission to publish. Do not say dashboard import succeeded without checking receipt; receipt can be pending while app is closed.

Weekly planning: emit only genuinely new drafts created this run. Weekly feedback: do NOT convert feedback into unsolicited draft spam. Emit a pack only if a new draft was explicitly needed and actually created; otherwise report 'no new draft pack'. Preserve schedules, Bot Chat delivery, skills and continuity. The former instruction to write drafts/reports/plans to Obsidian is superseded. Sources point to actual learning/research artifacts or the emitted technical inbox file, never invented vault drafts. The bot never creates publication confirmations; only Adib does so in the dashboard after actual posting.
