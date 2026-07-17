import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { STAGES } from "@micro-ats/shared";

const candidateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    stage: { type: String, enum: [...STAGES], required: true, default: "Applied" },
    // Write-skew guard for candidate double-booking (ADR-0002).
    bookingSeq: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

export type CandidateAttrs = InferSchemaType<typeof candidateSchema>;
export type CandidateDoc = HydratedDocument<
  CandidateAttrs & { createdAt: Date; updatedAt: Date }
>;
export const Candidate = model("Candidate", candidateSchema);
