import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.VINTED_SERVICE_URL || "http://localhost:4000";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { item_id, price, currency } = await req.json();
    if (!item_id || !price) return NextResponse.json({ error: "item_id and price required" }, { status: 400 });
    const res = await fetch(`${API_URL}/api/items/update/${item_id}`, {
      method: "PATCH",
      headers: { "X-User-ID": session.user.id, "Content-Type": "application/json" },
      body: JSON.stringify({ price, currency: currency || "EUR" }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Service unreachable" }, { status: 502 });
  }
}
