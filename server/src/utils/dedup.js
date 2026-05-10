import crypto from 'crypto';

/**
 * Normalize a URL for deduplication:
 * - Lowercases the hostname
 * - Removes common tracking query params
 * - Removes trailing slash
 * - Removes fragment
 */
export function normalizeUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);

    // Remove common tracking params
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'ref', 'source', 'mc_cid', 'mc_eid',
    ];
    trackingParams.forEach((p) => url.searchParams.delete(p));

    // Sort remaining params for consistency
    url.searchParams.sort();

    // Remove fragment
    url.hash = '';

    // Build normalized string
    let normalized = `${url.protocol}//${url.hostname.toLowerCase()}`;
    if (url.port && url.port !== '80' && url.port !== '443') {
      normalized += `:${url.port}`;
    }
    normalized += url.pathname.replace(/\/+$/, '') || '/';
    const search = url.searchParams.toString();
    if (search) normalized += `?${search}`;

    return normalized;
  } catch {
    return rawUrl;
  }
}

/**
 * Generate a SHA-256 hash of the normalized URL
 */
export function hashUrl(rawUrl) {
  const normalized = normalizeUrl(rawUrl);
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Extract the domain from a URL
 */
export function extractDomain(rawUrl) {
  try {
    return new URL(rawUrl).hostname;
  } catch {
    return 'unknown';
  }
}
