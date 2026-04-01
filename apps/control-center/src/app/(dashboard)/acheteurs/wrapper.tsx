"use client";
import dynamic from "next/dynamic";
const AcheteursClient = dynamic(() => import("./client"), { ssr: false, loading: () => <div className="h-96 animate-pulse rounded-2xl bg-muted" /> });
export function AcheteursWrapper() { return <AcheteursClient />; }
