"use client"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getInitials, formatRelativeTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Props {
  conversations: Record<string, unknown>[]
  currentUserId: string
}

export function ConversationList({ conversations, currentUserId }: Props) {
  if (!conversations.length) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 text-center">
        <MessageCircle className="h-12 w-12 text-stone-200 mb-4" />
        <h3 className="text-xl font-semibold text-stone-700 mb-2">Nema razgovora</h3>
        <p className="text-stone-500 mb-6">
          Nakon što dobijete match, možete započeti razgovor.
        </p>
        <Link href="/discover">
          <Button>Pronađite ljubimce</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-white mb-4 px-2">Razgovori</h1>
      <div className="space-y-1">
        {conversations.map((conv) => {
          const id = conv.id as string
          const match = conv.match as {
            user1_id: string
            user2_id: string
            user1: { id: string; full_name: string | null; avatar_url: string | null }
            user2: { id: string; full_name: string | null; avatar_url: string | null }
            pet1: { name: string; pet_photos: { url: string; is_primary: boolean }[] }
            pet2: { name: string; pet_photos: { url: string; is_primary: boolean }[] }
          } | null
          const lastMessageAt = conv.last_message_at as string

          if (!match) return null

          const isUser1 = match.user1_id === currentUserId
          const otherUser = isUser1 ? match.user2 : match.user1
          const otherPet = isUser1 ? match.pet2 : match.pet1
          const photo = otherPet?.pet_photos?.find((p) => p.is_primary)?.url ?? otherPet?.pet_photos?.[0]?.url

          return (
            <Link key={id} href={`/chat/${id}`}>
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-amber-100">
                    {photo ? (
                      <img src={photo} alt={otherPet?.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🐾</div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-stone-900 dark:text-white truncate">
                      {otherPet?.name} · {otherUser?.full_name}
                    </p>
                    <span className="text-xs text-stone-400 shrink-0 ml-2">
                      {formatRelativeTime(lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500 truncate">Kliknite da otvorite razgovor</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
