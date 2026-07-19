import { useState } from "react";
import { CalendarClock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { tzCity, tzDisplay, viewerTz } from "@/lib/tz";
import { useInterviewers } from "../interviewers/queries";
import { InterviewCalendar } from "./interview-calendar";

export function CalendarPage() {
  const { data: interviewers } = useInterviewers();
  const [interviewerId, setInterviewerId] = useState<string>("");
  const selected = interviewers?.find((i) => i.id === interviewerId);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <p className="text-muted-foreground text-sm">
            Times shown in your timezone ({tzDisplay(viewerTz)}). Click an empty slot to
            schedule.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Select value={interviewerId} onValueChange={setInterviewerId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an interviewer…" />
            </SelectTrigger>
            <SelectContent>
              {interviewers?.map((iv) => (
                <SelectItem key={iv.id} value={iv.id}>
                  {iv.name} · {tzCity(iv.timeZone)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selected ? (
        <Card className="flex h-64 flex-col items-center justify-center gap-2 text-center">
          <CalendarClock className="text-muted-foreground/60 size-8" />
          <p className="font-medium">Pick an interviewer to open their calendar</p>
          <p className="text-muted-foreground text-sm">
            You'll see their week in your timezone, with their working hours mapped across.
          </p>
        </Card>
      ) : (
        <InterviewCalendar interviewer={selected} />
      )}
    </div>
  );
}
