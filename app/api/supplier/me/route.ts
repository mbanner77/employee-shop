import { NextResponse } from "next/server"
import { getAuthenticatedSupplierPortalSession } from "@/lib/supplier-auth"

export async function GET() {
  try {
    const supplier = await getAuthenticatedSupplierPortalSession()

    if (!supplier) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      supplier,
    })
  } catch (error) {
    console.error("Failed to fetch supplier session:", error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
