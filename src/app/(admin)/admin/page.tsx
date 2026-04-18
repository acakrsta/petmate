import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Heart, Flag, Truck } from "lucide-react"

export const metadata = { title: "Admin — PetMate" }

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: userCount },
    { count: matchCount },
    { count: reportCount },
    { count: transportCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("*", { count: "exact", head: true }),
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("transports").select("*", { count: "exact", head: true }).eq("status", "active"),
  ])

  const stats = [
    { label: "Ukupno korisnika", value: userCount ?? 0, icon: Users, color: "text-blue-500 bg-blue-50" },
    { label: "Ukupno matcheva", value: matchCount ?? 0, icon: Heart, color: "text-pink-500 bg-pink-50" },
    { label: "Aktivne prijave", value: reportCount ?? 0, icon: Flag, color: "text-red-500 bg-red-50" },
    { label: "Aktivni prevozi", value: transportCount ?? 0, icon: Truck, color: "text-purple-500 bg-purple-50" },
  ]

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-white mb-6">Admin panel</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className={`inline-flex p-2 rounded-lg ${stat.color} mb-3`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold text-stone-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-stone-500 mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
