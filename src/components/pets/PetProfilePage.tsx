"use client"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { PetForm } from "./PetForm"
import { PhotoUpload } from "./PhotoUpload"
import { getInitials } from "@/lib/utils"
import { Plus, Edit, MapPin, Check } from "lucide-react"
import type { Profile, Pet, PetPhoto } from "@/types/database"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type PetWithPhotos = Pet & { pet_photos: PetPhoto[] }

interface Props {
  profile: Profile | null
  pets: PetWithPhotos[]
  isOwner: boolean
}

export function ProfilePage({ profile, pets: initialPets, isOwner }: Props) {
  const [pets, setPets] = useState(initialPets)
  const [editingPet, setEditingPet] = useState<PetWithPhotos | null>(null)
  const [showAddPet, setShowAddPet] = useState(false)
  const [selectedPet, setSelectedPet] = useState<PetWithPhotos | null>(null)
  const router = useRouter()

  async function handleDeletePet(petId: string) {
    if (!confirm("Da li ste sigurni?")) return
    const supabase = createClient()
    await supabase.from("pets").update({ is_active: false }).eq("id", petId)
    setPets((p) => p.filter((pet) => pet.id !== petId))
  }

  function handlePetSaved() {
    setShowAddPet(false)
    setEditingPet(null)
    router.refresh()
  }

  if (!profile) return null

  const speciesEmoji: Record<string, string> = {
    dog: "🐕", cat: "🐈", rabbit: "🐇", bird: "🐦", hamster: "🐹", other: "🐾",
  }

  const sizeLabel: Record<string, string> = {
    small: "Mali", medium: "Srednji", large: "Veliki", xlarge: "Extra veliki",
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* User Profile Header */}
      <Card>
        <CardContent className="p-6 flex items-start gap-5">
          <Avatar className="h-20 w-20 border-4 border-amber-100">
            <AvatarImage src={profile.avatar_url ?? ""} alt={profile.full_name ?? ""} />
            <AvatarFallback className="text-xl">{getInitials(profile.full_name ?? profile.email)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-stone-900 dark:text-white">
                {profile.full_name ?? "Korisnik"}
              </h1>
              {profile.is_premium && <Badge variant="premium">✨ Premium</Badge>}
              {profile.is_business && <Badge variant="secondary">🏢 Biznis</Badge>}
            </div>
            {profile.city && (
              <div className="flex items-center gap-1 text-stone-500 text-sm mt-1">
                <MapPin className="h-3 w-3" />
                {profile.city}
              </div>
            )}
            {profile.bio && <p className="text-stone-600 dark:text-stone-400 text-sm mt-2">{profile.bio}</p>}
          </div>
          {isOwner && (
            <Button variant="outline" size="sm" onClick={() => router.push("/settings")}>
              <Edit className="h-4 w-4 mr-1" />
              Uredi
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Pets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
            Ljubimci ({pets.filter((p) => p.is_active).length})
          </h2>
          {isOwner && (
            <Dialog open={showAddPet} onOpenChange={setShowAddPet}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Dodaj ljubimca
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novi ljubimac</DialogTitle>
                </DialogHeader>
                <PetForm onSaved={handlePetSaved} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {pets.filter((p) => p.is_active).map((pet) => {
            const primaryPhoto = pet.pet_photos.find((p) => p.is_primary)?.url ?? pet.pet_photos[0]?.url
            return (
              <Card key={pet.id} className="overflow-hidden">
                {/* Photos strip */}
                <div className="h-48 bg-gradient-to-br from-amber-50 to-orange-50 relative overflow-hidden">
                  {primaryPhoto ? (
                    <img src={primaryPhoto} alt={pet.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      {speciesEmoji[pet.species] ?? "🐾"}
                    </div>
                  )}
                  {isOwner && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Dialog open={editingPet?.id === pet.id} onOpenChange={(o) => { if (!o) setEditingPet(null) }}>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => setEditingPet(pet)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Uredi {pet.name}</DialogTitle>
                          </DialogHeader>
                          <PetForm pet={pet} onSaved={handlePetSaved} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>

                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-stone-900 dark:text-white text-lg">{pet.name}</h3>
                      <p className="text-stone-500 text-sm">
                        {speciesEmoji[pet.species]} {pet.breed ?? pet.species}
                        {pet.age_years !== null && ` · ${pet.age_years}g`}
                        {pet.gender && ` · ${pet.gender === "male" ? "Muški" : "Ženski"}`}
                        {pet.size && ` · ${sizeLabel[pet.size]}`}
                      </p>
                    </div>
                    {pet.available_for_breeding && (
                      <Badge className="shrink-0">Parenje</Badge>
                    )}
                  </div>

                  {pet.description && (
                    <p className="text-stone-600 dark:text-stone-400 text-sm">{pet.description}</p>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {pet.is_vaccinated && (
                      <Badge variant="secondary">
                        <Check className="h-3 w-3 mr-1" />
                        Vakcinisan
                      </Badge>
                    )}
                    {pet.is_sterilized && (
                      <Badge variant="secondary">
                        <Check className="h-3 w-3 mr-1" />
                        Sterilisan
                      </Badge>
                    )}
                  </div>

                  {isOwner && (
                    <>
                      <Separator />
                      <PhotoUpload petId={pet.id} existingPhotos={pet.pet_photos} />
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
