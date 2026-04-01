"use client";
import dynamic from "next/dynamic";

const AutoRelistClient = dynamic(() => import("./client"), { ssr: false, loading: () => (
  <div className="space-y-6">
    <div className="h-10 w-48 animate-pulse rounded-xl bg-muted" />
    <div className="h-64 animate-pulse rounded-2xl bg-muted" />
    <div className="h-40 animate-pulse rounded-2xl bg-muted" />
  </div>
)});

export function AutoRelistWrapper() { return <AutoRelistClient />; }
