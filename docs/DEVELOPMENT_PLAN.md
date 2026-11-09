# Development Plan

The phases below remain an implementation roadmap. Vendor self-registration, single-admin bootstrap/login, role-scoped menu access, and daily selection save are now implemented foundations; publication/revision, snapshots, catalogue editing/deactivation UI, categories, migrations, and production hardening remain outstanding. Dependencies refer to prerequisite decisions/work, not merely list order.

## Phase 1: Project analysis and documentation

- **Tasks:** Confirm repositories and ownership; inventory frontend/backend, database and tests; resolve scope and architecture decisions; keep implementation facts separate from proposals.
- **Dependencies:** None.
- **Acceptance criteria:** Product, UI/UX, architecture, database, API and plan docs agree; TBD decisions remain explicit; AI instructions match the approved stack and scope.
- **Testing requirements:** Documentation consistency review; verify referenced paths/contracts against source. No app test required for docs-only edits.
- **Status:** IN PROGRESS (initial documentation completed; operational ownership/deployment decisions remain).

## Phase 2: Database design and migrations

- **Tasks:** Confirm restaurant identity, timezone/currency, category ownership, draft/revision semantics, snapshot timing, retention, and whether a database-backed admin identity is needed for audit. Design and review PostgreSQL migration; backfill existing `vendor_id`/category/date data; add snapshots, ordering, daily menu lifecycle and constraints.
- **Dependencies:** Phase 1 decisions; backup/restore plan and migration tool selection.
- **Acceptance criteria:** Versioned migration upgrades existing records safely; daily rows preserve historical name and price; item reuse works; removing a daily selection retains catalogue data; constraints enforce uniqueness and ownership.
- **Testing requirements:** Migration up/down or rollback strategy, PostgreSQL integration tests, data reconciliation, constraint and historical snapshot tests.
- **Status:** IN PROGRESS (account/session tables are added through `create_all`; versioned migrations and daily snapshot schema remain).

## Phase 3: FastAPI backend implementation

- **Tasks:** Align API ownership/base path; extend the implemented vendor/admin authentication and restaurant scoping with catalogue CRUD/deactivation, category operations, draft save, publication/unpublication, stable public menu lookup, validation, ordering, and consistent errors. Replace hard delete and UTC-only public selection as required.
- **Dependencies:** Phase 2 schema; auth, lifecycle, timezone and API contract decisions.
- **Acceptance criteria:** Public route returns only the intended published menu; write routes require authorized admin; draft operations do not alter public menu; publication is atomic; daily snapshots are immutable; the frontend contract is documented/OpenAPI verified.
- **Testing requirements:** FastAPI unit/contract tests, PostgreSQL integration tests, single-admin authentication and restaurant-scope tests as applicable, concurrent publish/draft and validation/error tests.
- **Status:** IN PROGRESS (vendor registration, admin login, ownership checks, catalogue and dated selection APIs exist; publish lifecycle and production hardening remain).

## Phase 4: Admin UI implementation

- **Tasks:** Complete the implemented auth flow/dashboard and date-specific editor; add search, category filters, selected summary, edit/deactivate forms, ordering, draft save, publish/unpublish confirmation and feedback.
- **Dependencies:** Phase 3 stable auth and draft/admin API contracts.
- **Acceptance criteria:** The single admin can safely compose and save a dated draft, edit catalogue entries, and publish only to the restaurant(s) in scope; unsaved changes and async errors are handled accessibly.
- **Testing requirements:** Component/interaction, form validation, keyboard/mobile layout, API error-state and admin authorization integration tests.
- **Status:** IN PROGRESS (registration/login, admin listing, daily item selection/save, and previously-used item lookup are implemented; search/category filters, catalogue editing, drafts, and publication remain).

## Phase 5: Customer menu implementation

- **Tasks:** Resolve stable QR route to the current published menu; render restaurant identity, date, categories, ordered items, snapshots and available prices; implement no-publication/error states; remove public admin links.
- **Dependencies:** Phase 3 public endpoint/response contract and agreed permanent route.
- **Acceptance criteria:** Anonymous scan of a permanent QR URL shows latest published menu; a later publication updates the same URL; no draft/unavailable items leak.
- **Testing requirements:** Public route/API contract, no-menu/unavailable/error cases, responsive and accessibility checks, verify stable URL behavior.
- **Status:** IN PROGRESS (permanent vendor menu URLs and public menu read are wired; published-menu lifecycle and timezone behavior remain).

## Phase 6: QR code functionality

- **Tasks:** Define permanent URL format; provide admin preview and copy/download/print; ensure encoded destination is canonical and independent of date/session; handle environment-specific domains without embedding secrets.
- **Dependencies:** Phase 5 route and domain/deployment URL decision.
- **Acceptance criteria:** Generated QR scans to the correct permanent public route and remains valid across daily publications.
- **Testing requirements:** QR output generation, decode/route validation, print-resolution and domain/configuration tests.
- **Status:** IN PROGRESS (QR preview is available to admin and vendors; printing/download and production URL configuration remain).

## Phase 7: Testing and validation

- **Tasks:** Select frontend and backend test tooling; add component, API, DB, migration, auth, end-to-end and accessibility coverage; define CI and quality gates; test data migration and recovery.
- **Dependencies:** Feature work from Phases 2–6; test toolchain/CI decision.
- **Acceptance criteria:** Agreed automated checks pass; release-critical user journeys and authorization boundaries are covered; regressions and known limitations documented.
- **Testing requirements:** Run focused tests plus full CI suite, production frontend build, migration verification on representative PostgreSQL data, and end-to-end scan/edit/save/publish flow.
- **Status:** IN PROGRESS (frontend build and focused SQLite-backed account/menu API tests pass; PostgreSQL/migration/end-to-end coverage remains).

## Phase 8: Deployment

- **Tasks:** Choose frontend/backend/database hosting; configure domains, TLS, environment/secrets, explicit CORS, database migrations, monitoring, backups/restore, rollback, and operational runbook.
- **Dependencies:** Phases 2–7 complete; hosting, security, and availability decisions approved.
- **Acceptance criteria:** Production deployment serves SPA and API securely, migrations are controlled, QR route works from a real camera, backups are restorable, and monitoring/rollback are verified.
- **Testing requirements:** Deployment smoke tests, CORS/auth checks, migration/rollback rehearsal, backup restore test, QR scan and mobile validation.
- **Status:** NOT STARTED.

## Cross-phase decisions to resolve

1. Which repository owns and deploys the current FastAPI/PostgreSQL backend?
2. Is the single admin allowed to manage every registered vendor? Current implementation grants this global access.
3. Are daily menus one mutable record per date or immutable revisions?
4. At which point are snapshots frozen, and can published menus be edited?
5. What timezone/currency, category lifecycle, inventory/stock, and unpublished fallback apply?
6. Which API prefix and URL versioning policy will be canonical?
7. Which migration, test, CI, hosting, backup, and observability tools are approved?
