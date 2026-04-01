"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  HandCoins,
  Inbox,
  Loader2,
  MessageCircle,
  MessageSquare,
  MessageSquareText,
  ReceiptText,
  RefreshCw,
  Send,
  XCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useVintedAccount } from "@/components/account-provider";
import { cn } from "@/lib/utils";
import { TemplatesPanel } from "@/components/chat/templates-panel";
import { AutoReplyPanel } from "@/components/chat/auto-reply-panel";
import { SmartOffersPanel } from "@/components/chat/smart-offers-panel";

type InboxConversation = {
  id: number;
  item_count?: number;
  description?: string;
  unread?: boolean;
  updated_at?: string;
  opposite_user?: {
    id?: number;
    login?: string;
    photo?: { url?: string | null } | null;
  } | null;
  item_photos?: Array<{ id?: number; url?: string | null }> | null;
};

type InboxPagination = {
  current_page: number;
  total_pages: number;
  total_entries: number;
};

type ChatReply = {
  id: string;
  body: string;
  createdAt: string | null;
  userId: number | null;
  login: string;
  avatarUrl: string | null;
  isOwn: boolean;
  isSystem: boolean;
};

type ThreadMeta = {
  kind: "offer" | "declined" | "accepted" | "counter" | "info";
  title: string;
  description: string;
  amount?: string | null;
};

type JsonRecord = Record<string, unknown>;

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toStringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asRecord(value: unknown): JsonRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as JsonRecord;
}

function pickReplyArray(payload: unknown): unknown[] {
  const root = asRecord(payload);
  const conversation = asRecord(root?.conversation);
  const data = asRecord(root?.data);

  const candidates = [
    conversation?.messages,
    root?.replies,
    root?.messages,
    root?.conversation_messages,
    conversation?.replies,
    data?.replies,
    data?.messages,
  ];

  const found = candidates.find(Array.isArray);
  return Array.isArray(found) ? found : [];
}

function normalizeReplies(payload: unknown): ChatReply[] {
  const root = asRecord(payload);
  const currentUserId = toNumber(root?.current_user_id);

  return pickReplyArray(payload)
    .map((raw: unknown, index: number): ChatReply | null => {
      const rawRecord = asRecord(raw);
      const entity = asRecord(rawRecord?.entity);
      const replyRecord = asRecord(rawRecord?.reply);
      const user =
        asRecord(rawRecord?.user) ??
        asRecord(rawRecord?.sender) ??
        asRecord(rawRecord?.author) ??
        asRecord(replyRecord?.user);
      const userPhoto = asRecord(user?.photo);
      const userAvatar = asRecord(user?.avatar);
      const userId =
        toNumber(user?.id) ??
        toNumber(entity?.user_id) ??
        toNumber(rawRecord?.user_id) ??
        toNumber(rawRecord?.sender_id) ??
        toNumber(rawRecord?.author_id);
      const body =
        toStringValue(entity?.body) ||
        toStringValue(rawRecord?.body) ||
        toStringValue(rawRecord?.message) ||
        toStringValue(rawRecord?.text) ||
        toStringValue(rawRecord?.content) ||
        toStringValue(replyRecord?.body);

      const createdAt =
        toStringValue(rawRecord?.created_at_ts) ||
        toStringValue(rawRecord?.created_at) ||
        toStringValue(rawRecord?.updated_at) ||
        toStringValue(rawRecord?.sent_at) ||
        null;

      const login =
        toStringValue(user?.login) ||
        toStringValue(user?.name) ||
        (userId === currentUserId ? "You" : "Vinted user");

      const avatarUrl =
        toStringValue(userPhoto?.url) ||
        toStringValue(userAvatar?.url) ||
        null;

      const id =
        toStringValue(entity?.id) ||
        toStringValue(rawRecord?.id) ||
        toStringValue(rawRecord?.uuid) ||
        `${userId ?? "reply"}-${createdAt ?? index}`;

      if (!body && !rawRecord?.is_system && !rawRecord?.system_message) {
        return null;
      }

      return {
        id,
        body: body || "System message",
        createdAt,
        userId,
        login,
        avatarUrl,
        isOwn: currentUserId !== null && userId === currentUserId,
        isSystem: Boolean(rawRecord?.is_system || rawRecord?.system_message),
      };
    })
    .filter((reply): reply is ChatReply => Boolean(reply))
    .sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
      return aTime - bTime;
    });
}

