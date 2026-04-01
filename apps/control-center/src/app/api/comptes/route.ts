import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const MAX_ACCOUNTS = 12;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await db.vintedAccount.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ accounts });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { label, domain } = body;

  if (!label || typeof label !== "string" || label.trim().length === 0) {
    return NextResponse.json({ error: "Le label est requis" }, { status: 400 });
  }

  const count = await db.vintedAccount.count({
    where: { userId: session.user.id },
  });

  if (count >= MAX_ACCOUNTS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_ACCOUNTS} comptes atteint` },
      { status: 400 }
    );
  }

  const isFirst = count === 0;

  const account = await db.vintedAccount.create({
    data: {
      userId: session.user.id,
      label: label.trim(),
      domain: domain || "www.vinted.fr",
      isPrimary: isFirst,
      isActive: false,
    },
  });

  return NextResponse.json({ account }, { status: 201 });
}
