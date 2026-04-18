"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import type { Profile } from "@/types/database"
import Image from "next/image"

interface Props {
  profile: Profile | null
}

export function ProfileStep({ profile }: Props) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "")
  const [city, setCity] = useState(profile?.city ?? "")
  const [bio, setBio] = useState(profile?.bio ?? "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "")
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const path = `${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(data.path)
      setAvatarUrl(publicUrl)
    }
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !city.trim()) {
      setError("Ime i grad su obavezni")
      return
    }
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, email: user.email!, full_name: fullName, city, bio, avatar_url: avatarUrl })

    if (error) {
      setError(error.message)
    } else {
      router.push("/onboarding/pets")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Vaš profil</h2>
        <span className="text-sm text-stone-400">Korak 1 od 2</span>
      </div>
      <Progress value={50} className="mb-4" />

      <div className="flex flex-col items-center gap-3">
        <div className="relative w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden border-2 border-amber-200">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
          ) : (
            <span className="text-3xl">👤</span>
          )}
        </div>
        <label className="cursor-pointer text-sm text-amber-600 hover:underline">
          {uploading ? "Uploading..." : "Dodajte profilnu sliku"}
          <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
        </label>
      </div>

      <div>
        <Label htmlFor="full_name">Ime i prezime *</Label>
        <Input
          id="full_name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Marko Marković"
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="city">Grad *</Label>
        <Input
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Beograd"
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="bio">O vama</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Kratko opišite sebe kao vlasnika..."
          rows={3}
          className="mt-1"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Čuvanje..." : "Sledeći korak →"}
      </Button>
    </form>
  )
}
