import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();

    // Verify ownership
    const schedule = await db.relistSchedule.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!schedule) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { intervalDays, timeOfDay, itemFilter, isActive } = body;

    // Recalculate next run if toggling on or changing interval
    let nextRunAt = schedule.nextRunAt;
    if (isActive === true || intervalDays || timeOfDay) {
      const now = new Date();
      const [hours, minutes] = (timeOfDay || schedule.timeOfDay).split(":").map(Number);
      nextRunAt = new Date(now);
      nextRunAt.setDate(nextRunAt.getDate() + (intervalDays || schedule.intervalDays));
      nextRunAt.setHours(hours, minutes, 0, 0);
    }
    if (isActive === false) nextRunAt = null;

    const updated = await db.relistSchedule.update({
      where: { id },
      data: {
        ...(intervalDays !== undefined && { intervalDays }),
        ...(timeOfDay !== undefined && { timeOfDay }),
        ...(itemFilter !== undefined && { itemFilter }),
        ...(isActive !== undefined && { isActive }),
        nextRunAt,
      },
    });

    return NextResponse.json({ schedule: updated });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;

    const schedule = await db.relistSchedule.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!schedule) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.relistSchedule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
