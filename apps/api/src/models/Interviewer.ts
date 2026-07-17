import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const interviewerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    timeZone: { type: String, required: true },
    workingDays: { type: [Number], required: true },
    workStart: { type: String, required: true },
    workEnd: { type: String, required: true },
    // Bumped inside the booking transaction to serialize concurrent bookings
    // for this interviewer (write-skew guard, ADR-0002).
    bookingSeq: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

export type InterviewerAttrs = InferSchemaType<typeof interviewerSchema>;
export type InterviewerDoc = HydratedDocument<
  InterviewerAttrs & { createdAt: Date; updatedAt: Date }
>;
export const Interviewer = model("Interviewer", interviewerSchema);
