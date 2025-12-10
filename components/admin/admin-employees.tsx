"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Loader2, Search, Users, ShoppingBag, Eye, UserX, UserCheck, 
  ChevronDown, ChevronUp, Mail, Building, Hash 
} from "lucide-react"

interface Employee {
  id: string
  employeeId: string
  email: string
  firstName: string
  lastName: string
  department: string
  isActive: boolean
  createdAt: string
  _count: {
    orders: number
  }
}

interface OrderItem {
  id: string
  size: string
  product: {
    id: string
    name: string
    category: string
    image: string
  }
}

interface Order {
  id: string
  status: string
  createdAt: string
  items: OrderItem[]
}

interface EmployeeDetail extends Employee {
  orders: Order[]
}

export function AdminEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees")
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployeeDetail = async (id: string) => {
    setDetailLoading(true)
    try {
      const response = await fetch(`/api/employees/${id}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedEmployee(data)
      }
    } catch (error) {
      console.error("Failed to fetch employee detail:", error)
    } finally {
      setDetailLoading(false)
    }
  }

  const toggleEmployeeStatus = async (employee: Employee) => {
    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !employee.isActive }),
      })
      if (response.ok) {
        fetchEmployees()
      }
    } catch (error) {
      console.error("Failed to update employee:", error)
    }
  }

  const filteredEmployees = employees.filter((emp) =>
    emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusLabels: Record<string, string> = {
    PENDING: "Ausstehend",
    PROCESSING: "In Bearbeitung",
    SHIPPED: "Versendet",
    DELIVERED: "Zugestellt",
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mitarbeiter</h1>
        <p className="text-muted-foreground">Übersicht aller registrierten Mitarbeiter und deren Bestellungen</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{employees.length}</div>
                <div className="text-sm text-muted-foreground">Registrierte Mitarbeiter</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{employees.filter(e => e.isActive).length}</div>
                <div className="text-sm text-muted-foreground">Aktive Mitarbeiter</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{employees.reduce((sum, e) => sum + e._count.orders, 0)}</div>
                <div className="text-sm text-muted-foreground">Gesamte Bestellungen</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Mitarbeiter suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Employee List */}
      <div className="space-y-3">
        {filteredEmployees.length === 0 ? (
          <Card>
            <CardContent className="flex h-32 items-center justify-center">
              <p className="text-muted-foreground">Keine Mitarbeiter gefunden</p>
            </CardContent>
          </Card>
        ) : (
          filteredEmployees.map((employee) => (
            <Card key={employee.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {employee.firstName[0]}{employee.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{employee.firstName} {employee.lastName}</span>
                        <Badge variant={employee.isActive ? "default" : "secondary"}>
                          {employee.isActive ? "Aktiv" : "Inaktiv"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {employee.employeeId}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {employee.department}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <ShoppingBag className="h-3 w-3" />
                      {employee._count.orders} Bestellungen
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => fetchEmployeeDetail(employee.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleEmployeeStatus(employee)}
                    >
                      {employee.isActive ? (
                        <UserX className="h-4 w-4 text-destructive" />
                      ) : (
                        <UserCheck className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Employee Detail Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEmployee?.firstName} {selectedEmployee?.lastName}
            </DialogTitle>
          </DialogHeader>
          
          {detailLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : selectedEmployee ? (
            <div className="space-y-6">
              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Personalnummer:</span>
                  <span className="ml-2 font-medium">{selectedEmployee.employeeId}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">E-Mail:</span>
                  <span className="ml-2 font-medium">{selectedEmployee.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Abteilung:</span>
                  <span className="ml-2 font-medium">{selectedEmployee.department}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={selectedEmployee.isActive ? "default" : "secondary"} className="ml-2">
                    {selectedEmployee.isActive ? "Aktiv" : "Inaktiv"}
                  </Badge>
                </div>
              </div>

              {/* Orders */}
              <div>
                <h3 className="font-semibold mb-3">Bestellungen ({selectedEmployee.orders.length})</h3>
                {selectedEmployee.orders.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Keine Bestellungen vorhanden</p>
                ) : (
                  <div className="space-y-2">
                    {selectedEmployee.orders.map((order) => (
                      <Card key={order.id}>
                        <CardHeader 
                          className="py-3 cursor-pointer"
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-sm font-mono">{order.id.slice(0, 8)}...</CardTitle>
                              <Badge variant="outline">{statusLabels[order.status] || order.status}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString("de-DE")}
                              </span>
                              {expandedOrder === order.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        {expandedOrder === order.id && (
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between bg-muted p-2 rounded">
                                  <span>{item.product.name}</span>
                                  <Badge variant="secondary">{item.size}</Badge>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
