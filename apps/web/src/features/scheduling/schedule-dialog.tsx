import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/date-time-picker";
import { ApiError } from "@/lib/api";
import { useCandidates } from "../candidates/queries";
import { useSchedule } from "./queries";

/** Schedule a new Interview for a fixed Interviewer. */
export function ScheduleDialog({
  open,
  onOpenChange,
  interviewerId,
  interviewerName,
  start,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviewerId: string;
  interviewerName: string;
  start: Date | null;
}) {
  const { data: candidates } = useCandidates();
  const schedule = useSchedule();
  const [candidateId, setCandidateId] = useState("");
  const [startAt, setStartAt] = useState<Date>(() => new Date());
  const [endAt, setEndAt] = useState<Date>(() => new Date());
  const now = new Date();

  useEffect(() => {
    if (!open || !start) return;
    setCandidateId("");
    setStartAt(start);
    setEndAt(new Date(start.getTime() + 60 * 60_000));
  }, [open, start]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!candidateId) {
      toast.error("Pick a candidate");
      return;
    }
    if (startAt <= new Date()) {
      toast.error("Start time must be in the future");
      return;
    }
    if (endAt <= startAt) {
      toast.error("End must be after start");
      return;
    }
    try {
      await schedule.mutateAsync({
        candidateId,
        interviewerId,
        start: startAt.toISOString(),
        end: endAt.toISOString(),
      });
      toast.success("Interview scheduled");
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError && err.conflict) {
        toast.error(err.message, {
          description: `${err.conflict.party} conflict prevented`,
        });
      } else {
        toast.error(err instanceof Error ? err.message : "Schedule failed");
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule interview</DialogTitle>
          <DialogDescription>
            With {interviewerName}. Times are in your local timezone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Candidate</Label>
            <Select value={candidateId} onValueChange={setCandidateId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a candidate…" />
              </SelectTrigger>
              <SelectContent>
                {candidates?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} · {c.stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Start</Label>
            <DateTimePicker value={startAt} onChange={setStartAt} fromDate={now} />
          </div>
          <div className="space-y-1.5">
            <Label>End</Label>
            <DateTimePicker value={endAt} onChange={setEndAt} fromDate={startAt} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={schedule.isPending}>
              Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
