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

export async function sendReviewRequestEmail(args: {
  employeeId: string
  orderId: string
}) {
  const [employee, order] = await Promise.all([
    prisma.employee.findUnique({ where: { id: args.employeeId } }),
    prisma.order.findUnique({
      where: { id: args.orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                nameEn: true,
              },
            },
          },
        },
      },
    }),
  ])

  if (!employee || !employee.notifyStatusUpdates || !order) return

  const lang = order.language || employee.language || "de"
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "")
  const shopUrl = `${baseUrl}/`
  const orderNumber = order.orderNumber || args.orderId
  const orderedItems = order.items.map((item) =>
    lang === "en" ? item.product.nameEn || item.product.name : item.product.name,
  )

  const texts = {
    de: {
      subject: "⭐ Wie gefallen dir deine Artikel?",
      greeting: `Hallo ${employee.firstName},`,
      intro: "deine Bestellung wurde erfolgreich zugestellt. Wir freuen uns, wenn du deine bestellten Artikel im Shop bewertest.",
      orderLabel: "Bestellnummer",
      itemsLabel: "Bestellte Artikel",
      cta: "Jetzt bewerten",
      note: "Dein Feedback hilft anderen Kolleginnen und Kollegen bei der Auswahl.",
      closing: "Viele Grüße",
      team: "Dein RealCore Mitarbeiter-Shop Team",
    },
    en: {
      subject: "⭐ How do you like your items?",
      greeting: `Hello ${employee.firstName},`,
      intro: "your order has been delivered successfully. We'd love for you to review your ordered items in the shop.",
      orderLabel: "Order number",
      itemsLabel: "Ordered items",
      cta: "Leave a review",
      note: "Your feedback helps other colleagues choose the right products.",
      closing: "Best regards",
      team: "Your RealCore Employee Shop Team",
    },
  }

  const t = texts[lang as keyof typeof texts] || texts.de

  const itemsHtml = orderedItems.length
    ? `
      <p style="margin: 0 0 12px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${t.itemsLabel}</p>
      <ul style="margin: 0 0 24px 18px; padding: 0; color: #18181b; font-size: 14px; line-height: 1.8;">
        ${orderedItems.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    `
    : ""

  const htmlContent = `
    <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 20px;">${t.greeting}</h2>
    <p style="margin: 0 0 24px 0; color: #3f3f46; font-size: 16px; line-height: 1.6;">
      ${t.intro}
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <tr>
        <td>
          <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${t.orderLabel}</p>
          <p style="margin: 0; color: #18181b; font-size: 14px; font-family: monospace;">${orderNumber}</p>
        </td>
      </tr>
    </table>

    ${itemsHtml}

    <div style="margin-bottom: 24px;">
      <a href="${shopUrl}" style="display: inline-block; background-color: #166534; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-weight: 600;">${t.cta}</a>
    </div>

    <p style="margin: 0 0 24px 0; color: #71717a; font-size: 14px;">
      ${t.note}
    </p>

    <p style="margin: 0; color: #71717a; font-size: 14px;">
      ${t.closing}<br/>
      ${t.team}
    </p>
  `

  await sendEmail({
    to: employee.email,
    subject: t.subject,
    text: [
      t.greeting,
      "",
      t.intro,
      "",
      `${t.orderLabel}: ${orderNumber}`,
      ...(orderedItems.length > 0 ? ["", `${t.itemsLabel}:`, ...orderedItems.map((item) => `- ${item}`)] : []),
      "",
      shopUrl,
      "",
      t.note,
      "",
      t.closing,
      t.team,
    ].join("\n"),
    html: emailTemplate(htmlContent),
  })
}

