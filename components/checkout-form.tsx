"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useShopStore } from "@/lib/store"
import { toast } from "sonner"
import { Loader2, Send } from "lucide-react"

const departments = ["Engineering", "Design", "Marketing", "Sales", "HR", "Finance", "Operations", "Management"]

export function CheckoutForm() {
  const router = useRouter()
  const { cart, submitOrder } = useShopStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    department: "",
    street: "",
    zip: "",
    city: "",
  })

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

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const order = submitOrder(formData)

    toast.success("Bestellung erfolgreich aufgegeben!")
    router.push(`/order-confirmation?id=${order.id}`)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <Button type="submit" className="w-full" size="lg" disabled={cart.length === 0 || isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wird verarbeitet...
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
