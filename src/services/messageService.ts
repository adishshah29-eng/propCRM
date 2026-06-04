const DRY_RUN = process.env.DRY_RUN === 'true'

interface WhatsAppPayload {
  to: string
  message: string
  mediaUrl?: string
  leadId: string
  assetId?: string
}

export async function sendWhatsApp(payload: WhatsAppPayload) {
  if (DRY_RUN) {
    console.log('[DRY RUN] WhatsApp:', payload)
    return { success: true, dryRun: true }
  }

  const res = await fetch('/api/whatsapp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error('WhatsApp send failed')
  return res.json()
}

export function buildWhatsAppMessage(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] || '')
}
