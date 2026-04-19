"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

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

  async function deleteUser() {
    if (!confirm("Da li si siguran da želiš da obrišeš ovog korisnika? Ova akcija je nepovratna.")) return
    setLoading(true)
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("profiles") as any).delete().eq("id", userId)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-1 shrink-0">
      <Button size="sm" variant="outline" onClick={togglePremium} disabled={loading} className="text-xs h-8 whitespace-nowrap">
        {isPremium ? "- Premium" : "+ Premium"}
      </Button>
      <Button size="sm" variant="ghost" onClick={toggleAdmin} disabled={loading} className="text-xs h-8 whitespace-nowrap">
        {isAdmin ? "- Admin" : "+ Admin"}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={deleteUser}
        disabled={loading}
        className="text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
