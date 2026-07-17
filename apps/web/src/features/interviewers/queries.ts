import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  interviewerResponseSchema,
  type InterviewerCreateInput,
  type InterviewerUpdateInput,
} from "@micro-ats/shared";
import { z } from "zod";
import { api } from "@/lib/api";

const KEY = ["interviewers"] as const;
const listSchema = z.array(interviewerResponseSchema);

export function useInterviewers() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api.get("/api/interviewers", listSchema),
  });
}

export function useCreateInterviewer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InterviewerCreateInput) =>
      api.post("/api/interviewers", input, interviewerResponseSchema),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateInterviewer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: InterviewerUpdateInput }) =>
      api.patch(`/api/interviewers/${id}`, input, interviewerResponseSchema),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteInterviewer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/interviewers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
