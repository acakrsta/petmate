"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials, FREE_DAILY_SWIPE_LIMIT } from "@/lib/utils"
import type { Profile } from "@/types/database"

interface Props { profile: Profile | null }

export function SettingsClient({ profile }: Props) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "")
  const [city, setCity] = useState(profile?.city ?? "")
  const [bio, setBio] = useState(profile?.bio ?? "")
  const [isBusiness, setIsBusiness] = useState(profile?.is_business ?? false)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "")
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploading(true)
    const supabase = createClient()
    const path = `${profile.id}.${file.name.split(".").pop()}`
    const { data, error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(data.path)
      setAvatarUrl(publicUrl)
    }
    setUploading(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, city, bio, is_business: isBusiness, avatar_url: avatarUrl })
      .eq("id", profile.id)
    if (error) setError(error.message)
    else { setSaved(true); setTimeout(() => setSaved(false), 2000) }
    setLoading(false)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (!profile) return null

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Podešavanja</h1>

      {/* Profile settings */}
      <Card>
        <CardHeader>
          <CardTitle>Lični podaci</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl} alt={fullName} />
                <AvatarFallback className="text-lg">{getInitials(fullName || profile.email)}</AvatarFallback>
              </Avatar>
              <label className="cursor-pointer text-sm text-amber-600 hover:underline">
                {uploading ? "Uploading..." : "Promenite sliku"}
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
              </label>
            </div>
            <div>
              <Label>Ime i prezime</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Grad</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Beograd" className="mt-1" />
            </div>
            <div>
              <Label>O vama</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="mt-1" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Poslovni nalog</Label>
                <p className="text-xs text-stone-400 mt-0.5">Veterinari, pet shopovi, prevoznici</p>
              </div>
              <Switch checked={isBusiness} onCheckedChange={setIsBusiness} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {saved ? "✓ Sačuvano!" : loading ? "Čuvanje..." : "Sačuvaj izmene"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Premium */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Premium nalog
            {profile.is_premium && <Badge variant="premium">✨ Aktivan</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.is_premium ? (
            <p className="text-stone-600 dark:text-stone-400">
              Imate aktivan Premium nalog. Uživajte u neograničenim swipe-ovima i svim premium funkcijama!
            </p>
          ) : (
            <>
              <p className="text-stone-600 dark:text-stone-400 text-sm">
                Besplatni nalog: <strong>{FREE_DAILY_SWIPE_LIMIT} swipe-ova/dan</strong>
              </p>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                <p className="font-semibold text-amber-900 mb-2">✨ Premium prednosti:</p>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>✓ Neograničeni swipe-ovi</li>
                  <li>✓ Vidite ko vas je lajkovao</li>
                  <li>✓ Prioritet u pretrazi</li>
                  <li>✓ Premium badge na profilu</li>
                  <li>✓ Napredni filteri</li>
                </ul>
              </div>
              <Button className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 border-0">
                Aktiviraj Premium — 499 RSD/mesec
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Nalog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-stone-500">Email adresa</p>
            <p className="font-medium text-stone-900 dark:text-white">{profile.email}</p>
          </div>
          <Separator />
          <Button variant="destructive" className="w-full" onClick={handleLogout}>
            Odjavite se
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
