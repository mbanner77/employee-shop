import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { sendFeedbackEmail } from "@/lib/email"

async function getEmployeeId(): Promise<string | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get("employee_session")
  if (!session) return null
  
  const employee = await prisma.employee.findUnique({ 
    where: { id: session.value },
    select: { id: true }
  })
  return employee?.id || null
}

// GET all feedback (admin only)
export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get("admin-session")
    
    if (!adminSession) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const feedbacks = await prisma.feedback.findMany({
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(feedbacks)
  } catch (error) {
    console.error("Failed to fetch feedback:", error)
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
  }
}

// POST submit new feedback
export async function POST(request: Request) {
  try {
    const employeeId = await getEmployeeId()
    if (!employeeId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { message, rating, orderId } = body

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Nachricht erforderlich" }, { status: 400 })
    }

    const feedback = await prisma.feedback.create({
      data: {
        employeeId,
        message: message.trim(),
        rating: rating ? parseInt(rating) : null,
        orderId: orderId || null,
      },
    })

    // E-Mail an Admin senden
    try {
      const settings = await prisma.settings.findUnique({ where: { id: "settings" } })
      if (settings?.notifyOnFeedback && settings?.adminEmail) {
        const employee = await prisma.employee.findUnique({
          where: { id: employeeId },
          select: { firstName: true, lastName: true, email: true, department: true },
        })

        if (employee) {
          await sendFeedbackEmail({
            feedbackId: feedback.id,
            message: feedback.message,
            rating: feedback.rating,
            customerName: `${employee.firstName} ${employee.lastName}`.trim(),
            customerEmail: employee.email,
            department: employee.department,
            orderId: feedback.orderId,
          })
        }
      }
    } catch (emailError) {
      console.error("Failed to send feedback email:", emailError)
      // Feedback wurde gespeichert, E-Mail-Fehler nicht an User durchreichen
    }

    return NextResponse.json(feedback, { status: 201 })
  } catch (error) {
    console.error("Failed to submit feedback:", error)
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
  }
}
