import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "./AdminSidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profileData } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
  const profile = profileData as { is_admin: boolean } | null
  if (!profile?.is_admin) redirect("/dashboard")

  const { count: pendingReports } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-stone-950">
      <AdminSidebar pendingReports={pendingReports ?? 0} />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}
