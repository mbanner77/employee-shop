import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL"

export interface Product {
  id: string
  name: string
  category: string
  description: string
  image: string
  sizes: Size[]
  color: string
}

export interface CartItem {
  product: Product
  size: Size
}

export interface Order {
  id: string
  items: CartItem[]
  customerName: string
  email: string
  street: string
  city: string
  zip: string
  department: string
  createdAt: string
  status: "pending" | "processing" | "shipped" | "delivered"
}

interface ShopState {
  cart: CartItem[]
  orders: Order[]
  addToCart: (product: Product, size: Size) => boolean
  removeFromCart: (productId: string) => void
  clearCart: () => void
  submitOrder: (customerInfo: Omit<Order, "id" | "items" | "createdAt" | "status">) => Order
  updateOrderStatus: (orderId: string, status: Order["status"]) => void
}

export const products: Product[] = [
  {
    id: "1",
    name: "RealCore Premium Hoodie",
    category: "Hoodies",
    description: "Bequemer Hoodie aus Bio-Baumwolle mit gesticktem RealCore Logo",
    image: "/navy-blue-premium-hoodie-with-company-logo.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Navy",
  },
  {
    id: "2",
    name: "RealCore Classic T-Shirt",
    category: "T-Shirts",
    description: "Klassisches T-Shirt mit RealCore Branding",
    image: "/white-classic-tshirt-with-minimalist-company-logo.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Weiß",
  },
  {
    id: "3",
    name: "RealCore Tech Polo",
    category: "Polos",
    description: "Elegantes Poloshirt für Business und Freizeit",
    image: "/dark-blue-polo-shirt-professional-style.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Dunkelblau",
  },
  {
    id: "4",
    name: "RealCore Softshell Jacke",
    category: "Jacken",
    description: "Wasserabweisende Softshell-Jacke für outdoor Aktivitäten",
    image: "/black-softshell-jacket-modern-style.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Schwarz",
  },
  {
    id: "5",
    name: "RealCore Cap",
    category: "Accessoires",
    description: "Stylische Cap mit gesticktem Logo",
    image: "/navy-baseball-cap-with-embroidered-logo.jpg",
    sizes: ["S", "M", "L"],
    color: "Navy",
  },
  {
    id: "6",
    name: "RealCore Fleece Pullover",
    category: "Pullover",
    description: "Kuscheliger Fleece-Pullover für kalte Tage",
    image: "/gray-fleece-pullover-cozy-warm.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Grau",
  },
  {
    id: "7",
    name: "RealCore Sport Shorts",
    category: "Hosen",
    description: "Atmungsaktive Sport-Shorts für Training und Freizeit",
    image: "/black-athletic-shorts-sporty.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Schwarz",
  },
  {
    id: "8",
    name: "RealCore Beanie",
    category: "Accessoires",
    description: "Warme Strickmütze mit Logo-Patch",
    image: "/charcoal-gray-beanie-hat-knitted.jpg",
    sizes: ["S", "M", "L"],
    color: "Anthrazit",
  },
  {
    id: "9",
    name: "RealCore Zip Hoodie",
    category: "Hoodies",
    description: "Zip-Hoodie mit durchgehendem Reißverschluss",
    image: "/heather-gray-zip-up-hoodie-modern.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Grau Meliert",
  },
  {
    id: "10",
    name: "RealCore Longsleeve",
    category: "T-Shirts",
    description: "Langarm-Shirt aus weicher Baumwolle",
    image: "/black-long-sleeve-shirt-minimalist.jpg",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Schwarz",
  },
]

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      orders: [],
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
      submitOrder: (customerInfo) => {
        const order: Order = {
          id: `ORD-${Date.now()}`,
          items: get().cart,
          ...customerInfo,
          createdAt: new Date().toISOString(),
          status: "pending",
        }
        set({ orders: [...get().orders, order], cart: [] })
        return order
      },
      updateOrderStatus: (orderId, status) => {
        set({
          orders: get().orders.map((order) => (order.id === orderId ? { ...order, status } : order)),
        })
      },
    }),
    {
      name: "realcore-shop",
      skipHydration: true,
    },
  ),
)
