import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials, formatDate } from "@/lib/utils"
import { AdminPagination } from "../AdminPagination"
import { Heart, Search } from "lucide-react"
import { Suspense } from "react"
import { MatchSearchFilter } from "./MatchSearchFilter"

export const metadata = { title: "Mečevi — Admin" }

const PAGE_SIZE = 25

type MatchRow = {
  id: string
  created_at: string
  user1: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null
  user2: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null
  pet1: { id: string; name: string; species: string } | null
  pet2: { id: string; name: string; species: string } | null
}

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>
}

export default async function AdminMatchesPage({ searchParams }: PageProps) {
  const { page: pageStr, search } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? "1", 10))
  const supabase = await createClient()

  const { count: totalCount } = await supabase
    .from("matches")
    .select("*", { count: "exact", head: true })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("matches") as any)
    .select(`
      id,
      created_at,
      user1:profiles!matches_user1_id_fkey(id, full_name, email, avatar_url),
      user2:profiles!matches_user2_id_fkey(id, full_name, email, avatar_url),
      pet1:pets!matches_pet1_id_fkey(id, name, species),
      pet2:pets!matches_pet2_id_fkey(id, name, species)
    `, { count: "exact" })
    .order("created_at", { ascending: false })

  const from = (page - 1) * PAGE_SIZE
  const { data, count } = await query.range(from, from + PAGE_SIZE - 1)

  let matches = (data ?? []) as MatchRow[]
  let total = count ?? 0

  if (search) {
    const s = search.toLowerCase()
    matches = matches.filter((m) =>
      m.user1?.full_name?.toLowerCase().includes(s) ||
      m.user1?.email?.toLowerCase().includes(s) ||
      m.user2?.full_name?.toLowerCase().includes(s) ||
      m.user2?.email?.toLowerCase().includes(s) ||
      m.pet1?.name?.toLowerCase().includes(s) ||
      m.pet2?.name?.toLowerCase().includes(s)
    )
    total = matches.length
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Mečevi</h1>
        <p className="text-sm text-stone-500 mt-1">{(totalCount ?? 0).toLocaleString("sr-RS")} ukupno</p>
      </div>

      <Suspense>
        <MatchSearchFilter />
      </Suspense>

      {!matches.length ? (
        <div className="text-center py-16 text-stone-400">
          <Heart className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Nema mečeva koji odgovaraju pretrazi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((match) => (
            <Card key={match.id} className="border-stone-200 dark:border-stone-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={match.user1?.avatar_url ?? ""} />
                        <AvatarFallback className="text-xs">
                          {getInitials(match.user1?.full_name ?? match.user1?.email ?? "?")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-900 dark:text-white truncate">
                          {match.user1?.full_name ?? match.user1?.email ?? "N/A"}
                        </p>
                        <p className="text-xs text-stone-400 truncate">
                          {match.pet1?.name} · {match.pet1?.species}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-0.5 shrink-0">
                      <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
                      <span className="text-xs text-stone-400">{formatDate(match.created_at)}</span>
                    </div>

                    <div className="flex items-center gap-2 justify-end min-w-0">
                      <div className="min-w-0 text-right">
                        <p className="text-sm font-medium text-stone-900 dark:text-white truncate">
                          {match.user2?.full_name ?? match.user2?.email ?? "N/A"}
                        </p>
                        <p className="text-xs text-stone-400 truncate">
                          {match.pet2?.name} · {match.pet2?.species}
                        </p>
                      </div>
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={match.user2?.avatar_url ?? ""} />
                        <AvatarFallback className="text-xs">
                          {getInitials(match.user2?.full_name ?? match.user2?.email ?? "?")}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Suspense>
        <AdminPagination page={page} total={total} pageSize={PAGE_SIZE} />
      </Suspense>
    </div>
  )
}
