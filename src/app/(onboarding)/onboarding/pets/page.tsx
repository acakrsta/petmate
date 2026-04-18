import { PetStep } from "@/components/onboarding/PetStep"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const metadata = { title: "Dodajte ljubimca — PetMate" }

export default async function OnboardingPetsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return <PetStep userId={user.id} />
}
