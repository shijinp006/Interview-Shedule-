# Vendored Origin UI time-grid; product seam is InterviewCalendar

## Status

accepted

## Context

The calendar is the centerpiece and the timezone requirement (store UTC, render
in the viewer's local zone, validate working hours in the interviewer's zone) is
the headline feature. We surveyed the shadcn ecosystem: registry "calendars"
(ReUI, shadcnblocks, kibo-ui, shadcn's own) are date-pickers, not time-grids.
Among real week/day schedulers, most own their event state internally (a
context/reducer store) which fights our TanStack-Query-as-source-of-truth model,
and a few are legally unusable (no license / non-commercial). None have
first-class IANA timezone support.

## Decision

Vendor **Origin UI `event-calendar`** (MIT, copy-paste source) as a **private
time-grid adapter** under `components/event-calendar`. Strip its generic event
CRUD (`EventDialog`, client-side event store) so the adapter only speaks:

- `events` in (viewer-local wall-clock `Date`s)
- `onViewportChange` / `onSlotSelect` / `onEventSelect` / `onEventMove` out

The **product seam** is `InterviewCalendar` in `features/scheduling`:

- Owns viewport-driven Interview fetching, `TimezoneBridge`, Interview↔event
  mapping, DnD reschedule + conflict toasts, and schedule/actions dialogs.
- `CalendarPage` only selects an Interviewer.

Own timezone conversion **at the InterviewCalendar boundary**, not inside the
grid:

- The server stores and returns UTC.
- The feature converts UTC → viewer-local before handing events to the grid.
- Slot/move callbacks convert viewer-local `Date`s back to UTC ISO for the API.

Standardize the whole frontend on **date-fns + date-fns-tz**.

## Consequences

- The component is self-labeled "early alpha / not for production." Because it is
  vendored as source, we own it: pin it, and harden only the parts we use.
- A dual generic/product path inside the grid is rejected — product concerns
  stay in `InterviewCalendar`.
- Layout/snap math (`positionTimedEvents`, `snapToQuarterHour`) lives once in
  the adapter and is shared by day/week/DnD.
- If the alpha proves too rough, the battle-tested fallback is react-big-calendar
  behind the same `InterviewCalendar` seam.
