"use client"

import { AdminAppTexts } from "@/components/admin/admin-app-texts"
import { AdminSettings } from "@/components/admin/admin-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AdminCms() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="texts" className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">CMS & Einstellungen</h1>
            <p className="text-muted-foreground">
              Pflege zentrale Texte, Shop-Konfiguration, Firmenbereiche und Integrationen an einer Stelle.
            </p>
          </div>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="texts">App-Texte</TabsTrigger>
            <TabsTrigger value="settings">Shop & Integrationen</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="texts" className="space-y-6">
          <AdminAppTexts />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <AdminSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
