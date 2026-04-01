import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rules = await db.smartOfferRule.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ rules });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors du chargement des règles" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, minAcceptPercent, counterPercent, autoAccept, autoCounter, declinePercent, minPrice, maxPrice } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nom requis" },
        { status: 400 }
      );
    }

    const rule = await db.smartOfferRule.create({
      data: {
        userId: session.user.id,
        name,
        minAcceptPercent: minAcceptPercent ?? 80,
        counterPercent: counterPercent ?? 90,
        autoAccept: autoAccept ?? false,
        autoCounter: autoCounter ?? true,
        declinePercent: declinePercent ?? 50,
        minPrice: minPrice ?? null,
        maxPrice: maxPrice ?? null,
      },
    });

    return NextResponse.json({ rule }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la création de la règle" },
      { status: 500 }
    );
  }
}
