import express from "express";
import {
  candidateCreateSchema,
  candidateUpdateSchema,
  candidateResponseSchema,
} from "@micro-ats/shared";
import { z } from "zod";
import { validateBody } from "../middleware/validate";
import { sendJson } from "../lib/respond";
import {
  listCandidates,
  getCandidate,
  createCandidate,
  updateCandidate,
  deleteCandidate,
} from "../services/candidate.service";

const candidatesListSchema = z.array(candidateResponseSchema);

export const candidatesRouter = express.Router();

candidatesRouter.get("/", async (_req, res) => {
  sendJson(res, candidatesListSchema, await listCandidates());
});

candidatesRouter.get("/:id", async (req, res) => {
  sendJson(res, candidateResponseSchema, await getCandidate(String(req.params.id)));
});

candidatesRouter.post("/", validateBody(candidateCreateSchema), async (req, res) => {
  sendJson(res, candidateResponseSchema, await createCandidate(req.body), 201);
});

// Stage updates are a PATCH { stage } to this endpoint.
candidatesRouter.patch("/:id", validateBody(candidateUpdateSchema), async (req, res) => {
  sendJson(res, candidateResponseSchema, await updateCandidate(String(req.params.id), req.body));
});

candidatesRouter.delete("/:id", async (req, res) => {
  await deleteCandidate(String(req.params.id));
  res.status(204).end();
});
