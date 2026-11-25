// A stand-in for an R2 bucket for Playwright (no real R2 in CI): the S3
// calls the backend signs (HEAD, copy, DELETE) and the browser's presigned
// PUT, plus the public reads of the bucket's domain, all in memory.
//
//   bun scripts/fake-r2/fake-r2-server.ts <port>
//
// Paths: `/<bucket>/<key>` is the S3 API (PUT, HEAD, DELETE, GET); any other
// path is a public read of `<key>`. Signatures are not verified, only
// required: this fake checks the flow, not SigV4.

import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http'

import { FAKE_R2_BUCKET } from './fake-r2-settings'

interface StoredObject {
  contentType: string
  body: Buffer
}

const port = Number(process.argv[2])
if (!Number.isInteger(port) || port <= 0) {
  throw new Error('Usage: bun scripts/fake-r2/fake-r2-server.ts <port>')
}

const objects = new Map<string, StoredObject>()
const s3Prefix = `/${FAKE_R2_BUCKET}/`

// The CMS page PUTs from another origin, like a bucket with a CORS rule.
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Expose-Headers': 'ETag',
}

function respond(
  response: ServerResponse,
  status: number,
  headers: Record<string, string> = {},
  body?: Buffer,
) {
  response.writeHead(status, { ...CORS_HEADERS, ...headers })
  response.end(body)
}

function serveObject(
  response: ServerResponse,
  objectKey: string,
  isHead: boolean,
) {
  const stored = objects.get(objectKey)
  if (stored === undefined) {
    respond(response, 404)
    return
  }
  const headers = {
    'Content-Type': stored.contentType,
    'Content-Length': String(stored.body.byteLength),
  }
  respond(response, 200, headers, isHead ? undefined : stored.body)
}

async function readBody(request: IncomingMessage) {
  const chunks: Buffer[] = []
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)))
  }
  return Buffer.concat(chunks)
}

async function storeObject(
  request: IncomingMessage,
  response: ServerResponse,
  url: URL,
) {
  const contentType = request.headers['content-type']
  const signedHeaders = (
    url.searchParams.get('X-Amz-SignedHeaders') ?? ''
  ).split(';')
  const isSigned =
    url.searchParams.has('X-Amz-Signature') &&
    signedHeaders.includes('content-type') &&
    signedHeaders.includes('content-length')
  const body = await readBody(request)
  // Like R2: the body must be exactly the signed length.
  const isSignedLength =
    request.headers['content-length'] === String(body.byteLength)
  if (contentType === undefined || !isSigned || !isSignedLength) {
    respond(response, 403)
    return
  }
  const objectKey = decodeURIComponent(url.pathname.slice(s3Prefix.length))
  objects.set(objectKey, { contentType, body })
  respond(response, 200)
}

/** S3 CopyObject: `x-amz-copy-source` is `/<bucket>/<key>`. */
function copyObject(
  response: ServerResponse,
  copySource: string,
  objectKey: string,
) {
  const source = objects.get(
    decodeURIComponent(copySource).slice(s3Prefix.length),
  )
  if (source === undefined) {
    respond(response, 404)
    return
  }
  objects.set(objectKey, source)
  respond(response, 200)
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
) {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1')
  const method = request.method ?? 'GET'
  if (method === 'OPTIONS' || url.pathname === '/health') {
    respond(response, method === 'OPTIONS' ? 204 : 200)
    return
  }
  if (url.pathname.startsWith(s3Prefix)) {
    await handleS3Request(request, response, url)
    return
  }
  const objectKey = decodeURIComponent(url.pathname.slice(1))
  serveObject(response, objectKey, method === 'HEAD')
}

async function handleS3Request(
  request: IncomingMessage,
  response: ServerResponse,
  url: URL,
) {
  const objectKey = decodeURIComponent(url.pathname.slice(s3Prefix.length))
  const copySource = request.headers['x-amz-copy-source']
  switch (request.method) {
    case 'PUT':
      if (typeof copySource === 'string') {
        copyObject(response, copySource, objectKey)
      } else {
        await storeObject(request, response, url)
      }
      return
    case 'DELETE':
      objects.delete(objectKey)
      respond(response, 204)
      return
    default:
      serveObject(response, objectKey, request.method === 'HEAD')
  }
}

createServer((request, response) => {
  handleRequest(request, response).catch(() => {
    respond(response, 500)
  })
}).listen(port, '127.0.0.1')
