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
    green: { bg: "bg-emerald-500/10", fill: "bg-emerald-500", thumb: "bg-emerald-400 border-emerald-300" },
    orange: { bg: "bg-foreground/5", fill: "bg-foreground/40", thumb: "bg-foreground/60 border-foreground/40" },
    red: { bg: "bg-red-500/10", fill: "bg-red-500", thumb: "bg-red-400 border-red-300" },
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

function OfferPreview({ rule }: { rule: { minAcceptPercent: number; counterPercent: number; declinePercent: number } }) {
  const price = 50;
  const scenarios = [
    { pct: 84, label: `${price * 0.84}` },
    { pct: 70, label: `${price * 0.70}` },
    { pct: 40, label: `${price * 0.40}` },
  ];

  return (
    <div className="rounded-lg bg-accent/40 p-3 space-y-2">
      <p className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Apercu - Article a {price}</p>
      {scenarios.map(({ pct, label }) => {
        let action: string;
        let color: string;
        let icon: React.ReactNode;

        if (pct >= rule.minAcceptPercent) {
          action = "Acceptee";
          color = "text-emerald-400";
          icon = <Check className="h-3.5 w-3.5" />;
        } else if (pct >= rule.declinePercent) {
          action = `Contre-offre a ${rule.counterPercent}%`;
          color = "text-foreground/48";
          icon = <ArrowRightLeft className="h-3.5 w-3.5" />;
        } else {
          action = "Refusee";
          color = "text-red-400";
          icon = <X className="h-3.5 w-3.5" />;
        }

        return (
          <div key={pct} className="flex items-center justify-between text-sm">
            <span className="text-foreground/48">
              Offre de {label} ({pct}%)
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

export default function SmartOffersClient() {
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

  async function handleToggleActive(rule: SmartOfferRule) {
    try {
      const res = await fetch(`/api/smart-offers/${rule.id}`, {
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

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/smart-offers/${id}`, { method: "DELETE" });
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
          <h1 className="text-lg font-semibold">Smart Offers</h1>
          <p className="text-sm text-foreground/48 mt-1">
            Gerez automatiquement les offres recues sur vos articles
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle regle
        </Button>
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
          <p className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Inactives</p>
          <p className="mt-1 text-2xl font-semibold text-foreground/48">
            {rules.filter(r => !r.isActive).length}
          </p>
        </div>
      </div>

      {/* Rules list */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="flex h-[40vh] flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/40">
            <Zap className="h-8 w-8 text-foreground/24" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Aucune regle</h2>
            <p className="mt-1 text-sm text-foreground/48">
              Creez votre premiere regle d&apos;offre intelligente.
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
                    <Zap className="h-4 w-4 flex-shrink-0 text-foreground/32" />
                    <h3 className="font-semibold truncate">{rule.name}</h3>
                  </div>
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={() => handleToggleActive(rule)}
                  />
                </div>

                {/* Threshold badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    Accepter &ge;{rule.minAcceptPercent}%
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/40 px-2.5 py-0.5 text-xs font-medium text-foreground/48">
                    <ArrowRightLeft className="h-3 w-3" />
                    Contre-offre {rule.counterPercent}%
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
                    <TrendingDown className="h-3 w-3" />
                    Refuser &lt;{rule.declinePercent}%
                  </span>
                </div>

                {/* Price range */}
                {(rule.minPrice || rule.maxPrice) && (
                  <div className="flex items-center gap-2 text-xs text-foreground/48">
                    {rule.minPrice && <span>Min: {rule.minPrice}</span>}
                    {rule.minPrice && rule.maxPrice && <span>-</span>}
                    {rule.maxPrice && <span>Max: {rule.maxPrice}</span>}
                  </div>
                )}

                {/* Options */}
                <div className="flex items-center gap-3 text-xs text-foreground/48">
                  {rule.autoAccept && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
                      <Check className="h-3 w-3" /> Auto-accept
                    </span>
                  )}
                  {rule.autoCounter && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/40 px-2 py-0.5 text-foreground/48">
                      <ArrowRightLeft className="h-3 w-3" /> Auto-counter
                    </span>
                  )}
                </div>

                {/* Preview */}
                <OfferPreview rule={rule} />

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
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Modifier la regle" : "Nouvelle regle"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Modifiez les parametres de votre regle d'offre."
                : "Definissez comment reagir aux offres recues."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la regle</Label>
              <Input
                id="name"
                placeholder="Ex: Regle vetements"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>

            {/* Accept threshold */}
            <PercentSlider
              value={form.minAcceptPercent}
              onChange={v => setForm(f => ({ ...f, minAcceptPercent: v }))}
              color="green"
              label="Accepter si offre &ge;"
            />

            {/* Counter percent */}
            <PercentSlider
              value={form.counterPercent}
              onChange={v => setForm(f => ({ ...f, counterPercent: v }))}
              color="orange"
              label="Contre-proposer a"
            />

            {/* Decline threshold */}
            <PercentSlider
              value={form.declinePercent}
              onChange={v => setForm(f => ({ ...f, declinePercent: v }))}
              color="red"
              label="Refuser si offre &lt;"
            />

            {/* Auto toggles */}
            <div className="space-y-3 rounded-xl border border-border/50 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto-accept</p>
                  <p className="text-xs text-foreground/48">Accepter automatiquement les offres au-dessus du seuil</p>
                </div>
                <Switch
                  checked={form.autoAccept}
                  onCheckedChange={v => setForm(f => ({ ...f, autoAccept: v }))}
                />
              </div>
              <div className="h-px bg-border/30" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Auto-counter</p>
                  <p className="text-xs text-foreground/48">Envoyer automatiquement une contre-offre</p>
                </div>
                <Switch
                  checked={form.autoCounter}
                  onCheckedChange={v => setForm(f => ({ ...f, autoCounter: v }))}
                />
              </div>
            </div>

            {/* Price range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="minPrice">Prix min</Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="Optionnel"
                  value={form.minPrice}
                  onChange={e => setForm(f => ({ ...f, minPrice: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPrice">Prix max</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="Optionnel"
                  value={form.maxPrice}
                  onChange={e => setForm(f => ({ ...f, maxPrice: e.target.value }))}
                />
              </div>
            </div>

            {/* Live preview */}
            <OfferPreview rule={form} />
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
