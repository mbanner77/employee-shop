"use client"

import { useState } from "react"
import Image from "next/image"
import { Lock, User, Eye, EyeOff } from "lucide-react"
import { useAppTexts } from "@/components/app-text-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SupplierLoginProps {
  onLogin: (success: boolean) => void
}

export function SupplierLogin({ onLogin }: SupplierLoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { text } = useAppTexts()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/supplier/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        onLogin(true)
      } else {
        const data = await response.json()
        setError(data.error || text("supplier.login.error"))
      }
    } catch {
      setError(text("supplier.login.networkError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="space-y-4 text-center pb-2">
          <div className="flex justify-center">
            <Image
              src="https://realcore.info/bilder/RealCore_Logo.png"
              alt="RealCore Logo"
              width={180}
              height={50}
              className="h-12 w-auto"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">{text("supplier.login.title")}</CardTitle>
            <CardDescription className="text-slate-600 mt-1">
              {text("supplier.login.description")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700">{text("supplier.login.username")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder={text("supplier.login.usernamePlaceholder")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-11 border-slate-200 focus:border-primary focus:ring-primary"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">{text("supplier.login.password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={text("supplier.login.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 border-slate-200 focus:border-primary focus:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? text("supplier.login.loadingSubmit") : text("supplier.login.submit")}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs text-center text-slate-500">
              {text("supplier.login.help")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
