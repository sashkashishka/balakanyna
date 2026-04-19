# Balakanyna — Architecture Overview

## Structure
Monorepo with three apps and a shared package:
- **`server/`** — Node.js HTTP server (custom framework, no Express)
- **`admin/`** — React admin SPA (Vite + Ant Design)
- **`client/`** — React client SPA (Vite, task/game player)
- **`shared/`** — Shared TypeScript types and AJV JSON schemas

## Server

**Custom framework** (`server/src/core/`):
- `Server` — HTTP server, wires up AJV, router, DB
- `Composer` — middleware composer with routing primitives (`get`, `post`, `put`, `patch`, `delete`, `use`, `matchRoute`, `matchMethod`)
- `Context` — request/response context with JWT, cookies, hashing
- `Router` — error handling and request dispatch

**Entry points:** `server/src/index.js` → `server/src/server.js` (`createServer`, `getRouter`)

**Middleware tree** (`server/src/middleware/index.js`):
- Auth: login, logout, registration, JWT verification
- Admin API: CRUD for users, tasks, programs, images, labels + link/unlink operations
- Client API: task/program retrieval
- Auxiliary: rate limiting, body parsing, static files, error handling, logging

**DB:** Drizzle ORM with SQLite, seeders, and post-migration scripts (`server/src/db/`)

## Admin SPA

React app for content management.

**Routes:** Login, Registration, Home, Task/List, Image/List, Label/List, Program/List, User/List, User/View (Info, Tasks, Programs tabs)

**Stores** (signals-based): auth, task, image, label, program, user, router, link — all with list/filter/pagination

**Components:** Tables and Drawers (Create/Update) for each entity; task-type-specific config forms (8 task types)

## Client SPA

Task player for end users. Loads programs and renders tasks.

**Routes:** Home, Program (task list + individual task), NotFound

**Task types (8):** SchulteTable, FindFlashingNumber, GoneAndFound, SemaphoreText, Brainbox, ImageSlider, LettersToSyllable, IframeViewer

Each task has its own screens (Start/Game/Finish), stores, and game logic.

## Shared

- **`shared/types/`** — TypeScript types for all entities
- **`shared/schemas/`** — AJV JSON schemas for each task config type (validated on server and client)

## Key Patterns

- Server uses a **custom middleware composer** (not Express/Fastify)
- State management uses **signals** (not Redux/Zustand)
- Task configs are **schema-validated end-to-end** via shared AJV schemas
- Extensive **integration test suite** per endpoint (`server/src/test/middleware/`)
- Deploy via **Docker** with shell scripts in `.deploy/scripts/`
