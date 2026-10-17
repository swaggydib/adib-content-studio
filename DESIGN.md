# Adib Content Studio: production desk

## Direction before implementation
The meaningful visual object is a platform-native draft moving through a human decision, not a KPI. A dark ink navigation rail anchors a pale slate operating desk. Cobalt marks actionable decisions; teal marks readiness, amber marks review. A large left-aligned workspace title is balanced by a compact local-state panel. The board groups production phases without pretending these groups replace exact workflow states.

Tokens: ink #192a43; slate canvas #f3f6fa; paper #ffffff; cobalt #265ad9; review amber #8a5a16; readiness teal #19665e. Body uses locally available Segoe UI, deliberately suited to this Windows workspace; titles use the same family with tighter tracking and a 38/44 scale. Metadata 12/18, body 14/22. Spacing 4/8/12/16/24/32; controls radius 6, content cards 10. No decorative gradients, fake images or synthetic metrics.

Layout: 220px left rail; top breadcrumb + local status; operating header; platform/search/status filters; four fluid board lanes. Detail is a focused full-page editor with preview and a decision sidebar, not a small modal. Narrow widths turn the rail into compact horizontal navigation and board lanes into a readable vertical stack. Focus rings and native fields preserve keyboard operation. Exact version, owner and audit trail live in detail. No drag-to-publish.

Critique: a generic dashboard would begin with three metrics and charts. Removed both; the summary is instead a task-specific decision strip with counts from SQLite. Cobalt is limited to actions and selection, so the identity is not another acid-on-black template. Do not use uppercase eyebrows or decorative numbered labels.

## References actually inspected
- shadcn/ui (MIT): https://github.com/shadcn-ui/ui ; inspected dashboard-01/page.tsx and ui/sidebar.tsx at https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/blocks/dashboard-01/page.tsx and https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/ui/sidebar.tsx . Useful separation of inset workspace, navigation, mobile state, focus-visible semantics. No code copied; no KPI/chart template reused.
- Plane (AGPL-3.0): https://github.com/makeplane/plane ; inspected README and actual official screenshot https://media.docs.plane.so/GitHub-readme/github-work-items.webp . Useful compact lane headers, title-first cards, small owner metadata. Visual workflow inspiration only, no code or branding copied. Initial guessed source URL returned 404 and is not claimed as inspected source.
- frontend-design skill: anthropics/skills, installed by preceding setup with SAFE/ALLOWED scan; pinned dbd4588f9e1033efb41dad4bef2f7947c8993d44. Loaded this session. Existing skill covers needed design gap; no redundant skill installs.
