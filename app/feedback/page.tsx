"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Star, Send, Loader2, CheckCircle } from "lucide-react"
import { useAppTexts } from "@/components/app-text-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"

export default function FeedbackPage() {
  const [message, setMessage] = useState("")
  const [rating, setRating] = useState<number | null>(null)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { text } = useAppTexts()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim()) {
      setError(text("feedback.validationMessage"))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, rating }),
      })

      if (res.status === 401) {
        router.push("/")
        return
      }

      if (!res.ok) {
        throw new Error("Fehler beim Senden")
      }

      setSubmitted(true)
    } catch (err) {
      setError(text("feedback.submitError"))
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto max-w-lg px-4 pt-32 pb-12">
          <div className="mb-8 text-center">
            <h1 className="mb-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">{text("feedback.successTitle")}</h1>
            <p className="text-muted-foreground">{text("feedback.successDescription")}</p>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <CheckCircle className="mb-6 h-16 w-16 text-green-500" />
              <Button onClick={() => router.push("/")} size="lg">{text("feedback.backToCollection")}</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-lg px-4 pt-32 pb-12">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">{text("feedback.title")}</h1>
          <p className="text-muted-foreground">{text("feedback.description")}</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div className="space-y-2">
                <Label>{text("feedback.ratingLabel")}</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(null)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          (hoveredRating !== null ? star <= hoveredRating : star <= (rating || 0))
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating && (
                  <p className="text-sm text-muted-foreground">
                    {rating === 1 && text("feedback.rating.1")}
                    {rating === 2 && text("feedback.rating.2")}
                    {rating === 3 && text("feedback.rating.3")}
                    {rating === 4 && text("feedback.rating.4")}
                    {rating === 5 && text("feedback.rating.5")}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">{text("feedback.messageLabel")}</Label>
                <Textarea
                  id="message"
                  placeholder={text("feedback.messagePlaceholder")}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {text("feedback.submitLoading")}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {text("feedback.submit")}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
