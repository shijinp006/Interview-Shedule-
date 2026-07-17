import type { Stage, InterviewStatus } from "@micro-ats/shared";
import { cn } from "@/lib/utils";

const STAGE_DOT: Record<Stage, string> = {
  Applied: "bg-slate-400",
  "Technical Round": "bg-blue-500",
  Offered: "bg-amber-500",
  Hired: "bg-emerald-500",
  Rejected: "bg-rose-400",
};

export function StageDot({ stage, className }: { stage: Stage; className?: string }) {
  return <span className={cn("size-2 shrink-0 rounded-full", STAGE_DOT[stage], className)} />;
}

const STATUS_META: Record<InterviewStatus, { dot: string; pill: string }> = {
  Scheduled: { dot: "bg-blue-500", pill: "bg-blue-50 text-blue-700 ring-blue-200" },
  Completed: { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  Cancelled: { dot: "bg-slate-400", pill: "bg-slate-100 text-slate-500 ring-slate-200" },
};

export function InterviewStatusBadge({ status }: { status: InterviewStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        m.pill,
      )}
    >
      <span className={cn("size-1.5 rounded-full", m.dot)} />
      {status}
    </span>
  );
}
