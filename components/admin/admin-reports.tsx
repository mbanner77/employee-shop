"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Download, Search, FileSpreadsheet, Calendar } from "lucide-react"

interface OrderReport {
  orderId: string
  orderNumber?: string
  orderDate: string
  employeeId: string
  employeeName: string
  employeeEmail: string
  department: string
  productName: string
  productSize: string
  quantity: number
  costBearer: string
  amount: number | null
  status: string
}

export function AdminReports() {
  const [reports, setReports] = useState<OrderReport[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString())

  useEffect(() => {
    fetchReports()
  }, [yearFilter])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports/employee-orders?year=${yearFilter}`)
      if (response.ok) {
        const data = await response.json()
        setReports(data)
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = async () => {
    setExporting(true)
    try {
      const response = await fetch(`/api/reports/employee-orders/export?year=${yearFilter}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `mitarbeiter-bestellungen-${yearFilter}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Failed to export:", error)
    } finally {
      setExporting(false)
    }
  }

  const filteredReports = reports.filter((report) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      report.employeeName.toLowerCase().includes(searchLower) ||
      report.employeeEmail.toLowerCase().includes(searchLower) ||
      report.department.toLowerCase().includes(searchLower) ||
      report.productName.toLowerCase().includes(searchLower) ||
      report.orderId.toLowerCase().includes(searchLower)
    )
  })

  // Generate year options (current year and 2 previous years)
  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear - 1, currentYear - 2]

  // Group by employee for summary
  const employeeSummary = filteredReports.reduce((acc, report) => {
    const key = report.employeeEmail
    if (!acc[key]) {
      acc[key] = {
        employeeName: report.employeeName,
        employeeEmail: report.employeeEmail,
        department: report.department,
        itemCount: 0,
        orders: new Set<string>(),
      }
    }
    acc[key].itemCount++
    acc[key].orders.add(report.orderId)
    return acc
  }, {} as Record<string, { employeeName: string; employeeEmail: string; department: string; itemCount: number; orders: Set<string> }>)

  const summaryArray = Object.values(employeeSummary).sort((a, b) => b.itemCount - a.itemCount)

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
        <h1 className="text-2xl font-bold text-foreground">Auswertungen</h1>
        <p className="text-muted-foreground">Übersicht aller Mitarbeiter-Bestellungen</p>
      </div>

      {/* Filters and Export */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-32">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleExportExcel} disabled={exporting}>
              {exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-2 h-4 w-4" />
              )}
              CSV Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary by Employee */}
      <Card>
        <CardHeader>
          <CardTitle>Zusammenfassung pro Mitarbeiter</CardTitle>
          <CardDescription>
            {summaryArray.length} Mitarbeiter haben im Jahr {yearFilter} bestellt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mitarbeiter</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Firmenbereich</TableHead>
                  <TableHead className="text-center">Bestellungen</TableHead>
                  <TableHead className="text-center">Artikel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaryArray.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Keine Bestellungen gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  summaryArray.map((employee) => (
                    <TableRow key={employee.employeeEmail}>
                      <TableCell className="font-medium">{employee.employeeName}</TableCell>
                      <TableCell>{employee.employeeEmail}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell className="text-center">{employee.orders.size}</TableCell>
                      <TableCell className="text-center">{employee.itemCount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Order List */}
      <Card>
        <CardHeader>
          <CardTitle>Detaillierte Bestellungen</CardTitle>
          <CardDescription>
            {filteredReports.length} Artikel in {yearFilter}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Bestellung</TableHead>
                  <TableHead>Mitarbeiter</TableHead>
                  <TableHead>Firmenbereich</TableHead>
                  <TableHead>Produkt</TableHead>
                  <TableHead>Größe</TableHead>
                  <TableHead className="text-center">Menge</TableHead>
                  <TableHead>Kostenträger</TableHead>
                  <TableHead className="text-right">Betrag (€)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      Keine Bestellungen gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report, index) => (
                    <TableRow key={`${report.orderId}-${index}`}>
                      <TableCell>{new Date(report.orderDate).toLocaleDateString("de-DE")}</TableCell>
                      <TableCell className="font-mono text-xs">{(report.orderNumber || report.orderId).slice(0, 12)}</TableCell>
                      <TableCell>{report.employeeName}</TableCell>
                      <TableCell>{report.department}</TableCell>
                      <TableCell>{report.productName}</TableCell>
                      <TableCell>{report.productSize}</TableCell>
                      <TableCell className="text-center">{report.quantity}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          report.costBearer === "Privat" ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {report.costBearer}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{report.amount != null ? `${report.amount.toFixed(2).replace(".", ",")} €` : "-"}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          report.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                          report.status === "SHIPPED" ? "bg-purple-100 text-purple-800" :
                          report.status === "PROCESSING" ? "bg-blue-100 text-blue-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {report.status === "DELIVERED" ? "Zugestellt" :
                           report.status === "SHIPPED" ? "Versendet" :
                           report.status === "PROCESSING" ? "In Bearbeitung" :
                           "Ausstehend"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
