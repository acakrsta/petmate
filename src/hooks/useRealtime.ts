"use client"
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Message } from "@/types/database"

export function useRealtimeMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  const loadMessages = useCallback(async () => {
    if (!conversationId) return
    const supabase = createClient()
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
    setMessages(data ?? [])
    setLoading(false)
  }, [conversationId])

  useEffect(() => {
    if (!conversationId) return
    loadMessages()

    const supabase = createClient()
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, loadMessages])

  return { messages, loading, reload: loadMessages }
}

export function useUnreadCount(userId: string | null) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false)
      .neq("sender_id", userId)
      .then(({ count: c }) => setCount(c ?? 0))
  }, [userId])

  return count
}
