import type {
  Interviewer,
  Candidate,
  Interview,
  Stage,
  InterviewStatus,
} from "@micro-ats/shared";
import type { InterviewerDoc } from "../models/Interviewer";
import type { CandidateDoc } from "../models/Candidate";
import type { InterviewDoc } from "../models/Interview";

export function toInterviewerResponse(doc: InterviewerDoc): Interviewer {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email ?? undefined,
    timeZone: doc.timeZone,
    workingDays: doc.workingDays,
    workStart: doc.workStart,
    workEnd: doc.workEnd,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export function toCandidateResponse(doc: CandidateDoc): Candidate {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email ?? undefined,
    stage: doc.stage as Stage,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/** `candidate` and `interviewer` must be populated. */
export function toInterviewResponse(doc: InterviewDoc): Interview {
  const candidate = doc.candidate as unknown as CandidateDoc;
  const interviewer = doc.interviewer as unknown as InterviewerDoc;
  return {
    id: String(doc._id),
    interviewerId: String(interviewer._id),
    interviewerName: interviewer.name,
    interviewerTimeZone: interviewer.timeZone,
    candidateId: String(candidate._id),
    candidateName: candidate.name,
    start: doc.start.toISOString(),
    end: doc.end.toISOString(),
    status: doc.status as InterviewStatus,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
