"use client";
import dynamic from "next/dynamic";

const StockClient = dynamic(() => import("./client"), { ssr: false, loading: () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({length: 8}).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />)}
  </div>
)});

export function StockWrapper() { return <StockClient />; }
