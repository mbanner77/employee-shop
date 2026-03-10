import crypto from "crypto"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import {
  buildMicrosoftAuthErrorRedirect,
  buildMicrosoftEmployeeId,
  exchangeMicrosoftAuthorizationCode,
  fetchMicrosoftGraphProfile,
  getMicrosoftFirstName,
  getMicrosoftLastName,
  getMicrosoftPrimaryEmail,
  getMicrosoftSsoConfiguration,
  isMicrosoftEmailAllowed,
  sanitizeReturnTo,
} from "@/lib/microsoft-365"

function clearMicrosoftCookies(response: NextResponse) {
  response.cookies.set("microsoft_oauth_state", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  response.cookies.set("microsoft_oauth_return_to", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}

function buildSuccessRedirect(request: Request, returnTo: string) {
  return new URL(sanitizeReturnTo(returnTo), request.url)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const error = url.searchParams.get("error")
  const errorDescription = url.searchParams.get("error_description")
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const cookieStore = await cookies()
  const storedState = cookieStore.get("microsoft_oauth_state")?.value || ""
  const returnTo = sanitizeReturnTo(cookieStore.get("microsoft_oauth_return_to")?.value)

  if (error) {
    const response = NextResponse.redirect(
      buildMicrosoftAuthErrorRedirect(request, errorDescription || "Microsoft-365-Anmeldung wurde abgebrochen."),
    )
    clearMicrosoftCookies(response)
    return response
  }

  if (!code || !state || !storedState || state !== storedState) {
    const response = NextResponse.redirect(
      buildMicrosoftAuthErrorRedirect(request, "Die Microsoft-365-Anmeldung konnte nicht verifiziert werden."),
    )
    clearMicrosoftCookies(response)
    return response
  }

  const config = await getMicrosoftSsoConfiguration(request)

  if (!config.active) {
    const response = NextResponse.redirect(
      buildMicrosoftAuthErrorRedirect(request, "Microsoft-365-Anmeldung ist derzeit nicht aktiv."),
    )
    clearMicrosoftCookies(response)
    return response
  }

  try {
    const accessToken = await exchangeMicrosoftAuthorizationCode(config, code)
    const profile = await fetchMicrosoftGraphProfile(accessToken)
    const email = getMicrosoftPrimaryEmail(profile)

    if (!email) {
      throw new Error("Im Microsoft-365-Profil wurde keine E-Mail-Adresse gefunden.")
    }

    if (!isMicrosoftEmailAllowed(email, config.allowedDomains)) {
      throw new Error("Die E-Mail-Domain ist für diese Microsoft-365-Anmeldung nicht freigegeben.")
    }

    const existingEmployee = await prisma.employee.findUnique({
      where: { email },
      select: {
        id: true,
        employeeId: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        isActive: true,
      },
    })

    let employee = existingEmployee

    if (!employee) {
      if (!config.autoCreateEmployees) {
        throw new Error("Für diese E-Mail existiert kein Mitarbeiterkonto.")
      }

      employee = await prisma.employee.create({
        data: {
          employeeId: buildMicrosoftEmployeeId(),
          email,
          firstName: getMicrosoftFirstName(profile),
          lastName: getMicrosoftLastName(profile),
          department: profile.department?.trim() || config.defaultDepartment,
          password: crypto.randomBytes(24).toString("hex"),
          isActive: true,
          language: "de",
        },
        select: {
          id: true,
          employeeId: true,
          email: true,
          firstName: true,
          lastName: true,
          department: true,
          isActive: true,
        },
      })
    } else {
      if (!employee.isActive) {
        throw new Error("Ihr Mitarbeiterkonto ist deaktiviert.")
      }

      const nextFirstName = getMicrosoftFirstName(profile)
      const nextLastName = getMicrosoftLastName(profile)
      const nextDepartment = profile.department?.trim() || employee.department || config.defaultDepartment
      const updateData: Record<string, string> = {}

      if (nextFirstName && nextFirstName !== employee.firstName) {
        updateData.firstName = nextFirstName
      }
      if (nextLastName && nextLastName !== employee.lastName) {
        updateData.lastName = nextLastName
      }
      if (nextDepartment && nextDepartment !== employee.department) {
        updateData.department = nextDepartment
      }

      if (Object.keys(updateData).length > 0) {
        employee = await prisma.employee.update({
          where: { id: employee.id },
          data: updateData,
          select: {
            id: true,
            employeeId: true,
            email: true,
            firstName: true,
            lastName: true,
            department: true,
            isActive: true,
          },
        })
      }
    }

    if (!employee || !employee.isActive) {
      throw new Error("Die Microsoft-365-Anmeldung konnte keinem aktiven Mitarbeiterkonto zugeordnet werden.")
    }

    const response = NextResponse.redirect(buildSuccessRedirect(request, returnTo))
    response.cookies.set("employee_session", employee.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    clearMicrosoftCookies(response)
    return response
  } catch (error) {
    const response = NextResponse.redirect(
      buildMicrosoftAuthErrorRedirect(
        request,
        error instanceof Error ? error.message : "Microsoft-365-Anmeldung fehlgeschlagen.",
      ),
    )
    clearMicrosoftCookies(response)
    return response
  }
}
