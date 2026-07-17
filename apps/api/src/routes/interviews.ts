import express from "express";
import { scheduleSchema, rescheduleSchema, interviewQuerySchema } from "@micro-ats/shared";
import { validateBody } from "../middleware/validate";
import {
  scheduleInterview,
  rescheduleInterview,
  listInterviews,
  getInterview,
  setInterviewStatus,
  deleteInterview,
} from "../services/scheduling.service";

// Mounted at /api — defines /schedule and /interviews/*.
export const interviewsRouter = express.Router();

// The mandated booking endpoint.
interviewsRouter.post("/schedule", validateBody(scheduleSchema), async (req, res) => {
  res.status(201).json(await scheduleInterview(req.body));
});

interviewsRouter.get("/interviews", async (req, res) => {
  const query = interviewQuerySchema.parse(req.query);
  res.json(await listInterviews(query));
});

interviewsRouter.get("/interviews/:id", async (req, res) => {
  res.json(await getInterview(String(req.params.id)));
});

interviewsRouter.patch(
  "/interviews/:id/reschedule",
  validateBody(rescheduleSchema),
  async (req, res) => {
    res.json(await rescheduleInterview(String(req.params.id), req.body));
  },
);

interviewsRouter.patch("/interviews/:id/cancel", async (req, res) => {
  res.json(await setInterviewStatus(String(req.params.id), "Cancelled"));
});

interviewsRouter.patch("/interviews/:id/complete", async (req, res) => {
  res.json(await setInterviewStatus(String(req.params.id), "Completed"));
});

interviewsRouter.delete("/interviews/:id", async (req, res) => {
  await deleteInterview(String(req.params.id));
  res.status(204).end();
});
