import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"

const PURPOSE_STORAGE_KEY = "visitPurpose"

const PurposePrompt = () => {
  const { user, updateVisitPurpose } = useAuth()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user || user.role === "admin") {
      setOpen(false)
      return
    }
    const storedPurpose = localStorage.getItem(PURPOSE_STORAGE_KEY)
    const hasPurpose = Boolean(user.visitPurpose || storedPurpose)
    if (!hasPurpose) {
      setOpen(true)
    }
  }, [user])

  const handleSelect = async (purpose) => {
    try {
      setSaving(true)
      localStorage.setItem(PURPOSE_STORAGE_KEY, purpose)
      const accessToken =
        localStorage.getItem("accessToken") || localStorage.getItem("token")
      if (!accessToken) {
        setOpen(false)
        return
      }
      if (updateVisitPurpose) {
        await updateVisitPurpose(purpose)
      }
      setOpen(false)
    } catch (error) {
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Purpose of Visit</h3>
        <p className="text-sm text-gray-600 mb-6">Select why you are visiting our web app.</p>
        <div className="grid grid-cols-1 gap-3">
          {[
            { value: "post", label: "Post Ad" },
            { value: "buy", label: "Buy Property" },
            { value: "rent", label: "Rent Property" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => handleSelect(item.value)}
              disabled={saving}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left font-medium text-gray-900 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-60"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PurposePrompt
