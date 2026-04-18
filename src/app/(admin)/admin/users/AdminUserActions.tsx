"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Props {
  userId: string
  isPremium: boolean
  isAdmin: boolean
}

export function AdminUserActions({ userId, isPremium, isAdmin }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function togglePremium() {
    setLoading(true)
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("profiles") as any).update({ is_premium: !isPremium }).eq("id", userId)
    router.refresh()
    setLoading(false)
  }

  async function toggleAdmin() {
    setLoading(true)
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("profiles") as any).update({ is_admin: !isAdmin }).eq("id", userId)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Button size="sm" variant="outline" onClick={togglePremium} disabled={loading}>
        {isPremium ? "Ukloni Premium" : "Daj Premium"}
      </Button>
      <Button size="sm" variant="ghost" onClick={toggleAdmin} disabled={loading}>
        {isAdmin ? "Ukloni Admin" : "Daj Admin"}
      </Button>
    </div>
  )
}
