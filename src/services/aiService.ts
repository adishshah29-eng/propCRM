const DRY_RUN = process.env.DRY_RUN === 'true'

interface ScoreLeadPayload {
  leadData: {
    source?: string
    budget_min?: number | null
    budget_max?: number | null
    status?: string
    temperature?: string
    last_contacted_at?: string | null
    call_count?: number
    message_count?: number
  }
}

export async function scoreLead(payload: ScoreLeadPayload): Promise<{ score: number; dryRun?: boolean }> {
  if (DRY_RUN) {
    console.log('[DRY RUN] AI score lead:', payload)
    // Simple heuristic scoring
    let score = 50
    const data = payload.leadData

    // Budget factor (higher budget = higher score)
    if (data.budget_max && data.budget_max > 10000000) score += 15
    else if (data.budget_max && data.budget_max > 5000000) score += 10

    // Temperature factor
    if (data.temperature === 'Hot') score += 20
    else if (data.temperature === 'Warm') score += 10
    else if (data.temperature === 'Cold') score -= 10

    // Engagement factor
    if (data.call_count && data.call_count > 2) score += 10
    if (data.message_count && data.message_count > 0) score += 5

    // Source quality
    const highQualitySources = ['Referral', 'MagicBricks', '36Acre']
    if (highQualitySources.includes(data.source || '')) score += 5

    // Recency
    if (data.last_contacted_at) {
      const daysSince = Math.floor((Date.now() - new Date(data.last_contacted_at).getTime()) / 86400000)
      if (daysSince < 2) score += 10
      else if (daysSince > 30) score -= 15
    }

    return { score: Math.min(100, Math.max(0, score)), dryRun: true }
  }

  const res = await fetch('/api/ai/score-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error('AI scoring failed')
  return res.json()
}

interface CaptionPayload {
  topic: string
  platform: string
}

export async function generateCaption(payload: CaptionPayload): Promise<{ caption: string; dryRun?: boolean }> {
  if (DRY_RUN) {
    console.log('[DRY RUN] AI caption:', payload)
    const captions: Record<string, string[]> = {
      'Instagram Post': [
        '🏠 Just listed! Stunning property with panoramic views. DM for details! #RealEstate #DreamHome',
        '✨ Your dream home awaits! Premium amenities, prime location. Link in bio! #LuxuryLiving',
      ],
      'Facebook Post': [
        '🏡 Exclusive property listings in Gurgaon. Starting from ₹50L. Book your site visit today!',
      ],
      'LinkedIn Post': [
        'Investment opportunity alert: Grade A commercial spaces with 8% ROI. Enquire within for detailed projections.',
      ],
    }
    const options = captions[payload.platform] || captions['Instagram Post']
    return { caption: options[0], dryRun: true }
  }

  const res = await fetch('/api/ai/score-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: payload.topic, platform: payload.platform }),
  })

  if (!res.ok) throw new Error('AI caption generation failed')
  return res.json()
}

interface IntentPayload {
  callNotes: string
}

export async function detectIntent(payload: IntentPayload): Promise<{ intent: string; tags: string[]; dryRun?: boolean }> {
  if (DRY_RUN) {
    console.log('[DRY RUN] AI intent detection:', payload)
    const notes = payload.callNotes.toLowerCase()
    const intents: string[] = []
    const tags: string[] = []

    if (notes.includes('budget') || notes.includes('price') || notes.includes('cost')) {
      intents.push('price_sensitive')
      tags.push('Negotiation')
    }
    if (notes.includes('visit') || notes.includes('site') || notes.includes('see')) {
      intents.push('wants_visit')
      tags.push('Site Visit Scheduled')
    }
    if (notes.includes('urgent') || notes.includes('immediate') || notes.includes('asap')) {
      intents.push('urgent')
      tags.push('Hot')
    }
    if (notes.includes('loan') || notes.includes('finance') || notes.includes('emi')) {
      intents.push('needs_financing')
      tags.push('Financing')
    }
    if (notes.includes('family') || notes.includes('kids') || notes.includes('school')) {
      intents.push('family_buyer')
      tags.push('Family')
    }
    if (notes.includes('invest') || notes.includes('rent') || notes.includes('roi')) {
      intents.push('investor')
      tags.push('Investment')
    }

    if (intents.length === 0) {
      intents.push('general_inquiry')
      tags.push('Follow-up Needed')
    }

    return { intent: intents.join(', '), tags, dryRun: true }
  }

  // Real OpenAI integration
  const res = await fetch('/api/ai/score-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes: payload.callNotes, task: 'intent_detection' }),
  })

  if (!res.ok) throw new Error('AI intent detection failed')
  return res.json()
}

// Best time to call indicator
export function getBestTimeToCall(leadTimezone = 'Asia/Kolkata'): { time: string; label: string } {
  const now = new Date()
  const hour = now.getHours()

  // Simple heuristic: 10am-12pm and 4pm-6pm are best
  if (hour >= 10 && hour <= 12) return { time: 'Now', label: 'optimal' }
  if (hour >= 16 && hour <= 18) return { time: 'Now', label: 'optimal' }
  if (hour >= 9 && hour <= 19) return { time: 'Soon', label: 'good' }
  return { time: 'Tomorrow 10 AM', label: 'wait' }
}

// Auto-followup rules
export function shouldAutoFollowup(lastContact: string | null, status: string): { should: boolean; delay: number; channel: string } {
  if (!lastContact) return { should: true, delay: 0, channel: 'call' }

  const daysSince = Math.floor((Date.now() - new Date(lastContact).getTime()) / 86400000)

  if (status === 'New' && daysSince > 1) return { should: true, delay: 0, channel: 'call' }
  if (status === 'Contacted' && daysSince > 2) return { should: true, delay: 0, channel: 'whatsapp' }
  if (status === 'Interested' && daysSince > 3) return { should: true, delay: 0, channel: 'call' }
  if (daysSince > 7) return { should: true, delay: 0, channel: 'whatsapp' }
  if (daysSince > 30) return { should: true, delay: 0, channel: 'email' } // Re-engagement

  return { should: false, delay: 0, channel: 'call' }
}
