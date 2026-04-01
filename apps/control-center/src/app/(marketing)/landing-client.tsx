"use client";

import { useState, useRef, forwardRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Radio,
  BarChart3,
  Package,
  FileText,
  Check,
  ChevronDown,
  Globe,
  Clock,
  Calculator,
  Star,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";
import { Marquee } from "@/components/ui/marquee";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { BorderBeam } from "@/components/ui/border-beam";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Particles } from "@/components/ui/particles";

/* ─────────────────────── tiny helpers ─────────────────────── */

function ProductCard({
  name,
  profit,
}: {
  name: string;
  profit: string;
}) {
  return (
    <div className="mx-2 flex w-44 shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-neutral-900/60 px-4 py-3 backdrop-blur-sm">
      <ShoppingBag className="h-5 w-5 text-violet-400 shrink-0" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white/80">{name}</p>
        <p className="text-xs font-semibold text-violet-500">{profit}</p>
      </div>
    </div>
  );
}

function NotifCard({
  icon,
  text,
}: {
  icon: string;
  text: string;
}) {
  return (
    <div className="mx-2 flex w-52 shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-neutral-900/60 px-4 py-3 backdrop-blur-sm">
      <span className="text-lg">{icon}</span>
      <p className="truncate text-sm text-white/80">{text}</p>
    </div>
  );
}

function InvoiceCard({
  id,
  amount,
}: {
  id: string;
  amount: string;
}) {
  return (
    <div className="mx-2 flex w-48 shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-neutral-900/60 px-4 py-3 backdrop-blur-sm">
      <FileText className="h-5 w-5 text-violet-400 shrink-0" />
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-white/60">{id}</p>
        <p className="text-sm font-semibold text-white/80">{amount}</p>
      </div>
    </div>
  );
}

