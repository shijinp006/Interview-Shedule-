# Vendored Origin UI event-calendar; timezone owned at the boundary

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

Vendor **Origin UI `event-calendar`** (MIT, copy-paste source) as the calendar.
It is the only option that is simultaneously native shadcn, a real day/week
time-grid, **controlled by props** (`events` in; `onEventAdd/Update/Delete`
callbacks out), and on date-fns v4.

Own timezone conversion **at the boundary**, not inside the component:

- The server stores and returns UTC.
- The client converts UTC → the viewer's local zone with **date-fns + date-fns-tz**
  before handing events to the calendar, so the component only ever sees
  wall-clock local times and needs no tz awareness.
- The calendar's create/edit/delete callbacks are where booking calls
  (`POST /api/schedule`) and 409 handling live.

Standardize the whole frontend on **date-fns + date-fns-tz** (dropping the
earlier Luxon pick) so there is a single date library, matching the vendored
component.

## Consequences

- The component is self-labeled "early alpha / not for production." Because it is
  vendored as source, we own it: pin it, and harden the parts we use.
- Because we own tz conversion, the component's lack of tz support is a non-issue.
- If the alpha proves too rough, the battle-tested fallback is react-big-calendar
  (controlled `events` + `onSelectSlot`/`onEventDrop`/`onEventResize`), at the
  cost of a Moment localizer and non-native shadcn styling.
