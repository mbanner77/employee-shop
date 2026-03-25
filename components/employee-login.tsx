"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Lock, Mail, User, Eye, EyeOff, UserPlus, LogIn, Building, Loader2, CheckCircle } from "lucide-react"
import { useAppTexts } from "@/components/app-text-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface EmployeeLoginProps {
  onLogin: (employee: Employee) => void
}

interface Employee {
  id: string
  employeeId: string
  email: string
  firstName: string
  lastName: string
  department: string
}

interface CompanyArea {
  id: string
  name: string
}

export function EmployeeLogin({ onLogin }: EmployeeLoginProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [companyAreas, setCompanyAreas] = useState<CompanyArea[]>([])
  const [microsoftSsoEnabled, setMicrosoftSsoEnabled] = useState(false)
  const [ssoMessage, setSsoMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const { text } = useAppTexts()
  
  // Passwort vergessen
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)
  const [forgotPasswordError, setForgotPasswordError] = useState("")
  
  // Login form
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  
  // Register form
  const [registerData, setRegisterData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    companyArea: "",
    password: "",
    confirmPassword: "",
  })

  // Firmenbereiche laden
  useEffect(() => {
    fetch("/api/company-areas")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCompanyAreas(data)
        }
      })
      .catch(console.error)

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setMicrosoftSsoEnabled(Boolean(data?.microsoftSsoEnabled)))
      .catch(console.error)

    const url = new URL(window.location.href)
    const ssoError = url.searchParams.get("sso_error")
    if (ssoError) {
      setSsoMessage({ type: "error", text: ssoError })
      url.searchParams.delete("sso_error")
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`)
    }
  }, [])

  const handleMicrosoftLogin = () => {
    window.location.href = "/api/auth/microsoft/login?returnTo=/"
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/employees/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        onLogin(data.employee)
      } else {
        setError(data.error || text("auth.login.error"))
      }
    } catch {
      setError(text("auth.login.networkError"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (registerData.password !== registerData.confirmPassword) {
      setError(text("auth.register.passwordMismatch"))
      return
    }

    if (registerData.password.length < 6) {
      setError(text("auth.register.passwordMinLength"))
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/employees/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerData.email,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          companyArea: registerData.companyArea,
          password: registerData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Auto-login after registration
        onLogin(data.employee)
      } else {
        setError(data.error || text("auth.register.error"))
      }
    } catch {
      setError(text("auth.register.networkError"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotPasswordError("")
    setForgotPasswordLoading(true)

    try {
      const response = await fetch("/api/employees/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        setForgotPasswordSuccess(true)
      } else {
        setForgotPasswordError(data.error || text("auth.forgot.error"))
      }
    } catch {
      setForgotPasswordError(text("auth.forgot.networkError"))
    } finally {
      setForgotPasswordLoading(false)
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
            <CardTitle className="text-2xl font-bold">{text("auth.title")}</CardTitle>
            <CardDescription>{text("auth.description")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {ssoMessage && (
            <div className={`mb-4 rounded-lg p-3 text-sm ${ssoMessage.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {ssoMessage.text}
            </div>
          )}
          {microsoftSsoEnabled && (
            <div className="mb-4 space-y-3">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                <p className="font-medium">{text("auth.microsoft.title")}</p>
                <p className="mt-1 text-blue-800">
                  {text("auth.microsoft.description")}
                </p>
              </div>
              <Button type="button" variant="outline" className="w-full" onClick={handleMicrosoftLogin}>
                <Building className="mr-2 h-4 w-4" />
                {text("auth.microsoft.button")}
              </Button>
            </div>
          )}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">
                <LogIn className="h-4 w-4 mr-2" />
                {text("auth.tab.login")}
              </TabsTrigger>
              <TabsTrigger value="register">
                <UserPlus className="h-4 w-4 mr-2" />
                {text("auth.tab.register")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{text("auth.login.email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder={text("auth.login.emailPlaceholder")}
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">{text("auth.login.password")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder={text("auth.passwordPlaceholder")}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? text("auth.login.loading") : text("auth.login.submit")}
                </Button>

                <Dialog open={forgotPasswordOpen} onOpenChange={(open) => {
                  setForgotPasswordOpen(open)
                  if (!open) {
                    setForgotPasswordSuccess(false)
                    setForgotPasswordError("")
                    setForgotPasswordEmail("")
                  }
                }}>
                  <DialogTrigger asChild>
                    <button type="button" className="w-full text-center text-sm text-muted-foreground hover:text-primary mt-2">
                      {text("auth.forgot.trigger")}
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{text("auth.forgot.title")}</DialogTitle>
                      <DialogDescription>
                        {text("auth.forgot.description")}
                      </DialogDescription>
                    </DialogHeader>
                    {forgotPasswordSuccess ? (
                      <div className="flex flex-col items-center py-4">
                        <CheckCircle className="h-12 w-12 text-green-600 mb-3" />
                        <p className="text-center text-sm">
                          {text("auth.forgot.success")}
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleForgotPassword} className="space-y-4">
                        {forgotPasswordError && (
                          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                            {forgotPasswordError}
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="forgot-email">{text("auth.forgot.email")}</Label>
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder={text("auth.forgot.emailPlaceholder")}
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={forgotPasswordLoading}>
                          {forgotPasswordLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {text("auth.forgot.loading")}
                            </>
                          ) : (
                            text("auth.forgot.submit")
                          )}
                        </Button>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{text("auth.register.firstName")}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        placeholder={text("auth.register.firstNamePlaceholder")}
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{text("auth.register.lastName")}</Label>
                    <Input
                      id="lastName"
                      placeholder={text("auth.register.lastNamePlaceholder")}
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email">{text("auth.register.email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder={text("auth.register.emailPlaceholder")}
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyArea">{text("auth.register.companyArea")}</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Select 
                      value={registerData.companyArea} 
                      onValueChange={(value) => setRegisterData({ ...registerData, companyArea: value })}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder={text("auth.register.companyAreaPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {companyAreas.map((area) => (
                          <SelectItem key={area.id} value={area.name}>{area.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">{text("auth.register.password")}</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder={text("auth.passwordPlaceholder")}
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{text("auth.register.confirmPassword")}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder={text("auth.passwordPlaceholder")}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? text("auth.register.loading") : text("auth.register.submit")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
