# UI/UX Specification

## Status and visual foundation

This specification combines implemented styling and routes in `qr-menu` with proposed MVP screens. The existing app uses React Router, Tailwind utility classes, a stone/amber palette, DM Sans body text, and Playfair Display headings. Layouts use centered max-width sections and responsive Tailwind breakpoints. Preserve that visual language unless design review approves a change.

Existing routes include `/`, `/auth/:mode` (vendor registration/login), `/admin` (global administrator dashboard), `/vendors`, `/menu/:restaurantSlug`, `/vendor/:vendorSlug`, and `/vendor/:vendorSlug/menu/:date`. The permanent public menu route is `/menu/:restaurantSlug`; it currently resolves the current day's menu, not a publication revision.

## Design principles

- Customer-first: menu content is readable immediately, without login, interstitials, or admin navigation.
- Admin clarity: make date, draft/published state, selected count, and unsaved changes visible.
- Safe actions: distinguish draft save from publish; confirm destructive catalogue operations and unpublishing.
- Responsive by default: controls work with touch, keyboard, and narrow screens.
- Honest feedback: show loading, empty, retryable error, and save/publish status.
- Preserve familiar existing warm stone/amber visual style, typography, rounded cards, and high-contrast primary actions.

## Customer-facing menu

**Proposed layout**

1. Compact restaurant header with name/brand; current date and menu status.
2. Optional category navigation or filter chips, followed by category-grouped menu sections.
3. Item cards/rows with name, description, price, and optional approved dietary/allergen markers.
4. Clear unavailable status or omit unavailable items; MVP recommendation is to omit them from public view.

On phones, use a single column with readable spacing and no horizontal scrolling. On larger screens, keep a narrow readable content column. Do not expose admin controls or draft data. The `/menu/:restaurantSlug` page fetches today's available selection and renders the restaurant name and menu; public menu reads remain date-based (UTC), not publication-state based.

## Admin dashboard

**Proposed layout**

- Header: restaurant identity, current user, account/logout action.
- Navigation: Dashboard, Daily menus, Catalogue, Categories, QR code.
- Summary cards may show today's publication status and shortcuts; exact metrics are TBD.
- Each section has clear loading/error/empty states and keeps restaurant scope visible.

Existing `/vendor/:vendorSlug` is the dashboard-like route. It requires the authenticated session for the vendor owner or global admin. Vendors register/login through the auth screens; admin vendor management is available after the admin logs in.

## Daily menu editor

### Desktop layout

- Top bar: page title, restaurant, date selector, and Draft/Published badge.
- Toolbar: search field, category filter chips/select, result count, Add new item.
- Main area: catalogue rows/cards with selection checkbox, item name/category/description, edit action, and active/deactivated state.
- Selected-menu area: selected count and ordered list with drag handles or explicit move up/down controls; each selected item exposes daily price, availability, and remove-from-day action.
- Sticky or clearly grouped footer: Save draft, Publish (or Update published menu), and optional preview.

### Mobile layout

- Stack date and state first; keep search full-width.
- Use horizontally scrollable category filters only if keyboard/touch access remains clear; otherwise use a filter button and sheet.
- Make each row's selection control and name easy to tap. Put less frequent edit/delete controls in an overflow menu.
- Keep selected items reachable in a collapsible summary or separate tab. Keep Save draft and Publish visible without hiding content or keyboard focus.

### Required interactions

1. **Date selector:** defaults to the restaurant's local current date (timezone TBD). Changing date loads that date's draft/published revision and warns before losing unsaved changes.
2. **Item list views:** All items shows the active catalogue. Previously used shows active catalogue items present in any saved daily menu, regardless of date; it is not limited to yesterday. The vendor checks items individually for the selected date, and choosing a view must not alter current selections.
3. **Search:** matches item name and, optionally, description; case-insensitive. Empty search restores full filtered catalogue.
4. **Category filters:** support one or more categories plus an All option; search and category filters compose.
5. **Checkbox selection:** selection means inclusion in the daily menu. It is not the same as the daily availability toggle. Toggling off removes only the daily association; catalogue item remains.
6. **Selected summary:** shows selected count and ordered entries, daily price, availability, and remove action.
7. **Add new item:** opens the creation form. On success, make the new catalogue item available for selection; do not silently publish.
8. **Edit item:** opens an edit form. Warn that catalogue changes must not rewrite a historical published snapshot.
9. **Delete/deactivate:** prefer deactivation for catalogue items. Explain any impact on future selection and existing daily menus; never cascade-delete historical daily data.
10. **Display ordering:** reorder selected entries; persist a stable integer order and render the public menu in that order.
11. **Availability:** toggles whether a selected item is currently shown to customers. It does not remove selection or catalogue record.
12. **Save draft:** validates and persists a draft without changing the current customer-facing published menu. Show saving, success, and retryable failure.
13. **Publish:** show a review/confirmation step, validate at least one publishable item (rule TBD), then atomically switch the public menu to this revision. Display publish timestamp/state.
14. **Unpublish:** confirm the public effect and show the defined fallback (no menu or prior published revision; decision TBD).

## Menu item creation form

Fields: required name; description; category selection (plus manage-category route/action); active status defaults on; optional image, dietary/allergen fields are future scope/TBD. Daily price belongs in the daily selection editor, not permanent catalogue data.

Validate required text and reasonable length at client and server. Show field-level messages and retain valid input after an API error. Submit is disabled while saving.

## Menu item editing form

Prepopulate existing fields. Preserve ID/vendor association. Allow name, description, category, and active state edits; do not edit the historical daily price from this form. If a published snapshot is affected, preserve the snapshot. Confirm deactivation; avoid hard deletion by default.

## Category management

Proposed admin list/create/rename/deactivate flow. A category cannot be removed in a way that strands items; require reassignment or retain a historical label. Whether categories are restaurant-scoped, ordered, or globally shared is TBD. Existing backend stores category as a string and has no category CRUD API.

## QR code management

Show the restaurant's permanent public URL and generated QR preview. QR contents must not include a date or admin token. The frontend QR component renders a 240px data URL and has a generation-error state; copy/download/print actions and production canonical-domain configuration remain outstanding.

## Loading, error, and empty states

| State | Expected behavior |
|---|---|
| Initial menu fetch | Skeleton or concise “Loading menu…” state; avoid showing stale draft as current public menu. |
| Admin catalogue/date loading | Preserve route context, show progress, disable conflicting actions. |
| Save/publish | Button-specific progress text; prevent duplicate submission; announce success. |
| Network/API error | Human-readable message, retry action, preserve unsaved form state where possible. Do not silently convert errors into an empty vendor list. |
| No catalogue items | Explain that catalogue is empty and offer Add new item. |
| Search/filter no results | Explain no matches and offer clearing filters. |
| No draft/menu for date | Show a clear empty editor with option to start a draft; customer sees a distinct no-published-menu state. |
| QR generation error | Existing component shows a message; offer retry where possible. |
| 404 route/resource | Existing NotFound page; use the same accessible recovery link pattern. |

## Accessibility and interaction

Use semantic headings, form labels, native date/checkbox controls where suitable, visible focus rings, adequate contrast, keyboard-accessible dialogs, and announced async feedback. Confirm focus handling for modal/sheet interactions and screen-reader status announcements during implementation.
