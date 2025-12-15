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

  await sendEmail({
    to: employee.email,
    subject: `Bestellung: Status geändert auf "${newLabel}"`,
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
  })
}

export async function sendOrderCreatedEmail(args: {
  employeeId: string
  orderId: string
}) {
  const employee = await prisma.employee.findUnique({ where: { id: args.employeeId } })
  if (!employee) return

  await sendEmail({
    to: employee.email,
    subject: `Bestellung ${args.orderId} wurde angelegt`,
    text: [
      `Hallo ${employee.firstName} ${employee.lastName},`,
      "",
      `deine Bestellung (${args.orderId}) wurde erfolgreich angelegt.`,
      "",
      "Viele Grüße",
      "RealCore Mitarbeiter-Shop",
    ].join("\n"),
  })
}
