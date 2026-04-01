"use client";
import dynamic from "next/dynamic";

const AnalyticsClient = dynamic(() => import("./client"), { ssr: false, loading: () => (
  <div className="space-y-6">
    <div className="h-10 w-48 animate-pulse rounded-xl bg-muted" />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({length: 4}).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />)}
    </div>
    <div className="h-72 animate-pulse rounded-2xl bg-muted" />
  </div>
)});

export function AnalyticsWrapper() { return <AnalyticsClient />; }
