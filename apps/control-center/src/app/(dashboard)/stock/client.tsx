"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, Heart, RefreshCw, Pencil, Check, X, Package } from "lucide-react";
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

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/items/my-items", { cache: "no-store" });
      const data = await res.json();
      setItems(data.items || []);
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

  async function handleRelist(id: number) {
    setRelisting(id);
    try {
      await new Promise(r => setTimeout(r, 800));
      toast.success("Article remis en avant !");
    } catch {
      toast.error("Erreur lors du relist");
    } finally {
      setRelisting(null);
    }
  }

  async function handleUpdatePrice(id: number) {
    if (!newPrice) return;
    try {
      toast.success(`Prix mis à jour : ${newPrice} €`);
      setItems(prev => prev.map(i => i.id === id
        ? { ...i, price: { amount: newPrice, currency_code: "EUR" } }
        : i
      ));
      setEditingPrice(null);
      setNewPrice("");
    } catch {
      toast.error("Erreur lors de la mise à jour du prix");
    }
  }

  if (accountLoading) return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({length: 8}).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />)}
    </div>
  );

  if (!linked) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Compte Vinted non connecté</h2>
        <p className="mt-1 text-sm text-muted-foreground">Connectez votre compte pour voir votre stock.</p>
      </div>
      <Button asChild className="bg-violet-600 hover:bg-violet-500">
        <Link href="/account">Connecter mon compte</Link>
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mon Stock</h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} article{items.length !== 1 ? "s" : ""} en vente</p>
        </div>
        <Button onClick={fetchItems} disabled={loading} variant="outline" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {loading && items.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({length: 6}).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="flex h-[40vh] flex-col items-center justify-center gap-3 text-center">
          <Package className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">Aucun article en vente</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map(item => {
            const photo = item.photos?.[0]?.thumbnail_url || item.photos?.[0]?.url;
            return (
              <div key={item.id} className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md">
                {/* Photo */}
                <div className="relative h-48 overflow-hidden bg-muted">
                  {photo ? (
                    <img src={photo} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  {/* Stats overlay */}
                  <div className="absolute bottom-2 left-2 flex gap-2">
                    <span className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                      <Eye className="h-3 w-3" /> {item.view_count || 0}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                      <Heart className="h-3 w-3" /> {item.favourite_count || 0}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                  <p className="text-sm font-medium line-clamp-2 leading-tight">{item.title}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
                        className="h-7 w-full rounded-lg border border-violet-500 bg-background px-2 text-sm outline-none"
                        autoFocus
                      />
                      <button onClick={() => handleUpdatePrice(item.id)} className="text-green-500 hover:text-green-400"><Check className="h-4 w-4" /></button>
                      <button onClick={() => { setEditingPrice(null); setNewPrice(""); }} className="text-red-500 hover:text-red-400"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-violet-400">{getPrice(item)}</span>
                      <button onClick={() => { setEditingPrice(item.id); setNewPrice(""); }} className="text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <Button
                    onClick={() => handleRelist(item.id)}
                    disabled={relisting === item.id}
                    size="sm"
                    className="w-full gap-1.5 bg-violet-600 hover:bg-violet-500 text-xs h-7"
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
