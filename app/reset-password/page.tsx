"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAppTexts } from "@/components/app-text-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle, Lock } from "lucide-react"
import Link from "next/link"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const { text } = useAppTexts()
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token) {
      setError(text("resetPassword.invalidLinkRequestNew"))
    }
  }, [text, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError(text("resetPassword.passwordMinLength"))
      return
    }

    if (password !== confirmPassword) {
      setError(text("resetPassword.passwordMismatch"))
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/employees/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => router.push("/"), 3000)
      } else {
        setError(data.error || text("resetPassword.error"))
      }
    } catch {
      setError(text("resetPassword.genericError"))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">{text("resetPassword.successTitle")}</h2>
              <p className="text-muted-foreground mb-4">
                {text("resetPassword.successDescription")}
              </p>
              <Link href="/">
                <Button>{text("resetPassword.backHome")}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <XCircle className="h-16 w-16 text-red-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">{text("resetPassword.invalidTitle")}</h2>
              <p className="text-muted-foreground mb-4">
                {text("resetPassword.invalidDescription")}
              </p>
              <Link href="/">
                <Button>{text("resetPassword.backHome")}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>{text("resetPassword.title")}</CardTitle>
          <CardDescription>
            {text("resetPassword.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">{text("resetPassword.newPassword")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={text("resetPassword.newPasswordPlaceholder")}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{text("resetPassword.confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={text("resetPassword.confirmPasswordPlaceholder")}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {text("resetPassword.saving")}
                </>
              ) : (
                text("resetPassword.save")
              )}
            </Button>
            
            <div className="text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                {text("resetPassword.backLink")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
