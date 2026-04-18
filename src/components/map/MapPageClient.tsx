"use client"
import dynamic from "next/dynamic"
import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddLocationModal } from "./AddLocationModal"
import { LocationSidebar } from "./LocationSidebar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Review } from "@/types/database"

const MapContainer = dynamic(() => import("./MapContainer"), { ssr: false })

type Mode = "parks" | "vets" | "shops"

interface MapItem {
  id: string
  name: string
  address: string
  city: string
  lat: number
  lng: number
  [key: string]: unknown
}

interface Props {
  mode: Mode
  items: MapItem[]
  reviews: Review[]
  userId: string
}

const modeLabels: Record<Mode, string> = {
  parks: "Parkovi za pse",
  vets: "Veterinari",
  shops: "Pet shopovi",
}

const modePaths: Record<Mode, string> = {
  parks: "/map/parks",
  vets: "/map/vets",
  shops: "/map/shops",
}

export function MapPageClient({ mode, items, reviews, userId }: Props) {
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const itemReviews = selectedItem
    ? reviews.filter((r) => r.entity_id === selectedItem.id)
    : []

  const avgRating = itemReviews.length
    ? itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length
    : 0

  return (
    <div className="flex flex-col h-screen">
      {/* Tab navigation */}
      <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between gap-4">
        <Tabs defaultValue={mode}>
          <TabsList>
            <TabsTrigger value="parks" asChild><Link href="/map/parks">Parkovi</Link></TabsTrigger>
            <TabsTrigger value="vets" asChild><Link href="/map/vets">Veterinari</Link></TabsTrigger>
            <TabsTrigger value="shops" asChild><Link href="/map/shops">Pet shopovi</Link></TabsTrigger>
          </TabsList>
        </Tabs>
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Dodaj
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1">
          <MapContainer
            items={items}
            mode={mode}
            selectedId={selectedItem?.id ?? null}
            onSelect={(item) => setSelectedItem(item)}
          />
        </div>

        {/* Sidebar */}
        {selectedItem && (
          <LocationSidebar
            item={selectedItem}
            mode={mode}
            reviews={itemReviews}
            avgRating={avgRating}
            userId={userId}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </div>

      {showAddModal && (
        <AddLocationModal
          mode={mode}
          userId={userId}
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            setShowAddModal(false)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
