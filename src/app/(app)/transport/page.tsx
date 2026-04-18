import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, MapPin, Calendar, Users } from "lucide-react"
import { formatDate } from "@/lib/utils"

export const metadata = { title: "Prevoz ljubimaca — PetMate" }

export default async function TransportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  type TransportRow = {
    id: string; driver_id: string; from_city: string; to_city: string
    departure_date: string; departure_time: string | null; available_spots: number
    price_per_pet: number | null; description: string | null; status: string
    profiles: { full_name: string | null; avatar_url: string | null; city: string | null } | null
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: transportsData } = await (supabase as any)
    .from("transports")
    .select("*, profiles!transports_driver_id_fkey(full_name, avatar_url, city)")
    .eq("status", "active")
    .gte("departure_date", new Date().toISOString().split("T")[0])
    .order("departure_date", { ascending: true })
  const transports = (transportsData ?? []) as TransportRow[]

  const { data: myBookings } = await supabase
    .from("transport_bookings")
    .select("transport_id")
    .eq("passenger_id", user.id)

  const myBookingIds = new Set((myBookings ?? []).map((b) => b.transport_id))

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Prevoz ljubimaca</h1>
          <p className="text-stone-500 text-sm mt-0.5">Organizujte prevoz ili pronađite slobodna mesta</p>
        </div>
        <Link href="/transport/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Objavi prevoz
          </Button>
        </Link>
      </div>

      {!transports.length ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🚗</div>
          <h3 className="text-xl font-semibold text-stone-700 mb-2">Nema dostupnih prevoza</h3>
          <p className="text-stone-500 mb-6">Budite prvi koji objavljuje prevoz!</p>
          <Link href="/transport/new">
            <Button>Objavi prevoz</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {transports.map((transport: TransportRow) => {
            const driver = transport.profiles
            const isMyTransport = transport.driver_id === user.id
            const isBooked = myBookingIds.has(transport.id)

            return (
              <Card key={transport.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-lg text-stone-900 dark:text-white">
                          {transport.from_city}
                        </span>
                        <span className="text-stone-400">→</span>
                        <span className="font-bold text-lg text-stone-900 dark:text-white">
                          {transport.to_city}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-stone-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(transport.departure_date)}
                          {transport.departure_time && ` u ${transport.departure_time.slice(0, 5)}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {transport.available_spots} slobodnih mesta
                        </span>
                      </div>

                      {transport.description && (
                        <p className="text-stone-600 dark:text-stone-400 text-sm mt-2">{transport.description}</p>
                      )}

                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs text-stone-400">Vozač: {driver?.full_name ?? "Korisnik"}</span>
                        {transport.price_per_pet && (
                          <Badge variant="secondary" className="text-xs">
                            {transport.price_per_pet} RSD/ljubimac
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      {isMyTransport ? (
                        <Badge variant="outline">Moj oglas</Badge>
                      ) : isBooked ? (
                        <Badge variant="secondary">Rezervisano</Badge>
                      ) : (
                        <Link href={`/chat`}>
                          <Button size="sm">Kontaktiraj</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