export async function sendOrderCreatedEmailToAdmin(args: {
  orderId: string
  customerName: string
  customerEmail: string
  department: string
  items: Array<{ name: string; size: string }>
}) {
  const settings = await prisma.settings.findUnique({ where: { id: "settings" } })
  if (!settings?.adminEmail) return

  const itemsHtml = args.items.length
    ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
        <tr style="background-color: #e4e4e7;">
          <th style="padding: 8px; text-align: left; font-size: 12px;">Artikel</th>
          <th style="padding: 8px; text-align: right; font-size: 12px;">Größe</th>
        </tr>
        ${args.items.map(item => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e4e4e7;">${item.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e4e4e7; text-align: right;">${item.size}</td>
          </tr>
        `).join("")}
      </table>
    `
    : ""

  const htmlContent = `
    <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 20px;">Neue Bestellung eingegangen</h2>
    <p style="margin: 0 0 24px 0; color: #3f3f46; font-size: 16px; line-height: 1.6;">
      Eine neue Bestellung wurde im Mitarbeiter-Shop aufgegeben.
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <tr>
        <td>
          <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Bestellnummer</p>
          <p style="margin: 0 0 16px 0; color: #18181b; font-size: 14px; font-family: monospace;">${args.orderId}</p>
          
          <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Besteller</p>
          <p style="margin: 0 0 16px 0; color: #18181b; font-size: 14px;">${args.customerName}</p>
          
          <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">E-Mail</p>
          <p style="margin: 0 0 16px 0; color: #18181b; font-size: 14px;">${args.customerEmail}</p>
          
          <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Firmenbereich</p>
          <p style="margin: 0; color: #18181b; font-size: 14px;">${args.department}</p>
        </td>
      </tr>
    </table>
    
    <h3 style="margin: 0 0 12px 0; color: #18181b; font-size: 16px;">Bestellte Artikel (${args.items.length})</h3>
    ${itemsHtml}
  `

  await sendEmail({
    to: settings.adminEmail,
    subject: `🛒 Neue Bestellung von ${args.customerName}`,
    text: [
      `Neue Bestellung eingegangen`,
      "",
      `Bestellnummer: ${args.orderId}`,
      `Besteller: ${args.customerName}`,
      `E-Mail: ${args.customerEmail}`,
      `Firmenbereich: ${args.department}`,
      "",
      `Artikel:`,
      ...args.items.map(item => `- ${item.name} (Größe: ${item.size})`),
    ].join("\n"),
    html: emailTemplate(htmlContent),
  })
}

// Budget-Erinnerung E-Mail
export async function sendBudgetReminderEmail(args: {
  employeeId: string
  usedItems: number
  maxItems: number
  language?: string
}) {
  const employee = await prisma.employee.findUnique({ where: { id: args.employeeId } })
  if (!employee || !employee.notifyStatusUpdates) return

  const remainingItems = args.maxItems - args.usedItems
  const lang = args.language || employee.language || "de"
  
  const texts = {
    de: {
      subject: `📊 Budget-Erinnerung: Noch ${remainingItems} Artikel verfügbar`,
      greeting: `Hallo ${employee.firstName},`,
      intro: "dies ist eine freundliche Erinnerung an dein Jahresbudget im Mitarbeiter-Shop.",
      used: "Bereits bestellt",
      remaining: "Noch verfügbar",
      total: "Jahreslimit",
      items: "Artikel",
      note: remainingItems <= 1 
        ? "⚠️ Du hast nur noch wenige Artikel verfügbar. Nutze dein Budget weise!"
        : "Nutze dein Budget für hochwertige Teamkleidung.",
      closing: "Viele Grüße",
      team: "Dein RealCore Mitarbeiter-Shop Team",
    },
    en: {
      subject: `📊 Budget Reminder: ${remainingItems} items remaining`,
      greeting: `Hello ${employee.firstName},`,
      intro: "this is a friendly reminder about your annual budget in the employee shop.",
      used: "Already ordered",
      remaining: "Still available",
      total: "Yearly limit",
      items: "items",
      note: remainingItems <= 1 
        ? "⚠️ You only have a few items left. Use your budget wisely!"
        : "Use your budget for quality team apparel.",
      closing: "Best regards",
      team: "Your RealCore Employee Shop Team",
    },
  }
  
  const t = texts[lang as keyof typeof texts] || texts.de
  
  const htmlContent = `
    <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 20px;">${t.greeting}</h2>
    <p style="margin: 0 0 24px 0; color: #3f3f46; font-size: 16px; line-height: 1.6;">
      ${t.intro}
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <tr>
        <td>
          <table width="100%" cellpadding="8" cellspacing="0">
            <tr>
              <td style="color: #71717a; font-size: 14px;">${t.used}:</td>
              <td style="color: #18181b; font-size: 14px; font-weight: 600; text-align: right;">${args.usedItems} ${t.items}</td>
            </tr>
            <tr>
              <td style="color: #71717a; font-size: 14px;">${t.remaining}:</td>
              <td style="color: ${remainingItems <= 1 ? '#dc2626' : '#22c55e'}; font-size: 14px; font-weight: 600; text-align: right;">${remainingItems} ${t.items}</td>
            </tr>
            <tr style="border-top: 1px solid #e4e4e7;">
              <td style="color: #71717a; font-size: 14px; padding-top: 12px;">${t.total}:</td>
              <td style="color: #18181b; font-size: 14px; font-weight: 600; text-align: right; padding-top: 12px;">${args.maxItems} ${t.items}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <p style="margin: 0 0 24px 0; color: #3f3f46; font-size: 14px; background-color: #fef3c7; padding: 12px; border-radius: 8px;">
      ${t.note}
    </p>
    
    <p style="margin: 0; color: #71717a; font-size: 14px;">
      ${t.closing}<br/>
      ${t.team}
    </p>
  `

  await sendEmail({
    to: employee.email,
    subject: t.subject,
    text: [
      t.greeting,
      "",
      t.intro,
      "",
      `${t.used}: ${args.usedItems} ${t.items}`,
      `${t.remaining}: ${remainingItems} ${t.items}`,
      `${t.total}: ${args.maxItems} ${t.items}`,
      "",
      t.note,
      "",
      t.closing,
      t.team,
    ].join("\n"),
    html: emailTemplate(htmlContent),
  })
}

// Wunschliste Verfügbarkeits-Benachrichtigung
export async function sendWishlistAvailableEmail(args: {
  employeeId: string
  productName: string
  productNameEn?: string
  productId: string
  availableSize?: string
  availableColor?: string
}) {
  const employee = await prisma.employee.findUnique({ where: { id: args.employeeId } })
  if (!employee || !employee.notifyWishlistAvailable) return

  const lang = employee.language || "de"
  const productName = lang === "en" && args.productNameEn ? args.productNameEn : args.productName
  
  const texts = {
    de: {
      subject: `🎉 Artikel von deiner Wunschliste ist verfügbar: ${productName}`,
      greeting: `Hallo ${employee.firstName},`,
      intro: "gute Nachrichten! Ein Artikel von deiner Wunschliste ist jetzt verfügbar:",
      product: "Produkt",
      size: "Größe",
      color: "Farbe",
      cta: "Jetzt bestellen",
      note: "Greif schnell zu, bevor der Artikel wieder vergriffen ist!",
      closing: "Viele Grüße",
      team: "Dein RealCore Mitarbeiter-Shop Team",
    },
    en: {
      subject: `🎉 Wishlist item available: ${productName}`,
      greeting: `Hello ${employee.firstName},`,
      intro: "great news! An item from your wishlist is now available:",
      product: "Product",
      size: "Size",
      color: "Color",
      cta: "Order now",
      note: "Act fast before it's out of stock again!",
      closing: "Best regards",
      team: "Your RealCore Employee Shop Team",
    },
  }
  
  const t = texts[lang as keyof typeof texts] || texts.de
  
  const detailsHtml = `
    ${args.availableSize ? `<p style="margin: 0 0 8px 0;"><strong>${t.size}:</strong> ${args.availableSize}</p>` : ""}
    ${args.availableColor ? `<p style="margin: 0 0 8px 0;"><strong>${t.color}:</strong> ${args.availableColor}</p>` : ""}
  `
  
  const htmlContent = `
    <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 20px;">${t.greeting}</h2>
    <p style="margin: 0 0 24px 0; color: #3f3f46; font-size: 16px; line-height: 1.6;">
      ${t.intro}
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #dcfce7; border-radius: 8px; padding: 20px; margin-bottom: 24px; border: 1px solid #22c55e;">
      <tr>
        <td>
          <p style="margin: 0 0 8px 0; color: #166534; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${t.product}</p>
          <p style="margin: 0 0 16px 0; color: #166534; font-size: 18px; font-weight: 600;">${productName}</p>
          ${detailsHtml}
        </td>
      </tr>
    </table>
    
    <p style="margin: 0 0 24px 0; color: #3f3f46; font-size: 14px;">
      ${t.note}
    </p>
    
    <p style="margin: 0; color: #71717a; font-size: 14px;">
      ${t.closing}<br/>
      ${t.team}
    </p>
  `

  await sendEmail({
    to: employee.email,
    subject: t.subject,
    text: [
      t.greeting,
      "",
      t.intro,
      "",
      `${t.product}: ${productName}`,
      args.availableSize ? `${t.size}: ${args.availableSize}` : "",
      args.availableColor ? `${t.color}: ${args.availableColor}` : "",
      "",
      t.note,
      "",
      t.closing,
      t.team,
    ].filter(Boolean).join("\n"),
    html: emailTemplate(htmlContent),
  })
  
  // Markiere als benachrichtigt
  await prisma.wishlistItem.updateMany({
    where: {
      employeeId: args.employeeId,
      productId: args.productId,
      notifyWhenAvailable: true,
      notifiedAt: null,
    },
    data: {
      notifiedAt: new Date(),
    },
  })
}

// Mindestbestand-Warnung für Admin
export async function sendLowStockWarningEmail(args: {
  products: Array<{
    name: string
    articleNumber?: string
    currentStock: number
    minStock: number
    size?: string
  }>
}) {
  const settings = await prisma.settings.findUnique({ where: { id: "settings" } })
  if (!settings?.adminEmail || args.products.length === 0) return

  const productsHtml = args.products.map(p => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e4e4e7;">
        ${p.name}${p.size ? ` (${p.size})` : ""}
        ${p.articleNumber ? `<br/><small style="color: #71717a;">${p.articleNumber}</small>` : ""}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e4e4e7; text-align: center; color: #dc2626; font-weight: 600;">${p.currentStock}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e4e4e7; text-align: center;">${p.minStock}</td>
    </tr>
  `).join("")

  const htmlContent = `
    <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 20px;">⚠️ Mindestbestand-Warnung</h2>
    <p style="margin: 0 0 24px 0; color: #3f3f46; font-size: 16px; line-height: 1.6;">
      Die folgenden ${args.products.length} Artikel haben den Mindestbestand unterschritten:
    </p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr style="background-color: #fef2f2;">
        <th style="padding: 12px 8px; text-align: left; font-size: 12px; color: #991b1b;">Artikel</th>
        <th style="padding: 12px 8px; text-align: center; font-size: 12px; color: #991b1b;">Aktuell</th>
        <th style="padding: 12px 8px; text-align: center; font-size: 12px; color: #991b1b;">Mindest</th>
      </tr>
      ${productsHtml}
    </table>
    
    <p style="margin: 0; color: #71717a; font-size: 14px;">
      Bitte prüfe die Bestände und bestelle ggf. nach.
    </p>
  `

  await sendEmail({
    to: settings.adminEmail,
    subject: `⚠️ Mindestbestand-Warnung: ${args.products.length} Artikel`,
    text: [
      "Mindestbestand-Warnung",
      "",
      `Die folgenden ${args.products.length} Artikel haben den Mindestbestand unterschritten:`,
      "",
      ...args.products.map(p => `- ${p.name}${p.size ? ` (${p.size})` : ""}: ${p.currentStock}/${p.minStock}`),
      "",
      "Bitte prüfe die Bestände und bestelle ggf. nach.",
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
