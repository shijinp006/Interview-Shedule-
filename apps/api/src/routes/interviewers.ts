import express from "express";
import {
  interviewerCreateSchema,
  interviewerUpdateSchema,
  interviewerResponseSchema,
} from "@micro-ats/shared";
import { z } from "zod";
import { validateBody } from "../middleware/validate";
import { sendJson } from "../lib/respond";
import {
  listInterviewers,
  getInterviewer,
  createInterviewer,
  updateInterviewer,
  deleteInterviewer,
} from "../services/interviewer.service";

const interviewersListSchema = z.array(interviewerResponseSchema);

export const interviewersRouter = express.Router();

interviewersRouter.get("/", async (_req, res) => {
  sendJson(res, interviewersListSchema, await listInterviewers());
});

interviewersRouter.get("/:id", async (req, res) => {
  sendJson(res, interviewerResponseSchema, await getInterviewer(String(req.params.id)));
});

interviewersRouter.post("/", validateBody(interviewerCreateSchema), async (req, res) => {
  sendJson(res, interviewerResponseSchema, await createInterviewer(req.body), 201);
});

interviewersRouter.patch("/:id", validateBody(interviewerUpdateSchema), async (req, res) => {
  sendJson(
    res,
    interviewerResponseSchema,
    await updateInterviewer(String(req.params.id), req.body),
  );
});

interviewersRouter.delete("/:id", async (req, res) => {
  await deleteInterviewer(String(req.params.id));
  res.status(204).end();
});
