"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, ExternalLink, Loader2, Menu } from "lucide-react";
import { useVintedAccount } from "@/components/account-provider";
import { cn } from "@/lib/utils";

type NotificationEntry = {
  id: string;
  body?: string;
  is_read?: boolean;
  url?: string;
  small_photo_url?: string;
  updated_at?: string;
};

function formatNotificationTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Monitors",
  "/feed": "Live Feed",
  "/analytics": "Dashboard",
  "/inventaire": "Inventaire",
  "/expeditions": "Expeditions",
  "/chats": "Messagerie",
  "/automatisations": "Automatisations",
  "/liked": "Liked Items",
  "/analyzer": "Analyseur",
  "/comptes": "Mes Comptes",
  "/proxies": "Proxy Groups",
  "/guide": "Guide",
  "/account": "Account",
  "/admin": "Admin",
  "/stock": "Inventaire",
  "/ventes": "Inventaire",
  "/repost": "Inventaire",
  "/acheteurs": "Inventaire",
  "/export": "Inventaire",
  "/suivi": "Expeditions",
  "/bordereaux": "Expeditions",
  "/factures": "Expeditions",
  "/auto-relist": "Automatisations",
  "/auto-reply": "Messagerie",
  "/smart-offers": "Messagerie",
  "/templates": "Messagerie",
  "/planning": "Automatisations",
  "/restocker": "Automatisations",
  "/spreadsheet": "Spreadsheet",
  "/calendrier": "Calendrier",
};

function NotificationBell() {
  const { linked, loading } = useVintedAccount();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((entry) => entry.is_read === false).length,
    [notifications]
  );

  const fetchNotifications = useCallback(async () => {
    if (!linked) {
      setNotifications([]);
      setHasLoaded(true);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications?page=1&per_page=5", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed (${res.status})`);
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setHasLoaded(true);
    } catch (error) {
      console.error(error);
      setNotifications([]);
      setHasLoaded(true);
    } finally {
      setIsLoading(false);
    }
  }, [linked]);

  useEffect(() => {
    if (!loading && linked) void fetchNotifications();
  }, [fetchNotifications, linked, loading]);

  useEffect(() => {
    if (loading || !linked) {
      setOpen(false);
      setNotifications([]);
      setHasLoaded(false);
    }
  }, [linked, loading]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  if (loading || !linked) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          const nextOpen = !open;
          setOpen(nextOpen);
          if (nextOpen && !hasLoaded) void fetchNotifications();
        }}
        className="relative inline-flex h-7 w-7 items-center justify-center rounded-md text-foreground/40 transition-colors hover:bg-accent hover:text-foreground/72"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-semibold text-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 overflow-hidden rounded-lg border border-border bg-card shadow-lg animate-scale-in">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-foreground">Notifications</p>
            <button
              type="button"
              onClick={() => void fetchNotifications()}
              disabled={isLoading}
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-foreground/40 transition-colors hover:bg-accent hover:text-foreground/72 disabled:opacity-40"
              aria-label="Refresh"
            >
              <Loader2 className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="space-y-1 p-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-md bg-muted" />
                ))}
              </div>
            ) : notifications.length > 0 ? (
              <div className="p-1">
                {notifications.map((n) => (
                  <a
                    key={n.id}
                    href={n.url || undefined}
                    target={n.url ? "_blank" : undefined}
                    rel={n.url ? "noopener noreferrer" : undefined}
                    className={cn(
                      "flex gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-accent/70",
                      n.is_read === false && "bg-accent/40"
                    )}
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                      {n.small_photo_url ? (
                        <img src={n.small_photo_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-foreground/24">
                          <Bell className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-snug text-foreground/90 line-clamp-2">
                        {n.body || "Nouvelle notification"}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        {n.is_read === false && (
                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-foreground/60" />
                        )}
                        <span className="text-[11px] text-foreground/36">
                          {formatNotificationTime(n.updated_at)}
                        </span>
                      </div>
                    </div>
                    {n.url && <ExternalLink className="mt-1 h-3 w-3 shrink-0 text-foreground/24" />}
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                <Bell className="h-5 w-5 text-foreground/24 mb-2" />
                <p className="text-sm font-medium text-foreground/72">Aucune notification</p>
                <p className="mt-0.5 text-xs text-foreground/36">
                  Les notifications apparaitront ici.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();

  const pageLabel = ROUTE_LABELS[pathname] ||
    (pathname.includes("/monitors/") ? "Monitor" : "Voyted");

  return (
    <header className="sticky top-0 z-40 flex h-11 items-center justify-between border-b border-border bg-background/70 px-4 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="-ml-1 rounded-md p-1 text-foreground/40 transition-colors hover:bg-accent hover:text-foreground/72 lg:hidden"
        >
          <Menu className="w-4 h-4" />
        </button>

        <nav className="flex items-center gap-1 text-sm">
          <span className="font-medium text-foreground/90">{pageLabel}</span>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />
        <div className="flex items-center gap-1.5 text-[11px] text-foreground/36">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet" />
          </span>
          <span className="hidden sm:inline">Online</span>
        </div>
      </div>
    </header>
  );
}
