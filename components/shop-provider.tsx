"use client"

import { useEffect, type ReactNode } from "react"
import { AppTextProvider } from "@/components/app-text-provider"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { useShopStore } from "@/lib/store"

export function ShopProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    useShopStore.persist.rehydrate()
  }, [])

  return (
    <AppTextProvider>
      <Breadcrumbs />
      {children}
    </AppTextProvider>
  )
}
