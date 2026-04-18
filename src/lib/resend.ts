import { Resend } from "resend"

const FROM = process.env.RESEND_FROM_EMAIL || "PetMate <noreply@petmate.rs>"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendWelcomeEmail(email: string, name: string) {
  const resend = getResend()
  if (!resend) return
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Dobrodošli na PetMate! 🐾",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#f59e0b">Dobrodošli na PetMate, ${name}! 🐾</h1>
        <p>Srećni smo što ste deo naše zajednice ljubitelja kućnih ljubimaca.</p>
        <p>Počnite tako što ćete dodati svog ljubimca i pronaći prijatelje u blizini.</p>
        <a href="${APP_URL}/dashboard" style="background:#f59e0b;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
          Idite na aplikaciju
        </a>
      </div>
    `,
  })
}

export async function sendMatchEmail(
  email: string,
  name: string,
  matchedPetName: string,
  matchedOwnerName: string
) {
  const resend = getResend()
  if (!resend) return
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `Novi match! ${matchedPetName} želi da se upozna sa vašim ljubimcem 🎉`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#f59e0b">Novi match, ${name}! 🎉</h1>
        <p><strong>${matchedPetName}</strong> (vlasnik: ${matchedOwnerName}) želi da se upozna sa vašim ljubimcem!</p>
        <a href="${APP_URL}/matches" style="background:#f59e0b;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
          Pogledajte match
        </a>
      </div>
    `,
  })
}

export async function sendMessageNotificationEmail(
  email: string,
  name: string,
  senderName: string,
  conversationId: string
) {
  const resend = getResend()
  if (!resend) return
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `Nova poruka od ${senderName} 💬`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#f59e0b">Nova poruka, ${name}!</h1>
        <p><strong>${senderName}</strong> vam je poslao/la poruku na PetMate.</p>
        <a href="${APP_URL}/chat/${conversationId}" style="background:#f59e0b;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
          Odgovorite
        </a>
      </div>
    `,
  })
}
