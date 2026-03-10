"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { formatAppText, getDefaultAppText, getDefaultAppTextMap, type AppTextKey, type AppTextValueMap } from "@/lib/app-texts"
import { getLanguageFromCookie, type Language } from "@/lib/i18n"

type AppTextContextValue = {
  language: Language
  loading: boolean
  text: (key: AppTextKey) => string
  textf: (key: AppTextKey, params?: Record<string, string | number | null | undefined>) => string
  refresh: () => Promise<void>
}

const AppTextContext = createContext<AppTextContextValue | null>(null)

async function fetchAppTexts(language: Language): Promise<AppTextValueMap> {
  const response = await fetch(`/api/content/texts?lang=${language}`, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch app texts")
  }

  const data = (await response.json()) as { texts?: AppTextValueMap }
  return data.texts || getDefaultAppTextMap(language)
}

export function AppTextProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("de")
  const [texts, setTexts] = useState<AppTextValueMap>(() => getDefaultAppTextMap("de"))
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const nextLanguage = getLanguageFromCookie()
    setLanguage(nextLanguage)
    setLoading(true)

    try {
      setTexts(await fetchAppTexts(nextLanguage))
    } catch (error) {
      console.error("Failed to load app texts:", error)
      setTexts(getDefaultAppTextMap(nextLanguage))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo<AppTextContextValue>(() => {
    return {
      language,
      loading,
      text: (key) => texts[key] || getDefaultAppText(key, language),
      textf: (key, params) => formatAppText(texts[key] || getDefaultAppText(key, language), params),
      refresh,
    }
  }, [language, loading, refresh, texts])

  return <AppTextContext.Provider value={value}>{children}</AppTextContext.Provider>
}

export function useAppTexts() {
  const context = useContext(AppTextContext)

  if (!context) {
    throw new Error("useAppTexts must be used within AppTextProvider")
  }

  return context
}
