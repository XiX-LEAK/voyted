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
    const existing = await db.smartOfferRule.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Règle non trouvée" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { name, isActive, minAcceptPercent, counterPercent, autoAccept, autoCounter, declinePercent, minPrice, maxPrice } = body;

    const rule = await db.smartOfferRule.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(isActive !== undefined && { isActive }),
        ...(minAcceptPercent !== undefined && { minAcceptPercent }),
        ...(counterPercent !== undefined && { counterPercent }),
        ...(autoAccept !== undefined && { autoAccept }),
        ...(autoCounter !== undefined && { autoCounter }),
        ...(declinePercent !== undefined && { declinePercent }),
        ...(minPrice !== undefined && { minPrice }),
        ...(maxPrice !== undefined && { maxPrice }),
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
    const existing = await db.smartOfferRule.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Règle non trouvée" },
        { status: 404 }
      );
    }

    await db.smartOfferRule.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
