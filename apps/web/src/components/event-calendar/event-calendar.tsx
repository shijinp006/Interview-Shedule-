"use client"

import { useEffect, useMemo, useState } from "react"
import { RiCalendarCheckLine } from "@remixicon/react"
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AgendaView } from "./agenda-view"
import { CalendarDndProvider } from "./calendar-dnd-context"
import {
  AgendaDaysToShow,
  EventGap,
  EventHeight,
  WeekCellsHeight,
} from "./constants"
import { DayView } from "./day-view"
import { snapToQuarterHour } from "./layout"
import { MonthView } from "./month-view"
import type { CalendarEvent, CalendarView } from "./types"
import { WeekView } from "./week-view"

/** Visible range the parent should fetch Interviews for. */
export type CalendarViewport = {
  view: CalendarView
  start: Date
  end: Date
  anchor: Date
}

export interface EventCalendarProps {
  events?: CalendarEvent[]
  /** Empty-slot click (snapped to 15 minutes). */
  onSlotSelect: (start: Date) => void
  /** Existing event click. */
  onEventSelect: (event: CalendarEvent) => void
  /** DnD move — parent persists (e.g. reschedule). */
  onEventMove: (event: CalendarEvent) => void
  /** Fired whenever the visible range changes (nav / view switch). */
  onViewportChange?: (viewport: CalendarViewport) => void
  className?: string
  initialView?: CalendarView
}

function viewportFor(anchor: Date, view: CalendarView): CalendarViewport {
  if (view === "month") {
    return {
      view,
      anchor,
      start: startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 }),
      end: endOfWeek(endOfMonth(anchor), { weekStartsOn: 0 }),
    }
  }
  if (view === "week") {
    return {
      view,
      anchor,
      start: startOfWeek(anchor, { weekStartsOn: 0 }),
      end: endOfWeek(anchor, { weekStartsOn: 0 }),
    }
  }
  if (view === "agenda") {
    return {
      view,
      anchor,
      start: startOfDay(anchor),
      end: endOfDay(addDays(anchor, AgendaDaysToShow - 1)),
    }
  }
  return {
    view,
    anchor,
    start: startOfDay(anchor),
    end: endOfDay(anchor),
  }
}

/**
 * Controlled time-grid adapter (vendored Origin UI, stripped of generic CRUD).
 * Product booking/actions live in InterviewCalendar — not here.
 */
export function EventCalendar({
  events = [],
  onSlotSelect,
  onEventSelect,
  onEventMove,
  onViewportChange,
  className,
  initialView = "week",
}: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>(initialView)

  useEffect(() => {
    onViewportChange?.(viewportFor(currentDate, view))
  }, [currentDate, view, onViewportChange])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }

      switch (e.key.toLowerCase()) {
        case "m":
          setView("month")
          break
        case "w":
          setView("week")
          break
        case "d":
          setView("day")
          break
        case "a":
          setView("agenda")
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handlePrevious = () => {
    if (view === "month") setCurrentDate(subMonths(currentDate, 1))
    else if (view === "week") setCurrentDate(subWeeks(currentDate, 1))
    else if (view === "day") setCurrentDate(addDays(currentDate, -1))
    else setCurrentDate(addDays(currentDate, -AgendaDaysToShow))
  }

  const handleNext = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, 1))
    else if (view === "week") setCurrentDate(addWeeks(currentDate, 1))
    else if (view === "day") setCurrentDate(addDays(currentDate, 1))
    else setCurrentDate(addDays(currentDate, AgendaDaysToShow))
  }

  const handleEventCreate = (startTime: Date) => {
    onSlotSelect(snapToQuarterHour(startTime))
  }

  const viewTitle = useMemo(() => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy")
    }
    if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 })
      const end = endOfWeek(currentDate, { weekStartsOn: 0 })
      if (isSameMonth(start, end)) return format(start, "MMMM yyyy")
      return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`
    }
    if (view === "day") {
      return (
        <>
          <span className="min-[480px]:hidden" aria-hidden="true">
            {format(currentDate, "MMM d, yyyy")}
          </span>
          <span className="max-[479px]:hidden min-md:hidden" aria-hidden="true">
            {format(currentDate, "MMMM d, yyyy")}
          </span>
          <span className="max-md:hidden">
            {format(currentDate, "EEE MMMM d, yyyy")}
          </span>
        </>
      )
    }
    const start = currentDate
    const end = addDays(currentDate, AgendaDaysToShow - 1)
    if (isSameMonth(start, end)) return format(start, "MMMM yyyy")
    return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`
  }, [currentDate, view])

  return (
    <div
      className="flex flex-col rounded-lg border has-data-[slot=month-view]:flex-1"
      style={
        {
          "--event-height": `${EventHeight}px`,
          "--event-gap": `${EventGap}px`,
          "--week-cells-height": `${WeekCellsHeight}px`,
        } as React.CSSProperties
      }
    >
      <CalendarDndProvider onEventUpdate={onEventMove}>
        <div
          className={cn(
            "flex items-center justify-between p-2 sm:p-4",
            className,
          )}
        >
          <div className="flex items-center gap-1 sm:gap-4">
            <Button
              variant="outline"
              className="max-[479px]:aspect-square max-[479px]:p-0!"
              onClick={() => setCurrentDate(new Date())}
            >
              <RiCalendarCheckLine
                className="min-[480px]:hidden"
                size={16}
                aria-hidden="true"
              />
              <span className="max-[479px]:sr-only">Today</span>
            </Button>
            <div className="flex items-center sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                aria-label="Previous"
              >
                <ChevronLeftIcon size={16} aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                aria-label="Next"
              >
                <ChevronRightIcon size={16} aria-hidden="true" />
              </Button>
            </div>
            <h2 className="text-sm font-semibold sm:text-lg md:text-xl">
              {viewTitle}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1.5 max-[479px]:h-8">
                  <span>
                    <span className="min-[480px]:hidden" aria-hidden="true">
                      {view.charAt(0).toUpperCase()}
                    </span>
                    <span className="max-[479px]:sr-only">
                      {view.charAt(0).toUpperCase() + view.slice(1)}
                    </span>
                  </span>
                  <ChevronDownIcon
                    className="-me-1 opacity-60"
                    size={16}
                    aria-hidden="true"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-32">
                <DropdownMenuItem onClick={() => setView("month")}>
                  Month <DropdownMenuShortcut>M</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView("week")}>
                  Week <DropdownMenuShortcut>W</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView("day")}>
                  Day <DropdownMenuShortcut>D</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView("agenda")}>
                  Agenda <DropdownMenuShortcut>A</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              className="max-[479px]:aspect-square max-[479px]:p-0!"
              onClick={() => handleEventCreate(new Date())}
            >
              <PlusIcon
                className="opacity-60 sm:-ms-1"
                size={16}
                aria-hidden="true"
              />
              <span className="max-sm:sr-only">Schedule</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          {view === "month" && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onEventSelect={onEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {view === "week" && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onEventSelect={onEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {view === "day" && (
            <DayView
              currentDate={currentDate}
              events={events}
              onEventSelect={onEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {view === "agenda" && (
            <AgendaView
              currentDate={currentDate}
              events={events}
              onEventSelect={onEventSelect}
            />
          )}
        </div>
      </CalendarDndProvider>
    </div>
  )
}
