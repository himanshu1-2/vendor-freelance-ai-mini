# QR Menu Frontend

## Scope

This is a local, frontend-only QR restaurant menu project. Keep it simple and runnable with Vite.

Do not add a backend, FastAPI service, database, authentication, admin dashboard, ordering, payment, AI, MCP, RAG, or external API integrations.

## Development

- Install dependencies with `npm install`.
- Start the local app with `npm run dev`.
- Run the production checks with `npm run build`.
- Keep components small, typed, and focused.
- Keep data, route composition, and reusable UI concerns separate.

## Structure

- `src/components/common`: reusable UI primitives.
- `src/components/layout`: shared page framing components.
- `src/components/menu`: future menu-specific components.
- `src/data`: local mock data during the frontend-only phase.
- `src/hooks`: reusable React hooks.
- `src/lib`: framework-agnostic helpers.
- `src/pages`: route-level screens.
- `src/types`: shared domain types.
