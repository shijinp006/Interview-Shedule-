import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { INTERVIEW_STATUSES } from "@micro-ats/shared";

const interviewSchema = new Schema(
  {
    candidate: { type: Schema.Types.ObjectId, ref: "Candidate", required: true },
    interviewer: { type: Schema.Types.ObjectId, ref: "Interviewer", required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    status: {
      type: String,
      enum: [...INTERVIEW_STATUSES],
      required: true,
      default: "Scheduled",
    },
  },
  { timestamps: true },
);

// Serve the overlap query and the calendar feed.
interviewSchema.index({ interviewer: 1, status: 1, start: 1, end: 1 });
interviewSchema.index({ candidate: 1, status: 1, start: 1, end: 1 });

export type InterviewAttrs = InferSchemaType<typeof interviewSchema>;
export type InterviewDoc = HydratedDocument<
  InterviewAttrs & { createdAt: Date; updatedAt: Date }
>;
export const Interview = model("Interview", interviewSchema);
