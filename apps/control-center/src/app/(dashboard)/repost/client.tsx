"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, Heart, RefreshCw, Package, Copy, Shield, Info, AlertTriangle, CheckSquare, Square, SquareCheck } from "lucide-react";
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

type RepostMode = "draft" | "direct";

export default function RepostClient() {
  const { linked, loading: accountLoading } = useVintedAccount();
  const [items, setItems] = useState<VintedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [orientation, setOrientation] = useState(2);
  const [mode, setMode] = useState<RepostMode>("draft");
  const [reposting, setReposting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/items/my-items", { cache: "no-store" });
      const data = await res.json();
      setItems(data.items || []);
      setSelected(new Set());
    } catch {
      toast.error("Impossible de charger les articles");
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
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map(i => i.id)));
    }
  }

  async function handleBatchRepost() {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    setReposting(true);
    setProgress({ done: 0, total: ids.length });

    let success = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        const res = await fetch("/api/items/repost", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item_id: id,
            orientation,
            as_draft: mode === "draft",
          }),
        });
        if (res.ok) success++;
        else failed++;
      } catch {
        failed++;
      }
      setProgress(prev => ({ ...prev, done: prev.done + 1 }));
      await new Promise(r => setTimeout(r, 2000));
    }

    setReposting(false);
    setSelected(new Set());

    if (failed === 0) {
      toast.success(`${success} article${success > 1 ? "s" : ""} repost${success > 1 ? "s" : "e"} avec succes !`);
    } else {
      toast.warning(`${success} reussi${success > 1 ? "s" : ""}, ${failed} echoue${failed > 1 ? "s" : ""}`);
    }
    fetchItems();
  }

  if (accountLoading) return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({length: 8}).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />)}
    </div>
  );

  if (!linked) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Copy className="h-8 w-8 text-foreground/24" />
      </div>
      <div>
        <h2 className="text-base font-semibold">Compte Vinted non connecte</h2>
        <p className="mt-1 text-sm text-foreground/48">Connectez votre compte pour repost vos articles.</p>
      </div>
      <Button asChild size="sm">
        <Link href="/account">Connecter mon compte</Link>
      </Button>
    </div>
  );

  const orientationOptions = [0, 1, 2, 3];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Repost</h1>
          <p className="text-sm text-foreground/48 mt-1">Repostez vos articles en toute securite vers les brouillons</p>
        </div>
        <Button onClick={fetchItems} disabled={loading} variant="ghost" className="gap-2 text-foreground/48 hover:text-foreground/72">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-border/50 bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Info className="h-4 w-4 text-foreground/32" />
          </div>
          <div className="space-y-1.5 text-sm">
            <p className="font-medium">Comment ca fonctionne</p>
            <ul className="space-y-1 text-foreground/48">
              <li className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-foreground/32 shrink-0" />
                Les articles sont repostes vers vos brouillons Vinted
              </li>
              <li className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-foreground/32 shrink-0" />
                Vous publiez manuellement depuis Vinted quand vous voulez
              </li>
              <li className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-foreground/32 shrink-0" />
                Les photos sont legerement modifiees pour eviter la detection
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Selection bar */}
      {items.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3">
          <button onClick={selectAll} className="flex items-center gap-2 text-sm font-medium text-foreground/48 hover:text-foreground transition-colors">
            {selected.size === items.length ? (
              <SquareCheck className="h-5 w-5 text-foreground/72" />
            ) : selected.size > 0 ? (
              <CheckSquare className="h-5 w-5 text-foreground/72" />
            ) : (
              <Square className="h-5 w-5" />
            )}
            {selected.size === 0 ? "Tout selectionner" : selected.size === items.length ? "Tout deselectionner" : `${selected.size} selectionne${selected.size > 1 ? "s" : ""}`}
          </button>

          {selected.size > 0 && (
            <>
              <div className="h-5 w-px bg-border/50" />
              <span className="text-xs text-foreground/36">{items.length} article{items.length !== 1 ? "s" : ""} au total</span>
            </>
          )}
        </div>
      )}

      {/* Items grid */}
      {loading && items.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({length: 6}).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="flex h-[40vh] flex-col items-center justify-center gap-3 text-center">
          <Package className="h-12 w-12 text-foreground/24" />
          <p className="text-foreground/48">Aucun article en vente</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map(item => {
            const photo = item.photos?.[0]?.thumbnail_url || item.photos?.[0]?.url;
            const isSelected = selected.has(item.id);
            return (
              <div
                key={item.id}
                className={`group relative overflow-hidden rounded-xl border bg-card transition-all hover:bg-accent/40 ${
                  isSelected ? "border-foreground/48 ring-2 ring-foreground/12" : "border-border/50"
                }`}
              >
                {/* Checkbox overlay */}
                <button
                  onClick={() => toggleSelect(item.id)}
                  className="absolute top-2 left-2 z-10"
                >
                  {isSelected ? (
                    <SquareCheck className="h-6 w-6 text-foreground/72 drop-shadow-md" />
                  ) : (
                    <Square className="h-6 w-6 text-white/70 drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>

                {/* Photo */}
                <div
                  className="relative h-48 overflow-hidden bg-muted cursor-pointer"
                  onClick={() => toggleSelect(item.id)}
                >
                  {photo ? (
                    <img src={photo} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-12 w-12 text-foreground/24" />
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
                  <div className="flex items-center gap-1.5 text-xs text-foreground/48">
                    {item.brand_title && <span>{item.brand_title}</span>}
                    {item.brand_title && item.size_title && <span>·</span>}
                    {item.size_title && <span>{item.size_title}</span>}
                  </div>
                  <span className="text-base font-semibold text-foreground/90">{getPrice(item)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky bottom repost settings panel */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-card/95 backdrop-blur-xl lg:left-60">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Orientation */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground/48">Inclinaison photo</span>
                <div className="flex gap-1">
                  {orientationOptions.map(deg => (
                    <button
                      key={deg}
                      onClick={() => setOrientation(deg)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                        orientation === deg
                          ? "bg-foreground text-background"
                          : "text-foreground/48 hover:bg-accent"
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-5 w-px bg-border/50" />

              {/* Mode */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground/48">Mode</span>
                <div className="flex rounded-lg bg-muted p-0.5">
                  <button
                    onClick={() => setMode("draft")}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      mode === "draft"
                        ? "bg-foreground text-background shadow-sm"
                        : "text-foreground/48 hover:text-foreground/72"
                    }`}
                  >
                    <Shield className="h-3 w-3" />
                    Vers brouillons
                  </button>
                  <button
                    onClick={() => setMode("direct")}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      mode === "direct"
                        ? "bg-foreground text-background shadow-sm"
                        : "text-foreground/48 hover:text-foreground/72"
                    }`}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Repost direct
                  </button>
                </div>
                {mode === "direct" && (
                  <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-400">
                    Risque
                  </span>
                )}
              </div>

              <div className="ml-auto" />

              {/* Repost button */}
              <Button
                onClick={handleBatchRepost}
                disabled={reposting}
                className="gap-2"
                size="sm"
              >
                <Copy className={`h-4 w-4 ${reposting ? "animate-pulse" : ""}`} />
                {reposting
                  ? `Repost ${progress.done}/${progress.total}...`
                  : `Repost ${selected.size} article${selected.size > 1 ? "s" : ""}`
                }
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom spacer when panel is visible */}
      {selected.size > 0 && <div className="h-20" />}
    </div>
  );
}
