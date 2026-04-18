"use client"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle } from "lucide-react"
import Link from "next/link"

interface Pet {
  id: string
  name: string
  pet_photos: { url: string; is_primary: boolean }[]
  profiles: { full_name: string | null; city: string | null }
}

interface Props {
  pet: Pet
  onClose: () => void
}

export function MatchModal({ pet, onClose }: Props) {
  const photo = pet.pet_photos.find((p) => p.is_primary)?.url ?? pet.pet_photos[0]?.url

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm w-full z-10">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-stone-900 mb-1">Match!</h2>
        <p className="text-stone-500 mb-6">
          Vi i vlasnik psa <strong>{pet.name}</strong> ste se međusobno svidjeli!
        </p>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
              {photo ? (
                <img src={photo} alt={pet.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-amber-100 flex items-center justify-center text-4xl">🐾</div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-pink-500 rounded-full p-1">
              <Heart className="h-4 w-4 text-white fill-white" />
            </div>
          </div>
        </div>

        <p className="text-sm text-stone-500 mb-6">
          {pet.profiles.full_name && `Vlasnik: ${pet.profiles.full_name}`}
          {pet.profiles.city && ` · ${pet.profiles.city}`}
        </p>

        <div className="space-y-2">
          <Link href="/chat" onClick={onClose}>
            <Button className="w-full">
              <MessageCircle className="h-4 w-4 mr-2" />
              Pošaljite poruku
            </Button>
          </Link>
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Nastavi pretragu
          </Button>
        </div>
      </div>
    </div>
  )
}
