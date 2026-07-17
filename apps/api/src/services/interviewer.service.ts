import type {
  InterviewerCreateInput,
  InterviewerUpdateInput,
} from "@micro-ats/shared";
import { Interviewer } from "../models/Interviewer";
import { NotFoundError } from "../errors";
import { toInterviewerResponse } from "./mappers";
import { rejectIfFutureInterviews } from "./future-interviews";

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
  await rejectIfFutureInterviews("interviewer", id);
  const doc = await Interviewer.findByIdAndDelete(id);
  if (!doc) throw new NotFoundError("Interviewer not found");
}
