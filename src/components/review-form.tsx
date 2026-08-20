'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, Send, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ReviewFormProps {
  orderId: string
  userId: string
  onSubmitted?: () => void
}

export function ReviewForm({ orderId, userId, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    if (rating === 0) {
      alert('Beri rating terlebih dahulu')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          order_id: orderId,
          user_id: userId,
          rating,
          comment: comment || null,
        })

      if (error) throw error

      setSubmitted(true)
      onSubmitted?.()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card className="border-success/50 bg-success/5">
        <CardContent className="p-4 text-center">
          <p className="font-medium text-success">Terima kasih atas review Anda!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Beri Rating</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stars */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-warning text-warning'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            {rating === 1 ? 'Kurang' : rating === 2 ? 'Cukup' : rating === 3 ? 'Baik' : rating === 4 ? 'Sangat Baik' : 'Luar Biasa'}
          </p>
        )}

        {/* Comment */}
        <textarea
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px]"
          placeholder="Tulis komentar (opsional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <Button className="w-full" onClick={handleSubmit} loading={loading} disabled={rating === 0}>
          <Send className="mr-2 h-4 w-4" />
          Kirim Review
        </Button>
      </CardContent>
    </Card>
  )
}
