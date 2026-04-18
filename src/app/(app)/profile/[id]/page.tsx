import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { ProfilePage } from "@/components/pets/PetProfilePage"

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: profile }, { data: pets }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase.from("pets").select("*, pet_photos(*)").eq("owner_id", id).eq("is_active", true),
  ])

  if (!profile) notFound()

  return <ProfilePage profile={profile} pets={pets ?? []} isOwner={user.id === id} />
}
