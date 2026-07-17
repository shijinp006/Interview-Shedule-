import mongoose, { type ClientSession, type Types } from "mongoose";
import {
  ERROR_CODES,
  BLOCKING_STATUSES,
  type ConflictDetail,
  type ConflictParty,
  type ScheduleInput,
  type RescheduleInput,
  type InterviewQuery,
  type InterviewStatus,
} from "@micro-ats/shared";
import { Interview, type InterviewDoc } from "../models/Interview";
import { Interviewer, type InterviewerDoc } from "../models/Interviewer";
import { Candidate, type CandidateDoc } from "../models/Candidate";
import { NotFoundError, ValidationError, ConflictError } from "../errors";
import { validateWindow, withinWorkingHours } from "./overlap";
import { toInterviewResponse } from "./mappers";
import { env } from "../env";

type PopulatedInterview = InterviewDoc & {
  candidate: CandidateDoc;
  interviewer: InterviewerDoc;
};

// Explicit snapshot isolation + majority so the overlap read is consistent and
// the $inc write-skew guard is durable (ADR-0002). withTransaction auto-retries
// any error labeled TransientTransactionError (which WriteConflict carries);
// our AppErrors are unlabeled, so they abort once and surface immediately.
const TXN_OPTS = {
  readConcern: { level: "snapshot" as const },
  writeConcern: { w: "majority" as const },
  readPreference: "primary" as const,
};

function windowGuard(start: Date, end: Date) {
  const check = validateWindow(start, end, {
    minMinutes: env.MIN_INTERVIEW_MINUTES,
    maxMinutes: env.MAX_INTERVIEW_MINUTES,
  });
  if (!check.ok) throw new ValidationError(check.reason ?? "Invalid time window");
}

async function findOverlap(
  field: "interviewer" | "candidate",
  id: Types.ObjectId,
  start: Date,
  end: Date,
  session: ClientSession,
  excludeId?: Types.ObjectId,
): Promise<PopulatedInterview | null> {
  const query: Record<string, unknown> = {
    [field]: id,
    status: { $in: BLOCKING_STATUSES },
    // half-open overlap: existing.start < newEnd && newStart < existing.end
    start: { $lt: end },
    end: { $gt: start },
  };
  if (excludeId) query._id = { $ne: excludeId };

  return Interview.findOne(query)
    .populate<{ candidate: CandidateDoc; interviewer: InterviewerDoc }>([
      { path: "candidate", options: { session } },
      { path: "interviewer", options: { session } },
    ])
    .session(session) as unknown as Promise<PopulatedInterview | null>;
}

function buildConflict(party: ConflictParty, overlap: PopulatedInterview): ConflictError {
  const { candidate, interviewer } = overlap;
  const detail: ConflictDetail = {
    party,
    interviewId: String(overlap._id),
    candidateName: candidate.name,
    interviewerName: interviewer.name,
    start: overlap.start.toISOString(),
    end: overlap.end.toISOString(),
  };
  const window = `${overlap.start.toISOString()} – ${overlap.end.toISOString()}`;
  const message =
    party === "interviewer"
      ? `${interviewer.name} is already booked with ${candidate.name} (${window})`
      : `${candidate.name} is already booked with ${interviewer.name} (${window})`;
  return new ConflictError(message, ERROR_CODES.INTERVIEW_CONFLICT, detail);
}

async function getInterviewById(id: Types.ObjectId | string) {
  const doc = await Interview.findById(id).populate(["candidate", "interviewer"]);
  if (!doc) throw new NotFoundError("Interview not found");
  return toInterviewResponse(doc);
}

