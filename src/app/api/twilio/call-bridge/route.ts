import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (process.env.DRY_RUN === 'true') {
      console.log('[DRY RUN] Call bridge:', body)
      return NextResponse.json({ success: true, dryRun: true, callSid: 'dry-run-sid' })
    }
    // TODO: Twilio call bridge implementation
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Call failed' }, { status: 500 })
  }
}
