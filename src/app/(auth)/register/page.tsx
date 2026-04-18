import { RegisterForm } from "@/components/auth/RegisterForm"
import Link from "next/link"

export const metadata = { title: "Registracija — PetMate" }

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐾</div>
          <h1 className="text-3xl font-bold text-stone-900">PetMate</h1>
          <p className="text-stone-500 mt-1">Kreirajte novi nalog</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <RegisterForm />
          <div className="mt-6 text-center text-sm text-stone-500">
            Već imate nalog?{" "}
            <Link href="/login" className="text-amber-600 hover:underline font-medium">
              Prijavite se
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
