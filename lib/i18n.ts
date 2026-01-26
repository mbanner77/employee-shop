export type Language = "de" | "en"

export const translations = {
  de: {
    // Common
    shop: "Mitarbeiter-Shop",
    home: "Startseite",
    myOrders: "Meine Bestellungen",
    cart: "Warenkorb",
    logout: "Abmelden",
    login: "Anmelden",
    register: "Registrieren",
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    back: "Zurück",
    next: "Weiter",
    loading: "Wird geladen...",
    error: "Fehler",
    success: "Erfolg",
    
    // Auth
    email: "E-Mail",
    password: "Passwort",
    confirmPassword: "Passwort bestätigen",
    firstName: "Vorname",
    lastName: "Nachname",
    forgotPassword: "Passwort vergessen?",
    resetPassword: "Passwort zurücksetzen",
    newPassword: "Neues Passwort",
    
    // Products
    products: "Produkte",
    addToCart: "In den Warenkorb",
    selectSize: "Größe wählen",
    sizeChart: "Größentabelle",
    outOfStock: "Nicht auf Lager",
    inStock: "Auf Lager",
    
    // Cart & Checkout
    checkout: "Zur Kasse",
    emptyCart: "Warenkorb ist leer",
    removeFromCart: "Entfernen",
    submitOrder: "Bestellung abschicken",
    orderConfirmation: "Bestellbestätigung",
    orderNumber: "Bestellnummer",
    
    // Order Status
    status: "Status",
    pending: "Ausstehend",
    processing: "In Bearbeitung",
    shipped: "Versendet",
    delivered: "Zugestellt",
    
    // Limits
    yearlyLimit: "Jahreslimit",
    articlesRemaining: "Artikel verbleibend",
    limitReached: "Jahreslimit erreicht",
    
    // Favorites
    favorites: "Favoriten",
    addToFavorites: "Zu Favoriten hinzufügen",
    removeFromFavorites: "Aus Favoriten entfernen",
    
    // Feedback & Reviews
    feedback: "Feedback",
    reviews: "Bewertungen",
    writeReview: "Bewertung schreiben",
    rating: "Bewertung",
    
    // Address
    street: "Straße & Hausnummer",
    city: "Stadt",
    zip: "PLZ",
    department: "Firmenbereich",
  },
  en: {
    // Common
    shop: "Employee Shop",
    home: "Home",
    myOrders: "My Orders",
    cart: "Cart",
    logout: "Logout",
    login: "Login",
    register: "Register",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    next: "Next",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    
    // Auth
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    firstName: "First Name",
    lastName: "Last Name",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    newPassword: "New Password",
    
    // Products
    products: "Products",
    addToCart: "Add to Cart",
    selectSize: "Select Size",
    sizeChart: "Size Chart",
    outOfStock: "Out of Stock",
    inStock: "In Stock",
    
    // Cart & Checkout
    checkout: "Checkout",
    emptyCart: "Cart is empty",
    removeFromCart: "Remove",
    submitOrder: "Submit Order",
    orderConfirmation: "Order Confirmation",
    orderNumber: "Order Number",
    
    // Order Status
    status: "Status",
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    
    // Limits
    yearlyLimit: "Yearly Limit",
    articlesRemaining: "articles remaining",
    limitReached: "Yearly limit reached",
    
    // Favorites
    favorites: "Favorites",
    addToFavorites: "Add to Favorites",
    removeFromFavorites: "Remove from Favorites",
    
    // Feedback & Reviews
    feedback: "Feedback",
    reviews: "Reviews",
    writeReview: "Write Review",
    rating: "Rating",
    
    // Address
    street: "Street & Number",
    city: "City",
    zip: "ZIP Code",
    department: "Department",
  },
}

export type TranslationKey = keyof typeof translations.de

export function t(key: TranslationKey, lang: Language = "de"): string {
  return translations[lang][key] || translations.de[key] || key
}

export function getLanguageFromCookie(): Language {
  if (typeof window === "undefined") return "de"
  const match = document.cookie.match(/language=(\w+)/)
  return (match?.[1] as Language) || "de"
}

export function setLanguageCookie(lang: Language): void {
  if (typeof window === "undefined") return
  document.cookie = `language=${lang}; path=/; max-age=31536000`
}
