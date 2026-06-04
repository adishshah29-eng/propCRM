import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.formData()
    // TODO: Update call status in database
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
}
