export const API_BASE = '/api'

export async function request<T extends object | string>(
  method: 'GET' | 'DELETE',
  url: string,
  body?: undefined,
  headers?: HeadersInit,
): Promise<T>
export async function request<T extends object | string>(
  method: 'POST' | 'PATCH',
  url: string,
  body: BodyInit,
  headers?: HeadersInit,
): Promise<T>
export async function request<T>(
  method: string,
  url: string,
  body?: BodyInit,
  headers?: HeadersInit,
): Promise<T | string> {
  const res = await fetch(url, {
    method,
    body,
    headers,
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  const contentType = res.headers.get('content-type')

  if (contentType?.includes('application/json')) {
    return res.json() as Promise<T>
  }

  return await res.text()
}

export const GET = async <T extends object | string>(route: string) =>
  await request<T>('GET', `${API_BASE}${route}`)

export const POST = async <T extends object | string>(
  route: string,
  body: object,
) =>
  await request<T>('POST', `${API_BASE}${route}`, JSON.stringify(body), {
    'Content-Type': 'application/json',
  })

export const PATCH = async <T extends object | string>(
  route: string,
  body: object,
) =>
  await request<T>('PATCH', `${API_BASE}${route}`, JSON.stringify(body), {
    'Content-Type': 'application/json',
  })

export const DELETE = async <T extends object | string>(route: string) =>
  await request<T>('DELETE', `${API_BASE}${route}`)
