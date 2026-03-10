import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("employee_session")
    
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { language } = body

    if (!language || !["de", "en"].includes(language)) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 })
    }

    await prisma.employee.update({
      where: { id: session.value },
      data: { language },
    })

    return NextResponse.json({ success: true, language })
  } catch (error) {
    console.error("Failed to update language:", error)
    return NextResponse.json({ error: "Failed to update language" }, { status: 500 })
  }
}
