# Production Security Checklist

## Database (Supabase)
- [x] RLS policies on every table
- [x] No `service_role` key exposed to frontend
- [x] `anon` key only used for client-side
- [x] JWT secret rotated
- [x] Database password strong and stored in env

## Authentication
- [x] Supabase Auth with email/password
- [x] Password reset flow implemented
- [x] Session expiry handled by middleware
- [x] Role-based route protection
- [x] No frontend-only auth checks

## External APIs
- [x] Twilio credentials in env (not code)
- [x] OpenAI key in env
- [x] Resend key in env
- [x] DRY_RUN mode for local dev
- [x] Service adapters only place APIs are called

## Vercel Deployment
- [x] Environment variables set in Vercel dashboard
- [x] Build command: `next build`
- [x] Output directory: `.next`
- [x] Node.js version: 20.x

## AWS (Phase 12)
- [ ] S3 bucket configured with CORS
- [ ] CloudFront distribution pointing to S3
- [ ] IAM user with minimal S3 permissions
- [ ] Bucket policy restricts public access
- [ ] CloudFront cache invalidation on deploy
