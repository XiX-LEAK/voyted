"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Shield,
  Crown,
  User,
  Monitor,
  Globe,
  Search,
  Users,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setUserRole } from "@/actions/admin";

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  _count: { monitors: number; proxy_groups: number };
};

const ROLES = [
  { value: "free", label: "Free", icon: User, color: "bg-muted text-foreground/48" },
  { value: "premium", label: "Premium", icon: Crown, color: "bg-foreground/8 text-foreground/72" },
  { value: "admin", label: "Admin", icon: Shield, color: "bg-foreground/8 text-foreground/72" },
] as const;

function getRoleBadge(role: string) {
  const r = ROLES.find((r) => r.value === role) ?? ROLES[0];
  return (
    <Badge className={`${r.color} text-[10px] font-semibold uppercase tracking-wide gap-1`}>
      <r.icon className="w-3 h-3" />
      {r.label}
    </Badge>
  );
}

export function AdminClient({
  users: initialUsers,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [pendingRole, setPendingRole] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredUsers = users.filter((user) => {
    if (!normalizedQuery) return true;

    const searchable = [
      user.name ?? "",
      user.email ?? "",
      user.role,
    ].join(" ").toLowerCase();

    return searchable.includes(normalizedQuery);
  });

  const totalUsers = users.length;
  const premiumUsers = users.filter((u) => u.role === "premium").length;
  const adminUsers = users.filter((u) => u.role === "admin").length;

  const openRoleDialog = (user: UserRow) => {
    setSelected(user);
    setPendingRole(user.role);
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!selected || pendingRole === selected.role) {
      setIsOpen(false);
      return;
    }

    const prevRole = selected.role;
    setUsers((prev) =>
      prev.map((u) => (u.id === selected.id ? { ...u, role: pendingRole } : u))
    );
    setIsOpen(false);

    toast.promise(setUserRole(selected.id, pendingRole), {
      loading: "Updating role...",
      success: `${selected.name ?? "User"} is now ${pendingRole}`,
      error: () => {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selected.id ? { ...u, role: prevRole } : u
          )
        );
        return "Failed to update role";
      },
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
            User Management
          </h1>
          <p className="mt-1 text-sm text-foreground/48">
            Search users, review access levels, and update roles from one place.
          </p>
        </div>

        <div className="w-full max-w-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/32" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name, email or role..."
              className="h-10 rounded-xl border-border/50 bg-card pl-9"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 bg-card py-0">
          <CardHeader className="pb-3 pt-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-foreground/48">Total Users</CardDescription>
              <div className="rounded-lg bg-accent/60 p-2">
                <Users className="h-4 w-4 text-foreground/32" />
              </div>
            </div>
            <CardTitle className="text-3xl text-foreground">{totalUsers}</CardTitle>
          </CardHeader>
          <CardContent className="pb-6 text-xs text-foreground/48">
            Active accounts visible in this workspace.
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card py-0">
          <CardHeader className="pb-3 pt-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-foreground/48">Premium</CardDescription>
              <div className="rounded-lg bg-accent/60 p-2">
                <Crown className="h-4 w-4 text-foreground/32" />
              </div>
            </div>
            <CardTitle className="text-3xl text-foreground">
              {premiumUsers}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6 text-xs text-foreground/48">
            Users with access to server proxy features.
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card py-0">
          <CardHeader className="pb-3 pt-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-foreground/48">Admins</CardDescription>
              <div className="rounded-lg bg-accent/60 p-2">
                <Sparkles className="h-4 w-4 text-foreground/32" />
              </div>
            </div>
            <CardTitle className="text-3xl text-foreground">
              {adminUsers}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6 text-xs text-foreground/48">
            Full dashboard access including role management.
          </CardContent>
        </Card>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
        <div className="flex flex-col gap-3 border-b border-border/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Team Members
            </p>
            <p className="text-xs text-foreground/48">
              {filteredUsers.length} of {totalUsers} users shown
            </p>
          </div>
          {normalizedQuery ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 self-start px-2 text-xs text-foreground/48 hover:text-foreground/72 sm:self-auto"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </Button>
          ) : null}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left text-[11px] font-medium text-foreground/36 uppercase tracking-wider px-5 py-3">
                  User
                </th>
                <th className="text-left text-[11px] font-medium text-foreground/36 uppercase tracking-wider px-5 py-3">
                  Role
                </th>
                <th className="text-center text-[11px] font-medium text-foreground/36 uppercase tracking-wider px-5 py-3">
                  Monitors
                </th>
                <th className="text-center text-[11px] font-medium text-foreground/36 uppercase tracking-wider px-5 py-3">
                  Proxy Groups
                </th>
                <th className="text-right text-[11px] font-medium text-foreground/36 uppercase tracking-wider px-5 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-border/30 transition-colors hover:bg-accent/40"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground/48">
                          {user.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground/90 truncate">
                          {user.name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-foreground/48 truncate">
                          {user.email ?? "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">{getRoleBadge(user.role)}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 text-sm text-foreground/90">
                      <Monitor className="w-3.5 h-3.5 text-foreground/32" />
                      {user._count.monitors}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 text-sm text-foreground/90">
                      <Globe className="w-3.5 h-3.5 text-foreground/32" />
                      {user._count.proxy_groups}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {user.id === currentUserId ? (
                      <Badge
                        variant="outline"
                        className="rounded-full text-[10px] uppercase tracking-wide border-border/50 text-foreground/48"
                      >
                        You
                      </Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-lg text-xs text-foreground/48 hover:text-foreground/72"
                        onClick={() => openRoleDialog(user)}
                      >
                        Change Role
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                      <div className="rounded-full bg-muted p-3">
                        <Search className="h-5 w-5 text-foreground/24" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        No users match your search
                      </p>
                      <p className="text-sm text-foreground/48">
                        Try a different name, email address, or role.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Update role for <strong>{selected?.name ?? "User"}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 py-4">
            {ROLES.map((role) => (
              <button
                key={role.value}
                onClick={() => setPendingRole(role.value)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                  pendingRole === role.value
                    ? "border-foreground/24 bg-accent"
                    : "border-border/50 hover:border-foreground/24 hover:bg-accent/40"
                }`}
              >
                <role.icon
                  className={`w-5 h-5 ${
                    pendingRole === role.value
                      ? "text-foreground/72"
                      : "text-foreground/32"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-foreground/90">
                    {role.label}
                  </p>
                  <p className="text-xs text-foreground/48">
                    {role.value === "free" && "Standard access, must use own proxies"}
                    {role.value === "premium" && "Can use server proxies"}
                    {role.value === "admin" && "Full access + user management"}
                  </p>
                </div>
                {pendingRole === role.value && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-foreground" />
                )}
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-foreground/48 hover:text-foreground/72">
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
