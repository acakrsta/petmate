import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MapPageClient } from "@/components/map/MapPageClient"

export const metadata = { title: "Veterinari — PetMate" }

export default async function VetsMapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: vets } = await supabase.from("veterinarians").select("*").eq("is_approved", true)
  const { data: reviews } = await supabase.from("reviews").select("*").eq("entity_type", "veterinarian")

  return <MapPageClient mode="vets" items={vets ?? []} reviews={reviews ?? []} userId={user.id} />
}
