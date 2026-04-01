"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import {
  Plus, FileSpreadsheet, Pencil, Trash2, Upload, ArrowLeft,
  MoreVertical, Clock, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

const UniverSpreadsheet = dynamic(
  () => import("@/components/spreadsheet/univer-spreadsheet"),
  { ssr: false, loading: () => <div className="h-[70vh] animate-pulse rounded-lg bg-muted" /> }
);

type SpreadsheetMeta = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "voyted_spreadsheets";
const SNAPSHOT_PREFIX = "voyted_spreadsheet_data_";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getSpreadsheetList(): SpreadsheetMeta[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSpreadsheetList(list: SpreadsheetMeta[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function getSnapshotData(id: string): unknown | null {
  try {
    const raw = localStorage.getItem(SNAPSHOT_PREFIX + id);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSnapshotData(id: string, data: unknown) {
  localStorage.setItem(SNAPSHOT_PREFIX + id, JSON.stringify(data));
}

function deleteSnapshotData(id: string) {
  localStorage.removeItem(SNAPSHOT_PREFIX + id);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(d);
}

export default function SpreadsheetClient() {
  const [sheets, setSheets] = useState<SpreadsheetMeta[]>([]);
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [targetSheet, setTargetSheet] = useState<SpreadsheetMeta | null>(null);
  const [renameName, setRenameName] = useState("");

  useEffect(() => {
    setSheets(getSpreadsheetList());
  }, []);

  function handleCreate() {
    const id = generateId();
    const now = new Date().toISOString();
    const newSheet: SpreadsheetMeta = {
      id,
      name: `Spreadsheet ${sheets.length + 1}`,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newSheet, ...sheets];
    setSheets(updated);
    saveSpreadsheetList(updated);
    setActiveSheetId(id);
  }

  function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls,.csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const id = generateId();
      const now = new Date().toISOString();
      const name = file.name.replace(/\.(xlsx|xls|csv)$/i, "");
      const newSheet: SpreadsheetMeta = { id, name, createdAt: now, updatedAt: now };

      // Store the file content as base64 for later import by Univer
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        localStorage.setItem(SNAPSHOT_PREFIX + id + "_import", base64);
        const updated = [newSheet, ...sheets];
        setSheets(updated);
        saveSpreadsheetList(updated);
        setActiveSheetId(id);
        toast.success(`"${name}" importe`);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  function openRename(sheet: SpreadsheetMeta) {
    setTargetSheet(sheet);
    setRenameName(sheet.name);
    setRenameDialogOpen(true);
  }

  function handleRename() {
    if (!targetSheet || !renameName.trim()) return;
    const updated = sheets.map(s =>
      s.id === targetSheet.id ? { ...s, name: renameName.trim(), updatedAt: new Date().toISOString() } : s
    );
    setSheets(updated);
    saveSpreadsheetList(updated);
    setRenameDialogOpen(false);
    toast.success("Renomme");
  }

  function openDelete(sheet: SpreadsheetMeta) {
    setTargetSheet(sheet);
    setDeleteDialogOpen(true);
  }

  function handleDelete() {
    if (!targetSheet) return;
    const updated = sheets.filter(s => s.id !== targetSheet.id);
    setSheets(updated);
    saveSpreadsheetList(updated);
    deleteSnapshotData(targetSheet.id);
    localStorage.removeItem(SNAPSHOT_PREFIX + targetSheet.id + "_import");
    setDeleteDialogOpen(false);
    toast.success("Supprime");
  }

  function handleBack() {
    setActiveSheetId(null);
    setSheets(getSpreadsheetList());
  }

  function handleSave(id: string, snapshot: unknown) {
    saveSnapshotData(id, snapshot);
    const updated = sheets.map(s =>
      s.id === id ? { ...s, updatedAt: new Date().toISOString() } : s
    );
    setSheets(updated);
    saveSpreadsheetList(updated);
  }

  // Editor mode
  if (activeSheetId) {
    const activeSheet = sheets.find(s => s.id === activeSheetId);
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1.5 text-foreground/48 hover:text-foreground/72">
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour
          </Button>
          <div className="h-4 w-px bg-border/50" />
          <h1 className="text-base font-semibold text-foreground truncate">
            {activeSheet?.name || "Spreadsheet"}
          </h1>
          <span className="text-[11px] text-foreground/36 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Sauvegarde automatique
          </span>
        </div>

        <div className="rounded-xl border border-border/50 overflow-hidden">
          <UniverSpreadsheet
            sheetId={activeSheetId}
            height="calc(100vh - 180px)"
            onSave={(snapshot: unknown) => handleSave(activeSheetId, snapshot)}
            initialData={getSnapshotData(activeSheetId)}
          />
        </div>
      </div>
    );
  }

  // List mode
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Spreadsheets</h1>
          <p className="mt-0.5 text-sm text-foreground/48">
            Gerez vos tableurs, importez des fichiers Excel et analysez vos donnees.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleImport} className="gap-1.5">
            <Upload className="h-3.5 w-3.5" />
            Importer XLSX
          </Button>
          <Button onClick={handleCreate} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Nouveau
          </Button>
        </div>
      </div>

      {sheets.length === 0 ? (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/40">
            <FileSpreadsheet className="h-8 w-8 text-foreground/24" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Aucun spreadsheet</h2>
            <p className="mt-1 text-sm text-foreground/48">
              Creez votre premier tableur ou importez un fichier Excel.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleImport} className="gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              Importer XLSX
            </Button>
            <Button onClick={handleCreate} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Nouveau
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sheets.map(sheet => (
            <button
              key={sheet.id}
              type="button"
              onClick={() => setActiveSheetId(sheet.id)}
              className="group relative rounded-xl border border-border/50 bg-card p-5 text-left transition-all hover:border-border hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{sheet.name}</h3>
                    <p className="text-[11px] text-foreground/36 mt-0.5">
                      Modifie {formatDate(sheet.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-foreground/48"
                  onClick={(e) => { e.stopPropagation(); openRename(sheet); }}>
                  <Pencil className="h-3 w-3" /> Renommer
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-red-400"
                  onClick={(e) => { e.stopPropagation(); openDelete(sheet); }}>
                  <Trash2 className="h-3 w-3" /> Supprimer
                </Button>
              </div>

              <p className="text-[11px] text-foreground/24 mt-3">
                Cree {formatDate(sheet.createdAt)}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Renommer</DialogTitle>
            <DialogDescription>Entrez le nouveau nom du spreadsheet.</DialogDescription>
          </DialogHeader>
          <Input value={renameName} onChange={e => setRenameName(e.target.value)}
            placeholder="Nom du spreadsheet"
            onKeyDown={e => e.key === "Enter" && handleRename()} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleRename}>Renommer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer</DialogTitle>
            <DialogDescription>
              Etes-vous sur de vouloir supprimer &quot;{targetSheet?.name}&quot; ? Cette action est irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
