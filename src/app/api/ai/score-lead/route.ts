import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (process.env.DRY_RUN === 'true') {
      console.log('[DRY RUN] AI score lead:', body)
      return NextResponse.json({ success: true, dryRun: true, score: 75 })
    }
    // TODO: OpenAI lead scoring implementation
    return NextResponse.json({ success: true, score: 75 })
  } catch {
    return NextResponse.json({ error: 'Scoring failed' }, { status: 500 })
  }
}
