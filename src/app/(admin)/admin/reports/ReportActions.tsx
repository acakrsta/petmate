"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Props {
  reportId: string
  currentStatus: string
}

export function ReportActions({ reportId, currentStatus }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function updateStatus(status: "pending" | "reviewed" | "resolved") {
    setLoading(true)
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("reports") as any).update({ status }).eq("id", reportId)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex gap-2 shrink-0">
      {currentStatus === "pending" && (
        <Button size="sm" variant="outline" onClick={() => updateStatus("reviewed" as const)} disabled={loading}>
          Pregledano
        </Button>
      )}
      {currentStatus !== "resolved" && (
        <Button size="sm" onClick={() => updateStatus("resolved" as const)} disabled={loading}>
          Reši
        </Button>
      )}
    </div>
  )
}
