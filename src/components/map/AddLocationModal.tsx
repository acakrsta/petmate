"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { X } from "lucide-react"

interface Props {
  mode: "parks" | "vets" | "shops"
  userId: string
  onClose: () => void
  onAdded: () => void
}

async function geocodeAddress(address: string, city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(`${address}, ${city}`)
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`)
    const data = await res.json()
    if (data[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
  } catch {}
  return null
}

export function AddLocationModal({ mode, userId, onClose, onAdded }: Props) {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [phone, setPhone] = useState("")
  const [website, setWebsite] = useState("")
  const [openingHours, setOpeningHours] = useState("")
  const [description, setDescription] = useState("")
  const [isFenced, setIsFenced] = useState(false)
  const [hasWater, setHasWater] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const modeLabels = { parks: "park za pse", vets: "veterinara", shops: "pet shop" }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !address || !city) {
      setError("Ime, adresa i grad su obavezni")
      return
    }
    setLoading(true)
    setError("")

    const coords = await geocodeAddress(address, city)
    if (!coords) {
      setError("Nije moguće pronaći koordinate za ovu adresu. Proverite adresu i pokušajte ponovo.")
      setLoading(false)
      return
    }

    const supabase = createClient()

    if (mode === "parks") {
      await supabase.from("dog_parks").insert({
        name, address, city, ...coords,
        is_fenced: isFenced,
        has_water_fountain: hasWater,
        description: description || null,
        added_by: userId,
        is_approved: true,
      })
    } else if (mode === "vets") {
      await supabase.from("veterinarians").insert({
        name, address, city, ...coords,
        phone: phone || null,
        website: website || null,
        opening_hours: openingHours ? { text: openingHours } : null,
        business_owner_id: userId,
        is_approved: false,
      })
    } else {
      await supabase.from("pet_shops").insert({
        name, address, city, ...coords,
        phone: phone || null,
        website: website || null,
        opening_hours: openingHours ? { text: openingHours } : null,
        business_owner_id: userId,
        is_approved: false,
      })
    }

    onAdded()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold">Dodajte {modeLabels[mode]}</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-stone-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Naziv *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Naziv lokacije" className="mt-1" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Adresa *</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ulica i broj" className="mt-1" required />
            </div>
            <div>
              <Label>Grad *</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Beograd" className="mt-1" required />
            </div>
          </div>

          {mode !== "parks" && (
            <>
              <div>
                <Label>Telefon</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+381..." className="mt-1" />
              </div>
              <div>
                <Label>Web sajt</Label>
                <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." className="mt-1" />
              </div>
              <div>
                <Label>Radno vreme</Label>
                <Input value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} placeholder="Pon-Pet: 8-20h" className="mt-1" />
              </div>
            </>
          )}

          {mode === "parks" && (
            <>
              <div className="flex items-center justify-between">
                <Label>Ograđen park</Label>
                <Switch checked={isFenced} onCheckedChange={setIsFenced} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Fontana za vodu</Label>
                <Switch checked={hasWater} onCheckedChange={setHasWater} />
              </div>
              <div>
                <Label>Opis</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opišite park..." rows={3} className="mt-1" />
              </div>
            </>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {mode !== "parks" && (
            <p className="text-xs text-stone-400">
              Poslovni profili se odobravaju od strane administratora pre nego što budu prikazani.
            </p>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Otkaži</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Dodavanje..." : "Dodaj"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
