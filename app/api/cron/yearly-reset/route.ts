import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// This endpoint should be called by a cron job on January 1st
// On Render, you can set up a cron job to call this endpoint
// Authorization via secret token in header

export async function POST(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const currentYear = now.getFullYear()
    
    // Only run in January (month 0)
    // This is a safety check - the cron job should only be scheduled for Jan 1st
    if (now.getMonth() !== 0 && process.env.NODE_ENV === "production") {
      return NextResponse.json({ 
        error: "Yearly reset can only run in January",
        currentMonth: now.getMonth() + 1
      }, { status: 400 })
    }

    // Reset quota for all employees by setting quotaResetDate to now
    const result = await prisma.employee.updateMany({
      data: { 
        quotaResetDate: now 
      },
    })

    console.log(`[CRON] Yearly quota reset completed for ${result.count} employees at ${now.toISOString()}`)

    return NextResponse.json({ 
      success: true, 
      message: `Jahreskontingent für ${result.count} Mitarbeiter zurückgesetzt`,
      resetDate: now.toISOString(),
      year: currentYear,
      employeesAffected: result.count
    })
  } catch (error) {
    console.error("[CRON] Failed to reset yearly quota:", error)
    return NextResponse.json({ error: "Failed to reset yearly quota" }, { status: 500 })
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({ 
    status: "ok",
    endpoint: "yearly-reset",
    description: "Resets yearly order quota for all employees. Should be called on January 1st.",
    method: "POST",
    authorization: "Bearer <CRON_SECRET>"
  })
}
