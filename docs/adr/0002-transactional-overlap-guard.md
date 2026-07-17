# No-overlap enforced by a transaction with a per-interviewer guard

## Status

accepted

## Context

Interviews are a separate collection with arbitrary time windows (ADR-0001), so
the no-overlap invariant cannot be a single-document atomic update or a plain
unique index. It must be enforced across documents under concurrency.

MongoDB transactions provide snapshot isolation, which does **not** prevent write
skew: two concurrent bookings for the same interviewer can both read "no
overlap," insert two *different* interview documents, and both commit — because
neither touches a shared document, MongoDB's write-conflict detection never
fires. A transaction wrapped naively around check-then-insert is therefore
silently broken under load.

## Decision

Enforce the invariant with a transaction plus an explicit per-interviewer
serialization guard:

1. `findOneAndUpdate` **both** the interviewer and the candidate documents with
   `$inc: { bookingSeq: 1 }` — forcing every concurrent booking touching either
   party to write a shared document, so a real `WriteConflict` is raised and one
   transaction aborts. (Also validates both exist.)
2. Query `interviews` for a non-cancelled interview overlapping `[start, end)`
   for this interviewer **or** this candidate.
3. If found, abort and return `409 Conflict`: an interviewer conflict names the
   conflicting candidate; a candidate conflict names the interviewer they are
   already booked with.
4. Otherwise insert the interview and commit.
5. Retry the whole transaction (bounded) on `WriteConflict` /
   `TransientTransactionError`; the retry observes the committed rival and
   returns `409`.

## Consequences

- Requires a MongoDB replica set (transactions are unavailable on standalone
  mongod). Locally this is a single-node replica set in Docker; in production,
  Atlas or a managed replica set.
- Bookings for the *same* interviewer are serialized; bookings for *different*
  interviewers run fully concurrently.
- A compound index on `interviews` (interviewer + status + start) keeps the
  overlap query fast.

## Considered alternatives

- **Redis distributed lock** — correct and transaction-free, but adds a second
  source of truth for correctness and a Redis dependency.
- **In-process per-interviewer mutex** — only correct with a single app
  instance; breaks under horizontal scaling.
