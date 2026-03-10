import { NextResponse } from "next/server"
import {
  buildMicrosoftAuthErrorRedirect,
  buildMicrosoftAuthorizationUrl,
  createMicrosoftOauthState,
  getMicrosoftSsoConfiguration,
  sanitizeReturnTo,
} from "@/lib/microsoft-365"

export async function GET(request: Request) {
  const config = await getMicrosoftSsoConfiguration(request)

  if (!config.active) {
    return NextResponse.redirect(
      buildMicrosoftAuthErrorRedirect(request, "Microsoft-365-Anmeldung ist derzeit nicht aktiviert."),
    )
  }

  const url = new URL(request.url)
  const returnTo = sanitizeReturnTo(url.searchParams.get("returnTo"))
  const state = createMicrosoftOauthState()
  const response = NextResponse.redirect(buildMicrosoftAuthorizationUrl(config, state))

  response.cookies.set("microsoft_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  })
  response.cookies.set("microsoft_oauth_return_to", returnTo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  })

  return response
}
