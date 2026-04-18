import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfilePage } from "@/components/pets/PetProfilePage"

export const metadata = { title: "Moj profil — PetMate" }

export default async function MyProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: profile }, { data: pets }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("pets").select("*, pet_photos(*)").eq("owner_id", user.id).order("created_at"),
  ])

  return <ProfilePage profile={profile} pets={pets ?? []} isOwner />
}
