"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Flag, Building, BarChart2, ChevronLeft, Heart, Truck, Menu, X } from "lucide-react"
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

function NavContent({ pathname, pendingReports, onClose }: { pathname: string; pendingReports: number; onClose?: () => void }) {
  return (
    <>
      <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">PM</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900 dark:text-white">PetMate</p>
            <p className="text-xs text-stone-400">Admin panel</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800">
            <X className="h-5 w-5" />
          </button>
        )}
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
              onClick={onClose}
              className={cn(
                "flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-medium"
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200"
              )}
            >
              <span className="flex items-center gap-2.5">
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
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Nazad na app
        </Link>
      </div>
    </>
  )
}

export function AdminSidebar({ pendingReports }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // close on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // lock body scroll when open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-amber-500 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">PM</span>
          </div>
          <span className="font-semibold text-stone-900 dark:text-white text-sm">Admin panel</span>
        </div>
        {pendingReports > 0 && (
          <span className="ml-auto text-xs font-semibold bg-red-500 text-white rounded-full px-2 py-0.5">
            {pendingReports} prijava
          </span>
        )}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white dark:bg-stone-900 flex flex-col h-full shadow-2xl">
            <NavContent
              pathname={pathname}
              pendingReports={pendingReports}
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex-col sticky top-0 h-screen">
        <NavContent pathname={pathname} pendingReports={pendingReports} />
      </aside>
    </>
  )
}
