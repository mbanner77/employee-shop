"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type Language, setLanguageCookie, getLanguageFromCookie } from "@/lib/i18n"

export function LanguageSwitcher() {
  const [language, setLanguage] = useState<Language>("de")

  useEffect(() => {
    setLanguage(getLanguageFromCookie())
  }, [])

  const handleLanguageChange = async (lang: Language) => {
    setLanguage(lang)
    setLanguageCookie(lang)
    
    // Update employee language preference if logged in
    try {
      await fetch("/api/employees/me/language", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang }),
      })
    } catch {
      // Ignore errors for non-logged-in users
    }
    
    // Reload to apply changes
    window.location.reload()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Sprache wechseln</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleLanguageChange("de")}
          className={language === "de" ? "bg-accent" : ""}
        >
          🇩🇪 Deutsch
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange("en")}
          className={language === "en" ? "bg-accent" : ""}
        >
          🇬🇧 English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
