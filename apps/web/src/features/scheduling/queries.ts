import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Interview, ScheduleInput, RescheduleInput } from "@micro-ats/shared";
import { api } from "@/lib/api";

export const interviewsKey = (params?: Record<string, string>) =>
  ["interviews", params ?? {}] as const;

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
    queryFn: () => api.get<Interview[]>(`/api/interviews?${search}`),
    enabled: Boolean(params.interviewerId),
  });
}

function invalidateInterviews(qc: ReturnType<typeof useQueryClient>) {
  return qc.invalidateQueries({ queryKey: ["interviews"] });
}

export function useSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ScheduleInput) => api.post<Interview>("/api/schedule", input),
    onSuccess: () => invalidateInterviews(qc),
  });
}

export function useReschedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RescheduleInput }) =>
      api.patch<Interview>(`/api/interviews/${id}/reschedule`, input),
    onSuccess: () => invalidateInterviews(qc),
  });
}

export function useCancelInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<Interview>(`/api/interviews/${id}/cancel`),
    onSuccess: () => invalidateInterviews(qc),
  });
}

export function useCompleteInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<Interview>(`/api/interviews/${id}/complete`),
    onSuccess: () => invalidateInterviews(qc),
  });
}

export function useDeleteInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/api/interviews/${id}`),
    onSuccess: () => invalidateInterviews(qc),
  });
}
