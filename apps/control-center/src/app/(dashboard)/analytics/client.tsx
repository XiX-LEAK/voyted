"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  TrendingUp, TrendingDown, Euro, ShoppingBag, Eye, BarChart3, Heart, Package,
  RefreshCw, AlertTriangle, Award, Calendar, User, Star, ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVintedAccount } from "@/components/account-provider";
import Link from "next/link";

type Order = {
  conversation_id: number;
  transaction_id: number;
  title: string;
  price: { amount: string; currency_code: string };
  status: string;
  date: string;
  photo: string | null;
  transaction_user_status: string;
};

type VintedItem = {
  id: number;
  title: string;
  price: { amount: string; currency_code: string } | string;
  status: string;
  brand_title: string | null;
  size_title: string | null;
  view_count: number;
  favourite_count: number;
  photos: Array<{ url: string; thumbnail_url?: string }>;
};

type AccountInfo = {
  login?: string;
  id?: number;
  item_count?: number;
  feedback_reputation?: number;
  created_at?: string;
  photo?: { url?: string };
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  completed: { label: "Terminee", color: "bg-emerald-500/10 text-emerald-400" },
  refunded: { label: "Remboursee", color: "bg-red-500/10 text-red-400" },
};

const PERIODS = [
  { value: "today", label: "Aujourd'hui", days: 1 },
  { value: "7d", label: "7 jours", days: 7 },
  { value: "30d", label: "30 jours", days: 30 },
  { value: "3m", label: "3 mois", days: 90 },
  { value: "6m", label: "6 mois", days: 180 },
  { value: "1y", label: "1 an", days: 365 },
  { value: "all", label: "Tout", days: 0 },
] as const;

function formatEur(value: number): string {
  return value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " \u20AC";
}

function getOrderAmount(order: Order): number {
  const amount = parseFloat(order.price.amount);
  return isNaN(amount) ? 0 : amount;
}

