"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminAppTexts } from "@/components/admin/admin-app-texts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Heart,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Plus,
  Save,
  Search,
  ShoppingBag,
  Star,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react"

type AddressType = "PRIVATE" | "COMPANY" | "OTHER"
type Language = "de" | "en"
type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED"

type EmployeeCounts = {
  orders: number
  addresses: number
  feedbacks: number
  reviews: number
  wishlistItems: number
  favorites: number
}

interface CrmEmployeeListItem {
  id: string
  employeeId: string
  email: string
  firstName: string
  lastName: string
  department: string
  language: Language
  isActive: boolean
  notifyStatusUpdates: boolean
  notifyNewsletter: boolean
  notifyWishlistAvailable: boolean
  createdAt: string
  updatedAt: string
  lastOrderAt: string | null
  lastActivityAt: string | null
  company: {
    id: string
    name: string
  } | null
  counts: EmployeeCounts
}

interface CrmAddress {
  id: string
  type: AddressType
  label: string | null
  street: string
  zip: string
  city: string
  country: string
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CrmOrderItem {
  id: string
  size: string
  color: string | null
  quantity: number
  costBearer: "COMPANY" | "EMPLOYEE"
  itemStatus: OrderStatus
  unitPrice: number | string | null
  supplier: {
    id: string
    companyName: string
  } | null
  product: {
    id: string
    name: string
    articleNumber: string | null
    image: string
  }
}

interface CrmOrder {
  id: string
  orderNumber: string | null
  customerName: string
  status: OrderStatus
  orderType: "COMPANY" | "PRIVATE" | "MIXED"
  privatePaymentStatus: "OPEN" | "PAID" | "CANCELLED" | null
  adminNotes: string | null
  trackingNumber: string | null
  trackingUrl: string | null
  createdAt: string
  items: CrmOrderItem[]
}

interface CrmFeedback {
  id: string
  orderId: string | null
  message: string
  rating: number | null
  createdAt: string
}

interface CrmReview {
  id: string
  rating: number
  comment: string | null
  isPublic: boolean
  createdAt: string
  updatedAt: string
  product: {
    id: string
    name: string
    articleNumber: string | null
    image: string
  }
}

interface CrmWishlistItem {
  id: string
  preferredSize: string | null
  preferredColor: string | null
  notes: string | null
  notifyWhenAvailable: boolean
  notifiedAt: string | null
  createdAt: string
  updatedAt: string
  product: {
    id: string
    name: string
    articleNumber: string | null
    image: string
    isActive: boolean
  }
}

interface CrmFavorite {
  id: string
  createdAt: string
  product: {
    id: string
    name: string
    articleNumber: string | null
    image: string
    isActive: boolean
  }
}

interface CrmEmployeeDetail {
  id: string
  employeeId: string
  email: string
  firstName: string
  lastName: string
  department: string
  language: Language
  isActive: boolean
  quotaResetDate: string | null
  notifyStatusUpdates: boolean
  notifyNewsletter: boolean
  notifyWishlistAvailable: boolean
  createdAt: string
  updatedAt: string
  company: {
    id: string
    name: string
    billingAddress: string | null
    paymentTerms: string | null
  } | null
  addresses: CrmAddress[]
  orders: CrmOrder[]
  feedbacks: CrmFeedback[]
  reviews: CrmReview[]
  wishlistItems: CrmWishlistItem[]
  favorites: CrmFavorite[]
  _count: EmployeeCounts
}

interface EmployeeCreateForm {
  employeeId: string
  email: string
  firstName: string
  lastName: string
  department: string
  language: Language
  password: string
  isActive: boolean
  notifyStatusUpdates: boolean
  notifyNewsletter: boolean
  notifyWishlistAvailable: boolean
}

interface AddressCreateForm {
  type: AddressType
  label: string
  street: string
  zip: string
  city: string
  country: string
  isDefault: boolean
}

const emptyEmployeeCreateForm: EmployeeCreateForm = {
  employeeId: "",
  email: "",
  firstName: "",
  lastName: "",
  department: "Allgemein",
  language: "de",
  password: "",
  isActive: true,
  notifyStatusUpdates: true,
  notifyNewsletter: false,
  notifyWishlistAvailable: true,
}

const emptyAddressCreateForm: AddressCreateForm = {
  type: "PRIVATE",
  label: "",
  street: "",
  zip: "",
  city: "",
  country: "Deutschland",
  isDefault: false,
}

const orderStatusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: "PENDING", label: "Ausstehend" },
  { value: "PROCESSING", label: "In Bearbeitung" },
  { value: "SHIPPED", label: "Versendet" },
  { value: "DELIVERED", label: "Zugestellt" },
]

const addressTypeOptions: Array<{ value: AddressType; label: string }> = [
  { value: "PRIVATE", label: "Privat" },
  { value: "COMPANY", label: "Firma" },
  { value: "OTHER", label: "Sonstiges" },
]

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-"
  }

  return new Date(value).toLocaleDateString("de-DE")
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "-"
  }

  return new Date(value).toLocaleString("de-DE")
}

function toDateInputValue(value: string | null | undefined) {
  if (!value) {
    return ""
  }

  return new Date(value).toISOString().slice(0, 10)
}

