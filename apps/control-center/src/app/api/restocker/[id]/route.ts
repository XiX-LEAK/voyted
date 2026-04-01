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

  try {
    const existing = await db.restockRule.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Règle non trouvée" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { itemTitle, stockCount, autoRepost, isActive } = body;

    const rule = await db.restockRule.update({
      where: { id },
      data: {
        ...(itemTitle !== undefined && { itemTitle }),
        ...(stockCount !== undefined && { stockCount }),
        ...(autoRepost !== undefined && { autoRepost }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ rule });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
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

  try {
    const existing = await db.restockRule.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Règle non trouvée" },
        { status: 404 }
      );
    }

    await db.restockRule.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
