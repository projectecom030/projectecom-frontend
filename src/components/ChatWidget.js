"use client"

import { useMemo, useState } from "react"
import { Bot, Send, X } from "lucide-react"
import api from "../services/api"

const ChatWidget = ({ isAdminRoute }) => {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I can help with listings, posting a property, and subscriptions." },
  ])

  const positionClass = isAdminRoute ? "bottom-6" : "bottom-24 md:bottom-6"
  const trimmedMessages = useMemo(() => messages.slice(-10), [messages])

  const sendMessage = async () => {
    const content = input.trim()
    if (!content || loading) return

    const nextMessages = [...trimmedMessages, { role: "user", content }]
    setMessages(nextMessages)
    setInput("")
    setLoading(true)

    try {
      const response = await api.post("/ai/chat", { messages: nextMessages })
      const reply = response.data?.message || "Sorry, I couldn't answer that."
      setMessages((prev) => [...prev, { role: "assistant", content: reply }].slice(-12))
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`fixed right-4 ${positionClass} z-50`}>
      {open && (
        <div className="mb-3 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">ChatBot</div>
                <div className="text-xs text-slate-500">BudgetProperty Support</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-80 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 leading-relaxed ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-3 py-2 text-slate-500">Typing...</div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 p-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage()
                }}
                placeholder="Ask about properties..."
                className="w-full bg-transparent text-sm text-slate-800 outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="rounded-full bg-blue-600 p-2 text-white disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-indigo-800 text-white shadow-lg hover:shadow-xl"
        aria-label="Open chat"
      >
        <Bot className="h-6 w-6" />
      </button>
    </div>
  )
}

export default ChatWidget
