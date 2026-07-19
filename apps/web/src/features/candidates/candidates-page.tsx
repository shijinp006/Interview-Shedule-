import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Candidate } from "@micro-ats/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useConfirm } from "@/components/confirm-dialog";
import { useCandidates, useDeleteCandidate } from "./queries";
import { StageToggle } from "./stage-toggle";
import { CandidateFormDialog } from "./candidate-form-dialog";

export function CandidatesPage() {
  const { data, isLoading } = useCandidates();
  const del = useDeleteCandidate();
  const confirm = useConfirm();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Candidate | null>(null);

  async function onDelete(c: Candidate) {
    const ok = await confirm({
      title: `Delete ${c.name}?`,
      description:
        "The candidate will be removed. This is blocked if they have upcoming scheduled interviews.",
      confirmText: "Delete",
      destructive: true,
    });
    if (!ok) return;
    try {
      await del.mutateAsync(c.id);
      toast.success("Candidate deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Candidates</h1>
          <p className="text-muted-foreground text-sm">
            Move candidates through the hiring funnel with the stage toggle.
          </p>
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" /> Add candidate
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground text-center">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground text-center">
                  No candidates yet.
                </TableCell>
              </TableRow>
            )}
            {data?.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.email ?? "—"}</TableCell>
                <TableCell>
                  <StageToggle candidate={c} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(c);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(c)}>
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <CandidateFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        candidate={editing}
      />
    </div>
  );
}
