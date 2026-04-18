import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Ensure profile exists for OAuth users
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, onboarding_completed")
        .eq("id", data.user.id)
        .single()

      if (!profile) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name ?? null,
          avatar_url: data.user.user_metadata?.avatar_url ?? null,
          onboarding_completed: false,
        })
        return NextResponse.redirect(`${origin}/onboarding/profile`)
      }

      if (!profile.onboarding_completed) {
        return NextResponse.redirect(`${origin}/onboarding/profile`)
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
