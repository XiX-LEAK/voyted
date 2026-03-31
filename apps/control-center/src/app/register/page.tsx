"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || "Erreur"); setLoading(false); return }
    await signIn("credentials", { email, password, callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-[2rem] border border-border/70 bg-card/88 p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="text-2xl font-bold mb-6">Créer un compte</h1>
        <Button type="button" variant="outline" size="lg" className="h-12 w-full justify-between rounded-2xl px-5 text-sm font-semibold mb-4"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
          <span className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" className="h-4 w-4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continuer avec Google
          </span>
          <ArrowRight className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-border" /><span className="text-xs text-muted-foreground">ou</span><div className="h-px flex-1 bg-border" />
        </div>
        <form onSubmit={handleRegister} className="space-y-3">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500" />
          <div className="relative">
            <input type={showPwd ? "text" : "password"} placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500 pr-10" />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-3.5 text-muted-foreground">
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button type="submit" size="lg" disabled={loading} className="h-12 w-full rounded-2xl px-5 text-sm font-semibold bg-violet-600 hover:bg-violet-500">
            {loading ? "Création..." : "Créer mon compte"}
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Déjà un compte ? <Link href="/login" className="text-violet-500 hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
