import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { Interview } from "@micro-ats/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InterviewStatusBadge } from "@/components/status-badges";
import { DateTimePicker } from "@/components/date-time-picker";
import { ApiError } from "@/lib/api";
import { formatInTz, formatLocal } from "@/lib/tz";
import {
  useCancelInterview,
  useCompleteInterview,
  useDeleteInterview,
  useReschedule,
} from "./queries";

export function InterviewActionsDialog({
  open,
  onOpenChange,
  interview,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: Interview | null;
}) {
  const reschedule = useReschedule();
  const cancel = useCancelInterview();
  const complete = useCompleteInterview();
  const del = useDeleteInterview();

  const [startAt, setStartAt] = useState<Date>(new Date());
  const [endAt, setEndAt] = useState<Date>(new Date());

  useEffect(() => {
    if (!open || !interview) return;
    setStartAt(new Date(interview.start));
    setEndAt(new Date(interview.end));
  }, [open, interview]);

  if (!interview) return null;
  const isScheduled = interview.status === "Scheduled";

  function handleError(err: unknown) {
    if (err instanceof ApiError && err.conflict) {
      toast.error(err.message, { description: "Conflict prevented" });
    } else {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  }

  async function onReschedule(e: FormEvent) {
    e.preventDefault();
    if (endAt <= startAt) {
      toast.error("End must be after start");
      return;
    }
    try {
      await reschedule.mutateAsync({
        id: interview!.id,
        input: { start: startAt.toISOString(), end: endAt.toISOString() },
      });
      toast.success("Interview rescheduled");
      onOpenChange(false);
    } catch (err) {
      handleError(err);
    }
  }

  async function run(fn: () => Promise<unknown>, msg: string) {
    try {
      await fn();
      toast.success(msg);
      onOpenChange(false);
    } catch (err) {
      handleError(err);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {interview.candidateName}
            <InterviewStatusBadge status={interview.status} />
          </DialogTitle>
          <DialogDescription>with {interview.interviewerName}</DialogDescription>
        </DialogHeader>

        <div className="bg-muted/40 space-y-1.5 rounded-md border p-3 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Your time</span>
            <span className="font-mono">
              {formatLocal(interview.start)} – {formatLocal(interview.end, "HH:mm")}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">{interview.interviewerName}'s time</span>
            <span className="font-mono">
              {formatInTz(interview.start, interview.interviewerTimeZone)} –{" "}
              {formatInTz(interview.end, interview.interviewerTimeZone, "HH:mm")}
            </span>
          </div>
        </div>

        {isScheduled && (
          <form onSubmit={onReschedule} className="space-y-3">
            <Label className="text-xs tracking-wide uppercase">Reschedule</Label>
            <div className="space-y-2">
              <DateTimePicker value={startAt} onChange={setStartAt} />
              <DateTimePicker value={endAt} onChange={setEndAt} />
            </div>
            <Button type="submit" size="sm" disabled={reschedule.isPending}>
              Save new time
            </Button>
          </form>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="flex gap-2">
            {isScheduled && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => run(() => complete.mutateAsync(interview.id), "Marked completed")}
              >
                Complete
              </Button>
            )}
            {interview.status !== "Cancelled" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => run(() => cancel.mutateAsync(interview.id), "Interview cancelled")}
              >
                Cancel interview
              </Button>
            )}
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => run(() => del.mutateAsync(interview.id), "Interview deleted")}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
