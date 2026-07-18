import { useState } from "react";
import { CalendarDays, Pencil } from "lucide-react";
import type { Interview } from "@micro-ats/shared";
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
import { InterviewStatusBadge } from "@/components/status-badges";
import { formatLocal } from "@/lib/tz";
import { useAllInterviews } from "./queries";
import { InterviewActionsDialog } from "./interview-actions-dialog";

export function InterviewsPage() {
  const { data: interviews, isLoading } = useAllInterviews();
  const [activeInterview, setActiveInterview] = useState<Interview | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Interviews</h1>
          <p className="text-muted-foreground text-sm">
            View, reschedule, cancel, complete, or delete interviews in your local timezone.
          </p>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Interviewer</TableHead>
              <TableHead>Time Window</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground text-center py-6">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && (!interviews || interviews.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground text-center py-6">
                  No interviews scheduled yet.
                </TableCell>
              </TableRow>
            )}
            {interviews?.map((iv) => (
              <TableRow key={iv.id}>
                <TableCell className="font-medium">{iv.candidateName}</TableCell>
                <TableCell>{iv.interviewerName}</TableCell>
                <TableCell className="font-mono text-sm">
                  {formatLocal(iv.start, "EEE, MMM d · HH:mm")} – {formatLocal(iv.end, "HH:mm")}
                </TableCell>
                <TableCell>
                  <InterviewStatusBadge status={iv.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setActiveInterview(iv)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <InterviewActionsDialog
        open={Boolean(activeInterview)}
        onOpenChange={(o) => !o && setActiveInterview(null)}
        interview={activeInterview}
      />
    </div>
  );
}
