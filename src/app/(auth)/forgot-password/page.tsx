'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/user.schema'
import { cn } from '@/lib/utils/cn'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })

      if (resetError) {
        setError(resetError.message)
      } else {
        setSent(true)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-card bg-dark-card border border-dark-border p-6 shadow-dark">
          {sent ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <MailCheck className="text-success" size={24} />
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">Check your email</h2>
              <p className="text-sm text-muted-foreground mb-4">
                We sent a password reset link to your email address.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover"
              >
                <ArrowLeft size={14} /> Back to login
              </Link>
            </div>
          ) : (
            <>
              <Link href="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-white mb-4">
                <ArrowLeft size={14} /> Back to login
              </Link>
              <h2 className="text-lg font-semibold text-white mb-1">Reset password</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your email and we will send you a reset link.
              </p>

              {error && (
                <div className="mb-4 rounded-button bg-danger/10 px-3 py-2 text-sm text-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Email</label>
                  <input
                    type="email"
                    {...register('email')}
                    className={cn(
                      'w-full rounded-button bg-dark-bg border px-3 py-2.5 text-sm text-white placeholder-muted-foreground outline-none transition-colors',
                      errors.email ? 'border-danger focus:border-danger' : 'border-dark-border focus:border-primary'
                    )}
                    placeholder="you@company.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-button bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
