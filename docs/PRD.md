# Product Requirements Document

## Document status and evidence

This document describes the existing `qr-menu` frontend together with the separately located `fastapi-projects` FastAPI/PostgreSQL backend selected for this product. Existing behavior is explicitly identified as **Implemented**. New product behavior is **Proposed** until it is delivered and verified. Decisions without evidence are **TBD**.

## Product overview

**Proposed product:** a mobile-first QR-based restaurant menu system. A permanent restaurant QR URL opens the latest published daily menu to customers without login. Authorized restaurant administrators manage a reusable item catalogue and compose, save, and publish date-specific menus.

**Current foundation:** the React app has customer, vendor, date-specific menu, vendor-list and QR routes. The separate FastAPI backend has SQLModel catalogue, daily-item, vendor, user, and session records in PostgreSQL, plus public vendor registration and server-side authentication. There is not yet a published-menu lifecycle or a connected production deployment contract. See [`ARCHITECTURE.md`](./ARCHITECTURE.md) and [`API_SPEC.md`](./API_SPEC.md).

## Business problem

Restaurants need a fast way to update what they offer each day without reprinting a permanent QR code. Customers need a current, readable menu without accounts or app installation. A reusable catalogue avoids repeated item entry; daily selections and price snapshots retain what was offered on prior dates.

## Product objectives

1. Keep one stable QR destination per restaurant while the displayed menu changes by publication.
2. Make the current published menu readable on phones without customer sign-in.
3. Let authorized admins select catalogue entries, maintain catalogue items, and manage dated drafts.
4. Preserve historical item name and price as displayed at publication time.
5. Prevent removal from a daily menu from deleting the permanent item.
6. Deliver these capabilities using the existing React, FastAPI, and PostgreSQL choices.

Success metrics and targets: **TBD** (e.g. menu load time, admin task completion, availability).

## Personas

### Customer

Restaurant guest using a phone camera or QR reader. Wants to quickly see today's available dishes, descriptions, categories, and prices. No account is required.

### Administrator

The product currently has one administrator responsible for the daily offering. The admin needs protected access, a reusable item catalogue, a date-specific editor, draft preservation, and an explicit publish action.

There is one global administrator account, as clarified by the product owner. Public registration is for vendors; admin account creation is a private backend CLI operation. Vendors own their restaurant account and menu. The administrator can view/manage all vendors.

## Customer journey

1. Customer scans the restaurant's permanent QR code.
2. The QR opens the restaurant's stable public URL.
3. The app resolves the restaurant and retrieves its latest published menu.
4. The customer browses available items, categories, descriptions, and historical-at-publication prices without logging in.
5. If no menu is published or the restaurant cannot be loaded, the app displays an understandable empty or error state and a retry path where appropriate.

**Current:** The public menu is available at a permanent vendor route and QR preview is available to the vendor/admin. The public endpoint currently serves available items for the current UTC date; a publish/unpublish lifecycle and restaurant-local timezone are not implemented.

## Admin journey

1. A vendor registers a restaurant account, or the single admin logs in using a privately provisioned account.
2. The vendor manages their own restaurant; the admin can select any registered vendor.
3. The user selects a menu date.
4. The user selects catalogue items and configures daily price and availability.
5. The user can add catalogue items; edit/deactivation UI remains incomplete.
6. The user saves the daily selection. Draft and explicit publication states are not implemented.
7. Customers scan the permanent vendor QR/menu URL; saving a date's items updates the public result for that current UTC date.

**Current:** Vendor registration/login and admin login are implemented with server-side sessions. The editor supports dated selection/save, availability, price/stock, and a view of active catalogue items used in any saved daily menu. Vendors select individual items for a date; they do not need to copy yesterday's menu. Search/category filters, ordering, catalogue edit/deactivate UI, draft persistence separate from public data, and publish actions remain incomplete.

## Functional requirements

