"use client";
import dynamic from "next/dynamic";

const ComptesClient = dynamic(() => import("./client"), {
  ssr: false,
  loading: () => (
    <div className="space-y-6 mx-auto max-w-5xl">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-56 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  ),
});

export function ComptesWrapper() {
  return <ComptesClient />;
}
