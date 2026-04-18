"use client"
import { useEffect } from "react"
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import { useGeolocation } from "@/hooks/useGeolocation"
import "leaflet/dist/leaflet.css"

// Fix default marker icons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

const modeIcons: Record<string, string> = {
  parks: "🌳",
  vets: "🏥",
  shops: "🛒",
}

function createCustomIcon(emoji: string, isSelected: boolean) {
  return L.divIcon({
    html: `<div style="font-size:${isSelected ? "32px" : "24px"};filter:${isSelected ? "drop-shadow(0 0 4px rgba(245,158,11,0.8))" : "none"};transition:all 0.2s">${emoji}</div>`,
    className: "leaflet-custom-icon",
    iconSize: [isSelected ? 40 : 32, isSelected ? 40 : 32],
    iconAnchor: [isSelected ? 20 : 16, isSelected ? 40 : 32],
  })
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], map.getZoom())
  }, [lat, lng, map])
  return null
}

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
  items: MapItem[]
  mode: string
  selectedId: string | null
  onSelect: (item: MapItem) => void
}

export default function MapContainer({ items, mode, selectedId, onSelect }: Props) {
  const { coords } = useGeolocation()
  const center: [number, number] = coords ? [coords.lat, coords.lng] : [44.8176, 20.4569]
  const emoji = modeIcons[mode] ?? "📍"

  return (
    <LeafletMap
      center={center}
      zoom={13}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {coords && <RecenterMap lat={coords.lat} lng={coords.lng} />}

      {/* User location */}
      {coords && (
        <Marker
          position={[coords.lat, coords.lng]}
          icon={L.divIcon({
            html: '<div style="width:12px;height:12px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 2px rgba(59,130,246,0.3)"></div>',
            className: "",
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          })}
        >
          <Popup>Vaša lokacija</Popup>
        </Marker>
      )}

      {/* Location markers */}
      {items.map((item) => (
        <Marker
          key={item.id}
          position={[item.lat, item.lng]}
          icon={createCustomIcon(emoji, item.id === selectedId)}
          eventHandlers={{ click: () => onSelect(item) }}
        >
          <Popup>
            <strong>{item.name}</strong>
            <br />
            {item.address}
          </Popup>
        </Marker>
      ))}
    </LeafletMap>
  )
}
