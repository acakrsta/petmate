"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Heart, MessageCircle, Map, Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useUnreadCount } from "@/hooks/useRealtime"

const navItems = [
  { href: "/dashboard", label: "Početna", icon: LayoutDashboard },
  { href: "/discover", label: "Otkrijte", icon: Heart },
  { href: "/chat", label: "Čet", icon: MessageCircle },
  { href: "/map/parks", label: "Mapa", icon: Map },
  { href: "/transport", label: "Prevoz", icon: Truck },
]

interface Props {
  userId: string | null
}

export function MobileNav({ userId }: Props) {
  const pathname = usePathname()
  const unreadCount = useUnreadCount(userId)

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 dark:bg-stone-900 dark:border-stone-800 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          const isChatItem = item.href === "/chat"
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors relative",
                isActive ? "text-amber-600 dark:text-amber-400" : "text-stone-400 dark:text-stone-500"
              )}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
                {isChatItem && unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 min-w-[16px] px-0.5 text-[10px] flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
