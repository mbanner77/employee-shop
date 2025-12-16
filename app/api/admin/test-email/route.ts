import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { sendEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("admin-session")

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: session.value },
    })

    if (!admin) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "E-Mail-Adresse erforderlich" }, { status: 400 })
    }

    const settings = await prisma.settings.findUnique({ where: { id: "settings" } })
    const shopName = settings?.shopName || "RealCore Mitarbeiter-Shop"

    await sendEmail({
      to: email,
      subject: `🧪 Test-E-Mail von ${shopName}`,
      text: [
        "Dies ist eine Test-E-Mail.",
        "",
        "Wenn du diese E-Mail erhältst, funktioniert die SMTP-Konfiguration korrekt.",
        "",
        `Gesendet von: ${shopName}`,
        `Zeitpunkt: ${new Date().toLocaleString("de-DE")}`,
      ].join("\n"),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="background-color: #166534; padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">${shopName}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 20px;">🧪 Test-E-Mail</h2>
              <p style="margin: 0 0 24px 0; color: #3f3f46; font-size: 16px; line-height: 1.6;">
                Dies ist eine Test-E-Mail. Wenn du diese Nachricht erhältst, funktioniert die SMTP-Konfiguration korrekt!
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #dcfce7; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; color: #166534; font-size: 14px; font-weight: 600;">✓ SMTP-Verbindung erfolgreich</p>
                    <p style="margin: 0; color: #166534; font-size: 14px;">Die E-Mail-Einstellungen sind korrekt konfiguriert.</p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0; color: #71717a; font-size: 14px;">
                Gesendet am: ${new Date().toLocaleString("de-DE")}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; color: #71717a; font-size: 14px;">© 2025 RealCore GmbH</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    })

    return NextResponse.json({ 
      success: true, 
      message: `Test-E-Mail wurde an ${email} gesendet` 
    })
  } catch (error) {
    console.error("Failed to send test email:", error)
    const message = error instanceof Error ? error.message : "Unbekannter Fehler"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
