import { cookies } from "next/headers"
import { prisma } from "@/lib/db"

export async function getAuthenticatedAdmin() {
  const cookieStore = await cookies()
  const adminSessionId = cookieStore.get("admin-session")?.value

  if (!adminSessionId) {
    return null
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: adminSessionId },
    select: {
      id: true,
      username: true,
    },
  })

  return admin ?? null
}

export async function isAdminAuthenticated() {
  return Boolean(await getAuthenticatedAdmin())
}
