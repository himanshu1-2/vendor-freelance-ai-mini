# Instructions for AI Coding Agents

## Before making changes

- Inspect the relevant code and current repository state before editing.
- Read the applicable documents in [`docs/`](./docs/), then inspect the corresponding implementation.
- Treat the `qr-menu` frontend and the separate `fastapi-projects` backend as the selected system. The backend source currently lives outside this frontend directory; do not assume both are one repository.
- Never invent environment variables, API contracts, database structures, or behavior. Verify them in code or mark them TBD.

## Architecture and scope

- Preserve the existing React, TypeScript, Vite, Tailwind CSS, and React Router frontend choices.
- Preserve the selected FastAPI, SQLModel/SQLAlchemy async, and PostgreSQL backend choices.
- Do not introduce MongoDB, Neo4j, Express, duplicate libraries, or an alternate stack.
- Follow the approved scope and sequence in [`docs/DEVELOPMENT_PLAN.md`](./docs/DEVELOPMENT_PLAN.md). Do not implement functionality outside the approved plan.
- Do not modify unrelated functionality. Keep changes focused and consistent with existing conventions.
- Vendor self-registration and server-side session authentication are implemented; do not reintroduce the prototype shared access-code/localStorage gate.
- The product has one global administrator account, provisioned privately, and self-registering vendor accounts. Do not add additional admin accounts or roles unless explicitly approved.
- Separate the permanent menu catalogue from daily menu selections. Removing a selection must not delete its catalogue item. Preserve daily item name and price snapshots in the proposed persisted design.

## Implementation quality

- Use proper input validation, explicit errors, and repository-consistent error handling.
- Add or update tests for new behavior; run the narrowest applicable checks and report what was run.
- Do not weaken existing validation or access controls to make a feature appear to work.
- Update the relevant documentation when an approved architectural decision or API contract changes.
- Keep the requested project documentation consistent across files and distinguish implemented behavior from proposals and TBD decisions.
