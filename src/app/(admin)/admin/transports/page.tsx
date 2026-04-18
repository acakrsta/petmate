import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials, formatDate } from "@/lib/utils"
import { AdminPagination } from "../AdminPagination"
import { TransportStatusFilter } from "./TransportStatusFilter"
import { Truck, MapPin, Calendar, Users } from "lucide-react"
import { Suspense } from "react"

export const metadata = { title: "Prevozi — Admin" }

const PAGE_SIZE = 20

type TransportRow = {
  id: string
  from_city: string
  to_city: string
  departure_date: string
  departure_time: string | null
  available_spots: number
  price_per_pet: number | null
  status: "active" | "full" | "completed" | "cancelled"
  created_at: string
  driver: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null
  booking_count: number
}

const statusColor: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default",
  full: "secondary",
  completed: "outline",
  cancelled: "destructive",
}

const statusLabel: Record<string, string> = {
  active: "Aktivan",
  full: "Popunjen",
  completed: "Završen",
  cancelled: "Otkazan",
}

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function AdminTransportsPage({ searchParams }: PageProps) {
  const { status, page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? "1", 10))
  const supabase = await createClient()

  const { count: totalCount } = await supabase
    .from("transports")
    .select("*", { count: "exact", head: true })

  const [statusCountsRes, bookingsRes, transportsRes] = await Promise.all([
    supabase.from("transports").select("status"),
    supabase.from("transport_bookings").select("transport_id, status").neq("status", "cancelled"),
    (() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q = (supabase.from("transports") as any)
        .select(`
          id, from_city, to_city, departure_date, departure_time,
          available_spots, price_per_pet, status, created_at,
          driver:profiles!transports_driver_id_fkey(id, full_name, email, avatar_url)
        `, { count: "exact" })
        .order("created_at", { ascending: false })
      if (status && status !== "all") q = q.eq("status", status)
      const from = (page - 1) * PAGE_SIZE
      return q.range(from, from + PAGE_SIZE - 1)
    })(),
  ])

  const allStatuses = (statusCountsRes.data ?? []) as { status: string }[]
  const statusCounts = {
    all: allStatuses.length,
    active: allStatuses.filter((s) => s.status === "active").length,
    full: allStatuses.filter((s) => s.status === "full").length,
    completed: allStatuses.filter((s) => s.status === "completed").length,
    cancelled: allStatuses.filter((s) => s.status === "cancelled").length,
  }

  const bookings = (bookingsRes.data ?? []) as { transport_id: string }[]
  const rawTransports = (transportsRes.data ?? []) as Omit<TransportRow, "booking_count">[]
  const total = transportsRes.count ?? 0

  const transports: TransportRow[] = rawTransports.map((t) => ({
    ...t,
    booking_count: bookings.filter((b) => b.transport_id === t.id).length,
  }))

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Prevozi</h1>
        <p className="text-sm text-stone-500 mt-1">{(totalCount ?? 0).toLocaleString("sr-RS")} ukupno</p>
      </div>

      <Suspense>
        <TransportStatusFilter current={status ?? "all"} counts={statusCounts} />
      </Suspense>

      {!transports.length ? (
        <div className="text-center py-16 text-stone-400">
          <Truck className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Nema prevoza za izabrani filter</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transports.map((t) => (
            <Card key={t.id} className="border-stone-200 dark:border-stone-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-stone-900 dark:text-white font-semibold">
                        <MapPin className="h-4 w-4 text-stone-400 shrink-0" />
                        <span>{t.from_city}</span>
                        <span className="text-stone-400 font-normal">→</span>
                        <span>{t.to_city}</span>
                      </div>
                      <Badge variant={statusColor[t.status]}>{statusLabel[t.status]}</Badge>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap text-sm text-stone-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {t.departure_date}{t.departure_time ? ` u ${t.departure_time.slice(0, 5)}` : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {t.booking_count}/{t.available_spots} mesta
                      </span>
                      {t.price_per_pet != null && (
                        <span className="font-medium text-stone-700 dark:text-stone-300">
                          {t.price_per_pet.toLocaleString("sr-RS")} RSD/ljubimcu
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={t.driver?.avatar_url ?? ""} />
                        <AvatarFallback className="text-xs">
                          {getInitials(t.driver?.full_name ?? t.driver?.email ?? "?")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-stone-500">
                        {t.driver?.full_name ?? t.driver?.email ?? "N/A"}
                      </span>
                      <span className="text-xs text-stone-400">· {formatDate(t.created_at)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Suspense>
        <AdminPagination page={page} total={total} pageSize={PAGE_SIZE} />
      </Suspense>
    </div>
  )
}
