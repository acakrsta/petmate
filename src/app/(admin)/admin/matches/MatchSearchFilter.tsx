"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

export function MatchSearchFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.get("search") ?? ""

  function updateSearch(val: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (val) params.set("search", val)
    else params.delete("search")
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="relative max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
      <Input
        placeholder="Pretraži po korisniku ili ljubimcu..."
        defaultValue={search}
        onChange={(e) => {
          const val = e.target.value
          clearTimeout((window as unknown as Record<string, ReturnType<typeof setTimeout>>).__searchTimeout)
          ;(window as unknown as Record<string, ReturnType<typeof setTimeout>>).__searchTimeout = setTimeout(() => {
            updateSearch(val)
          }, 400)
        }}
        className="pl-9 h-9"
      />
      {search && (
        <button
          onClick={() => updateSearch("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
