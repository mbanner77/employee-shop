import nodemailer from "nodemailer"
import { prisma } from "@/lib/db"

type MailPayload = {
  to: string
  subject: string
  text: string
  html?: string
}

function isMaskedPassword(value: unknown) {
  return typeof value === "string" && value === "••••••••"
}

export async function sendEmail(payload: MailPayload) {
  const settings = await prisma.settings.findUnique({ where: { id: "settings" } })

  if (!settings) {
    throw new Error("Email settings not configured")
  }

  if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPassword || !settings.emailFrom) {
    throw new Error("SMTP settings incomplete")
  }

  if (isMaskedPassword(settings.smtpPassword)) {
    throw new Error("SMTP password is masked; re-save real password in settings")
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpSecure,
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPassword,
    },
  })

  const fromName = settings.emailFromName || "RealCore Shop"
  const from = fromName ? `${fromName} <${settings.emailFrom}>` : settings.emailFrom

  await transporter.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  })
}

const statusLabels: Record<string, string> = {
  PENDING: "Ausstehend",
  PROCESSING: "In Bearbeitung",
  SHIPPED: "Versendet",
  DELIVERED: "Zugestellt",
}

function getStatusLabel(status: string) {
  return statusLabels[status] || status
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "#f59e0b",
    PROCESSING: "#3b82f6",
    SHIPPED: "#8b5cf6",
    DELIVERED: "#22c55e",
  }
  return colors[status] || "#6b7280"
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

export async function sendOrderStatusChangedEmail(args: {
  employeeId: string
  orderId: string
  oldStatus: string
  newStatus: string
}) {
  const employee = await prisma.employee.findUnique({ where: { id: args.employeeId } })
  if (!employee) return

  const oldLabel = getStatusLabel(args.oldStatus)
  const newLabel = getStatusLabel(args.newStatus)
  const statusColor = getStatusColor(args.newStatus)

  const htmlContent = `
    <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 20px;">Hallo ${employee.firstName},</h2>
    <p style="margin: 0 0 24px 0; color: #3f3f46; font-size: 16px; line-height: 1.6;">
      Der Status deiner Bestellung hat sich geändert.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <tr>
        <td>
          <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Bestellnummer</p>
          <p style="margin: 0 0 16px 0; color: #18181b; font-size: 14px; font-family: monospace;">${args.orderId}</p>
          
          <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Neuer Status</p>
          <span style="display: inline-block; background-color: ${statusColor}; color: #ffffff; padding: 6px 12px; border-radius: 16px; font-size: 14px; font-weight: 500;">${newLabel}</span>
        </td>
      </tr>
    </table>
    
    <p style="margin: 0; color: #71717a; font-size: 14px;">
      <strong>Vorheriger Status:</strong> ${oldLabel}
    </p>
  `

  await sendEmail({
    to: employee.email,
    subject: `📦 Bestellung: Status geändert auf "${newLabel}"`,
    text: [
      `Hallo ${employee.firstName} ${employee.lastName},`,
      "",
      `der Status deiner Bestellung hat sich geändert:`,
      "",
      `Bestellnummer: ${args.orderId}`,
      `Alter Status: ${oldLabel}`,
      `Neuer Status: ${newLabel}`,
      "",
      "Viele Grüße",
      "Dein RealCore Mitarbeiter-Shop Team",
    ].join("\n"),
    html: emailTemplate(htmlContent),
  })
}

export async function sendOrderCreatedEmail(args: {
  employeeId: string
  orderId: string
  items?: Array<{ name: string; size: string }>
}) {
  const employee = await prisma.employee.findUnique({ where: { id: args.employeeId } })
  if (!employee) return

  const itemsHtml = args.items?.length
    ? `
      <p style="margin: 0 0 12px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Bestellte Artikel</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
        ${args.items.map(item => `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7;">
              <span style="color: #18181b; font-size: 14px;">${item.name}</span>
            </td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7; text-align: right;">
              <span style="display: inline-block; background-color: #e4e4e7; color: #3f3f46; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Größe ${item.size}</span>
            </td>
          </tr>
        `).join("")}
      </table>
    `
    : ""

  const htmlContent = `
    <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 20px;">Hallo ${employee.firstName},</h2>
    <p style="margin: 0 0 24px 0; color: #3f3f46; font-size: 16px; line-height: 1.6;">
      Vielen Dank für deine Bestellung! Wir haben sie erhalten und werden sie schnellstmöglich bearbeiten.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <tr>
        <td>
          <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Bestellnummer</p>
          <p style="margin: 0 0 16px 0; color: #18181b; font-size: 14px; font-family: monospace;">${args.orderId}</p>
          
          <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Status</p>
          <span style="display: inline-block; background-color: #f59e0b; color: #ffffff; padding: 6px 12px; border-radius: 16px; font-size: 14px; font-weight: 500;">Ausstehend</span>
        </td>
      </tr>
    </table>
    
    ${itemsHtml}
    
    <p style="margin: 0; color: #71717a; font-size: 14px;">
      Du erhältst eine weitere E-Mail, sobald sich der Status deiner Bestellung ändert.
    </p>
  `

  await sendEmail({
    to: employee.email,
    subject: `✅ Bestellung erfolgreich angelegt`,
    text: [
      `Hallo ${employee.firstName} ${employee.lastName},`,
      "",
      `deine Bestellung (${args.orderId}) wurde erfolgreich angelegt.`,
      "",
      "Viele Grüße",
      "Dein RealCore Mitarbeiter-Shop Team",
    ].join("\n"),
    html: emailTemplate(htmlContent),
  })
}
