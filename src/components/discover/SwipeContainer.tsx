"use client"
import { useState, useRef, useCallback } from "react"
import TinderCard from "react-tinder-card"

type TinderAPI = { swipe(dir?: string): Promise<void>; restoreCard(): Promise<void> }
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { X, Heart, Star, Filter, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useSwipeLimit } from "@/hooks/useSwipeLimit"
import { FREE_DAILY_SWIPE_LIMIT } from "@/lib/utils"
import type { Profile } from "@/types/database"
import { MatchModal } from "./MatchModal"
import { FilterPanel } from "./FilterPanel"
import Link from "next/link"

interface Pet {
  id: string
  name: string
  species: string
  breed: string | null
  age_years: number | null
  gender: string | null
  size: string | null
  description: string | null
  is_vaccinated: boolean
  available_for_breeding: boolean
  pet_photos: { url: string; is_primary: boolean }[]
  profiles: Profile
}

interface Props {
  pets: Pet[]
  currentUserId: string
  profile: Profile | null
}

const speciesEmoji: Record<string, string> = {
  dog: "🐕", cat: "🐈", rabbit: "🐇", bird: "🐦", hamster: "🐹", other: "🐾",
}

export function SwipeContainer({ pets: initialPets, currentUserId, profile }: Props) {
  const [pets, setPets] = useState(initialPets)
  const [currentIndex, setCurrentIndex] = useState(initialPets.length - 1)
  const [matchedPet, setMatchedPet] = useState<Pet | null>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [purpose, setPurpose] = useState("any")
  const { remaining, isLimited, incrementSwipe } = useSwipeLimit(profile)
  const childRefs = useRef<(React.RefObject<TinderAPI | null>)[]>(
    Array(initialPets.length).fill(null).map(() => ({ current: null }))
  )

  const swiped = useCallback(
    async (direction: string, petId: string, pet: Pet) => {
      const canSwipe = await incrementSwipe()
      if (!canSwipe) return

      if (direction === "right") {
        const supabase = createClient()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("swipes") as any).upsert({
          swiper_id: currentUserId,
          swiped_pet_id: petId,
          direction: "right",
          purpose,
        })

        // Check for mutual match
        const { data: mutualSwipe } = await supabase
          .from("swipes")
          .select("id")
          .eq("swiper_id", pet.profiles.id)
          .eq("swiped_pet_id", petId)
          .eq("direction", "right")
          .maybeSingle()

        if (mutualSwipe) {
          // Get my active pet
          const { data: myPet } = await supabase
            .from("pets")
            .select("id")
            .eq("owner_id", currentUserId)
            .eq("is_active", true)
            .limit(1)
            .single()

          if (myPet) {
            // Create match
            const { data: match } = await supabase
              .from("matches")
              .insert({
                user1_id: currentUserId,
                user2_id: pet.profiles.id,
                pet1_id: myPet.id,
                pet2_id: petId,
              })
              .select()
              .single()

            if (match) {
              // Create conversation
              await supabase.from("conversations").insert({ match_id: match.id })
              setMatchedPet(pet)
            }
          }
        }
      } else {
        const supabase = createClient()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("swipes") as any).upsert({
          swiper_id: currentUserId,
          swiped_pet_id: petId,
          direction: "left",
          purpose,
        })
      }

      setCurrentIndex((prev) => prev - 1)
    },
    [currentUserId, incrementSwipe, purpose]
  )

  const swipe = useCallback(async (dir: string) => {
    if (currentIndex < 0 || isLimited) return
    const ref = childRefs.current[currentIndex]
    if (ref?.current?.swipe) {
      await ref.current.swipe(dir)
    }
  }, [currentIndex, isLimited])

  const currentPet = pets[currentIndex]

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen max-w-md mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-white">Otkrijte</h1>
          {!profile?.is_premium && (
            <p className="text-xs text-stone-500">
              {isLimited ? (
                <span className="text-red-500">Dostigli ste dnevni limit. <Link href="/settings" className="underline text-amber-600">Premium →</Link></span>
              ) : (
                `${remaining}/${FREE_DAILY_SWIPE_LIMIT} swipe-ova danas`
              )}
            </p>
          )}
        </div>
        <Button variant="outline" size="icon" onClick={() => setShowFilter(true)}>
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Card Stack */}
      <div className="flex-1 relative flex items-center justify-center">
        {currentIndex < 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-xl font-semibold text-stone-700 mb-2">Nema više profila</h3>
            <p className="text-stone-500 text-sm mb-6">Pregledali ste sve dostupne ljubimce u vašoj okolini.</p>
            <Button onClick={() => window.location.reload()}>Osvežite</Button>
          </div>
        ) : (
          <div className="relative w-full max-w-xs" style={{ height: 480 }}>
            {/* Background cards for depth effect */}
            {currentIndex > 0 && (
              <div className="absolute inset-0 bg-white border border-stone-200 rounded-2xl shadow-sm" style={{ transform: "scale(0.95) translateY(10px)", zIndex: 0 }} />
            )}
            {currentIndex > 1 && (
              <div className="absolute inset-0 bg-white border border-stone-200 rounded-2xl shadow-sm" style={{ transform: "scale(0.9) translateY(20px)", zIndex: -1 }} />
            )}

            {pets.map((pet, index) => {
              if (index < currentIndex - 2 || index > currentIndex) return null
              const isTop = index === currentIndex
              const ref = childRefs.current[index]
              const primaryPhoto = pet.pet_photos.find((p) => p.is_primary)?.url ?? pet.pet_photos[0]?.url

              return (
                <div key={pet.id} style={{ position: "absolute", inset: 0, zIndex: index + 1 }}>
                  <TinderCard
                    ref={ref as React.RefObject<TinderAPI>}
                    onSwipe={(dir) => swiped(dir, pet.id, pet)}
                    preventSwipe={isLimited ? ["left", "right", "up", "down"] : ["up", "down"]}
                    className="w-full h-full"
                  >
                    <div className="w-full h-full bg-white rounded-2xl overflow-hidden shadow-xl border border-stone-100 cursor-grab active:cursor-grabbing select-none">
                      {/* Photo */}
                      <div className="h-72 bg-gradient-to-br from-amber-50 to-orange-50 relative">
                        {primaryPhoto ? (
                          <img src={primaryPhoto} alt={pet.name} className="w-full h-full object-cover" draggable={false} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-7xl">
                            {speciesEmoji[pet.species] ?? "🐾"}
                          </div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h2 className="text-xl font-bold text-stone-900">{pet.name}</h2>
                            <p className="text-stone-500 text-sm">
                              {speciesEmoji[pet.species]} {pet.breed ?? pet.species}
                              {pet.age_years !== null && ` · ${pet.age_years}g`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-stone-400">{pet.profiles.city}</p>
                          </div>
                        </div>
                        {pet.description && (
                          <p className="text-stone-600 text-sm mt-2 line-clamp-2">{pet.description}</p>
                        )}
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {pet.is_vaccinated && <Badge variant="secondary" className="text-xs">✓ Vakcinisan</Badge>}
                          {pet.available_for_breeding && <Badge className="text-xs">Parenje</Badge>}
                        </div>
                      </div>
                    </div>
                  </TinderCard>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {currentIndex >= 0 && (
        <div className="flex items-center justify-center gap-6 py-4">
          <Button
            variant="outline"
            size="icon"
            className="h-16 w-16 rounded-full border-2 border-red-200 text-red-400 hover:bg-red-50 hover:border-red-400 shadow-md"
            onClick={() => swipe("left")}
            disabled={isLimited}
          >
            <X className="h-7 w-7" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-2 border-blue-200 text-blue-400 hover:bg-blue-50 hover:border-blue-400 shadow"
            onClick={() => swipe("up")}
            disabled={isLimited}
          >
            <Star className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-16 w-16 rounded-full border-2 border-green-200 text-green-400 hover:bg-green-50 hover:border-green-400 shadow-md"
            onClick={() => swipe("right")}
            disabled={isLimited}
          >
            <Heart className="h-7 w-7" fill="currentColor" />
          </Button>
        </div>
      )}

      {/* Match Modal */}
      {matchedPet && (
        <MatchModal
          pet={matchedPet}
          onClose={() => setMatchedPet(null)}
        />
      )}

      {/* Filter Panel */}
      {showFilter && (
        <FilterPanel
          purpose={purpose}
          onPurposeChange={setPurpose}
          onClose={() => setShowFilter(false)}
        />
      )}
    </div>
  )
}
