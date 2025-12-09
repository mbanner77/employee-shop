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
  addToCart: (product: Product, size: Size) => boolean
  removeFromCart: (productId: string) => void
  clearCart: () => void
  submitOrder: (customerInfo: Omit<Order, "id" | "items" | "createdAt" | "status">) => Promise<Order | null>
  fetchProducts: () => Promise<void>
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      products: [],
      productsLoading: true,
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
          if (!response.ok) throw new Error("Failed to create order")
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
    }),
    {
      name: "realcore-shop",
      skipHydration: true,
      partialize: (state) => ({ cart: state.cart }),
    },
  ),
)
