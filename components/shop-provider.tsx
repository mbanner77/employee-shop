"use client"

import { useEffect, type ReactNode } from "react"
import { AppTextProvider } from "@/components/app-text-provider"
import { useShopStore } from "@/lib/store"

export function ShopProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    useShopStore.persist.rehydrate()
  }, [])

  return <AppTextProvider>{children}</AppTextProvider>
}