function classifyOfferState(text: string): ThreadMeta["kind"] {
  const normalized = text.toLowerCase();
  if (normalized.includes("abgelehnt") || normalized.includes("declined")) {
    return "declined";
  }
  if (normalized.includes("angenommen") || normalized.includes("accepted")) {
    return "accepted";
  }
  if (normalized.includes("gegenangebot") || normalized.includes("counter")) {
    return "counter";
  }
  if (normalized.includes("angebot") || normalized.includes("offer")) {
    return "offer";
  }
  return "info";
}

function extractThreadMeta(payload: unknown): ThreadMeta | null {
  const root = asRecord(payload);
  const conversation = asRecord(root?.conversation);
  const transaction = asRecord(conversation?.transaction);
  const offerPrice = asRecord(transaction?.offer_price);
  const subtitle = toStringValue(conversation?.subtitle);
  const amount = toStringValue(offerPrice?.amount);
  const currency = toStringValue(offerPrice?.currency_code);

  const description = subtitle || (amount ? `Offer in this thread: ${amount} ${currency}` : "");
  if (!description && !amount) {
    return null;
  }

  const kind = classifyOfferState(description);

  if (kind === "info" && !amount) {
    return null;
  }

  return {
    kind,
    title:
      kind === "declined"
        ? "Offer Declined"
        : kind === "accepted"
          ? "Offer Accepted"
          : kind === "counter"
            ? "Counter Offer"
            : "Offer Activity",
    description,
    amount: amount ? `${amount} ${currency}`.trim() : null,
  };
}

function formatThreadTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatConversationTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function ChatsClient() {
  const { linked, loading: accountLoading } = useVintedAccount();
  const [conversations, setConversations] = useState<InboxConversation[]>([]);
  const [pagination, setPagination] = useState<InboxPagination | null>(null);
  const [page, setPage] = useState(1);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [replies, setReplies] = useState<ChatReply[]>([]);
  const [inboxLoading, setInboxLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [threadMeta, setThreadMeta] = useState<ThreadMeta | null>(null);
  const [toolsPanel, setToolsPanel] = useState<"templates" | "auto-reply" | "smart-offers" | null>(null);
  const selectedConversationIdRef = useRef<number | null>(null);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId]
  );

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  const fetchInbox = useCallback(async (pageNum: number, keepSelection = true) => {
    setInboxLoading(true);
    try {
      const res = await fetch(`/api/messages/inbox?page=${pageNum}&per_page=25`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to load inbox (${res.status})`);
      }

      const nextConversations = Array.isArray(data.conversations) ? data.conversations : [];
      setConversations(nextConversations);

      if (data.pagination) {
        setPagination({
          current_page: Number(data.pagination.current_page || pageNum),
          total_pages: Number(data.pagination.total_pages || 1),
          total_entries: Number(data.pagination.total_entries || nextConversations.length),
        });
      } else {
        setPagination(null);
      }

      if (nextConversations.length === 0) {
        setSelectedConversationId(null);
        setReplies([]);
        return;
      }

      const currentSelection = selectedConversationIdRef.current;
      if (keepSelection && currentSelection && nextConversations.some((item: InboxConversation) => item.id === currentSelection)) {
        return;
      }

      setSelectedConversationId(nextConversations[0].id);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to load chats");
    } finally {
      setInboxLoading(false);
    }
  }, []);

  const fetchConversation = useCallback(async (conversationId: number) => {
    setThreadLoading(true);
    try {
      const res = await fetch(`/api/messages/conversations/${conversationId}?page=1&per_page=100`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to load chat (${res.status})`);
      }

      setThreadMeta(extractThreadMeta(data));
      setReplies(normalizeReplies(data));
    } catch (error) {
      console.error(error);
      setThreadMeta(null);
      setReplies([]);
      toast.error(error instanceof Error ? error.message : "Failed to load chat");
    } finally {
      setThreadLoading(false);
    }
  }, []);

  useEffect(() => {
    if (linked) {
      void fetchInbox(page, false);
    }
  }, [fetchInbox, linked, page]);

  useEffect(() => {
    if (selectedConversationId) {
      void fetchConversation(selectedConversationId);
    }
  }, [fetchConversation, selectedConversationId]);

  async function handleSendReply() {
    if (!linked) {
      toast.error("Link your Vinted account first (Account tab)");
      return;
    }
    if (!selectedConversationId) {
      toast.error("Choose a chat first");
      return;
    }

    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/messages/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: selectedConversationId,
          message: trimmed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Reply failed (${res.status})`);
      }

      setMessage("");
      try {
        await Promise.all([
          fetchConversation(selectedConversationId),
          fetchInbox(page),
        ]);
      } catch {
        // Ignore refresh errors — message was sent successfully
      }
      toast.success("Message envoyé !");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Échec de l'envoi");
    } finally {
      setSending(false);
    }
  }

  if (accountLoading) {
    return (
      <div className="grid gap-5 xl:grid-cols-[350px_minmax(0,1fr)]">
        <div className="h-165 animate-pulse rounded-lg bg-muted" />
        <div className="h-165 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!linked) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/60">
          <MessageCircle className="h-8 w-8 text-foreground/24" />
        </div>
        <h2 className="text-base font-semibold text-foreground">Vinted Account Not Linked</h2>
        <p className="mt-1.5 max-w-sm text-foreground/48">
          Connect your Vinted account to view your inbox and answer chats directly from Vintrack.
        </p>
        <Button asChild size="sm" className="mt-6">
          <Link href="/account">Go to Account Settings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Chats</h1>
          <p className="mt-0.5 text-sm text-foreground/48">
            {pagination
              ? `${pagination.total_entries} conversations in your linked Vinted inbox.`
              : "Review your linked Vinted conversations and reply from one place."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void fetchInbox(page)}
            disabled={inboxLoading}
            className="h-9 gap-1.5 text-foreground/48 hover:text-foreground/72"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", inboxLoading && "animate-spin")} />
            Refresh Inbox
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => selectedConversationId && void fetchConversation(selectedConversationId)}
            disabled={!selectedConversationId || threadLoading}
            className="h-9 gap-1.5 text-foreground/48 hover:text-foreground/72"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", threadLoading && "animate-spin")} />
            Refresh Thread
          </Button>
        </div>
      </div>

      <div className={cn("grid gap-5", toolsPanel ? "xl:grid-cols-[350px_minmax(0,1fr)_320px]" : "xl:grid-cols-[350px_minmax(0,1fr)]")}>
        <Card className="flex h-165 overflow-hidden rounded-xl border-border/50 bg-card py-0">
          <CardHeader className="border-b border-border/30 bg-card px-5 py-4">
            <CardTitle className="text-base font-semibold">Inbox</CardTitle>
            <CardDescription className="text-foreground/48">
              Select a conversation to inspect the full message thread.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col px-0">
            {inboxLoading && conversations.length === 0 ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-20 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : conversations.length > 0 ? (
              <div className="min-h-0 flex-1 overflow-y-auto px-2 py-1">
                <div className="space-y-2 pb-1">
                  {conversations.map((conversation) => {
                    const active = conversation.id === selectedConversationId;
                    const imageUrl = conversation.item_photos?.[0]?.url || null;
                    const avatarUrl = conversation.opposite_user?.photo?.url || null;

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => setSelectedConversationId(conversation.id)}
                        className={cn(
                          "w-full rounded-xl border p-3 text-left transition-all duration-200",
                          active
                            ? "border-border/50 bg-accent text-accent-foreground"
                            : "border-border/30 bg-background hover:border-border/50 hover:bg-accent/40"
                        )}
                      >
                        <div className="flex gap-3">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={conversation.description || conversation.opposite_user?.login || "Conversation"}
                                className="h-full w-full object-cover"
                              />
                            ) : avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={conversation.opposite_user?.login || "User"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Inbox className="h-5 w-5 text-foreground/24" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground/90">
                                  @{conversation.opposite_user?.login || "unknown"}
                                </p>
                                <p className={cn("mt-1 truncate text-xs", active ? "text-foreground/48" : "text-foreground/48")}>
                                  {conversation.description || "Open conversation"}
                                </p>
                              </div>

                              {conversation.unread && (
                                <span className="rounded-full bg-foreground/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/72">
                                  Unread
                                </span>
                              )}
                            </div>

                            <div className={cn("mt-2 flex items-center justify-between text-[11px]", active ? "text-foreground/36" : "text-foreground/36")}>
                              <span>{conversation.item_count || 0} item</span>
                              <span>{formatConversationTime(conversation.updated_at)}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex h-120 flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                  <Inbox className="h-7 w-7 text-foreground/24" />
                </div>
                <p className="text-sm font-medium text-foreground">No chats found</p>
                <p className="mt-1 max-w-xs text-sm text-foreground/48">
                  Your Vinted inbox is empty or could not return any conversations yet.
                </p>
              </div>
            )}

            {pagination && pagination.total_pages > 1 && (
              <div className="flex items-center justify-between border-t border-border/30 bg-card px-4 py-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || inboxLoading}
                  className="border-border/50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-medium text-foreground/48">
                  Page {page} of {pagination.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((current) => Math.min(pagination.total_pages, current + 1))}
                  disabled={page >= pagination.total_pages || inboxLoading}
                  className="border-border/50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex h-165 overflow-hidden rounded-xl border-border/50 bg-card py-0">
          <CardHeader className="border-b border-border/30 bg-card px-6 py-4">
            <CardTitle className="text-base font-semibold">
              {selectedConversation
                ? `@${selectedConversation.opposite_user?.login || "unknown"}`
                : "Conversation"}
            </CardTitle>
            <CardDescription className="text-foreground/48">
              {selectedConversation?.description || "Select a conversation from the inbox."}
            </CardDescription>
          </CardHeader>

          {selectedConversation ? (
            <>
              <CardContent className="flex min-h-0 flex-1 flex-col px-0">
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-2">
                  {threadMeta && (
                    <div
                      className={cn(
                        "rounded-xl border px-4 py-3",
                        threadMeta.kind === "declined"
                          ? "border-red-500/20 bg-red-500/5 text-foreground"
                          : threadMeta.kind === "accepted"
                            ? "border-emerald-500/20 bg-emerald-500/5 text-foreground"
                            : threadMeta.kind === "counter"
                              ? "border-foreground/10 bg-accent/40 text-foreground"
                              : "border-foreground/10 bg-accent/40 text-foreground"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                            threadMeta.kind === "declined"
                              ? "bg-red-500/10 text-red-500"
                              : threadMeta.kind === "accepted"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-accent text-foreground/48"
                          )}
                        >
                          {threadMeta.kind === "declined" ? (
                            <XCircle className="h-4 w-4" />
                          ) : threadMeta.kind === "accepted" ? (
                            <ReceiptText className="h-4 w-4" />
                          ) : (
                            <HandCoins className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold">{threadMeta.title}</p>
                            {threadMeta.amount && (
                              <span className="rounded-full border border-border/50 px-2 py-0.5 text-[11px] font-semibold text-foreground/72">
                                {threadMeta.amount}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-foreground/48">
                            {threadMeta.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {threadLoading && replies.length === 0 ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div
                          key={index}
                          className={cn(
                            "h-20 animate-pulse rounded-lg bg-muted",
                            index % 2 === 0 ? "mr-16" : "ml-16"
                          )}
                        />
                      ))}
                    </div>
                  ) : replies.length > 0 ? (
                    replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={cn(
                          "flex first:pt-0 last:pb-1",
                          reply.isOwn ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-xl px-4 py-3 shadow-none",
                            reply.isSystem
                              ? "bg-muted text-foreground/48"
                              : reply.isOwn
                                ? "bg-foreground text-background dark:bg-white dark:text-slate-900"
                                : "border border-border/50 bg-background"
                          )}
                        >
                          <div className="mb-1 flex items-center gap-2 text-[11px]">
                            <span className={cn("font-semibold", reply.isOwn && !reply.isSystem ? "text-background/90 dark:text-slate-900" : "")}>
                              {reply.login}
                            </span>
                            {reply.createdAt && (
                              <span className={cn(reply.isOwn && !reply.isSystem ? "text-background/60 dark:text-slate-500" : "text-foreground/36")}>
                                {formatThreadTime(reply.createdAt)}
                              </span>
                            )}
                          </div>
                          <p className="whitespace-pre-wrap wrap-break-words text-sm leading-6">
                            {reply.body}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-full min-h-90 flex-col items-center justify-center text-center">
                      <div className="mb-4 rounded-full bg-muted p-4">
                        <MessageCircle className="h-7 w-7 text-foreground/24" />
                      </div>
                      <p className="text-sm font-medium text-foreground">No messages loaded</p>
                      <p className="mt-1 max-w-sm text-sm text-foreground/48">
                        The conversation opened, but Vintrack could not extract any replies from the Vinted response yet.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>

              <div className="border-t border-border/30 bg-card px-5 py-4">
                <div className="rounded-xl border border-border/50 bg-accent/20 p-3">
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Écrire un message..."
                    rows={3}
                    className="w-full resize-none border-0 bg-transparent text-sm outline-none placeholder:text-foreground/36"
                    maxLength={2000}
                    spellCheck={false}
                    autoCorrect="off"
                    autoComplete="off"
                    translate="no"
                    suppressHydrationWarning
                  />
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-foreground/36">
                      {message.trim().length}/2000 characters
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn("h-7 w-7 p-0", toolsPanel === "templates" && "bg-accent")}
                          onClick={() => setToolsPanel((p) => (p === "templates" ? null : "templates"))}
                          title="Templates"
                        >
                          <MessageSquareText className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn("h-7 w-7 p-0", toolsPanel === "auto-reply" && "bg-accent")}
                          onClick={() => setToolsPanel((p) => (p === "auto-reply" ? null : "auto-reply"))}
                          title="Auto-Reponse"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn("h-7 w-7 p-0", toolsPanel === "smart-offers" && "bg-accent")}
                          onClick={() => setToolsPanel((p) => (p === "smart-offers" ? null : "smart-offers"))}
                          title="Smart Offers"
                        >
                          <Zap className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Button
                        onClick={() => void handleSendReply()}
                        disabled={sending || !message.trim()}
                        className="gap-2"
                        size="sm"
                      >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Send Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex min-h-0 flex-1 items-center justify-center px-6">
              <div className="max-w-sm text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <MessageCircle className="h-8 w-8 text-foreground/24" />
                </div>
                <p className="text-base font-semibold text-foreground">Choose a conversation</p>
                <p className="mt-1 text-sm text-foreground/48">
                  Pick a chat from the left side to inspect the full Vinted thread and reply directly.
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {toolsPanel && (
          <Card className="flex h-165 overflow-hidden rounded-xl border-border/50 bg-card py-0">
            {toolsPanel === "templates" && (
              <TemplatesPanel onInsert={(msg) => setMessage(msg)} />
            )}
            {toolsPanel === "auto-reply" && <AutoReplyPanel />}
            {toolsPanel === "smart-offers" && <SmartOffersPanel />}
          </Card>
        )}
      </div>
    </div>
  );
}