function formatMoney(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "-"
  }

  const numericValue = typeof value === "number" ? value : Number(value)
  if (Number.isNaN(numericValue)) {
    return String(value)
  }

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(numericValue)
}

function getOrderStatusLabel(status: OrderStatus) {
  return orderStatusOptions.find((option) => option.value === status)?.label || status
}

export function AdminCRM() {
  const [employees, setEmployees] = useState<CrmEmployeeListItem[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<CrmEmployeeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [deactivating, setDeactivating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creatingEmployee, setCreatingEmployee] = useState(false)
  const [newEmployee, setNewEmployee] = useState<EmployeeCreateForm>(emptyEmployeeCreateForm)
  const [newPassword, setNewPassword] = useState("")
  const [newAddress, setNewAddress] = useState<AddressCreateForm>(emptyAddressCreateForm)
  const [savingAddress, setSavingAddress] = useState(false)
  const [savingFeedbackId, setSavingFeedbackId] = useState<string | null>(null)
  const [savingReviewId, setSavingReviewId] = useState<string | null>(null)
  const [savingWishlistId, setSavingWishlistId] = useState<string | null>(null)
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null)

  const filteredEmployees = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase()

    if (!needle) {
      return employees
    }

    return employees.filter((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase()
      return (
        fullName.includes(needle) ||
        employee.email.toLowerCase().includes(needle) ||
        employee.employeeId.toLowerCase().includes(needle) ||
        employee.department.toLowerCase().includes(needle) ||
        (employee.company?.name || "").toLowerCase().includes(needle)
      )
    })
  }, [employees, searchTerm])

  const stats = useMemo(() => {
    return {
      total: employees.length,
      active: employees.filter((employee) => employee.isActive).length,
      feedbacks: employees.reduce((sum, employee) => sum + employee.counts.feedbacks, 0),
      reviews: employees.reduce((sum, employee) => sum + employee.counts.reviews, 0),
    }
  }, [employees])

  const fetchEmployees = async (preferredEmployeeId?: string | null) => {
    const response = await fetch("/api/admin/crm/employees")

    if (!response.ok) {
      throw new Error("Failed to fetch employees")
    }

    const data = (await response.json()) as CrmEmployeeListItem[]
    setEmployees(data)

    const nextEmployeeId =
      preferredEmployeeId && data.some((employee) => employee.id === preferredEmployeeId)
        ? preferredEmployeeId
        : selectedEmployeeId && data.some((employee) => employee.id === selectedEmployeeId)
          ? selectedEmployeeId
          : data[0]?.id || null

    setSelectedEmployeeId(nextEmployeeId)
    return data
  }

  const fetchEmployeeDetail = async (employeeId: string) => {
    setDetailLoading(true)
    try {
      const response = await fetch(`/api/admin/crm/employees/${employeeId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch employee detail")
      }

      const data = (await response.json()) as CrmEmployeeDetail
      setSelectedEmployee(data)
    } catch (error) {
      console.error("Failed to fetch CRM employee detail:", error)
      toast.error("Mitarbeiterdetail konnte nicht geladen werden")
      setSelectedEmployee(null)
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        await fetchEmployees()
      } catch (error) {
        console.error("Failed to load CRM employees:", error)
        toast.error("CRM-Daten konnten nicht geladen werden")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  useEffect(() => {
    if (!selectedEmployeeId) {
      setSelectedEmployee(null)
      return
    }

    fetchEmployeeDetail(selectedEmployeeId)
  }, [selectedEmployeeId])

  const refreshData = async (preferredEmployeeId?: string | null) => {
    const nextId = preferredEmployeeId ?? selectedEmployeeId
    await fetchEmployees(nextId)
    if (nextId) {
      await fetchEmployeeDetail(nextId)
    }
  }

  const updateSelectedEmployee = <K extends keyof CrmEmployeeDetail>(key: K, value: CrmEmployeeDetail[K]) => {
    setSelectedEmployee((current) => (current ? { ...current, [key]: value } : current))
  }

  const updateAddressField = <K extends keyof CrmAddress>(addressId: string, key: K, value: CrmAddress[K]) => {
    setSelectedEmployee((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        addresses: current.addresses.map((address) =>
          address.id === addressId ? { ...address, [key]: value } : address,
        ),
      }
    })
  }

  const updateFeedbackField = <K extends keyof CrmFeedback>(feedbackId: string, key: K, value: CrmFeedback[K]) => {
    setSelectedEmployee((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        feedbacks: current.feedbacks.map((feedback) =>
          feedback.id === feedbackId ? { ...feedback, [key]: value } : feedback,
        ),
      }
    })
  }

  const updateReviewField = <K extends keyof CrmReview>(reviewId: string, key: K, value: CrmReview[K]) => {
    setSelectedEmployee((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        reviews: current.reviews.map((review) =>
          review.id === reviewId ? { ...review, [key]: value } : review,
        ),
      }
    })
  }

  const updateWishlistField = <K extends keyof CrmWishlistItem>(itemId: string, key: K, value: CrmWishlistItem[K]) => {
    setSelectedEmployee((current) => {
      if (!current) {
        return current
      }

      return {
        ...current,
        wishlistItems: current.wishlistItems.map((item) =>
          item.id === itemId ? { ...item, [key]: value } : item,
        ),
      }
    })
  }

  const handleCreateEmployee = async () => {
    setCreatingEmployee(true)
    try {
      const response = await fetch("/api/admin/crm/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmployee),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Mitarbeiter konnte nicht angelegt werden")
        return
      }

      toast.success("Mitarbeiter angelegt")
      setCreateDialogOpen(false)
      setNewEmployee(emptyEmployeeCreateForm)
      await refreshData(data.id)
    } catch (error) {
      console.error("Failed to create CRM employee:", error)
      toast.error("Verbindungsfehler beim Anlegen")
    } finally {
      setCreatingEmployee(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!selectedEmployee) {
      return
    }

    setSavingProfile(true)
    try {
      const response = await fetch(`/api/admin/crm/employees/${selectedEmployee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmployee.employeeId,
          email: selectedEmployee.email,
          firstName: selectedEmployee.firstName,
          lastName: selectedEmployee.lastName,
          department: selectedEmployee.department,
          language: selectedEmployee.language,
          isActive: selectedEmployee.isActive,
          quotaResetDate: selectedEmployee.quotaResetDate,
          notifyStatusUpdates: selectedEmployee.notifyStatusUpdates,
          notifyNewsletter: selectedEmployee.notifyNewsletter,
          notifyWishlistAvailable: selectedEmployee.notifyWishlistAvailable,
          password: newPassword,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || "Profil konnte nicht gespeichert werden")
        return
      }

      setSelectedEmployee(data as CrmEmployeeDetail)
      setNewPassword("")
      toast.success("Profil gespeichert")
      await fetchEmployees(selectedEmployee.id)
    } catch (error) {
      console.error("Failed to save CRM profile:", error)
      toast.error("Verbindungsfehler beim Speichern")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleDeactivateEmployee = async () => {
    if (!selectedEmployee) {
      return
    }

    if (!confirm(`Mitarbeiter "${selectedEmployee.firstName} ${selectedEmployee.lastName}" deaktivieren?`)) {
      return
    }

    setDeactivating(true)
    try {
      const response = await fetch(`/api/admin/crm/employees/${selectedEmployee.id}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Mitarbeiter konnte nicht deaktiviert werden")
        return
      }

      toast.success("Mitarbeiter deaktiviert")
      await refreshData(selectedEmployee.id)
    } catch (error) {
      console.error("Failed to deactivate CRM employee:", error)
      toast.error("Verbindungsfehler beim Deaktivieren")
    } finally {
      setDeactivating(false)
    }
  }

  const handleCreateAddress = async () => {
    if (!selectedEmployee) {
      return
    }

    setSavingAddress(true)
    try {
      const response = await fetch(`/api/admin/crm/employees/${selectedEmployee.id}/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Adresse konnte nicht angelegt werden")
        return
      }

      toast.success("Adresse angelegt")
      setNewAddress(emptyAddressCreateForm)
      await refreshData(selectedEmployee.id)
    } catch (error) {
      console.error("Failed to create CRM address:", error)
      toast.error("Verbindungsfehler beim Anlegen der Adresse")
    } finally {
      setSavingAddress(false)
    }
  }

  const handleSaveAddress = async (address: CrmAddress) => {
    if (!selectedEmployee) {
      return
    }

    setSavingAddress(true)
    try {
      const response = await fetch(`/api/admin/crm/employees/${selectedEmployee.id}/addresses`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: address.id,
          type: address.type,
          label: address.label,
          street: address.street,
          zip: address.zip,
          city: address.city,
          country: address.country,
          isDefault: address.isDefault,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Adresse konnte nicht gespeichert werden")
        return
      }

      toast.success("Adresse gespeichert")
      await refreshData(selectedEmployee.id)
    } catch (error) {
      console.error("Failed to save CRM address:", error)
      toast.error("Verbindungsfehler beim Speichern der Adresse")
    } finally {
      setSavingAddress(false)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!selectedEmployee) {
      return
    }

    if (!confirm("Adresse wirklich entfernen?")) {
      return
    }

    setSavingAddress(true)
    try {
      const response = await fetch(`/api/admin/crm/employees/${selectedEmployee.id}/addresses`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId }),
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Adresse konnte nicht gelöscht werden")
        return
      }

      toast.success("Adresse entfernt")
      await refreshData(selectedEmployee.id)
    } catch (error) {
      console.error("Failed to delete CRM address:", error)
      toast.error("Verbindungsfehler beim Löschen der Adresse")
    } finally {
      setSavingAddress(false)
    }
  }

  const handleSaveFeedback = async (feedback: CrmFeedback) => {
    setSavingFeedbackId(feedback.id)
    try {
      const response = await fetch(`/api/admin/crm/feedback/${feedback.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: feedback.message,
          rating: feedback.rating,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Feedback konnte nicht gespeichert werden")
        return
      }

      toast.success("Feedback gespeichert")
      await refreshData(selectedEmployeeId)
    } catch (error) {
      console.error("Failed to save CRM feedback:", error)
      toast.error("Verbindungsfehler beim Speichern des Feedbacks")
    } finally {
      setSavingFeedbackId(null)
    }
  }

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!confirm("Feedback wirklich löschen?")) {
      return
    }

    setSavingFeedbackId(feedbackId)
    try {
      const response = await fetch(`/api/admin/crm/feedback/${feedbackId}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Feedback konnte nicht gelöscht werden")
        return
      }

      toast.success("Feedback gelöscht")
      await refreshData(selectedEmployeeId)
    } catch (error) {
      console.error("Failed to delete CRM feedback:", error)
      toast.error("Verbindungsfehler beim Löschen des Feedbacks")
    } finally {
      setSavingFeedbackId(null)
    }
  }

  const handleSaveReview = async (review: CrmReview) => {
    setSavingReviewId(review.id)
    try {
      const response = await fetch(`/api/admin/crm/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: review.rating,
          comment: review.comment,
          isPublic: review.isPublic,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Bewertung konnte nicht gespeichert werden")
        return
      }

      toast.success("Bewertung gespeichert")
      await refreshData(selectedEmployeeId)
    } catch (error) {
      console.error("Failed to save CRM review:", error)
      toast.error("Verbindungsfehler beim Speichern der Bewertung")
    } finally {
      setSavingReviewId(null)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Bewertung wirklich löschen?")) {
      return
    }

    setSavingReviewId(reviewId)
    try {
      const response = await fetch(`/api/admin/crm/reviews/${reviewId}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Bewertung konnte nicht gelöscht werden")
        return
      }

      toast.success("Bewertung gelöscht")
      await refreshData(selectedEmployeeId)
    } catch (error) {
      console.error("Failed to delete CRM review:", error)
      toast.error("Verbindungsfehler beim Löschen der Bewertung")
    } finally {
      setSavingReviewId(null)
    }
  }

  const handleSaveWishlistItem = async (item: CrmWishlistItem) => {
    setSavingWishlistId(item.id)
    try {
      const response = await fetch(`/api/admin/crm/wishlist/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredSize: item.preferredSize,
          preferredColor: item.preferredColor,
          notes: item.notes,
          notifyWhenAvailable: item.notifyWhenAvailable,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Wunschlisten-Eintrag konnte nicht gespeichert werden")
        return
      }

      toast.success("Wunschlisten-Eintrag gespeichert")
      await refreshData(selectedEmployeeId)
    } catch (error) {
      console.error("Failed to save CRM wishlist item:", error)
      toast.error("Verbindungsfehler beim Speichern des Wunschlisten-Eintrags")
    } finally {
      setSavingWishlistId(null)
    }
  }

  const handleDeleteWishlistItem = async (itemId: string) => {
    if (!confirm("Wunschlisten-Eintrag wirklich löschen?")) {
      return
    }

    setSavingWishlistId(itemId)
    try {
      const response = await fetch(`/api/admin/crm/wishlist/${itemId}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Wunschlisten-Eintrag konnte nicht gelöscht werden")
        return
      }

      toast.success("Wunschlisten-Eintrag gelöscht")
      await refreshData(selectedEmployeeId)
    } catch (error) {
      console.error("Failed to delete CRM wishlist item:", error)
      toast.error("Verbindungsfehler beim Löschen des Wunschlisten-Eintrags")
    } finally {
      setSavingWishlistId(null)
    }
  }

  const handleDeleteFavorite = async (favoriteId: string) => {
    if (!confirm("Favorit wirklich entfernen?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/crm/favorites/${favoriteId}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Favorit konnte nicht gelöscht werden")
        return
      }

      toast.success("Favorit entfernt")
      await refreshData(selectedEmployeeId)
    } catch (error) {
      console.error("Failed to delete CRM favorite:", error)
      toast.error("Verbindungsfehler beim Löschen des Favoriten")
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setSavingOrderId(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Bestellstatus konnte nicht gespeichert werden")
        return
      }

      toast.success("Bestellstatus gespeichert")
      await refreshData(selectedEmployeeId)
    } catch (error) {
      console.error("Failed to update order status from CRM:", error)
      toast.error("Verbindungsfehler beim Speichern des Bestellstatus")
    } finally {
      setSavingOrderId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="contacts" className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">CRM</h1>
            <p className="text-muted-foreground">Bearbeite Mitarbeiterdaten und pflege zentrale App-Texte zentral im Admin-Bereich</p>
          </div>
          <TabsList className="grid w-full max-w-sm grid-cols-2">
            <TabsTrigger value="contacts">Kontakte</TabsTrigger>
            <TabsTrigger value="texts">App-Texte</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="contacts" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setCreateDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Neuer Kontakt
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Kontakte</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <ShoppingBag className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.active}</div>
                <div className="text-sm text-muted-foreground">Aktive Mitarbeiter</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.feedbacks}</div>
                <div className="text-sm text-muted-foreground">Feedback-Einträge</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Star className="h-8 w-8 text-amber-500" />
              <div>
                <div className="text-2xl font-bold">{stats.reviews}</div>
                <div className="text-sm text-muted-foreground">Bewertungen</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Kontakte</CardTitle>
            <CardDescription>Suche und öffne Mitarbeiterprofile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Suche nach Name, E-Mail, ID, Bereich..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-9"
              />
            </div>

            <div className="space-y-3">
              {filteredEmployees.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Keine Kontakte gefunden
                </div>
              ) : (
                filteredEmployees.map((employee) => {
                  const isSelected = employee.id === selectedEmployeeId
                  return (
                    <button
                      key={employee.id}
                      type="button"
                      onClick={() => setSelectedEmployeeId(employee.id)}
                      className={`w-full rounded-lg border p-4 text-left transition-colors ${
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            {employee.email}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {employee.employeeId} · {employee.department}
                          </div>
                        </div>
                        <Badge variant={employee.isActive ? "default" : "secondary"}>
                          {employee.isActive ? "Aktiv" : "Inaktiv"}
                        </Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div className="rounded bg-muted/60 px-2 py-1">Orders {employee.counts.orders}</div>
                        <div className="rounded bg-muted/60 px-2 py-1">Feedback {employee.counts.feedbacks}</div>
                        <div className="rounded bg-muted/60 px-2 py-1">Wishlist {employee.counts.wishlistItems}</div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Letzte Aktivität: {formatDateTime(employee.lastActivityAt)}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {detailLoading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-lg border bg-card">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : selectedEmployee ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle>
                        {selectedEmployee.firstName} {selectedEmployee.lastName}
                      </CardTitle>
                      <Badge variant={selectedEmployee.isActive ? "default" : "secondary"}>
                        {selectedEmployee.isActive ? "Aktiv" : "Inaktiv"}
                      </Badge>
                      <Badge variant="outline">{selectedEmployee.language.toUpperCase()}</Badge>
                    </div>
                    <CardDescription>
                      {selectedEmployee.employeeId} · {selectedEmployee.department}
                    </CardDescription>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {selectedEmployee.email}
                      </span>
                      <span>Erstellt: {formatDate(selectedEmployee.createdAt)}</span>
                      <span>Aktualisiert: {formatDateTime(selectedEmployee.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={handleDeactivateEmployee} disabled={deactivating}>
                      {deactivating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Deaktivieren
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={savingProfile}>
                      {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Profil speichern
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-lg border p-4">
                    <div className="text-2xl font-bold">{selectedEmployee._count.orders}</div>
                    <div className="text-sm text-muted-foreground">Bestellungen</div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-2xl font-bold">{selectedEmployee._count.feedbacks}</div>
                    <div className="text-sm text-muted-foreground">Feedbacks</div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-2xl font-bold">{selectedEmployee._count.reviews}</div>
                    <div className="text-sm text-muted-foreground">Reviews</div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-2xl font-bold">{selectedEmployee._count.wishlistItems + selectedEmployee._count.favorites}</div>
                    <div className="text-sm text-muted-foreground">Merkliste & Favoriten</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile">Profil</TabsTrigger>
                <TabsTrigger value="orders">Bestellungen</TabsTrigger>
                <TabsTrigger value="addresses">Adressen</TabsTrigger>
                <TabsTrigger value="interactions">Interaktionen</TabsTrigger>
                <TabsTrigger value="wishlist">Merkliste</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Kontaktdaten</CardTitle>
                    <CardDescription>Bearbeite Stammdaten und Benachrichtigungseinstellungen</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="crm-employee-id">Mitarbeiter-Nr.</Label>
                        <Input
                          id="crm-employee-id"
                          value={selectedEmployee.employeeId}
                          onChange={(event) => updateSelectedEmployee("employeeId", event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="crm-email">E-Mail</Label>
                        <Input
                          id="crm-email"
                          type="email"
                          value={selectedEmployee.email}
                          onChange={(event) => updateSelectedEmployee("email", event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="crm-language">Sprache</Label>
                        <Select value={selectedEmployee.language} onValueChange={(value) => updateSelectedEmployee("language", value as Language)}>
                          <SelectTrigger id="crm-language">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="de">Deutsch</SelectItem>
                            <SelectItem value="en">Englisch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="crm-first-name">Vorname</Label>
                        <Input
                          id="crm-first-name"
                          value={selectedEmployee.firstName}
                          onChange={(event) => updateSelectedEmployee("firstName", event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="crm-last-name">Nachname</Label>
                        <Input
                          id="crm-last-name"
                          value={selectedEmployee.lastName}
                          onChange={(event) => updateSelectedEmployee("lastName", event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="crm-department">Bereich</Label>
                        <Input
                          id="crm-department"
                          value={selectedEmployee.department}
                          onChange={(event) => updateSelectedEmployee("department", event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="crm-quota-reset">Kontingent-Reset</Label>
                        <Input
                          id="crm-quota-reset"
                          type="date"
                          value={toDateInputValue(selectedEmployee.quotaResetDate)}
                          onChange={(event) => updateSelectedEmployee("quotaResetDate", event.target.value || null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="crm-password">Neues Passwort</Label>
                        <Input
                          id="crm-password"
                          type="password"
                          value={newPassword}
                          onChange={(event) => setNewPassword(event.target.value)}
                          placeholder="Optional neues Passwort"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <div className="flex h-10 items-center rounded-md border px-3">
                          <Switch
                            checked={selectedEmployee.isActive}
                            onCheckedChange={(checked) => updateSelectedEmployee("isActive", checked)}
                          />
                          <span className="ml-3 text-sm text-muted-foreground">
                            {selectedEmployee.isActive ? "Aktiv" : "Inaktiv"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Benachrichtigungen</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                              <div className="font-medium">Status-Updates</div>
                              <div className="text-sm text-muted-foreground">Benachrichtigungen bei Bestellstatus-Änderungen</div>
                            </div>
                            <Switch
                              checked={selectedEmployee.notifyStatusUpdates}
                              onCheckedChange={(checked) => updateSelectedEmployee("notifyStatusUpdates", checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                              <div className="font-medium">Newsletter</div>
                              <div className="text-sm text-muted-foreground">Marketing- und Shop-Informationen</div>
                            </div>
                            <Switch
                              checked={selectedEmployee.notifyNewsletter}
                              onCheckedChange={(checked) => updateSelectedEmployee("notifyNewsletter", checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                              <div className="font-medium">Wishlist-Verfügbarkeit</div>
                              <div className="text-sm text-muted-foreground">Hinweise bei wieder verfügbarem Bestand</div>
                            </div>
                            <Switch
                              checked={selectedEmployee.notifyWishlistAvailable}
                              onCheckedChange={(checked) => updateSelectedEmployee("notifyWishlistAvailable", checked)}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Firmenbezug</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="rounded-lg border p-3">
                            <div className="text-sm text-muted-foreground">Firma</div>
                            <div className="font-medium">{selectedEmployee.company?.name || "Keine Zuordnung"}</div>
                          </div>
                          <div className="rounded-lg border p-3">
                            <div className="text-sm text-muted-foreground">Rechnungsadresse</div>
                            <div className="font-medium">{selectedEmployee.company?.billingAddress || "-"}</div>
                          </div>
                          <div className="rounded-lg border p-3">
                            <div className="text-sm text-muted-foreground">Zahlungsbedingungen</div>
                            <div className="font-medium">{selectedEmployee.company?.paymentTerms || "-"}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                {selectedEmployee.orders.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">Keine Bestellungen vorhanden</CardContent>
                  </Card>
                ) : (
                  selectedEmployee.orders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <CardTitle className="text-base">{order.orderNumber || order.id}</CardTitle>
                            <CardDescription>
                              {order.customerName} · {formatDateTime(order.createdAt)} · Typ {order.orderType}
                            </CardDescription>
                          </div>
                          <div className="flex min-w-[220px] items-center gap-2">
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleUpdateOrderStatus(order.id, value as OrderStatus)}
                              disabled={savingOrderId === order.id}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {orderStatusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {savingOrderId === order.id ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 xl:grid-cols-3">
                          <div className="rounded-lg border p-3 text-sm">
                            <div className="font-medium">Zahlung</div>
                            <div className="mt-1 text-muted-foreground">{order.privatePaymentStatus || "-"}</div>
                          </div>
                          <div className="rounded-lg border p-3 text-sm">
                            <div className="font-medium">Tracking</div>
                            <div className="mt-1 text-muted-foreground">{order.trackingNumber || "-"}</div>
                          </div>
                          <div className="rounded-lg border p-3 text-sm">
                            <div className="font-medium">Admin-Notizen</div>
                            <div className="mt-1 text-muted-foreground">{order.adminNotes || "-"}</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="rounded-lg border p-3">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <div className="font-medium">{item.product.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Art.-Nr. {item.product.articleNumber || "-"}
                                    {item.supplier ? ` · Lieferant ${item.supplier.companyName}` : ""}
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                  <Badge variant="outline">{item.size}</Badge>
                                  {item.color ? <Badge variant="outline">{item.color}</Badge> : null}
                                  <Badge variant="secondary">x{item.quantity}</Badge>
                                  <Badge variant="outline">{getOrderStatusLabel(item.itemStatus)}</Badge>
                                  <span className="text-muted-foreground">{formatMoney(item.unitPrice)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="addresses" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Neue Adresse</CardTitle>
                    <CardDescription>Lege eine zusätzliche Liefer- oder Firmenadresse an</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Typ</Label>
                        <Select value={newAddress.type} onValueChange={(value) => setNewAddress((current) => ({ ...current, type: value as AddressType }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {addressTypeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Label</Label>
                        <Input value={newAddress.label} onChange={(event) => setNewAddress((current) => ({ ...current, label: event.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Straße</Label>
                        <Input value={newAddress.street} onChange={(event) => setNewAddress((current) => ({ ...current, street: event.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>PLZ</Label>
                        <Input value={newAddress.zip} onChange={(event) => setNewAddress((current) => ({ ...current, zip: event.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Stadt</Label>
                        <Input value={newAddress.city} onChange={(event) => setNewAddress((current) => ({ ...current, city: event.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Land</Label>
                        <Input value={newAddress.country} onChange={(event) => setNewAddress((current) => ({ ...current, country: event.target.value }))} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <div className="font-medium">Als Standardadresse setzen</div>
                        <div className="text-sm text-muted-foreground">Vorhandene Standardadresse wird dabei aufgehoben</div>
                      </div>
                      <Switch
                        checked={newAddress.isDefault}
                        onCheckedChange={(checked) => setNewAddress((current) => ({ ...current, isDefault: checked }))}
                      />
                    </div>
                    <Button onClick={handleCreateAddress} disabled={savingAddress}>
                      {savingAddress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                      Adresse anlegen
                    </Button>
                  </CardContent>
                </Card>

                {selectedEmployee.addresses.length === 0 ? (
                  <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">Keine Adressen vorhanden</CardContent>
                  </Card>
                ) : (
                  selectedEmployee.addresses.map((address) => (
                    <Card key={address.id}>
                      <CardContent className="space-y-4 pt-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{address.label || "Adresse"}</span>
                            <Badge variant="outline">{addressTypeOptions.find((option) => option.value === address.type)?.label}</Badge>
                            {address.isDefault ? <Badge>Standard</Badge> : null}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleSaveAddress(address)} disabled={savingAddress}>
                              Speichern
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteAddress(address.id)} disabled={savingAddress}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          <div className="space-y-2">
                            <Label>Typ</Label>
                            <Select value={address.type} onValueChange={(value) => updateAddressField(address.id, "type", value as AddressType)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {addressTypeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Label</Label>
                            <Input value={address.label || ""} onChange={(event) => updateAddressField(address.id, "label", event.target.value || null)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Straße</Label>
                            <Input value={address.street} onChange={(event) => updateAddressField(address.id, "street", event.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>PLZ</Label>
                            <Input value={address.zip} onChange={(event) => updateAddressField(address.id, "zip", event.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Stadt</Label>
                            <Input value={address.city} onChange={(event) => updateAddressField(address.id, "city", event.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Land</Label>
                            <Input value={address.country} onChange={(event) => updateAddressField(address.id, "country", event.target.value)} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <div className="font-medium">Standardadresse</div>
                            <div className="text-sm text-muted-foreground">Wird beim Mitarbeiter bevorzugt verwendet</div>
                          </div>
                          <Switch checked={address.isDefault} onCheckedChange={(checked) => updateAddressField(address.id, "isDefault", checked)} />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="interactions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Feedback</CardTitle>
                    <CardDescription>Pflege eingehende Rückmeldungen direkt im CRM</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedEmployee.feedbacks.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Kein Feedback vorhanden</div>
                    ) : (
                      selectedEmployee.feedbacks.map((feedback) => (
                        <div key={feedback.id} className="rounded-lg border p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-sm text-muted-foreground">
                              {formatDateTime(feedback.createdAt)}
                              {feedback.orderId ? ` · Bestellung ${feedback.orderId}` : ""}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleSaveFeedback(feedback)} disabled={savingFeedbackId === feedback.id}>
                                {savingFeedbackId === feedback.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Speichern"}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteFeedback(feedback.id)} disabled={savingFeedbackId === feedback.id}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-4 grid gap-4 xl:grid-cols-[120px_1fr]">
                            <div className="space-y-2">
                              <Label>Rating</Label>
                              <Input
                                type="number"
                                min={1}
                                max={5}
                                value={feedback.rating ?? ""}
                                onChange={(event) =>
                                  updateFeedbackField(
                                    feedback.id,
                                    "rating",
                                    event.target.value ? Number(event.target.value) : null,
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Nachricht</Label>
                              <Textarea
                                rows={4}
                                value={feedback.message}
                                onChange={(event) => updateFeedbackField(feedback.id, "message", event.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Bewertungen</CardTitle>
                    <CardDescription>Moderiere Produktbewertungen inklusive Sichtbarkeit</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedEmployee.reviews.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Keine Bewertungen vorhanden</div>
                    ) : (
                      selectedEmployee.reviews.map((review) => (
                        <div key={review.id} className="rounded-lg border p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <div className="font-medium">{review.product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Art.-Nr. {review.product.articleNumber || "-"} · Aktualisiert {formatDateTime(review.updatedAt)}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleSaveReview(review)} disabled={savingReviewId === review.id}>
                                {savingReviewId === review.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Speichern"}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteReview(review.id)} disabled={savingReviewId === review.id}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-4 grid gap-4 xl:grid-cols-[120px_1fr]">
                            <div className="space-y-2">
                              <Label>Rating</Label>
                              <Input
                                type="number"
                                min={1}
                                max={5}
                                value={review.rating}
                                onChange={(event) => updateReviewField(review.id, "rating", Number(event.target.value) || 1)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Kommentar</Label>
                              <Textarea
                                rows={4}
                                value={review.comment || ""}
                                onChange={(event) => updateReviewField(review.id, "comment", event.target.value || null)}
                              />
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between rounded-lg border p-3">
                            <div>
                              <div className="font-medium">Öffentlich sichtbar</div>
                              <div className="text-sm text-muted-foreground">Steuert die Anzeige im Shop</div>
                            </div>
                            <Switch checked={review.isPublic} onCheckedChange={(checked) => updateReviewField(review.id, "isPublic", checked)} />
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="wishlist" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Wunschliste</CardTitle>
                    <CardDescription>Pflege vorgemerkte Artikel, Varianten und Notizen</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedEmployee.wishlistItems.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Keine Wunschlisten-Einträge vorhanden</div>
                    ) : (
                      selectedEmployee.wishlistItems.map((item) => (
                        <div key={item.id} className="rounded-lg border p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <div className="font-medium">{item.product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Art.-Nr. {item.product.articleNumber || "-"} · Erstellt {formatDate(item.createdAt)}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleSaveWishlistItem(item)} disabled={savingWishlistId === item.id}>
                                {savingWishlistId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Speichern"}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteWishlistItem(item.id)} disabled={savingWishlistId === item.id}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            <div className="space-y-2">
                              <Label>Größe</Label>
                              <Input
                                value={item.preferredSize || ""}
                                onChange={(event) => updateWishlistField(item.id, "preferredSize", event.target.value || null)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Farbe</Label>
                              <Input
                                value={item.preferredColor || ""}
                                onChange={(event) => updateWishlistField(item.id, "preferredColor", event.target.value || null)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Benachrichtigt am</Label>
                              <Input value={formatDateTime(item.notifiedAt)} readOnly />
                            </div>
                          </div>
                          <div className="mt-4 space-y-2">
                            <Label>Notizen</Label>
                            <Textarea
                              rows={3}
                              value={item.notes || ""}
                              onChange={(event) => updateWishlistField(item.id, "notes", event.target.value || null)}
                            />
                          </div>
                          <div className="mt-4 flex items-center justify-between rounded-lg border p-3">
                            <div>
                              <div className="font-medium">Bei Verfügbarkeit benachrichtigen</div>
                              <div className="text-sm text-muted-foreground">Steuert automatische Bestands-Mails</div>
                            </div>
                            <Switch
                              checked={item.notifyWhenAvailable}
                              onCheckedChange={(checked) => updateWishlistField(item.id, "notifyWhenAvailable", checked)}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Favoriten</CardTitle>
                    <CardDescription>Im Shop gemerkte Lieblingsprodukte</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedEmployee.favorites.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Keine Favoriten vorhanden</div>
                    ) : (
                      selectedEmployee.favorites.map((favorite) => (
                        <div key={favorite.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="font-medium">{favorite.product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Art.-Nr. {favorite.product.articleNumber || "-"} · Gemerkt am {formatDate(favorite.createdAt)}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteFavorite(favorite.id)}>
                            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                            Entfernen
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <Card>
            <CardContent className="flex min-h-[320px] items-center justify-center text-muted-foreground">
              Bitte links einen Kontakt auswählen
            </CardContent>
          </Card>
        )}
      </div>

        </TabsContent>

        <TabsContent value="texts" className="space-y-6">
          <AdminAppTexts />
        </TabsContent>
      </Tabs>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Neuen Kontakt anlegen</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-crm-employee-id">Mitarbeiter-Nr.</Label>
              <Input
                id="new-crm-employee-id"
                value={newEmployee.employeeId}
                onChange={(event) => setNewEmployee((current) => ({ ...current, employeeId: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-crm-email">E-Mail</Label>
              <Input
                id="new-crm-email"
                type="email"
                value={newEmployee.email}
                onChange={(event) => setNewEmployee((current) => ({ ...current, email: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-crm-first-name">Vorname</Label>
              <Input
                id="new-crm-first-name"
                value={newEmployee.firstName}
                onChange={(event) => setNewEmployee((current) => ({ ...current, firstName: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-crm-last-name">Nachname</Label>
              <Input
                id="new-crm-last-name"
                value={newEmployee.lastName}
                onChange={(event) => setNewEmployee((current) => ({ ...current, lastName: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-crm-department">Bereich</Label>
              <Input
                id="new-crm-department"
                value={newEmployee.department}
                onChange={(event) => setNewEmployee((current) => ({ ...current, department: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Sprache</Label>
              <Select value={newEmployee.language} onValueChange={(value) => setNewEmployee((current) => ({ ...current, language: value as Language }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="en">Englisch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="new-crm-password">Initiales Passwort</Label>
              <Input
                id="new-crm-password"
                type="password"
                value={newEmployee.password}
                onChange={(event) => setNewEmployee((current) => ({ ...current, password: event.target.value }))}
                placeholder="Optional, sonst wird ein Zufallspasswort erzeugt"
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-medium">Aktiv</div>
                <div className="text-sm text-muted-foreground">Kontakt kann sich anmelden und bestellen</div>
              </div>
              <Switch checked={newEmployee.isActive} onCheckedChange={(checked) => setNewEmployee((current) => ({ ...current, isActive: checked }))} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-medium">Status-Updates</div>
                <div className="text-sm text-muted-foreground">E-Mails zu Bestellstatus</div>
              </div>
              <Switch checked={newEmployee.notifyStatusUpdates} onCheckedChange={(checked) => setNewEmployee((current) => ({ ...current, notifyStatusUpdates: checked }))} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-medium">Newsletter</div>
                <div className="text-sm text-muted-foreground">Marketing-Mails erlauben</div>
              </div>
              <Switch checked={newEmployee.notifyNewsletter} onCheckedChange={(checked) => setNewEmployee((current) => ({ ...current, notifyNewsletter: checked }))} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-medium">Wishlist-Benachrichtigungen</div>
                <div className="text-sm text-muted-foreground">Verfügbarkeitsmeldungen aktivieren</div>
              </div>
              <Switch checked={newEmployee.notifyWishlistAvailable} onCheckedChange={(checked) => setNewEmployee((current) => ({ ...current, notifyWishlistAvailable: checked }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCreateEmployee} disabled={creatingEmployee}>
              {creatingEmployee ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Kontakt anlegen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
