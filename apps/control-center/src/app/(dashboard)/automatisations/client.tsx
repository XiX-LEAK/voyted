"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RefreshCw, RotateCcw, CalendarDays } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AutoRelistClient from "../auto-relist/client";
import RestockerClient from "../restocker/client";
import PlanningClient from "../planning/client";

const TABS = [
  { value: "auto-relist", label: "Auto-Relist", icon: RefreshCw },
  { value: "restocker", label: "Restocker", icon: RotateCcw },
  { value: "planning", label: "Planning", icon: CalendarDays },
];

function AutomatisationsTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "auto-relist";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Automatisations
        </h1>
        <p className="mt-0.5 text-sm text-foreground/48">
          Configurez vos automatisations de relist, restock et planning.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) =>
          router.push(`/automatisations?tab=${v}`, { scroll: false })
        }
      >
        <TabsList className="w-full">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="auto-relist">
          <AutoRelistClient />
        </TabsContent>
        <TabsContent value="restocker">
          <RestockerClient />
        </TabsContent>
        <TabsContent value="planning">
          <PlanningClient />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AutomatisationsClient() {
  return (
    <Suspense
      fallback={
        <div className="h-[70vh] animate-pulse rounded-lg bg-muted" />
      }
    >
      <AutomatisationsTabs />
    </Suspense>
  );
}
