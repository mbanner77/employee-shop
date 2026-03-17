import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Size = string
export type CostBearer = "COMPANY" | "EMPLOYEE"

export interface Product {
  id: string
  name: string
  category: string
  description: string
  image: string
  images?: string[]
  sizes: string[]
  color: string
  colors?: string[]
  price?: number | string | null
  yearlyLimit?: number
  multipleOrdersAllowed?: boolean
  maxQuantityPerOrder?: number
  stock?: Record<string, number> | null
  minStock?: number | null
  sizeChart?: string | null
}

export interface CartItem {
  id: string
  product: Product
  size: Size
  color?: string
  costBearer: CostBearer
  quantity: number
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
  addToCart: (product: Product, size: Size, options?: { color?: string; costBearer?: CostBearer }) => boolean
  removeFromCart: (cartItemId: string) => void
  updateCartItemQuantity: (cartItemId: string, quantity: number) => void
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
      addToCart: (product, size, options) => {
        const currentCart = get().cart
        const color = options?.color || product.colors?.[0] || product.color || undefined
        const costBearer = options?.costBearer || "COMPANY"
        const maxQuantityPerProduct = product.multipleOrdersAllowed === false
          ? 1
          : Math.max(1, product.maxQuantityPerOrder ?? 2)
        const totalQuantityForProduct = currentCart
          .filter((item) => item.product.id === product.id)
          .reduce((sum, item) => sum + item.quantity, 0)

        if (totalQuantityForProduct >= maxQuantityPerProduct) {
          return false
        }

        const existingIndex = currentCart.findIndex(
          (item) =>
            item.product.id === product.id &&
            item.size === size &&
            (item.color || "") === (color || "") &&
            item.costBearer === costBearer,
        )

        if (existingIndex >= 0) {
          const nextCart = [...currentCart]
          nextCart[existingIndex] = {
            ...nextCart[existingIndex],
            quantity: nextCart[existingIndex].quantity + 1,
          }
          set({ cart: nextCart })
          return true
        }

        const cartItemId = `${product.id}-${size}-${color || "default"}-${costBearer}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        set({
          cart: [
            ...currentCart,
            {
              id: cartItemId,
              product,
              size,
              color,
              costBearer,
              quantity: 1,
            },
          ],
        })
        return true
      },
      removeFromCart: (cartItemId) => {
        set({ cart: get().cart.filter((item) => item.id !== cartItemId) })
      },
      updateCartItemQuantity: (cartItemId, quantity) => {
        const currentCart = get().cart
        const targetItem = currentCart.find((item) => item.id === cartItemId)
        if (!targetItem) return

        if (quantity <= 0) {
          set({ cart: currentCart.filter((item) => item.id !== cartItemId) })
          return
        }

        const maxQuantityPerProduct = targetItem.product.multipleOrdersAllowed === false
          ? 1
          : Math.max(1, targetItem.product.maxQuantityPerOrder ?? 2)

        const totalOtherQuantity = currentCart
          .filter((item) => item.product.id === targetItem.product.id && item.id !== cartItemId)
          .reduce((sum, item) => sum + item.quantity, 0)

        const nextQuantity = Math.min(quantity, Math.max(1, maxQuantityPerProduct - totalOtherQuantity))

        set({
          cart: currentCart.map((item) =>
            item.id === cartItemId
              ? { ...item, quantity: nextQuantity }
              : item,
          ),
        })
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
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...customerInfo,
            items: cart.map((item) => ({
              productId: item.product.id,
              size: item.size,
              color: item.color,
              costBearer: item.costBearer,
              quantity: item.quantity,
            })),
          }),
        })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("Order creation failed:", response.status, errorData)
          throw new Error(errorData.error || "Bestellung konnte nicht erstellt werden")
        }
        const order = await response.json()
        set({ cart: [] })
        return order
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
