"use client"

import { useEffect, type ReactNode } from "react"
import { useShopStore } from "@/lib/store"

export function ShopProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    useShopStore.persist.rehydrate()
  }, [])

  return <>{children}</>
}
