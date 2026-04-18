"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐾</div>
          <h1 className="text-3xl font-bold text-stone-900">PetMate</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-3">📧</div>
              <h2 className="text-xl font-semibold mb-2">Email je poslat!</h2>
              <p className="text-stone-500 text-sm mb-6">
                Proverite vaš inbox i kliknite na link za resetovanje lozinke.
              </p>
              <Link href="/login">
                <Button className="w-full">Povratak na prijavu</Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-1">Resetovanje lozinke</h2>
              <p className="text-stone-500 text-sm mb-6">
                Unesite vašu email adresu i poslaćemo vam link za resetovanje.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email adresa</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vas@email.com"
                    required
                    className="mt-1"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Slanje..." : "Pošalji link"}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Link href="/login" className="text-amber-600 text-sm hover:underline">
                  Povratak na prijavu
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
