import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { WEEKDAY_LABELS, type Interviewer } from "@micro-ats/shared";
import { tzDisplay } from "@/lib/tz";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { useConfirm } from "@/components/confirm-dialog";
import { useInterviewers, useDeleteInterviewer } from "./queries";
import { InterviewerFormDialog } from "./interviewer-form-dialog";

export function InterviewersPage() {
  const { data, isLoading } = useInterviewers();
  const del = useDeleteInterviewer();
  const confirm = useConfirm();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Interviewer | null>(null);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(iv: Interviewer) {
    setEditing(iv);
    setDialogOpen(true);
  }
  async function onDelete(iv: Interviewer) {
    const ok = await confirm({
      title: `Delete ${iv.name}?`,
      description:
        "The interviewer will be removed. This is blocked if they have upcoming scheduled interviews.",
      confirmText: "Delete",
      destructive: true,
    });
    if (!ok) return;
    try {
      await del.mutateAsync(iv.id);
      toast.success("Interviewer deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Interviewers</h1>
          <p className="text-muted-foreground text-sm">
            Each interviewer has a timezone and working hours.
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={openNew}>
          <Plus className="size-4" /> Add interviewer
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Timezone</TableHead>
              <TableHead>Working days</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground text-center">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground text-center">
                  No interviewers yet.
                </TableCell>
              </TableRow>
            )}
            {data?.map((iv) => (
              <TableRow key={iv.id}>
                <TableCell className="font-medium">{iv.name}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-sm">
                  {tzDisplay(iv.timeZone)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {iv.workingDays.map((d) => WEEKDAY_LABELS[d]).join(", ")}
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-sm">
                  {iv.workStart}–{iv.workEnd}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(iv)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(iv)}>
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <InterviewerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        interviewer={editing}
      />
    </div>
  );
}
