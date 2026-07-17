# Interviews are a separate collection, not embedded in Candidate

## Status

accepted

## Context

The project brief says "a Candidate can have multiple InterviewSlots, linked to
an Interviewer ID," which reads as embedding interviews inside the Candidate
document. We are deliberately not doing that.

The system's hottest read is the conflict check — "all non-cancelled interviews
for **interviewer** X that overlap `[start, end)`" — and its primary view is a
single interviewer's calendar. Both are interviewer-centric. Embedding interviews
under the Candidate would turn the conflict check into a scan across every
candidate document, and embedding under the Interviewer would create an unbounded
array (hundreds of interviews/day → tens of thousands over months) that degrades
and risks the 16 MB document limit.

## Decision

Store interviews in their own `interviews` collection. Each document references
`candidateId` and `interviewerId` and holds the UTC `start`/`end` and lifecycle
`status`. "A Candidate has many interviews" is modeled by reference (query
`interviews` by `candidateId`), which honors the spec's intent without embedding.
`Candidate` and `Interviewer` are their own collections.

## Consequences

- The no-overlap invariant can no longer be enforced by a single-document atomic
  update; it needs a transactional guard (see ADR-0002).
- A compound index on `interviews` keyed by interviewer + time serves the
  conflict query and the calendar view.
