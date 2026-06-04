const DRY_RUN = process.env.DRY_RUN === 'true'

interface EmailPayload {
  to: string
  subject: string
  html: string
}

export async function sendEmail(payload: EmailPayload) {
  if (DRY_RUN) {
    console.log('[DRY RUN] Email:', payload)
    return { success: true, dryRun: true }
  }

  // TODO: Resend integration
  return { success: true }
}
