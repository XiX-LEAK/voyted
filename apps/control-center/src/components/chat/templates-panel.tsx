"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, MessageSquareText, Pencil, Trash2, Send } from "lucide-react";
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

type FormData = { name: string; category: string; message: string };

const CATEGORIES = [
  { value: "all", label: "Tous" },
  { value: "general", label: "General" },
  { value: "offers", label: "Offres" },
  { value: "shipping", label: "Expedition" },
  { value: "thanks", label: "Remerciements" },
];

const DEFAULT_FORM: FormData = { name: "", category: "general", message: "" };

export function TemplatesPanel({ onInsert }: { onInsert?: (message: string) => void }) {
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

  const filteredTemplates =
    activeTab === "all" ? templates : templates.filter((t) => t.category === activeTab);

  async function handleSave() {
    if (!form.name.trim() || !form.message.trim()) {
      toast.error("Remplissez le nom et le message");
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/templates/${editingId}` : "/api/templates";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
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
          <MessageSquareText className="h-4 w-4 text-foreground/48" />
          <h3 className="text-sm font-semibold">Templates</h3>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={() => {
            setEditingId(null);
            setForm(DEFAULT_FORM);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-1 overflow-x-auto px-3 py-2 border-b border-border/20">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveTab(cat.value)}
            className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
              activeTab === cat.value
                ? "bg-foreground text-background"
                : "text-foreground/48 hover:bg-accent"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquareText className="h-6 w-6 text-foreground/24 mb-2" />
            <p className="text-xs text-foreground/48">Aucun template</p>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="rounded-lg border border-border/40 bg-card p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold truncate">{template.name}</span>
                <span className="rounded-full bg-accent/40 px-1.5 py-0.5 text-[9px] font-medium text-foreground/48">
                  {CATEGORIES.find((c) => c.value === template.category)?.label ||
                    template.category}
                </span>
              </div>
              <p className="text-[11px] text-foreground/48 line-clamp-2">{template.message}</p>
              <div className="flex items-center justify-between">
                {onInsert && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px] gap-1 px-2"
                    onClick={() => onInsert(template.message)}
                  >
                    <Send className="h-2.5 w-2.5" /> Utiliser
                  </Button>
                )}
                <div className="flex items-center gap-1 ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-foreground/48"
                    onClick={() => {
                      setEditingId(template.id);
                      setForm({
                        name: template.name,
                        category: template.category,
                        message: template.message,
                      });
                      setDialogOpen(true);
                    }}
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
            </div>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier" : "Nouveau template"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Modifiez votre template." : "Creez un nouveau template."}
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
              <Label>Categorie</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, category: cat.value }))}
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
            <div className="space-y-2">
              <Label>Message</Label>
              <textarea
                rows={4}
                placeholder="Bonjour {buyer_name}..."
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
                    className="rounded-md bg-accent/40 px-2 py-0.5 text-xs text-foreground/48 hover:text-foreground/72"
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
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "..." : editingId ? "Mettre a jour" : "Creer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