| ID | Requirement | Status |
|---|---|---|
| FR-01 | A stable restaurant QR URL serves the current public menu without customer login. | Partial: stable public route exists; public data is date/availability based, not publication based |
| FR-02 | Vendors can register/login; the single admin authenticates and manages all vendor/menu data. | Implemented: vendor registration/login and private single-admin bootstrap; account recovery is not implemented |
| FR-03 | Vendor/admin chooses a menu date and sees that date's saved selections. | Partial: date selection exists; drafts/publication do not |
| FR-04 | Vendor/admin searches catalogue and filters by category. | Proposed |
| FR-05 | Vendor/admin adds/removes daily selections without deleting catalogue entries. | Implemented: dated replacement API and editor selection are distinct from availability |
| FR-06 | Vendor/admin creates, reads, edits, and deactivates catalogue items. | Partial: create/read and patch/deactivation API exist; edit/deactivate UI is absent; delete endpoint hard-deletes |
| FR-07 | Daily selections support display order, price, and availability. | Partial: price and availability exist; order is absent |
| FR-08 | Admin saves a draft independently from publishing it. | Proposed |
| FR-09 | Admin publishes and unpublishes a daily menu. | Proposed |
| FR-10 | Daily records preserve item name and price snapshots. | Proposed: existing daily record stores price, not name |
| FR-11 | Vendor data is scoped to its owner; the single admin can view/manage all vendors. | Implemented in API authorization; catalogue/daily rows still use string `vendor_id` without a vendor FK |
| FR-12 | Existing QR URL continues to work when daily selections are updated. | Partial: stable route exists; publication/revision semantics are not implemented |
| FR-13 | Vendor/admin can find and individually select catalogue items used in any saved daily menu, regardless of date. | Implemented through a previously-used item list; copying a whole prior day is not part of the editor workflow |

## Non-functional requirements

- Mobile-first responsive interface, keyboard operability, clear labels, and accessible status feedback.
- Customer menu reads are public; all write operations must be authorized on the server.
- Validate dates, IDs, non-negative prices/stock, ownership, and menu state at the API boundary and in persistence constraints where appropriate.
- Use PostgreSQL transactions for draft saves and publication state changes.
- Preserve auditable daily values; catalogue edits must not rewrite prior daily snapshots.
- Avoid exposing secrets; CORS must be configured for known deployed frontend origins, not inferred from local development.
- Define performance, availability, backup/retention, accessibility conformance, and observability targets: **TBD**.

## Business rules

1. Catalogue items and dated menu selections are different concepts.
2. A catalogue item may be selected on multiple dates.
3. Removing a selection deletes or retires only that daily association; it never deletes the catalogue item.
4. Deactivating a catalogue item prevents future selection; impact on existing drafts and published menus must be handled without rewriting historical snapshots.
5. Daily menu entries preserve the item name and price that applied when saved/published. Snapshot timing (save vs publish) is **TBD**; recommended: capture on save and freeze the published revision.
6. Only one published menu per restaurant/date is allowed. Whether multiple drafts/revisions are allowed is **TBD**.
7. Only available items in the current published menu appear to customers.
8. A QR code identifies a stable restaurant destination, not a date-specific URL.
9. Currency and timezone are restaurant-level configuration and are **TBD**. Existing frontend formats INR and derives dates using browser UTC ISO strings; this is not a confirmed business rule.

## Edge cases

- Restaurant or QR slug is unknown, inactive, or has no published menu.
- Menu has no selected items, or all selected items are unavailable.
- A selected catalogue item is deactivated while a draft is open.
- Duplicate daily selection; conflicting edit from another admin; retry after a network timeout.
- Invalid/nonexistent dates, timezone boundary around midnight, or menu requested for a future date.
- Publish with no items, or unpublish when a newer revision has already been published.
- Price/stock is blank, negative, malformed, or too precise for the currency.
- Database/API unavailable, malformed response, or stale cached customer page.
- Old QR link points to a changed route or wrong environment.

## MVP scope

- One global administrator account, provisioned privately; vendors self-register and manage their own restaurants.
- Catalogue CRUD with soft deactivation.
- Category management sufficient for item categorization.
- Date-specific draft menu with search, category filters, explicit selection, ordering, price, and availability.
- Draft save and explicit publish/unpublish.
- Public, no-login endpoint and customer menu route resolving the intended published menu from a permanent QR URL (publication lifecycle remains to be implemented).
- QR creation/printing for that stable URL.
- PostgreSQL migrations, server-side authentication/authorization, validation, and automated tests.

Out of scope for MVP: ordering, payment, inventory decrement/fulfillment, customer accounts, loyalty, analytics, multi-language unless separately approved. Availability semantics for `stock_count` require a decision.

## Future enhancements

Additional administrator accounts/roles, restaurant onboarding, scheduled publication, menu themes/locales, allergen and dietary metadata, QR download/print templates, analytics, inventory/order integrations, and restaurant branding. Prioritize only after MVP requirements and decisions are accepted.
