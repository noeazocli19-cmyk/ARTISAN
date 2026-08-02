import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string || 'avatars'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64Data}`

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to .env and Vercel settings.' },
        { status: 500 }
      )
    }

    const uploadFolder = type === 'avatars' ? 'artisan_avatars' : 'artisan_missions'
    const timestamp = Math.round(new Date().getTime() / 1000)

    const crypto = await import('crypto')
    const paramsToSign = `folder=${uploadFolder}&timestamp=${timestamp}`
    const signature = crypto.createHash('sha1').update(paramsToSign + apiSecret).digest('hex')

    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append('file', dataUri)
    cloudinaryFormData.append('folder', uploadFolder)
    cloudinaryFormData.append('timestamp', String(timestamp))
    cloudinaryFormData.append('api_key', apiKey)
    cloudinaryFormData.append('signature', signature)
    cloudinaryFormData.append('overwrite', 'true')

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: cloudinaryFormData }
    )

    if (!cloudinaryRes.ok) {
      const errorData = await cloudinaryRes.json()
      console.error('Cloudinary error:', errorData)
      return NextResponse.json({ error: 'Upload failed', details: errorData }, { status: 500 })
    }

    const cloudinaryData = await cloudinaryRes.json()

    return NextResponse.json({
      success: true,
      url: cloudinaryData.secure_url,
      publicId: cloudinaryData.public_id,
      width: cloudinaryData.width,
      height: cloudinaryData.height,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}