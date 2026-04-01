"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Search, User, Star, ShieldCheck, AlertTriangle, ExternalLink, Package,
  Loader2, ThumbsUp, ThumbsDown, Clock, MapPin, Calendar, Heart,
  Eye, TrendingUp, Tag, Award, Activity, RefreshCw,
  CheckCircle2, Smartphone, Mail, Globe, Zap, ShoppingBag,
  Timer, Target, Flame, BarChart3, Layers, Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnalyzeResult = { user: Record<string, any>; items: Record<string, any>[]; items_count: number; feedback: any };

function fmtDate(d: string) {
  if (!d) return "Inconnu";
  const date = new Date(d);
  return isNaN(date.getTime()) ? "Inconnu" : date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}
function fmtRelative(d: string | number) {
  const ts = typeof d === "number" ? d * 1000 : new Date(d).getTime();
  if (!ts || isNaN(ts)) return "Inconnu";
  const days = Math.floor((Date.now() - ts) / 864e5);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 30) return `Il y a ${days}j`;
  if (days < 365) return `Il y a ${Math.floor(days / 30)} mois`;
  return `Il y a ${Math.floor(days / 365)} ans`;
}
function ageMonths(d: string) {
  if (!d) return 0;
  const ts = typeof d === "number" ? (d as number) * 1000 : new Date(d).getTime();
  return isNaN(ts) ? 0 : Math.floor((Date.now() - ts) / (864e5 * 30));
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating * 5);
  const half = (rating * 5 - full) >= 0.25;
  const empty = Math.max(0, 5 - full - (half ? 1 : 0));
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => <Star key={`f${i}`} className="h-4 w-4 fill-foreground/48 text-foreground/48" />)}
      {half && <Star className="h-4 w-4 fill-foreground/24 text-foreground/48" />}
      {Array.from({ length: empty }).map((_, i) => <Star key={`e${i}`} className="h-4 w-4 text-foreground/24" />)}
      <span className="ml-1.5 text-sm text-foreground/48">({(rating * 5).toFixed(1)}/5)</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <div className="flex items-center gap-2 text-[11px] font-medium text-foreground/36 uppercase tracking-wider">
        <Icon className="h-3.5 w-3.5 text-foreground/32" />{label}
      </div>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-foreground/48">{sub}</p>}
    </div>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-5 flex-1 rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function AnalyzerClient() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [prevSnapshot, setPrevSnapshot] = useState<{ views: number; favs: number; items: number } | null>(null);

  const fetchAnalysis = useCallback(async (q?: string) => {
    const target = q || query.trim();
    if (!target) return;
    setLoading(true);
    try {
      const isNumeric = /^\d+$/.test(target);
      const params = isNumeric ? `user_id=${target}` : `username=${encodeURIComponent(target)}`;
      const res = await fetch(`/api/analyze?${params}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");

      // Save previous snapshot for delta tracking
      if (result) {
        const items = result.items || [];
        setPrevSnapshot({
          views: items.reduce((s: number, i: any) => s + (i.view_count || 0), 0),
          favs: items.reduce((s: number, i: any) => s + (i.favourite_count || 0), 0),
          items: items.length,
        });
      }
      setResult(data);
      setLastRefresh(new Date());
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [query, result]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!autoRefresh || !result) return;
    const interval = setInterval(() => fetchAnalysis(), 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, result, fetchAnalysis]);

  const user = result?.user;
  const items = result?.items || [];

  const analytics = useMemo(() => {
    if (!user || !items.length) return null;

    const prices = items.map((i: any) => {
      const p = i.price;
      if (typeof p === "object" && p?.amount) return parseFloat(p.amount);
      if (typeof p === "string") return parseFloat(p);
      return 0;
    }).filter((p: number) => p > 0);

    const avgPrice = prices.length ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length : 0;
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const totalValue = prices.reduce((a: number, b: number) => a + b, 0);
    const medianPrice = prices.length ? [...prices].sort((a, b) => a - b)[Math.floor(prices.length / 2)] : 0;

    // Price distribution
    const priceRanges = [
      { label: "0-5€", min: 0, max: 5, count: 0 },
      { label: "5-15€", min: 5, max: 15, count: 0 },
      { label: "15-30€", min: 15, max: 30, count: 0 },
      { label: "30-50€", min: 30, max: 50, count: 0 },
      { label: "50-100€", min: 50, max: 100, count: 0 },
      { label: "100€+", min: 100, max: Infinity, count: 0 },
    ];
    prices.forEach((p: number) => { const r = priceRanges.find(r => p >= r.min && p < r.max); if (r) r.count++; });
    const maxRC = Math.max(...priceRanges.map(r => r.count), 1);

    // Brands
    const brandMap: Record<string, number> = {};
    items.forEach((i: any) => { const b = i.brand_title || "Sans marque"; brandMap[b] = (brandMap[b] || 0) + 1; });
    const topBrands = Object.entries(brandMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

    // Sizes
    const sizeMap: Record<string, number> = {};
    items.forEach((i: any) => { const s = i.size_title || "N/A"; sizeMap[s] = (sizeMap[s] || 0) + 1; });
    const topSizes = Object.entries(sizeMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

    // Engagement
    const totalViews = items.reduce((s: number, i: any) => s + (i.view_count || 0), 0);
    const totalFavs = items.reduce((s: number, i: any) => s + (i.favourite_count || 0), 0);
    const avgViews = items.length ? totalViews / items.length : 0;
    const avgFavs = items.length ? totalFavs / items.length : 0;
    // Vinted doesn't expose view_count for other sellers' items (always 0)
    // Use favourite_count as the main engagement metric instead
    const hasViews = totalViews > 0;
    const engagementRate = hasViews ? ((totalFavs / totalViews) * 100) : (items.length > 0 ? (totalFavs / items.length) : 0);

    // Photos
    const photoCounts = items.map((i: any) => (i.photos || []).length);
    const avgPhotos = photoCounts.length ? photoCounts.reduce((a: number, b: number) => a + b, 0) / photoCounts.length : 0;
    const itemsWith1Photo = photoCounts.filter((c: number) => c <= 1).length;

    // Top items
    const byViews = hasViews ? [...items].sort((a: any, b: any) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 5) : [];
    const byFavs = [...items].sort((a: any, b: any) => (b.favourite_count || 0) - (a.favourite_count || 0)).slice(0, 5);
    const byPrice = [...items].sort((a: any, b: any) => {
      const pa = typeof a.price === "object" ? parseFloat(a.price.amount) : parseFloat(a.price);
      const pb = typeof b.price === "object" ? parseFloat(b.price.amount) : parseFloat(b.price);
      return pb - pa;
    }).slice(0, 5);

    // Condition breakdown
    const conditionMap: Record<string, number> = {};
    items.forEach((i: any) => { const c = i.status || "Inconnu"; conditionMap[c] = (conditionMap[c] || 0) + 1; });
    const conditions = Object.entries(conditionMap).sort((a, b) => b[1] - a[1]);

    // Revenue estimation (items sold from feedback)
    const givenItems = user.given_item_count || 0;
    const estimatedRevenue = givenItems * avgPrice;

    // Seller score (composite)
    const posF = user.positive_feedback_count || 0;
    const negF = user.negative_feedback_count || 0;
    const totF = posF + negF + (user.neutral_feedback_count || 0);
    const trustPct = totF > 0 ? (posF / totF) * 100 : 0;
    const acctAge = ageMonths(user.created_at);

    let sellerScore = 0;
    if (trustPct >= 90 && totF >= 5) sellerScore += 30;
    else if (trustPct >= 70) sellerScore += 15;
    if (acctAge >= 24) sellerScore += 20;
    else if (acctAge >= 12) sellerScore += 10;
    if (avgPhotos >= 4) sellerScore += 15;
    else if (avgPhotos >= 2) sellerScore += 8;
    if (items.length >= 20) sellerScore += 15;
    else if (items.length >= 5) sellerScore += 8;
    if (avgFavs >= 10) sellerScore += 10;
    else if (avgFavs >= 3) sellerScore += 5;
    if (posF >= 50) sellerScore += 10;
    else if (posF >= 10) sellerScore += 5;
    sellerScore = Math.min(sellerScore, 100);

    const sellerGrade = sellerScore >= 85 ? "S" : sellerScore >= 70 ? "A" : sellerScore >= 55 ? "B" : sellerScore >= 40 ? "C" : "D";

    return {
      avgPrice, minPrice, maxPrice, totalValue, medianPrice, priceRanges, maxRC,
      topBrands, topSizes, totalViews, totalFavs, avgViews, avgFavs, engagementRate,
      avgPhotos, itemsWith1Photo, byViews, byFavs, byPrice, conditions,
      givenItems, estimatedRevenue, sellerScore, sellerGrade,
      trustPct, acctAge, totF, posF, negF,
    };
  }, [user, items]);

  // Delta tracking
  const delta = useMemo(() => {
    if (!prevSnapshot || !items.length) return null;
    const curViews = items.reduce((s: number, i: any) => s + (i.view_count || 0), 0);
    const curFavs = items.reduce((s: number, i: any) => s + (i.favourite_count || 0), 0);
    return {
      views: curViews - prevSnapshot.views,
      favs: curFavs - prevSnapshot.favs,
      items: items.length - prevSnapshot.items,
    };
  }, [prevSnapshot, items]);

  // Warnings & badges
  const warnings: string[] = [];
  const positives: string[] = [];
  if (user && analytics) {
    if (analytics.acctAge < 3) warnings.push("Compte récent (< 3 mois)");
    if (analytics.totF === 0) warnings.push("Aucun avis");
    if (analytics.totF > 0 && analytics.negF / analytics.totF > 0.15) warnings.push(`Ratio négatifs élevé (${Math.round(analytics.negF / analytics.totF * 100)}%)`);
    if ((user.item_count || 0) < 3) warnings.push("Très peu d'articles");
    if (analytics.avgPhotos < 2) warnings.push(`Photos insuffisantes (${analytics.avgPhotos.toFixed(1)}/article)`);
    if (analytics.avgFavs < 1 && items.length >= 5) warnings.push("Peu de favoris");

    if (analytics.acctAge >= 24) positives.push("Compte 2+ ans");
    else if (analytics.acctAge >= 12) positives.push("Compte 1+ an");
    if (analytics.posF >= 50) positives.push(`${analytics.posF} avis positifs`);
    else if (analytics.posF >= 10) positives.push(`${analytics.posF} avis positifs`);
    if (analytics.trustPct >= 95 && analytics.totF >= 10) positives.push(`Score ${Math.round(analytics.trustPct)}%`);
    if ((user.item_count || 0) >= 50) positives.push("Vendeur actif");
    if (analytics.avgPhotos >= 4) positives.push(`${analytics.avgPhotos.toFixed(1)} photos/article`);
    if (analytics.avgFavs >= 10) positives.push(`${analytics.avgFavs.toFixed(0)} favs/article en moyenne`);
    if (user.verification?.email?.valid) positives.push("Email vérifié");
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-lg font-semibold text-foreground">Analyseur de compte</h1>
        <p className="text-sm text-foreground/48 mt-1">Analyse approfondie de n&apos;importe quel vendeur Vinted</p>
      </div>

      {/* Search */}
      <div className="mx-auto max-w-xl">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/32" />
            <Input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchAnalysis()} placeholder="ID vendeur (ex: 221619429)" className="pl-10 h-11 rounded-xl border-border/50 bg-card" />
          </div>
          <Button onClick={() => fetchAnalysis()} disabled={loading || !query.trim()} className="h-11 gap-2 rounded-xl px-6" size="sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Analyser
          </Button>
        </div>
      </div>

      {loading && !result && (
        <div className="flex flex-col items-center gap-3 py-16">
          <Loader2 className="h-8 w-8 animate-spin text-foreground/32" />
          <p className="text-sm text-foreground/48">Analyse approfondie en cours...</p>
        </div>
      )}

      {result && user && (
        <div className="space-y-6">

          {/* Auto-refresh bar */}
          <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card px-4 py-2">
            <div className="flex items-center gap-3">
              <button onClick={() => setAutoRefresh(!autoRefresh)} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${autoRefresh ? "bg-emerald-500/10 text-emerald-400" : "bg-muted text-foreground/48"}`}>
                <Activity className={`h-3.5 w-3.5 ${autoRefresh ? "animate-pulse" : ""}`} />
                {autoRefresh ? "Live ON" : "Live OFF"}
              </button>
              {lastRefresh && <span className="text-xs text-foreground/48">Mis à jour {lastRefresh.toLocaleTimeString("fr-FR")}</span>}
              {delta && (delta.views !== 0 || delta.favs !== 0) && (
                <span className="text-xs">
                  {delta.views > 0 && <span className="text-emerald-400">+{delta.views} vues</span>}
                  {delta.views > 0 && delta.favs > 0 && <span className="text-foreground/36"> · </span>}
                  {delta.favs > 0 && <span className="text-foreground/72">+{delta.favs} favs</span>}
                </span>
              )}
            </div>
            <Button onClick={() => fetchAnalysis()} disabled={loading} size="sm" variant="ghost" className="gap-1.5 text-xs text-foreground/48 hover:text-foreground/72">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Rafraîchir
            </Button>
          </div>

          {/* ===== SELLER GRADE + PROFILE ===== */}
          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="flex items-start gap-5">
                {user.photo?.url ? (
                  <img src={user.photo.url} alt={user.login} className="h-20 w-20 rounded-xl object-cover border border-border/50" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted"><User className="h-10 w-10 text-foreground/24" /></div>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-foreground">@{user.login}</h2>
                    <a href={`https://www.vinted.fr/member/${user.id}`} target="_blank" rel="noopener noreferrer" className="text-foreground/48 hover:text-foreground/72"><ExternalLink className="h-4 w-4" /></a>
                  </div>
                  {user.feedback_reputation > 0 && <Stars rating={user.feedback_reputation} />}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground/48">
                    {(user.country_title || user.city) && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{[user.city, user.country_title].filter(Boolean).join(", ")}</span>}
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Membre depuis {fmtDate(user.created_at)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Actif {fmtRelative(user.last_loged_on_ts)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {user.verification?.email?.valid && <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400"><Mail className="h-3 w-3" />Email</span>}
                    {user.verification?.phone?.valid && <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400"><Smartphone className="h-3 w-3" />Tél</span>}
                    {user.verification?.google?.valid && <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400"><Globe className="h-3 w-3" />Google</span>}
                    {user.verification?.facebook?.valid && <span className="flex items-center gap-1 rounded-full bg-foreground/8 px-2 py-0.5 text-xs text-foreground/48"><Globe className="h-3 w-3" />Facebook</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Grade card */}
            {analytics && (
              <div className="rounded-xl border border-border/50 bg-card p-6 flex flex-col items-center justify-center min-w-[140px]">
                <p className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Score vendeur</p>
                <p className="text-6xl font-black text-foreground">{analytics.sellerGrade}</p>
                <p className="text-lg font-bold text-foreground/48">{analytics.sellerScore}/100</p>
                <div className="w-full mt-2 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-foreground/48 transition-all duration-700" style={{ width: `${analytics.sellerScore}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* ===== TRUST SCORE ===== */}
          {analytics && (
            <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
              <h3 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-foreground/36">
                <ShieldCheck className="h-4 w-4 text-foreground/32" />Confiance & Réputation
              </h3>
              <div className="flex items-center gap-6">
                <div className="text-5xl font-black text-foreground">{analytics.totF > 0 ? `${Math.round(analytics.trustPct)}%` : "N/A"}</div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${analytics.totF > 0 ? analytics.trustPct : 0}%`, background: analytics.trustPct >= 80 ? "linear-gradient(90deg, #22c55e, #4ade80)" : analytics.trustPct >= 50 ? "linear-gradient(90deg, #eab308, #facc15)" : "linear-gradient(90deg, #ef4444, #f87171)" }} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div><span className="text-emerald-400 font-bold">{analytics.posF}</span> <span className="text-foreground/48">positifs</span></div>
                    <div><span className="font-bold text-foreground/72">{user.neutral_feedback_count || 0}</span> <span className="text-foreground/48">neutres</span></div>
                    <div><span className="text-red-400 font-bold">{analytics.negF}</span> <span className="text-foreground/48">négatifs</span></div>
                  </div>
                </div>
              </div>
              {(warnings.length > 0 || positives.length > 0) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
                  {positives.map(m => <span key={m} className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400"><CheckCircle2 className="h-3 w-3" />{m}</span>)}
                  {warnings.map(m => <span key={m} className="inline-flex items-center gap-1 rounded-full bg-foreground/8 px-2.5 py-1 text-xs font-medium text-foreground/48"><AlertTriangle className="h-3 w-3" />{m}</span>)}
                </div>
              )}
            </div>
          )}

          {/* ===== KEY METRICS ===== */}
          {analytics && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              <StatCard icon={Package} label="Articles" value={user.item_count || result.items_count || 0} sub={`${analytics.givenItems} vendus · ${user.taken_item_count || 0} achetés`} />
              <StatCard icon={Heart} label="Favoris totaux" value={analytics.totalFavs.toLocaleString("fr-FR")} sub={`moy. ${analytics.avgFavs.toFixed(1)} favs/article`} />
              <StatCard icon={Zap} label="Popularité" value={`${analytics.avgFavs.toFixed(1)}`} sub="favs moyen par article" />
              <StatCard icon={ShoppingBag} label="CA estimé" value={`${analytics.estimatedRevenue.toFixed(0)}€`} sub={`${analytics.givenItems} ventes × ${analytics.avgPrice.toFixed(0)}€`} />
              <StatCard icon={User} label="Followers" value={user.followers_count || 0} sub={`${user.following_count || 0} abonnements`} />
              <StatCard icon={Star} label="Évaluations" value={analytics.totF} sub={`ratio: ${analytics.totF > 0 ? Math.round(analytics.trustPct) : 0}% positifs`} />
            </div>
          )}

          {analytics && items.length > 0 && (
            <>
              {/* ===== PRICING ===== */}
              <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
                <h3 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-foreground/36">
                  <TrendingUp className="h-4 w-4 text-foreground/32" />Analyse des prix
                </h3>
                <div className="grid gap-4 sm:grid-cols-5">
                  <div className="text-center"><p className="text-xs text-foreground/48">Moyen</p><p className="text-xl font-bold text-foreground">{analytics.avgPrice.toFixed(2)}€</p></div>
                  <div className="text-center"><p className="text-xs text-foreground/48">Médian</p><p className="text-xl font-bold text-foreground">{analytics.medianPrice.toFixed(2)}€</p></div>
                  <div className="text-center"><p className="text-xs text-foreground/48">Min</p><p className="text-xl font-bold text-foreground">{analytics.minPrice.toFixed(2)}€</p></div>
                  <div className="text-center"><p className="text-xs text-foreground/48">Max</p><p className="text-xl font-bold text-foreground">{analytics.maxPrice.toFixed(2)}€</p></div>
                  <div className="text-center"><p className="text-xs text-foreground/48">Valeur totale</p><p className="text-xl font-bold text-foreground">{analytics.totalValue.toFixed(0)}€</p></div>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-foreground/48 mb-3">Distribution des prix</p>
                  <div className="flex items-end gap-2 h-28">
                    {analytics.priceRanges.map((r: any) => (
                      <div key={r.label} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-medium text-foreground/72">{r.count}</span>
                        <div className="w-full rounded-t-lg bg-foreground/24 transition-all duration-500" style={{ height: `${(r.count / analytics.maxRC) * 100}%`, minHeight: r.count > 0 ? "6px" : "0" }} />
                        <span className="text-[10px] text-foreground/36">{r.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ===== BRANDS + SIZES ===== */}
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-border/50 bg-card p-6 space-y-3">
                  <h3 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-foreground/36"><Tag className="h-4 w-4 text-foreground/32" />Marques ({analytics.topBrands.length})</h3>
                  <div className="space-y-2">
                    {analytics.topBrands.map(([brand, count]: [string, number]) => (
                      <div key={brand} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-28 truncate text-foreground/90">{brand}</span>
                        <ProgressBar value={count} max={items.length} color="bg-foreground/24" />
                        <span className="text-xs text-foreground/48 w-14 text-right">{count} ({Math.round(count / items.length * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-border/50 bg-card p-6 space-y-3">
                  <h3 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-foreground/36"><Layers className="h-4 w-4 text-foreground/32" />Tailles & État</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {analytics.topSizes.map(([size, count]: [string, number]) => (
                      <span key={size} className="rounded-full border border-border/50 bg-accent/40 px-3 py-1.5 text-sm"><span className="font-medium text-foreground/90">{size}</span> <span className="text-foreground/48">({count})</span></span>
                    ))}
                  </div>
                  {analytics.conditions.length > 0 && (
                    <div className="space-y-2 border-t border-border/30 pt-3">
                      <p className="text-xs text-foreground/48">État des articles</p>
                      {analytics.conditions.map(([cond, count]: [string, number]) => (
                        <div key={cond} className="flex items-center gap-3">
                          <span className="text-xs w-36 truncate text-foreground/72">{cond}</span>
                          <ProgressBar value={count} max={items.length} color="bg-foreground/24" />
                          <span className="text-xs text-foreground/48 w-8 text-right">{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ===== QUALITY SCORE ===== */}
              <div className="rounded-xl border border-border/50 bg-card p-6 space-y-3">
                <h3 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-foreground/36"><Camera className="h-4 w-4 text-foreground/32" />Qualité des annonces</h3>
                <div className="grid gap-4 sm:grid-cols-4">
                  <div><p className="text-xs text-foreground/48">Photos/article</p><p className={`text-xl font-bold ${analytics.avgPhotos >= 4 ? "text-emerald-400" : analytics.avgPhotos >= 2 ? "text-foreground/72" : "text-red-400"}`}>{analytics.avgPhotos.toFixed(1)}</p></div>
                  <div><p className="text-xs text-foreground/48">1 seule photo</p><p className={`text-xl font-bold ${analytics.itemsWith1Photo === 0 ? "text-emerald-400" : "text-foreground/72"}`}>{analytics.itemsWith1Photo}</p></div>
                  <div><p className="text-xs text-foreground/48">Favs/article</p><p className={`text-xl font-bold ${analytics.avgFavs >= 10 ? "text-emerald-400" : analytics.avgFavs >= 3 ? "text-foreground/72" : "text-red-400"}`}>{analytics.avgFavs.toFixed(1)}</p></div>
                  <div><p className="text-xs text-foreground/48">Score qualité</p><p className={`text-xl font-bold ${analytics.avgPhotos >= 3 && analytics.avgFavs >= 5 ? "text-emerald-400" : "text-foreground/72"}`}>{analytics.avgPhotos >= 4 && analytics.avgFavs >= 8 ? "Excellent" : analytics.avgPhotos >= 3 ? "Bon" : analytics.avgPhotos >= 2 ? "Moyen" : "Faible"}</p></div>
                </div>
              </div>

              {/* ===== TOP ITEMS ===== */}
              <div className={`grid gap-4 ${analytics.byViews.length > 0 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
                {[
                  ...(analytics.byViews.length > 0 ? [{ title: "Plus vus", icon: Eye, items: analytics.byViews, metric: "view_count", suffix: " vues" }] : []),
                  { title: "Plus likés", icon: Heart, items: analytics.byFavs, metric: "favourite_count", suffix: " favs" },
                  { title: "Plus chers", icon: TrendingUp, items: analytics.byPrice, metric: null, suffix: "" },
                ].map(section => (
                  <div key={section.title} className="rounded-xl border border-border/50 bg-card p-5 space-y-3">
                    <h3 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-foreground/36">
                      <section.icon className="h-4 w-4 text-foreground/32" />{section.title}
                    </h3>
                    <div className="space-y-2">
                      {section.items.map((item: any, i: number) => {
                        const photo = item.photos?.[0]?.thumbnail_url || item.photos?.[0]?.url;
                        const val = section.metric ? (item[section.metric] || 0) : (typeof item.price === "object" ? item.price.amount + "€" : item.price);
                        return (
                          <div key={item.id || i} className="flex items-center gap-2">
                            <span className="text-xs text-foreground/36 w-4">{i + 1}.</span>
                            {photo ? <img src={photo} alt="" className="h-8 w-8 rounded-lg object-cover flex-shrink-0" /> : <div className="h-8 w-8 rounded-lg bg-muted flex-shrink-0" />}
                            <span className="text-xs flex-1 truncate text-foreground/90">{item.title}</span>
                            <span className="text-xs font-medium text-foreground/72">{val}{section.suffix}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* ===== ITEMS GRID ===== */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-medium uppercase tracking-wider text-foreground/36">Articles en vente ({items.length})</h3>
                  <a href={`https://www.vinted.fr/member/${user.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-foreground/48 hover:text-foreground/72">Voir sur Vinted <ExternalLink className="h-3 w-3" /></a>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.slice(0, 16).map((item: any, i: number) => {
                    const photo = item.photos?.[0]?.thumbnail_url || item.photos?.[0]?.url;
                    const price = typeof item.price === "object" ? `${item.price.amount} ${item.price.currency_code}` : item.price;
                    return (
                      <div key={item.id || i} className="group overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-border">
                        <div className="relative h-44 overflow-hidden bg-muted">
                          {photo ? <img src={photo} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center"><Package className="h-10 w-10 text-foreground/24" /></div>}
                          <div className="absolute bottom-2 left-2 flex gap-1.5">
                            <span className="flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm"><Heart className="h-2.5 w-2.5" />{item.favourite_count || 0}</span>
                            {(item.view_count || 0) > 0 && <span className="flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm"><Eye className="h-2.5 w-2.5" />{item.view_count}</span>}
                          </div>
                        </div>
                        <div className="p-3 space-y-1">
                          <p className="text-sm font-medium line-clamp-2 leading-tight text-foreground/90">{item.title}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-base font-bold text-foreground">{price}</span>
                            {item.brand_title && <span className="text-xs text-foreground/48 truncate ml-2">{item.brand_title}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
