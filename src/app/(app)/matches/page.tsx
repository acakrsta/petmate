import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Heart } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

export const metadata = { title: "Matchevi — PetMate" }

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  type MatchRow = {
    id: string; user1_id: string; user2_id: string; created_at: string
    pet1: { id: string; name: string; breed: string | null; species: string; pet_photos: { url: string; is_primary: boolean }[] } | null
    pet2: { id: string; name: string; breed: string | null; species: string; pet_photos: { url: string; is_primary: boolean }[] } | null
    profile1: { id: string; full_name: string | null; avatar_url: string | null; city: string | null } | null
    profile2: { id: string; full_name: string | null; avatar_url: string | null; city: string | null } | null
    conversations: { id: string }[] | null
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: matchesData } = await (supabase as any)
    .from("matches")
    .select(`
      *,
      pet1:pets!matches_pet1_id_fkey(id, name, breed, species, pet_photos(*)),
      pet2:pets!matches_pet2_id_fkey(id, name, breed, species, pet_photos(*)),
      profile1:profiles!matches_user1_id_fkey(id, full_name, avatar_url, city),
      profile2:profiles!matches_user2_id_fkey(id, full_name, avatar_url, city),
      conversations(id)
    `)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
  const matches = (matchesData ?? []) as MatchRow[]

  const speciesEmoji: Record<string, string> = {
    dog: "🐕", cat: "🐈", rabbit: "🐇", bird: "🐦", hamster: "🐹", other: "🐾",
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-white mb-6">
        Moji matchevi ({matches?.length ?? 0})
      </h1>

      {!matches.length ? (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 text-stone-200 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-stone-700 mb-2">Nema matcheva</h3>
          <p className="text-stone-500 mb-6">Kada se dve strane međusobno svide, ovde će se pojaviti match.</p>
          <Link href="/discover">
            <Button>Pronađite ljubimce</Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {matches.map((match: MatchRow) => {
            const isUser1 = match.user1_id === user.id
            const otherPet = isUser1 ? match.pet2 : match.pet1
            const otherProfile = isUser1 ? match.profile2 : match.profile1
            const myPet = isUser1 ? match.pet1 : match.pet2
            const convId = (match.conversations as { id: string }[])?.[0]?.id

            const pet = otherPet as { id: string; name: string; breed: string | null; species: string; pet_photos: { url: string; is_primary: boolean }[] } | null
            const profile = otherProfile as { id: string; full_name: string | null; city: string | null } | null
            const photo = pet?.pet_photos?.find((p) => p.is_primary)?.url ?? pet?.pet_photos?.[0]?.url

            return (
              <Card key={match.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gradient-to-br from-amber-50 to-orange-50 relative">
                  {photo ? (
                    <img src={photo} alt={pet?.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      {speciesEmoji[pet?.species ?? "other"] ?? "🐾"}
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-pink-500 rounded-full p-1.5">
                    <Heart className="h-3 w-3 text-white fill-white" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-stone-900 dark:text-white">{pet?.name}</h3>
                  <p className="text-stone-500 text-sm">{pet?.breed ?? pet?.species}</p>
                  <p className="text-stone-400 text-xs mt-0.5">
                    Vlasnik: {profile?.full_name ?? "Korisnik"}
                    {profile?.city && ` · ${profile.city}`}
                  </p>
                  <p className="text-stone-300 text-xs mt-1">{formatRelativeTime(match.created_at)}</p>

                  {convId ? (
                    <Link href={`/chat/${convId}`} className="block mt-3">
                      <Button size="sm" className="w-full">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Pošalji poruku
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/chat" className="block mt-3">
                      <Button size="sm" variant="outline" className="w-full">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Čet
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
