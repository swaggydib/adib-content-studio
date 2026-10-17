# UI refinement: an operating workspace, not a Notion clone

Scope approved: keep SQLite/local content and existing social-manager integration. No Supabase provisioning or cloud migration this pass. No new dependency is needed for theme support or a data table.

Keep the existing ink/cobalt identity. Make light mode quieter and dark mode a complete slate/navy workspace rather than black plus neon. Memorable element: a sharply structured content database with readable properties and a contextual editor. Not a marketing hero or KPI wall. No synthetic analytics.

Semantic tokens before implementation:
- Light: canvas #f5f7fa; paper #ffffff; text #24334b; muted #596b83; line #dce3ed; accent #2858cb; sidebar #1b2c45.
- Dark: canvas #10151f; paper #192230; text #e3eaf4; muted #a0afc4; line #344257; accent #8cabff; sidebar #111b2a.
- Light/dark use separate semantic success/warning/error surfaces and text. Every native input/select/textarea uses matching color-scheme. Never apply a blanket filter/invert hack.
- Typography: local Segoe UI/system stack, 32px workspace title, 14px body, 12px useful metadata. Most work is left aligned. Focus rings remain explicit. No theme-change animation beyond user-triggered subtle hover; honor reduced motion.

Workspace: rail | breadcrumb + quick find + appearance | compact title/actions | board/table views + filters | content. Table exposes actual title, platform, state, owner, version and local plan, with sorting. Quick find searches saved content and guards dirty navigation. Theme preference persists locally, can follow system, and applies before hydration to avoid a light flash. Responsive rail remains readable; data table scrolls inside its own region at narrow widths.

Review against brief: do not replace intentional workflow with a generic Notion copy. Keep review/version/publishing boundary visible. UI-only changes must not alter original database documents or approvals.
