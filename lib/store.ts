import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL"

export interface Product {
  id: string
  name: string
  category: string
  description: string
  image: string
  images?: string[]
  sizes: string[]
  color: string
  yearlyLimit?: number
  stock?: Record<string, number> | null
  sizeChart?: string | null
}

export interface CartItem {
  product: Product
  size: Size
}

export interface OrderItem {
  id: string
  productId: string
  size: string
  product: Product
}

export interface Order {
  id: string
  items: OrderItem[]
  customerName: string
  email: string
  street: string
  city: string
  zip: string
  department: string
  createdAt: string
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED"
}

interface ShopState {
  cart: CartItem[]
  products: Product[]
  productsLoading: boolean
  favoriteProductIds: string[]
  favoritesLoading: boolean
  addToCart: (product: Product, size: Size) => boolean
  removeFromCart: (productId: string) => void
  clearCart: () => void
  submitOrder: (customerInfo: Omit<Order, "id" | "items" | "createdAt" | "status">) => Promise<Order | null>
  fetchProducts: () => Promise<void>
  fetchFavoriteIds: () => Promise<void>
  addFavoriteLocal: (productId: string) => void
  removeFavoriteLocal: (productId: string) => void
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      products: [],
      productsLoading: true,
      favoriteProductIds: [],
      favoritesLoading: false,
      addToCart: (product, size) => {
        const currentCart = get().cart
        if (currentCart.length >= 4) {
          return false
        }
        if (currentCart.some((item) => item.product.id === product.id)) {
          return false
        }
        set({ cart: [...currentCart, { product, size }] })
        return true
      },
      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((item) => item.product.id !== productId) })
      },
      clearCart: () => set({ cart: [] }),
      addFavoriteLocal: (productId) => {
        const current = get().favoriteProductIds
        if (current.includes(productId)) return
        set({ favoriteProductIds: [...current, productId] })
      },
      removeFavoriteLocal: (productId) => {
        set({ favoriteProductIds: get().favoriteProductIds.filter((id) => id !== productId) })
      },
      submitOrder: async (customerInfo) => {
        const cart = get().cart
        try {
          const response = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...customerInfo,
              items: cart.map((item) => ({
                productId: item.product.id,
                size: item.size,
              })),
            }),
          })
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error("Order creation failed:", response.status, errorData)
            throw new Error(errorData.error || "Failed to create order")
          }
          const order = await response.json()
          set({ cart: [] })
          return order
        } catch (error) {
          console.error("Failed to submit order:", error)
          return null
        }
      },
      fetchProducts: async () => {
        try {
          set({ productsLoading: true })
          const response = await fetch("/api/products")
          if (!response.ok) throw new Error("Failed to fetch products")
          const products = await response.json()
          set({ products, productsLoading: false })
        } catch (error) {
          console.error("Failed to fetch products:", error)
          set({ productsLoading: false })
        }
      },
      fetchFavoriteIds: async () => {
        try {
          set({ favoritesLoading: true })
          const response = await fetch("/api/favorites?idsOnly=1")
          if (response.status === 401) {
            set({ favoriteProductIds: [], favoritesLoading: false })
            return
          }
          if (!response.ok) throw new Error("Failed to fetch favorites")
          const favorites = await response.json()
          const ids = Array.isArray(favorites)
            ? favorites
                .map((f: { productId?: unknown }) => String(f.productId || ""))
                .filter(Boolean)
            : []
          set({ favoriteProductIds: ids, favoritesLoading: false })
        } catch (error) {
          console.error("Failed to fetch favorites:", error)
          set({ favoritesLoading: false })
        }
      },
    }),
    {
      name: "realcore-shop",
      skipHydration: true,
      partialize: (state) => ({ cart: state.cart }),
    },
  ),
)
