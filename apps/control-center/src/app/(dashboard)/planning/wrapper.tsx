"use client";
import dynamic from "next/dynamic";

const PlanningClient = dynamic(() => import("./client"), { ssr: false, loading: () => (
  <div className="space-y-6">
    <div className="h-16 animate-pulse rounded-2xl bg-muted" />
    <div className="h-[500px] animate-pulse rounded-2xl bg-muted" />
  </div>
)});

export function PlanningWrapper() { return <PlanningClient />; }
