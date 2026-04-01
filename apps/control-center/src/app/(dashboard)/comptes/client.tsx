"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  RefreshCw,
  Trash2,
  Crown,
  LinkIcon,
  Unlink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { REGIONS } from "@/lib/regions";
import {
  linkVintedAccount,
  unlinkVintedAccount,
  refreshVintedSession,
} from "@/actions/account";

type VintedAccountRecord = {
  id: string;
  label: string;
  vintedUsername: string | null;
  vintedUserId: number | null;
  domain: string;
  isActive: boolean;
  isPrimary: boolean;
  createdAt: string;
};

const MAX_ACCOUNTS = 12;

export default function ComptesClient() {
  const [accounts, setAccounts] = useState<VintedAccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newDomain, setNewDomain] = useState("fr");
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedTokens, setExpandedTokens] = useState<string | null>(null);
  const [tokenFields, setTokenFields] = useState<Record<string, { access: string; refresh: string; datadome: string }>>({});
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingPrimary, setSettingPrimary] = useState<string | null>(null);

  async function fetchAccounts() {
    setLoading(true);
    try {
      const res = await fetch("/api/comptes");
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch {
      toast.error("Impossible de charger les comptes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function handleAdd() {
    if (!newLabel.trim()) {
      toast.error("Le label est requis");
      return;
    }
    setAdding(true);
    try {
      const selectedDomain = REGIONS.find((r) => r.code === newDomain)?.domain || "vinted.fr";
      const res = await fetch("/api/comptes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel.trim(), domain: `www.${selectedDomain}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Compte "${newLabel.trim()}" ajoute`);
      setNewLabel("");
      setShowAddForm(false);
      fetchAccounts();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur";
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string, label: string) {
    if (!confirm(`Supprimer le compte "${label}" ?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/comptes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success("Compte supprime");
      fetchAccounts();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSetPrimary(id: string) {
    setSettingPrimary(id);
    try {
      const res = await fetch(`/api/comptes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success("Compte principal mis a jour");
      fetchAccounts();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur";
      toast.error(msg);
    } finally {
      setSettingPrimary(null);
    }
  }

  function getTokens(id: string) {
    return tokenFields[id] || { access: "", refresh: "", datadome: "" };
  }

  function updateToken(id: string, field: "access" | "refresh" | "datadome", value: string) {
    setTokenFields((prev) => ({
      ...prev,
      [id]: { ...getTokens(id), [field]: value },
    }));
  }

  async function handleLink(account: VintedAccountRecord) {
    const tokens = getTokens(account.id);
    if (!tokens.access.trim()) {
      toast.error("Access token requis");
      return;
    }
    setLinkingId(account.id);
    try {
      const result = await linkVintedAccount(
        tokens.access.trim(),
        account.domain,
        tokens.refresh.trim() || undefined,
        tokens.datadome.trim() || undefined
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      // Update the account record with vinted info
      await fetch(`/api/comptes/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: true,
          vintedUsername: result.vinted_name || null,
          vintedUserId: result.vinted_id || null,
        }),
      });
      toast.success(`Connecte a @${result.vinted_name}`);
      setTokenFields((prev) => {
        const next = { ...prev };
        delete next[account.id];
        return next;
      });
      setExpandedTokens(null);
      fetchAccounts();
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLinkingId(null);
    }
  }

  async function handleUnlink(account: VintedAccountRecord) {
    if (!confirm(`Deconnecter le compte "${account.label}" ?`)) return;
    setUnlinkingId(account.id);
    try {
      const result = await unlinkVintedAccount();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      await fetch(`/api/comptes/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: false,
          vintedUsername: null,
          vintedUserId: 0,
        }),
      });
      toast.success("Compte deconnecte");
      fetchAccounts();
    } catch {
      toast.error("Erreur de deconnexion");
    } finally {
      setUnlinkingId(null);
    }
  }

  function getDomainFlag(domain: string): string {
    const clean = domain.replace("www.", "");
    const region = REGIONS.find((r) => r.domain === clean);
    return region?.flag || "🌐";
  }

  if (loading) {
    return (
      <div className="space-y-6 mx-auto max-w-5xl">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mx-auto max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Mes Comptes Vinted</h1>
          <p className="text-sm text-foreground/48 mt-0.5">
            {accounts.length} compte{accounts.length !== 1 ? "s" : ""} · {MAX_ACCOUNTS} max
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={accounts.length >= MAX_ACCOUNTS}
          className="gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Ajouter un compte
        </Button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4 text-foreground/32" />
              Nouveau compte
            </CardTitle>
            <CardDescription className="text-foreground/48">
              Ajoutez un compte Vinted. Vous pourrez le connecter ensuite avec vos tokens.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-label">Nom / Label</Label>
              <Input
                id="new-label"
                placeholder="Ex: Boutique principale, Compte perso..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div className="space-y-2">
              <Label>Region</Label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {REGIONS.slice(0, 12).map((region) => {
                  const isSelected = newDomain === region.code;
                  return (
                    <button
                      key={region.code}
                      type="button"
                      onClick={() => setNewDomain(region.code)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                        isSelected
                          ? "border-foreground/48 bg-foreground text-background"
                          : "border-border/50 bg-background text-foreground/48 hover:bg-accent hover:text-foreground/72"
                      )}
                    >
                      <span className="text-sm shrink-0">{region.flag}</span>
                      <span className="truncate">{region.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={adding || !newLabel.trim()} className="gap-2" size="sm">
                {adding ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Ajouter
              </Button>
              <Button variant="ghost" onClick={() => setShowAddForm(false)} className="text-foreground/48 hover:text-foreground/72">
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {accounts.length === 0 && !showAddForm && (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Users className="h-8 w-8 text-foreground/24" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Aucun compte Vinted</h2>
            <p className="mt-1 text-sm text-foreground/48">
              Ajoutez votre premier compte pour commencer.
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="gap-2" size="sm">
            <Plus className="h-4 w-4" />
            Ajouter un compte
          </Button>
        </div>
      )}

      {/* Accounts grid */}
      {accounts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const isTokenExpanded = expandedTokens === account.id;
            const tokens = getTokens(account.id);
            const isLinking = linkingId === account.id;
            const isUnlinking = unlinkingId === account.id;
            const isDeleting = deletingId === account.id;
            const isSettingPrimary = settingPrimary === account.id;

            return (
              <Card
                key={account.id}
                className={cn(
                  "relative overflow-hidden rounded-xl transition-all",
                  account.isActive && account.isPrimary
                    ? "border-foreground/24 ring-1 ring-foreground/12"
                    : account.isActive
                    ? "border-emerald-500/30"
                    : "border-border/50"
                )}
              >
                {/* Primary badge */}
                {account.isPrimary && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="text-[10px] gap-1 text-foreground/72">
                      <Crown className="h-3 w-3" />
                      Principal
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        account.isActive
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-muted text-foreground/32"
                      )}
                    >
                      {account.isActive ? (
                        <ShieldCheck className="h-5 w-5" />
                      ) : (
                        <Globe className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base truncate pr-16">
                        {account.label}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5 mt-0.5 text-foreground/48">
                        <span>{getDomainFlag(account.domain)}</span>
                        <span>{account.domain}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  {/* Username & status */}
                  <div className="flex items-center gap-2">
                    {account.vintedUsername ? (
                      <span className="text-sm font-medium text-foreground">
                        @{account.vintedUsername}
                      </span>
                    ) : (
                      <span className="text-sm text-foreground/36 italic">
                        Non connecte
                      </span>
                    )}
                    <Badge
                      variant="secondary"
                      className={cn(
                        "ml-auto text-[10px]",
                        account.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "text-foreground/48"
                      )}
                    >
                      {account.isActive ? "Connecte" : "Inactif"}
                    </Badge>
                  </div>

                  {/* Token section (collapsed) */}
                  {!account.isActive && (
                    <div className="space-y-2">
                      <button
                        onClick={() =>
                          setExpandedTokens(isTokenExpanded ? null : account.id)
                        }
                        className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs font-medium text-foreground/48 hover:text-foreground/72 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <LinkIcon className="h-3.5 w-3.5" />
                          Connecter avec tokens
                        </span>
                        {isTokenExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {isTokenExpanded && (
                        <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-3">
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 flex items-start gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-foreground/48">
                              DevTools (F12) → Application → Cookies → copiez{" "}
                              <code className="bg-amber-500/20 px-1 rounded text-[10px]">
                                access_token_web
                              </code>
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px]">Access Token</Label>
                            <Input
                              type="password"
                              placeholder="access_token_web..."
                              value={tokens.access}
                              onChange={(e) =>
                                updateToken(account.id, "access", e.target.value)
                              }
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px]">Refresh Token</Label>
                            <Input
                              type="password"
                              placeholder="refresh_token_web (recommande)..."
                              value={tokens.refresh}
                              onChange={(e) =>
                                updateToken(account.id, "refresh", e.target.value)
                              }
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px]">Cookie Datadome</Label>
                            <Input
                              type="password"
                              placeholder="datadome cookie..."
                              value={tokens.datadome}
                              onChange={(e) =>
                                updateToken(account.id, "datadome", e.target.value)
                              }
                              className="h-8 text-xs"
                            />
                          </div>
                          <Button
                            onClick={() => handleLink(account)}
                            disabled={!tokens.access.trim() || isLinking}
                            size="sm"
                            className="w-full gap-1.5 text-xs h-8"
                          >
                            {isLinking ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <LinkIcon className="h-3.5 w-3.5" />
                            )}
                            Connecter
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-1">
                    {account.isActive ? (
                      <>
                        {!account.isPrimary && (
                          <Button
                            onClick={() => handleSetPrimary(account.id)}
                            disabled={isSettingPrimary}
                            variant="ghost"
                            size="sm"
                            className="flex-1 gap-1.5 text-xs h-8 text-foreground/48 hover:text-foreground/72"
                          >
                            {isSettingPrimary ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Crown className="h-3 w-3" />
                            )}
                            Utiliser
                          </Button>
                        )}
                        <Button
                          onClick={() => handleUnlink(account)}
                          disabled={isUnlinking}
                          variant="ghost"
                          size="sm"
                          className="flex-1 gap-1.5 text-xs h-8 text-red-400 hover:bg-red-500/10"
                        >
                          {isUnlinking ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Unlink className="h-3 w-3" />
                          )}
                          Deconnecter
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleDelete(account.id, account.label)}
                        disabled={isDeleting}
                        variant="ghost"
                        size="sm"
                        className="flex-1 gap-1.5 text-xs h-8 text-red-400 hover:bg-red-500/10"
                      >
                        {isDeleting ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        Supprimer
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