/* ─── Circle node for AnimatedBeam ─── */
const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => (
  <div
    ref={ref}
    className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/10 bg-neutral-900 p-2 shadow-[0_0_20px_-12px_rgba(139,92,246,0.5)] ${className ?? ""}`}
  >
    {children}
  </div>
));
Circle.displayName = "Circle";

/* ─── AnimatedBeam demo ─── */
function BeamDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fromRef1 = useRef<HTMLDivElement>(null);
  const fromRef2 = useRef<HTMLDivElement>(null);
  const fromRef3 = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden p-6"
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col gap-6">
          <Circle ref={fromRef1}>
            <span className="text-sm">💶</span>
          </Circle>
          <Circle ref={fromRef2}>
            <span className="text-sm">📦</span>
          </Circle>
          <Circle ref={fromRef3}>
            <span className="text-sm">🏷️</span>
          </Circle>
        </div>
        <Circle ref={toRef} className="h-16 w-16">
          <Calculator className="h-6 w-6 text-violet-400" />
        </Circle>
      </div>
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={fromRef1}
        toRef={toRef}
        gradientStartColor="#8b5cf6"
        gradientStopColor="#a78bfa"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={fromRef2}
        toRef={toRef}
        gradientStartColor="#8b5cf6"
        gradientStopColor="#a78bfa"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={fromRef3}
        toRef={toRef}
        gradientStartColor="#8b5cf6"
        gradientStopColor="#a78bfa"
      />
    </div>
  );
}

/* ─── Icon Box for bottom CTA marquee ─── */
function IconBox({
  children,
  glow,
}: {
  children: React.ReactNode;
  glow: string;
}) {
  return (
    <div
      className="mx-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-neutral-900/80"
      style={{ boxShadow: `0 0 30px -5px ${glow}` }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════ PRICING DATA ═══════════════════ */

const plans = [
  {
    name: "GRATUIT",
    price: { monthly: "0", yearly: "0" },
    description: "Pour commencer sur Vinted",
    features: [
      "Jusqu'à 50 articles",
      "Calcul de marge basique",
      "Statistiques simples",
      "Support communautaire",
    ],
    recommended: false,
  },
  {
    name: "STARTER",
    price: { monthly: "19", yearly: "15" },
    description: "Pour les vendeurs réguliers",
    features: [
      "Articles illimités",
      "Synchronisation automatique",
      "Calcul de marge avancé",
      "Génération de factures",
      "Statistiques détaillées",
      "Support prioritaire",
    ],
    recommended: true,
  },
  {
    name: "PRO",
    price: { monthly: "39", yearly: "31" },
    description: "Pour les professionnels",
    features: [
      "Tout de Starter",
      "Multi-boutiques",
      "API avancée",
      "Export comptable",
      "Analytique complète",
      "Support dédié 24/7",
    ],
    recommended: false,
  },
];

const faqData = [
  {
    q: "C'est quoi Voyted exactement ?",
    a: "Voyted est un tableau de bord tout-en-un pour les vendeurs Vinted. Il te permet de suivre tes ventes, calculer tes marges, gérer ton stock et générer tes factures automatiquement.",
  },
  {
    q: "Est-ce que Voyted est autorisé par Vinted ?",
    a: "Voyted utilise ton token de session pour synchroniser tes données. Nous ne modifions rien sur ton compte Vinted, nous lisons uniquement les informations nécessaires au fonctionnement du dashboard.",
  },
  {
    q: "Comment fonctionne la synchronisation ?",
    a: "Tu colles ton token Vinted dans les paramètres, et Voyted synchronise automatiquement tes articles, ventes et transactions. La synchronisation est quasi-instantanée.",
  },
  {
    q: "Puis-je annuler mon abonnement à tout moment ?",
    a: "Oui, absolument. Tu peux annuler ton abonnement à tout moment depuis les paramètres de ton compte. Aucun engagement, aucune pénalité.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Tes données sont chiffrées en transit et au repos. Nous ne partageons jamais tes informations avec des tiers. Ton token est stocké de manière sécurisée et n'est jamais exposé.",
  },
];

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */

export default function LandingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );

  return (
    <div className="dark relative flex min-h-screen flex-col bg-background text-white overflow-hidden">
      {/* Full-page floating particles background — same as Vinteer */}
      <Particles
        className="pointer-events-none absolute inset-0 -z-10"
        quantity={75}
        ease={70}
        size={0.4}
        staticity={40}
        color="#ffffff"
      />

      {/* ═══════════════════ HEADER ═══════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-background/70 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Voyted</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-sm text-white/50 hover:text-white/80 transition-colors"
            >
              Fonctionnalités
            </a>
            <a
              href="#pricing"
              className="text-sm text-white/50 hover:text-white/80 transition-colors"
            >
              Tarifs
            </a>
            <a
              href="#faq"
              className="text-sm text-white/50 hover:text-white/80 transition-colors"
            >
              FAQ
            </a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Se connecter
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
          >
            Créer mon compte
          </Link>
        </div>
      </nav>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-40 pb-20 md:pt-52 md:pb-32">
        {/* Glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/[0.04] rounded-full blur-[120px]" />

        {/* Badge */}
        <div className="group mb-8 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
          <AnimatedShinyText className="text-sm">
            ✨ Dashboard vendeur Vinted
          </AnimatedShinyText>
          <ArrowRight className="ml-2 h-3.5 w-3.5 text-white/40" />
        </div>

        {/* Headline */}
        <h1 className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] tracking-[-0.05em]">
          <span className="block">Gère ta boutique</span>
          <span className="block text-violet-400">Vinted.</span>
        </h1>

        <p className="mt-6 max-w-xl text-center text-base md:text-lg text-slate-400">
          Synchronise tes articles, calcule tes marges, génère tes factures et
          analyse tes performances — le tout en un seul dashboard.
        </p>

        {/* CTA */}
        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-violet-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-500/90 transition-all"
        >
          Commencer gratuitement
          <ArrowRight className="h-4 w-4" />
        </Link>

        {/* Social proof */}
        <div className="mt-10 flex items-center gap-4">
          <div className="flex -space-x-2">
            {["bg-violet-500", "bg-fuchsia-500", "bg-indigo-500", "bg-purple-500", "bg-pink-500"].map(
              (bg, i) => (
                <div
                  key={i}
                  className={`h-8 w-8 rounded-full border-2 border-[#0a0a0f] ${bg} flex items-center justify-center text-[10px] font-bold text-white`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              )
            )}
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-3.5 w-3.5 fill-violet-400 text-violet-400"
              />
            ))}
          </div>
          <p className="text-sm text-slate-400">
            Rejoins <span className="font-semibold text-white">+500</span>{" "}
            vendeurs pro
          </p>
        </div>

        {/* Dashboard preview — same style as Vinteer */}
        <div className="relative isolate mt-12 lg:mt-10 w-full max-w-5xl rounded-xl [perspective:2000px] after:content-[''] after:pointer-events-none after:absolute after:inset-0 after:z-50 after:rounded-[inherit] after:[background:linear-gradient(to_top,#0a0a0a_30%,transparent)]">
          {/* Glow behind image */}
          <div className="absolute inset-0 z-0 opacity-0 [background-image:linear-gradient(to_bottom,rgb(139_92_246),rgb(139_92_246),transparent_40%)] [filter:blur(120px)] sm:[filter:blur(180px)] rounded-[inherit]" />
          {/* Image container with border beam */}
          <div className="relative z-10 rounded-xl overflow-hidden border border-white/10 bg-white/5">
            <BorderBeam size={200} duration={12} />
            {/* Placeholder noir — remplace par ton screenshot plus tard */}
            <div className="relative z-10 w-full rounded-[inherit] border border-white/[0.06] bg-background aspect-video flex items-center justify-center">
              <p className="text-white/20 text-sm">Dashboard screenshot ici</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ "CONÇU POUR" + RADIAL DIVIDER — same as Vinteer ═══════════════════ */}
      <section className="text-center mx-auto max-w-[80rem] px-6 md:px-8">
        <div className="py-14">
          <div className="mx-auto max-w-screen-xl px-4 md:px-8">
            <h2 className="text-center text-sm font-semibold text-gray-600">
              CONÇU POUR LES REVENDEURS VINTED
            </h2>
          </div>
        </div>
      </section>
      <div
        className="[--color:rgb(139,92,246)] pointer-events-none relative -z-[2] mx-auto h-[50rem] overflow-hidden [mask-image:radial-gradient(ellipse_at_center_center,#000,transparent_50%)] my-[-20.8rem] before:absolute before:inset-0 before:h-full before:w-full before:opacity-40 before:[background-image:radial-gradient(circle_at_bottom_center,var(--color),transparent_70%)] after:absolute after:-left-1/2 after:top-1/2 after:aspect-[1/0.7] after:w-[200%] after:rounded-[50%] after:border-t after:border-white/10 after:bg-background"
      />

      {/* ═══════════════════ BENTO GRID ═══════════════════ */}
      <section id="features" className="relative px-6 py-20 md:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
              L&apos;arsenal ultime
            </p>
            <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">
              Tout ce qu&apos;il te faut pour
              <br />
              <span className="text-violet-400">dominer Vinted</span>
            </h2>
          </div>

          <BentoGrid className="grid-cols-1 md:grid-cols-3 auto-rows-[22rem]">
            {/* Card 1 — Marquee products */}
            <BentoCard
              name="10h gagnées par mois"
              description="Automatise les tâches répétitives et concentre-toi sur la vente."
              Icon={Clock}
              href="/login"
              cta="Commencer"
              className="md:col-span-1"
              background={
                <div className="absolute inset-0 flex items-center overflow-hidden opacity-60">
                  <Marquee pauseOnHover className="[--duration:20s]">
                    <ProductCard name="T-shirt Nike" profit="+8€" />
                    <ProductCard name="Jean Levi's" profit="+18€" />
                    <ProductCard name="Veste Carhartt" profit="+32€" />
                    <ProductCard name="Sneakers Vans" profit="+12€" />
                    <ProductCard name="Pull Ralph Lauren" profit="+25€" />
                  </Marquee>
                </div>
              }
            />

            {/* Card 2 — Notifications */}
            <BentoCard
              name="Synchronisation Token"
              description="Connecte ton compte Vinted et reçois tes données en temps réel."
              Icon={Radio}
              href="/login"
              cta="Connecter"
              className="md:col-span-2"
              background={
                <div className="absolute inset-0 flex flex-col justify-center gap-3 overflow-hidden p-8 opacity-60">
                  <Marquee pauseOnHover className="[--duration:25s]">
                    <NotifCard icon="💰" text="Nouvelle vente — 24,50€" />
                    <NotifCard icon="✅" text="Import terminé — 48 articles" />
                    <NotifCard icon="📦" text="Colis expédié — #VNT-4821" />
                    <NotifCard icon="📊" text="Marge calculée — 42%" />
                  </Marquee>
                </div>
              }
            />

            {/* Card 3 — AnimatedBeam */}
            <BentoCard
              name="Calcul de Marge"
              description="Prix d'achat, frais, commission — ta marge nette en un clin d'oeil."
              Icon={Calculator}
              href="/login"
              cta="Calculer"
              className="md:col-span-2"
              background={
                <div className="absolute inset-0 opacity-60">
                  <BeamDemo />
                </div>
              }
            />

            {/* Card 4 — Invoices */}
            <BentoCard
              name="Factures & Documents"
              description="Génère tes factures automatiquement pour chaque vente."
              Icon={FileText}
              href="/login"
              cta="Générer"
              className="md:col-span-1"
              background={
                <div className="absolute inset-0 flex items-center overflow-hidden opacity-60">
                  <Marquee
                    reverse
                    pauseOnHover
                    className="[--duration:22s]"
                  >
                    <InvoiceCard id="FAC-2024-001" amount="35,00€" />
                    <InvoiceCard id="FAC-2024-002" amount="18,50€" />
                    <InvoiceCard id="FAC-2024-003" amount="62,00€" />
                    <InvoiceCard id="FAC-2024-004" amount="27,90€" />
                    <InvoiceCard id="FAC-2024-005" amount="44,00€" />
                  </Marquee>
                </div>
              }
            />

            {/* Card 5 — Stock */}
            <BentoCard
              name="Gestion de Stock"
              description="Suis ton inventaire en temps réel avec un suivi précis."
              Icon={Package}
              href="/login"
              cta="Gérer"
              className="md:col-span-1"
              background={
                <div className="absolute inset-0 opacity-40">
                  <div
                    className="h-full w-full"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, rgba(139,92,246,0.15) 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                </div>
              }
            />

            {/* Card 6 — Analytics */}
            <BentoCard
              name="Analytique Globale"
              description="Visualise tes performances et identifie tes meilleures ventes."
              Icon={BarChart3}
              href="/login"
              cta="Analyser"
              className="md:col-span-2"
              background={
                <div className="absolute inset-0 flex items-center justify-center opacity-50">
                  <div className="relative h-48 w-48">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600/30 to-transparent blur-xl" />
                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-500/20 to-transparent blur-lg" />
                    <div className="absolute inset-8 rounded-full bg-gradient-to-br from-violet-400/15 to-transparent blur-md" />
                    <Globe className="absolute inset-0 m-auto h-20 w-20 text-violet-400/30" />
                  </div>
                </div>
              }
            />
          </BentoGrid>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl px-6">
          <p className="mb-12 text-center text-sm font-semibold uppercase tracking-widest text-violet-400">
            Chiffres clés
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0">
            {[
              { value: "500+", label: "vendeurs actifs" },
              { value: "50 000+", label: "articles suivis" },
              { value: "< 0.5s", label: "latence moyenne" },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-8">
                {i > 0 && (
                  <div className="hidden md:block w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                )}
                <div className="text-center px-8">
                  <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-violet-400 to-violet-200 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ RADIAL DIVIDER ═══════════════════ */}
      <div className="relative py-8">
        <div
          className="mx-auto h-[1px] w-full max-w-5xl"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ═══════════════════ PRICING ═══════════════════ */}
      <section id="pricing" className="relative px-6 py-20 md:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
              Tarifs
            </p>
            <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">
              Simple et transparent
            </h2>
          </div>

          {/* Toggle */}
          <div className="mx-auto mb-12 flex w-fit items-center rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-sm">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                billingPeriod === "monthly"
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`relative rounded-full px-5 py-2 text-sm font-medium transition-all ${
                billingPeriod === "yearly"
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              Annuel
              <span className="ml-2 inline-flex items-center rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                2 mois offerts
              </span>
            </button>
          </div>

          {/* Cards */}
          <div className="grid gap-6 md:grid-cols-3 items-center">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-[2.5rem] p-8 transition-all ${
                  plan.recommended
                    ? "scale-100 md:scale-105 border border-violet-500/50 bg-neutral-900/60 shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)]"
                    : "border border-white/10 bg-neutral-900/40 backdrop-blur-md"
                }`}
              >
                {/* Violet gradient overlay for recommended */}
                {plan.recommended && (
                  <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-violet-600/10 to-transparent" />
                )}

                {/* Badge */}
                {plan.recommended && (
                  <div className="mb-4 inline-flex items-center rounded-full bg-violet-600/20 px-3 py-1 text-xs font-semibold text-violet-300">
                    Recommandé
                  </div>
                )}

                <div className="relative">
                  <p className="text-sm font-semibold tracking-wider text-white/40">
                    {plan.name}
                  </p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white">
                      {billingPeriod === "monthly"
                        ? plan.price.monthly
                        : plan.price.yearly}
                      €
                    </span>
                    <span className="text-sm text-white/40">/mois</span>
                  </div>
                  <p className="mt-2 text-sm text-white/40">
                    {plan.description}
                  </p>

                  <Link
                    href="/login"
                    className={`mt-6 flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                      plan.recommended
                        ? "bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-600/20"
                        : "bg-white/10 text-white hover:bg-white/15"
                    }`}
                  >
                    Commencer
                  </Link>

                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check
                          className={`h-4 w-4 shrink-0 ${
                            plan.recommended
                              ? "text-violet-400"
                              : "text-primary"
                          }`}
                        />
                        <span className="text-sm text-white/60">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FAQ ═══════════════════ */}
      <section id="faq" className="relative px-6 py-20 md:py-32">
        <div className="mx-auto max-w-2xl">
          <div className="mb-16 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">
              Questions fréquentes
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqData.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-white/10"
              >
                <AccordionTrigger className="text-left text-base font-medium text-white/80 hover:text-white hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-white/50 leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ═══════════════════ BOTTOM CTA ═══════════════════ */}
      <section className="relative px-6 py-20 md:py-32 overflow-hidden">
        {/* Marquee rows */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-4 opacity-30">
          <Marquee className="[--duration:30s]">
            <IconBox glow="rgba(139,92,246,0.3)">
              <Zap className="h-6 w-6 text-violet-400" />
            </IconBox>
            <IconBox glow="rgba(236,72,153,0.3)">
              <TrendingUp className="h-6 w-6 text-pink-400" />
            </IconBox>
            <IconBox glow="rgba(139,92,246,0.3)">
              <Package className="h-6 w-6 text-violet-400" />
            </IconBox>
            <IconBox glow="rgba(168,85,247,0.3)">
              <BarChart3 className="h-6 w-6 text-purple-400" />
            </IconBox>
            <IconBox glow="rgba(139,92,246,0.3)">
              <FileText className="h-6 w-6 text-violet-400" />
            </IconBox>
            <IconBox glow="rgba(236,72,153,0.3)">
              <Globe className="h-6 w-6 text-pink-400" />
            </IconBox>
            <IconBox glow="rgba(139,92,246,0.3)">
              <Star className="h-6 w-6 text-violet-400" />
            </IconBox>
            <IconBox glow="rgba(168,85,247,0.3)">
              <ShoppingBag className="h-6 w-6 text-purple-400" />
            </IconBox>
          </Marquee>
          <Marquee reverse className="[--duration:35s]">
            <IconBox glow="rgba(168,85,247,0.3)">
              <Calculator className="h-6 w-6 text-purple-400" />
            </IconBox>
            <IconBox glow="rgba(139,92,246,0.3)">
              <Radio className="h-6 w-6 text-violet-400" />
            </IconBox>
            <IconBox glow="rgba(236,72,153,0.3)">
              <Clock className="h-6 w-6 text-pink-400" />
            </IconBox>
            <IconBox glow="rgba(139,92,246,0.3)">
              <Zap className="h-6 w-6 text-violet-400" />
            </IconBox>
            <IconBox glow="rgba(168,85,247,0.3)">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </IconBox>
            <IconBox glow="rgba(139,92,246,0.3)">
              <Package className="h-6 w-6 text-violet-400" />
            </IconBox>
            <IconBox glow="rgba(236,72,153,0.3)">
              <BarChart3 className="h-6 w-6 text-pink-400" />
            </IconBox>
            <IconBox glow="rgba(168,85,247,0.3)">
              <FileText className="h-6 w-6 text-purple-400" />
            </IconBox>
          </Marquee>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* V Logo with BorderBeam */}
          <div className="relative mb-10 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-neutral-900/80">
            <span className="text-4xl font-black text-violet-400">V</span>
            <BorderBeam
              size={60}
              duration={4}
              colorFrom="#8b5cf6"
              colorTo="#a78bfa"
            />
          </div>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Prends de l&apos;avance
            <br />
            <span className="text-violet-400">sur les autres.</span>
          </h2>
          <p className="mt-4 max-w-md text-base text-slate-400">
            Rejoins les vendeurs qui utilisent déjà Voyted pour gérer leur
            boutique Vinted comme des pros.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-violet-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-500/90 transition-all"
          >
            Créer mon compte
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="border-t border-white/[0.06] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight">
                  Voyted
                </span>
              </div>
              <p className="mt-3 text-sm text-white/40">
                Lance toi dès maintenant.
              </p>
              <Link
                href="/login"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
              >
                Commencer
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Voyted */}
            <div>
              <p className="mb-4 text-sm font-semibold text-white/60">
                Voyted
              </p>
              <ul className="space-y-2.5">
                {["Fonctionnalités", "Tarifs", "FAQ"].map((link) => (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase()}`}
                      className="text-sm text-white/40 hover:text-white/70 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ressources */}
            <div>
              <p className="mb-4 text-sm font-semibold text-white/60">
                Ressources
              </p>
              <ul className="space-y-2.5">
                {["Guide de démarrage", "Documentation", "Blog"].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-white/40 hover:text-white/70 transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="mb-4 text-sm font-semibold text-white/60">Légal</p>
              <ul className="space-y-2.5">
                {[
                  "Conditions d'utilisation",
                  "Politique de confidentialité",
                  "Mentions légales",
                ].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/40 hover:text-white/70 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 md:flex-row">
            <p className="text-xs text-white/30">
              &copy; {new Date().getFullYear()} Voyted. Tous droits réservés.
            </p>
            <p className="text-xs text-white/30">
              Non affilié à Vinted.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
