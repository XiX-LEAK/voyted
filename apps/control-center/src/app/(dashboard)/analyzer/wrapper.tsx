"use client";
import dynamic from "next/dynamic";

const AnalyzerClient = dynamic(() => import("./client"), { ssr: false, loading: () => (
  <div className="space-y-6">
    <div className="h-12 animate-pulse rounded-2xl bg-muted" />
    <div className="h-64 animate-pulse rounded-2xl bg-muted" />
  </div>
)});

export function AnalyzerWrapper() { return <AnalyzerClient />; }
