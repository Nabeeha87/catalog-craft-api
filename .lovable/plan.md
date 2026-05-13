
## Goal

Deliver the Product Catalog Management API in two parallel implementations:

1. **`/backend`** — a standalone Node.js + Express + MongoDB project (the spec you gave), as downloadable source you run locally.
2. **Lovable Cloud version** — same endpoints and behavior, implemented with TanStack Start server routes + Postgres, so it works inside this preview without any local setup.

Both expose the same REST contract.

---

## Part 1 — Standalone Express + MongoDB project (`/backend`)

Files created (not wired into the Vite app — pure reference source):

```text
backend/
├── server.js                  # entry point: express app, cors, json, routes, error handler
├── package.json               # express, mongoose, dotenv, cors
├── .env.example               # MONGO_URI=, PORT=5000
├── .gitignore                 # node_modules, .env
├── README.md                  # setup + run + API examples (curl)
├── config/
│   └── db.js                  # mongoose.connect with retry + clear logs
├── models/
│   └── Product.js             # schema: name, category, price, description, createdAt + indexes
├── routes/
│   └── products.js            # router for /api/products and /api/products/:id
├── controllers/
│   └── productController.js   # CRUD + search/filter/pagination logic
└── middleware/
    ├── validate.js            # zod-based body validation
    └── errorHandler.js        # central error handler (404, validation, cast, server)
```

### Schema (`models/Product.js`)
- `name` (String, required, trim, indexed)
- `category` (String, required, trim, indexed)
- `price` (Number, required, min 0)
- `description` (String, default '')
- `createdAt` (Date, default Date.now)
- Compound index on `{ category: 1, createdAt: -1 }` for fast filter+sort
- Text index on `name` for case-insensitive search

### Endpoints
- `GET /api/products` — query params: `search`, `category`, `page` (default 1), `limit` (default 10, max 100). Returns `{ data, page, limit, total, totalPages }`. Uses `.lean()` + projection for query optimization.
- `POST /api/products` — validates body, creates product
- `PUT /api/products/:id` — validates ObjectId, partial update with `{ new: true, runValidators: true }`
- `DELETE /api/products/:id` — validates ObjectId, returns deleted doc

### Error handling
- 400 for validation/cast errors
- 404 for missing IDs and unknown routes
- 500 fallback with safe message (stack only in dev)

### README
- Prerequisites (Node 18+, MongoDB local or Atlas)
- `cp .env.example .env` and fill `MONGO_URI`
- `npm install && npm run dev` (nodemon) or `npm start`
- curl examples for each endpoint

---

## Part 2 — Lovable Cloud equivalent (live in preview)

Enable Lovable Cloud, then build the same API using TanStack Start server routes against Postgres.

### Database
Migration creating `products` table:
- `id` uuid pk, `name` text not null, `category` text not null, `price` numeric not null check (price >= 0), `description` text default '', `created_at` timestamptz default now()
- Indexes: `(category, created_at desc)`, trigram or `lower(name)` index for case-insensitive search
- RLS enabled with public read + public write policies (catalog is public for the demo; can be tightened later)

### Routes (`src/routes/api/products*`)
- `src/routes/api/products.ts` — `GET` (list with search/filter/pagination) and `POST` (create)
- `src/routes/api/products.$id.ts` — `PUT` (update) and `DELETE`
- All handlers use Zod validation, return JSON, set proper status codes, use `supabaseAdmin` for queries.

### Minimal demo UI
A simple admin page at `/` that lists products and lets you create/edit/delete — purely so you can verify the API works in preview. (You asked for backend only; this is a thin verification surface, not a full UI build.)

---

## Deliverables checklist
- [ ] `/backend` folder with full Express/Mongoose source + README
- [ ] Lovable Cloud enabled + `products` table migration
- [ ] `src/routes/api/products.ts` and `src/routes/api/products.$id.ts`
- [ ] Tiny verification page at `/`
- [ ] Both versions documented in the chat reply with example requests

---

## Notes / trade-offs
- The `/backend` project will not run inside the Lovable preview — Cloudflare Workers can't host Express/Mongo. You download/copy it out to run locally.
- The Lovable Cloud version uses Postgres, not MongoDB, but exposes the identical REST contract, so any client code works against either.
