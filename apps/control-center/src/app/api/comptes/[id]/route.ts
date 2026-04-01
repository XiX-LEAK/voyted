import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.vintedAccount.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (typeof body.label === "string" && body.label.trim()) {
    updates.label = body.label.trim();
  }
  if (typeof body.domain === "string" && body.domain.trim()) {
    updates.domain = body.domain.trim();
  }
  if (typeof body.isActive === "boolean") {
    updates.isActive = body.isActive;
  }
  if (typeof body.vintedUsername === "string") {
    updates.vintedUsername = body.vintedUsername || null;
  }
  if (typeof body.vintedUserId === "number") {
    updates.vintedUserId = body.vintedUserId;
  }

  if (body.isPrimary === true) {
    // Unset all other accounts as primary first
    await db.vintedAccount.updateMany({
      where: { userId: session.user.id },
      data: { isPrimary: false },
    });
    updates.isPrimary = true;
  }

  const account = await db.vintedAccount.update({
    where: { id },
    data: updates,
  });

  return NextResponse.json({ account });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.vintedAccount.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
  }

  await db.vintedAccount.delete({ where: { id } });

  // If the deleted account was primary, promote the next one
  if (existing.isPrimary) {
    const next = await db.vintedAccount.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    });
    if (next) {
      await db.vintedAccount.update({
        where: { id: next.id },
        data: { isPrimary: true },
      });
    }
  }

  return NextResponse.json({ success: true });
}
