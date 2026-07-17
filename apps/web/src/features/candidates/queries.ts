import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Candidate,
  CandidateCreateInput,
  CandidateUpdateInput,
} from "@micro-ats/shared";
import { api } from "@/lib/api";

const KEY = ["candidates"] as const;

export function useCandidates() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => api.get<Candidate[]>("/api/candidates"),
  });
}

export function useCreateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CandidateCreateInput) =>
      api.post<Candidate>("/api/candidates", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CandidateUpdateInput }) =>
      api.patch<Candidate>(`/api/candidates/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/api/candidates/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
