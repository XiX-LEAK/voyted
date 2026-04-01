"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Download, RefreshCw, Package, Filter, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVintedAccount } from "@/components/account-provider";
import Link from "next/link";
import Papa from "papaparse";

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
  photos: Array<{ url: string }>;
};

const STATUS_MAP: Record<string, string> = {
  completed: "Terminee",
  refunded: "Remboursee",
};

const VINTED_FEE_RATE = 0.05;

function getOrderAmount(order: Order): number {
  return parseFloat(order.price?.amount) || 0;
}

function getItemPrice(item: VintedItem): number {
  if (typeof item.price === "object" && item.price !== null) {
    return parseFloat(item.price.amount) || 0;
  }
  return parseFloat(String(item.price)) || 0;
}

type ExportType = "ventes" | "stock" | "factures";

export default function ExportClient() {
  const { linked, loading: accountLoading } = useVintedAccount();
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<VintedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState<ExportType>("ventes");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const [ordersRes, itemsRes] = await Promise.all([
        fetch("/api/orders/sold", { cache: "no-store" }),
        fetch("/api/items/my-items", { cache: "no-store" }),
      ]);
      const ordersData = await ordersRes.json();
      const itemsData = await itemsRes.json();
      setOrders(ordersData.my_orders || ordersData.orders || []);
      setItems(itemsData.items || []);
    } catch {
      toast.error("Impossible de charger les donnees");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (linked) fetchData();
  }, [linked]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (!o.date) return true;
      const d = new Date(o.date);
      if (dateFrom && d < new Date(dateFrom)) return false;
      if (dateTo && d > new Date(dateTo + "T23:59:59")) return false;
      return true;
    });
  }, [orders, dateFrom, dateTo]);

  const previewData = useMemo(() => {
    if (exportType === "ventes") {
      return filteredOrders.map((o) => {
        const amount = getOrderAmount(o);
        const fees = amount * VINTED_FEE_RATE;
        return {
          Date: o.date ? new Date(o.date).toLocaleDateString("fr-FR") : "—",
          Article: o.title || `Commande #${o.transaction_id}`,
          Prix: amount.toFixed(2),
          Frais: fees.toFixed(2),
          Net: (amount - fees).toFixed(2),
          Statut: STATUS_MAP[o.transaction_user_status] || o.status,
        };
      });
    }

    if (exportType === "stock") {
      return items.map((item) => ({
        Article: item.title,
        Prix: getItemPrice(item).toFixed(2),
        Marque: item.brand_title || "—",
        Taille: item.size_title || "—",
        Vues: String(item.view_count),
        Favoris: String(item.favourite_count),
        Statut: item.status,
      }));
    }

    // factures
    return filteredOrders.map((o, i) => {
      const amount = getOrderAmount(o);
      const fees = amount * VINTED_FEE_RATE;
      const year = new Date().getFullYear();
      return {
        Facture: `FAC-${year}-${String(i + 1).padStart(3, "0")}`,
        Date: o.date ? new Date(o.date).toLocaleDateString("fr-FR") : "—",
        Article: o.title || `Commande #${o.transaction_id}`,
        "Prix de vente": amount.toFixed(2),
        "Frais Vinted (5%)": fees.toFixed(2),
        "Montant net": (amount - fees).toFixed(2),
      };
    });
  }, [exportType, filteredOrders, items]);

  function downloadCSV() {
    if (previewData.length === 0) {
      toast.error("Aucune donnee a exporter");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const csv = Papa.unparse(previewData as any[]);
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const typeLabel = exportType === "ventes" ? "Ventes" : exportType === "stock" ? "Stock" : "Factures";
    a.download = `Voyted-${typeLabel}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Export ${typeLabel} telecharge`);
  }

  const previewColumns = previewData.length > 0 ? Object.keys(previewData[0]) : [];

  if (accountLoading) return <div className="h-96 animate-pulse rounded-lg bg-muted" />;

  if (!linked) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <Download className="h-12 w-12 text-foreground/24" />
      <div>
        <h2 className="text-base font-semibold">Compte Vinted non connecte</h2>
        <p className="mt-1 text-sm text-foreground/48">Connectez votre compte pour exporter vos donnees.</p>
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
          <h1 className="text-lg font-semibold">Export</h1>
          <p className="text-sm text-foreground/48 mt-1">Exportez vos donnees en CSV</p>
        </div>
        <Button onClick={fetchData} disabled={loading} variant="ghost" className="gap-2 text-foreground/48 hover:text-foreground/72">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Export options */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Export type */}
        <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-foreground/32" />
            <p className="text-sm font-semibold">Type d&apos;export</p>
          </div>
          <div className="flex flex-col gap-2">
            {([
              { value: "ventes" as const, label: "Ventes", icon: Package },
              { value: "stock" as const, label: "Stock", icon: Package },
              { value: "factures" as const, label: "Factures", icon: FileText },
            ]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setExportType(opt.value)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  exportType === opt.value
                    ? "bg-foreground text-background"
                    : "text-foreground/48 hover:bg-accent"
                }`}
              >
                <opt.icon className="h-4 w-4" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-foreground/32" />
            <p className="text-sm font-semibold">Periode</p>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-foreground/48">Du</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs text-foreground/48">Au</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="text-xs text-foreground/48 hover:text-foreground/72 transition-colors"
            >
              Reinitialiser les dates
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-foreground/32" />
            <p className="text-sm font-semibold">Actions</p>
          </div>
          <p className="text-xs text-foreground/48">
            {previewData.length} ligne{previewData.length !== 1 ? "s" : ""} a exporter
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => setShowPreview(!showPreview)} variant="ghost" className="gap-2 text-foreground/48 hover:text-foreground/72">
              <Eye className="h-4 w-4" />
              {showPreview ? "Masquer" : "Apercu"}
            </Button>
            <Button onClick={downloadCSV} disabled={previewData.length === 0} className="gap-2" size="sm">
              <Download className="h-4 w-4" />
              Telecharger CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Preview table */}
      {showPreview && (
        <div className="overflow-hidden rounded-xl border border-border/50">
          {previewData.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-foreground/48">Aucune donnee a afficher</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {previewColumns.map((col) => (
                      <th key={col} className="px-4 py-3 text-left text-[11px] font-medium text-foreground/36 uppercase tracking-wider whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 20).map((row, i) => (
                    <tr key={i} className="border-t border-border/30 hover:bg-accent/40 transition-colors">
                      {previewColumns.map((col) => (
                        <td key={col} className="px-4 py-3 text-sm whitespace-nowrap">
                          {(row as Record<string, string>)[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 20 && (
                <div className="border-t border-border/30 px-4 py-3 text-center text-xs text-foreground/36">
                  ... et {previewData.length - 20} ligne{previewData.length - 20 > 1 ? "s" : ""} de plus
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