function formatPctChange(current: number, previous: number): { text: string; positive: boolean } | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return { text: "+100%", positive: true };
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return { text: `${sign}${pct.toFixed(0)}%`, positive: pct >= 0 };
}

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export default function AnalyticsClient() {
  const { linked, loading: accountLoading } = useVintedAccount();
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<VintedItem[]>([]);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [activePeriod, setActivePeriod] = useState<string>("6m");

  async function fetchData() {
    setLoading(true);
    try {
      const [ordersRes, itemsRes, accountRes] = await Promise.all([
        fetch("/api/orders/sold", { cache: "no-store" }),
        fetch("/api/items/my-items", { cache: "no-store" }),
        fetch("/api/account/info", { cache: "no-store" }),
      ]);
      const ordersData = await ordersRes.json();
      const itemsData = await itemsRes.json();
      const accountData = await accountRes.json();
      setOrders(ordersData.my_orders || ordersData.orders || []);
      setItems(itemsData.items || []);
      setAccountInfo(accountData || null);
    } catch {
      toast.error("Impossible de charger les donnees analytiques");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (linked) fetchData();
  }, [linked]);

  const stats = useMemo(() => {
    const periodDays = PERIODS.find(p => p.value === activePeriod)?.days || 0;
    const cutoffDate = periodDays > 0 ? new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000) : null;
    const previousCutoffDate = cutoffDate ? new Date(cutoffDate.getTime() - periodDays * 24 * 60 * 60 * 1000) : null;

    const filteredOrders = cutoffDate
      ? orders.filter(o => o.date && new Date(o.date) >= cutoffDate)
      : orders;

    const previousOrders = cutoffDate && previousCutoffDate
      ? orders.filter(o => {
          if (!o.date) return false;
          const d = new Date(o.date);
          return d >= previousCutoffDate && d < cutoffDate;
        })
      : [];

    const completedOrders = filteredOrders.filter((o) => o.transaction_user_status === "completed");
    const cancelledOrders = filteredOrders.filter((o) => o.transaction_user_status === "refunded");

    const prevCompleted = previousOrders.filter((o) => o.transaction_user_status === "completed");

    const totalRevenue = completedOrders.reduce((sum, o) => sum + getOrderAmount(o), 0);
    const salesCount = completedOrders.length;
    const avgPrice = salesCount > 0 ? totalRevenue / salesCount : 0;

    const prevRevenue = prevCompleted.reduce((sum, o) => sum + getOrderAmount(o), 0);
    const prevSalesCount = prevCompleted.length;
    const prevAvgPrice = prevSalesCount > 0 ? prevRevenue / prevSalesCount : 0;

    const revenueChange = formatPctChange(totalRevenue, prevRevenue);
    const salesCountChange = formatPctChange(salesCount, prevSalesCount);
    const avgPriceChange = formatPctChange(avgPrice, prevAvgPrice);

    const totalListedAndSold = items.length + salesCount;
    const sellThrough = totalListedAndSold > 0 ? (salesCount / totalListedAndSold) * 100 : 0;
    const disputeRate = filteredOrders.length > 0 ? (cancelledOrders.length / filteredOrders.length) * 100 : 0;

    // Period revenue (replaces "CA ce mois")
    const periodRevenue = totalRevenue;
    const periodRevenueChange = revenueChange;

    // Chart data - adaptive granularity
    const now = new Date();
    const chartData: { label: string; value: number }[] = [];

    if (activePeriod === "today" || activePeriod === "7d" || activePeriod === "30d") {
      // Daily granularity
      const numDays = periodDays;
      for (let i = numDays - 1; i >= 0; i--) {
        const dayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        const revenue = completedOrders
          .filter(o => {
            if (!o.date) return false;
            const od = new Date(o.date);
            return od >= dayStart && od < dayEnd;
          })
          .reduce((sum, o) => sum + getOrderAmount(o), 0);
        chartData.push({
          label: `${dayDate.getDate()} ${MONTH_LABELS[dayDate.getMonth()]}`,
          value: revenue,
        });
      }
    } else if (activePeriod === "3m") {
      // Weekly granularity
      const numWeeks = Math.ceil(periodDays / 7);
      for (let i = numWeeks - 1; i >= 0; i--) {
        const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
        const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
        const revenue = completedOrders
          .filter(o => {
            if (!o.date) return false;
            const od = new Date(o.date);
            return od >= weekStart && od < weekEnd;
          })
          .reduce((sum, o) => sum + getOrderAmount(o), 0);
        chartData.push({
          label: `${weekStart.getDate()} ${MONTH_LABELS[weekStart.getMonth()]}`,
          value: revenue,
        });
      }
    } else {
      // Monthly granularity (6m, 1y, all)
      const numMonths = activePeriod === "6m" ? 6 : activePeriod === "1y" ? 12 : 24;
      for (let i = numMonths - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = d.getMonth();
        const revenue = completedOrders
          .filter((o) => {
            if (!o.date) return false;
            const od = new Date(o.date);
            return od.getFullYear() === year && od.getMonth() === month;
          })
          .reduce((sum, o) => sum + getOrderAmount(o), 0);
        chartData.push({ label: MONTH_LABELS[month], value: revenue });
      }
    }

    let bestSaleAmount = 0;
    let bestSaleTitle = "\u2014";
    let worstSaleAmount = Infinity;
    let worstSaleTitle = "\u2014";

    completedOrders.forEach((o) => {
      const amount = getOrderAmount(o);
      if (amount > bestSaleAmount) { bestSaleAmount = amount; bestSaleTitle = o.title; }
      if (amount > 0 && amount < worstSaleAmount) { worstSaleAmount = amount; worstSaleTitle = o.title; }
    });
    if (worstSaleAmount === Infinity) { worstSaleAmount = 0; worstSaleTitle = "\u2014"; }

    const dayCounts: Record<string, number> = {};
    completedOrders.forEach((o) => {
      if (!o.date) return;
      const dateStr = new Date(o.date).toLocaleDateString("fr-FR");
      dayCounts[dateStr] = (dayCounts[dateStr] || 0) + 1;
    });
    let bestDay = "\u2014";
    let bestDayCount = 0;
    Object.entries(dayCounts).forEach(([day, count]) => {
      if (count > bestDayCount) { bestDayCount = count; bestDay = day; }
    });
    if (bestDay !== "\u2014") {
      const parts = bestDay.split("/");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        bestDay = DAY_LABELS[d.getDay()] + " " + bestDay;
      }
    }

    const zeroViewItems = items.filter((i) => i.view_count === 0);

    const recentSales = [...filteredOrders]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    const topItems = [...items]
      .sort((a, b) => b.view_count + b.favourite_count - (a.view_count + a.favourite_count))
      .slice(0, 5);

    return {
      totalRevenue, salesCount, avgPrice, sellThrough, disputeRate,
      cancelledCount: cancelledOrders.length, periodRevenue, chartData,
      bestSaleAmount, bestSaleTitle, worstSaleAmount, worstSaleTitle,
      bestDay, bestDayCount, listedCount: items.length,
      zeroViewCount: zeroViewItems.length, recentSales, topItems,
      revenueChange, salesCountChange, avgPriceChange, periodRevenueChange,
    };
  }, [orders, items, activePeriod]);

  const periodLabel = PERIODS.find(p => p.value === activePeriod)?.label || "";
  const maxChart = Math.max(...stats.chartData.map((m) => m.value), 1);

  if (accountLoading)
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );

  if (!linked)
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <BarChart3 className="h-10 w-10 text-foreground/24" />
        <div>
          <h2 className="text-base font-semibold text-foreground">Compte Vinted non connecte</h2>
          <p className="mt-1 text-sm text-foreground/48">Connectez votre compte pour voir vos analytics.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/account">Connecter mon compte</Link>
        </Button>
      </div>
    );

  function ComparisonBadge({ change }: { change: { text: string; positive: boolean } | null }) {
    if (!change) return null;
    return (
      <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${change.positive ? "text-emerald-400" : "text-red-400"}`}>
        {change.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {change.text}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Analytics</h1>
          <p className="text-sm text-foreground/48 mt-0.5">Vue d&apos;ensemble de votre activite</p>
        </div>
        <Button onClick={fetchData} disabled={loading} variant="ghost" size="sm" className="gap-1.5 text-foreground/48 hover:text-foreground/72">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-card p-1">
          {PERIODS.map(period => (
            <button
              key={period.value}
              onClick={() => setActivePeriod(period.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activePeriod === period.value
                  ? "bg-violet text-white"
                  : "text-foreground/48 hover:bg-accent"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Chiffre d'affaires", value: formatEur(stats.totalRevenue), icon: Euro, color: "bg-violet/15 text-violet", change: stats.revenueChange },
          { label: "Produits vendus", value: String(stats.salesCount), icon: ShoppingBag, color: "bg-emerald-500/15 text-emerald-400", change: stats.salesCountChange },
          { label: "Panier moyen", value: formatEur(stats.avgPrice), icon: TrendingUp, color: "bg-blue-500/15 text-blue-400", change: stats.avgPriceChange },
          { label: "Taux de vente", value: `${stats.sellThrough.toFixed(1)}%`, icon: BarChart3, color: "bg-amber-500/15 text-amber-400", sub: `${stats.salesCount} / ${stats.salesCount + stats.listedCount}` },
          { label: "Taux de litige", value: `${stats.disputeRate.toFixed(1)}%`, icon: AlertTriangle, color: "bg-red-500/15 text-red-400", sub: `${stats.cancelledCount} annulee${stats.cancelledCount !== 1 ? "s" : ""}` },
          { label: "CA periode", value: formatEur(stats.periodRevenue), icon: Calendar, color: "bg-violet/15 text-violet", change: stats.periodRevenueChange },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-3.5 w-3.5" />
              </div>
              <p className="text-[11px] font-medium text-foreground/40 uppercase tracking-wider">{stat.label}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xl font-semibold text-foreground">{stat.value}</p>
              {"change" in stat && stat.change && <ComparisonBadge change={stat.change} />}
            </div>
            {stat.sub && <p className="text-[11px] text-foreground/32 mt-0.5">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet/15 text-violet">
            <BarChart3 className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-[11px] font-medium text-foreground/40 uppercase tracking-wider">Revenus &mdash; {periodLabel}</h2>
        </div>
        <div className="flex items-end gap-3 h-48">
          {stats.chartData.map((m, i) => {
            const heightPct = maxChart > 0 ? (m.value / maxChart) * 100 : 0;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-2 min-w-0">
                <span className="text-[11px] font-medium text-foreground/40 whitespace-nowrap truncate">
                  {m.value > 0 ? formatEur(m.value) : ""}
                </span>
                <div className="w-full flex items-end" style={{ height: "150px" }}>
                  <div
                    className="w-full rounded-md bg-violet/20 transition-all duration-700 ease-out hover:bg-violet/35"
                    style={{ height: `${Math.max(heightPct, 2)}%` }}
                  />
                </div>
                <span className="text-[11px] font-medium text-foreground/48 whitespace-nowrap truncate">{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Meilleure vente", value: formatEur(stats.bestSaleAmount), sub: stats.bestSaleTitle, icon: Award, color: "bg-emerald-500/15 text-emerald-400" },
          { label: "Pire vente", value: formatEur(stats.worstSaleAmount), sub: stats.worstSaleTitle, icon: ArrowDown, color: "bg-red-500/15 text-red-400" },
          { label: "Jour le plus actif", value: stats.bestDay, sub: stats.bestDayCount > 0 ? `${stats.bestDayCount} vente${stats.bestDayCount > 1 ? "s" : ""}` : undefined, icon: Calendar, color: "bg-blue-500/15 text-blue-400" },
          { label: "Articles en vente", value: String(stats.listedCount), icon: Package, color: "bg-amber-500/15 text-amber-400" },
          { label: "Articles avec 0 vues", value: String(stats.zeroViewCount), sub: stats.zeroViewCount > 0 ? "Attention requise" : undefined, icon: Eye, color: "bg-orange-500/15 text-orange-400" },
        ].map((metric) => (
          <div key={metric.label} className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${metric.color}`}>
                <metric.icon className="h-3.5 w-3.5" />
              </div>
              <p className="text-[11px] font-medium text-foreground/40 uppercase tracking-wider">{metric.label}</p>
            </div>
            <p className="text-lg font-semibold text-foreground">{metric.value}</p>
            {metric.sub && <p className="text-[11px] text-foreground/36 mt-0.5 line-clamp-1">{metric.sub}</p>}
          </div>
        ))}

        {/* Top articles */}
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/15 text-pink-400">
              <Heart className="h-3.5 w-3.5" />
            </div>
            <p className="text-[11px] font-medium text-foreground/40 uppercase tracking-wider">Top articles</p>
          </div>
          {stats.topItems.length > 0 ? (
            <div className="space-y-2 mt-1">
              {stats.topItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-[12px]">
                  <span className="line-clamp-1 text-foreground/56 flex-1 mr-2">{item.title}</span>
                  <span className="flex items-center gap-1.5 flex-shrink-0 text-foreground/36">
                    <Eye className="h-3 w-3" /> {item.view_count}
                    <Heart className="h-3 w-3 ml-1" /> {item.favourite_count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground/36 mt-1">{"\u2014"}</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-4 pb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet/15 text-violet">
            <ShoppingBag className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-[11px] font-medium text-foreground/40 uppercase tracking-wider">Dernieres ventes</h2>
        </div>
        {stats.recentSales.length === 0 ? (
          <div className="flex h-24 items-center justify-center">
            <p className="text-sm text-foreground/36">Aucune vente</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-border/40 text-[11px] font-medium text-foreground/36 uppercase tracking-wider">
                  <th className="px-5 py-2.5 text-left">Article</th>
                  <th className="px-4 py-2.5 text-left">Prix</th>
                  <th className="px-4 py-2.5 text-left hidden md:table-cell">Date</th>
                  <th className="px-4 py-2.5 text-left">Statut</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSales.map((order) => {
                  const amount = getOrderAmount(order);
                  const date = order.date
                    ? new Date(order.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
                    : "\u2014";
                  const statusInfo = STATUS_MAP[order.transaction_user_status] || { label: order.status, color: "bg-muted text-foreground/48" };
                  return (
                    <tr key={order.transaction_id} className="border-t border-border/30 transition-colors hover:bg-accent/40">
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-3">
                          {order.photo ? (
                            <img src={order.photo} alt="" className="h-8 w-8 rounded-md object-cover flex-shrink-0" />
                          ) : (
                            <div className="h-8 w-8 rounded-md bg-muted flex-shrink-0 flex items-center justify-center">
                              <Package className="h-3.5 w-3.5 text-foreground/24" />
                            </div>
                          )}
                          <span className="text-[13px] font-medium text-foreground/90 line-clamp-1">{order.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-[13px] font-medium text-foreground/72">{formatEur(amount)}</td>
                      <td className="px-4 py-2.5 text-[13px] text-foreground/40 hidden md:table-cell">{date}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Account Info */}
      {accountInfo && (
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
              <User className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-[11px] font-medium text-foreground/40 uppercase tracking-wider">Compte Vinted</h2>
          </div>
          <div className="flex flex-wrap gap-6">
            {accountInfo.login && (
              <div className="flex items-center gap-3">
                {accountInfo.photo?.url ? (
                  <img src={accountInfo.photo.url} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-foreground/[0.06] flex items-center justify-center">
                    <User className="h-4 w-4 text-foreground/32" />
                  </div>
                )}
                <div>
                  <p className="text-[13px] font-medium text-foreground/90">{accountInfo.login}</p>
                  {accountInfo.id && <p className="text-[11px] text-foreground/36">ID: {accountInfo.id}</p>}
                </div>
              </div>
            )}
            {accountInfo.feedback_reputation !== undefined && (
              <div className="flex items-center gap-2">
                <Star className="h-3.5 w-3.5 text-foreground/32" />
                <div>
                  <p className="text-[13px] font-medium text-foreground/90">{accountInfo.feedback_reputation.toFixed(1)}</p>
                  <p className="text-[11px] text-foreground/36">Reputation</p>
                </div>
              </div>
            )}
            {accountInfo.item_count !== undefined && (
              <div className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-foreground/32" />
                <div>
                  <p className="text-[13px] font-medium text-foreground/90">{accountInfo.item_count}</p>
                  <p className="text-[11px] text-foreground/36">Articles</p>
                </div>
              </div>
            )}
            {accountInfo.created_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-foreground/32" />
                <div>
                  <p className="text-[13px] font-medium text-foreground/90">
                    {new Date(accountInfo.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                  </p>
                  <p className="text-[11px] text-foreground/36">Membre depuis</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
