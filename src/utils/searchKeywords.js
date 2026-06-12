export const TAMIL_NADU_DISTRICTS = new Set([
  "ariyalur",
  "chengalpattu",
  "chennai",
  "coimbatore",
  "cuddalore",
  "dharmapuri",
  "dindigul",
  "erode",
  "kallakurichi",
  "kanchipuram",
  "kanyakumari",
  "karur",
  "krishnagiri",
  "madurai",
  "mayiladuthurai",
  "nagapattinam",
  "namakkal",
  "nilgiris",
  "perambalur",
  "pudukkottai",
  "ramanathapuram",
  "ranipet",
  "salem",
  "sivaganga",
  "tenkasi",
  "thanjavur",
  "theni",
  "thoothukudi",
  "tiruchirappalli",
  "tirunelveli",
  "tirupattur",
  "tiruppur",
  "tiruvallur",
  "tiruvannamalai",
  "tiruvarur",
  "vellore",
  "viluppuram",
  "virudhunagar",
  "ooty",
  "trichy",
  "tuticorin",
  "thiruvallur",
  "thiruvannamalai",
  "kancheepuram",
  "kanniyakumari",
  "pudukkottai",
  "puthukottai",
  "tirupathur",
  "villupuram",
])

const STOP_WORDS = new Set([
  "bhk",
  "bedroom",
  "bedrooms",
  "house",
  "home",
  "apartment",
  "apartments",
  "flat",
  "flats",
  "villa",
  "plot",
  "plots",
  "commercial",
  "office",
  "shop",
  "in",
  "at",
  "near",
])

const TYPE_KEYWORDS = [
  { match: ["apartment", "apartments", "flat", "flats"], type: "Apartment" },
  { match: ["house", "home"], type: "House" },
  { match: ["villa", "villas"], type: "Villa" },
  { match: ["plot", "plots", "land"], type: "Plot" },
  { match: ["commercial", "office", "shop"], type: "Commercial" },
]

const normalizeToken = (value) => String(value || "").trim().toLowerCase()

export const parseSearchKeywords = (query) => {
  const raw = String(query || "").trim()
  if (!raw) {
    return { search: "", city: "", bedrooms: "", type: "" }
  }

  const lower = raw.toLowerCase()
  const bhkMatch = lower.match(/(\d+)\s*(bhk|bed|bedroom|bedrooms)/)
  let bedrooms = ""
  if (bhkMatch?.[1]) {
    const parsed = parseInt(bhkMatch[1], 10)
    if (Number.isFinite(parsed) && parsed > 0) {
      bedrooms = String(Math.min(parsed, 5))
    }
  }

  let type = ""
  for (const entry of TYPE_KEYWORDS) {
    if (entry.match.some((word) => lower.includes(word))) {
      type = entry.type
      break
    }
  }

  const tokens = raw.split(/[\s,]+/).filter(Boolean)
  let city = ""
  for (const token of tokens) {
    const normalized = normalizeToken(token)
    if (TAMIL_NADU_DISTRICTS.has(normalized)) {
      city = token
      break
    }
  }

  const cleanedTokens = tokens.filter((token) => {
    const normalized = normalizeToken(token)
    if (normalized === normalizeToken(city)) return false
    if (STOP_WORDS.has(normalized)) return false
    if (/^\d+$/.test(normalized) && bedrooms && normalized === bedrooms) return false
    if (normalized.match(/^\d+bhk$/)) return false
    return true
  })

  const cleanedSearch = cleanedTokens.join(" ").trim()

  return {
    search: cleanedSearch || raw,
    city,
    bedrooms,
    type,
  }
}
