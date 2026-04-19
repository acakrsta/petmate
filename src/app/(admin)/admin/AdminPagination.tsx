"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  page: number
  total: number
  pageSize: number
}

export function AdminPagination({ page, total, pageSize }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(total / pageSize)

  if (totalPages <= 1) return null

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  const pages: (number | "...")[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...")
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4">
      <p className="text-xs sm:text-sm text-stone-500 order-2 sm:order-1">
        Str. {page}/{totalPages} · {total.toLocaleString("sr-RS")} ukupno
      </p>
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-1 text-stone-400 text-sm">…</span>
          ) : (
            <Button
              key={p}
              size="sm"
              variant={p === page ? "default" : "outline"}
              onClick={() => goTo(p as number)}
              className={cn("h-8 w-8 p-0 text-xs", p === page && "pointer-events-none")}
            >
              {p}
            </Button>
          )
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
