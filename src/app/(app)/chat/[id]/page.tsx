import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { MessageThread } from "@/components/chat/MessageThread"

export default async function ChatThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: conversationData } = await (supabase as any)
    .from("conversations")
    .select(`
      *,
      match:matches!conversations_match_id_fkey(
        *,
        pet1:pets!matches_pet1_id_fkey(id, name, species, pet_photos(url, is_primary)),
        pet2:pets!matches_pet2_id_fkey(id, name, species, pet_photos(url, is_primary)),
        user1:profiles!matches_user1_id_fkey(id, full_name, avatar_url, city),
        user2:profiles!matches_user2_id_fkey(id, full_name, avatar_url, city)
      )
    `)
    .eq("id", id)
    .single()

  const conversation = conversationData as {
    id: string
    match_id: string
    last_message_at: string
    created_at: string
    match: {
      user1_id: string
      user2_id: string
      pet1_id: string
      pet2_id: string
      pet1: { id: string; name: string; species: string; pet_photos: { url: string; is_primary: boolean }[] }
      pet2: { id: string; name: string; species: string; pet_photos: { url: string; is_primary: boolean }[] }
      user1: { id: string; full_name: string | null; avatar_url: string | null; city: string | null }
      user2: { id: string; full_name: string | null; avatar_url: string | null; city: string | null }
    } | null
  } | null

  if (!conversation) notFound()

  const match = conversation.match
  if (match?.user1_id !== user.id && match?.user2_id !== user.id) notFound()

  // Load initial messages
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })

  // Mark messages as read
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("messages") as any)
    .update({ is_read: true })
    .eq("conversation_id", id)
    .neq("sender_id", user.id)

  return (
    <MessageThread
      conversation={conversation}
      initialMessages={messages ?? []}
      currentUserId={user.id}
    />
  )
}
