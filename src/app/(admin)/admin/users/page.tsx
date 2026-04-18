import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials, formatDate } from "@/lib/utils"
import { AdminUserActions } from "./AdminUserActions"

export const metadata = { title: "Korisnici — Admin" }

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

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: usersData } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)
  const users = (usersData ?? []) as UserRow[]

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-white mb-6">
        Korisnici ({users?.length ?? 0})
      </h1>
      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar>
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
                <p className="text-xs text-stone-400">{user.city} · Registrovan: {formatDate(user.created_at)}</p>
              </div>
              <AdminUserActions userId={user.id} isPremium={user.is_premium} isAdmin={user.is_admin} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
