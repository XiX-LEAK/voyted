import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const API_URL = process.env.VINTED_SERVICE_URL || "http://localhost:4000";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    // Fetch user's items
    const itemsRes = await fetch(`${API_URL}/api/items/my-items`, {
      headers: { "X-User-ID": session.user.id },
      cache: "no-store",
    });
    if (!itemsRes.ok) {
      return NextResponse.json({ error: "Impossible de récupérer les articles" }, { status: 502 });
    }
    const itemsData = await itemsRes.json();
    const items = itemsData.items || [];

    if (items.length === 0) {
      return NextResponse.json({ success: true, relisted: 0, message: "Aucun article à relister" });
    }

    // Relist each item
    let relisted = 0;
    const errors: string[] = [];

    for (const item of items) {
      try {
        const res = await fetch(`${API_URL}/api/items/relist/${item.id}`, {
          method: "POST",
          headers: { "X-User-ID": session.user.id, "Content-Type": "application/json" },
        });
        if (res.ok) {
          relisted++;
        } else {
          errors.push(`Item ${item.id}: ${res.statusText}`);
        }
      } catch {
        errors.push(`Item ${item.id}: unreachable`);
      }
    }

    // Update the schedule's lastRunAt and nextRunAt
    const schedule = await db.relistSchedule.findFirst({
      where: { userId: session.user.id },
    });
    if (schedule) {
      const now = new Date();
      const [hours, minutes] = schedule.timeOfDay.split(":").map(Number);
      const nextRun = new Date(now);
      nextRun.setDate(nextRun.getDate() + schedule.intervalDays);
      nextRun.setHours(hours, minutes, 0, 0);

      await db.relistSchedule.update({
        where: { id: schedule.id },
        data: { lastRunAt: now, nextRunAt: schedule.isActive ? nextRun : null },
      });
    }

    return NextResponse.json({
      success: true,
      relisted,
      total: items.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch {
    return NextResponse.json({ error: "Service unreachable" }, { status: 502 });
  }
}
