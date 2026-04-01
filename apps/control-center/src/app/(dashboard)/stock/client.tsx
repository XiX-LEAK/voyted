"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, Heart, RefreshCw, Pencil, Check, X, Package, CheckSquare, Square, SquareCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVintedAccount } from "@/components/account-provider";
import Link from "next/link";

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
  url?: string;
};

export default function StockClient() {
  const { linked, loading: accountLoading } = useVintedAccount();
  const [items, setItems] = useState<VintedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPrice, setEditingPrice] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [relisting, setRelisting] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [batchRelisting, setBatchRelisting] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0 });

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/items/my-items", { cache: "no-store" });
      const data = await res.json();
      setItems(data.items || []);
      setSelected(new Set());
    } catch {
      toast.error("Impossible de charger le stock");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (linked) fetchItems();
  }, [linked]);

  function getPrice(item: VintedItem): string {
    if (typeof item.price === "object" && item.price !== null) {
      return `${item.price.amount} ${item.price.currency_code}`;
    }
    return String(item.price);
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
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map(i => i.id)));
  }

  async function handleRelist(id: number) {
    setRelisting(id);
    try {
      const res = await fetch("/api/items/relist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur relist");
      toast.success("Article remis en avant !");
      fetchItems();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur lors du relist");
    } finally {
      setRelisting(null);
    }
  }

  async function handleBatchRelist() {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    setBatchRelisting(true);
    setBatchProgress({ done: 0, total: ids.length });

    let success = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        const res = await fetch("/api/items/relist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_id: id }),
        });
        if (res.ok) success++;
        else failed++;
      } catch {
        failed++;
      }
      setBatchProgress(prev => ({ ...prev, done: prev.done + 1 }));
      await new Promise(r => setTimeout(r, 1500));
    }

    setBatchRelisting(false);
    setSelected(new Set());

    if (failed === 0) toast.success(`${success} article${success > 1 ? "s" : ""} remis en avant !`);
    else toast.warning(`${success} reussi${success > 1 ? "s" : ""}, ${failed} echoue${failed > 1 ? "s" : ""}`);
    fetchItems();
  }

  async function handleUpdatePrice(id: number) {
    if (!newPrice) return;
    try {
      const res = await fetch("/api/items/update-price", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: id, price: newPrice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur prix");
      toast.success(`Prix mis a jour : ${newPrice} EUR`);
      setItems(prev => prev.map(i => i.id === id
        ? { ...i, price: { amount: newPrice, currency_code: "EUR" } }
        : i
      ));
      setEditingPrice(null);
      setNewPrice("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de la mise a jour du prix");
    }
  }

  if (accountLoading) return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({length: 8}).map((_, i) => <div key={i} className="h-56 animate-pulse rounded-xl bg-muted" />)}
    </div>
  );

  if (!linked) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <Package className="h-10 w-10 text-foreground/24" />
      <div>
        <h2 className="text-base font-semibold text-foreground">Compte Vinted non connecte</h2>
        <p className="mt-1 text-sm text-foreground/48">Connectez votre compte pour voir votre stock.</p>
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
          <h1 className="text-lg font-semibold text-foreground">Mon Stock</h1>
          <p className="text-sm text-foreground/48 mt-0.5">{items.length} article{items.length !== 1 ? "s" : ""} en vente</p>
        </div>
        <Button onClick={fetchItems} disabled={loading} variant="ghost" size="sm" className="gap-1.5 text-foreground/48 hover:text-foreground/72">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Selection bar */}
      {items.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card px-4 py-2.5">
          <button onClick={selectAll} className="flex items-center gap-2 text-[13px] font-medium text-foreground/48 hover:text-foreground/72 transition-colors">
            {selected.size === items.length ? (
              <SquareCheck className="h-4 w-4 text-foreground/72" />
            ) : selected.size > 0 ? (
              <CheckSquare className="h-4 w-4 text-foreground/72" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {selected.size === 0 ? "Tout selectionner" : selected.size === items.length ? "Tout deselectionner" : `${selected.size} selectionne${selected.size > 1 ? "s" : ""}`}
          </button>

          {selected.size > 0 && (
            <>
              <div className="h-4 w-px bg-border/50" />
              <Button
                onClick={handleBatchRelist}
                disabled={batchRelisting}
                size="sm"
                className="gap-1.5 text-xs h-7"
              >
                <RefreshCw className={`h-3 w-3 ${batchRelisting ? "animate-spin" : ""}`} />
                {batchRelisting
                  ? `Relist ${batchProgress.done}/${batchProgress.total}...`
                  : `Relister ${selected.size} article${selected.size > 1 ? "s" : ""}`
                }
              </Button>
            </>
          )}
        </div>
      )}

      {/* Items grid */}
      {loading && items.length === 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({length: 6}).map((_, i) => <div key={i} className="h-56 animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="flex h-[40vh] flex-col items-center justify-center gap-3 text-center">
          <Package className="h-10 w-10 text-foreground/20" />
          <p className="text-foreground/48">Aucun article en vente</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map(item => {
            const photo = item.photos?.[0]?.thumbnail_url || item.photos?.[0]?.url;
            const isSelected = selected.has(item.id);
            return (
              <div
                key={item.id}
                className={`group relative overflow-hidden rounded-xl border bg-card transition-all ${
                  isSelected ? "border-foreground/20 ring-1 ring-foreground/10" : "border-border/50 hover:border-border"
                }`}
              >
                {/* Checkbox */}
                <button onClick={() => toggleSelect(item.id)} className="absolute top-2 left-2 z-10">
                  {isSelected ? (
                    <SquareCheck className="h-5 w-5 text-foreground/72 drop-shadow-md" />
                  ) : (
                    <Square className="h-5 w-5 text-white/60 drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>

                {/* Photo */}
                <div className="relative h-44 overflow-hidden bg-muted cursor-pointer" onClick={() => toggleSelect(item.id)}>
                  {photo ? (
                    <img src={photo} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-10 w-10 text-foreground/16" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 flex gap-1.5">
                    <span className="flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] text-white backdrop-blur-sm">
                      <Eye className="h-2.5 w-2.5" /> {item.view_count || 0}
                    </span>
                    <span className="flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] text-white backdrop-blur-sm">
                      <Heart className="h-2.5 w-2.5" /> {item.favourite_count || 0}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                  <p className="text-[13px] font-medium text-foreground/90 line-clamp-2 leading-snug">{item.title}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-foreground/36">
                    {item.brand_title && <span>{item.brand_title}</span>}
                    {item.brand_title && item.size_title && <span>·</span>}
                    {item.size_title && <span>{item.size_title}</span>}
                  </div>

                  {/* Price */}
                  {editingPrice === item.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={newPrice}
                        onChange={e => setNewPrice(e.target.value)}
                        placeholder={getPrice(item).replace(/[^0-9.]/g, "")}
                        className="h-7 w-full rounded-md border border-foreground/20 bg-background px-2 text-sm outline-none focus:border-foreground/40"
                        autoFocus
                      />
                      <button onClick={() => handleUpdatePrice(item.id)} className="text-foreground/56 hover:text-foreground"><Check className="h-3.5 w-3.5" /></button>
                      <button onClick={() => { setEditingPrice(null); setNewPrice(""); }} className="text-foreground/36 hover:text-foreground/56"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{getPrice(item)}</span>
                      <button onClick={() => { setEditingPrice(item.id); setNewPrice(""); }} className="text-foreground/32 hover:text-foreground/56 transition-colors">
                        <Pencil className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {/* Relist */}
                  <Button
                    onClick={() => handleRelist(item.id)}
                    disabled={relisting === item.id || batchRelisting}
                    size="sm"
                    variant="secondary"
                    className="w-full gap-1.5 text-xs h-7"
                  >
                    <RefreshCw className={`h-3 w-3 ${relisting === item.id ? "animate-spin" : ""}`} />
                    {relisting === item.id ? "Relist..." : "Relister"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
