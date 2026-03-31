"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Une erreur est survenue</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ne t&apos;inquiète pas, ton action a probablement fonctionné.
        </p>
      </div>
      <Button onClick={reset} className="gap-2 bg-violet-600 hover:bg-violet-500">
        <RefreshCw className="h-4 w-4" />
        Réessayer
      </Button>
    </div>
  )
}
