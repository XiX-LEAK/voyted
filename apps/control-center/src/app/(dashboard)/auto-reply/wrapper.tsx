"use client";
import dynamic from "next/dynamic";

const AutoReplyClient = dynamic(() => import("./client"), { ssr: false, loading: () => (
  <div className="space-y-6">
    <div className="h-16 animate-pulse rounded-2xl bg-muted" />
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({length: 4}).map((_, i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />)}
    </div>
  </div>
)});

export function AutoReplyWrapper() { return <AutoReplyClient />; }
