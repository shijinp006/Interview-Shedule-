import { toast } from "sonner";
import { STAGES, type Candidate } from "@micro-ats/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StageDot } from "@/components/status-badges";
import { useUpdateCandidate } from "./queries";

/** Changes a Candidate's hiring-funnel Stage. */
export function StageToggle({ candidate }: { candidate: Candidate }) {
  const update = useUpdateCandidate();

  return (
    <Select
      value={candidate.stage}
      onValueChange={(value) => {
        const stage = STAGES.find((s) => s === value);
        if (!stage) return;
        update.mutate(
          { id: candidate.id, input: { stage } },
          {
            onError: (e) =>
              toast.error(e instanceof Error ? e.message : "Failed to update stage"),
          },
        );
      }}
    >
      <SelectTrigger className="h-8 w-[200px]" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STAGES.map((s) => (
          <SelectItem key={s} value={s}>
            <StageDot stage={s} />
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
