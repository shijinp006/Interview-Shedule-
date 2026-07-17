import express from "express";
import { interviewerCreateSchema, interviewerUpdateSchema } from "@micro-ats/shared";
import { validateBody } from "../middleware/validate";
import {
  listInterviewers,
  getInterviewer,
  createInterviewer,
  updateInterviewer,
  deleteInterviewer,
} from "../services/interviewer.service";

export const interviewersRouter = express.Router();

interviewersRouter.get("/", async (_req, res) => {
  res.json(await listInterviewers());
});

interviewersRouter.get("/:id", async (req, res) => {
  res.json(await getInterviewer(String(req.params.id)));
});

interviewersRouter.post("/", validateBody(interviewerCreateSchema), async (req, res) => {
  res.status(201).json(await createInterviewer(req.body));
});

interviewersRouter.patch("/:id", validateBody(interviewerUpdateSchema), async (req, res) => {
  res.json(await updateInterviewer(String(req.params.id), req.body));
});

interviewersRouter.delete("/:id", async (req, res) => {
  await deleteInterviewer(String(req.params.id));
  res.status(204).end();
});
