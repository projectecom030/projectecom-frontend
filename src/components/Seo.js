import { useEffect } from "react"

const APP_NAME = "BudgetProperty"

const upsertTag = (selector, createElement) => {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = createElement()
    document.head.appendChild(element)
  }
  return element
}

const setMeta = (name, content, attribute = "name") => {
  if (!content) return
  const selector = `meta[${attribute}="${name}"]`
  const meta = upsertTag(selector, () => {
    const element = document.createElement("meta")
    element.setAttribute(attribute, name)
    return element
  })
  meta.setAttribute("content", content)
}

const setLink = (rel, href) => {
  if (!href) return
  const link = upsertTag(`link[rel="${rel}"]`, () => {
    const element = document.createElement("link")
    element.setAttribute("rel", rel)
    return element
  })
  link.setAttribute("href", href)
}

const removeTag = (selector) => {
  const element = document.head.querySelector(selector)
  if (element) {
    element.remove()
  }
}

const getBaseUrl = () => {
  const apiBase = process.env.REACT_APP_API_URL
  if (apiBase) {
    return apiBase.replace(/\/api\/?$/, "")
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin
  }

  return ""
}

const buildAbsoluteUrl = (value, baseUrl) => {
  if (!value) return ""
  if (/^https?:\/\//i.test(value)) return value

  const normalizedBase = baseUrl.replace(/\/$/, "")
  const normalizedValue = value.startsWith("/") ? value : `/${value}`
  return `${normalizedBase}${normalizedValue}`
}

const Seo = ({
  title,
  description,
  canonicalPath = "/",
  image,
  robots = "index,follow",
  type = "website",
  jsonLd,
}) => {
  useEffect(() => {
    const baseUrl = getBaseUrl()
    const fullTitle = title ? `${title} | ${APP_NAME}` : APP_NAME
    const canonicalUrl = buildAbsoluteUrl(canonicalPath, baseUrl)
    const imageUrl = buildAbsoluteUrl(image || "/icon.png", baseUrl)

    document.title = fullTitle

    setMeta("description", description)
    setMeta("robots", robots)
    setMeta("og:title", fullTitle, "property")
    setMeta("og:description", description, "property")
    setMeta("og:type", type, "property")
    setMeta("og:url", canonicalUrl, "property")
    setMeta("og:image", imageUrl, "property")
    setMeta("twitter:card", "summary_large_image", "name")
    setMeta("twitter:title", fullTitle, "name")
    setMeta("twitter:description", description, "name")
    setMeta("twitter:image", imageUrl, "name")
    setLink("canonical", canonicalUrl)

    if (jsonLd) {
      const script = upsertTag('script[data-seo-jsonld="true"]', () => {
        const element = document.createElement("script")
        element.type = "application/ld+json"
        element.dataset.seoJsonld = "true"
        return element
      })
      script.textContent = JSON.stringify(jsonLd)
    } else {
      removeTag('script[data-seo-jsonld="true"]')
    }
  }, [canonicalPath, description, image, jsonLd, robots, title, type])

  return null
}

export default Seo
