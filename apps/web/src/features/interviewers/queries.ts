import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Interviewer,
  InterviewerCreateInput,
  InterviewerUpdateInput,
} from "@micro-ats/shared";
import { api } from "@/lib/api";

const KEY = ["interviewers"] as const;

export function useInterviewers() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api.get<Interviewer[]>("/api/interviewers"),
  });
}

export function useCreateInterviewer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InterviewerCreateInput) =>
      api.post<Interviewer>("/api/interviewers", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateInterviewer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: InterviewerUpdateInput }) =>
      api.patch<Interviewer>(`/api/interviewers/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteInterviewer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/api/interviewers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
