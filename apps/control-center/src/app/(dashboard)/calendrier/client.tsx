"use client";

import { CalendarProvider } from "@/features/calendar/contexts/calendar-context";
import { DndProvider } from "@/features/calendar/contexts/dnd-context";
import { CalendarHeader } from "@/features/calendar/header/calendar-header";
import { CalendarBody } from "@/features/calendar/calendar-body";
import type { IEvent, IUser } from "@/features/calendar/interfaces";

const EMPTY_EVENTS: IEvent[] = [];
const EMPTY_USERS: IUser[] = [];

export default function CalendrierClient() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Calendrier</h1>
        <p className="mt-0.5 text-sm text-foreground/48">
          Planifiez vos publications, suivez vos events et synchronisez avec Google Calendar.
        </p>
      </div>

      <CalendarProvider events={EMPTY_EVENTS} users={EMPTY_USERS} view="month">
        <DndProvider>
          <div className="w-full rounded-xl border border-border/50 overflow-hidden">
            <CalendarHeader />
            <CalendarBody />
          </div>
        </DndProvider>
      </CalendarProvider>
    </div>
  );
}
