import {
  ERROR_CODES,
} from "@micro-ats/shared";
import { Interview } from "../models/Interview";
import { ConflictError } from "../errors";

/**
 * Reject deleting a Candidate or Interviewer who still has upcoming Scheduled
 * Interviews. Shared by both resource services.
 */
export async function rejectIfFutureInterviews(
  party: "candidate" | "interviewer",
  id: string,
): Promise<void> {
  const future = await Interview.exists({
    [party]: id,
    status: "Scheduled",
    start: { $gte: new Date() },
  });
  if (future) {
    const label = party === "candidate" ? "Candidate" : "Interviewer";
    throw new ConflictError(
      `${label} has upcoming scheduled interviews — cancel them first`,
      ERROR_CODES.HAS_FUTURE_INTERVIEWS,
    );
  }
}
