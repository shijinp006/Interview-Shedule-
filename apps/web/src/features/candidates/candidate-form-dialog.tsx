import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { candidateCreateSchema, STAGES, type Candidate, type Stage } from "@micro-ats/shared";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCandidate, useUpdateCandidate } from "./queries";

export function CandidateFormDialog({
  open,
  onOpenChange,
  candidate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
}) {
  const isEdit = Boolean(candidate);
  const create = useCreateCandidate();
  const update = useUpdateCandidate();
  const pending = create.isPending || update.isPending;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<Stage>("Applied");

  useEffect(() => {
    if (!open) return;
    setName(candidate?.name ?? "");
    setEmail(candidate?.email ?? "");
    setStage(candidate?.stage ?? "Applied");
  }, [open, candidate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = candidateCreateSchema.safeParse({
      name,
      email: email || undefined,
      stage,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    try {
      if (isEdit) {
        await update.mutateAsync({ id: candidate!.id, input: parsed.data });
        toast.success("Candidate updated");
      } else {
        await create.mutateAsync(parsed.data);
        toast.success("Candidate created");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit candidate" : "New candidate"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="c-name">Name</Label>
            <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-email">Email (optional)</Label>
            <Input
              id="c-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Stage</Label>
            <Select value={stage} onValueChange={(v) => setStage(v as Stage)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {isEdit ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
