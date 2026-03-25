import { type Language } from "@/lib/i18n"

export const appTextSections = {
  auth: "Login & Registrierung",
  header: "Header & Navigation",
  home: "Startseite",
  hero: "Hero-Bereich",
  products: "Produkte & Kollektion",
  cart: "Warenkorb",
  checkout: "Checkout & Bestellung",
  favorites: "Favoriten",
  feedback: "Feedback",
  orders: "Bestellungen",
  orderConfirmation: "Bestellbestätigung",
  profile: "Profil",
  resetPassword: "Passwort zurücksetzen",
  supplier: "Lieferantenportal",
  wishlist: "Wunschliste",
} as const

export type AppTextSection = keyof typeof appTextSections

type AppTextDefinition = {
  section: AppTextSection
  label: string
  values: Record<Language, string>
}

export const appTextDefinitions = {
  "header.nav.collection": {
    section: "header",
    label: "Header: Kollektion",
    values: { de: "Kollektion", en: "Collection" },
  },
  "header.nav.order": {
    section: "header",
    label: "Header: Bestellung",
    values: { de: "Bestellung", en: "Order" },
  },
  "header.nav.favorites": {
    section: "header",
    label: "Header: Favoriten",
    values: { de: "Favoriten", en: "Favorites" },
  },
  "header.nav.orders": {
    section: "header",
    label: "Header: Bestellungen",
    values: { de: "Bestellungen", en: "Orders" },
  },
  "header.nav.feedback": {
    section: "header",
    label: "Header: Feedback",
    values: { de: "Feedback", en: "Feedback" },
  },
  "header.mobile.menuTitle": {
    section: "header",
    label: "Mobiles Menü: Titel",
    values: { de: "Menü", en: "Menu" },
  },
  "header.mobile.profile": {
    section: "header",
    label: "Mobiles Menü: Profil",
    values: { de: "Mein Profil", en: "My Profile" },
  },
  "header.mobile.admin": {
    section: "header",
    label: "Mobiles Menü: Admin",
    values: { de: "Admin Dashboard", en: "Admin Dashboard" },
  },
  "header.cart.srOnly": {
    section: "header",
    label: "Screenreader: Warenkorb",
    values: { de: "Warenkorb", en: "Cart" },
  },
  "header.menu.open": {
    section: "header",
    label: "Screenreader: Menü öffnen",
    values: { de: "Menü öffnen", en: "Open menu" },
  },
  "header.language.switch": {
    section: "header",
    label: "Screenreader: Sprache wechseln",
    values: { de: "Sprache wechseln", en: "Switch language" },
  },
  "header.language.de": {
    section: "header",
    label: "Sprachumschalter: Deutsch",
    values: { de: "🇩🇪 Deutsch", en: "🇩🇪 German" },
  },
  "header.language.en": {
    section: "header",
    label: "Sprachumschalter: Englisch",
    values: { de: "🇬🇧 English", en: "🇬🇧 English" },
  },
  "home.loading": {
    section: "home",
    label: "Startseite: Laden",
    values: { de: "Laden...", en: "Loading..." },
  },
  "home.welcome": {
    section: "home",
    label: "Willkommensbanner",
    values: { de: "Willkommen, {firstName} {lastName} ({department})", en: "Welcome, {firstName} {lastName} ({department})" },
  },
  "home.ordersLink": {
    section: "home",
    label: "Willkommensbanner: Bestellungen",
    values: { de: "Meine Bestellungen", en: "My Orders" },
  },
  "home.logout": {
    section: "home",
    label: "Willkommensbanner: Abmelden",
    values: { de: "Abmelden", en: "Logout" },
  },
  "home.feature.free.title": {
    section: "home",
    label: "USP: Gratis-Titel",
    values: { de: "4 Teile Gratis", en: "4 Free Items" },
  },
  "home.feature.free.description": {
    section: "home",
    label: "USP: Gratis-Beschreibung",
    values: { de: "Jedes Jahr 4 Artikel kostenfrei für dich", en: "4 items free of charge for you every year" },
  },
  "home.feature.shipping.title": {
    section: "home",
    label: "USP: Lieferung-Titel",
    values: { de: "Direkte Lieferung", en: "Direct Delivery" },
  },
  "home.feature.shipping.description": {
    section: "home",
    label: "USP: Lieferung-Beschreibung",
    values: { de: "Versand an deine Wunschadresse", en: "Shipping to your preferred address" },
  },
  "home.feature.quality.title": {
    section: "home",
    label: "USP: Qualität-Titel",
    values: { de: "Premium Qualität", en: "Premium Quality" },
  },
  "home.feature.quality.description": {
    section: "home",
    label: "USP: Qualität-Beschreibung",
    values: { de: "Hochwertige Materialien & Verarbeitung", en: "Premium materials & craftsmanship" },
  },
  "home.footer.copyright": {
    section: "home",
    label: "Footer: Copyright",
    values: { de: "© 2025 RealCore GmbH. Alle Rechte vorbehalten.", en: "© 2025 RealCore GmbH. All rights reserved." },
  },
  "home.footer.help": {
    section: "home",
    label: "Footer: Hilfe",
    values: { de: "Bei Fragen wende dich an deine HR-Abteilung.", en: "If you have any questions, please contact your HR department." },
  },
  "home.footer.admin": {
    section: "home",
    label: "Footer: Adminbereich",
    values: { de: "Adminbereich", en: "Admin Area" },
  },
  "home.footer.supplier": {
    section: "home",
    label: "Footer: Lieferantenportal",
    values: { de: "Lieferantenportal", en: "Supplier Portal" },
  },
  "hero.badge": {
    section: "hero",
    label: "Hero: Badge",
    values: { de: "Kollektion 2025", en: "Collection 2025" },
  },
  "hero.title.prefix": {
    section: "hero",
    label: "Hero: Titel Prefix",
    values: { de: "Deine", en: "Your" },
  },
  "hero.title.highlight": {
    section: "hero",
    label: "Hero: Titel Highlight",
    values: { de: "Mitarbeiter", en: "Employee" },
  },
  "hero.title.suffix": {
    section: "hero",
    label: "Hero: Titel Suffix",
    values: { de: "kollektion", en: "collection" },
  },
  "hero.subtitle": {
    section: "hero",
    label: "Hero: Untertitel",
    values: {
      de: "Wähle 4 Teile aus unserer exklusiven Kollektion.\nKostenlos für alle RealCore Mitarbeiter.",
      en: "Choose 4 items from our exclusive collection.\nFree for all RealCore employees.",
    },
  },
  "hero.cta": {
    section: "hero",
    label: "Hero: CTA",
    values: { de: "Kollektion entdecken", en: "Discover Collection" },
  },
  "cartIndicator.selected": {
    section: "cart",
    label: "Warenkorb-Indikator",
    values: { de: "{count} von 4 ausgewählt", en: "{count} of 4 selected" },
  },
  "cartIndicator.complete": {
    section: "cart",
    label: "Warenkorb-Indikator: Komplett",
    values: { de: "Komplett", en: "Complete" },
  },
  "productGrid.eyebrow": {
    section: "products",
    label: "Kollektion: Eyebrow",
    values: { de: "Exklusive Auswahl", en: "Exclusive Selection" },
  },
  "productGrid.title": {
    section: "products",
    label: "Kollektion: Titel",
    values: { de: "Unsere Kollektion", en: "Our Collection" },
  },
  "productGrid.description": {
    section: "products",
    label: "Kollektion: Beschreibung",
    values: {
      de: "Hochwertige Kleidung mit RealCore Branding. Wähle deine Favoriten aus {count} verfügbaren Artikeln.",
      en: "Premium apparel with RealCore branding. Choose your favorites from {count} available items.",
    },
  },
  "productGrid.searchPlaceholder": {
    section: "products",
    label: "Kollektion: Suchfeld",
    values: { de: "Produkte suchen...", en: "Search products..." },
  },
  "productGrid.results": {
    section: "products",
    label: "Kollektion: Trefferanzahl",
    values: { de: "{count} Artikel gefunden", en: "{count} items found" },
  },
  "productGrid.resultsWithQuery": {
    section: "products",
    label: "Kollektion: Trefferanzahl mit Suche",
    values: { de: "{count} Artikel gefunden für \"{query}\"", en: "{count} items found for \"{query}\"" },
  },
  "productGrid.reset": {
    section: "products",
    label: "Kollektion: Filter zurücksetzen",
    values: { de: "Filter zurücksetzen", en: "Reset filters" },
  },
  "productGrid.emptyTitle": {
    section: "products",
    label: "Kollektion: Leerer Zustand Titel",
    values: { de: "Keine Produkte gefunden", en: "No products found" },
  },
  "productGrid.emptyDescription": {
    section: "products",
    label: "Kollektion: Leerer Zustand Beschreibung",
    values: { de: "Versuche einen anderen Suchbegriff oder wähle eine andere Kategorie.", en: "Try another search term or choose a different category." },
  },
  "productGrid.showAll": {
    section: "products",
    label: "Kollektion: Alle Produkte anzeigen",
    values: { de: "Alle Produkte anzeigen", en: "Show all products" },
  },
  "productGrid.category.all": {
    section: "products",
    label: "Kategorie: Alle",
    values: { de: "Alle", en: "All" },
  },
  "productGrid.category.hoodies": {
    section: "products",
    label: "Kategorie: Hoodies",
    values: { de: "Hoodies", en: "Hoodies" },
  },
  "productGrid.category.tshirts": {
    section: "products",
    label: "Kategorie: T-Shirts",
    values: { de: "T-Shirts", en: "T-Shirts" },
  },
  "productGrid.category.polos": {
    section: "products",
    label: "Kategorie: Polos",
    values: { de: "Polos", en: "Polos" },
  },
  "productGrid.category.jackets": {
    section: "products",
    label: "Kategorie: Jacken",
    values: { de: "Jacken", en: "Jackets" },
  },
  "productGrid.category.sweaters": {
    section: "products",
    label: "Kategorie: Pullover",
    values: { de: "Pullover", en: "Sweaters" },
  },
  "productGrid.category.pants": {
    section: "products",
    label: "Kategorie: Hosen",
    values: { de: "Hosen", en: "Pants" },
  },
  "productGrid.category.accessories": {
    section: "products",
    label: "Kategorie: Accessoires",
    values: { de: "Accessoires", en: "Accessories" },
  },
  "productCard.selectSize": {
    section: "products",
    label: "Produktkarte: Größe wählen",
    values: { de: "Bitte wähle eine Größe aus", en: "Please select a size" },
  },
  "productCard.selectColor": {
    section: "products",
    label: "Produktkarte: Farbe wählen",
    values: { de: "Bitte wähle eine Farbe aus", en: "Please select a color" },
  },
  "productCard.maxQuantity": {
    section: "products",
    label: "Produktkarte: Maximalmenge",
    values: { de: "Maximal {count}x pro Artikel", en: "Maximum {count}x per item" },
  },
  "productCard.added": {
    section: "products",
    label: "Produktkarte: Hinzugefügt",
    values: { de: "Hinzugefügt!", en: "Added!" },
  },
  "productCard.quantityIncreased": {
    section: "products",
    label: "Produktkarte: Menge erhöht",
    values: { de: "Menge erhöht!", en: "Quantity increased!" },
  },
  "productCard.favoriteAdd": {
    section: "products",
    label: "Produktkarte: Favorit hinzufügen",
    values: { de: "Zu Favoriten hinzufügen", en: "Add to favorites" },
  },
  "productCard.favoriteRemove": {
    section: "products",
    label: "Produktkarte: Favorit entfernen",
    values: { de: "Von Favoriten entfernen", en: "Remove from favorites" },
  },
  "productCard.prevImage": {
    section: "products",
    label: "Produktkarte: Vorheriges Bild",
    values: { de: "Vorheriges Bild", en: "Previous image" },
  },
  "productCard.nextImage": {
    section: "products",
    label: "Produktkarte: Nächstes Bild",
    values: { de: "Nächstes Bild", en: "Next image" },
  },
  "productCard.imageLabel": {
    section: "products",
    label: "Produktkarte: Bild-Label",
    values: { de: "Bild {index} anzeigen", en: "Show image {index}" },
  },
  "productCard.moreDetails": {
    section: "products",
    label: "Produktkarte: Mehr Details Link",
    values: { de: "Mehr Details →", en: "More details →" },
  },
  "productCard.sizeChart": {
    section: "products",
    label: "Produktkarte: Größentabelle",
    values: { de: "Größentabelle", en: "Size chart" },
  },
  "productCard.inStock": {
    section: "products",
    label: "Produktkarte: Auf Lager",
    values: { de: "Auf Lager", en: "In stock" },
  },
  "productCard.lowStock": {
    section: "products",
    label: "Produktkarte: Wenig Lager",
    values: { de: "Nur noch {count} verfügbar", en: "Only {count} left" },
  },
  "productCard.outOfStock": {
    section: "products",
    label: "Produktkarte: Nicht verfügbar",
    values: { de: "Nicht verfügbar", en: "Unavailable" },
  },
  "productCard.privatePrice": {
    section: "products",
    label: "Produktkarte: Privatpreis",
    values: { de: "Privatpreis: {price} €", en: "Private price: {price} €" },
  },
  "productCard.color": {
    section: "products",
    label: "Produktkarte: Farbe",
    values: { de: "Farbe: {color}", en: "Color: {color}" },
  },
  "productCard.orderTypePlaceholder": {
    section: "products",
    label: "Produktkarte: Bestellart wählen",
    values: { de: "Bestellart wählen", en: "Choose order type" },
  },
  "productCard.orderTypeCompany": {
    section: "products",
    label: "Produktkarte: Bestellart Firma",
    values: { de: "Firma", en: "Company" },
  },
  "productCard.orderTypePrivate": {
    section: "products",
    label: "Produktkarte: Bestellart Privat",
    values: { de: "Privat", en: "Private" },
  },
  "productCard.addToCart": {
    section: "products",
    label: "Produktkarte: In den Warenkorb",
    values: { de: "In den Warenkorb", en: "Add to cart" },
  },
  "productCard.inCartSummary": {
    section: "products",
    label: "Produktkarte: Menge im Warenkorb",
    values: { de: "{count} von {max} dieses Artikels im Warenkorb", en: "{count} of {max} of this item in cart" },
  },
  "reviews.trigger": {
    section: "products",
    label: "Bewertungen: Trigger",
    values: { de: "Bewerten", en: "Rate" },
  },
  "reviews.dialogTitle": {
    section: "products",
    label: "Bewertungen: Dialogtitel",
    values: { de: "Bewertungen für {productName}", en: "Reviews for {productName}" },
  },
  "reviews.summary": {
    section: "products",
    label: "Bewertungen: Zusammenfassung",
    values: { de: "{count} Bewertungen", en: "{count} reviews" },
  },
  "reviews.yourReview": {
    section: "products",
    label: "Bewertungen: Eigene Bewertung",
    values: { de: "Deine Bewertung", en: "Your review" },
  },
  "reviews.commentPlaceholder": {
    section: "products",
    label: "Bewertungen: Kommentar Platzhalter",
    values: { de: "Optionaler Kommentar...", en: "Optional comment..." },
  },
  "reviews.submitLoading": {
    section: "products",
    label: "Bewertungen: Senden lädt",
    values: { de: "Wird gesendet...", en: "Submitting..." },
  },
  "reviews.submit": {
    section: "products",
    label: "Bewertungen: Absenden",
    values: { de: "Bewertung abgeben", en: "Submit review" },
  },
  "reviews.success": {
    section: "products",
    label: "Bewertungen: Erfolg",
    values: { de: "Danke für deine Bewertung!", en: "Thanks for your review!" },
  },
  "reviews.none": {
    section: "products",
    label: "Bewertungen: Keine Bewertungen",
    values: { de: "Noch keine Bewertungen. Sei der Erste!", en: "No reviews yet. Be the first!" },
  },
  "reviews.authRequired": {
    section: "products",
    label: "Bewertungen: Login erforderlich",
    values: { de: "Bitte melde dich an, um zu bewerten", en: "Please sign in to leave a review" },
  },
  "reviews.submitError": {
    section: "products",
    label: "Bewertungen: Sende-Fehler",
    values: { de: "Fehler beim Absenden", en: "Failed to submit review" },
  },
  "reviews.networkError": {
    section: "products",
    label: "Bewertungen: Netzwerkfehler",
    values: { de: "Netzwerkfehler", en: "Network error" },
  },
  "topRated.title": {
    section: "products",
    label: "Top-Produkte: Titel",
    values: { de: "Top bewertete Produkte", en: "Top Rated Products" },
  },
  "topRated.description": {
    section: "products",
    label: "Top-Produkte: Beschreibung",
    values: { de: "Von unseren Mitarbeitern empfohlen", en: "Recommended by our employees" },
  },
  "cartSummary.emptyTitle": {
    section: "cart",
    label: "Warenkorb: Leer Titel",
    values: { de: "Dein Warenkorb ist leer", en: "Your cart is empty" },
  },
  "cartSummary.emptyDescription": {
    section: "cart",
    label: "Warenkorb: Leer Beschreibung",
    values: { de: "Wähle bis zu {maxItems} Firmenartikel oder beliebig viele Privatartikel aus der Kollektion", en: "Choose up to {maxItems} company items or any number of private items from the collection" },
  },
  "cartSummary.continue": {
    section: "cart",
    label: "Warenkorb: Weiter einkaufen",
    values: { de: "Weiter einkaufen", en: "Continue shopping" },
  },
  "cartSummary.count": {
    section: "cart",
    label: "Warenkorb: Anzahl",
    values: { de: "{count} Artikel im Warenkorb", en: "{count} items in cart" },
  },
  "cartSummary.breakdown": {
    section: "cart",
    label: "Warenkorb: Breakdown",
    values: { de: "Firma: {companyCount} von {maxItems} | Privat: {privateCount}", en: "Company: {companyCount} of {maxItems} | Private: {privateCount}" },
  },
  "cartSummary.remaining": {
    section: "cart",
    label: "Warenkorb: Restkontingent",
    values: { de: "Noch {count} Firmenartikel frei", en: "{count} company items left" },
  },
  "cartSummary.limitReached": {
    section: "cart",
    label: "Warenkorb: Limit erreicht",
    values: { de: "Firmenlimit erreicht", en: "Company limit reached" },
  },
  "cartSummary.size": {
    section: "cart",
    label: "Warenkorb: Größe",
    values: { de: "Größe: {size}", en: "Size: {size}" },
  },
  "cartSummary.color": {
    section: "cart",
    label: "Warenkorb: Farbe",
    values: { de: "Farbe: {color}", en: "Color: {color}" },
  },
  "cartSummary.costCompany": {
    section: "cart",
    label: "Warenkorb: Kostenträger Firma",
    values: { de: "FIRMA", en: "COMPANY" },
  },
  "cartSummary.costPrivate": {
    section: "cart",
    label: "Warenkorb: Kostenträger Privat",
    values: { de: "PRIVAT", en: "PRIVATE" },
  },
  "checkoutPage.title": {
    section: "checkout",
    label: "Checkout: Titel",
    values: { de: "Deine Bestellung", en: "Your Order" },
  },
  "checkoutPage.description": {
    section: "checkout",
    label: "Checkout: Beschreibung",
    values: { de: "Überprüfe deine Auswahl und gib deine Lieferadresse ein", en: "Review your selection and enter your delivery address" },
  },
  "checkoutPage.selectedItems": {
    section: "checkout",
    label: "Checkout: Ausgewählte Artikel",
    values: { de: "Ausgewählte Artikel", en: "Selected Items" },
  },
  "checkoutPage.address": {
    section: "checkout",
    label: "Checkout: Lieferadresse",
    values: { de: "Lieferadresse", en: "Delivery Address" },
  },
  "checkoutForm.selectItemError": {
    section: "checkout",
    label: "Checkout: Mindestens ein Artikel",
    values: { de: "Bitte wähle mindestens einen Artikel aus", en: "Please select at least one item" },
  },
  "checkoutForm.completeFieldsError": {
    section: "checkout",
    label: "Checkout: Alle Felder ausfüllen",
    values: { de: "Bitte fülle alle Felder aus", en: "Please fill in all fields" },
  },
  "checkoutForm.remainingCompanyError": {
    section: "checkout",
    label: "Checkout: Restkontingent Fehler",
    values: {
      de: "Du hast nur noch {count} Firmenartikel verfügbar. Private Artikel sind weiterhin möglich.",
      en: "You only have {count} company items remaining. Private items are still possible.",
    },
  },
  "checkoutForm.disclaimerError": {
    section: "checkout",
    label: "Checkout: Hinweise bestätigen",
    values: { de: "Bitte bestätige die Hinweise zur Bestellung", en: "Please confirm the order notes" },
  },
  "checkoutForm.success": {
    section: "checkout",
    label: "Checkout: Erfolg",
    values: { de: "Bestellung erfolgreich aufgegeben!", en: "Order placed successfully!" },
  },
  "checkoutForm.submitError": {
    section: "checkout",
    label: "Checkout: Senden fehlgeschlagen",
    values: { de: "Bestellung konnte nicht aufgegeben werden. Bitte versuche es erneut.", en: "Order could not be placed. Please try again." },
  },
  "checkoutForm.genericError": {
    section: "checkout",
    label: "Checkout: Allgemeiner Fehler",
    values: { de: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.", en: "An error occurred. Please try again." },
  },
  "checkoutForm.remainingCompanyInfo": {
    section: "checkout",
    label: "Checkout: Restkontingent Info",
    values: { de: "Noch {remaining} von {max} Firmenartikeln kostenlos verfügbar", en: "{remaining} of {max} company items still available free of charge" },
  },
  "checkoutForm.limitReached": {
    section: "checkout",
    label: "Checkout: Jahreslimit erreicht",
    values: { de: "Jahreslimit erreicht", en: "Annual limit reached" },
  },
  "checkoutForm.orderedItemsInfo": {
    section: "checkout",
    label: "Checkout: Bereits bestellt Info",
    values: { de: "Bereits bestellt: {ordered} Firmenartikel | Im Warenkorb: {company} Firma / {private} Privat", en: "Already ordered: {ordered} company items | In cart: {company} company / {private} private" },
  },
  "checkoutForm.privateItemsInfo": {
    section: "checkout",
    label: "Checkout: Privatartikel Info",
    values: { de: "Private Artikel im Warenkorb: {count} | Zwischensumme: {subtotal} €", en: "Private items in cart: {count} | Subtotal: {subtotal} €" },
  },
  "checkoutForm.nameLabel": {
    section: "checkout",
    label: "Checkout: Name Label",
    values: { de: "Vollständiger Name *", en: "Full name *" },
  },
  "checkoutForm.namePlaceholder": {
    section: "checkout",
    label: "Checkout: Name Platzhalter",
    values: { de: "Max Mustermann", en: "Max Mustermann" },
  },
  "checkoutForm.emailLabel": {
    section: "checkout",
    label: "Checkout: E-Mail Label",
    values: { de: "E-Mail *", en: "Email *" },
  },
  "checkoutForm.emailPlaceholder": {
    section: "checkout",
    label: "Checkout: E-Mail Platzhalter",
    values: { de: "max.mustermann@realcore.de", en: "max.mustermann@realcore.de" },
  },
  "checkoutForm.departmentLabel": {
    section: "checkout",
    label: "Checkout: Bereich Label",
    values: { de: "Firmenbereich *", en: "Company area *" },
  },
  "checkoutForm.departmentPlaceholder": {
    section: "checkout",
    label: "Checkout: Bereich Platzhalter",
    values: { de: "Firmenbereich wählen", en: "Select company area" },
  },
  "checkoutForm.streetLabel": {
    section: "checkout",
    label: "Checkout: Straße Label",
    values: { de: "Straße & Hausnummer *", en: "Street & house number *" },
  },
  "checkoutForm.streetPlaceholder": {
    section: "checkout",
    label: "Checkout: Straße Platzhalter",
    values: { de: "Musterstraße 123", en: "Sample Street 123" },
  },
  "checkoutForm.zipLabel": {
    section: "checkout",
    label: "Checkout: PLZ Label",
    values: { de: "PLZ *", en: "ZIP code *" },
  },
  "checkoutForm.zipPlaceholder": {
    section: "checkout",
    label: "Checkout: PLZ Platzhalter",
    values: { de: "12345", en: "12345" },
  },
  "checkoutForm.zipValidation": {
    section: "checkout",
    label: "Checkout: PLZ Validierung",
    values: { de: "PLZ muss 5 Ziffern haben", en: "ZIP code must have 5 digits" },
  },
  "checkoutForm.cityLabel": {
    section: "checkout",
    label: "Checkout: Stadt Label",
    values: { de: "Stadt *", en: "City *" },
  },
  "checkoutForm.cityPlaceholder": {
    section: "checkout",
    label: "Checkout: Stadt Platzhalter",
    values: { de: "Musterstadt", en: "Sample City" },
  },
  "checkoutForm.disclaimerTitle": {
    section: "checkout",
    label: "Checkout: Hinweise Titel",
    values: { de: "Wichtige Hinweise", en: "Important notes" },
  },
  "checkoutForm.disclaimerLine1": {
    section: "checkout",
    label: "Checkout: Hinweise Punkt 1",
    values: { de: "⚠️ Bestellungen sind verbindlich", en: "⚠️ Orders are binding" },
  },
  "checkoutForm.disclaimerLine2": {
    section: "checkout",
    label: "Checkout: Hinweise Punkt 2",
    values: { de: "⚠️ Kein Umtausch oder Rückgabe möglich", en: "⚠️ No exchange or return possible" },
  },
  "checkoutForm.disclaimerLine3": {
    section: "checkout",
    label: "Checkout: Hinweise Punkt 3",
    values: { de: "⚠️ Bitte beachte die Größentabelle vor der Bestellung", en: "⚠️ Please review the size chart before ordering" },
  },
  "checkoutForm.disclaimerAccept": {
    section: "checkout",
    label: "Checkout: Hinweise akzeptieren",
    values: { de: "Ich habe die Hinweise gelesen und akzeptiert", en: "I have read and accept the notes" },
  },
  "checkoutForm.processing": {
    section: "checkout",
    label: "Checkout: Verarbeitung",
    values: { de: "Wird verarbeitet...", en: "Processing..." },
  },
  "checkoutForm.submit": {
    section: "checkout",
    label: "Checkout: Abschicken",
    values: { de: "Bestellung abschicken", en: "Submit order" },
  },
  "sizeChart.button": {
    section: "products",
    label: "Größentabelle: Button",
    values: { de: "Größentabelle", en: "Size chart" },
  },
  "sizeChart.title": {
    section: "products",
    label: "Größentabelle: Titel",
    values: { de: "Größentabelle {category}", en: "Size chart {category}" },
  },
  "sizeChart.imageAlt": {
    section: "products",
    label: "Größentabelle: Bild Alt",
    values: { de: "Größentabelle", en: "Size chart" },
  },
  "sizeChart.intro": {
    section: "products",
    label: "Größentabelle: Intro",
    values: { de: "Alle Maße in Zentimetern. Bei Unsicherheit empfehlen wir die größere Größe.", en: "All measurements are in centimeters. If in doubt, we recommend the larger size." },
  },
  "sizeChart.measurement": {
    section: "products",
    label: "Größentabelle: Maß-Spalte",
    values: { de: "Maß", en: "Measurement" },
  },
  "sizeChart.instructionsTitle": {
    section: "products",
    label: "Größentabelle: Anleitung Titel",
    values: { de: "So misst du richtig:", en: "How to measure correctly:" },
  },
  "sizeChart.instructionsChest": {
    section: "products",
    label: "Größentabelle: Brustweite",
    values: { de: "Brustweite: Miss den Umfang an der breitesten Stelle der Brust", en: "Chest: Measure the circumference at the widest part of the chest" },
  },
  "sizeChart.instructionsLength": {
    section: "products",
    label: "Größentabelle: Länge",
    values: { de: "Länge: Miss vom höchsten Punkt der Schulter bis zum Saum", en: "Length: Measure from the highest point of the shoulder to the hem" },
  },
  "sizeChart.instructionsShoulder": {
    section: "products",
    label: "Größentabelle: Schulterbreite",
    values: { de: "Schulterbreite: Miss von Schulternaht zu Schulternaht", en: "Shoulder width: Measure from shoulder seam to shoulder seam" },
  },
  "favorites.title": {
    section: "favorites",
    label: "Favoriten: Titel",
    values: { de: "Meine Favoriten", en: "My Favorites" },
  },
  "favorites.emptyTitle": {
    section: "favorites",
    label: "Favoriten: Leer Titel",
    values: { de: "Keine Favoriten", en: "No Favorites" },
  },
  "favorites.emptyDescription": {
    section: "favorites",
    label: "Favoriten: Leer Beschreibung",
    values: { de: "Du hast noch keine Artikel zu deinen Favoriten hinzugefügt.", en: "You have not added any items to your favorites yet." },
  },
  "favorites.backToCollection": {
    section: "favorites",
    label: "Favoriten: Zur Kollektion",
    values: { de: "Zur Kollektion", en: "Back to Collection" },
  },
  "favorites.addToCart": {
    section: "favorites",
    label: "Favoriten: In den Warenkorb",
    values: { de: "In den Warenkorb", en: "Add to Cart" },
  },
  "favorites.maxReached": {
    section: "favorites",
    label: "Favoriten: Maximale Menge",
    values: { de: "Dieser Artikel hat bereits die maximale Menge im Warenkorb erreicht", en: "This item has already reached the maximum quantity in your cart" },
  },
  "feedback.validationMessage": {
    section: "feedback",
    label: "Feedback: Nachricht erforderlich",
    values: { de: "Bitte gib eine Nachricht ein", en: "Please enter a message" },
  },
  "feedback.submitError": {
    section: "feedback",
    label: "Feedback: Fehler beim Senden",
    values: { de: "Feedback konnte nicht gesendet werden. Bitte versuche es erneut.", en: "Feedback could not be sent. Please try again." },
  },
  "feedback.successTitle": {
    section: "feedback",
    label: "Feedback: Erfolgstitel",
    values: { de: "Vielen Dank!", en: "Thank you!" },
  },
  "feedback.successDescription": {
    section: "feedback",
    label: "Feedback: Erfolgsbeschreibung",
    values: { de: "Dein Feedback wurde erfolgreich übermittelt.", en: "Your feedback has been submitted successfully." },
  },
  "feedback.backToCollection": {
    section: "feedback",
    label: "Feedback: Zurück zur Kollektion",
    values: { de: "Zurück zur Kollektion", en: "Back to Collection" },
  },
  "feedback.title": {
    section: "feedback",
    label: "Feedback: Titel",
    values: { de: "Feedback geben", en: "Give Feedback" },
  },
  "feedback.description": {
    section: "feedback",
    label: "Feedback: Beschreibung",
    values: { de: "Wir freuen uns über dein Feedback zum Mitarbeiter-Shop", en: "We appreciate your feedback on the employee shop" },
  },
  "feedback.ratingLabel": {
    section: "feedback",
    label: "Feedback: Bewertungslabel",
    values: { de: "Wie zufrieden bist du? (optional)", en: "How satisfied are you? (optional)" },
  },
  "feedback.rating.1": {
    section: "feedback",
    label: "Feedback: Rating 1",
    values: { de: "Sehr unzufrieden", en: "Very dissatisfied" },
  },
  "feedback.rating.2": {
    section: "feedback",
    label: "Feedback: Rating 2",
    values: { de: "Unzufrieden", en: "Dissatisfied" },
  },
  "feedback.rating.3": {
    section: "feedback",
    label: "Feedback: Rating 3",
    values: { de: "Neutral", en: "Neutral" },
  },
  "feedback.rating.4": {
    section: "feedback",
    label: "Feedback: Rating 4",
    values: { de: "Zufrieden", en: "Satisfied" },
  },
  "feedback.rating.5": {
    section: "feedback",
    label: "Feedback: Rating 5",
    values: { de: "Sehr zufrieden", en: "Very satisfied" },
  },
  "feedback.messageLabel": {
    section: "feedback",
    label: "Feedback: Nachricht Label",
    values: { de: "Deine Nachricht *", en: "Your message *" },
  },
  "feedback.messagePlaceholder": {
    section: "feedback",
    label: "Feedback: Nachricht Platzhalter",
    values: { de: "Was gefällt dir? Was können wir verbessern?", en: "What do you like? What can we improve?" },
  },
  "feedback.submitLoading": {
    section: "feedback",
    label: "Feedback: Senden lädt",
    values: { de: "Wird gesendet...", en: "Sending..." },
  },
  "feedback.submit": {
    section: "feedback",
    label: "Feedback: Senden",
    values: { de: "Feedback senden", en: "Send feedback" },
  },
  "orders.back": {
    section: "orders",
    label: "Bestellungen: Zurück",
    values: { de: "Zurück zum Shop", en: "Back to Shop" },
  },
  "orders.title": {
    section: "orders",
    label: "Bestellungen: Titel",
    values: { de: "Meine Bestellungen", en: "My Orders" },
  },
  "orders.description": {
    section: "orders",
    label: "Bestellungen: Beschreibung",
    values: { de: "Übersicht deiner bisherigen Bestellungen", en: "Overview of your previous orders" },
  },
  "orders.total": {
    section: "orders",
    label: "Bestellungen: Gesamt",
    values: { de: "Gesamte Bestellungen", en: "Total Orders" },
  },
  "orders.itemCount": {
    section: "orders",
    label: "Bestellungen: Artikelanzahl",
    values: { de: "{count} Artikel", en: "{count} items" },
  },
  "orders.thisYear": {
    section: "orders",
    label: "Bestellungen: Dieses Jahr",
    values: { de: "Artikel dieses Jahr", en: "Items This Year" },
  },
  "orders.remaining": {
    section: "orders",
    label: "Bestellungen: Noch verfügbar",
    values: { de: "Noch verfügbar", en: "Remaining" },
  },
  "orders.emptyTitle": {
    section: "orders",
    label: "Bestellungen: Leer Titel",
    values: { de: "Noch keine Bestellungen", en: "No Orders Yet" },
  },
  "orders.emptyDescription": {
    section: "orders",
    label: "Bestellungen: Leer Beschreibung",
    values: { de: "Du hast noch keine Artikel bestellt.", en: "You have not ordered any items yet." },
  },
  "orders.shopNow": {
    section: "orders",
    label: "Bestellungen: Jetzt shoppen",
    values: { de: "Jetzt shoppen", en: "Shop now" },
  },
  "orders.items": {
    section: "orders",
    label: "Bestellungen: Bestellte Artikel",
    values: { de: "Bestellte Artikel", en: "Ordered Items" },
  },
  "orders.address": {
    section: "orders",
    label: "Bestellungen: Lieferadresse",
    values: { de: "Lieferadresse", en: "Delivery Address" },
  },
  "orders.tracking": {
    section: "orders",
    label: "Bestellungen: Sendungsverfolgung",
    values: { de: "Sendungsverfolgung", en: "Tracking" },
  },
  "orders.trackingNumber": {
    section: "orders",
    label: "Bestellungen: Tracking-Nummer",
    values: { de: "Tracking-Nummer", en: "Tracking Number" },
  },
  "orders.trackingLink": {
    section: "orders",
    label: "Bestellungen: Verfolgen",
    values: { de: "Verfolgen", en: "Track" },
  },
  "orders.progress": {
    section: "orders",
    label: "Bestellungen: Fortschritt",
    values: { de: "Bestellfortschritt", en: "Order Progress" },
  },
  "orders.stepOrdered": {
    section: "orders",
    label: "Bestellungen: Schritt Bestellt",
    values: { de: "Bestellt", en: "Ordered" },
  },
  "orders.stepProcessing": {
    section: "orders",
    label: "Bestellungen: Schritt Bearbeitung",
    values: { de: "Bearbeitung", en: "Processing" },
  },
  "orders.stepShipped": {
    section: "orders",
    label: "Bestellungen: Schritt Versendet",
    values: { de: "Versendet", en: "Shipped" },
  },
  "orders.stepDelivered": {
    section: "orders",
    label: "Bestellungen: Schritt Zugestellt",
    values: { de: "Zugestellt", en: "Delivered" },
  },
  "orders.status.pending": {
    section: "orders",
    label: "Bestellungen: Status Ausstehend",
    values: { de: "Ausstehend", en: "Pending" },
  },
  "orders.status.processing": {
    section: "orders",
    label: "Bestellungen: Status Bearbeitung",
    values: { de: "In Bearbeitung", en: "Processing" },
  },
  "orders.status.shipped": {
    section: "orders",
    label: "Bestellungen: Status Versendet",
    values: { de: "Versendet", en: "Shipped" },
  },
  "orders.status.delivered": {
    section: "orders",
    label: "Bestellungen: Status Zugestellt",
    values: { de: "Zugestellt", en: "Delivered" },
  },
  "orderConfirmation.title": {
    section: "orderConfirmation",
    label: "Bestellbestätigung: Titel",
    values: { de: "Bestellung erfolgreich!", en: "Order placed successfully!" },
  },
  "orderConfirmation.description": {
    section: "orderConfirmation",
    label: "Bestellbestätigung: Beschreibung",
    values: { de: "Vielen Dank für deine Bestellung", en: "Thank you for your order" },
  },
  "orderConfirmation.emailTitle": {
    section: "orderConfirmation",
    label: "Bestellbestätigung: E-Mail Titel",
    values: { de: "Bestätigung per E-Mail", en: "Confirmation by email" },
  },
  "orderConfirmation.emailDescription": {
    section: "orderConfirmation",
    label: "Bestellbestätigung: E-Mail Beschreibung",
    values: { de: "Du erhältst in Kürze eine Bestätigung an deine E-Mail-Adresse.", en: "You will shortly receive a confirmation at your email address." },
  },
  "orderConfirmation.shippingTitle": {
    section: "orderConfirmation",
    label: "Bestellbestätigung: Versand Titel",
    values: { de: "Versand in 2-3 Werktagen", en: "Shipping in 2-3 business days" },
  },
  "orderConfirmation.shippingDescription": {
    section: "orderConfirmation",
    label: "Bestellbestätigung: Versand Beschreibung",
    values: { de: "Deine Artikel werden an deine angegebene Adresse versendet.", en: "Your items will be shipped to your specified address." },
  },
  "orderConfirmation.orders": {
    section: "orderConfirmation",
    label: "Bestellbestätigung: Meine Bestellungen",
    values: { de: "Meine Bestellungen", en: "My Orders" },
  },
  "orderConfirmation.backHome": {
    section: "orderConfirmation",
    label: "Bestellbestätigung: Zurück zum Shop",
    values: { de: "Zurück zum Shop", en: "Back to Shop" },
  },
  "auth.title": {
    section: "auth",
    label: "Login: Titel",
    values: { de: "Mitarbeiter-Shop", en: "Employee Shop" },
  },
  "auth.description": {
    section: "auth",
    label: "Login: Beschreibung",
    values: { de: "Melden Sie sich an oder registrieren Sie sich", en: "Sign in or create an account" },
  },
  "auth.microsoft.title": {
    section: "auth",
    label: "Login: Microsoft Hinweis Titel",
    values: { de: "Microsoft 365 Anmeldung ist aktiv", en: "Microsoft 365 sign-in is active" },
  },
  "auth.microsoft.description": {
    section: "auth",
    label: "Login: Microsoft Hinweis Beschreibung",
    values: { de: "Melde dich direkt mit deinem Microsoft-365-Konto an oder nutze alternativ weiterhin E-Mail und Passwort.", en: "Sign in directly with your Microsoft 365 account or continue using email and password." },
  },
  "auth.microsoft.button": {
    section: "auth",
    label: "Login: Microsoft Button",
    values: { de: "Mit Microsoft 365 anmelden", en: "Sign in with Microsoft 365" },
  },
  "auth.tab.login": {
    section: "auth",
    label: "Login: Tab Anmelden",
    values: { de: "Anmelden", en: "Sign in" },
  },
  "auth.tab.register": {
    section: "auth",
    label: "Login: Tab Registrieren",
    values: { de: "Registrieren", en: "Register" },
  },
  "auth.login.email": {
    section: "auth",
    label: "Login: E-Mail Label",
    values: { de: "E-Mail", en: "Email" },
  },
  "auth.login.emailPlaceholder": {
    section: "auth",
    label: "Login: E-Mail Platzhalter",
    values: { de: "max.mustermann@firma.de", en: "max.mustermann@company.com" },
  },
  "auth.login.password": {
    section: "auth",
    label: "Login: Passwort Label",
    values: { de: "Passwort", en: "Password" },
  },
  "auth.passwordPlaceholder": {
    section: "auth",
    label: "Login: Passwort Platzhalter",
    values: { de: "••••••••", en: "••••••••" },
  },
  "auth.login.submit": {
    section: "auth",
    label: "Login: Absenden",
    values: { de: "Anmelden", en: "Sign in" },
  },
  "auth.login.loading": {
    section: "auth",
    label: "Login: Laden",
    values: { de: "Wird angemeldet...", en: "Signing in..." },
  },
  "auth.login.error": {
    section: "auth",
    label: "Login: Fehler",
    values: { de: "Anmeldung fehlgeschlagen", en: "Sign-in failed" },
  },
  "auth.login.networkError": {
    section: "auth",
    label: "Login: Netzwerkfehler",
    values: { de: "Verbindungsfehler. Bitte versuchen Sie es erneut.", en: "Connection error. Please try again." },
  },
  "auth.register.firstName": {
    section: "auth",
    label: "Registrierung: Vorname",
    values: { de: "Vorname", en: "First name" },
  },
  "auth.register.firstNamePlaceholder": {
    section: "auth",
    label: "Registrierung: Vorname Platzhalter",
    values: { de: "Max", en: "Max" },
  },
  "auth.register.lastName": {
    section: "auth",
    label: "Registrierung: Nachname",
    values: { de: "Nachname", en: "Last name" },
  },
  "auth.register.lastNamePlaceholder": {
    section: "auth",
    label: "Registrierung: Nachname Platzhalter",
    values: { de: "Mustermann", en: "Doe" },
  },
  "auth.register.email": {
    section: "auth",
    label: "Registrierung: E-Mail",
    values: { de: "E-Mail", en: "Email" },
  },
  "auth.register.emailPlaceholder": {
    section: "auth",
    label: "Registrierung: E-Mail Platzhalter",
    values: { de: "max.mustermann@firma.de", en: "max.mustermann@company.com" },
  },
  "auth.register.companyArea": {
    section: "auth",
    label: "Registrierung: Firmenbereich",
    values: { de: "Firmenbereich", en: "Company area" },
  },
  "auth.register.companyAreaPlaceholder": {
    section: "auth",
    label: "Registrierung: Firmenbereich Platzhalter",
    values: { de: "Firmenbereich wählen", en: "Select company area" },
  },
  "auth.register.password": {
    section: "auth",
    label: "Registrierung: Passwort",
    values: { de: "Passwort", en: "Password" },
  },
  "auth.register.confirmPassword": {
    section: "auth",
    label: "Registrierung: Passwort bestätigen",
    values: { de: "Bestätigen", en: "Confirm" },
  },
  "auth.register.passwordMismatch": {
    section: "auth",
    label: "Registrierung: Passwörter ungleich",
    values: { de: "Passwörter stimmen nicht überein", en: "Passwords do not match" },
  },
  "auth.register.passwordMinLength": {
    section: "auth",
    label: "Registrierung: Passwortlänge",
    values: { de: "Passwort muss mindestens 6 Zeichen haben", en: "Password must be at least 6 characters long" },
  },
  "auth.register.submit": {
    section: "auth",
    label: "Registrierung: Absenden",
    values: { de: "Registrieren", en: "Register" },
  },
  "auth.register.loading": {
    section: "auth",
    label: "Registrierung: Laden",
    values: { de: "Wird registriert...", en: "Registering..." },
  },
  "auth.register.error": {
    section: "auth",
    label: "Registrierung: Fehler",
    values: { de: "Registrierung fehlgeschlagen", en: "Registration failed" },
  },
  "auth.register.networkError": {
    section: "auth",
    label: "Registrierung: Netzwerkfehler",
    values: { de: "Verbindungsfehler. Bitte versuchen Sie es erneut.", en: "Connection error. Please try again." },
  },
  "auth.forgot.trigger": {
    section: "auth",
    label: "Passwort vergessen: Trigger",
    values: { de: "Passwort vergessen?", en: "Forgot password?" },
  },
  "auth.forgot.title": {
    section: "auth",
    label: "Passwort vergessen: Titel",
    values: { de: "Passwort zurücksetzen", en: "Reset password" },
  },
  "auth.forgot.description": {
    section: "auth",
    label: "Passwort vergessen: Beschreibung",
    values: { de: "Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen deines Passworts.", en: "Enter your email address and we will send you a link to reset your password." },
  },
  "auth.forgot.email": {
    section: "auth",
    label: "Passwort vergessen: E-Mail",
    values: { de: "E-Mail", en: "Email" },
  },
  "auth.forgot.emailPlaceholder": {
    section: "auth",
    label: "Passwort vergessen: E-Mail Platzhalter",
    values: { de: "max.mustermann@firma.de", en: "max.mustermann@company.com" },
  },
  "auth.forgot.submit": {
    section: "auth",
    label: "Passwort vergessen: Absenden",
    values: { de: "Link senden", en: "Send link" },
  },
  "auth.forgot.loading": {
    section: "auth",
    label: "Passwort vergessen: Laden",
    values: { de: "Wird gesendet...", en: "Sending..." },
  },
  "auth.forgot.success": {
    section: "auth",
    label: "Passwort vergessen: Erfolg",
    values: { de: "Falls ein Konto mit dieser E-Mail existiert, wurde eine E-Mail zum Zurücksetzen des Passworts gesendet.", en: "If an account with this email exists, a password reset email has been sent." },
  },
  "auth.forgot.error": {
    section: "auth",
    label: "Passwort vergessen: Fehler",
    values: { de: "Fehler beim Senden der E-Mail", en: "Failed to send email" },
  },
  "auth.forgot.networkError": {
    section: "auth",
    label: "Passwort vergessen: Netzwerkfehler",
    values: { de: "Verbindungsfehler. Bitte versuchen Sie es erneut.", en: "Connection error. Please try again." },
  },
  "profile.back": {
    section: "profile",
    label: "Profil: Zurück",
    values: { de: "Zurück zum Shop", en: "Back to shop" },
  },
  "profile.title": {
    section: "profile",
    label: "Profil: Titel",
    values: { de: "Mein Profil", en: "My profile" },
  },
  "profile.description": {
    section: "profile",
    label: "Profil: Beschreibung",
    values: { de: "Verwalte deine Einstellungen und Adressen", en: "Manage your settings and addresses" },
  },
  "profile.personal.title": {
    section: "profile",
    label: "Profil: Persönliche Daten",
    values: { de: "Persönliche Daten", en: "Personal details" },
  },
  "profile.firstName": {
    section: "profile",
    label: "Profil: Vorname",
    values: { de: "Vorname", en: "First name" },
  },
  "profile.lastName": {
    section: "profile",
    label: "Profil: Nachname",
    values: { de: "Nachname", en: "Last name" },
  },
  "profile.email": {
    section: "profile",
    label: "Profil: E-Mail",
    values: { de: "E-Mail", en: "Email" },
  },
  "profile.department": {
    section: "profile",
    label: "Profil: Abteilung",
    values: { de: "Abteilung", en: "Department" },
  },
  "profile.notifications.title": {
    section: "profile",
    label: "Profil: Benachrichtigungen Titel",
    values: { de: "Benachrichtigungen", en: "Notifications" },
  },
  "profile.notifications.description": {
    section: "profile",
    label: "Profil: Benachrichtigungen Beschreibung",
    values: { de: "Wähle aus, worüber du informiert werden möchtest", en: "Choose what you would like to be informed about" },
  },
  "profile.notifications.orderStatus.title": {
    section: "profile",
    label: "Profil: Bestellstatus Titel",
    values: { de: "Bestellstatus", en: "Order status" },
  },
  "profile.notifications.orderStatus.description": {
    section: "profile",
    label: "Profil: Bestellstatus Beschreibung",
    values: { de: "Updates zu deinen Bestellungen", en: "Updates about your orders" },
  },
  "profile.notifications.wishlist.title": {
    section: "profile",
    label: "Profil: Wunschliste Titel",
    values: { de: "Wunschliste", en: "Wishlist" },
  },
  "profile.notifications.wishlist.description": {
    section: "profile",
    label: "Profil: Wunschliste Beschreibung",
    values: { de: "Wenn Artikel wieder verfügbar sind", en: "When items are available again" },
  },
  "profile.notifications.newsletter.title": {
    section: "profile",
    label: "Profil: Newsletter Titel",
    values: { de: "Newsletter", en: "Newsletter" },
  },
  "profile.notifications.newsletter.description": {
    section: "profile",
    label: "Profil: Newsletter Beschreibung",
    values: { de: "Neuigkeiten und Aktionen", en: "News and promotions" },
  },
  "profile.toast.saved": {
    section: "profile",
    label: "Profil: Toast gespeichert",
    values: { de: "Einstellungen gespeichert", en: "Settings saved" },
  },
  "profile.toast.saveError": {
    section: "profile",
    label: "Profil: Toast Fehler",
    values: { de: "Fehler beim Speichern", en: "Failed to save" },
  },
  "profile.addresses.title": {
    section: "profile",
    label: "Profil: Adressen Titel",
    values: { de: "Meine Adressen", en: "My addresses" },
  },
  "profile.addresses.description": {
    section: "profile",
    label: "Profil: Adressen Beschreibung",
    values: { de: "Verwalte deine Liefer- und Rechnungsadressen", en: "Manage your delivery and billing addresses" },
  },
  "profile.addresses.new": {
    section: "profile",
    label: "Profil: Neue Adresse",
    values: { de: "Neue Adresse", en: "New address" },
  },
  "profile.addresses.edit": {
    section: "profile",
    label: "Profil: Adresse bearbeiten",
    values: { de: "Adresse bearbeiten", en: "Edit address" },
  },
  "profile.addresses.type": {
    section: "profile",
    label: "Profil: Adresstyp",
    values: { de: "Typ", en: "Type" },
  },
  "profile.addresses.typePrivate": {
    section: "profile",
    label: "Profil: Adresstyp Privat",
    values: { de: "Privat", en: "Private" },
  },
  "profile.addresses.typeCompany": {
    section: "profile",
    label: "Profil: Adresstyp Firma",
    values: { de: "Firma", en: "Company" },
  },
  "profile.addresses.typeOther": {
    section: "profile",
    label: "Profil: Adresstyp Sonstige",
    values: { de: "Sonstige", en: "Other" },
  },
  "profile.addresses.label": {
    section: "profile",
    label: "Profil: Bezeichnung",
    values: { de: "Bezeichnung (optional)", en: "Label (optional)" },
  },
  "profile.addresses.labelPlaceholder": {
    section: "profile",
    label: "Profil: Bezeichnung Platzhalter",
    values: { de: "z.B. Zuhause, Büro", en: "e.g. home, office" },
  },
  "profile.addresses.street": {
    section: "profile",
    label: "Profil: Straße",
    values: { de: "Straße & Hausnummer *", en: "Street & house number *" },
  },
  "profile.addresses.zip": {
    section: "profile",
    label: "Profil: PLZ",
    values: { de: "PLZ *", en: "ZIP code *" },
  },
  "profile.addresses.city": {
    section: "profile",
    label: "Profil: Stadt",
    values: { de: "Stadt *", en: "City *" },
  },
  "profile.addresses.country": {
    section: "profile",
    label: "Profil: Land",
    values: { de: "Land", en: "Country" },
  },
  "profile.addresses.default": {
    section: "profile",
    label: "Profil: Standardadresse",
    values: { de: "Als Standardadresse verwenden", en: "Use as default address" },
  },
  "profile.addresses.cancel": {
    section: "profile",
    label: "Profil: Abbrechen",
    values: { de: "Abbrechen", en: "Cancel" },
  },
  "profile.addresses.save": {
    section: "profile",
    label: "Profil: Speichern",
    values: { de: "Speichern", en: "Save" },
  },
  "profile.addresses.savedNew": {
    section: "profile",
    label: "Profil: Adresse hinzugefügt",
    values: { de: "Adresse hinzugefügt", en: "Address added" },
  },
  "profile.addresses.savedEdit": {
    section: "profile",
    label: "Profil: Adresse aktualisiert",
    values: { de: "Adresse aktualisiert", en: "Address updated" },
  },
  "profile.addresses.deleteConfirm": {
    section: "profile",
    label: "Profil: Adresse löschen bestätigen",
    values: { de: "Adresse wirklich löschen?", en: "Delete this address?" },
  },
  "profile.addresses.deleted": {
    section: "profile",
    label: "Profil: Adresse gelöscht",
    values: { de: "Adresse gelöscht", en: "Address deleted" },
  },
  "profile.addresses.deleteError": {
    section: "profile",
    label: "Profil: Löschen Fehler",
    values: { de: "Fehler beim Löschen", en: "Failed to delete" },
  },
  "profile.addresses.empty": {
    section: "profile",
    label: "Profil: Keine Adressen",
    values: { de: "Noch keine Adressen gespeichert", en: "No addresses saved yet" },
  },
  "profile.addresses.defaultBadge": {
    section: "profile",
    label: "Profil: Standard Badge",
    values: { de: "Standard", en: "Default" },
  },
  "resetPassword.invalidLinkRequestNew": {
    section: "resetPassword",
    label: "Reset: Ungültiger Link anfordern",
    values: { de: "Ungültiger Link. Bitte fordere einen neuen Link an.", en: "Invalid link. Please request a new one." },
  },
  "resetPassword.passwordMinLength": {
    section: "resetPassword",
    label: "Reset: Passwortlänge",
    values: { de: "Passwort muss mindestens 6 Zeichen lang sein", en: "Password must be at least 6 characters long" },
  },
  "resetPassword.passwordMismatch": {
    section: "resetPassword",
    label: "Reset: Passwortvergleich",
    values: { de: "Passwörter stimmen nicht überein", en: "Passwords do not match" },
  },
  "resetPassword.error": {
    section: "resetPassword",
    label: "Reset: Fehler",
    values: { de: "Fehler beim Zurücksetzen des Passworts", en: "Failed to reset password" },
  },
  "resetPassword.genericError": {
    section: "resetPassword",
    label: "Reset: Allgemeiner Fehler",
    values: { de: "Ein Fehler ist aufgetreten", en: "An error occurred" },
  },
  "resetPassword.successTitle": {
    section: "resetPassword",
    label: "Reset: Erfolg Titel",
    values: { de: "Passwort geändert!", en: "Password changed!" },
  },
  "resetPassword.successDescription": {
    section: "resetPassword",
    label: "Reset: Erfolg Beschreibung",
    values: { de: "Dein Passwort wurde erfolgreich geändert. Du wirst zur Startseite weitergeleitet...", en: "Your password has been changed successfully. You will be redirected to the home page..." },
  },
  "resetPassword.backHome": {
    section: "resetPassword",
    label: "Reset: Zur Startseite",
    values: { de: "Zur Startseite", en: "Go to home page" },
  },
  "resetPassword.invalidTitle": {
    section: "resetPassword",
    label: "Reset: Ungültiger Link Titel",
    values: { de: "Ungültiger Link", en: "Invalid link" },
  },
  "resetPassword.invalidDescription": {
    section: "resetPassword",
    label: "Reset: Ungültiger Link Beschreibung",
    values: { de: "Dieser Link ist ungültig oder abgelaufen.", en: "This link is invalid or has expired." },
  },
  "resetPassword.title": {
    section: "resetPassword",
    label: "Reset: Titel",
    values: { de: "Neues Passwort festlegen", en: "Set new password" },
  },
  "resetPassword.description": {
    section: "resetPassword",
    label: "Reset: Beschreibung",
    values: { de: "Gib dein neues Passwort ein", en: "Enter your new password" },
  },
  "resetPassword.newPassword": {
    section: "resetPassword",
    label: "Reset: Neues Passwort",
    values: { de: "Neues Passwort", en: "New password" },
  },
  "resetPassword.newPasswordPlaceholder": {
    section: "resetPassword",
    label: "Reset: Neues Passwort Platzhalter",
    values: { de: "Mindestens 6 Zeichen", en: "At least 6 characters" },
  },
  "resetPassword.confirmPassword": {
    section: "resetPassword",
    label: "Reset: Passwort bestätigen",
    values: { de: "Passwort bestätigen", en: "Confirm password" },
  },
  "resetPassword.confirmPasswordPlaceholder": {
    section: "resetPassword",
    label: "Reset: Passwort bestätigen Platzhalter",
    values: { de: "Passwort wiederholen", en: "Repeat password" },
  },
  "resetPassword.saving": {
    section: "resetPassword",
    label: "Reset: Speichern lädt",
    values: { de: "Wird gespeichert...", en: "Saving..." },
  },
  "resetPassword.save": {
    section: "resetPassword",
    label: "Reset: Passwort speichern",
    values: { de: "Passwort speichern", en: "Save password" },
  },
  "resetPassword.backLink": {
    section: "resetPassword",
    label: "Reset: Zurück Link",
    values: { de: "Zurück zur Startseite", en: "Back to home page" },
  },
  "wishlist.back": {
    section: "wishlist",
    label: "Wunschliste: Zurück",
    values: { de: "Zurück zum Shop", en: "Back to shop" },
  },
  "wishlist.title": {
    section: "wishlist",
    label: "Wunschliste: Titel",
    values: { de: "Meine Wunschliste", en: "My wishlist" },
  },
  "wishlist.description": {
    section: "wishlist",
    label: "Wunschliste: Beschreibung",
    values: { de: "Speichere Artikel mit deinen bevorzugten Größen und Farben", en: "Save items with your preferred sizes and colors" },
  },
  "wishlist.updated": {
    section: "wishlist",
    label: "Wunschliste: Aktualisiert",
    values: { de: "Wunschliste aktualisiert", en: "Wishlist updated" },
  },
  "wishlist.saveError": {
    section: "wishlist",
    label: "Wunschliste: Speichern Fehler",
    values: { de: "Fehler beim Speichern", en: "Failed to save" },
  },
  "wishlist.removed": {
    section: "wishlist",
    label: "Wunschliste: Entfernt",
    values: { de: "Von Wunschliste entfernt", en: "Removed from wishlist" },
  },
  "wishlist.removeError": {
    section: "wishlist",
    label: "Wunschliste: Entfernen Fehler",
    values: { de: "Fehler beim Entfernen", en: "Failed to remove" },
  },
  "wishlist.addedToCart": {
    section: "wishlist",
    label: "Wunschliste: In den Warenkorb",
    values: { de: "In den Warenkorb gelegt", en: "Added to cart" },
  },
  "wishlist.maxReached": {
    section: "wishlist",
    label: "Wunschliste: Maximale Menge",
    values: { de: "Dieser Artikel hat bereits die maximale Menge im Warenkorb erreicht", en: "This item has already reached the maximum quantity in the cart" },
  },
  "wishlist.available": {
    section: "wishlist",
    label: "Wunschliste: Verfügbar",
    values: { de: "Verfügbar", en: "Available" },
  },
  "wishlist.unknown": {
    section: "wishlist",
    label: "Wunschliste: Unbekannt",
    values: { de: "Unbekannt", en: "Unknown" },
  },
  "wishlist.unavailable": {
    section: "wishlist",
    label: "Wunschliste: Nicht verfügbar",
    values: { de: "Nicht verfügbar", en: "Unavailable" },
  },
  "wishlist.onlyLeft": {
    section: "wishlist",
    label: "Wunschliste: Nur noch",
    values: { de: "Nur noch {count}", en: "Only {count} left" },
  },
  "wishlist.inStock": {
    section: "wishlist",
    label: "Wunschliste: Auf Lager",
    values: { de: "Auf Lager", en: "In stock" },
  },
  "wishlist.emptyTitle": {
    section: "wishlist",
    label: "Wunschliste: Leer Titel",
    values: { de: "Wunschliste ist leer", en: "Wishlist is empty" },
  },
  "wishlist.emptyDescription": {
    section: "wishlist",
    label: "Wunschliste: Leer Beschreibung",
    values: { de: "Füge Artikel zu deiner Wunschliste hinzu, um sie später zu bestellen.", en: "Add items to your wishlist to order them later." },
  },
  "wishlist.backToCollection": {
    section: "wishlist",
    label: "Wunschliste: Zur Kollektion",
    values: { de: "Zur Kollektion", en: "Back to collection" },
  },
  "wishlist.notifyBadge": {
    section: "wishlist",
    label: "Wunschliste: Benachrichtigung Badge",
    values: { de: "Benachrichtigung", en: "Notification" },
  },
  "wishlist.size": {
    section: "wishlist",
    label: "Wunschliste: Größe",
    values: { de: "Größe: {size}", en: "Size: {size}" },
  },
  "wishlist.color": {
    section: "wishlist",
    label: "Wunschliste: Farbe",
    values: { de: "Farbe: {color}", en: "Color: {color}" },
  },
  "wishlist.addToCart": {
    section: "wishlist",
    label: "Wunschliste: In den Warenkorb",
    values: { de: "In den Warenkorb", en: "Add to cart" },
  },
  "wishlist.editTitle": {
    section: "wishlist",
    label: "Wunschliste: Bearbeiten Titel",
    values: { de: "Wunschlisten-Eintrag bearbeiten", en: "Edit wishlist item" },
  },
  "wishlist.preferredSize": {
    section: "wishlist",
    label: "Wunschliste: Bevorzugte Größe",
    values: { de: "Bevorzugte Größe", en: "Preferred size" },
  },
  "wishlist.sizePlaceholder": {
    section: "wishlist",
    label: "Wunschliste: Größe Platzhalter",
    values: { de: "Größe wählen", en: "Select size" },
  },
  "wishlist.preferredColor": {
    section: "wishlist",
    label: "Wunschliste: Bevorzugte Farbe",
    values: { de: "Bevorzugte Farbe", en: "Preferred color" },
  },
  "wishlist.colorPlaceholder": {
    section: "wishlist",
    label: "Wunschliste: Farbe Platzhalter",
    values: { de: "Farbe wählen", en: "Select color" },
  },
  "wishlist.colorInputPlaceholder": {
    section: "wishlist",
    label: "Wunschliste: Farbe Input Platzhalter",
    values: { de: "z.B. Navy, Schwarz", en: "e.g. navy, black" },
  },
  "wishlist.notes": {
    section: "wishlist",
    label: "Wunschliste: Notizen",
    values: { de: "Notizen", en: "Notes" },
  },
  "wishlist.notesPlaceholder": {
    section: "wishlist",
    label: "Wunschliste: Notizen Platzhalter",
    values: { de: "z.B. für Kollegin als Geschenk", en: "e.g. as a gift for a colleague" },
  },
  "wishlist.notifyTitle": {
    section: "wishlist",
    label: "Wunschliste: Benachrichtigen Titel",
    values: { de: "Benachrichtigen", en: "Notify me" },
  },
  "wishlist.notifyDescription": {
    section: "wishlist",
    label: "Wunschliste: Benachrichtigen Beschreibung",
    values: { de: "Wenn Artikel wieder verfügbar ist", en: "When the item is available again" },
  },
  "wishlist.cancel": {
    section: "wishlist",
    label: "Wunschliste: Abbrechen",
    values: { de: "Abbrechen", en: "Cancel" },
  },
  "wishlist.save": {
    section: "wishlist",
    label: "Wunschliste: Speichern",
    values: { de: "Speichern", en: "Save" },
  },
  "supplier.loading": {
    section: "supplier",
    label: "Lieferantenportal: Laden",
    values: { de: "Laden...", en: "Loading..." },
  },
  "supplier.login.title": {
    section: "supplier",
    label: "Lieferantenportal: Login Titel",
    values: { de: "Lieferant Portal", en: "Supplier portal" },
  },
  "supplier.login.description": {
    section: "supplier",
    label: "Lieferantenportal: Login Beschreibung",
    values: { de: "Melden Sie sich an, um Bestellungen zu verwalten", en: "Sign in to manage orders" },
  },
  "supplier.login.username": {
    section: "supplier",
    label: "Lieferantenportal: Benutzername",
    values: { de: "Benutzername", en: "Username" },
  },
  "supplier.login.usernamePlaceholder": {
    section: "supplier",
    label: "Lieferantenportal: Benutzername Platzhalter",
    values: { de: "Benutzername eingeben", en: "Enter username" },
  },
  "supplier.login.password": {
    section: "supplier",
    label: "Lieferantenportal: Passwort",
    values: { de: "Passwort", en: "Password" },
  },
  "supplier.login.passwordPlaceholder": {
    section: "supplier",
    label: "Lieferantenportal: Passwort Platzhalter",
    values: { de: "Passwort eingeben", en: "Enter password" },
  },
  "supplier.login.error": {
    section: "supplier",
    label: "Lieferantenportal: Login Fehler",
    values: { de: "Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.", en: "Invalid credentials. Please try again." },
  },
  "supplier.login.networkError": {
    section: "supplier",
    label: "Lieferantenportal: Login Netzwerkfehler",
    values: { de: "Verbindungsfehler. Bitte versuchen Sie es erneut.", en: "Connection error. Please try again." },
  },
  "supplier.login.submit": {
    section: "supplier",
    label: "Lieferantenportal: Login Absenden",
    values: { de: "Anmelden", en: "Sign in" },
  },
  "supplier.login.loadingSubmit": {
    section: "supplier",
    label: "Lieferantenportal: Login Laden",
    values: { de: "Anmelden...", en: "Signing in..." },
  },
  "supplier.login.help": {
    section: "supplier",
    label: "Lieferantenportal: Hilfe",
    values: { de: "Bei Problemen wenden Sie sich an die IT-Abteilung", en: "If you have problems, please contact IT support" },
  },
  "supplier.orders.title": {
    section: "supplier",
    label: "Lieferantenportal: Bestellungen Titel",
    values: { de: "Bestellungen", en: "Orders" },
  },
  "supplier.orders.description": {
    section: "supplier",
    label: "Lieferantenportal: Bestellungen Beschreibung",
    values: { de: "Verwalte alle Mitarbeiterbestellungen", en: "Manage all employee orders" },
  },
  "supplier.orders.logout": {
    section: "supplier",
    label: "Lieferantenportal: Abmelden",
    values: { de: "Abmelden", en: "Log out" },
  },
  "supplier.orders.searchPlaceholder": {
    section: "supplier",
    label: "Lieferantenportal: Suche Platzhalter",
    values: { de: "Suche nach Name, E-Mail oder Bestellnummer...", en: "Search by name, email, or order number..." },
  },
  "supplier.orders.filterPlaceholder": {
    section: "supplier",
    label: "Lieferantenportal: Status filtern",
    values: { de: "Status filtern", en: "Filter by status" },
  },
  "supplier.orders.filterAll": {
    section: "supplier",
    label: "Lieferantenportal: Alle Status",
    values: { de: "Alle Status", en: "All statuses" },
  },
  "supplier.orders.empty": {
    section: "supplier",
    label: "Lieferantenportal: Keine Bestellungen",
    values: { de: "Noch keine Bestellungen eingegangen", en: "No orders have been received yet" },
  },
  "supplier.orders.emptyFiltered": {
    section: "supplier",
    label: "Lieferantenportal: Keine Treffer",
    values: { de: "Keine Bestellungen gefunden", en: "No orders found" },
  },
  "supplier.orders.items": {
    section: "supplier",
    label: "Lieferantenportal: Bestellte Artikel",
    values: { de: "Bestellte Artikel", en: "Ordered items" },
  },
  "supplier.orders.address": {
    section: "supplier",
    label: "Lieferantenportal: Lieferadresse",
    values: { de: "Lieferadresse", en: "Delivery address" },
  },
  "supplier.orders.changeStatus": {
    section: "supplier",
    label: "Lieferantenportal: Status ändern",
    values: { de: "Status ändern", en: "Change status" },
  },
  "supplier.orders.updating": {
    section: "supplier",
    label: "Lieferantenportal: Status wird aktualisiert",
    values: { de: "Wird aktualisiert...", en: "Updating..." },
  },
  "supplier.orders.color": {
    section: "supplier",
    label: "Lieferantenportal: Farbe",
    values: { de: "Farbe: {color}", en: "Color: {color}" },
  },
  "supplier.orders.articleNumber": {
    section: "supplier",
    label: "Lieferantenportal: Artikelnummer",
    values: { de: "Art.-Nr.: {articleNumber}", en: "SKU: {articleNumber}" },
  },
  "supplier.orders.status.pending": {
    section: "supplier",
    label: "Lieferantenportal: Status Ausstehend",
    values: { de: "Ausstehend", en: "Pending" },
  },
  "supplier.orders.status.processing": {
    section: "supplier",
    label: "Lieferantenportal: Status Bearbeitung",
    values: { de: "In Bearbeitung", en: "Processing" },
  },
  "supplier.orders.status.shipped": {
    section: "supplier",
    label: "Lieferantenportal: Status Versendet",
    values: { de: "Versendet", en: "Shipped" },
  },
  "supplier.orders.status.delivered": {
    section: "supplier",
    label: "Lieferantenportal: Status Zugestellt",
    values: { de: "Zugestellt", en: "Delivered" },
  },
} as const satisfies Record<string, AppTextDefinition>

export type AppTextKey = keyof typeof appTextDefinitions
export type AppTextValueMap = Record<AppTextKey, string>
export type AppTextOverrideMap = Partial<Record<AppTextKey, Partial<Record<Language, string>>>>

export type AppTextAdminEntry = {
  key: AppTextKey
  section: AppTextSection
  sectionLabel: string
  label: string
  defaults: Record<Language, string>
  values: Record<Language, string>
  isCustomized: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

export function getDefaultAppText(key: AppTextKey, language: Language): string {
  return appTextDefinitions[key].values[language]
}

export function getDefaultAppTextMap(language: Language): AppTextValueMap {
  return Object.fromEntries(
    (Object.keys(appTextDefinitions) as AppTextKey[]).map((key) => [key, appTextDefinitions[key].values[language]]),
  ) as AppTextValueMap
}

export function normalizeAppTextOverrides(raw: unknown): AppTextOverrideMap {
  if (!isRecord(raw)) {
    return {}
  }

  const overrides: AppTextOverrideMap = {}

  for (const key of Object.keys(appTextDefinitions) as AppTextKey[]) {
    const entry = raw[key]
    if (!isRecord(entry)) {
      continue
    }

    const de = typeof entry.de === "string" ? entry.de : undefined
    const en = typeof entry.en === "string" ? entry.en : undefined

    if (de !== undefined || en !== undefined) {
      overrides[key] = {
        ...(de !== undefined ? { de } : {}),
        ...(en !== undefined ? { en } : {}),
      }
    }
  }

  return overrides
}

export function getMergedAppTextMap(language: Language, rawOverrides: unknown): AppTextValueMap {
  const defaults = getDefaultAppTextMap(language)
  const overrides = normalizeAppTextOverrides(rawOverrides)

  for (const key of Object.keys(appTextDefinitions) as AppTextKey[]) {
    const override = overrides[key]?.[language]
    if (typeof override === "string") {
      defaults[key] = override
    }
  }

  return defaults
}

export function getAdminAppTextEntries(rawOverrides: unknown): AppTextAdminEntry[] {
  const overrides = normalizeAppTextOverrides(rawOverrides)

  return (Object.keys(appTextDefinitions) as AppTextKey[])
    .map((key) => {
      const definition = appTextDefinitions[key]
      const values = {
        de: overrides[key]?.de ?? definition.values.de,
        en: overrides[key]?.en ?? definition.values.en,
      }

      return {
        key,
        section: definition.section,
        sectionLabel: appTextSections[definition.section],
        label: definition.label,
        defaults: definition.values,
        values,
        isCustomized: values.de !== definition.values.de || values.en !== definition.values.en,
      }
    })
    .sort((left, right) => {
      if (left.sectionLabel !== right.sectionLabel) {
        return left.sectionLabel.localeCompare(right.sectionLabel, "de")
      }
      return left.label.localeCompare(right.label, "de")
    })
}

export function buildAppTextOverridesFromEntries(
  entries: Array<{ key: string; values?: Partial<Record<Language, string>> | null }>,
): AppTextOverrideMap {
  const overrides: AppTextOverrideMap = {}

  for (const definitionKey of Object.keys(appTextDefinitions) as AppTextKey[]) {
    const submitted = entries.find((entry) => entry.key === definitionKey)
    if (!submitted?.values) {
      continue
    }

    const defaultValues = appTextDefinitions[definitionKey].values
    const nextDe = typeof submitted.values.de === "string" ? submitted.values.de : defaultValues.de
    const nextEn = typeof submitted.values.en === "string" ? submitted.values.en : defaultValues.en

    const deChanged = nextDe !== defaultValues.de
    const enChanged = nextEn !== defaultValues.en

    if (deChanged || enChanged) {
      overrides[definitionKey] = {
        ...(deChanged ? { de: nextDe } : {}),
        ...(enChanged ? { en: nextEn } : {}),
      }
    }
  }

  return overrides
}

export function formatAppText(template: string, params?: Record<string, string | number | null | undefined>): string {
  if (!params) {
    return template
  }

  return template.replace(/\{(\w+)\}/g, (_, token: string) => {
    const value = params[token]
    return value === undefined || value === null ? "" : String(value)
  })
}
