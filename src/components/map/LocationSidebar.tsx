"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Star, MapPin, Phone, Clock, Globe, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Review } from "@/types/database"

interface MapItem {
  id: string
  name: string
  address: string
  city: string
  lat: number
  lng: number
  is_fenced?: boolean
  has_water_fountain?: boolean
  opening_hours?: string | null
  phone?: string | null
  website?: string | null
  specializations?: string[] | null
  product_types?: string[] | null
  description?: string | null
}

interface Props {
  item: MapItem
  mode: "parks" | "vets" | "shops"
  reviews: Review[]
  avgRating: number
  userId: string
  onClose: () => void
}

export function LocationSidebar({ item, mode, reviews, avgRating, userId, onClose }: Props) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [localReviews, setLocalReviews] = useState(reviews)

  const entityType = mode === "parks" ? "dog_park" : mode === "vets" ? "veterinarian" : "pet_shop"

  async function handleReview(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) return
    setSubmitting(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("reviews")
      .upsert({
        reviewer_id: userId,
        entity_type: entityType,
        entity_id: item.id,
        rating,
        comment: comment || null,
      })
      .select()
      .single()
    if (data) {
      setLocalReviews((prev) => {
        const existing = prev.findIndex((r) => r.reviewer_id === userId)
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = data
          return updated
        }
        return [...prev, data]
      })
      setComment("")
    }
    setSubmitting(false)
  }

  const localAvg = localReviews.length
    ? localReviews.reduce((sum, r) => sum + r.rating, 0) / localReviews.length
    : 0

  return (
    <div className="w-80 border-l border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-y-auto flex flex-col">
      <div className="sticky top-0 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 p-4 flex items-start justify-between gap-2 z-10">
        <div>
          <h3 className="font-bold text-stone-900 dark:text-white">{item.name}</h3>
          <div className="flex items-center gap-1 text-stone-500 text-xs mt-0.5">
            <MapPin className="h-3 w-3" />
            {item.address}
          </div>
        </div>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-600 shrink-0 mt-0.5">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`h-4 w-4 ${s <= localAvg ? "text-amber-400 fill-amber-400" : "text-stone-200"}`} />
            ))}
          </div>
          <span className="text-sm text-stone-500">
            {localAvg.toFixed(1)} ({localReviews.length} {localReviews.length === 1 ? "ocena" : "ocena"})
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2">
          {mode === "parks" && (
            <div className="flex gap-2 flex-wrap">
              {item.is_fenced && <Badge variant="secondary"><Check className="h-3 w-3 mr-1" />Ograđen</Badge>}
              {item.has_water_fountain && <Badge variant="secondary"><Check className="h-3 w-3 mr-1" />Fontana</Badge>}
            </div>
          )}
          {item.phone && (
            <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
              <Phone className="h-4 w-4 text-stone-400" />
              <a href={`tel:${item.phone}`} className="hover:text-amber-600">{item.phone}</a>
            </div>
          )}
          {item.opening_hours && (
            <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
              <Clock className="h-4 w-4 text-stone-400" />
              {item.opening_hours}
            </div>
          )}
          {item.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-stone-400" />
              <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline truncate">
                {item.website}
              </a>
            </div>
          )}
          {item.specializations?.length && (
            <div className="flex gap-1 flex-wrap">
              {item.specializations.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
            </div>
          )}
          {item.product_types?.length && (
            <div className="flex gap-1 flex-wrap">
              {item.product_types.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
            </div>
          )}
          {item.description && <p className="text-sm text-stone-600 dark:text-stone-400">{item.description}</p>}
        </div>

        <Separator />

        {/* Navigate button */}
        <a
          href={`https://www.openstreetmap.org/directions?from=&to=${item.lat}%2C${item.lng}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" className="w-full">
            <MapPin className="h-4 w-4 mr-2" />
            Navigiraj
          </Button>
        </a>

        <Separator />

        {/* Reviews */}
        <div>
          <h4 className="font-semibold text-sm text-stone-700 dark:text-stone-300 mb-3">Recenzije</h4>

          {/* Add review */}
          <form onSubmit={handleReview} className="mb-4 space-y-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => setRating(s)}>
                  <Star className={`h-6 w-6 transition-colors ${s <= rating ? "text-amber-400 fill-amber-400" : "text-stone-300 hover:text-amber-300"}`} />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Napišite recenziju..."
              rows={2}
              className="w-full border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-stone-800"
            />
            <Button type="submit" size="sm" className="w-full" disabled={!rating || submitting}>
              {submitting ? "Slanje..." : "Dodaj recenziju"}
            </Button>
          </form>

          <div className="space-y-3">
            {localReviews.map((review) => (
              <div key={review.id} className="text-sm">
                <div className="flex items-center gap-1 mb-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-3 w-3 ${s <= review.rating ? "text-amber-400 fill-amber-400" : "text-stone-200"}`} />
                  ))}
                </div>
                {review.comment && <p className="text-stone-600 dark:text-stone-400">{review.comment}</p>}
              </div>
            ))}
            {!localReviews.length && <p className="text-stone-400 text-sm">Nema recenzija. Budite prvi!</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
