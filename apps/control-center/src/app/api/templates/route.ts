import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const templates = await db.messageTemplate.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ templates });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors du chargement des templates" },
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
    const { name, category, message } = body;

    if (!name || !message) {
      return NextResponse.json(
        { error: "Nom et message requis" },
        { status: 400 }
      );
    }

    const template = await db.messageTemplate.create({
      data: {
        userId: session.user.id,
        name,
        category: category || "general",
        message,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la création du template" },
      { status: 500 }
    );
  }
}
