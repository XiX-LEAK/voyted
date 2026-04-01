"use client";
import dynamic from "next/dynamic";
const SuiviClient = dynamic(() => import("./client"), { ssr: false, loading: () => <div className="h-96 animate-pulse rounded-2xl bg-muted" /> });
export function SuiviWrapper() { return <SuiviClient />; }
