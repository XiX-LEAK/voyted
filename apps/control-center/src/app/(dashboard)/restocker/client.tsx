"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus,
  RotateCcw,
  Pencil,
  Trash2,
  Minus,
  Info,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type RestockRule = {
  id: string;
  itemTitle: string;
  stockCount: number;
  autoRepost: boolean;
  isActive: boolean;
  createdAt: string;
};

type FormData = {
  itemTitle: string;
  stockCount: number;
  autoRepost: boolean;
};

const DEFAULT_FORM: FormData = { itemTitle: "", stockCount: 1, autoRepost: true };

export default function RestockerClient() {
  const [rules, setRules] = useState<RestockRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch("/api/restocker", { cache: "no-store" });
      const data = await res.json();
      setRules(data.rules || []);
    } catch {
      toast.error("Impossible de charger les regles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  function openCreate() {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setDialogOpen(true);
  }

  function openEdit(rule: RestockRule) {
    setEditingId(rule.id);
    setForm({
      itemTitle: rule.itemTitle,
      stockCount: rule.stockCount,
      autoRepost: rule.autoRepost,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.itemTitle.trim()) {
      toast.error("Veuillez entrer un titre d'article");
      return;
    }

    setSaving(true);
    const payload = {
      itemTitle: form.itemTitle.trim(),
      stockCount: form.stockCount,
      autoRepost: form.autoRepost,
    };

    try {
      const url = editingId ? `/api/restocker/${editingId}` : "/api/restocker";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");

      toast.success(editingId ? "Regle mise a jour" : "Regle creee");
      setDialogOpen(false);
      fetchRules();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur lors de la sauvegarde";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(rule: RestockRule) {
    try {
      const res = await fetch(`/api/restocker/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !rule.isActive }),
      });
      if (!res.ok) throw new Error();
      setRules(prev =>
        prev.map(r => r.id === rule.id ? { ...r, isActive: !r.isActive } : r)
      );
      toast.success(rule.isActive ? "Regle desactivee" : "Regle activee");
    } catch {
      toast.error("Erreur lors du changement de statut");
    }
  }

  async function handleToggleAutoRepost(rule: RestockRule) {
    try {
      const res = await fetch(`/api/restocker/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoRepost: !rule.autoRepost }),
      });
      if (!res.ok) throw new Error();
      setRules(prev =>
        prev.map(r => r.id === rule.id ? { ...r, autoRepost: !r.autoRepost } : r)
      );
      toast.success(rule.autoRepost ? "Auto-repost desactive" : "Auto-repost active");
    } catch {
      toast.error("Erreur lors du changement");
    }
  }

  async function handleUpdateStock(rule: RestockRule, delta: number) {
    const newCount = Math.max(0, rule.stockCount + delta);
    try {
      const res = await fetch(`/api/restocker/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockCount: newCount }),
      });
      if (!res.ok) throw new Error();
      setRules(prev =>
        prev.map(r => r.id === rule.id ? { ...r, stockCount: newCount } : r)
      );
    } catch {
      toast.error("Erreur lors de la mise a jour du stock");
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/restocker/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setRules(prev => prev.filter(r => r.id !== id));
      toast.success("Regle supprimee");
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">Restocker</h1>
          <p className="text-sm text-foreground/48 mt-1">
            Gerez le restockage automatique de vos articles
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle regle
        </Button>
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-foreground/32 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Comment fonctionne le Restocker ?</p>
            <p className="mt-1 text-sm text-foreground/48">
              Definissez des regles pour vos articles recurrents. Quand un article est vendu,
              le restocker peut automatiquement republier une nouvelle annonce identique.
              Gerez le stock disponible et activez le repost automatique pour ne jamais
              manquer une vente.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 rounded-xl bg-border/60 gap-px overflow-hidden">
        <div className="bg-card p-4">
          <p className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Regles</p>
          <p className="mt-1 text-2xl font-semibold">{rules.length}</p>
        </div>
        <div className="bg-card p-4">
          <p className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Actives</p>
          <p className="mt-1 text-2xl font-semibold">
            {rules.filter(r => r.isActive).length}
          </p>
        </div>
        <div className="bg-card p-4">
          <p className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Stock total</p>
          <p className="mt-1 text-2xl font-semibold">
            {rules.reduce((sum, r) => sum + r.stockCount, 0)}
          </p>
        </div>
      </div>

      {/* Rules list */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="flex h-[40vh] flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/40">
            <Package className="h-8 w-8 text-foreground/24" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Aucune regle de restockage</h2>
            <p className="mt-1 text-sm text-foreground/48">
              Creez votre premiere regle pour automatiser le restockage.
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Creer une regle
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rules.map(rule => (
            <div
              key={rule.id}
              className={`relative overflow-hidden rounded-xl border bg-card transition-all ${
                rule.isActive ? "border-border/60" : "border-border/30 opacity-60"
              }`}
            >
              <div className="p-4 space-y-3">
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <RotateCcw className="h-4 w-4 flex-shrink-0 text-foreground/32" />
                    <h3 className="font-semibold truncate">{rule.itemTitle}</h3>
                  </div>
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={() => handleToggleActive(rule)}
                  />
                </div>

                {/* Stock counter */}
                <div className="flex items-center justify-between rounded-lg bg-accent/40 p-3">
                  <span className="text-sm font-medium">Stock disponible</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateStock(rule, -1)}
                      disabled={rule.stockCount <= 0}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 bg-card text-foreground/48 hover:text-foreground/72 transition-colors disabled:opacity-40"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-lg font-semibold tabular-nums">
                      {rule.stockCount}
                    </span>
                    <button
                      onClick={() => handleUpdateStock(rule, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 bg-card text-foreground/48 hover:text-foreground/72 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Auto-repost toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Auto-repost</p>
                    <p className="text-xs text-foreground/48">Republier apres une vente</p>
                  </div>
                  <Switch
                    checked={rule.autoRepost}
                    onCheckedChange={() => handleToggleAutoRepost(rule)}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs h-7 text-foreground/48 hover:text-foreground/72"
                    onClick={() => openEdit(rule)}
                  >
                    <Pencil className="h-3 w-3" />
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs h-7 text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(rule.id)}
                    disabled={deletingId === rule.id}
                  >
                    <Trash2 className="h-3 w-3" />
                    {deletingId === rule.id ? "..." : "Supprimer"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Modifier la regle" : "Nouvelle regle de restockage"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Modifiez les parametres de cette regle."
                : "Definissez un article a restocker automatiquement."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="rs-title">Titre de l&apos;article</Label>
              <Input
                id="rs-title"
                placeholder="Ex: T-shirt Nike noir taille M"
                value={form.itemTitle}
                onChange={e => setForm(f => ({ ...f, itemTitle: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rs-stock">Stock initial</Label>
              <Input
                id="rs-stock"
                type="number"
                min={0}
                value={form.stockCount}
                onChange={e => setForm(f => ({ ...f, stockCount: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/50 p-3">
              <div>
                <p className="text-sm font-medium">Auto-repost</p>
                <p className="text-xs text-foreground/48">Republier automatiquement apres vente</p>
              </div>
              <Switch
                checked={form.autoRepost}
                onCheckedChange={v => setForm(f => ({ ...f, autoRepost: v }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2"
            >
              {saving ? "Enregistrement..." : editingId ? "Mettre a jour" : "Creer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
