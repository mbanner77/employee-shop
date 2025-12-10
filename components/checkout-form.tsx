"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useShopStore } from "@/lib/store"
import { toast } from "sonner"
import { Loader2, Send, AlertTriangle, CheckCircle } from "lucide-react"

const departments = ["Engineering", "Design", "Marketing", "Sales", "HR", "Finance", "Operations", "Management"]

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
        // Fetch yearly order count
        const ordersResponse = await fetch(`/api/employees/${data.employee.id}`)
        const ordersData = await ordersResponse.json()
        if (ordersData.orders) {
          const currentYear = new Date().getFullYear()
          const thisYearOrders = ordersData.orders.filter((order: { createdAt: string }) => 
            new Date(order.createdAt).getFullYear() === currentYear
          )
          const itemCount = thisYearOrders.reduce((sum: number, order: { items: unknown[] }) => 
            sum + order.items.length, 0
          )
          setYearlyOrderCount(itemCount)
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

  const remainingItems = maxItems - yearlyOrderCount
  const canOrder = remainingItems >= cart.length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cart.length === 0) {
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
      toast.error(`Du hast dein Jahreslimit erreicht. Noch ${remainingItems} Artikel verfügbar.`)
      return
    }

    setIsSubmitting(true)

    try {
      const orderData = {
        ...formData,
        employeeId: employee?.id,
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
                  ? `Noch ${remainingItems} von ${maxItems} Artikeln verfügbar dieses Jahr`
                  : "Jahreslimit erreicht"}
              </p>
              <p className="text-sm text-muted-foreground">
                Bereits bestellt: {yearlyOrderCount} | Im Warenkorb: {cart.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Vollständiger Name</Label>
          <Input
            id="name"
            placeholder="Max Mustermann"
            value={formData.customerName}
            onChange={(e) => handleChange("customerName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="max.mustermann@realcore.de"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Abteilung</Label>
        <Select value={formData.department} onValueChange={(value) => handleChange("department", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Abteilung wählen" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="street">Straße & Hausnummer</Label>
        <Input
          id="street"
          placeholder="Musterstraße 123"
          value={formData.street}
          onChange={(e) => handleChange("street", e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="zip">PLZ</Label>
          <Input
            id="zip"
            placeholder="12345"
            value={formData.zip}
            onChange={(e) => handleChange("zip", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Stadt</Label>
          <Input
            id="city"
            placeholder="Musterstadt"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={cart.length === 0 || isSubmitting || !canOrder}>
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
