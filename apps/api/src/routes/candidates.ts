import express from "express";
import { candidateCreateSchema, candidateUpdateSchema } from "@micro-ats/shared";
import { validateBody } from "../middleware/validate";
import {
  listCandidates,
  getCandidate,
  createCandidate,
  updateCandidate,
  deleteCandidate,
} from "../services/candidate.service";

export const candidatesRouter = express.Router();

candidatesRouter.get("/", async (_req, res) => {
  res.json(await listCandidates());
});

candidatesRouter.get("/:id", async (req, res) => {
  res.json(await getCandidate(String(req.params.id)));
});

candidatesRouter.post("/", validateBody(candidateCreateSchema), async (req, res) => {
  res.status(201).json(await createCandidate(req.body));
});

// The dashboard "Status Toggle" is a PATCH { stage } to this endpoint.
candidatesRouter.patch("/:id", validateBody(candidateUpdateSchema), async (req, res) => {
  res.json(await updateCandidate(String(req.params.id), req.body));
});

candidatesRouter.delete("/:id", async (req, res) => {
  await deleteCandidate(String(req.params.id));
  res.status(204).end();
});
