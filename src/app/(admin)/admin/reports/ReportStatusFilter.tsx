"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Props {
  current: string
  counts: { all: number; pending: number; reviewed: number; resolved: number }
}

const FILTERS = [
  { value: "all", label: "Sve" },
  { value: "pending", label: "Na čekanju" },
  { value: "reviewed", label: "Pregledano" },
  { value: "resolved", label: "Rešeno" },
]

export function ReportStatusFilter({ current, counts }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function setFilter(value: string) {
    if (value === "all") {
      router.push(pathname)
    } else {
      router.push(`${pathname}?status=${value}`)
    }
  }

  return (
    <div className="flex gap-1.5 flex-wrap">
      {FILTERS.map((f) => {
        const count = counts[f.value as keyof typeof counts]
        const isActive = current === f.value || (f.value === "all" && current === "all")
        return (
          <Button
            key={f.value}
            size="sm"
            variant={isActive ? "default" : "outline"}
            onClick={() => setFilter(f.value)}
            className="h-8 text-xs gap-1.5"
          >
            {f.label}
            <span className={cn(
              "text-xs rounded-full px-1.5 py-0 leading-5 font-semibold",
              isActive ? "bg-white/20 text-white" : "bg-stone-100 dark:bg-stone-800 text-stone-500"
            )}>
              {count}
            </span>
          </Button>
        )
      })}
    </div>
  )
}
