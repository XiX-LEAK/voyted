import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rules = await db.restockRule.findMany({
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
    const { itemTitle, stockCount, autoRepost } = body;

    if (!itemTitle) {
      return NextResponse.json(
        { error: "Titre de l'article requis" },
        { status: 400 }
      );
    }

    const rule = await db.restockRule.create({
      data: {
        userId: session.user.id,
        itemTitle,
        stockCount: stockCount ?? 1,
        autoRepost: autoRepost ?? true,
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
