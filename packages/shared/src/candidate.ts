import { z } from "zod";
import { stageSchema } from "./enums";

const candidateFields = {
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.email().optional(),
  stage: stageSchema.default("Applied"),
};

export const candidateCreateSchema = z.object(candidateFields);
export const candidateUpdateSchema = z.object(candidateFields).partial();

export const candidateResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  stage: stageSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CandidateCreateInput = z.infer<typeof candidateCreateSchema>;
export type CandidateUpdateInput = z.infer<typeof candidateUpdateSchema>;
export type Candidate = z.infer<typeof candidateResponseSchema>;
