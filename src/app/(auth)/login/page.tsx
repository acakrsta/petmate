import { LoginForm } from "@/components/auth/LoginForm"
import Link from "next/link"

export const metadata = { title: "Prijava — PetMate" }

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐾</div>
          <h1 className="text-3xl font-bold text-stone-900">PetMate</h1>
          <p className="text-stone-500 mt-1">Prijavite se na vaš nalog</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <LoginForm />
          <div className="mt-6 text-center text-sm text-stone-500">
            Nemate nalog?{" "}
            <Link href="/register" className="text-amber-600 hover:underline font-medium">
              Registrujte se
            </Link>
          </div>
          <div className="mt-2 text-center text-sm">
            <Link href="/forgot-password" className="text-stone-400 hover:text-amber-600 text-xs">
              Zaboravili ste lozinku?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
