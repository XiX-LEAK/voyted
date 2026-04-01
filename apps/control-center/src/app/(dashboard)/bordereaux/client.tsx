"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Printer, Package, Square, SquareCheck, CheckSquare, RefreshCw } from "lucide-react";
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

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  completed: { label: "Terminee", color: "bg-emerald-500/10 text-emerald-400" },
  refunded: { label: "Remboursee", color: "bg-red-500/10 text-red-400" },
};

type FilterStatus = "all" | "to_ship" | "shipped";

function getFirstThreeWords(title: string): string {
  return title.split(/\s+/).slice(0, 3).join(" ");
}

export default function BordereauxClient() {
  const { linked, loading: accountLoading } = useVintedAccount();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<FilterStatus>("all");

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/sold", { cache: "no-store" });
      const data = await res.json();
      setOrders(data.my_orders || data.orders || []);
      setSelected(new Set());
    } catch {
      toast.error("Impossible de charger les commandes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (linked) fetchOrders(); }, [linked]);

  const shippableOrders = orders.filter(o => {
    const status = o.transaction_user_status?.toLowerCase() || "";
    const statusText = o.status?.toLowerCase() || "";
    if (["completed", "refunded", "failed", "cancelled"].includes(status)) return false;
    if (statusText.includes("finalisee") || statusText.includes("remboursement") || statusText.includes("annule")) return false;
    return true;
  });

  const filteredOrders = shippableOrders.filter(o => {
    const statusText = o.status?.toLowerCase() || "";
    if (filter === "to_ship") return !statusText.includes("expedie") && !statusText.includes("envoye");
    if (filter === "shipped") return statusText.includes("expedie") || statusText.includes("envoye");
    return true;
  });

  function getPrice(order: Order): string {
    return `${order.price.amount} ${order.price.currency_code}`;
  }

  function getStatus(order: Order) {
    return STATUS_MAP[order.transaction_user_status] || { label: order.status, color: "bg-muted text-foreground/48" };
  }

  function toggleSelect(id: number) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === filteredOrders.length) setSelected(new Set());
    else setSelected(new Set(filteredOrders.map(o => o.transaction_id)));
  }

  function handlePrintAll() {
    const allIds = new Set(filteredOrders.map(o => o.transaction_id));
    setSelected(allIds);
    setTimeout(() => window.print(), 100);
  }

  function handlePrintSelected() {
    if (selected.size === 0) {
      toast.error("Aucun bordereau selectionne");
      return;
    }
    window.print();
  }

  if (accountLoading) return (
    <div className="space-y-3">
      {Array.from({length: 4}).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />)}
    </div>
  );

  if (!linked) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <Printer className="h-10 w-10 text-foreground/24" />
      <div>
        <h2 className="text-base font-semibold text-foreground">Compte Vinted non connecte</h2>
        <p className="mt-1 text-sm text-foreground/48">Connectez votre compte pour voir vos bordereaux.</p>
      </div>
      <Button asChild size="sm">
        <Link href="/account">Connecter mon compte</Link>
      </Button>
    </div>
  );

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .print-label {
            page-break-inside: avoid;
            break-inside: avoid;
            border: 1.5px solid #000 !important;
            border-radius: 6px !important;
            padding: 20px !important;
            margin-bottom: 12px !important;
            background: #fff !important;
            color: #000 !important;
          }
          .print-label[data-selected="false"] { display: none !important; }
          .print-label .label-identifier {
            font-size: 28pt !important;
            font-weight: 800 !important;
            color: #000 !important;
          }
          .print-label .label-detail { color: #000 !important; font-size: 10pt !important; }
          .print-label .label-badge { border: 1px solid #000 !important; background: transparent !important; color: #000 !important; }
          .print-grid { display: grid !important; grid-template-columns: 1fr !important; gap: 12px !important; }
          @page { size: A4; margin: 15mm; }
        }
      `}</style>

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between no-print">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Bordereaux d&apos;envoi</h1>
            <p className="text-sm text-foreground/48 mt-0.5">Imprimez vos bordereaux avec identification rapide</p>
          </div>
          <Button onClick={fetchOrders} disabled={loading} variant="ghost" size="sm" className="gap-1.5 text-foreground/48 hover:text-foreground/72">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5 no-print">
          {([
            { key: "all" as FilterStatus, label: "Tous" },
            { key: "to_ship" as FilterStatus, label: "A expedier" },
            { key: "shipped" as FilterStatus, label: "Expedies" },
          ]).map(f => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setSelected(new Set()); }}
              className={`rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors ${
                filter === f.key
                  ? "bg-foreground text-background"
                  : "text-foreground/48 hover:bg-accent hover:text-foreground/72"
              }`}
            >
              {f.label}
            </button>
          ))}
          <div className="h-4 w-px bg-border/50 mx-1" />
          <span className="text-[11px] text-foreground/36">{filteredOrders.length} bordereau{filteredOrders.length !== 1 ? "x" : ""}</span>
        </div>

        {/* Action bar */}
        {filteredOrders.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/50 bg-card px-4 py-2.5 no-print">
            <button onClick={selectAll} className="flex items-center gap-2 text-[13px] font-medium text-foreground/48 hover:text-foreground/72 transition-colors">
              {selected.size === filteredOrders.length ? (
                <SquareCheck className="h-4 w-4 text-foreground/72" />
              ) : selected.size > 0 ? (
                <CheckSquare className="h-4 w-4 text-foreground/72" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              {selected.size === 0 ? "Tout selectionner" : selected.size === filteredOrders.length ? "Tout deselectionner" : `${selected.size} selectionne${selected.size > 1 ? "s" : ""}`}
            </button>

            <div className="h-4 w-px bg-border/50" />

            <Button onClick={handlePrintAll} size="sm" className="gap-1.5 text-xs h-7">
              <Printer className="h-3 w-3" />
              Imprimer tout
            </Button>

            {selected.size > 0 && (
              <Button onClick={handlePrintSelected} size="sm" variant="secondary" className="gap-1.5 text-xs h-7">
                <Printer className="h-3 w-3" />
                Imprimer selection ({selected.size})
              </Button>
            )}
          </div>
        )}

        {/* Labels grid */}
        {loading && orders.length === 0 ? (
          <div className="space-y-3">
            {Array.from({length: 4}).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex h-[40vh] flex-col items-center justify-center gap-3 text-center">
            <Package className="h-10 w-10 text-foreground/20" />
            <p className="text-foreground/48">Aucun bordereau a afficher</p>
          </div>
        ) : (
          <div className="print-area">
            <div className="print-grid grid gap-3 md:grid-cols-2">
              {filteredOrders.map(order => {
                const status = getStatus(order);
                const title = order.title;
                const identifier = getFirstThreeWords(title);
                const date = order.date ? new Date(order.date).toLocaleDateString("fr-FR") : "\u2014";
                const isSelected = selected.has(order.transaction_id);

                return (
                  <div
                    key={order.transaction_id}
                    data-selected={isSelected ? "true" : "false"}
                    className={`print-label group relative overflow-hidden rounded-xl border bg-card transition-all ${
                      isSelected ? "border-foreground/20 ring-1 ring-foreground/10" : "border-border/50"
                    }`}
                  >
                    {/* Checkbox */}
                    <button onClick={() => toggleSelect(order.transaction_id)} className="absolute top-3 right-3 z-10 no-print">
                      {isSelected ? (
                        <SquareCheck className="h-5 w-5 text-foreground/72" />
                      ) : (
                        <Square className="h-5 w-5 text-foreground/24 group-hover:text-foreground/48 transition-colors" />
                      )}
                    </button>

                    {/* Identifier */}
                    <div className="border-b border-border/30 px-5 py-3">
                      <p className="label-identifier text-xl font-bold text-foreground leading-tight tracking-tight">
                        {identifier}
                      </p>
                      <p className="label-detail text-[11px] text-foreground/36 mt-0.5">
                        Commande #{order.transaction_id}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="px-5 py-3.5 space-y-2.5">
                      <div className="flex items-center justify-end">
                        <span className={`label-badge inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>

                      <div>
                        <p className="label-detail text-[10px] uppercase tracking-wider text-foreground/32">Article</p>
                        <p className="label-detail text-[13px] font-medium text-foreground/90 line-clamp-2">{title}</p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div>
                          <p className="label-detail text-[10px] uppercase tracking-wider text-foreground/32">Prix</p>
                          <p className="label-detail text-[13px] font-semibold text-foreground">{getPrice(order)}</p>
                        </div>
                        <div>
                          <p className="label-detail text-[10px] uppercase tracking-wider text-foreground/32">Date</p>
                          <p className="label-detail text-[13px] font-medium text-foreground/72">{date}</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-dashed border-border/30 px-5 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] text-foreground/32">
                          <Package className="h-3 w-3" />
                          <span>Voyted</span>
                        </div>
                        <span className="text-[10px] text-foreground/24 font-mono">#{order.transaction_id}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
