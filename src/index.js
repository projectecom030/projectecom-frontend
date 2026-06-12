import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import { AuthProvider } from "./context/AuthContext"
import "./index.css"

const clearBrowserCaches = async () => {
  if ("caches" in window) {
    const cacheNames = await window.caches.keys()
    await Promise.all(cacheNames.map((name) => window.caches.delete(name)))
  }
}

const unregisterServiceWorkers = async () => {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((reg) => reg.unregister()))
  }
}

const handleRuntimeCache = async () => {
  const isProd = process.env.NODE_ENV === "production"

  if (!isProd) {
    await unregisterServiceWorkers()
    await clearBrowserCaches()
    return
  }

  try {
    const response = await fetch("/build-version.json", { cache: "no-store" })
    if (!response.ok) return

    const data = await response.json()
    const latestVersion = data?.version || ""
    if (!latestVersion) return

    const storedVersion = localStorage.getItem("app-build-version")
    if (storedVersion && storedVersion !== latestVersion) {
      await unregisterServiceWorkers()
      await clearBrowserCaches()
      localStorage.setItem("app-build-version", latestVersion)
      window.location.reload()
      return
    }

    if (!storedVersion) {
      localStorage.setItem("app-build-version", latestVersion)
    }
  } catch (error) {
    // If build-version fetch fails, skip cache handling silently.
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"))

handleRuntimeCache().finally(() => {
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>,
  )
})
