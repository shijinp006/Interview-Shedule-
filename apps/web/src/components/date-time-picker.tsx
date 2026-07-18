import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/** Date + time picker: shadcn Calendar for the day, a time input for the clock. */
export function DateTimePicker({
  value,
  onChange,
  fromDate,
}: {
  value: Date;
  onChange: (d: Date) => void;
  /** When set, dates before this are disabled in the calendar. */
  fromDate?: Date;
}) {
  const [open, setOpen] = useState(false);

  function setDatePart(day?: Date) {
    if (!day) return;
    const next = new Date(value);
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    onChange(next);
  }

  function setTimePart(hhmm: string) {
    const [h, m] = hhmm.split(":");
    const next = new Date(value);
    next.setHours(Number(h) || 0, Number(m) || 0, 0, 0);
    onChange(next);
  }

  const isPast = fromDate !== undefined && value < fromDate;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start gap-2 font-normal${
            isPast ? " border-destructive text-destructive" : ""
          }`}
        >
          <CalendarIcon className="size-4 opacity-70" />
          <span className="font-mono text-sm">{format(value, "EEE, MMM d · HH:mm")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={setDatePart}
          defaultMonth={value}
          disabled={fromDate ? { before: fromDate } : undefined}
          autoFocus
        />
        <div className="flex items-center gap-2 border-t p-3">
          <span className="text-muted-foreground text-sm">Time</span>
          <Input
            type="time"
            value={format(value, "HH:mm")}
            onChange={(e) => setTimePart(e.target.value)}
            className="w-auto"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
