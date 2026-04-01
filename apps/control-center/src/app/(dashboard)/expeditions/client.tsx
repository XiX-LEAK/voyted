"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Truck, Printer, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SuiviClient from "../suivi/client";
import BordereauxClient from "../bordereaux/client";
import FacturesClient from "../factures/client";

const TABS = [
  { value: "suivi", label: "Suivi Colis", icon: Truck },
  { value: "bordereaux", label: "Bordereaux", icon: Printer },
  { value: "factures", label: "Factures", icon: FileText },
];

function ExpeditionsTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "suivi";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Expeditions</h1>
        <p className="mt-0.5 text-sm text-foreground/48">
          Suivez vos colis, bordereaux et factures en un seul endroit.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => router.push(`/expeditions?tab=${v}`, { scroll: false })}>
        <TabsList className="w-full">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="suivi"><SuiviClient /></TabsContent>
        <TabsContent value="bordereaux"><BordereauxClient /></TabsContent>
        <TabsContent value="factures"><FacturesClient /></TabsContent>
      </Tabs>
    </div>
  );
}

export default function ExpeditionsClient() {
  return (
    <Suspense fallback={<div className="h-[70vh] animate-pulse rounded-lg bg-muted" />}>
      <ExpeditionsTabs />
    </Suspense>
  );
}
