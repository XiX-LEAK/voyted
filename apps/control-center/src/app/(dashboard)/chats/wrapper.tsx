"use client";

import dynamic from "next/dynamic";

const ChatsClient = dynamic(
  () => import("./client").then((m) => ({ default: m.ChatsClient })),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="h-96 animate-pulse rounded-3xl bg-muted" />
        <div className="h-96 animate-pulse rounded-3xl bg-muted" />
      </div>
    ),
  }
);

export function ChatsWrapper() {
  return <ChatsClient />;
}
