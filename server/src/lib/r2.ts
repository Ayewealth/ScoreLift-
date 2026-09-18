import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2, env } from '../env'

export async function uploadFile(buffer: Buffer, key: string, contentType: string): Promise<string | null> {
  if (!r2) {
    console.log(`[R2] Upload: SKIPPED — r2 not configured for ${key}`)
    return null
  }
  try {
    await r2.send(new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }))
    console.log(`[R2] Upload: OK — ${key}`)
    return key
  } catch (err) {
    console.log(`[R2] Upload: FAILED — ${key}`, err)
    return null
  }
}

export async function getFileUrl(key: string, expiresIn = 60): Promise<string | null> {
  if (!r2) {
    console.log(`[R2] Signed URL: SKIPPED — r2 not configured for ${key}`)
    return null
  }
  try {
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    })
    const url = await getSignedUrl(r2, command, { expiresIn })
    return url
  } catch (err) {
    console.log(`[R2] Signed URL: FAILED — ${key}`, err)
    return null
  }
}

export async function deleteFile(key: string): Promise<boolean> {
  if (!r2) {
    console.log(`[R2] Delete: SKIPPED — r2 not configured for ${key}`)
    return false
  }
  try {
    await r2.send(new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    }))
    console.log(`[R2] Delete: OK — ${key}`)
    return true
  } catch (err) {
    console.log(`[R2] Delete: FAILED — ${key}`, err)
    return false
  }
}