"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus,
  Zap,
  Pencil,
  Trash2,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
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

type SmartOfferRule = {
  id: string;
  name: string;
  isActive: boolean;
  minAcceptPercent: number;
  counterPercent: number;
  autoAccept: boolean;
  autoCounter: boolean;
  declinePercent: number;
  minPrice: number | null;
  maxPrice: number | null;
  createdAt: string;
};

type FormData = {
  name: string;
  minAcceptPercent: number;
  counterPercent: number;
  autoAccept: boolean;
  autoCounter: boolean;
  declinePercent: number;
  minPrice: string;
  maxPrice: string;
};

const DEFAULT_FORM: FormData = {
  name: "",
  minAcceptPercent: 80,
  counterPercent: 90,
  autoAccept: false,
  autoCounter: true,
  declinePercent: 50,
  minPrice: "",
  maxPrice: "",
};

function PercentSlider({
  value,
  onChange,
  color,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  color: string;
  label: string;
}) {
  const colorMap: Record<string, { bg: string; fill: string; thumb: string }> = {
    green: {
      bg: "bg-emerald-500/10",
      fill: "bg-emerald-500",
      thumb: "bg-emerald-400 border-emerald-300",
    },
    orange: {
      bg: "bg-foreground/5",
      fill: "bg-foreground/40",
      thumb: "bg-foreground/60 border-foreground/40",
    },
    red: {
      bg: "bg-red-500/10",
      fill: "bg-red-500",
      thumb: "bg-red-400 border-red-300",
    },
  };
  const c = colorMap[color] || colorMap.green;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-semibold tabular-nums">{value}%</span>
      </div>
      <div
        className={`relative h-3 rounded-full ${c.bg} cursor-pointer`}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
          onChange(Math.max(0, Math.min(100, pct)));
        }}
        onMouseDown={(e) => {
          const slider = e.currentTarget;
          const move = (ev: MouseEvent) => {
            const rect = slider.getBoundingClientRect();
            const pct = Math.round(((ev.clientX - rect.left) / rect.width) * 100);
            onChange(Math.max(0, Math.min(100, pct)));
          };
          const up = () => {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
          };
          document.addEventListener("mousemove", move);
          document.addEventListener("mouseup", up);
        }}
      >
        <div
          className={`absolute left-0 top-0 h-full rounded-full ${c.fill} transition-all`}
          style={{ width: `${value}%` }}
        />
        <div
          className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full border-2 ${c.thumb} shadow-md transition-all`}
          style={{ left: `calc(${value}% - 10px)` }}
        />
      </div>
    </div>
  );
}

function OfferPreview({
  rule,
}: {
  rule: { minAcceptPercent: number; counterPercent: number; declinePercent: number };
}) {
  const price = 50;
  const scenarios = [
    { pct: 84, label: `${price * 0.84}` },
    { pct: 70, label: `${price * 0.7}` },
    { pct: 40, label: `${price * 0.4}` },
  ];

  return (
    <div className="rounded-lg bg-accent/40 p-3 space-y-2">
      <p className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">
        Apercu - Article a {price}
      </p>
      {scenarios.map(({ pct, label }) => {
        let action: string;
        let color: string;
        let icon: React.ReactNode;

        if (pct >= rule.minAcceptPercent) {
          action = "Acceptee";
          color = "text-emerald-400";
          icon = <Check className="h-3.5 w-3.5" />;
        } else if (pct >= rule.declinePercent) {
          action = `Contre ${rule.counterPercent}%`;
          color = "text-foreground/48";
          icon = <ArrowRightLeft className="h-3.5 w-3.5" />;
        } else {
          action = "Refusee";
          color = "text-red-400";
          icon = <X className="h-3.5 w-3.5" />;
        }

        return (
          <div key={pct} className="flex items-center justify-between text-[11px]">
            <span className="text-foreground/48">
              {label} ({pct}%)
            </span>
            <span className={`flex items-center gap-1 font-medium ${color}`}>
              {icon} {action}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function SmartOffersPanel() {
  const [rules, setRules] = useState<SmartOfferRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch("/api/smart-offers", { cache: "no-store" });
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

  function openEdit(rule: SmartOfferRule) {
    setEditingId(rule.id);
    setForm({
      name: rule.name,
      minAcceptPercent: rule.minAcceptPercent,
      counterPercent: rule.counterPercent,
      autoAccept: rule.autoAccept,
      autoCounter: rule.autoCounter,
      declinePercent: rule.declinePercent,
      minPrice: rule.minPrice?.toString() || "",
      maxPrice: rule.maxPrice?.toString() || "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Veuillez entrer un nom");
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      minAcceptPercent: form.minAcceptPercent,
      counterPercent: form.counterPercent,
      autoAccept: form.autoAccept,
      autoCounter: form.autoCounter,
      declinePercent: form.declinePercent,
      minPrice: form.minPrice ? parseFloat(form.minPrice) : null,
      maxPrice: form.maxPrice ? parseFloat(form.maxPrice) : null,
    };

    try {
      const url = editingId ? `/api/smart-offers/${editingId}` : "/api/smart-offers";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");

      toast.success(editingId ? "Mise a jour" : "Creee");
      setDialogOpen(false);
      fetchRules();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(rule: SmartOfferRule) {
    try {
      const res = await fetch(`/api/smart-offers/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !rule.isActive }),
      });
      if (!res.ok) throw new Error();
      setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, isActive: !r.isActive } : r)));
      toast.success(rule.isActive ? "Desactivee" : "Activee");
    } catch {
      toast.error("Erreur lors du changement de statut");
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/smart-offers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setRules((prev) => prev.filter((r) => r.id !== id));
      toast.success("Supprimee");
    } catch {
      toast.error("Erreur");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-foreground/48" />
          <h3 className="text-sm font-semibold">Smart Offers</h3>
        </div>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
          ))
        ) : rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Zap className="h-6 w-6 text-foreground/24 mb-2" />
            <p className="text-xs text-foreground/48">Aucune regle</p>
            <Button size="sm" variant="outline" className="mt-3 h-7 text-[11px]" onClick={openCreate}>
              <Plus className="h-3 w-3 mr-1" /> Creer
            </Button>
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className={`rounded-lg border bg-card p-3 space-y-2 transition-all ${
                rule.isActive ? "border-border/40" : "border-border/20 opacity-60"
              }`}
            >
              {/* Top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Zap className="h-3 w-3 flex-shrink-0 text-foreground/32" />
                  <span className="text-xs font-semibold truncate">{rule.name}</span>
                </div>
                <Switch
                  checked={rule.isActive}
                  onCheckedChange={() => handleToggleActive(rule)}
                  className="scale-75"
                />
              </div>

              {/* Threshold badges */}
              <div className="flex flex-wrap items-center gap-1">
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">
                  <TrendingUp className="h-2.5 w-2.5" />
                  &ge;{rule.minAcceptPercent}%
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-accent/40 px-1.5 py-0.5 text-[9px] font-medium text-foreground/48">
                  <ArrowRightLeft className="h-2.5 w-2.5" />
                  {rule.counterPercent}%
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[9px] font-medium text-red-400">
                  <TrendingDown className="h-2.5 w-2.5" />
                  &lt;{rule.declinePercent}%
                </span>
              </div>

              {/* Options */}
              <div className="flex items-center gap-2 text-[9px] text-foreground/48">
                {rule.autoAccept && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400">
                    <Check className="h-2.5 w-2.5" /> Auto-accept
                  </span>
                )}
                {rule.autoCounter && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-accent/40 px-1.5 py-0.5">
                    <ArrowRightLeft className="h-2.5 w-2.5" /> Auto-counter
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-foreground/48"
                  onClick={() => openEdit(rule)}
                >
                  <Pencil className="h-2.5 w-2.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-400"
                  onClick={() => handleDelete(rule.id)}
                  disabled={deletingId === rule.id}
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier la regle" : "Nouvelle regle"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Modifiez les parametres de votre regle d'offre."
                : "Definissez comment reagir aux offres recues."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                placeholder="Ex: Regle vetements"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <PercentSlider
              value={form.minAcceptPercent}
              onChange={(v) => setForm((f) => ({ ...f, minAcceptPercent: v }))}
              color="green"
              label="Accepter si offre &ge;"
            />

            <PercentSlider
              value={form.counterPercent}
              onChange={(v) => setForm((f) => ({ ...f, counterPercent: v }))}
              color="orange"
              label="Contre-proposer a"
            />

            <PercentSlider
              value={form.declinePercent}
              onChange={(v) => setForm((f) => ({ ...f, declinePercent: v }))}
              color="red"
              label="Refuser si offre &lt;"
            />

            <div className="space-y-3 rounded-xl border border-border/50 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto-accept</p>
                  <p className="text-xs text-foreground/48">Accepter auto au-dessus du seuil</p>
                </div>
                <Switch
                  checked={form.autoAccept}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, autoAccept: v }))}
                />
              </div>
              <div className="h-px bg-border/30" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto-counter</p>
                  <p className="text-xs text-foreground/48">Contre-offre automatique</p>
                </div>
                <Switch
                  checked={form.autoCounter}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, autoCounter: v }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Prix min</Label>
                <Input
                  type="number"
                  placeholder="Optionnel"
                  value={form.minPrice}
                  onChange={(e) => setForm((f) => ({ ...f, minPrice: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Prix max</Label>
                <Input
                  type="number"
                  placeholder="Optionnel"
                  value={form.maxPrice}
                  onChange={(e) => setForm((f) => ({ ...f, maxPrice: e.target.value }))}
                />
              </div>
            </div>

            <OfferPreview rule={form} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "..." : editingId ? "Mettre a jour" : "Creer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
