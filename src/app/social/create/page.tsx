'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Sparkles, Send, Instagram, Facebook, Linkedin, Share2, ImagePlus, Wand2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { SocialPlatform, PostStatus } from '@/types/common.types'

const PLATFORMS: { value: SocialPlatform; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'Instagram Post', label: 'Instagram Post', icon: <Instagram size={18} />, color: '#E4405F' },
  { value: 'Instagram Reel', label: 'Instagram Reel', icon: <Instagram size={18} />, color: '#E4405F' },
  { value: 'Facebook Post', label: 'Facebook Post', icon: <Facebook size={18} />, color: '#1877F2' },
  { value: 'LinkedIn Post', label: 'LinkedIn Post', icon: <Linkedin size={18} />, color: '#0A66C2' },
  { value: 'Story', label: 'Story', icon: <Share2 size={18} />, color: '#8B5CF6' },
]

export default function CreatePostPage() {
  const [platform, setPlatform] = useState<SocialPlatform>('Instagram Post')
  const [caption, setCaption] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [status, setStatus] = useState<PostStatus>('Draft')
  const [notes, setNotes] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()
  const qc = useQueryClient()

  const generateCaption = async () => {
    setAiLoading(true)
    setError('')
    try {
      // DRY RUN: Simulated AI caption generation
      if (process.env.NEXT_PUBLIC_DRY_RUN === 'true' || true) {
        await new Promise((r) => setTimeout(r, 1500))
        const templates: Record<string, string[]> = {
          'Instagram Post': [
            '🏠 Just listed! Stunning 3BHK apartment in Gurgaon with panoramic city views. Starting at ₹85L. DM us for a private tour! #RealEstate #Gurgaon #DreamHome',
            '✨ Luxury living redefined! Check out our new project in Sector 62. Premium amenities, strategic location, world-class construction. Link in bio! #LuxuryLiving',
          ],
          'Instagram Reel': [
            '🎥 POV: You just found your dream home in Gurgaon 🏠✨ Walkthrough of our latest project — swipe up for details! #ReelEstate #PropertyTour',
          ],
          'Facebook Post': [
            '🏡 Looking for your dream home in Gurgaon? We have exclusive listings starting from ₹50L. Contact us today for a free consultation! 📞',
          ],
          'LinkedIn Post': [
            'Real estate investment opportunity in Gurgaon\'s fastest-growing corridor. ROI projections, market analysis, and exclusive developer rates available for serious investors.',
          ],
          'Story': [
            '🔥 Flash sale alert! First 10 bookings get exclusive early-bird pricing. Swipe up to claim your spot! ⏰',
          ],
        }
        const options = templates[platform] || templates['Instagram Post']
        setCaption(options[Math.floor(Math.random() * options.length)])
      } else {
        // Real OpenAI integration would go here
        const res = await fetch('/api/ai/score-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: 'real estate caption', platform }),
        })
        const data = await res.json()
        setCaption(data.caption || '')
      }
    } catch {
      setError('Failed to generate caption. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!caption.trim()) throw new Error('Caption is required')
      const { error } = await supabase.from('social_posts').insert({
        platform,
        caption,
        scheduled_at: scheduledAt || null,
        status,
        notes: notes || null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social-posts-list'] })
      qc.invalidateQueries({ queryKey: ['social-posts-calendar'] })
      setSaved(true)
      setCaption('')
      setScheduledAt('')
      setNotes('')
      setTimeout(() => setSaved(false), 3000)
    },
    onError: (err: Error) => setError(err.message),
  })

  return (
    <div>
      <PageHeader title="Create Post" description="Draft and schedule social media content" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-4xl">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4 sm:p-6 space-y-4">
              {/* Platform Selector */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Platform</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPlatform(p.value)}
                      className={`flex items-center gap-2 rounded-button border px-3 py-2 text-sm font-medium transition-colors ${
                        platform === p.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-foreground hover:bg-muted'
                      }`}
                    >
                      {p.icon}
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-foreground">Caption *</label>
                  <button
                    onClick={generateCaption}
                    disabled={aiLoading}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors"
                  >
                    <Wand2 size={14} />
                    {aiLoading ? 'Generating...' : 'AI Suggest'}
                  </button>
                </div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={6}
                  placeholder="What's on your mind? Write an engaging caption for your audience..."
                  className="w-full rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{caption.length} characters</p>
              </div>

              {/* Schedule & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Schedule For</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PostStatus)}
                    className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                  >
                    <option value="Idea">Idea</option>
                    <option value="Draft">Draft</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Internal Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Hashtags, campaign notes, approval status..."
                  className="w-full rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
                />
              </div>

              {error && (
                <div className="rounded-card bg-danger/10 border border-danger/20 p-3">
                  <p className="text-sm text-danger">{error}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending || !caption.trim()}
                  className="flex-1"
                >
                  <Send size={16} className="mr-1.5" />
                  {saveMutation.isPending ? 'Saving...' : 'Save Post'}
                </Button>
                {saved && <span className="text-sm text-success">Post saved!</span>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Card */}
        <div>
          <Card className="sticky top-4">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Preview</h3>
              <div className="rounded-card border border-border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    EF
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">EstateFlow</p>
                    <p className="text-[10px] text-muted-foreground">Just now · {platform}</p>
                  </div>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {caption || <span className="text-muted-foreground italic">Your caption will appear here...</span>}
                </p>
                <div className="rounded bg-muted h-32 flex items-center justify-center">
                  <ImagePlus size={24} className="text-muted-foreground" />
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="text-xs">❤️ 0 likes</span>
                  <span className="text-xs">💬 0 comments</span>
                  <span className="text-xs">↗️ 0 shares</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
