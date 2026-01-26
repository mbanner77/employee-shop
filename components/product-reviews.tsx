"use client"

import { useState, useEffect } from "react"
import { Star, Loader2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  employee: {
    firstName: string
    lastName: string
  }
}

interface ProductReviewsProps {
  productId: string
  productName: string
}

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState<number>(0)
  const [showDialog, setShowDialog] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [newComment, setNewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`)
      if (res.ok) {
        const data = await res.json()
        // API returns { reviews, averageRating, totalReviews }
        setReviews(data.reviews || [])
        setAverageRating(data.averageRating || 0)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [canReview, setCanReview] = useState(true)

  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const submitReview = async () => {
    if (newRating === 0) return

    setSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating: newRating,
          comment: newComment || null,
        }),
      })

      if (res.ok) {
        const newReview = await res.json()
        // Add new review to the list immediately
        setReviews(prev => [newReview, ...prev])
        // Recalculate average
        const newAvg = [...reviews, newReview].reduce((sum, r) => sum + r.rating, 0) / (reviews.length + 1)
        setAverageRating(Math.round(newAvg * 10) / 10)
        setHasReviewed(true)
        setSuccessMessage("Danke für deine Bewertung!")
        setNewRating(0)
        setNewComment("")
      } else if (res.status === 401) {
        setErrorMessage("Bitte melde dich an, um zu bewerten")
        setCanReview(false)
      } else {
        const data = await res.json()
        setErrorMessage(data.error || "Fehler beim Absenden")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      setErrorMessage("Netzwerkfehler")
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
    const sizeClass = size === "sm" ? "h-3 w-3" : "h-4 w-4"
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
      </div>
    )
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {reviews.length > 0 ? (
            <>
              {renderStars(Math.round(averageRating))}
              <span>({reviews.length})</span>
            </>
          ) : (
            <>
              <MessageSquare className="h-3 w-3" />
              <span>Bewerten</span>
            </>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bewertungen für {productName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Average rating summary */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
              <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
              <div>
                {renderStars(Math.round(averageRating), "md")}
                <p className="text-xs text-muted-foreground mt-0.5">
                  {reviews.length} {reviews.length === 1 ? "Bewertung" : "Bewertungen"}
                </p>
              </div>
            </div>
          )}

          {/* Add review form */}
          {!hasReviewed && canReview && (
            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-medium">Deine Bewertung</p>
              {errorMessage && (
                <div className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                  {errorMessage}
                </div>
              )}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= (hoveredRating || newRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Optionaler Kommentar..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="resize-none"
              />
              <Button
                onClick={submitReview}
                disabled={newRating === 0 || submitting}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird gesendet...
                  </>
                ) : (
                  "Bewertung abgeben"
                )}
              </Button>
            </div>
          )}

          {/* Reviews list */}
          {reviews.length > 0 && (
            <div className="max-h-60 space-y-3 overflow-y-auto border-t pt-4">
              {reviews.map((review) => (
                <div key={review.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {review.employee.firstName} {review.employee.lastName.charAt(0)}.
                    </span>
                    {renderStars(review.rating)}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Success message after submitting */}
          {hasReviewed && successMessage && (
            <div className="rounded-md bg-green-100 dark:bg-green-900/20 p-3 text-sm text-green-700 dark:text-green-400 text-center">
              {successMessage}
            </div>
          )}

          {reviews.length === 0 && !hasReviewed && canReview && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Noch keine Bewertungen. Sei der Erste!
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
