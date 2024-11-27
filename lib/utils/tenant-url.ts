export function getTenantUrl(subdomain: string, path: string = ''): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')

  if (isLocalhost) {
    // For local development
    const url = new URL(baseUrl)
    return `http://${subdomain}.${url.host}${path}`
  } else {
    // For production
    return `https://${subdomain}.maamul360.com${path}`
  }
}

export function getMainDomain(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export function extractSubdomain(host: string): string | null {
  const parts = host.split('.')
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')

  if (isLocalhost) {
    return parts.length > 1 ? parts[0] : null
  } else {
    return parts.length > 2 ? parts[0] : null
  }
}