export async function scheduleInterview(input: ScheduleInput) {
  const start = new Date(input.start);
  const end = new Date(input.end);
  windowGuard(start, end);

  const session = await mongoose.startSession();
  try {
    let createdId: Types.ObjectId | undefined;
    await session.withTransaction(async () => {
      // Bump both parties' bookingSeq FIRST — this is the write-skew guard:
      // concurrent bookings touching either party collide on a shared document.
      const interviewer = await Interviewer.findOneAndUpdate(
        { _id: input.interviewerId },
        { $inc: { bookingSeq: 1 } },
        { session, new: true },
      );
      if (!interviewer) throw new NotFoundError("Interviewer not found");

      const candidate = await Candidate.findOneAndUpdate(
        { _id: input.candidateId },
        { $inc: { bookingSeq: 1 } },
        { session, new: true },
      );
      if (!candidate) throw new NotFoundError("Candidate not found");

      const wh = withinWorkingHours(start, end, interviewer);
      if (!wh.ok) throw new ValidationError(wh.reason ?? "Outside working hours");

      const iOverlap = await findOverlap("interviewer", interviewer._id, start, end, session);
      if (iOverlap) throw buildConflict("interviewer", iOverlap);

      const cOverlap = await findOverlap("candidate", candidate._id, start, end, session);
      if (cOverlap) throw buildConflict("candidate", cOverlap);

      const [doc] = await Interview.create(
        [
          {
            candidate: candidate._id,
            interviewer: interviewer._id,
            start,
            end,
            status: "Scheduled",
          },
        ],
        { session },
      );
      createdId = doc!._id;
    }, TXN_OPTS);

    return getInterviewById(createdId!);
  } finally {
    await session.endSession();
  }
}

export async function rescheduleInterview(id: string, input: RescheduleInput) {
  const start = new Date(input.start);
  const end = new Date(input.end);
  windowGuard(start, end);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const interview = await Interview.findById(id).session(session);
      if (!interview) throw new NotFoundError("Interview not found");
      if (interview.status !== "Scheduled") {
        throw new ValidationError("Only scheduled interviews can be rescheduled");
      }

      const interviewer = await Interviewer.findOneAndUpdate(
        { _id: interview.interviewer },
        { $inc: { bookingSeq: 1 } },
        { session, new: true },
      );
      if (!interviewer) throw new NotFoundError("Interviewer not found");

      const candidate = await Candidate.findOneAndUpdate(
        { _id: interview.candidate },
        { $inc: { bookingSeq: 1 } },
        { session, new: true },
      );
      if (!candidate) throw new NotFoundError("Candidate not found");

      const wh = withinWorkingHours(start, end, interviewer);
      if (!wh.ok) throw new ValidationError(wh.reason ?? "Outside working hours");

      const iOverlap = await findOverlap(
        "interviewer",
        interviewer._id,
        start,
        end,
        session,
        interview._id,
      );
      if (iOverlap) throw buildConflict("interviewer", iOverlap);

      const cOverlap = await findOverlap(
        "candidate",
        candidate._id,
        start,
        end,
        session,
        interview._id,
      );
      if (cOverlap) throw buildConflict("candidate", cOverlap);

      interview.start = start;
      interview.end = end;
      await interview.save({ session });
    }, TXN_OPTS);

    return getInterviewById(id);
  } finally {
    await session.endSession();
  }
}

export async function listInterviews(q: InterviewQuery) {
  const filter: Record<string, unknown> = {};
  if (q.interviewerId) filter.interviewer = q.interviewerId;
  if (q.candidateId) filter.candidate = q.candidateId;
  if (q.status) filter.status = q.status;
  // Interviews overlapping the visible [from, to) range.
  if (q.to) filter.start = { $lt: new Date(q.to) };
  if (q.from) filter.end = { $gt: new Date(q.from) };

  const docs = await Interview.find(filter)
    .sort({ start: 1 })
    .populate(["candidate", "interviewer"]);
  return docs.map(toInterviewResponse);
}

export async function getInterview(id: string) {
  return getInterviewById(id);
}

export async function setInterviewStatus(id: string, status: InterviewStatus) {
  const doc = await Interview.findByIdAndUpdate(
    id,
    { status },
    { new: true },
  ).populate(["candidate", "interviewer"]);
  if (!doc) throw new NotFoundError("Interview not found");
  return toInterviewResponse(doc);
}

export async function deleteInterview(id: string) {
  const doc = await Interview.findByIdAndDelete(id);
  if (!doc) throw new NotFoundError("Interview not found");
}
