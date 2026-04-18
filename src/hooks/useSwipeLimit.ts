"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { FREE_DAILY_SWIPE_LIMIT } from "@/lib/utils"
import type { Profile } from "@/types/database"

export function useSwipeLimit(profile: Profile | null) {
  const [remaining, setRemaining] = useState(FREE_DAILY_SWIPE_LIMIT)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!profile) return

    if (profile.is_premium) {
      setRemaining(Infinity)
      return
    }

    const today = new Date().toISOString().split("T")[0]
    if (profile.last_swipe_reset !== today) {
      setRemaining(FREE_DAILY_SWIPE_LIMIT)
    } else {
      setRemaining(Math.max(0, FREE_DAILY_SWIPE_LIMIT - profile.daily_swipe_count))
    }
  }, [profile])

  const incrementSwipe = async () => {
    if (!profile || profile.is_premium) return true

    if (remaining <= 0) return false

    setLoading(true)
    const supabase = createClient()
    const today = new Date().toISOString().split("T")[0]

    const newCount = profile.last_swipe_reset !== today ? 1 : profile.daily_swipe_count + 1

    await supabase
      .from("profiles")
      .update({ daily_swipe_count: newCount, last_swipe_reset: today })
      .eq("id", profile.id)

    setRemaining((r) => Math.max(0, r - 1))
    setLoading(false)
    return true
  }

  const isLimited = !profile?.is_premium && remaining <= 0

  return { remaining, isLimited, incrementSwipe, loading }
}
