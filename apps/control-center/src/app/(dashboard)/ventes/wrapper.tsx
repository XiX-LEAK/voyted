"use client";
import dynamic from "next/dynamic";
const VentesClient = dynamic(() => import("./client"), { ssr: false, loading: () => <div className="h-96 animate-pulse rounded-2xl bg-muted" /> });
export function VentesWrapper() { return <VentesClient />; }
