"use client";

import { CalendarProvider } from "@/features/calendar/contexts/calendar-context";
import { DndProvider } from "@/features/calendar/contexts/dnd-context";
import { CalendarHeader } from "@/features/calendar/header/calendar-header";
import { CalendarBody } from "@/features/calendar/calendar-body";
import type { IEvent, IUser } from "@/features/calendar/interfaces";

const EMPTY_EVENTS: IEvent[] = [];
const EMPTY_USERS: IUser[] = [];

export default function PlanningClient() {
  return (
    <div className="space-y-4">
      <CalendarProvider events={EMPTY_EVENTS} users={EMPTY_USERS} view="month">
        <DndProvider>
          <div className="w-full border rounded-xl">
            <CalendarHeader />
            <CalendarBody />
          </div>
        </DndProvider>
      </CalendarProvider>
    </div>
  );
}
