"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus,
  MessageSquareText,
  Pencil,
  Trash2,
  Copy,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type MessageTemplate = {
  id: string;
  name: string;
  category: string;
  message: string;
  createdAt: string;
};

type FormData = {
  name: string;
  category: string;
  message: string;
};

const CATEGORIES = [
  { value: "all", label: "Tous" },
  { value: "general", label: "General" },
  { value: "offers", label: "Offres" },
  { value: "shipping", label: "Expedition" },
  { value: "thanks", label: "Remerciements" },
];

const SUGGESTIONS: { name: string; category: string; message: string }[] = [
  {
    name: "Reponse rapide",
    category: "general",
    message: "Bonjour {buyer_name}, merci pour votre interet pour {item_title} ! N'hesitez pas si vous avez des questions.",
  },
  {
    name: "Contre-offre",
    category: "offers",
    message: "Bonjour {buyer_name}, merci pour votre offre sur {item_title}. Je peux vous le laisser a {item_price}, qu'en pensez-vous ?",
  },
  {
    name: "Expedition envoyee",
    category: "shipping",
    message: "Bonjour {buyer_name}, votre commande pour {item_title} a ete expediee ! Vous recevrez bientot le numero de suivi.",
  },
  {
    name: "Remerciement achat",
    category: "thanks",
    message: "Merci beaucoup pour votre achat de {item_title}, {buyer_name} ! N'hesitez pas a laisser une evaluation. A bientot !",
  },
];

const DEFAULT_FORM: FormData = { name: "", category: "general", message: "" };

export default function TemplatesClient() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/templates", { cache: "no-store" });
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

  const filteredTemplates = activeTab === "all"
    ? templates
    : templates.filter(t => t.category === activeTab);

  function openCreate() {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setDialogOpen(true);
  }

  function openEdit(template: MessageTemplate) {
    setEditingId(template.id);
    setForm({
      name: template.name,
      category: template.category,
      message: template.message,
    });
    setDialogOpen(true);
  }

  function useSuggestion(suggestion: typeof SUGGESTIONS[0]) {
    setEditingId(null);
    setForm({
      name: suggestion.name,
      category: suggestion.category,
      message: suggestion.message,
    });
    setDialogOpen(true);
  }

  async function handleCopy(message: string) {
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Message copie !");
    } catch {
      toast.error("Impossible de copier");
    }
  }

  async function handleSave() {
    if (!form.name.trim() || !form.message.trim()) {
      toast.error("Veuillez remplir le nom et le message");
      return;
    }

    setSaving(true);
    const payload = { name: form.name.trim(), category: form.category, message: form.message };

    try {
      const url = editingId ? `/api/templates/${editingId}` : "/api/templates";
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

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
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
          <h1 className="text-lg font-semibold">Templates</h1>
          <p className="text-sm text-foreground/48 mt-1">
            Modeles de messages pour vos conversations Vinted
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau template
        </Button>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-card p-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setActiveTab(cat.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === cat.value
                ? "bg-foreground text-background"
                : "text-foreground/48 hover:bg-accent"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Templates list */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="space-y-6">
          <div className="flex h-[30vh] flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/40">
              <MessageSquareText className="h-8 w-8 text-foreground/24" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Aucun template</h2>
              <p className="mt-1 text-sm text-foreground/48">
                Commencez avec nos suggestions ou creez le votre.
              </p>
            </div>
          </div>

          {/* Suggestions */}
          {templates.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground/48">Suggestions</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => useSuggestion(s)}
                    className="rounded-xl border border-dashed border-border/50 bg-card p-4 text-left transition-all hover:border-border hover:bg-accent/40"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="h-3.5 w-3.5 text-foreground/32" />
                      <span className="text-sm font-semibold">{s.name}</span>
                      <span className="rounded-full bg-accent/40 px-2 py-0.5 text-[10px] font-medium text-foreground/48">
                        {CATEGORIES.find(c => c.value === s.category)?.label}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/48 line-clamp-2">{s.message}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="relative overflow-hidden rounded-xl border border-border/60 bg-card transition-all"
            >
              <div className="p-4 space-y-3">
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquareText className="h-4 w-4 flex-shrink-0 text-foreground/32" />
                    <h3 className="font-semibold truncate">{template.name}</h3>
                  </div>
                  <span className="rounded-full bg-accent/40 px-2.5 py-0.5 text-xs font-medium text-foreground/48">
                    {CATEGORIES.find(c => c.value === template.category)?.label || template.category}
                  </span>
                </div>

                {/* Message preview */}
                <div className="rounded-lg bg-accent/40 p-3">
                  <p className="text-sm text-foreground/48 line-clamp-3 whitespace-pre-wrap">
                    {template.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs h-7 text-foreground/48 hover:text-foreground/72"
                    onClick={() => handleCopy(template.message)}
                  >
                    <Copy className="h-3 w-3" />
                    Copier
                  </Button>
                  <div className="flex items-center gap-2">
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
                ? "Modifiez votre modele de message."
                : "Creez un nouveau modele de message."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="tpl-name">Nom du template</Label>
              <Input
                id="tpl-name"
                placeholder="Ex: Reponse rapide"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Categorie</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.filter(c => c.value !== "all").map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors ${
                      form.category === cat.value
                        ? "border-foreground/24 bg-foreground text-background"
                        : "border-border/50 text-foreground/48 hover:bg-accent"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="tpl-message">Message</Label>
              <textarea
                id="tpl-message"
                rows={5}
                placeholder="Bonjour {buyer_name}, merci pour votre interet..."
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
