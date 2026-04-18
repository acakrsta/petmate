"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

const FILTERS = [
  { value: "all", label: "Svi" },
  { value: "premium", label: "Premium" },
  { value: "admin", label: "Admin" },
  { value: "business", label: "Biznis" },
  { value: "regular", label: "Regularni" },
]

export function AdminUsersFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const search = searchParams.get("search") ?? ""
  const filter = searchParams.get("filter") ?? "all"

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === "all") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <Input
          placeholder="Pretraži po imenu ili emailu..."
          defaultValue={search}
          onChange={(e) => {
            const val = e.target.value
            clearTimeout((window as unknown as Record<string, ReturnType<typeof setTimeout>>).__searchTimeout)
            ;(window as unknown as Record<string, ReturnType<typeof setTimeout>>).__searchTimeout = setTimeout(() => {
              updateParams({ search: val })
            }, 400)
          }}
          className="pl-9 h-9"
        />
        {search && (
          <button
            onClick={() => updateParams({ search: null })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex gap-1 flex-wrap">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? "default" : "outline"}
            onClick={() => updateParams({ filter: f.value })}
            className="h-9 text-xs"
          >
            {f.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
