import {
  addHours,
  areIntervalsOverlapping,
  differenceInMinutes,
  getHours,
  getMinutes,
  isSameDay,
  startOfDay,
} from "date-fns"

import { StartHour, WeekCellsHeight } from "./constants"
import type { CalendarEvent } from "./types"
import { isMultiDayEvent } from "./utils"

export type PositionedEvent = {
  event: CalendarEvent
  top: number
  height: number
  left: number
  width: number
  zIndex: number
}

/** Snap a wall-clock Date to the nearest 15-minute boundary. */
export function snapToQuarterHour(date: Date): Date {
  const result = new Date(date)
  const minutes = result.getMinutes()
  const remainder = minutes % 15
  if (remainder !== 0) {
    if (remainder < 7.5) {
      result.setMinutes(minutes - remainder)
    } else {
      result.setMinutes(minutes + (15 - remainder))
    }
  }
  result.setSeconds(0, 0)
  return result
}

/**
 * Map a fractional hour (e.g. 9.37 from a drop target) to hours + quarter-hour
 * minutes. Shared by DnD over/end handlers.
 */
export function snapFractionalHour(time: number): { hours: number; minutes: number } {
  const hours = Math.floor(time)
  const fractionalHour = time - hours
  let minutes = 0
  if (fractionalHour < 0.125) minutes = 0
  else if (fractionalHour < 0.375) minutes = 15
  else if (fractionalHour < 0.625) minutes = 30
  else minutes = 45
  return { hours, minutes }
}

/**
 * Column-pack timed (non-all-day, non-multi-day) events for a single day into
 * absolute top/height/left/width positions for the week/day time grid.
 */
export function positionTimedEvents(
  day: Date,
  events: CalendarEvent[],
): PositionedEvent[] {
  const dayEvents = events.filter((event) => {
    if (event.allDay || isMultiDayEvent(event)) return false
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    return (
      isSameDay(day, eventStart) ||
      isSameDay(day, eventEnd) ||
      (eventStart < day && eventEnd > day)
    )
  })

  const sortedEvents = [...dayEvents].sort((a, b) => {
    const aStart = new Date(a.start)
    const bStart = new Date(b.start)
    if (aStart < bStart) return -1
    if (aStart > bStart) return 1
    const aDuration = differenceInMinutes(new Date(a.end), aStart)
    const bDuration = differenceInMinutes(new Date(b.end), bStart)
    return bDuration - aDuration
  })

  const positionedEvents: PositionedEvent[] = []
  const dayStart = startOfDay(day)
  const columns: { event: CalendarEvent; end: Date }[][] = []

  sortedEvents.forEach((event) => {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)

    const adjustedStart = isSameDay(day, eventStart) ? eventStart : dayStart
    const adjustedEnd = isSameDay(day, eventEnd) ? eventEnd : addHours(dayStart, 24)

    const startHour = getHours(adjustedStart) + getMinutes(adjustedStart) / 60
    const endHour = getHours(adjustedEnd) + getMinutes(adjustedEnd) / 60
    const top = (startHour - StartHour) * WeekCellsHeight
    const height = (endHour - startHour) * WeekCellsHeight

    let columnIndex = 0
    let placed = false

    while (!placed) {
      const col = columns[columnIndex] || []
      if (col.length === 0) {
        columns[columnIndex] = col
        placed = true
      } else {
        const overlaps = col.some((c) =>
          areIntervalsOverlapping(
            { start: adjustedStart, end: adjustedEnd },
            { start: new Date(c.event.start), end: new Date(c.event.end) },
          ),
        )
        if (!overlaps) {
          placed = true
        } else {
          columnIndex++
        }
      }
    }

    const currentColumn = columns[columnIndex] || []
    columns[columnIndex] = currentColumn
    currentColumn.push({ event, end: adjustedEnd })

    const width = columnIndex === 0 ? 1 : 1 - columnIndex * 0.1
    const left = columnIndex === 0 ? 0 : columnIndex * 0.1

    positionedEvents.push({
      event,
      top,
      height,
      left,
      width,
      zIndex: 10 + columnIndex,
    })
  })

  return positionedEvents
}
