"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Flag, Building, BarChart2, ChevronLeft, Heart, Truck } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  pendingReports: number
}

const navItems = [
  { href: "/admin", label: "Pregled", icon: BarChart2, exact: true },
  { href: "/admin/users", label: "Korisnici", icon: Users },
  { href: "/admin/reports", label: "Prijave", icon: Flag },
  { href: "/admin/matches", label: "Mečevi", icon: Heart },
  { href: "/admin/transports", label: "Prevozi", icon: Truck },
  { href: "/admin/businesses", label: "Biznisi", icon: Building },
]

export function AdminSidebar({ pendingReports }: Props) {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col sticky top-0 h-screen">
      <div className="p-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">PM</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900 dark:text-white">PetMate</p>
            <p className="text-xs text-stone-400">Admin panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide px-2 py-2">Navigacija</p>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const showBadge = item.href === "/admin/reports" && pendingReports > 0

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-medium"
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200"
              )}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </span>
              {showBadge && (
                <span className="text-xs font-semibold bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-none">
                  {pendingReports > 99 ? "99+" : pendingReports}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-stone-200 dark:border-stone-800">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Nazad na app
        </Link>
      </div>
    </aside>
  )
}
