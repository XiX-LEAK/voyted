"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Package,
  Truck,
  CheckCircle2,
  MapPin,
  Clock,
  RefreshCw,
  Copy,
  ShoppingBag,
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

type FilterTab = "all" | "active" | "completed";

const STATUS_INFO: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  completed: { label: "Terminée", color: "text-emerald-400", icon: CheckCircle2 },
  refunded: { label: "Remboursée", color: "text-red-400", icon: Package },
};

function getFilterGroup(status: string): "active" | "completed" {
  if (status === "completed" || status === "refunded") return "completed";
  return "active";
}

export default function SuiviClient() {
  const { linked, loading: accountLoading } = useVintedAccount();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("all");

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/sold", { cache: "no-store" });
      const data = await res.json();
      setOrders(data.my_orders || data.orders || []);
    } catch {
      toast.error("Impossible de charger les commandes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (linked) fetchOrders();
  }, [linked]);

  function getPrice(order: Order): string {
    return `${order.price.amount} ${order.price.currency_code}`;
  }

  const counts = {
    active: orders.filter((o) => getFilterGroup(o.transaction_user_status) === "active").length,
    completed: orders.filter((o) => getFilterGroup(o.transaction_user_status) === "completed").length,
  };

  const filtered =
    filter === "all"
      ? orders
      : orders.filter((o) => getFilterGroup(o.transaction_user_status) === filter);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "Tous" },
    { key: "active", label: "En cours" },
    { key: "completed", label: "Terminés" },
  ];

  if (accountLoading)
    return <div className="h-96 animate-pulse rounded-lg bg-muted" />;

  if (!linked)
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Truck className="h-12 w-12 text-foreground/24" />
        <div>
          <h2 className="text-base font-semibold">Compte Vinted non connecté</h2>
          <p className="mt-1 text-sm text-foreground/48">
            Connectez votre compte pour suivre vos envois.
          </p>
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
          <h1 className="text-lg font-semibold">Suivi des envois</h1>
          <p className="mt-1 text-sm text-foreground/48">
            {orders.length} commande{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={fetchOrders}
          disabled={loading}
          variant="ghost"
          className="gap-2 text-foreground/48 hover:text-foreground/72"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-foreground/32" />
            <p className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">
              Total
            </p>
          </div>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {orders.length}
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-foreground/32" />
            <p className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">
              En cours
            </p>
          </div>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {counts.active}
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-foreground/32" />
            <p className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">
              Terminées
            </p>
          </div>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {counts.completed}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-foreground text-background"
                : "text-foreground/48 hover:bg-accent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading && orders.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-[30vh] flex-col items-center justify-center gap-3 text-center">
          <Package className="h-12 w-12 text-foreground/24" />
          <p className="text-foreground/48">
            {orders.length === 0
              ? "Aucune commande pour le moment"
              : "Aucune commande dans cette catégorie"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const statusInfo = STATUS_INFO[order.transaction_user_status];
            const date = order.date
              ? new Date(order.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : null;

            return (
              <div
                key={order.transaction_id}
                className="overflow-hidden rounded-xl border border-border/50 bg-card transition-colors hover:bg-accent/40"
              >
                <div className="flex gap-4 p-5">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    {order.photo ? (
                      <img
                        src={order.photo}
                        alt=""
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted">
                        <Package className="h-8 w-8 text-foreground/24" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold">
                            {order.title}
                          </h3>
                          <p className="mt-0.5 text-xs text-foreground/48">
                            {date && <span>{date}</span>}
                          </p>
                        </div>
                        <span className="flex-shrink-0 text-base font-semibold text-foreground/90">
                          {getPrice(order)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status bar */}
                <div className="border-t border-border/30 px-5 py-3">
                  <div className="flex items-center gap-2">
                    {statusInfo ? (
                      <>
                        <statusInfo.icon className={`h-4 w-4 ${statusInfo.color}`} />
                        <span className={`text-sm font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-foreground/48" />
                        <span className="text-sm font-medium text-foreground/48">
                          {order.status}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
