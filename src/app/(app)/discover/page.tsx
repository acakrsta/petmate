import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SwipeContainer } from "@/components/discover/SwipeContainer"

export const metadata = { title: "Otkrijte — PetMate" }

export default async function DiscoverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get already swiped pets to exclude them
  const { data: swiped } = await supabase
    .from("swipes")
    .select("swiped_pet_id")
    .eq("swiper_id", user.id)

  const swipedIds = (swiped ?? []).map((s) => s.swiped_pet_id)

  // Get my pets to exclude them from discover
  const { data: myPets } = await supabase.from("pets").select("id").eq("owner_id", user.id)
  const myPetIds = (myPets ?? []).map((p) => p.id)

  const excludeIds = [...swipedIds, ...myPetIds]

  // Build query
  let query = supabase
    .from("pets")
    .select("*, pet_photos(*), profiles!pets_owner_id_fkey(*)")
    .eq("is_active", true)
    .limit(50)

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`)
  }

  const { data: pets } = await query

  return (
    <SwipeContainer
      pets={pets ?? []}
      currentUserId={user.id}
      profile={profile}
    />
  )
}
