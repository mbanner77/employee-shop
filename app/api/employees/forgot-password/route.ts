import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendEmail } from "@/lib/email"
import crypto from "crypto"

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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "E-Mail erforderlich" }, { status: 400 })
    }

    const employee = await prisma.employee.findUnique({ where: { email } })
    
    // Always return success to prevent email enumeration
    if (!employee) {
      return NextResponse.json({ 
        success: true, 
        message: "Falls ein Konto mit dieser E-Mail existiert, wurde eine E-Mail zum Zurücksetzen des Passworts gesendet." 
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.employee.update({
      where: { id: employee.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetExpiry,
      },
    })

    // Get base URL from request
    const url = new URL(request.url)
    const baseUrl = `${url.protocol}//${url.host}`
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

    const htmlContent = `
      <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 20px;">Hallo ${employee.firstName},</h2>
      <p style="margin: 0 0 24px 0; color: #3f3f46; font-size: 16px; line-height: 1.6;">
        Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt.
      </p>
      
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
        <tr>
          <td align="center">
            <a href="${resetUrl}" style="display: inline-block; background-color: #166534; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Passwort zurücksetzen
            </a>
          </td>
        </tr>
      </table>
      
      <p style="margin: 0 0 8px 0; color: #71717a; font-size: 14px;">
        Dieser Link ist 1 Stunde gültig.
      </p>
      <p style="margin: 0; color: #71717a; font-size: 14px;">
        Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.
      </p>
    `

    await sendEmail({
      to: employee.email,
      subject: "🔑 Passwort zurücksetzen",
      text: [
        `Hallo ${employee.firstName},`,
        "",
        "Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt.",
        "",
        `Bitte öffne folgenden Link: ${resetUrl}`,
        "",
        "Dieser Link ist 1 Stunde gültig.",
        "",
        "Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.",
      ].join("\n"),
      html: emailTemplate(htmlContent),
    })

    return NextResponse.json({ 
      success: true, 
      message: "Falls ein Konto mit dieser E-Mail existiert, wurde eine E-Mail zum Zurücksetzen des Passworts gesendet." 
    })
  } catch (error) {
    console.error("Failed to process forgot password:", error)
    return NextResponse.json({ error: "Fehler beim Verarbeiten der Anfrage" }, { status: 500 })
  }
}
