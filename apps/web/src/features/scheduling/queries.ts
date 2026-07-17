import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  interviewResponseSchema,
  type ScheduleInput,
  type RescheduleInput,
} from "@micro-ats/shared";
import { z } from "zod";
import { api } from "@/lib/api";

export const interviewsKey = (params?: Record<string, string>) =>
  ["interviews", params ?? {}] as const;

const listSchema = z.array(interviewResponseSchema);

export function useInterviews(params: {
  interviewerId?: string;
  from?: string;
  to?: string;
}) {
  const search = new URLSearchParams(
    Object.entries(params).filter(([, v]) => Boolean(v)) as [string, string][],
  ).toString();
  return useQuery({
    queryKey: interviewsKey(params as Record<string, string>),
    queryFn: () => api.get(`/api/interviews?${search}`, listSchema),
    enabled: Boolean(params.interviewerId && params.from && params.to),
  });
}

function invalidateInterviews(qc: ReturnType<typeof useQueryClient>) {
  return qc.invalidateQueries({ queryKey: ["interviews"] });
}

export function useSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ScheduleInput) =>
      api.post("/api/schedule", input, interviewResponseSchema),
    onSuccess: () => invalidateInterviews(qc),
  });
}

export function useReschedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RescheduleInput }) =>
      api.patch(`/api/interviews/${id}/reschedule`, input, interviewResponseSchema),
    onSuccess: () => invalidateInterviews(qc),
  });
}

export function useCancelInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch(`/api/interviews/${id}/cancel`, undefined, interviewResponseSchema),
    onSuccess: () => invalidateInterviews(qc),
  });
}

export function useCompleteInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch(`/api/interviews/${id}/complete`, undefined, interviewResponseSchema),
    onSuccess: () => invalidateInterviews(qc),
  });
}

export function useDeleteInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/interviews/${id}`),
    onSuccess: () => invalidateInterviews(qc),
  });
}
