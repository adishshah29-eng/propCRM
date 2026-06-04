import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (process.env.DRY_RUN === 'true') {
      console.log('[DRY RUN] WhatsApp send:', body)
      return NextResponse.json({ success: true, dryRun: true })
    }
    // TODO: Twilio WhatsApp / Meta Cloud API implementation
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Send failed' }, { status: 500 })
  }
}
