import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Heart, Flag, Truck, Star, Building2, CalendarCheck } from "lucide-react"
import { AdminGrowthChart } from "./AdminGrowthChart"

export const metadata = { title: "Admin — PetMate" }

function getLast6MonthsLabels() {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    months.push({
      label: d.toLocaleDateString("sr-RS", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
    })
  }
  return months
}

export default async function AdminPage() {
  const supabase = await createClient()

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  sixMonthsAgo.setDate(1)
  const sixMonthsAgoISO = sixMonthsAgo.toISOString()

  const [
    { count: userCount },
    { count: matchCount },
    { count: reportCount },
    { count: transportCount },
    { count: premiumCount },
    { count: bookingCount },
    pendingVetsRes,
    pendingShopsRes,
    recentUsersRes,
    recentMatchesRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("*", { count: "exact", head: true }),
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("transports").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_premium", true),
    supabase.from("transport_bookings").select("*", { count: "exact", head: true }),
    supabase.from("veterinarians").select("id, created_at").eq("is_approved", false),
    supabase.from("pet_shops").select("id, created_at").eq("is_approved", false),
    supabase.from("profiles").select("created_at").gte("created_at", sixMonthsAgoISO),
    supabase.from("matches").select("created_at").gte("created_at", sixMonthsAgoISO),
  ])

  const pendingBusinesses =
    (pendingVetsRes.data?.length ?? 0) + (pendingShopsRes.data?.length ?? 0)

  const monthLabels = getLast6MonthsLabels()

  const usersPerMonth = monthLabels.map(({ label, year, month }) => {
    const count = (recentUsersRes.data ?? []).filter((u) => {
      const d = new Date(u.created_at)
      return d.getFullYear() === year && d.getMonth() + 1 === month
    }).length
    return { label, count }
  })

  const matchesPerMonth = monthLabels.map(({ label, year, month }) => {
    const count = (recentMatchesRes.data ?? []).filter((m) => {
      const d = new Date(m.created_at)
      return d.getFullYear() === year && d.getMonth() + 1 === month
    }).length
    return { label, count }
  })

  const primaryStats = [
    { label: "Ukupno korisnika", value: userCount ?? 0, icon: Users, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40" },
    { label: "Ukupno mečeva", value: matchCount ?? 0, icon: Heart, color: "text-pink-600 bg-pink-50 dark:bg-pink-950/40" },
    { label: "Aktivne prijave", value: reportCount ?? 0, icon: Flag, color: "text-red-600 bg-red-50 dark:bg-red-950/40" },
    { label: "Aktivni prevozi", value: transportCount ?? 0, icon: Truck, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40" },
  ]

  const secondaryStats = [
    { label: "Premium korisnici", value: premiumCount ?? 0, icon: Star, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
    { label: "Biznisi na čekanju", value: pendingBusinesses, icon: Building2, color: "text-orange-600 bg-orange-50 dark:bg-orange-950/40" },
    { label: "Rezervacije prevoza", value: bookingCount ?? 0, icon: CalendarCheck, color: "text-teal-600 bg-teal-50 dark:bg-teal-950/40" },
  ]

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Admin panel</h1>
        <p className="text-sm text-stone-500 mt-1">Pregled platforme u realnom vremenu</p>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Ključne metrike</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {primaryStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="border-stone-200 dark:border-stone-800">
                <CardContent className="p-5">
                  <div className={`inline-flex p-2 rounded-lg ${stat.color} mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold text-stone-900 dark:text-white">{stat.value.toLocaleString("sr-RS")}</p>
                  <p className="text-sm text-stone-500 mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Dodatne metrike</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {secondaryStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="border-stone-200 dark:border-stone-800">
                <CardContent className="p-5">
                  <div className={`inline-flex p-2 rounded-lg ${stat.color} mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold text-stone-900 dark:text-white">{stat.value.toLocaleString("sr-RS")}</p>
                  <p className="text-sm text-stone-500 mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Rast (poslednjih 6 meseci)</h2>
        <AdminGrowthChart usersPerMonth={usersPerMonth} matchesPerMonth={matchesPerMonth} />
      </div>
    </div>
  )
}
