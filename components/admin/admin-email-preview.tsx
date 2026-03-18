"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, Mail, Eye } from "lucide-react"

interface EmailTemplate {
  id: string
  subject: string
}

export function AdminEmailPreview() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [previewHtml, setPreviewHtml] = useState<string>("")
  const [previewSubject, setPreviewSubject] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [loadingPreview, setLoadingPreview] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/admin/email-preview")
      if (res.ok) {
        const data = await res.json()
        setTemplates(data)
        if (data.length > 0) {
          setSelectedTemplate(data[0].id)
          loadPreview(data[0].id)
        }
      }
    } catch (error) {
      console.error("Failed to fetch email templates:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadPreview = async (templateId: string) => {
    setLoadingPreview(true)
    try {
      const res = await fetch(`/api/admin/email-preview?template=${templateId}`)
      if (res.ok) {
        const data = await res.json()
        setPreviewHtml(data.html)
        setPreviewSubject(data.subject)
      }
    } catch (error) {
      console.error("Failed to load preview:", error)
    } finally {
      setLoadingPreview(false)
    }
  }

  const templateLabels: Record<string, string> = {
    "order-status": "Statusänderung",
    "review-request": "Bewertungsanfrage",
    "new-order-admin": "Neue Bestellung (Admin)",
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Mail className="h-5 w-5" />
          E-Mail Vorschau
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vorlage auswählen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Select
              value={selectedTemplate}
              onValueChange={(value) => {
                setSelectedTemplate(value)
                loadPreview(value)
              }}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Vorlage wählen..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {templateLabels[t.id] || t.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {previewSubject && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Betreff</p>
              <p className="font-medium text-sm">{previewSubject}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {loadingPreview ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : previewHtml ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Vorschau
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden bg-white">
              <iframe
                srcDoc={previewHtml}
                className="w-full min-h-[600px] border-0"
                title="E-Mail Vorschau"
                sandbox=""
              />
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
