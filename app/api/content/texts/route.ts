import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getMergedAppTextMap } from "@/lib/app-texts"
import { type Language } from "@/lib/i18n"

function resolveLanguage(request: Request): Language {
  const url = new URL(request.url)
  return url.searchParams.get("lang") === "en" ? "en" : "de"
}

export async function GET(request: Request) {
  try {
    const language = resolveLanguage(request)
    const settings = await prisma.settings.findUnique({
      where: { id: "settings" },
      select: { appTextOverrides: true },
    })

    return NextResponse.json({
      language,
      texts: getMergedAppTextMap(language, settings?.appTextOverrides),
    })
  } catch (error) {
    console.error("Failed to load public app texts:", error)
    return NextResponse.json({ error: "Failed to load app texts" }, { status: 500 })
  }
}
