/** A publish of the Profile draft at the revision the owner saw. */
export interface PublishRequest {
  revision: number
  /** Idempotency key: the backend answers a repeat with the first release. */
  requestId: string
}

/**
 * The request to send now. A request whose answer never arrived (the network
 * dropped after sending it) is sent again with the same id, so the backend
 * cannot publish twice; a newer revision is a new request.
 */
export function toPublishRequest(
  unconfirmed: PublishRequest | null,
  revision: number,
  createRequestId: () => string,
): PublishRequest {
  if (unconfirmed !== null && unconfirmed.revision === revision) {
    return unconfirmed
  }
  return { revision, requestId: createRequestId() }
}
