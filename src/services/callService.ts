const DRY_RUN = process.env.DRY_RUN === 'true'

interface CallBridgePayload {
  agentPhone: string
  leadPhone: string
  leadId: string
  agentId: string
}

export async function initiateCallBridge(payload: CallBridgePayload) {
  if (DRY_RUN) {
    console.log('[DRY RUN] Call bridge:', payload)
    return { success: true, dryRun: true, callSid: 'dry-run-call-sid-' + Date.now() }
  }

  const res = await fetch('/api/twilio/call-bridge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error('Call bridge failed')
  return res.json()
}
