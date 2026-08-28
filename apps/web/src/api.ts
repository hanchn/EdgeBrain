export interface ComponentRecord {
  id: number
  name: string
  model: string
  store_name: string
  purchase_url: string
  price_cents: number
  description: string
  image_path: string
  created_at: string
}

export interface DeviceRecord {
  id: string
  name: string
  transport: string
  online: boolean
  state: { on: boolean; brightness: number }
  capabilities: string[]
}

export interface KnowledgeRecord {
  id: number
  title: string
  kind: 'fact' | 'procedure' | 'correction' | 'failure' | 'device_profile'
  content: string
  source: string
  confidence: number
  status: 'staged' | 'approved' | 'rejected' | 'superseded'
  created_at: string
}

export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ detail: '请求失败' }))
    throw new Error(payload.detail ?? '请求失败')
  }
  return response.json() as Promise<T>
}
