"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Users, RefreshCw, Package, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type BuyerData = {
  conversationId: number;
  title: string;
  totalSpent: number;
  date: string;
  transactionUserStatus: string;
};

function getOrderAmount(order: Order): number {
  const amount = parseFloat(order.price.amount);
  return isNaN(amount) ? 0 : amount;
}

function formatEur(value: number): string {
  return value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " \u20AC";
}

type SortField = "totalSpent" | "date" | "title";

export default function AcheteursClient() {
  const { linked, loading: accountLoading } = useVintedAccount();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("totalSpent");
  const [sortAsc, setSortAsc] = useState(false);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/sold", { cache: "no-store" });
      const data = await res.json();
      setOrders(data.my_orders || data.orders || []);
    } catch {
      toast.error("Impossible de charger les ventes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (linked) fetchOrders();
  }, [linked]);

  const buyers = useMemo(() => {
    let result: BuyerData[] = orders.map((order) => ({
      conversationId: order.conversation_id,
      title: order.title,
      totalSpent: getOrderAmount(order),
      date: order.date || "",
      transactionUserStatus: order.transaction_user_status,
    }));

    // Filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((b) => b.title.toLowerCase().includes(q));
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "totalSpent":
          cmp = a.totalSpent - b.totalSpent;
          break;
        case "date":
          cmp = a.date.localeCompare(b.date);
          break;
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [orders, search, sortField, sortAsc]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  }

  const completedCount = buyers.filter((b) => b.transactionUserStatus === "completed").length;

  if (accountLoading) return <div className="h-96 animate-pulse rounded-lg bg-muted" />;

  if (!linked) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <Users className="h-12 w-12 text-foreground/24" />
      <div>
        <h2 className="text-base font-semibold">Compte Vinted non connecte</h2>
        <p className="mt-1 text-sm text-foreground/48">Connectez votre compte pour voir vos acheteurs.</p>
      </div>
      <Button asChild size="sm">
        <Link href="/account">Connecter mon compte</Link>
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">Acheteurs</h1>
          <p className="text-sm text-foreground/48 mt-1">Base de donnees de vos acheteurs</p>
        </div>
        <Button onClick={fetchOrders} disabled={loading} variant="ghost" className="gap-2 text-foreground/48 hover:text-foreground/72">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <p className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Transactions totales</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{buyers.length}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <p className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Terminees</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{completedCount}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <p className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Total commandes</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{orders.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/36" />
        <Input
          placeholder="Rechercher un article..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Table */}
      {loading && buyers.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />)}
        </div>
      ) : buyers.length === 0 ? (
        <div className="flex h-[30vh] flex-col items-center justify-center gap-3 text-center">
          <Package className="h-12 w-12 text-foreground/24" />
          <p className="text-foreground/48">{search ? "Aucun resultat trouve" : "Aucune transaction pour le moment"}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/50">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-foreground/36 uppercase tracking-wider">
                  <button onClick={() => toggleSort("title")} className="flex items-center gap-1 hover:text-foreground/72 transition-colors">
                    Article
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-foreground/36 uppercase tracking-wider">
                  <button onClick={() => toggleSort("totalSpent")} className="flex items-center gap-1 hover:text-foreground/72 transition-colors">
                    Prix
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-foreground/36 uppercase tracking-wider hidden sm:table-cell">
                  <button onClick={() => toggleSort("date")} className="flex items-center gap-1 hover:text-foreground/72 transition-colors">
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody>
              {buyers.map((buyer) => {
                const dateStr = buyer.date
                  ? new Date(buyer.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
                  : "\u2014";
                return (
                  <tr key={buyer.conversationId} className="border-t border-border/30 hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground/48">
                          {buyer.title.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium line-clamp-1">{buyer.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground/90">{formatEur(buyer.totalSpent)}</td>
                    <td className="px-4 py-3 text-sm text-foreground/48 hidden sm:table-cell">{dateStr}</td>
                    <td className="px-4 py-3">
                      {buyer.transactionUserStatus === "completed" ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                          Terminee
                        </span>
                      ) : buyer.transactionUserStatus === "refunded" ? (
                        <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
                          Remboursee
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground/48">
                          En cours
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
