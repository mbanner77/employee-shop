import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const to = body?.to

    if (!to || typeof to !== "string") {
      return NextResponse.json({ error: "Recipient email is required" }, { status: 400 })
    }

    const settings = await prisma.settings.findUnique({ where: { id: "settings" } })

    if (!settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 })
    }

    await sendEmail({
      to,
      subject: "SMTP Testmail",
      text: "Das ist eine Testmail aus dem RealCore Mitarbeiter-Shop.",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to send test email:", error)
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 })
  }
}
