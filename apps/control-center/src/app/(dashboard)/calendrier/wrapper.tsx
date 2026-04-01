"use client";
import dynamic from "next/dynamic";

const CalendrierClient = dynamic(() => import("./client"), {
  loading: () => (
    <div className="space-y-6">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="h-[70vh] animate-pulse rounded-lg bg-muted" />
    </div>
  ),
});

export function CalendrierWrapper() {
  return <CalendrierClient />;
}
