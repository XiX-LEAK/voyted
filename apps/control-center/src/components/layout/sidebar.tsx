"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, PlusCircle, Radio, LogOut, Globe, Shield, User,
  BookOpen, X, Heart, MessageCircle, Package, ShoppingBag, RefreshCw,
  MessageSquare, Truck, BarChart3, Copy, Printer, Search, CalendarDays,
  RotateCcw, FileText, Users, Download, Zap, MessageSquareText, Settings,
  Table2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navSections = [
  {
    label: "Overview",
    items: [
      { href: "/analytics", label: "Dashboard", icon: BarChart3 },
      { href: "/dashboard", label: "Monitors", icon: LayoutDashboard },
      { href: "/feed", label: "Live Feed", icon: Radio },
    ],
  },
  {
    label: "Gestion",
    items: [
      { href: "/inventaire", label: "Inventaire", icon: Package },
      { href: "/expeditions", label: "Expeditions", icon: Truck },
      { href: "/chats", label: "Messagerie", icon: MessageCircle },
      { href: "/automatisations", label: "Automatisations", icon: Zap },
      { href: "/calendrier", label: "Calendrier", icon: CalendarDays },
    ],
  },
  {
    label: "Outils",
    items: [
      { href: "/liked", label: "Liked Items", icon: Heart },
      { href: "/analyzer", label: "Analyseur", icon: Search },
      { href: "/spreadsheet", label: "Spreadsheet", icon: Table2 },
    ],
  },
  {
    label: "Parametres",
    items: [
      { href: "/comptes", label: "Mes Comptes", icon: Users },
      { href: "/proxies", label: "Proxy Groups", icon: Globe },
      { href: "/guide", label: "Guide", icon: BookOpen },
    ],
  },
];

const adminNavItems = [
  { href: "/admin", label: "User Management", icon: Shield },
];

interface SidebarProps {
  user?: { name?: string | null; image?: string | null; email?: string | null; role?: string };
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <aside className={cn(
      "fixed left-0 top-0 bottom-0 z-50 flex h-full w-[220px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Logo */}
      <div className="flex h-12 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet text-violet-foreground">
            <span className="text-[10px] font-bold">V</span>
          </div>
          <span className="text-[14px] font-semibold tracking-tight text-sidebar-foreground">
            Voyted
          </span>
        </Link>
        <button
          onClick={onClose}
          className="p-1 text-sidebar-foreground/40 transition-colors hover:text-sidebar-foreground lg:hidden"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-none">
        {navSections.map((section) => (
          <div key={section.label} className="mt-4 first:mt-1">
            <p className="mb-1 px-2.5 text-[11px] font-medium text-sidebar-foreground/36 uppercase tracking-wider">
              {section.label}
            </p>
            <div className="space-y-px">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-[5px] text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-violet/10 text-sidebar-foreground"
                        : "text-sidebar-foreground/56 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground/90"
                    )}
                  >
                    <item.icon className={cn(
                      "w-[15px] h-[15px] shrink-0",
                      isActive ? "text-violet" : "text-sidebar-foreground/36"
                    )} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* New Monitor */}
        <div className="mt-4 px-0.5">
          <Link
            href="/monitors/new"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-md border border-dashed border-violet/20 px-2.5 py-[5px] text-[13px] font-medium text-sidebar-foreground/40 transition-colors hover:border-violet/40 hover:text-sidebar-foreground/60"
          >
            <PlusCircle className="w-[15px] h-[15px]" />
            New Monitor
          </Link>
        </div>

        {user?.role === "admin" && (
          <div className="mt-4">
            <p className="mb-1 px-2.5 text-[11px] font-medium text-sidebar-foreground/36 uppercase tracking-wider">
              Admin
            </p>
            <div className="space-y-px">
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-[5px] text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-violet/10 text-sidebar-foreground"
                        : "text-sidebar-foreground/56 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground/90"
                    )}
                  >
                    <item.icon className={cn(
                      "w-[15px] h-[15px] shrink-0",
                      isActive ? "text-violet" : "text-sidebar-foreground/36"
                    )} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border px-2 py-2.5">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-sidebar-accent/60">
          {user?.image ? (
            <img src={user.image} alt="" className="w-6 h-6 rounded-full" />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sidebar-accent text-[9px] font-bold text-sidebar-foreground/72">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[13px] font-medium text-sidebar-foreground/90">
                {user?.name || "User"}
              </p>
              {user?.role === "premium" && (
                <span className="rounded-full bg-violet/15 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-violet">
                  Pro
                </span>
              )}
              {user?.role === "admin" && (
                <span className="rounded-full bg-violet/15 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-violet">
                  Admin
                </span>
              )}
            </div>
          </div>
          <Link
            href="/logout"
            className="p-1 text-sidebar-foreground/32 transition-colors hover:text-sidebar-foreground/72"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
