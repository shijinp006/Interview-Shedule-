// Public adapter surface for the scheduling feature. Prefer relative imports
// inside this folder; this barrel is for outside consumers only.
export { AgendaView } from "./agenda-view"
export { DayView } from "./day-view"
export { DraggableEvent } from "./draggable-event"
export { DroppableCell } from "./droppable-cell"
export { EventItem } from "./event-item"
export { EventCalendar, type CalendarViewport } from "./event-calendar"
export { MonthView } from "./month-view"
export { WeekView } from "./week-view"
export { CalendarDndProvider, useCalendarDnd } from "./calendar-dnd-context"

export * from "./constants"
export * from "./utils"
export * from "./layout"

export * from "./hooks/use-current-time-indicator"
export * from "./hooks/use-event-visibility"

export type { CalendarEvent, CalendarView, EventColor } from "./types"
