# SpendWise — Personal Finance Management

SpendWise is a full-stack expense and income tracker built with React, Vite, Express, and MongoDB. It includes JWT-based authentication, transaction management, monthly budgets, financial charts, CSV export, profile settings, and an owner-admin dashboard.

## Tech stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, Chart.js, lucide-react
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose (local JSON document storage is available for development only)
- **Authentication:** bcryptjs password hashing and JWT

## Requirements

- Node.js 22.12+ (Node.js 22 LTS recommended)
- npm
- MongoDB for production; a local JSON store can be used for local development

## Run locally

1. Install packages:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and update the values.

3. Start the app:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

The Express server hosts the Vite development middleware and the `/api` routes on the same port.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | Server port; defaults to `3000`. |
| `NODE_ENV` | No | Set to `production` for deployment. |
| `JWT_SECRET` | Production | Long, random secret used to sign JWTs. |
| `ADMIN_EMAIL` | Production | Email address that receives owner-admin access. |
| `MONGODB_URI` | Production | MongoDB connection string. |
| `SEED_DEMO_DATA` | No | Set to `true` only in development to create the sample account and sample transactions. |

### Optional demo data

For a local demo only, set `SEED_DEMO_DATA=true` and restart the server. The app creates a sample account:

- Email: `alex@spendwise.app`
- Password: `SpendWise2026!`

Do not enable demo seeding in production. Change or remove sample credentials before sharing a public demo.

## Production build

```bash
npm run build
npm start
```

Production requires `MONGODB_URI`, `JWT_SECRET`, and `ADMIN_EMAIL`. The server intentionally refuses to start without these settings and never falls back to the local JSON store in production.

## Main API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `GET|POST /api/transactions`
- `PUT|DELETE /api/transactions/:id`
- `GET /api/transactions/export/csv`
- `GET|PUT /api/budgets`
- `DELETE /api/budgets/:id`
- `GET /api/admin/overview`
- `PATCH /api/admin/users/:id/status`
- `DELETE /api/admin/users/:id`

All transaction, budget, and admin endpoints require a valid bearer token; admin routes additionally require the configured owner-admin account.

## Project structure

```text
server.js
server/
  db/
  middleware/
  models/
  routes/
src/
  components/
  context/
  services/
  utils/
  types/
```

## Notes

- User passwords are stored as bcrypt hashes.
- Each transaction and budget operation is scoped to the authenticated user's ID.
- The local JSON store is intended only for development and is not suitable for concurrent production traffic.
- CSV exports neutralize spreadsheet formula prefixes in user-controlled values.
