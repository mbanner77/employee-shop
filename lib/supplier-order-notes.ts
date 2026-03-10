const LEGACY_NOTE_KEY = "__legacy__"

type SupplierNotesMap = Record<string, string>

export function parseSupplierOrderNotes(rawNotes: string | null | undefined): SupplierNotesMap {
  if (!rawNotes) {
    return {}
  }

  try {
    const parsed = JSON.parse(rawNotes)

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { [LEGACY_NOTE_KEY]: rawNotes }
    }

    return Object.entries(parsed).reduce<SupplierNotesMap>((result, [key, value]) => {
      if (typeof value === "string" && value.trim()) {
        result[key] = value
      }
      return result
    }, {})
  } catch {
    return { [LEGACY_NOTE_KEY]: rawNotes }
  }
}

export function getSupplierOrderNote(rawNotes: string | null | undefined, supplierId: string) {
  const parsedNotes = parseSupplierOrderNotes(rawNotes)
  return parsedNotes[supplierId] || null
}

export function upsertSupplierOrderNote(rawNotes: string | null | undefined, supplierId: string, note: string | null | undefined) {
  const parsedNotes = parseSupplierOrderNotes(rawNotes)
  const normalizedNote = note?.trim()

  if (normalizedNote) {
    parsedNotes[supplierId] = normalizedNote
  } else {
    delete parsedNotes[supplierId]
  }

  return Object.keys(parsedNotes).length > 0 ? JSON.stringify(parsedNotes) : null
}
