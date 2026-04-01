"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus,
  MessageSquare,
  Pencil,
  Trash2,
  Clock,
  Zap,
  MessageCircle,
  Search,
  Mail,
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

type Template = {
  id: string;
  name: string;
  trigger: string;
  message: string;
  isActive: boolean;
  delay: number;
  createdAt: string;
};

type FormData = {
  name: string;
  trigger: string;
  message: string;
  delay: number;
};

const TRIGGER_OPTIONS: {
  value: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    value: "any",
    label: "Tous les messages",
    icon: <Mail className="h-4 w-4" />,
    description: "Repond a chaque nouveau message",
  },
  {
    value: "first",
    label: "Premier message",
    icon: <MessageCircle className="h-4 w-4" />,
    description: "Seulement le premier message",
  },
  {
    value: "keyword",
    label: "Mot-cle",
    icon: <Search className="h-4 w-4" />,
    description: "Quand le message contient un mot",
  },
];

function getTriggerLabel(trigger: string): string {
  if (trigger === "any") return "Tous";
  if (trigger === "first") return "1er msg";
  if (trigger.startsWith("keyword:")) return `"${trigger.replace("keyword:", "")}"`;
  return trigger;
}

const DEFAULT_FORM: FormData = { name: "", trigger: "any", message: "", delay: 0 };

export function AutoReplyPanel() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [keyword, setKeyword] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/auto-reply", { cache: "no-store" });
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch {
      toast.error("Impossible de charger les templates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  function openCreate() {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setKeyword("");
    setDialogOpen(true);
  }

  function openEdit(template: Template) {
    setEditingId(template.id);
    const isKeyword = template.trigger.startsWith("keyword:");
    setForm({
      name: template.name,
      trigger: isKeyword ? "keyword" : template.trigger,
      message: template.message,
      delay: template.delay,
    });
    setKeyword(isKeyword ? template.trigger.replace("keyword:", "") : "");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.message.trim()) {
      toast.error("Veuillez remplir le nom et le message");
      return;
    }
    if (form.trigger === "keyword" && !keyword.trim()) {
      toast.error("Veuillez entrer un mot-cle");
      return;
    }

    setSaving(true);
    const triggerValue = form.trigger === "keyword" ? `keyword:${keyword.trim()}` : form.trigger;
    const payload = {
      name: form.name.trim(),
      trigger: triggerValue,
      message: form.message,
      delay: form.delay,
    };

    try {
      const url = editingId ? `/api/auto-reply/${editingId}` : "/api/auto-reply";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");

      toast.success(editingId ? "Mis a jour" : "Cree");
      setDialogOpen(false);
      fetchTemplates();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(template: Template) {
    try {
      const res = await fetch(`/api/auto-reply/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !template.isActive }),
      });
      if (!res.ok) throw new Error();
      setTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? { ...t, isActive: !t.isActive } : t))
      );
      toast.success(template.isActive ? "Desactive" : "Active");
    } catch {
      toast.error("Erreur lors du changement de statut");
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/auto-reply/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Supprime");
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
          <MessageSquare className="h-4 w-4 text-foreground/48" />
          <h3 className="text-sm font-semibold">Auto-Reponse</h3>
        </div>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="h-6 w-6 text-foreground/24 mb-2" />
            <p className="text-xs text-foreground/48">Aucune regle</p>
            <Button size="sm" variant="outline" className="mt-3 h-7 text-[11px]" onClick={openCreate}>
              <Plus className="h-3 w-3 mr-1" /> Creer
            </Button>
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className={`rounded-lg border bg-card p-3 space-y-2 transition-all ${
                template.isActive ? "border-border/40" : "border-border/20 opacity-60"
              }`}
            >
              {/* Top row: name + switch */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Zap className="h-3 w-3 flex-shrink-0 text-foreground/32" />
                  <span className="text-xs font-semibold truncate">{template.name}</span>
                </div>
                <Switch
                  checked={template.isActive}
                  onCheckedChange={() => handleToggleActive(template)}
                  className="scale-75"
                />
              </div>

              {/* Trigger + delay badges */}
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center rounded-full bg-accent/40 px-1.5 py-0.5 text-[9px] font-medium text-foreground/72">
                  {getTriggerLabel(template.trigger)}
                </span>
                {template.delay > 0 && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-accent/40 px-1.5 py-0.5 text-[9px] text-foreground/48">
                    <Clock className="h-2.5 w-2.5" />
                    {template.delay}s
                  </span>
                )}
              </div>

              {/* Message preview */}
              <p className="text-[11px] text-foreground/48 line-clamp-2">{template.message}</p>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-foreground/48"
                  onClick={() => openEdit(template)}
                >
                  <Pencil className="h-2.5 w-2.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-400"
                  onClick={() => handleDelete(template.id)}
                  disabled={deletingId === template.id}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier" : "Nouveau template"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Modifiez les parametres de votre reponse automatique."
                : "Creez un nouveau template de reponse automatique."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                placeholder="Ex: Reponse rapide"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Declencheur</Label>
              <div className="grid gap-2">
                {TRIGGER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, trigger: option.value }))}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                      form.trigger === option.value
                        ? "border-foreground/24 bg-accent/40"
                        : "border-border/50 hover:border-border/80"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        form.trigger === option.value
                          ? "bg-foreground/10 text-foreground/72"
                          : "bg-accent/40 text-foreground/32"
                      }`}
                    >
                      {option.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{option.label}</p>
                      <p className="text-xs text-foreground/48">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {form.trigger === "keyword" && (
              <div className="space-y-2">
                <Label>Mot-cle</Label>
                <Input
                  placeholder="Ex: disponible, prix, taille"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Message</Label>
              <textarea
                rows={4}
                placeholder="Bonjour {buyer_name}, merci pour votre interet..."
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="dark:bg-input/30 border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
              <div className="flex flex-wrap gap-1.5">
                {["{buyer_name}", "{item_title}", "{item_price}"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, message: f.message + tag }))}
                    className="rounded-md bg-accent/40 px-2 py-0.5 text-xs text-foreground/48 hover:text-foreground/72 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Delai (secondes)</Label>
              <Input
                type="number"
                min={0}
                max={300}
                placeholder="0"
                value={form.delay || ""}
                onChange={(e) => setForm((f) => ({ ...f, delay: parseInt(e.target.value) || 0 }))}
              />
              <p className="text-xs text-foreground/48">0 = envoi immediat.</p>
            </div>
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
