import { ProfileStep } from "@/components/onboarding/ProfileStep"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const metadata = { title: "Podešavanje profila — PetMate" }

export default async function OnboardingProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return <ProfileStep profile={profile} />
}
