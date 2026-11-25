/**
 * A picked file as the CMS uploads it. Images are drawn onto a canvas and
 * encoded again, which drops every metadata block (EXIF with GPS and camera,
 * XMP, comments) and bakes the EXIF orientation into the pixels; PDFs go as
 * they are. Lossless for PNG; JPEG and WebP are re-encoded at high quality.
 * The colour profile is dropped too (sRGB is assumed): fine for screenshots.
 */

export interface UploadableFile {
  body: Blob
  fileName: string
  mime: string
  widthPx: number | null
  heightPx: number | null
}

const REENCODED_TYPES: readonly string[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

/** High enough that a screenshot shows no artefacts, well below lossless size. */
const LOSSY_QUALITY = 0.92

export async function toUploadableFile(file: File): Promise<UploadableFile> {
  if (!REENCODED_TYPES.includes(file.type)) {
    // PDFs and types the server refuses (it decides, with its own message).
    return {
      body: file,
      fileName: file.name,
      mime: file.type,
      widthPx: null,
      heightPx: null,
    }
  }
  const bitmap = await createImageBitmap(file)
  try {
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const context = canvas.getContext('2d')
    if (context === null) {
      throw new Error('This browser cannot draw the image to re-encode it')
    }
    context.drawImage(bitmap, 0, 0)
    const body = await encodeCanvas(canvas, file.type)
    // A browser that cannot encode the type (Safari and WebP) answers PNG.
    return {
      body,
      fileName: file.name,
      mime: body.type,
      widthPx: bitmap.width,
      heightPx: bitmap.height,
    }
  } finally {
    bitmap.close()
  }
}

function encodeCanvas(canvas: HTMLCanvasElement, mime: string) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob === null) {
          reject(new Error('The image could not be re-encoded'))
        } else {
          resolve(blob)
        }
      },
      mime,
      LOSSY_QUALITY,
    )
  })
}
