import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"

async function isAdmin() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin-session")
  if (!adminSession) return false
  const admin = await prisma.adminUser.findUnique({ where: { id: adminSession.value } })
  return !!admin
}

function emailTemplate(content: string): string {
  return `
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
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">RealCore Mitarbeiter-Shop</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              ${content}
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
</html>`
}

const templates: Record<string, { subject: string; html: string }> = {
  "order-status": {
    subject: '📦 Bestellung: Status geändert auf "Versendet"',
    html: emailTemplate(`
      <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 20px;">Hallo Max,</h2>
      <p style="margin: 0 0 24px 0; color: #3f3f46; font-size: 16px; line-height: 1.6;">
        Der Status deiner Bestellung hat sich geändert.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <tr>
          <td>
            <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Bestellnummer</p>
            <p style="margin: 0 0 16px 0; color: #18181b; font-size: 14px; font-family: monospace;">RC-2025-00123</p>
            <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Neuer Status</p>
            <span style="display: inline-block; background-color: #8b5cf6; color: #ffffff; padding: 6px 12px; border-radius: 16px; font-size: 14px; font-weight: 500;">Versendet</span>
          </td>
        </tr>
      </table>
      <p style="margin: 0; color: #71717a; font-size: 14px;">
        <strong>Vorheriger Status:</strong> In Bearbeitung
      </p>
    `),
  },
  "review-request": {
    subject: "⭐ Wie gefallen dir deine Artikel?",
    html: emailTemplate(`
      <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 20px;">Hallo Max,</h2>
      <p style="margin: 0 0 24px 0; color: #3f3f46; font-size: 16px; line-height: 1.6;">
        deine Bestellung wurde erfolgreich zugestellt. Wir freuen uns, wenn du deine bestellten Artikel im Shop bewertest.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <tr>
          <td>
            <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Bestellnummer</p>
            <p style="margin: 0; color: #18181b; font-size: 14px; font-family: monospace;">RC-2025-00123</p>
          </td>
        </tr>
      </table>
      <p style="margin: 0 0 12px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Bestellte Artikel</p>
      <ul style="margin: 0 0 24px 18px; padding: 0; color: #18181b; font-size: 14px; line-height: 1.8;">
        <li>RealCore Hoodie Classic</li>
        <li>RealCore Polo Premium</li>
      </ul>
      <div style="margin-bottom: 24px;">
        <a href="#" style="display: inline-block; background-color: #166534; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-weight: 600;">Jetzt bewerten</a>
      </div>
      <p style="margin: 0 0 24px 0; color: #71717a; font-size: 14px;">
        Dein Feedback hilft anderen Kolleginnen und Kollegen bei der Auswahl.
      </p>
      <p style="margin: 0; color: #71717a; font-size: 14px;">
        Viele Grüße<br/>
        Dein RealCore Mitarbeiter-Shop Team
      </p>
    `),
  },
  "new-order-admin": {
    subject: "🛒 Neue Bestellung von Max Mustermann",
    html: emailTemplate(`
      <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 20px;">Neue Bestellung eingegangen</h2>
      <p style="margin: 0 0 24px 0; color: #3f3f46; font-size: 16px; line-height: 1.6;">
        Eine neue Bestellung wurde im Mitarbeiter-Shop aufgegeben.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <tr>
          <td>
            <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Bestellnummer</p>
            <p style="margin: 0 0 16px 0; color: #18181b; font-size: 14px; font-family: monospace;">RC-2025-00123</p>
            <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Besteller</p>
            <p style="margin: 0 0 16px 0; color: #18181b; font-size: 14px;">Max Mustermann</p>
            <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">E-Mail</p>
            <p style="margin: 0 0 16px 0; color: #18181b; font-size: 14px;">max@realcore.de</p>
            <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Firmenbereich</p>
            <p style="margin: 0; color: #18181b; font-size: 14px;">IT</p>
          </td>
        </tr>
      </table>
      <h3 style="margin: 0 0 12px 0; color: #18181b; font-size: 16px;">Bestellte Artikel (2)</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
        <tr style="background-color: #e4e4e7;">
          <th style="padding: 8px; text-align: left; font-size: 12px;">Artikel</th>
          <th style="padding: 8px; text-align: right; font-size: 12px;">Größe</th>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e4e4e7;">RealCore Hoodie Classic</td>
          <td style="padding: 8px; border-bottom: 1px solid #e4e4e7; text-align: right;">L</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e4e4e7;">RealCore Polo Premium</td>
          <td style="padding: 8px; border-bottom: 1px solid #e4e4e7; text-align: right;">M</td>
        </tr>
      </table>
    `),
  },
}

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const templateId = searchParams.get("template")

  if (templateId && templates[templateId]) {
    return NextResponse.json(templates[templateId])
  }

  return NextResponse.json(
    Object.entries(templates).map(([id, t]) => ({ id, subject: t.subject }))
  )
}
