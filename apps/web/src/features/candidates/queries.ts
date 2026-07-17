import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  candidateResponseSchema,
  type CandidateCreateInput,
  type CandidateUpdateInput,
} from "@micro-ats/shared";
import { z } from "zod";
import { api } from "@/lib/api";

const KEY = ["candidates"] as const;
const listSchema = z.array(candidateResponseSchema);

export function useCandidates() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api.get("/api/candidates", listSchema),
  });
}

export function useCreateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CandidateCreateInput) =>
      api.post("/api/candidates", input, candidateResponseSchema),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CandidateUpdateInput }) =>
      api.patch(`/api/candidates/${id}`, input, candidateResponseSchema),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/candidates/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
