"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { SPECIES_OPTIONS, SIZE_OPTIONS } from "@/lib/utils"
import { sendWelcomeEmail } from "@/lib/resend"

interface Props { userId: string }

export function PetStep({ userId }: Props) {
  const [name, setName] = useState("")
  const [species, setSpecies] = useState("")
  const [breed, setBreed] = useState("")
  const [ageYears, setAgeYears] = useState("")
  const [gender, setGender] = useState<"male" | "female" | "">("")
  const [size, setSize] = useState("")
  const [description, setDescription] = useState("")
  const [isVaccinated, setIsVaccinated] = useState(false)
  const [isSterilized, setIsSterilized] = useState(false)
  const [availableForBreeding, setAvailableForBreeding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !species) {
      setError("Ime i vrsta su obavezni")
      return
    }
    setLoading(true)
    setError("")
    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: petError } = await (supabase.from("pets") as any).insert({
      owner_id: userId,
      name,
      species,
      breed: breed || null,
      age_years: ageYears ? parseInt(ageYears) : null,
      gender: gender || null,
      size: size || null,
      description: description || null,
      is_vaccinated: isVaccinated,
      is_sterilized: isSterilized,
      available_for_breeding: availableForBreeding,
    })

    if (petError) {
      setError(petError.message)
      setLoading(false)
      return
    }

    // Mark onboarding as complete
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", userId)

    // Send welcome email (best effort)
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .single()

    if (profile) {
      sendWelcomeEmail(profile.email, profile.full_name ?? "").catch(() => {})
    }

    router.push("/dashboard")
    router.refresh()
  }

  async function handleSkip() {
    const supabase = createClient()
    await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", userId)
    router.push("/dashboard")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Dodajte ljubimca</h2>
        <span className="text-sm text-stone-400">Korak 2 od 2</span>
      </div>
      <Progress value={100} className="mb-4" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pet_name">Ime ljubimca *</Label>
          <Input id="pet_name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Reks" className="mt-1" />
        </div>
        <div>
          <Label>Vrsta *</Label>
          <Select value={species} onValueChange={setSpecies}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Izaberite vrstu" />
            </SelectTrigger>
            <SelectContent>
              {SPECIES_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="breed">Rasa</Label>
          <Input id="breed" value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Nemačka ovčarka" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="age">Starost (godine)</Label>
          <Input id="age" type="number" min="0" max="30" value={ageYears} onChange={(e) => setAgeYears(e.target.value)} placeholder="3" className="mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Pol</Label>
          <Select value={gender} onValueChange={(v) => setGender(v as "male" | "female")}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Izaberite pol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Muški</SelectItem>
              <SelectItem value="female">Ženski</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Veličina</Label>
          <Select value={size} onValueChange={setSize}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Izaberite veličinu" />
            </SelectTrigger>
            <SelectContent>
              {SIZE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Opis</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opišite karakter i navike vašeg ljubimca..." rows={3} className="mt-1" />
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <Label>Vakcinisan</Label>
          <Switch checked={isVaccinated} onCheckedChange={setIsVaccinated} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Sterilisan/Kastriran</Label>
          <Switch checked={isSterilized} onCheckedChange={setIsSterilized} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Dostupan za parenje</Label>
          <Switch checked={availableForBreeding} onCheckedChange={setAvailableForBreeding} />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" className="flex-1" onClick={handleSkip}>
          Preskoči za sada
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Čuvanje..." : "Završi podešavanje"}
        </Button>
      </div>
    </form>
  )
}
