"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShoppingBag, RefreshCw, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVintedAccount } from "@/components/account-provider";
import Link from "next/link";

type Order = {
  id: number;
  status: string;
  created_at: string;
  total_item_price?: { amount: string; currency_code: string } | string;
  item?: { title?: string; photos?: Array<{ url: string }> };
  buyer?: { login?: string };
  shipment?: { tracking_code?: string; status?: string };
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  waiting_for_buyer_confirmation: { label: "En attente acheteur", color: "bg-yellow-500/10 text-yellow-500" },
  waiting_for_seller_confirmation: { label: "En attente", color: "bg-yellow-500/10 text-yellow-500" },
  confirmed: { label: "Confirmée", color: "bg-blue-500/10 text-blue-400" },
  shipped: { label: "Expédiée", color: "bg-violet-500/10 text-violet-400" },
  delivered: { label: "Livrée", color: "bg-green-500/10 text-green-400" },
  completed: { label: "Terminée", color: "bg-green-500/10 text-green-400" },
  cancelled: { label: "Annulée", color: "bg-red-500/10 text-red-400" },
};

export default function VentesClient() {
  const { linked, loading: accountLoading } = useVintedAccount();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/sold", { cache: "no-store" });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      toast.error("Impossible de charger les ventes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (linked) fetchOrders(); }, [linked]);

  function getPrice(order: Order): string {
    const p = order.total_item_price;
    if (!p) return "—";
    if (typeof p === "object") return `${p.amount} ${p.currency_code}`;
    return String(p);
  }

  function getStatus(status: string) {
    return STATUS_MAP[status] || { label: status, color: "bg-muted text-muted-foreground" };
  }

  const totalRevenue = orders.reduce((sum, o) => {
    const p = o.total_item_price;
    if (!p) return sum;
    const amount = typeof p === "object" ? parseFloat(p.amount) : parseFloat(String(p));
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  if (accountLoading) return <div className="h-96 animate-pulse rounded-2xl bg-muted" />;

  if (!linked) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
      <div>
        <h2 className="text-lg font-semibold">Compte Vinted non connecté</h2>
        <p className="mt-1 text-sm text-muted-foreground">Connectez votre compte pour voir vos ventes.</p>
      </div>
      <Button asChild className="bg-violet-600 hover:bg-violet-500">
        <Link href="/account">Connecter mon compte</Link>
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header + stats */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mes Ventes</h1>
          <p className="text-sm text-muted-foreground mt-1">{orders.length} vente{orders.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={fetchOrders} disabled={loading} variant="outline" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Revenu total</p>
          <p className="mt-1 text-2xl font-bold text-violet-400">{totalRevenue.toFixed(2)} €</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Ventes</p>
          <p className="mt-1 text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Panier moyen</p>
          <p className="mt-1 text-2xl font-bold">{orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : "0.00"} €</p>
        </div>
      </div>

      {/* Orders list */}
      {loading && orders.length === 0 ? (
        <div className="space-y-3">
          {Array.from({length: 5}).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex h-[30vh] flex-col items-center justify-center gap-3 text-center">
          <Package className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">Aucune vente pour le moment</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/70">
          <table className="w-full">
            <thead className="bg-muted/40 text-xs text-muted-foreground uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Article</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Acheteur</th>
                <th className="px-4 py-3 text-left">Prix</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-left">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {orders.map(order => {
                const status = getStatus(order.status);
                const photo = order.item?.photos?.[0]?.url;
                const date = order.created_at ? new Date(order.created_at).toLocaleDateString("fr-FR") : "—";
                return (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {photo ? (
                          <img src={photo} alt="" className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground/40" />
                          </div>
                        )}
                        <span className="text-sm font-medium line-clamp-1">{order.item?.title || `Commande #${order.id}`}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      {order.buyer?.login || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-violet-400">{getPrice(order)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{date}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                        {status.label}
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
  );
}
