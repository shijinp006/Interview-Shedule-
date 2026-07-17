import express from "express";
import {
  scheduleSchema,
  rescheduleSchema,
  interviewQuerySchema,
  interviewResponseSchema,
} from "@micro-ats/shared";
import { z } from "zod";
import { validateBody } from "../middleware/validate";
import { sendJson } from "../lib/respond";
import {
  scheduleInterview,
  rescheduleInterview,
  listInterviews,
  getInterview,
  setInterviewStatus,
  deleteInterview,
} from "../services/scheduling.service";

const interviewsListSchema = z.array(interviewResponseSchema);

// Mounted at /api — defines /schedule and /interviews/*.
export const interviewsRouter = express.Router();

interviewsRouter.post("/schedule", validateBody(scheduleSchema), async (req, res) => {
  sendJson(res, interviewResponseSchema, await scheduleInterview(req.body), 201);
});

interviewsRouter.get("/interviews", async (req, res) => {
  const query = interviewQuerySchema.parse(req.query);
  sendJson(res, interviewsListSchema, await listInterviews(query));
});

interviewsRouter.get("/interviews/:id", async (req, res) => {
  sendJson(res, interviewResponseSchema, await getInterview(String(req.params.id)));
});

interviewsRouter.patch(
  "/interviews/:id/reschedule",
  validateBody(rescheduleSchema),
  async (req, res) => {
    sendJson(
      res,
      interviewResponseSchema,
      await rescheduleInterview(String(req.params.id), req.body),
    );
  },
);

interviewsRouter.patch("/interviews/:id/cancel", async (req, res) => {
  sendJson(
    res,
    interviewResponseSchema,
    await setInterviewStatus(String(req.params.id), "Cancelled"),
  );
});

interviewsRouter.patch("/interviews/:id/complete", async (req, res) => {
  sendJson(
    res,
    interviewResponseSchema,
    await setInterviewStatus(String(req.params.id), "Completed"),
  );
});

interviewsRouter.delete("/interviews/:id", async (req, res) => {
  await deleteInterview(String(req.params.id));
  res.status(204).end();
});
