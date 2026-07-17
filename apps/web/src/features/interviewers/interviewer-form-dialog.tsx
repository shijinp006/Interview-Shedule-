import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  interviewerCreateSchema,
  WEEKDAY_LABELS,
  type Interviewer,
} from "@micro-ats/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { viewerTz, tzPretty } from "@/lib/tz";
import { useCreateInterviewer, useUpdateInterviewer } from "./queries";

const TIME_ZONES: string[] =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : [viewerTz, "UTC"];

const selectClass =
  "border-input bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]";

export function InterviewerFormDialog({
  open,
  onOpenChange,
  interviewer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviewer: Interviewer | null;
}) {
  const isEdit = Boolean(interviewer);
  const create = useCreateInterviewer();
  const update = useUpdateInterviewer();
  const pending = create.isPending || update.isPending;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [timeZone, setTimeZone] = useState(viewerTz);
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("17:00");

  useEffect(() => {
    if (!open) return;
    if (interviewer) {
      setName(interviewer.name);
      setEmail(interviewer.email ?? "");
      setTimeZone(interviewer.timeZone);
      setWorkingDays(interviewer.workingDays);
      setWorkStart(interviewer.workStart);
      setWorkEnd(interviewer.workEnd);
    } else {
      setName("");
      setEmail("");
      setTimeZone(viewerTz);
      setWorkingDays([1, 2, 3, 4, 5]);
      setWorkStart("09:00");
      setWorkEnd("17:00");
    }
  }, [open, interviewer]);

  function toggleDay(d: number) {
    setWorkingDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(),
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = interviewerCreateSchema.safeParse({
      name,
      email: email || undefined,
      timeZone,
      workingDays,
      workStart,
      workEnd,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    try {
      if (isEdit) {
        await update.mutateAsync({ id: interviewer!.id, input: parsed.data });
        toast.success("Interviewer updated");
      } else {
        await create.mutateAsync(parsed.data);
        toast.success("Interviewer created");
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
          <DialogTitle>{isEdit ? "Edit interviewer" : "New interviewer"}</DialogTitle>
          <DialogDescription>
            Working hours are defined in the interviewer's own timezone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="iv-name">Name</Label>
            <Input id="iv-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="iv-email">Email (optional)</Label>
            <Input
              id="iv-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="iv-tz">Timezone</Label>
            <select
              id="iv-tz"
              className={selectClass}
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
            >
              {TIME_ZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tzPretty(tz)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Working days</Label>
            <div className="flex flex-wrap gap-3">
              {WEEKDAY_LABELS.map((label, d) => (
                <label key={d} className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={workingDays.includes(d)}
                    onCheckedChange={() => toggleDay(d)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="iv-start">Work start</Label>
              <Input
                id="iv-start"
                type="time"
                value={workStart}
                onChange={(e) => setWorkStart(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="iv-end">Work end</Label>
              <Input
                id="iv-end"
                type="time"
                value={workEnd}
                onChange={(e) => setWorkEnd(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending} className={cn(pending && "opacity-70")}>
              {isEdit ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
