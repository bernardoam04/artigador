import { NextRequest, NextResponse } from 'next/server';

/**
 * Creates a mock Next.js Request object for testing
 */
export function createMockRequest({
  method = 'GET',
  url = 'http://localhost:3000',
  headers = {},
  body = null,
  searchParams = {},
}: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: any;
  searchParams?: Record<string, string>;
} = {}): NextRequest {
  // Build URL with search params
  const urlWithParams = new URL(url);
  Object.entries(searchParams).forEach(([key, value]) => {
    urlWithParams.searchParams.set(key, value);
  });

  const request = new NextRequest(urlWithParams.toString(), {
    method,
    headers: new Headers(headers),
    body: body ? JSON.stringify(body) : null,
  });

  return request;
}

/**
 * Helper to extract JSON from NextResponse
 */
export async function getResponseJSON(response: NextResponse) {
  const text = await response.text();
  return JSON.parse(text);
}

/**
 * Helper to create a mock authenticated request
 */
export function createAuthenticatedRequest({
  token = 'mock-jwt-token',
  ...options
}: Parameters<typeof createMockRequest>[0] & { token?: string } = {}) {
  return createMockRequest({
    ...options,
    headers: {
      ...options.headers,
      authorization: `Bearer ${token}`,
    },
  });
}
