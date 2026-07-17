import { z } from "zod";
import { stageSchema } from "./enums";
import { idSchema, isoUtcSchema } from "./fields";

const candidateFields = {
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.email().optional(),
  stage: stageSchema.default("Applied"),
};

export const candidateCreateSchema = z.object(candidateFields);
export const candidateUpdateSchema = z.object(candidateFields).partial();

export const candidateResponseSchema = z.object({
  id: idSchema,
  name: candidateFields.name,
  email: z.email().optional(),
  stage: stageSchema,
  createdAt: isoUtcSchema,
  updatedAt: isoUtcSchema,
});

export type CandidateCreateInput = z.infer<typeof candidateCreateSchema>;
export type CandidateUpdateInput = z.infer<typeof candidateUpdateSchema>;
export type Candidate = z.infer<typeof candidateResponseSchema>;
