import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.VINTED_SERVICE_URL || "http://localhost:4000";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const userId = req.nextUrl.searchParams.get("user_id") || "";
    const username = req.nextUrl.searchParams.get("username") || "";

    if (!userId && !username) {
      return NextResponse.json({ error: "user_id or username is required" }, { status: 400 });
    }

    const params = new URLSearchParams();
    if (userId) params.set("user_id", userId);
    if (username) params.set("username", username);

    const res = await fetch(`${API_URL}/api/account/analyze?${params.toString()}`, {
      headers: { "X-User-ID": session.user.id },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Service unreachable" }, { status: 502 });
  }
}
