import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Map, Truck, Star, Plus } from "lucide-react"
import { getInitials, formatRelativeTime } from "@/lib/utils"

export const metadata = { title: "Dashboard — PetMate" }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  type PetRow = { id: string; name: string; breed: string | null; species: string; pet_photos: { url: string; is_primary: boolean }[] }
  type MatchRow = { id: string; user1_id: string; user2_id: string; created_at: string; pet1: { name: string; pet_photos: { url: string; is_primary: boolean }[] } | null; pet2: { name: string; pet_photos: { url: string; is_primary: boolean }[] } | null }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sc = supabase as any
  const [{ data: profile }, { data: petsData }, { data: recentMatchesData }, { data: unreadMessages }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      sc.from("pets").select("*, pet_photos(url, is_primary)").eq("owner_id", user.id).eq("is_active", true),
      sc
        .from("matches")
        .select("*, pet1:pets!matches_pet1_id_fkey(name, pet_photos(url, is_primary)), pet2:pets!matches_pet2_id_fkey(name, pet_photos(url, is_primary))")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("messages")
        .select("id", { count: "exact" })
        .eq("is_read", false)
        .neq("sender_id", user.id),
    ])
  const pets = (petsData ?? []) as PetRow[]
  const recentMatches = (recentMatchesData ?? []) as MatchRow[]

  const unreadCount = unreadMessages?.length ?? 0

  const quickActions = [
    { href: "/discover", label: "Pronađite ljubimce", icon: Heart, color: "bg-pink-50 text-pink-600" },
    { href: "/map/parks", label: "Parkovi i mapa", icon: Map, color: "bg-green-50 text-green-600" },
    { href: "/chat", label: "Razgovori", icon: MessageCircle, color: "bg-blue-50 text-blue-600", badge: unreadCount },
    { href: "/transport", label: "Prevoz ljubimaca", icon: Truck, color: "bg-purple-50 text-purple-600" },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
          Zdravo, {profile?.full_name?.split(" ")[0] ?? "Korisniče"}! 👋
        </h1>
        <p className="text-stone-500 mt-1">
          {profile?.city && `${profile.city} · `}
          {profile?.is_premium ? "✨ Premium nalog" : "Besplatan nalog"}
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300 mb-3">Brze akcije</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.href} href={action.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className={`p-3 rounded-xl ${action.color} relative`}>
                      <Icon className="h-5 w-5" />
                      {action.badge ? (
                        <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-xs">
                          {action.badge}
                        </Badge>
                      ) : null}
                    </div>
                    <span className="text-xs font-medium text-stone-700 dark:text-stone-300 leading-tight">
                      {action.label}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* My Pets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300">Moji ljubimci</h2>
          <Link href="/profile">
            <Button variant="ghost" size="sm">Upravljaj</Button>
          </Link>
        </div>
        {!pets.length ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-3">🐾</div>
              <p className="text-stone-500 mb-4">Još uvek nemate ljubimaca u profilu</p>
              <Link href="/profile">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Dodajte ljubimca
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {pets.map((pet: PetRow) => {
              const primaryPhoto = pet.pet_photos?.find((p) => p.is_primary)?.url
              return (
                <Link key={pet.id} href="/profile">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <div className="aspect-square bg-amber-50 rounded-t-xl overflow-hidden relative">
                      {primaryPhoto ? (
                        <img src={primaryPhoto} alt={pet.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🐾</div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <p className="font-semibold text-sm text-stone-900 dark:text-white">{pet.name}</p>
                      <p className="text-xs text-stone-400">{pet.breed ?? pet.species}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
            <Link href="/profile">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
                <div className="aspect-square flex items-center justify-center rounded-t-xl">
                  <div className="text-center p-4">
                    <Plus className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                    <span className="text-xs text-stone-400">Dodaj ljubimca</span>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        )}
      </div>

      {/* Recent Matches */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-stone-700 dark:text-stone-300">Nedavni matchevi</h2>
          <Link href="/matches">
            <Button variant="ghost" size="sm">Svi matchevi</Button>
          </Link>
        </div>
        {!recentMatches.length ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Star className="h-8 w-8 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500 mb-4">Još uvek nemate matcheva</p>
              <Link href="/discover">
                <Button size="sm">Počnite pretragu</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentMatches.map((match: MatchRow) => {
              const isUser1 = match.user1_id === user.id
              const pet = isUser1 ? match.pet2 : match.pet1
              return (
                <Link key={match.id} href="/matches">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-amber-50 overflow-hidden shrink-0">
                        {pet?.pet_photos?.[0]?.url ? (
                          <img src={pet.pet_photos[0].url} alt={pet.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">🐾</div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-stone-900 dark:text-white">{pet?.name ?? "Ljubimac"}</p>
                        <p className="text-xs text-stone-400">{formatRelativeTime(match.created_at)}</p>
                      </div>
                      <Heart className="ml-auto h-4 w-4 text-pink-400" fill="currentColor" />
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Premium Upgrade Banner */}
      {!profile?.is_premium && (
        <Card className="bg-gradient-to-r from-amber-400 to-orange-500 border-0 text-white">
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-lg">✨ Preuzmite Premium</p>
              <p className="text-amber-50 text-sm mt-0.5">
                Neograničeni swipe-ovi, vidite ko vas je lajkovao, i još mnogo više.
              </p>
            </div>
            <Link href="/settings">
              <Button variant="secondary" className="shrink-0 bg-white text-amber-700 hover:bg-amber-50">
                Saznaj više
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
