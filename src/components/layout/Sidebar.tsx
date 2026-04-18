"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Heart, MessageCircle, Map, Truck, User, Settings, LogOut, Star,
} from "lucide-react"
import { cn, getInitials } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Profile } from "@/types/database"
import { useUnreadCount } from "@/hooks/useRealtime"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/discover", label: "Otkrijte", icon: Heart },
  { href: "/matches", label: "Matchevi", icon: Star },
  { href: "/chat", label: "Čet", icon: MessageCircle },
  { href: "/map/parks", label: "Mapa", icon: Map },
  { href: "/transport", label: "Prevoz", icon: Truck },
]

interface Props {
  profile: Profile | null
}

export function Sidebar({ profile }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const unreadCount = useUnreadCount(profile?.id ?? null)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-stone-200 dark:bg-stone-900 dark:border-stone-800">
      <div className="p-6 border-b border-stone-100 dark:border-stone-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="text-xl font-bold text-stone-900 dark:text-white">PetMate</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          const isChatItem = item.href === "/chat"
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-50"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isChatItem && unreadCount > 0 && (
                <Badge className="h-5 min-w-[20px] px-1 text-xs">{unreadCount}</Badge>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-stone-100 dark:border-stone-800 space-y-1">
        {profile?.is_admin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800"
          >
            <Settings className="h-5 w-5" />
            Admin panel
          </Link>
        )}
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800"
        >
          <User className="h-5 w-5" />
          Moj profil
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-red-50 hover:text-red-600 dark:text-stone-400 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-5 w-5" />
          Odjava
        </button>
      </div>

      {profile && (
        <div className="p-4 border-t border-stone-100 dark:border-stone-800">
          <Link href="/profile" className="flex items-center gap-3 group">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile.avatar_url ?? ""} alt={profile.full_name ?? ""} />
              <AvatarFallback>{getInitials(profile.full_name ?? profile.email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-stone-900 dark:text-white truncate">
                {profile.full_name ?? "Korisnik"}
              </p>
              <p className="text-xs text-stone-400 truncate">
                {profile.is_premium ? "✨ Premium" : profile.city ?? ""}
              </p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  )
}
