import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials, formatDate } from "@/lib/utils"
import { AdminUserActions } from "./AdminUserActions"
import { AdminUsersFilter } from "./AdminUsersFilter"
import { AdminPagination } from "../AdminPagination"
import { Users } from "lucide-react"
import { Suspense } from "react"

export const metadata = { title: "Korisnici — Admin" }

const PAGE_SIZE = 20

type UserRow = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  city: string | null
  is_premium: boolean
  is_business: boolean
  is_admin: boolean
  created_at: string
}

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; filter?: string }>
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { page: pageStr, search, filter } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? "1", 10))
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("profiles") as any)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  if (filter === "premium") query = query.eq("is_premium", true)
  else if (filter === "admin") query = query.eq("is_admin", true)
  else if (filter === "business") query = query.eq("is_business", true)
  else if (filter === "regular") query = query.eq("is_premium", false).eq("is_admin", false).eq("is_business", false)

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  const { data: usersData, count } = await query.range(from, to)
  const users = (usersData ?? []) as UserRow[]
  const total = count ?? 0

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Korisnici</h1>
        <p className="text-sm text-stone-500 mt-1">{total.toLocaleString("sr-RS")} ukupno</p>
      </div>

      <Suspense>
        <AdminUsersFilter />
      </Suspense>

      {!users.length ? (
        <div className="text-center py-16 text-stone-400">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Nema korisnika koji odgovaraju pretrazi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <Card key={user.id} className="border-stone-200 dark:border-stone-800">
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="shrink-0">
                  <AvatarImage src={user.avatar_url ?? ""} />
                  <AvatarFallback>{getInitials(user.full_name ?? user.email)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-stone-900 dark:text-white truncate">
                      {user.full_name ?? "N/A"}
                    </p>
                    {user.is_premium && <Badge variant="premium">Premium</Badge>}
                    {user.is_business && <Badge variant="secondary">Biznis</Badge>}
                    {user.is_admin && <Badge>Admin</Badge>}
                  </div>
                  <p className="text-sm text-stone-500 truncate">{user.email}</p>
                  <p className="text-xs text-stone-400">
                    {user.city && `${user.city} · `}Registrovan: {formatDate(user.created_at)}
                  </p>
                </div>
                <AdminUserActions userId={user.id} isPremium={user.is_premium} isAdmin={user.is_admin} />
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
