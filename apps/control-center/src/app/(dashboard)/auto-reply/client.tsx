"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus,
  MessageSquareText,
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

const TRIGGER_OPTIONS: { value: string; label: string; icon: React.ReactNode; description: string }[] = [
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
    description: "Seulement le premier message d'une conversation",
  },
  {
    value: "keyword",
    label: "Contient un mot-cle",
    icon: <Search className="h-4 w-4" />,
    description: "Quand le message contient un mot specifique",
  },
];

function getTriggerLabel(trigger: string): string {
  if (trigger === "any") return "Tous les messages";
  if (trigger === "first") return "Premier message";
  if (trigger.startsWith("keyword:")) return `Mot-cle : ${trigger.replace("keyword:", "")}`;
  return trigger;
}

const DEFAULT_FORM: FormData = { name: "", trigger: "any", message: "", delay: 0 };

export default function AutoReplyClient() {
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
    const payload = { name: form.name.trim(), trigger: triggerValue, message: form.message, delay: form.delay };

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

      toast.success(editingId ? "Template mis a jour" : "Template cree");
      setDialogOpen(false);
      fetchTemplates();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur lors de la sauvegarde";
      toast.error(msg);
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
      setTemplates(prev =>
        prev.map(t => t.id === template.id ? { ...t, isActive: !t.isActive } : t)
      );
      toast.success(template.isActive ? "Template desactive" : "Template active");
    } catch {
      toast.error("Erreur lors du changement de statut");
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/auto-reply/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success("Template supprime");
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
          <h1 className="text-lg font-semibold">Auto-Reponse</h1>
          <p className="text-sm text-foreground/48 mt-1">
            Configurez des reponses automatiques a vos messages Vinted
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 rounded-xl bg-border/60 gap-px overflow-hidden">
        <div className="bg-card p-4">
          <p className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Templates</p>
          <p className="mt-1 text-2xl font-semibold">{templates.length}</p>
        </div>
        <div className="bg-card p-4">
          <p className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Actifs</p>
          <p className="mt-1 text-2xl font-semibold">
            {templates.filter(t => t.isActive).length}
          </p>
        </div>
        <div className="bg-card p-4">
          <p className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Inactifs</p>
          <p className="mt-1 text-2xl font-semibold text-foreground/48">
            {templates.filter(t => !t.isActive).length}
          </p>
        </div>
      </div>

      {/* Templates list */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="flex h-[40vh] flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/40">
            <MessageSquareText className="h-8 w-8 text-foreground/24" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Aucun template</h2>
            <p className="mt-1 text-sm text-foreground/48">
              Creez votre premier template de reponse automatique.
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Creer un template
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {templates.map(template => (
            <div
              key={template.id}
              className={`relative overflow-hidden rounded-xl border bg-card transition-all ${
                template.isActive ? "border-border/60" : "border-border/30 opacity-60"
              }`}
            >
              <div className="p-4 space-y-3">
                {/* Top row: name + switch */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Zap className="h-4 w-4 flex-shrink-0 text-foreground/32" />
                    <h3 className="font-semibold truncate">{template.name}</h3>
                  </div>
                  <Switch
                    checked={template.isActive}
                    onCheckedChange={() => handleToggleActive(template)}
                  />
                </div>

                {/* Trigger badge */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-accent/40 px-2.5 py-0.5 text-xs font-medium text-foreground/72">
                    {getTriggerLabel(template.trigger)}
                  </span>
                  {template.delay > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/40 px-2.5 py-0.5 text-xs text-foreground/48">
                      <Clock className="h-3 w-3" />
                      {template.delay}s
                    </span>
                  )}
                </div>

                {/* Message preview */}
                <div className="rounded-lg bg-accent/40 p-3">
                  <p className="text-sm text-foreground/48 line-clamp-3 whitespace-pre-wrap">
                    {template.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs h-7 text-foreground/48 hover:text-foreground/72"
                    onClick={() => openEdit(template)}
                  >
                    <Pencil className="h-3 w-3" />
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs h-7 text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(template.id)}
                    disabled={deletingId === template.id}
                  >
                    <Trash2 className="h-3 w-3" />
                    {deletingId === template.id ? "..." : "Supprimer"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Modifier le template" : "Nouveau template"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Modifiez les parametres de votre reponse automatique."
                : "Creez un nouveau template de reponse automatique."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom du template</Label>
              <Input
                id="name"
                placeholder="Ex: Reponse rapide acheteur"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>

            {/* Trigger type */}
            <div className="space-y-2">
              <Label>Declencheur</Label>
              <div className="grid gap-2">
                {TRIGGER_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, trigger: option.value }))}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                      form.trigger === option.value
                        ? "border-foreground/24 bg-accent/40"
                        : "border-border/50 hover:border-border/80"
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      form.trigger === option.value
                        ? "bg-foreground/10 text-foreground/72"
                        : "bg-accent/40 text-foreground/32"
                    }`}>
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

            {/* Keyword input (conditional) */}
            {form.trigger === "keyword" && (
              <div className="space-y-2">
                <Label htmlFor="keyword">Mot-cle</Label>
                <Input
                  id="keyword"
                  placeholder="Ex: disponible, prix, taille"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                />
              </div>
            )}

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                rows={4}
                placeholder="Bonjour {buyer_name}, merci pour votre interet pour {item_title} !"
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              />
              <div className="flex flex-wrap gap-1.5">
                {["{buyer_name}", "{item_title}", "{item_price}"].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, message: f.message + tag }))}
                    className="rounded-md bg-accent/40 px-2 py-0.5 text-xs text-foreground/48 hover:text-foreground/72 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Delay */}
            <div className="space-y-2">
              <Label htmlFor="delay">Delai avant envoi (secondes)</Label>
              <Input
                id="delay"
                type="number"
                min={0}
                max={300}
                placeholder="0"
                value={form.delay || ""}
                onChange={e => setForm(f => ({ ...f, delay: parseInt(e.target.value) || 0 }))}
              />
              <p className="text-xs text-foreground/48">
                0 = envoi immediat. Ajoutez un delai pour un effet plus naturel.
              </p>
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
