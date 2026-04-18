"use client"
import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Image as ImageIcon } from "lucide-react"

interface Props {
  conversationId: string
  senderId: string
}

export function MessageInput({ conversationId, senderId }: Props) {
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function sendMessage(content: string | null, imageUrl: string | null) {
    if (!content && !imageUrl) return
    const supabase = createClient()
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      image_url: imageUrl,
    })
    // Update last_message_at
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId)
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    await sendMessage(text.trim(), null)
    setText("")
    setSending(false)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    const supabase = createClient()
    const path = `${conversationId}/${Date.now()}.${file.name.split(".").pop()}`
    const { data, error } = await supabase.storage.from("chat-images").upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage.from("chat-images").getPublicUrl(data.path)
      await sendMessage(null, publicUrl)
    }
    if (fileRef.current) fileRef.current.value = ""
    setUploadingImage(false)
  }

  return (
    <form onSubmit={handleSend} className="flex items-center gap-2 p-4 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => fileRef.current?.click()}
        disabled={uploadingImage}
        className="shrink-0"
      >
        <ImageIcon className="h-5 w-5 text-stone-400" />
      </Button>
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={uploadingImage ? "Slanje slike..." : "Napišite poruku..."}
        disabled={sending || uploadingImage}
        className="flex-1"
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e) } }}
      />
      <Button type="submit" size="icon" disabled={!text.trim() || sending} className="shrink-0">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}
