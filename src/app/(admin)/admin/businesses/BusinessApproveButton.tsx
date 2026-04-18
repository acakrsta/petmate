"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Props {
  id: string
  table: "veterinarians" | "pet_shops"
  isApproved: boolean
}

export function BusinessApproveButton({ id, table, isApproved }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from(table) as any).update({ is_approved: !isApproved }).eq("id", id)
    router.refresh()
    setLoading(false)
  }

  return (
    <Button
      size="sm"
      variant={isApproved ? "outline" : "default"}
      onClick={toggle}
      disabled={loading}
      className="shrink-0"
    >
      {isApproved ? "Povuci odobrenje" : "Odobri"}
    </Button>
  )
}
