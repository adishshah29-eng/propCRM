'use client'

interface UploadResult {
  url: string
  key: string
}

export async function uploadToS3(file: File, bucketPath: string): Promise<UploadResult> {
  // DRY RUN: Log instead of uploading
  if (process.env.NEXT_PUBLIC_DRY_RUN === 'true' || true) {
    console.log('[DRY RUN] Would upload to S3:', { fileName: file.name, size: file.size, path: bucketPath })
    return {
      url: `https://storage.estateflow.demo/${bucketPath}/${file.name}`,
      key: `${bucketPath}/${file.name}`,
    }
  }

  // Real S3 upload implementation
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')

  const client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

  const key = `${bucketPath}/${Date.now()}-${file.name}`
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    ContentType: file.type,
  })

  const signedUrl = await getSignedUrl(client, command, { expiresIn: 300 })

  const uploadRes = await fetch(signedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  })

  if (!uploadRes.ok) throw new Error('S3 upload failed')

  return {
    url: `${process.env.AWS_CLOUDFRONT_URL}/${key}`,
    key,
  }
}
