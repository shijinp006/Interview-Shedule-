import {
  ERROR_CODES,
  type InterviewerCreateInput,
  type InterviewerUpdateInput,
} from "@micro-ats/shared";
import { Interviewer } from "../models/Interviewer";
import { Interview } from "../models/Interview";
import { ConflictError, NotFoundError } from "../errors";
import { toInterviewerResponse } from "./mappers";

export async function listInterviewers() {
  const docs = await Interviewer.find().sort({ name: 1 });
  return docs.map(toInterviewerResponse);
}

export async function getInterviewer(id: string) {
  const doc = await Interviewer.findById(id);
  if (!doc) throw new NotFoundError("Interviewer not found");
  return toInterviewerResponse(doc);
}

export async function createInterviewer(input: InterviewerCreateInput) {
  const doc = await Interviewer.create(input);
  return toInterviewerResponse(doc);
}

export async function updateInterviewer(id: string, input: InterviewerUpdateInput) {
  const doc = await Interviewer.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  if (!doc) throw new NotFoundError("Interviewer not found");
  return toInterviewerResponse(doc);
}

export async function deleteInterviewer(id: string) {
  const future = await Interview.exists({
    interviewer: id,
    status: "Scheduled",
    start: { $gte: new Date() },
  });
  if (future) {
    throw new ConflictError(
      "Interviewer has upcoming scheduled interviews — cancel them first",
      ERROR_CODES.HAS_FUTURE_INTERVIEWS,
    );
  }
  const doc = await Interviewer.findByIdAndDelete(id);
  if (!doc) throw new NotFoundError("Interviewer not found");
}
