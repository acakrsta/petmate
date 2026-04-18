import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MapPageClient } from "@/components/map/MapPageClient"

export const metadata = { title: "Parkovi za pse — PetMate" }

export default async function ParksMapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: parks } = await supabase.from("dog_parks").select("*").eq("is_approved", true)
  const { data: reviews } = await supabase.from("reviews").select("*").eq("entity_type", "dog_park")

  return <MapPageClient mode="parks" items={parks ?? []} reviews={reviews ?? []} userId={user.id} />
}
