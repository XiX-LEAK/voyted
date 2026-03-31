"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Zap, Bell, ShieldCheck, Sparkles, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const highlights = [
  { icon: Zap, title: "Monitoring temps réel", copy: "Détection sub-seconde sur toutes tes recherches actives." },
  { icon: Bell, title: "Alertes instantanées", copy: "Notifications Discord, live feed et actions compte lié." },
  { icon: ShieldCheck, title: "Dashboard sécurisé", copy: "Toutes les routes internes nécessitent une session authentifiée." },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)
    if (res?.error) setError("Email ou mot de passe incorrect")
    else router.push("/dashboard")
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at top left, rgba(139,92,246,0.16), transparent 32%), radial-gradient(circle at 85% 18%, rgba(245,158,11,0.10), transparent 24%), linear-gradient(180deg, color-mix(in oklab, var(--background) 86%, white 14%), var(--background))" }} />
        <div className="absolute -left-48 top-24 h-80 w-80 rounded-full bg-violet-500/12 blur-3xl" />
      </div>

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background shadow-lg">
            <span className="text-sm font-black leading-none">V</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">Voyted</p>
            <p className="text-sm font-medium text-foreground">Gestion boutique Vinted</p>
          </div>
        </Link>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-7xl items-center gap-10 px-6 pb-10 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="max-w-2xl space-y-8 py-8 lg:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-700 dark:text-violet-300">
            <Sparkles className="h-3.5 w-3.5" />
            Dashboard vendeur
          </div>
          <div className="space-y-5">
            <h1 className="max-w-xl text-5xl font-black tracking-tight text-balance sm:text-6xl">
              Gère ta boutique Vinted depuis un seul endroit.
            </h1>
            <p className="max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
              Stock, ventes, profits, messages — tout en temps réel, synchronisé avec ton compte Vinted.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-lg backdrop-blur-sm">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background">
                  <item.icon className="h-5 w-5" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative">
          <div className="absolute inset-6 rounded-[2rem] bg-slate-950/8 blur-2xl dark:bg-black/20" />
          <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/88 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">Accès sécurisé</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Connexion</h2>
            </div>

            {/* Google */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-12 w-full justify-between rounded-2xl px-5 text-sm font-semibold mb-4"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              <span className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuer avec Google
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-3 my-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Email / password */}
            <form onSubmit={handleCredentials} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              />
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500 pr-10"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-3.5 text-muted-foreground">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Button type="submit" size="lg" disabled={loading} className="h-12 w-full justify-between rounded-2xl px-5 text-sm font-semibold bg-violet-600 hover:bg-violet-500">
                <span>{loading ? "Connexion..." : "Se connecter"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Pas de compte ?{" "}
              <Link href="/register" className="text-violet-500 hover:underline">Créer un compte</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
