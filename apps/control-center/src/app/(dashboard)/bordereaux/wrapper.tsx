"use client";
import dynamic from "next/dynamic";

const BordereauxClient = dynamic(() => import("./client"), { ssr: false, loading: () => (
  <div className="space-y-4">
    {Array.from({length: 4}).map((_, i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />)}
  </div>
)});

export function BordereauxWrapper() { return <BordereauxClient />; }
