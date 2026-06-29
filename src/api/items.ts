import http from './http'
import type { CampusItem, ItemType, ItemFilters } from '@/types'
import { CollectionNames, getCollectionFromId } from '@/types'

// ---- helpers ----

function buildQuery(params?: Partial<ItemFilters>): string {
  if (!params) return ''
  const q: string[] = []
  if (params.campus) q.push(`campus=${encodeURIComponent(params.campus)}`)
  if (params.status) q.push(`status=${params.status}`)
  if (params.keyword) q.push(`q=${encodeURIComponent(params.keyword)}`)
  if (params.sortBy && params.type) {
    q.push(`_sort=${params.sortBy}`)
    q.push(`_order=${params.sortOrder || 'desc'}`)
  }
  return q.length ? `?${q.join('&')}` : ''
}

/** 将 json-server 返回的原始数据映射为 CampusItem */
function mapItem(raw: Record<string, unknown>, collectionType: ItemType): CampusItem {
  const item: Record<string, unknown> = { ...raw, type: collectionType }
  if (collectionType === 'lostFounds' && 'type' in item) {
    item.lostOrFound = item.type as string
    item.type = collectionType
  }
  if (collectionType === 'groupBuys') {
    if (typeof item.currentCount === 'string') item.currentCount = Number(item.currentCount)
    if (typeof item.targetCount === 'string') item.targetCount = Number(item.targetCount)
  }
  return item as unknown as CampusItem
}

// ---- public API ----

export async function getItems(params?: Partial<ItemFilters>): Promise<CampusItem[]> {
  const filterType = params?.type || undefined
  if (filterType) {
    const col = CollectionNames[filterType]
    const url = `/${col}${buildQuery(params)}`
    const res = await http.get<Record<string, unknown>[]>(url)
    return res.data.map((r) => mapItem(r, filterType))
  }

  const allTypes: ItemType[] = ['trades', 'lostFounds', 'groupBuys', 'errands']
  const results = await Promise.all(
    allTypes.map(async (t) => {
      const col = CollectionNames[t]
      const url = `/${col}${buildQuery({ ...params, type: undefined })}`
      const res = await http.get<Record<string, unknown>[]>(url)
      return res.data.map((r) => mapItem(r, t))
    }),
  )
  let merged = results.flat()

  if (params?.sortBy) {
    const key = params.sortBy
    const dir = params.sortOrder === 'asc' ? 1 : -1
    merged.sort((a, b) => {
      const va = (a as any)[key] ?? 0
      const vb = (b as any)[key] ?? 0
      if (typeof va === 'string') return dir * va.localeCompare(String(vb))
      return dir * (Number(va) - Number(vb))
    })
  }
  return merged
}

export async function getItem(id: string): Promise<CampusItem> {
  const col = CollectionNames[getCollectionFromId(id)]
  const res = await http.get<Record<string, unknown>>(`/${col}/${id}`)
  return mapItem(res.data, getCollectionFromId(id))
}

export async function createItem(
  item: Omit<CampusItem, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<CampusItem> {
  const col = CollectionNames[item.type]
  let nextNum = 1
  try {
    const res = await http.get<{ id: string }[]>(`/${col}`)
    const nums = res.data
      .map((i) => {
        const match = i.id.match(/\d+$/)
        return match ? parseInt(match[0], 10) : 0
      })
      .filter((n) => n > 0)
    if (nums.length) nextNum = Math.max(...nums) + 1
  } catch {
    // 集合为空或请求失败，从 1 开始
  }
  const prefix = { trades: 't', lostFounds: 'lf', groupBuys: 'gb', errands: 'e' }[item.type]
  const id = `${prefix}${nextNum}`

  const now = new Date().toISOString()
  const body: Record<string, unknown> = {
    ...item,
    id,
    createdAt: now,
    updatedAt: now,
  }
  if (item.type === 'lostFounds' && body.lostOrFound) {
    body.type = body.lostOrFound
    delete body.lostOrFound
  }
  const res = await http.post<Record<string, unknown>>(`/${col}`, body)
  return mapItem(res.data, item.type)
}

export async function updateItem(
  id: string,
  partial: Partial<CampusItem>,
): Promise<CampusItem> {
  const col = CollectionNames[getCollectionFromId(id)]
  const res = await http.patch<Record<string, unknown>>(`/${col}/${id}`, {
    ...partial,
    updatedAt: new Date().toISOString(),
  })
  return mapItem(res.data, getCollectionFromId(id))
}

export function deleteItem(id: string): Promise<void> {
  const col = CollectionNames[getCollectionFromId(id)]
  return http.delete(`/${col}/${id}`).then(() => undefined)
}

export async function incrementViewCount(
  id: string,
  current: number,
): Promise<CampusItem> {
  const col = CollectionNames[getCollectionFromId(id)]
  const res = await http.patch<Record<string, unknown>>(`/${col}/${id}`, {
    viewCount: current + 1,
  })
  return mapItem(res.data, getCollectionFromId(id))
}
