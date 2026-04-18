import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MapPageClient } from "@/components/map/MapPageClient"

export const metadata = { title: "Pet shopovi — PetMate" }

export default async function ShopsMapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: shops } = await supabase.from("pet_shops").select("*").eq("is_approved", true)
  const { data: reviews } = await supabase.from("reviews").select("*").eq("entity_type", "pet_shop")

  return <MapPageClient mode="shops" items={shops ?? []} reviews={reviews ?? []} userId={user.id} />
}
