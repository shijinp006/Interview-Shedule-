# Micro-ATS — The Smart Interview Scheduler

A single-page React dashboard over a Node/Express/MongoDB API for assigning
candidates to interviewers in specific time windows. It **guarantees** an
interviewer (or candidate) is never double-booked — overlapping bookings are
rejected with `409 Conflict` naming the person already booked — and stores all
times in **UTC** while rendering them in the **viewer's local timezone**.

The domain model lives in [`CONTEXT.md`](./CONTEXT.md); the load-bearing
decisions are in [`docs/adr/`](./docs/adr/).

## Stack

- **Monorepo:** pnpm workspaces — `apps/api`, `apps/web`, `packages/shared`.
- **Shared contract:** `packages/shared` holds the Zod schemas + inferred types
  used by **both** the server (validation) and the client (types) — one contract,
  no drift.
- **Backend:** Express 5 + Mongoose + Zod + pino; better-auth (email/password).
- **Frontend:** Vite + React 19 + TypeScript, shadcn/ui + Tailwind v4,
  TanStack Query + Router, date-fns + date-fns-tz, and a vendored
  [Origin UI event-calendar](https://github.com/origin-space/event-calendar).

## Prerequisites

- Node ≥ 20, pnpm, and Docker (for MongoDB).

## Run it

```bash
# 1. Start MongoDB (single-node replica set — required for transactions)
docker compose up -d          # or: pnpm mongo:up

# 2. Install deps
pnpm install

# 3. Seed demo data (a recruiter login, interviewers across timezones, candidates)
pnpm seed

# 4. Start API (:4000) and web (:5200) together
pnpm dev
```

Open **http://localhost:5200** and sign in with the seeded recruiter:

```
email:    recruiter@micro-ats.test
password: password123
```

### Ports

| Service | Port |
|---|---|
| Web (Vite) | 5200 |
| API (Express) | 4000 |
| MongoDB | 27017 |

## The anti-AI twist: concurrency-safe conflict detection

Wrapping a check-then-insert in a MongoDB transaction is **not** enough —
snapshot isolation permits *write skew*, so two concurrent bookings can both read
"no overlap" and both commit. The fix (see
[ADR-0002](./docs/adr/0002-transactional-overlap-guard.md)) bumps a `bookingSeq`
on **both** the interviewer and candidate documents inside the transaction,
forcing concurrent bookings to collide on a shared document; `withTransaction`
auto-retries the loser, which then sees the winner's interview and returns `409`.

Prove it — fire many simultaneous identical bookings and exactly one wins:

```bash
# after signing in and grabbing a cookie, POST /api/schedule N times in parallel
# → exactly one 201, the rest 409, and one row in the DB.
```

## Timezones

The API stores/returns UTC (ISO-8601; naive timestamps are rejected). The
frontend renders every time in the viewer's browser timezone, and validates
bookings against each interviewer's **working hours** defined in *their* IANA
timezone (see [ADR-0003](./docs/adr/0003-calendar-and-timezone-architecture.md)).

## API

All under `/api`, JSON, session-cookie auth (except `/api/auth/*` and health).

- `POST /api/schedule` — book `{ candidateId, interviewerId, start, end }` → `201` | `409` | `400`
- `GET /api/interviews?interviewerId&from&to` — calendar feed
- `PATCH /api/interviews/:id/reschedule` · `/cancel` · `/complete` · `DELETE`
- `GET/POST /api/interviewers`, `GET/PATCH/DELETE /api/interviewers/:id`
- `GET/POST /api/candidates`, `PATCH /api/candidates/:id` (the stage toggle)
- `GET /health`, `GET /ready`

## Troubleshooting

- **Mongo container crash-loops with "Linux kernel … known incompatibility"**:
  MongoDB 8.x + kernel ≥ 6.19 (Docker Desktop / OrbStack) hit a TCMalloc/rseq
  bug (SERVER-121912). The compose file already sets
  `GLIBC_TUNABLES=glibc.pthread.rseq=1` to work around it.

## Tests

No automated tests in this iteration (the conflict logic is isolated in a pure,
test-ready service — `apps/api/src/services/overlap.ts` — so unit/integration
tests drop in without refactoring).
