import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TransportForm } from "@/components/transport/TransportForm"

export const metadata = { title: "Objavi prevoz — PetMate" }

export default async function NewTransportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-white mb-6">Objavi prevoz</h1>
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-6">
        <TransportForm userId={user.id} />
      </div>
    </div>
  )
}
