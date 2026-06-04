import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // TODO: Validate webhook secret
    // TODO: Insert lead via service adapter
    return NextResponse.json({ success: true, dryRun: process.env.DRY_RUN === 'true' })
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
}
