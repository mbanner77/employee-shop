"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useShopStore } from "@/lib/store"
import { toast } from "sonner"
import { Loader2, Send, AlertTriangle, CheckCircle, Info } from "lucide-react"

interface CompanyArea {
  id: string
  name: string
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  department: string
}

export function CheckoutForm() {
  const router = useRouter()
  const { cart, submitOrder } = useShopStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [yearlyOrderCount, setYearlyOrderCount] = useState<number>(0)
  const [maxItems, setMaxItems] = useState<number>(4)
  const [companyAreas, setCompanyAreas] = useState<CompanyArea[]>([])
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    department: "",
    street: "",
    zip: "",
    city: "",
  })

  useEffect(() => {
    fetchEmployeeData()
    fetchSettings()
    fetchCompanyAreas()
  }, [])

  const fetchEmployeeData = async () => {
    try {
      const response = await fetch("/api/employees/me")
      const data = await response.json()
      if (data.employee) {
        setEmployee(data.employee)
        setFormData(prev => ({
          ...prev,
          customerName: `${data.employee.firstName} ${data.employee.lastName}`,
          email: data.employee.email,
          department: data.employee.department,
        }))
        // Fetch yearly order count using dedicated endpoint
        const ordersResponse = await fetch("/api/employees/me/orders")
        const ordersData = await ordersResponse.json()
        if (ordersData.stats) {
          setYearlyOrderCount(ordersData.stats.yearlyItemCount)
        }
      }
    } catch (error) {
      console.error("Failed to fetch employee data:", error)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      const data = await response.json()
      if (data.maxItemsPerOrder) {
        setMaxItems(data.maxItemsPerOrder)
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    }
  }

  const fetchCompanyAreas = async () => {
    try {
      const response = await fetch("/api/company-areas")
      const data = await response.json()
      if (Array.isArray(data)) {
        setCompanyAreas(data)
      }
    } catch (error) {
      console.error("Failed to fetch company areas:", error)
    }
  }

  const companyCartCount = cart
    .filter((item) => item.costBearer === "COMPANY")
    .reduce((sum, item) => sum + item.quantity, 0)
  const privateCartCount = cart
    .filter((item) => item.costBearer === "EMPLOYEE")
    .reduce((sum, item) => sum + item.quantity, 0)
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const privateSubtotal = cart
    .filter((item) => item.costBearer === "EMPLOYEE")
    .reduce((sum, item) => {
      const numericPrice = typeof item.product.price === "number"
        ? item.product.price
        : typeof item.product.price === "string"
          ? Number(item.product.price)
          : 0
      return sum + (Number.isFinite(numericPrice) ? numericPrice : 0) * item.quantity
    }, 0)
  const remainingItems = maxItems - yearlyOrderCount
  const canOrder = remainingItems >= companyCartCount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (totalCartCount === 0) {
      toast.error("Bitte wähle mindestens einen Artikel aus")
      return
    }

    if (
      !formData.customerName ||
      !formData.email ||
      !formData.department ||
      !formData.street ||
      !formData.zip ||
      !formData.city
    ) {
      toast.error("Bitte fülle alle Felder aus")
      return
    }

    if (!canOrder) {
      toast.error(`Du hast nur noch ${remainingItems} Firmenartikel verfügbar. Private Artikel sind weiterhin möglich.`)
      return
    }

    if (!disclaimerAccepted) {
      toast.error("Bitte bestätige die Hinweise zur Bestellung")
      return
    }

    setIsSubmitting(true)

    try {
      const orderData = {
        ...formData,
        employeeId: employee?.id,
        disclaimerAccepted: true,
      }
      const order = await submitOrder(orderData)

      if (order) {
        toast.success("Bestellung erfolgreich aufgegeben!")
        router.push(`/order-confirmation?id=${order.id}`)
      } else {
        toast.error("Bestellung konnte nicht aufgegeben werden. Bitte versuche es erneut.")
        setIsSubmitting(false)
      }
    } catch {
      toast.error("Ein Fehler ist aufgetreten. Bitte versuche es erneut.")
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Yearly Limit Info */}
      <Card className={canOrder ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            {canOrder ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <div>
              <p className={`font-medium ${canOrder ? "text-green-800" : "text-red-800"}`}>
                {remainingItems > 0 
                  ? `Noch ${remainingItems} von ${maxItems} Firmenartikeln kostenlos verfügbar`
                  : "Jahreslimit erreicht"}
              </p>
              <p className="text-sm text-muted-foreground">
                Bereits bestellt: {yearlyOrderCount} Firmenartikel | Im Warenkorb: {companyCartCount} Firma / {privateCartCount} Privat
              </p>
              {privateCartCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  Private Artikel im Warenkorb: {privateCartCount} | Zwischensumme: {privateSubtotal.toFixed(2)} €
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Vollständiger Name *</Label>
          <Input
            id="name"
            placeholder="Max Mustermann"
            value={formData.customerName}
            onChange={(e) => handleChange("customerName", e.target.value)}
            disabled={!!employee}
            className={employee ? "bg-muted" : ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail *</Label>
          <Input
            id="email"
            type="email"
            placeholder="max.mustermann@realcore.de"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={!!employee}
            className={employee ? "bg-muted" : ""}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Firmenbereich *</Label>
        {employee ? (
          <Input
            id="department"
            value={formData.department}
            disabled
            className="bg-muted"
          />
        ) : (
          <Select value={formData.department} onValueChange={(value) => handleChange("department", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Firmenbereich wählen" />
            </SelectTrigger>
            <SelectContent>
              {companyAreas.map((area) => (
                <SelectItem key={area.id} value={area.name}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="street">Straße & Hausnummer *</Label>
        <Input
          id="street"
          placeholder="Musterstraße 123"
          value={formData.street}
          onChange={(e) => handleChange("street", e.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="zip">PLZ *</Label>
          <Input
            id="zip"
            placeholder="12345"
            value={formData.zip}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 5)
              handleChange("zip", value)
            }}
            maxLength={5}
            inputMode="numeric"
            pattern="[0-9]*"
            required
          />
          {formData.zip && formData.zip.length !== 5 && (
            <p className="text-xs text-amber-600">PLZ muss 5 Ziffern haben</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Stadt *</Label>
          <Input
            id="city"
            placeholder="Musterstadt"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Disclaimer / Wichtige Hinweise */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="font-medium text-amber-800">Wichtige Hinweise</p>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>⚠️ Bestellungen sind <strong>verbindlich</strong></li>
                <li>⚠️ Kein Umtausch oder Rückgabe möglich</li>
                <li>⚠️ Bitte beachte die Größentabelle vor der Bestellung</li>
              </ul>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="disclaimer" 
                  checked={disclaimerAccepted}
                  onCheckedChange={(checked) => setDisclaimerAccepted(checked === true)}
                />
                <Label htmlFor="disclaimer" className="text-sm text-amber-800 cursor-pointer">
                  Ich habe die Hinweise gelesen und akzeptiert
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg" disabled={totalCartCount === 0 || isSubmitting || !canOrder || !disclaimerAccepted}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wird verarbeitet...
          </>
        ) : !canOrder ? (
          <>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Jahreslimit erreicht
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Bestellung abschicken
          </>
        )}
      </Button>
    </form>
  )
}
