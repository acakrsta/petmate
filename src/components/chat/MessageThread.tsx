"use client"
import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRealtimeMessages } from "@/hooks/useRealtime"
import { MessageInput } from "./MessageInput"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MoreVertical, Flag, Ban } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getInitials, formatRelativeTime } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Props {
  conversation: Record<string, unknown>
  initialMessages: { id: string; sender_id: string; content: string | null; image_url: string | null; created_at: string; is_read: boolean }[]
  currentUserId: string
}

export function MessageThread({ conversation, initialMessages, currentUserId }: Props) {
  const { messages } = useRealtimeMessages(conversation.id as string)
  const allMessages = messages.length > 0 ? messages : initialMessages
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const match = conversation.match as {
    user1_id: string
    user2_id: string
    user1: { id: string; full_name: string | null; avatar_url: string | null }
    user2: { id: string; full_name: string | null; avatar_url: string | null }
    pet1: { name: string; pet_photos: { url: string; is_primary: boolean }[] }
    pet2: { name: string; pet_photos: { url: string; is_primary: boolean }[] }
  } | null

  const isUser1 = match?.user1_id === currentUserId
  const otherUser = isUser1 ? match?.user2 : match?.user1
  const otherPet = isUser1 ? match?.pet2 : match?.pet1
  const photo = otherPet?.pet_photos?.find((p) => p.is_primary)?.url ?? otherPet?.pet_photos?.[0]?.url

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [allMessages])

  async function handleBlock() {
    if (!otherUser || !confirm("Da li ste sigurni da želite da blokirate ovog korisnika?")) return
    const supabase = createClient()
    await supabase.from("blocked_users").insert({ blocker_id: currentUserId, blocked_id: otherUser.id })
    router.push("/chat")
  }

  async function handleReport() {
    if (!otherUser) return
    const reason = prompt("Razlog prijave:")
    if (!reason) return
    const supabase = createClient()
    await supabase.from("reports").insert({
      reporter_id: currentUserId,
      reported_id: otherUser.id,
      reason,
    })
    alert("Prijava je poslata. Hvala!")
  }

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh-0px)]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="h-10 w-10 rounded-full overflow-hidden bg-amber-100 shrink-0">
          {photo ? (
            <img src={photo} alt={otherPet?.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg">🐾</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-stone-900 dark:text-white truncate">
            {otherPet?.name}
          </p>
          <p className="text-xs text-stone-500 truncate">
            Vlasnik: {otherUser?.full_name ?? "Korisnik"}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleReport} className="text-orange-600">
              <Flag className="h-4 w-4 mr-2" />
              Prijavi korisnika
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleBlock} className="text-red-600">
              <Ban className="h-4 w-4 mr-2" />
              Blokiraj korisnika
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {allMessages.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMe
                    ? "bg-amber-500 text-white rounded-br-sm"
                    : "bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white rounded-bl-sm"
                }`}
              >
                {msg.image_url && (
                  <img src={msg.image_url} alt="" className="rounded-lg max-w-full mb-1" style={{ maxHeight: 200 }} />
                )}
                {msg.content && <p className="text-sm">{msg.content}</p>}
                <p className={`text-xs mt-0.5 ${isMe ? "text-amber-100" : "text-stone-400"}`}>
                  {formatRelativeTime(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput conversationId={conversation.id as string} senderId={currentUserId} />
    </div>
  )
}
