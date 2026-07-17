import type { CandidateCreateInput, CandidateUpdateInput } from "@micro-ats/shared";
import { Candidate } from "../models/Candidate";
import { NotFoundError } from "../errors";
import { toCandidateResponse } from "./mappers";
import { rejectIfFutureInterviews } from "./future-interviews";

export async function listCandidates() {
  const docs = await Candidate.find().sort({ createdAt: -1 });
  return docs.map(toCandidateResponse);
}

export async function getCandidate(id: string) {
  const doc = await Candidate.findById(id);
  if (!doc) throw new NotFoundError("Candidate not found");
  return toCandidateResponse(doc);
}

export async function createCandidate(input: CandidateCreateInput) {
  const doc = await Candidate.create(input);
  return toCandidateResponse(doc);
}

export async function updateCandidate(id: string, input: CandidateUpdateInput) {
  const doc = await Candidate.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  if (!doc) throw new NotFoundError("Candidate not found");
  return toCandidateResponse(doc);
}

export async function deleteCandidate(id: string) {
  await rejectIfFutureInterviews("candidate", id);
  const doc = await Candidate.findByIdAndDelete(id);
  if (!doc) throw new NotFoundError("Candidate not found");
}
