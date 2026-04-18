import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, Flag, Building, BarChart2, ChevronLeft } from "lucide-react"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profileData } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
  const profile = profileData as { is_admin: boolean } | null
  if (!profile?.is_admin) redirect("/dashboard")

  const navItems = [
    { href: "/admin", label: "Pregled", icon: BarChart2 },
    { href: "/admin/users", label: "Korisnici", icon: Users },
    { href: "/admin/reports", label: "Prijave", icon: Flag },
    { href: "/admin/businesses", label: "Biznisi", icon: Building },
  ]

  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-stone-950">
      <aside className="w-56 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 p-4 space-y-1">
        <Link href="/dashboard" className="flex items-center gap-2 text-stone-500 hover:text-amber-600 text-sm mb-4">
          <ChevronLeft className="h-4 w-4" />
          Nazad
        </Link>
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide px-2 mb-2">Admin</p>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
