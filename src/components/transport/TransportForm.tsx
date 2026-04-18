"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Props { userId: string }

export function TransportForm({ userId }: Props) {
  const [fromCity, setFromCity] = useState("")
  const [toCity, setToCity] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [spots, setSpots] = useState("1")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fromCity || !toCity || !date) {
      setError("Grad polaska, grad dolaska i datum su obavezni")
      return
    }
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { error } = await supabase.from("transports").insert({
      driver_id: userId,
      from_city: fromCity,
      to_city: toCity,
      departure_date: date,
      departure_time: time || null,
      available_spots: parseInt(spots) || 1,
      price_per_pet: price ? parseFloat(price) : null,
      description: description || null,
    })
    if (error) {
      setError(error.message)
    } else {
      router.push("/transport")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Grad polaska *</Label>
          <Input value={fromCity} onChange={(e) => setFromCity(e.target.value)} placeholder="Beograd" className="mt-1" required />
        </div>
        <div>
          <Label>Grad dolaska *</Label>
          <Input value={toCity} onChange={(e) => setToCity(e.target.value)} placeholder="Novi Sad" className="mt-1" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Datum polaska *</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="mt-1" required />
        </div>
        <div>
          <Label>Vreme polaska</Label>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Slobodnih mesta</Label>
          <Input type="number" min="1" max="10" value={spots} onChange={(e) => setSpots(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Cena po ljubimcu (RSD)</Label>
          <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0 = besplatno" className="mt-1" />
        </div>
      </div>

      <div>
        <Label>Napomena</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Vrsta vozila, uslovi prevoza..." rows={3} className="mt-1" />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>Otkaži</Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Objavljivanje..." : "Objavi prevoz"}
        </Button>
      </div>
    </form>
  )
}
