"use client"
import { useState, useEffect } from "react"

interface Coords {
  lat: number
  lng: number
}

export function useGeolocation() {
  const [coords, setCoords] = useState<Coords | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolokacija nije podržana u vašem pretraživaču")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLoading(false)
      },
      () => {
        // Default to Belgrade if geolocation denied
        setCoords({ lat: 44.8176, lng: 20.4569 })
        setLoading(false)
      }
    )
  }, [])

  return { coords, error, loading }
}
