import Link from "next/link";
import { ArrowRight, RefreshCw, TrendingUp, Package, MessageSquare, BarChart3, FileText, Zap, Check, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 shadow-lg shadow-violet-500/25">
              <span className="text-sm font-black">V</span>
            </div>
            <span className="text-lg font-bold">Voyted</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <Link href="#features" className="hover:text-white transition-colors">Fonctionnalités</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Tarifs</Link>
            <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">Se connecter</Link>
            <Link href="/register" className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500 transition-colors">
              Créer mon compte <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0" style={{background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.15), transparent 60%)"}} />
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-violet-600/5 blur-3xl" />
          <div className="absolute top-20 right-1/4 h-64 w-64 rounded-full bg-violet-400/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-400">
            ✨ L&apos;Outil Vinted pour les Pros
          </div>
          <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Domine Vinted.<br />
            <span className="text-violet-400">Maximise tes profits.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-400 leading-relaxed">
            Arrête de perdre de l&apos;argent avec des tableaux Excel. Automatise ta gestion, suis tes marges réelles et scale ton business d&apos;achat-revente.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/register" className="flex items-center gap-2 rounded-2xl bg-violet-600 px-8 py-3.5 text-base font-bold hover:bg-violet-500 transition-colors shadow-lg shadow-violet-500/25">
              Commencer gratuitement <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-sm text-zinc-500">+1300 vendeurs pro nous font confiance</p>
          </div>
        </div>

        {/* Animated ticker */}
        <div className="mt-16 overflow-hidden">
          <div className="flex animate-[slide_20s_linear_infinite] gap-4 whitespace-nowrap">
            {["T-shirt Nike +8€", "Jean Levi's +18€", "Veste Carhartt +32€", "Sneakers Vans +12€", "Pull Ralph Lauren +25€",
              "T-shirt Nike +8€", "Jean Levi's +18€", "Veste Carhartt +32€", "Sneakers Vans +12€", "Pull Ralph Lauren +25€"].map((item, i) => (
              <span key={i} className="rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Live activity feed */}
      <section className="py-8">
        <div className="mx-auto max-w-2xl px-6">
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-900">
            {[
              { icon: "💰", title: "Nouvelle vente", desc: "T-shirt Nike vendu +15€", time: "à l'instant" },
              { icon: "📦", title: "Colis expédié", desc: "Commande #4829 en route", time: "il y a 18m" },
              { icon: "📊", title: "Marge calculée", desc: "+32€ sur Veste Carhartt", time: "il y a 15m" },
              { icon: "✅", title: "Import terminé", desc: "12 articles synchronisés", time: "il y a 2m" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-white/5 px-5 py-3.5 last:border-0">
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
                <span className="text-xs text-zinc-600">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-400">CONÇU POUR LES VENDEURS VINTED</p>
            <h2 className="text-4xl font-black tracking-tight">L&apos;arsenal ultime</h2>
            <p className="mt-4 text-zinc-400">Tout ce qu&apos;il te faut pour dominer Vinted</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: RefreshCw, title: "Synchronisation Token", desc: "Récupère photos, statuts et bordereaux en temps réel. Connecte ton compte en 30 secondes." },
              { icon: TrendingUp, title: "Calcul de Marge", desc: "Frais Vinted, boosts et charges sociales inclus. Vois tes vrais profits article par article." },
              { icon: FileText, title: "Factures & Documents", desc: "Ventes et achats. Conformes et horodatés. PDF prêts à envoyer à ton comptable." },
              { icon: Package, title: "Gestion de Stock", desc: "SKU, lots et décrémentation automatique. Plus jamais de vente en double." },
              { icon: BarChart3, title: "Analytique Globale", desc: "Visualise tes ventes à travers l'Europe. Dashboard temps réel." },
              { icon: MessageSquare, title: "Auto-Reply", desc: "Réponds automatiquement aux acheteurs avec tes templates personnalisés." },
              { icon: Zap, title: "Auto-Relist", desc: "Remets tes articles en avant automatiquement. Programme le relist à l'heure que tu veux." },
              { icon: Package, title: "Suivi Colis", desc: "Suis tes envois en temps réel. En attente → Expédié → Livré, tout centralisé." },
              { icon: TrendingUp, title: "10h gagnées/mois", desc: "Automatise ta gestion de A à Z. Concentre-toi sur l'achat-revente, pas l'admin." },
            ].map((feature, i) => (
              <div key={i} className="group rounded-2xl border border-white/5 bg-zinc-900 p-6 hover:border-violet-500/30 hover:bg-zinc-900/80 transition-all">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-white/5">
        <div className="mx-auto max-w-4xl px-6">
          <p className="mb-10 text-center text-xs font-semibold uppercase tracking-widest text-zinc-500">Chiffres clés • 30 derniers jours</p>
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-black text-violet-400">19.3k</p>
              <p className="mt-1 text-sm text-zinc-500">Ventes synchronisées</p>
            </div>
            <div>
              <p className="text-4xl font-black text-violet-400">1,3M€</p>
              <p className="mt-1 text-sm text-zinc-500">Flux financiers gérés</p>
            </div>
            <div>
              <p className="text-4xl font-black text-violet-400">+1300</p>
              <p className="mt-1 text-sm text-zinc-500">Vendeurs pro</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-black tracking-tight">Tarifs</h2>
            <p className="mt-4 text-zinc-400">Choisis le plan adapté à ton activité</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Free */}
            <div className="rounded-2xl border border-white/5 bg-zinc-900 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">GRATUIT</p>
              <p className="mt-3 text-4xl font-black">0€ <span className="text-lg font-normal text-zinc-500">/mois</span></p>
              <p className="mt-2 text-sm text-zinc-500">Parfait pour tester et gérer tes premières ventes</p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {["1 compte Vinted", "Sync token", "Ventes & achats", "Marge réelle", "Factures PDF"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-zinc-400"><Check className="h-4 w-4 text-violet-400 flex-shrink-0" />{f}</li>
                ))}
              </ul>
              <Link href="/register" className="mt-8 flex w-full items-center justify-center rounded-xl border border-white/10 py-3 text-sm font-semibold hover:bg-white/5 transition-colors">
                Commencer gratuitement
              </Link>
            </div>
            {/* Starter */}
            <div className="relative rounded-2xl border border-violet-500/50 bg-zinc-900 p-6">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-0.5 text-xs font-bold">Recommandé</div>
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">STARTER</p>
              <p className="mt-3 text-4xl font-black">29€ <span className="text-lg font-normal text-zinc-500">/mois</span></p>
              <p className="mt-2 text-sm text-zinc-500">L&apos;essentiel pour gérer ta boutique efficacement</p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {["3 comptes Vinted", "Sync illimitée", "Marge réelle complète", "Stock & inventaire SKU", "Exports comptables", "Support standard"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-zinc-400"><Check className="h-4 w-4 text-violet-400 flex-shrink-0" />{f}</li>
                ))}
              </ul>
              <Link href="/register" className="mt-8 flex w-full items-center justify-center rounded-xl bg-violet-600 py-3 text-sm font-bold hover:bg-violet-500 transition-colors">
                Choisir Starter
              </Link>
            </div>
            {/* Pro */}
            <div className="rounded-2xl border border-white/5 bg-zinc-900 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">PRO</p>
              <p className="mt-3 text-4xl font-black">49€ <span className="text-lg font-normal text-zinc-500">/mois</span></p>
              <p className="mt-2 text-sm text-zinc-500">Tout pour automatiser et maximiser ta rentabilité</p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {["10 comptes Vinted", "Tout Starter inclus", "Sync automatique continue", "Auto-relist & auto-reply", "Multi-sociétés (3)", "Support prioritaire"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-zinc-400"><Check className="h-4 w-4 text-violet-400 flex-shrink-0" />{f}</li>
                ))}
              </ul>
              <Link href="/register" className="mt-8 flex w-full items-center justify-center rounded-xl border border-white/10 py-3 text-sm font-semibold hover:bg-white/5 transition-colors">
                Passer au Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="mb-12 text-center text-4xl font-black">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              { q: "Qu'est-ce que Voyted ?", a: "Voyted est un outil de gestion complet pour les vendeurs Vinted. Il permet de synchroniser vos ventes, calculer vos marges réelles, gérer votre stock et automatiser vos tâches répétitives." },
              { q: "Comment sont synchronisées mes ventes Vinted ?", a: "Via votre token Vinted (récupéré en quelques secondes depuis vos cookies navigateur). Pas d'extension requise. La sync se fait toutes les heures ou manuellement." },
              { q: "Mes données sont-elles sécurisées ?", a: "Oui. Vos tokens sont chiffrés et stockés localement. Nous n'avons accès qu'aux données nécessaires au fonctionnement de l'app." },
              { q: "Y a-t-il une offre gratuite ?", a: "Oui, le plan gratuit permet de gérer jusqu'à 15 ventes, 10 achats et 10 boosts par mois. Parfait pour démarrer." },
              { q: "Mon expert-comptable peut-il accéder à mes données ?", a: "Oui, vous pouvez exporter toutes vos données en PDF ou CSV, conformes aux exigences fiscales françaises et belges." },
            ].map((item, i) => (
              <details key={i} className="group rounded-2xl border border-white/5 bg-zinc-900">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-medium">
                  {item.q}
                  <span className="text-zinc-400 group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="px-5 pb-4 text-sm text-zinc-400 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-4xl font-black tracking-tight text-balance">Prends de l&apos;avance sur les autres.</h2>
          <p className="mt-4 text-zinc-400">Rejoins plus de 1300 vendeurs qui ont déjà automatisé leur gestion Vinted.</p>
          <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-8 py-4 text-base font-bold hover:bg-violet-500 transition-colors shadow-lg shadow-violet-500/25">
            Commencer gratuitement <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-600">
              <span className="text-xs font-black">V</span>
            </div>
            <span className="font-semibold">Voyted</span>
          </div>
          <p className="text-sm text-zinc-600">© 2026 Voyted. Tous droits réservés.</p>
          <div className="flex gap-6 text-sm text-zinc-600">
            <Link href="#" className="hover:text-white transition-colors">CGU</Link>
            <Link href="#" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="mailto:contact@voyted.app" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>


    </div>
  );
}
