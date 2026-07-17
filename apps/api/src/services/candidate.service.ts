import {
  ERROR_CODES,
  type CandidateCreateInput,
  type CandidateUpdateInput,
} from "@micro-ats/shared";
import { Candidate } from "../models/Candidate";
import { Interview } from "../models/Interview";
import { ConflictError, NotFoundError } from "../errors";
import { toCandidateResponse } from "./mappers";

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
  const future = await Interview.exists({
    candidate: id,
    status: "Scheduled",
    start: { $gte: new Date() },
  });
  if (future) {
    throw new ConflictError(
      "Candidate has upcoming scheduled interviews — cancel them first",
      ERROR_CODES.HAS_FUTURE_INTERVIEWS,
    );
  }
  const doc = await Candidate.findByIdAndDelete(id);
  if (!doc) throw new NotFoundError("Candidate not found");
}
