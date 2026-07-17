# Micro-ATS — Interview Scheduler

A recruitment tool for assigning candidates to interviewers within specific time
windows, preventing double-booking of an interviewer, and tracking each
candidate's progress through the hiring funnel. All times are stored in UTC and
rendered in the viewer's local timezone.

## Language

**Recruiter**:
The person who uses the dashboard: the authenticated User who creates candidates
and interviewers and books interviews. The only actor that logs in — Interviewers
and Candidates are resources the Recruiter manages, not accounts.
_Avoid_: User (in UI/domain copy; fine in auth/framework code), admin, member

**Candidate**:
A person being considered for a role. Moves through the hiring funnel and can be
assigned to multiple interviews over time.
_Avoid_: Applicant, lead

**Interviewer**:
A person who conducts interviews. Holds a calendar of interviews and can never be
booked for two overlapping interviews at once. Has an IANA `timeZone` and
Working hours in that timezone.
_Avoid_: Panelist, host

**Working hours**:
An Interviewer's bookable availability, defined in their own IANA timezone as a
set of working weekdays plus a daily `workStart`–`workEnd` time-of-day. A booking
is valid only if its time window, converted from UTC into the interviewer's
timezone, lands on a working day and fits entirely within `workStart`–`workEnd`.
_Avoid_: Availability, schedule, business hours

**Interview**:
A scheduled meeting between exactly one Candidate and one Interviewer within a
single time window. This is the thing shown on the calendar grid and the thing
the conflict rule protects.
_Avoid_: InterviewSlot, slot, booking, meeting, appointment

**Time window**:
The `[start, end)` interval of an Interview, stored in UTC. Half-open: an
interview ending exactly when another begins does **not** overlap.
_Avoid_: Time block, slot, duration

**Stage**:
A Candidate's single current position in the hiring funnel: `Applied →
Technical Round → Offered → Hired`, plus `Rejected` (terminal). This is what the
dashboard's "Status Toggle" controls. A property of the Candidate, independent of
any one interview. Transitions are unconstrained — a Recruiter may set any stage
at any time to correct mistakes.
_Avoid_: Status (ambiguous — reserved for the Interview lifecycle), step, phase

**Interview status**:
An Interview's lifecycle state: `Scheduled` (default) → `Completed`, or
`Cancelled`. Distinct from Stage. A `Cancelled` interview frees its time window
and is ignored by conflict detection; `Scheduled` and `Completed` interviews
occupy the interviewer's time.
_Avoid_: Stage (reserved for the Candidate funnel), state

**Conflict**:
An attempted Interview whose time window overlaps an existing non-cancelled
Interview for the *same* Interviewer **or** the *same* Candidate — a person
cannot be in two overlapping interviews. The booking is rejected with `409`: an
interviewer conflict names the candidate already holding the overlapping
interview; a candidate conflict names the interviewer they are already booked
with. Overlap is half-open, so touching windows (`end == start`) do not conflict.
_Avoid_: Clash, collision, double-booking (use for the failure mode, not the term)
