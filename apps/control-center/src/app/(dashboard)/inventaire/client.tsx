"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Package, ShoppingBag, Copy, Users, Download } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import StockClient from "../stock/client";
import VentesClient from "../ventes/client";
import RepostClient from "../repost/client";
import AcheteursClient from "../acheteurs/client";
import ExportClient from "../export/client";

const TABS = [
  { value: "stock", label: "Stock", icon: Package },
  { value: "ventes", label: "Ventes", icon: ShoppingBag },
  { value: "repost", label: "Repost", icon: Copy },
  { value: "acheteurs", label: "Acheteurs", icon: Users },
  { value: "export", label: "Export", icon: Download },
];

function InventaireTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "stock";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Inventaire
        </h1>
        <p className="mt-0.5 text-sm text-foreground/48">
          Gerez votre stock, ventes, reposts et acheteurs depuis un seul
          endroit.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) =>
          router.push(`/inventaire?tab=${v}`, { scroll: false })
        }
      >
        <TabsList className="w-full">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="gap-1.5"
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="stock">
          <StockClient />
        </TabsContent>
        <TabsContent value="ventes">
          <VentesClient />
        </TabsContent>
        <TabsContent value="repost">
          <RepostClient />
        </TabsContent>
        <TabsContent value="acheteurs">
          <AcheteursClient />
        </TabsContent>
        <TabsContent value="export">
          <ExportClient />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function InventaireClient() {
  return (
    <Suspense
      fallback={
        <div className="h-[70vh] animate-pulse rounded-lg bg-muted" />
      }
    >
      <InventaireTabs />
    </Suspense>
  );
}
