"use client";
import dynamic from "next/dynamic";
const ExportClient = dynamic(() => import("./client"), { ssr: false, loading: () => <div className="h-96 animate-pulse rounded-2xl bg-muted" /> });
export function ExportWrapper() { return <ExportClient />; }
