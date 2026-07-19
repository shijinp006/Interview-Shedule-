"use client"

import React, { useMemo } from "react"
import {
  addHours,
  eachDayOfInterval,
  eachHourOfInterval,
  endOfWeek,
  format,
  getHours,
  isBefore,
  isSameDay,
  isToday,
  startOfDay,
  startOfWeek,
} from "date-fns"

import { cn } from "@/lib/utils"
import { EndHour, StartHour } from "./constants"
import { DraggableEvent } from "./draggable-event"
import { DroppableCell } from "./droppable-cell"
import { EventItem } from "./event-item"
import { useCurrentTimeIndicator } from "./hooks/use-current-time-indicator"
import { positionTimedEvents } from "./layout"
import type { CalendarEvent } from "./types"
import { isMultiDayEvent } from "./utils"

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventSelect: (event: CalendarEvent) => void
  onEventCreate: (startTime: Date) => void
}

export function WeekView({
  currentDate,
  events,
  onEventSelect,
  onEventCreate,
}: WeekViewProps) {
  const days = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: weekStart, end: weekEnd })
  }, [currentDate])

  const weekStart = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 0 }),
    [currentDate]
  )

  const hours = useMemo(() => {
    const dayStart = startOfDay(currentDate)
    return eachHourOfInterval({
      start: addHours(dayStart, StartHour),
      end: addHours(dayStart, EndHour - 1),
    })
  }, [currentDate])

  // Get all-day events and multi-day events for the week
  const allDayEvents = useMemo(() => {
    return events
      .filter((event) => {
        // Include explicitly marked all-day events or multi-day events
        return event.allDay || isMultiDayEvent(event)
      })
      .filter((event) => {
        const eventStart = new Date(event.start)
        const eventEnd = new Date(event.end)
        return days.some(
          (day) =>
            isSameDay(day, eventStart) ||
            isSameDay(day, eventEnd) ||
            (day > eventStart && day < eventEnd)
        )
      })
  }, [events, days])

  const processedDayEvents = useMemo(
    () => days.map((day) => positionTimedEvents(day, events)),
    [days, events],
  )

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    onEventSelect(event)
  }

  const showAllDaySection = allDayEvents.length > 0
  const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(
    currentDate,
    "week"
  )

  return (
    <div data-slot="week-view" className="flex h-full flex-col overflow-x-auto">
      <div className="min-w-[700px] md:min-w-0 flex flex-col flex-1">
        <div className="bg-background/80 border-border/70 sticky top-0 z-30 grid grid-cols-8 border-b backdrop-blur-md">
          <div className="text-muted-foreground/70 py-2 text-center text-sm">
            <span className="max-[479px]:sr-only">{format(new Date(), "O")}</span>
          </div>
          {days.map((day) => (
            <div
              key={day.toString()}
              className="data-today:text-foreground text-muted-foreground/70 py-2 text-center text-sm data-today:font-medium"
              data-today={isToday(day) || undefined}
            >
              <span className="sm:hidden" aria-hidden="true">
                {format(day, "E")[0]} {format(day, "d")}
              </span>
              <span className="max-sm:hidden">{format(day, "EEE dd")}</span>
            </div>
          ))}
        </div>

        {showAllDaySection && (
          <div className="border-border/70 bg-muted/50 border-b">
            <div className="grid grid-cols-8">
              <div className="border-border/70 relative border-r">
                <span className="text-muted-foreground/70 absolute bottom-0 left-0 h-6 w-16 max-w-full pe-2 text-right text-[10px] sm:pe-4 sm:text-xs">
                  All day
                </span>
              </div>
              {days.map((day, dayIndex) => {
                const dayAllDayEvents = allDayEvents.filter((event) => {
                  const eventStart = new Date(event.start)
                  const eventEnd = new Date(event.end)
                  return (
                    isSameDay(day, eventStart) ||
                    (day > eventStart && day < eventEnd) ||
                    isSameDay(day, eventEnd)
                  )
                })

                return (
                  <div
                    key={day.toString()}
                    className="border-border/70 relative border-r p-1 last:border-r-0"
                    data-today={isToday(day) || undefined}
                  >
                    {dayAllDayEvents.map((event) => {
                      const eventStart = new Date(event.start)
                      const eventEnd = new Date(event.end)
                      const isFirstDay = isSameDay(day, eventStart)
                      const isLastDay = isSameDay(day, eventEnd)

                      // Check if this is the first day in the current week view
                      const isFirstVisibleDay =
                        dayIndex === 0 && isBefore(eventStart, weekStart)
                      const shouldShowTitle = isFirstDay || isFirstVisibleDay

                      return (
                        <EventItem
                          key={`spanning-${event.id}`}
                          onClick={(e) => handleEventClick(event, e)}
                          event={event}
                          view="month"
                          isFirstDay={isFirstDay}
                          isLastDay={isLastDay}
                        >
                          {/* Show title if it's the first day of the event or the first visible day in the week */}
                          <div
                            className={cn(
                              "truncate",
                              !shouldShowTitle && "invisible"
                            )}
                            aria-hidden={!shouldShowTitle}
                          >
                            {event.title}
                          </div>
                        </EventItem>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid flex-1 grid-cols-8 overflow-hidden">
          <div className="border-border/70 grid auto-cols-fr border-r">
            {hours.map((hour, index) => (
              <div
                key={hour.toString()}
                className="border-border/70 relative min-h-[var(--week-cells-height)] border-b last:border-b-0"
              >
                {index > 0 && (
                  <span className="bg-background text-muted-foreground/70 absolute -top-3 left-0 flex h-6 w-16 max-w-full items-center justify-end pe-2 text-[10px] sm:pe-4 sm:text-xs">
                    {format(hour, "h a")}
                  </span>
                )}
              </div>
            ))}
          </div>

          {days.map((day, dayIndex) => (
            <div
              key={day.toString()}
              className="border-border/70 relative grid auto-cols-fr border-r last:border-r-0"
              data-today={isToday(day) || undefined}
            >
              {/* Positioned events */}
              {(processedDayEvents[dayIndex] ?? []).map((positionedEvent) => (
                <div
                  key={positionedEvent.event.id}
                  className="absolute z-10 px-0.5"
                  style={{
                    top: `${positionedEvent.top}px`,
                    height: `${positionedEvent.height}px`,
                    left: `${positionedEvent.left * 100}%`,
                    width: `${positionedEvent.width * 100}%`,
                    zIndex: positionedEvent.zIndex,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="h-full w-full">
                    <DraggableEvent
                      event={positionedEvent.event}
                      view="week"
                      onClick={(e) => handleEventClick(positionedEvent.event, e)}
                      showTime
                      height={positionedEvent.height}
                    />
                  </div>
                </div>
              ))}

              {/* Current time indicator - only show for today's column */}
              {currentTimeVisible && isToday(day) && (
                <div
                  className="pointer-events-none absolute right-0 left-0 z-20"
                  style={{ top: `${currentTimePosition}%` }}
                >
                  <div className="relative flex items-center">
                    <div className="bg-signal absolute -left-1 h-2 w-2 rounded-full"></div>
                    <div className="bg-signal h-[2px] w-full"></div>
                  </div>
                </div>
              )}
              {hours.map((hour) => {
                const hourValue = getHours(hour)
                return (
                  <div
                    key={hour.toString()}
                    className="border-border/70 relative min-h-[var(--week-cells-height)] border-b last:border-b-0"
                  >
                    {/* Quarter-hour intervals */}
                    {[0, 1, 2, 3].map((quarter) => {
                      const quarterHourTime = hourValue + quarter * 0.25
                      return (
                        <DroppableCell
                          key={`${hour.toString()}-${quarter}`}
                          id={`week-cell-${day.toISOString()}-${quarterHourTime}`}
                          date={day}
                          time={quarterHourTime}
                          className={cn(
                            "absolute h-[calc(var(--week-cells-height)/4)] w-full",
                            quarter === 0 && "top-0",
                            quarter === 1 &&
                              "top-[calc(var(--week-cells-height)/4)]",
                            quarter === 2 &&
                              "top-[calc(var(--week-cells-height)/4*2)]",
                            quarter === 3 &&
                              "top-[calc(var(--week-cells-height)/4*3)]"
                          )}
                          onClick={() => {
                            const startTime = new Date(day)
                            startTime.setHours(hourValue)
                            startTime.setMinutes(quarter * 15)
                            onEventCreate(startTime)
                          }}
                        />
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
