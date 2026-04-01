"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShoppingBag, RefreshCw, Package, Download } from "lucide-react";
import Papa from "papaparse";
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

const VINTED_FEE_RATE = 0.05;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  completed: { label: "Terminee", color: "bg-emerald-500/10 text-emerald-400" },
  refunded: { label: "Remboursee", color: "bg-red-500/10 text-red-400" },
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
      setOrders(data.my_orders || data.orders || []);
    } catch {
      toast.error("Impossible de charger les ventes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (linked) fetchOrders(); }, [linked]);

  function getPrice(order: Order): string {
    return `${order.price.amount} ${order.price.currency_code}`;
  }

  function getStatus(order: Order) {
    return STATUS_MAP[order.transaction_user_status] || { label: order.status, color: "bg-muted text-foreground/48" };
  }

  function exportCSV() {
    if (orders.length === 0) return;
    const data = orders.map((o) => {
      const amount = parseFloat(o.price.amount) || 0;
      const fees = amount * VINTED_FEE_RATE;
      const statusLabel = STATUS_MAP[o.transaction_user_status]?.label || o.status;
      return {
        Date: o.date ? new Date(o.date).toLocaleDateString("fr-FR") : "\u2014",
        Article: o.title,
        Prix: amount.toFixed(2),
        Frais: fees.toFixed(2),
        Net: (amount - fees).toFixed(2),
        Statut: statusLabel,
      };
    });
    const csv = Papa.unparse(data);
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Voyted-Ventes-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Export CSV telecharge");
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.price.amount) || 0), 0);

  if (accountLoading) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;

  if (!linked) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <ShoppingBag className="h-10 w-10 text-foreground/24" />
      <div>
        <h2 className="text-base font-semibold text-foreground">Compte Vinted non connecte</h2>
        <p className="mt-1 text-sm text-foreground/48">Connectez votre compte pour voir vos ventes.</p>
      </div>
      <Button asChild size="sm">
        <Link href="/account">Connecter mon compte</Link>
      </Button>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Mes Ventes</h1>
          <p className="text-sm text-foreground/48 mt-0.5">{orders.length} vente{orders.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCSV} disabled={orders.length === 0} variant="ghost" size="sm" className="gap-1.5 text-foreground/48 hover:text-foreground/72">
            <Download className="h-3.5 w-3.5" />
            CSV
          </Button>
          <Button onClick={fetchOrders} disabled={loading} variant="ghost" size="sm" className="gap-1.5 text-foreground/48 hover:text-foreground/72">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-px sm:grid-cols-3 rounded-xl border border-border/60 bg-border/60 overflow-hidden">
        <div className="bg-background p-4">
          <p className="text-[11px] font-medium text-foreground/40 uppercase tracking-wider">Revenu total</p>
          <p className="mt-1.5 text-xl font-semibold text-foreground">{totalRevenue.toFixed(2)} EUR</p>
        </div>
        <div className="bg-background p-4">
          <p className="text-[11px] font-medium text-foreground/40 uppercase tracking-wider">Ventes</p>
          <p className="mt-1.5 text-xl font-semibold text-foreground">{orders.length}</p>
        </div>
        <div className="bg-background p-4">
          <p className="text-[11px] font-medium text-foreground/40 uppercase tracking-wider">Panier moyen</p>
          <p className="mt-1.5 text-xl font-semibold text-foreground">{orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : "0.00"} EUR</p>
        </div>
      </div>

      {/* Orders table */}
      {loading && orders.length === 0 ? (
        <div className="space-y-2">
          {Array.from({length: 5}).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex h-[30vh] flex-col items-center justify-center gap-3 text-center">
          <Package className="h-10 w-10 text-foreground/20" />
          <p className="text-foreground/48">Aucune vente pour le moment</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60">
          <table className="w-full">
            <thead>
              <tr className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">
                <th className="px-4 py-2.5 text-left">Article</th>
                <th className="px-4 py-2.5 text-left">Prix</th>
                <th className="px-4 py-2.5 text-left hidden md:table-cell">Date</th>
                <th className="px-4 py-2.5 text-left">Statut</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const status = getStatus(order);
                const date = order.date ? new Date(order.date).toLocaleDateString("fr-FR") : "\u2014";
                return (
                  <tr key={order.transaction_id} className="border-t border-border/30 transition-colors hover:bg-accent/40">
                    <td className="px-4 py-2.5">
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
                    <td className="px-4 py-2.5 text-[13px] font-medium text-foreground/72">{getPrice(order)}</td>
                    <td className="px-4 py-2.5 text-[13px] text-foreground/40 hidden md:table-cell">{date}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${status.color}`}>
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
