import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const schedules = await db.relistSchedule.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ schedules });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { intervalDays, timeOfDay, itemFilter, isActive } = body;

    // Calculate next run date
    const now = new Date();
    const [hours, minutes] = (timeOfDay || "09:00").split(":").map(Number);
    const nextRun = new Date(now);
    nextRun.setDate(nextRun.getDate() + (intervalDays || 7));
    nextRun.setHours(hours, minutes, 0, 0);

    // Upsert: one schedule per user
    const existing = await db.relistSchedule.findFirst({
      where: { userId: session.user.id },
    });

    let schedule;
    if (existing) {
      schedule = await db.relistSchedule.update({
        where: { id: existing.id },
        data: {
          intervalDays: intervalDays ?? existing.intervalDays,
          timeOfDay: timeOfDay ?? existing.timeOfDay,
          itemFilter: itemFilter ?? existing.itemFilter,
          isActive: isActive ?? existing.isActive,
          nextRunAt: isActive !== false ? nextRun : null,
        },
      });
    } else {
      schedule = await db.relistSchedule.create({
        data: {
          userId: session.user.id,
          intervalDays: intervalDays || 7,
          timeOfDay: timeOfDay || "09:00",
          itemFilter: itemFilter || "all",
          isActive: isActive !== false,
          nextRunAt: nextRun,
        },
      });
    }

    return NextResponse.json({ schedule });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
