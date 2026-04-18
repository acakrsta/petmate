"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { SPECIES_OPTIONS, SIZE_OPTIONS, INTEREST_OPTIONS } from "@/lib/utils"
import type { Pet, PetPhoto } from "@/types/database"

type PetWithPhotos = Pet & { pet_photos: PetPhoto[] }

interface Props {
  pet?: PetWithPhotos
  onSaved: () => void
}

export function PetForm({ pet, onSaved }: Props) {
  const [name, setName] = useState(pet?.name ?? "")
  const [species, setSpecies] = useState(pet?.species ?? "")
  const [breed, setBreed] = useState(pet?.breed ?? "")
  const [ageYears, setAgeYears] = useState(pet?.age_years?.toString() ?? "")
  const [gender, setGender] = useState(pet?.gender ?? "")
  const [size, setSize] = useState(pet?.size ?? "")
  const [description, setDescription] = useState(pet?.description ?? "")
  const [isVaccinated, setIsVaccinated] = useState(pet?.is_vaccinated ?? false)
  const [isSterilized, setIsSterilized] = useState(pet?.is_sterilized ?? false)
  const [availableForBreeding, setAvailableForBreeding] = useState(pet?.available_for_breeding ?? false)
  const [breedingConditions, setBreedingConditions] = useState(pet?.breeding_conditions ?? "")
  const [allergies, setAllergies] = useState(pet?.allergies ?? "")
  const [interests, setInterests] = useState<string[]>(pet?.interests ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function toggleInterest(value: string) {
    setInterests((prev) => prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !species) {
      setError("Ime i vrsta su obavezni")
      return
    }
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      owner_id: user.id,
      name,
      species,
      breed: breed || null,
      age_years: ageYears ? parseInt(ageYears) : null,
      gender: (gender || null) as "male" | "female" | null,
      size: (size || null) as "small" | "medium" | "large" | "xlarge" | null,
      description: description || null,
      is_vaccinated: isVaccinated,
      is_sterilized: isSterilized,
      available_for_breeding: availableForBreeding,
      breeding_conditions: breedingConditions || null,
      allergies: allergies || null,
      interests: interests.length ? interests : null,
    }

    if (pet) {
      const { error } = await supabase.from("pets").update(payload).eq("id", pet.id)
      if (error) setError(error.message)
      else onSaved()
    } else {
      const { error } = await supabase.from("pets").insert(payload)
      if (error) setError(error.message)
      else onSaved()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Ime *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Reks" className="mt-1" required />
        </div>
        <div>
          <Label>Vrsta *</Label>
          <Select value={species} onValueChange={setSpecies}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Izaberite vrstu" /></SelectTrigger>
            <SelectContent>
              {SPECIES_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Rasa</Label>
          <Input value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Nemačka ovčarka" className="mt-1" />
        </div>
        <div>
          <Label>Starost (god.)</Label>
          <Input type="number" min="0" max="30" value={ageYears} onChange={(e) => setAgeYears(e.target.value)} placeholder="3" className="mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Pol</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Izaberite" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Muški</SelectItem>
              <SelectItem value="female">Ženski</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Veličina</Label>
          <Select value={size} onValueChange={setSize}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Izaberite" /></SelectTrigger>
            <SelectContent>
              {SIZE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Opis ličnosti</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opišite karakter vašeg ljubimca..." rows={3} className="mt-1" />
      </div>

      <div>
        <Label className="mb-2 block">Interesovanja</Label>
        <div className="grid grid-cols-2 gap-2">
          {INTEREST_OPTIONS.map((o) => (
            <label key={o.value} className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox
                checked={interests.includes(o.value)}
                onCheckedChange={() => toggleInterest(o.value)}
              />
              {o.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>Alergije</Label>
        <Input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Npr. određena hrana, trava..." className="mt-1" />
      </div>

      <div className="space-y-3 pt-2 border-t">
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
        {availableForBreeding && (
          <div>
            <Label>Uslovi parenja</Label>
            <Textarea value={breedingConditions} onChange={(e) => setBreedingConditions(e.target.value)} placeholder="Navedite uslove..." rows={2} className="mt-1" />
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Čuvanje..." : pet ? "Sačuvaj izmene" : "Dodaj ljubimca"}
      </Button>
    </form>
  )
}
