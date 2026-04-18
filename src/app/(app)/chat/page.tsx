import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ConversationList } from "@/components/chat/ConversationList"

export const metadata = { title: "Čet — PetMate" }

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  type ConvRow = {
    id: string
    match_id: string
    last_message_at: string
    created_at: string
    match: {
      id: string
      user1_id: string
      user2_id: string
      pet1_id: string
      pet2_id: string
      pet1: { id: string; name: string; species: string; breed: string | null; pet_photos: { url: string; is_primary: boolean }[] }
      pet2: { id: string; name: string; species: string; breed: string | null; pet_photos: { url: string; is_primary: boolean }[] }
      user1: { id: string; full_name: string | null; avatar_url: string | null }
      user2: { id: string; full_name: string | null; avatar_url: string | null }
    } | null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: conversationsData } = await (supabase as any)
    .from("conversations")
    .select(`
      *,
      match:matches!conversations_match_id_fkey(
        *,
        pet1:pets!matches_pet1_id_fkey(id, name, species, breed, pet_photos(url, is_primary)),
        pet2:pets!matches_pet2_id_fkey(id, name, species, breed, pet_photos(url, is_primary)),
        user1:profiles!matches_user1_id_fkey(id, full_name, avatar_url),
        user2:profiles!matches_user2_id_fkey(id, full_name, avatar_url)
      )
    `)
    .order("last_message_at", { ascending: false })

  const conversations = (conversationsData ?? []) as ConvRow[]

  // Filter to only conversations where user is a participant
  const myConversations = conversations.filter((c) => {
    return c.match?.user1_id === user.id || c.match?.user2_id === user.id
  })

  return <ConversationList conversations={myConversations} currentUserId={user.id} />
}
