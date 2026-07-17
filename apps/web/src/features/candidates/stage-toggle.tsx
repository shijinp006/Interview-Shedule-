import { toast } from "sonner";
import { STAGES, type Candidate, type Stage } from "@micro-ats/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StageDot } from "@/components/status-badges";
import { useUpdateCandidate } from "./queries";

/** The dashboard "Status Toggle": changes a candidate's hiring-funnel stage. */
export function StageToggle({ candidate }: { candidate: Candidate }) {
  const update = useUpdateCandidate();

  return (
    <Select
      value={candidate.stage}
      onValueChange={(value) =>
        update.mutate(
          { id: candidate.id, input: { stage: value as Stage } },
          {
            onError: (e) =>
              toast.error(e instanceof Error ? e.message : "Failed to update stage"),
          },
        )
      }
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
