import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const posts = await db.scheduledPost.findMany({
      where: { userId: session.user.id },
      orderBy: { scheduledAt: "asc" },
    });
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors du chargement du planning" },
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
    const { itemId, title, scheduledAt } = body;

    if (!scheduledAt) {
      return NextResponse.json(
        { error: "Date de publication requise" },
        { status: 400 }
      );
    }

    const post = await db.scheduledPost.create({
      data: {
        userId: session.user.id,
        itemId: itemId ?? null,
        title: title || null,
        scheduledAt: new Date(scheduledAt),
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}
