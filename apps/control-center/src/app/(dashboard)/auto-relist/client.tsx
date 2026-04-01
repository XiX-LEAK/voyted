"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  RefreshCw,
  Clock,
  Calendar,
  Filter,
  Info,
  Play,
  Save,
  Zap,
  CalendarClock,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type Schedule = {
  id: string;
  isActive: boolean;
  intervalDays: number;
  timeOfDay: string;
  itemFilter: string;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
};

const INTERVALS = [
  { value: 3, label: "3 jours" },
  { value: 5, label: "5 jours" },
  { value: 7, label: "7 jours" },
  { value: 14, label: "14 jours" },
  { value: 30, label: "30 jours" },
];

const TIMES = ["09:00", "12:00", "15:00", "18:00", "21:00"];

const FILTERS = [
  { value: "all", label: "Tous les articles" },
  { value: "no_views_7d", label: "Sans vues depuis 7 jours" },
  { value: "older_30d", label: "Articles > 30 jours" },
];

export default function AutoRelistClient() {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);

  // Form state
  const [isActive, setIsActive] = useState(true);
  const [intervalDays, setIntervalDays] = useState(7);
  const [timeOfDay, setTimeOfDay] = useState("09:00");
  const [itemFilter, setItemFilter] = useState("all");

  const fetchSchedule = useCallback(async () => {
    try {
      const res = await fetch("/api/auto-relist", { cache: "no-store" });
      const data = await res.json();
      const s = data.schedules?.[0] || null;
      setSchedule(s);
      if (s) {
        setIsActive(s.isActive);
        setIntervalDays(s.intervalDays);
        setTimeOfDay(s.timeOfDay);
        setItemFilter(s.itemFilter);
      }
    } catch {
      toast.error("Impossible de charger la configuration");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/auto-relist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive, intervalDays, timeOfDay, itemFilter }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setSchedule(data.schedule);
      toast.success("Configuration sauvegardee !");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur lors de la sauvegarde";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleRunNow() {
    setRunning(true);
    try {
      const res = await fetch("/api/auto-relist/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      toast.success(`${data.relisted}/${data.total} articles relistes !`);
      fetchSchedule();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur lors du relist";
      toast.error(msg);
    } finally {
      setRunning(false);
    }
  }

  async function handleToggle(checked: boolean) {
    setIsActive(checked);
    if (schedule) {
      try {
        const res = await fetch(`/api/auto-relist/${schedule.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: checked }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur");
        setSchedule(data.schedule);
        toast.success(checked ? "Auto-relist active" : "Auto-relist desactive");
      } catch {
        setIsActive(!checked);
        toast.error("Erreur lors de la mise a jour");
      }
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "--";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">Auto-Relist</h1>
          <p className="text-sm text-foreground/48 mt-1">
            Remettez vos articles en avant automatiquement
          </p>
        </div>
        <Button
          onClick={handleRunNow}
          disabled={running}
          className="gap-2"
        >
          {running ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {running ? "Relist en cours..." : "Relister maintenant"}
        </Button>
      </div>

      {/* Main config card */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        {/* Toggle header */}
        <div className="flex items-center justify-between border-b border-border/30 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/40 transition-colors">
              <Zap className="h-5 w-5 text-foreground/32 transition-colors" />
            </div>
            <div>
              <p className="font-semibold">Relist automatique</p>
              <p className="text-xs text-foreground/48">
                {isActive ? "Actif" : "Desactive"}
              </p>
            </div>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
          />
        </div>

        <div className="p-5 space-y-6">
          {/* Interval selector */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-foreground/32" />
              Frequence de relist
            </div>
            <div className="flex flex-wrap gap-2">
              {INTERVALS.map((interval) => (
                <button
                  key={interval.value}
                  onClick={() => setIntervalDays(interval.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    intervalDays === interval.value
                      ? "bg-foreground text-background"
                      : "text-foreground/48 hover:bg-accent"
                  }`}
                >
                  {interval.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time of day selector */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-foreground/32" />
              Heure de relist
            </div>
            <div className="flex flex-wrap gap-2">
              {TIMES.map((time) => (
                <button
                  key={time}
                  onClick={() => setTimeOfDay(time)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    timeOfDay === time
                      ? "bg-foreground text-background"
                      : "text-foreground/48 hover:bg-accent"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Item filter selector */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="h-4 w-4 text-foreground/32" />
              Articles a relister
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setItemFilter(filter.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    itemFilter === filter.value
                      ? "bg-foreground text-background"
                      : "text-foreground/48 hover:bg-accent"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule info */}
          {schedule && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl bg-accent/40 p-3">
                <History className="h-4 w-4 text-foreground/32 flex-shrink-0" />
                <div>
                  <p className="text-xs text-foreground/48">Dernier relist</p>
                  <p className="text-sm font-medium">{formatDate(schedule.lastRunAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-accent/40 p-3">
                <CalendarClock className="h-4 w-4 text-foreground/32 flex-shrink-0" />
                <div>
                  <p className="text-xs text-foreground/48">Prochain relist</p>
                  <p className="text-sm font-medium">{formatDate(schedule.nextRunAt)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Save button */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full gap-2"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Sauvegarde..." : "Sauvegarder la configuration"}
          </Button>
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/40 flex-shrink-0">
            <Info className="h-4 w-4 text-foreground/32" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold">Comment fonctionne l&apos;auto-relist ?</p>
            <p className="text-sm text-foreground/48 leading-relaxed">
              Le systeme remet automatiquement vos articles en avant pour augmenter
              leur visibilite. Vinted affiche les articles recemment listes en priorite
              dans les resultats de recherche. En relistant regulierement, vos articles
              apparaissent plus haut et recoivent plus de vues.
            </p>
          </div>
        </div>
      </div>

      {/* History section */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="border-b border-border/30 p-5">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-foreground/32" />
            <p className="font-semibold">Historique des relists</p>
          </div>
        </div>
        <div className="flex h-32 items-center justify-center text-sm text-foreground/48">
          Aucun relist effectue pour le moment
        </div>
      </div>
    </div>
  );
}
