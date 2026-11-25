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

/** High enough that a screenshot shows no artefacts, well below lossless size. */
const LOSSY_QUALITY = 0.92

/**
 * `acceptedMimes` is the server's allowlist: every image type in it is
 * re-encoded, anything else goes as it is (and the server decides).
 */
export async function toUploadableFile(
  file: File,
  acceptedMimes: readonly string[],
): Promise<UploadableFile> {
  const isAcceptedImage =
    file.type.startsWith('image/') && acceptedMimes.includes(file.type)
  if (!isAcceptedImage) {
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
    // A browser that cannot encode the type (Safari and WebP) answers PNG;
    // the name follows, so the stored file's extension matches its type.
    return {
      body,
      fileName: toFileNameForType(file.name, body.type),
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

const EXTENSIONS_BY_TYPE: Readonly<Record<string, string>> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

/** `shot.webp` encoded as PNG becomes `shot.png`; a matching name is kept. */
export function toFileNameForType(fileName: string, mime: string) {
  const extension = EXTENSIONS_BY_TYPE[mime]
  if (extension === undefined) {
    return fileName
  }
  const dot = fileName.lastIndexOf('.')
  const base = dot > 0 ? fileName.slice(0, dot) : fileName
  const current = dot > 0 ? fileName.slice(dot + 1).toLowerCase() : ''
  const isMatching =
    current === extension || (extension === 'jpg' && current === 'jpeg')
  return isMatching ? fileName : `${base}.${extension}`
}
