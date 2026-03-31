import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: "Email déjà utilisé" }, { status: 400 })
  const hashed = await bcrypt.hash(password, 10)
  await db.user.create({ data: { email, password: hashed } })
  return NextResponse.json({ success: true })
}
