import http from './http'
import type { CampusItem, ItemType, ItemFilters } from '@/types'
import { CollectionNames } from '@/types'

// ---- helpers ----

/** 拼接 json-server 查询参数（仅 campus/status，keyword 和 sort 由客户端处理） */
function buildQuery(params?: Partial<ItemFilters>): string {
  if (!params) return ''
  const q: string[] = []
  if (params.campus) q.push(`campus=${encodeURIComponent(params.campus)}`)
  if (params.status) q.push(`status=${params.status}`)
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

/** 客户端关键字匹配：命中标题、描述、标签、地点、校区、发布者、成色、物品特征、任务路线等 */
function matchKeyword(item: CampusItem, kw: string): boolean {
  if (!kw) return true
  const fields = [
    item.title, item.description, item.location,
    item.campus, item.publisherName,
    item.condition, item.itemFeature, item.taskPlace,
    ...item.tags,
  ].filter(Boolean) as string[]
  return fields.some((f) => f.toLowerCase().includes(kw.toLowerCase()))
}

// ---- public API ----

export async function getItems(params?: Partial<ItemFilters>): Promise<CampusItem[]> {
  const keyword = params?.keyword || ''
  const sortBy = params?.sortBy || 'createdAt'
  const sortDir = params?.sortOrder === 'asc' ? 1 : -1

  // 1. 从 json-server 拉取数据（type/campus/status 由服务端过滤）
  const filterType = params?.type || undefined
  const types: ItemType[] = filterType ? [filterType] : ['trades', 'lostFounds', 'groupBuys', 'errands']

  const results = await Promise.all(
    types.map(async (t) => {
      const col = CollectionNames[t]
      const url = `/${col}${buildQuery({ ...params, type: undefined })}`
      const res = await http.get<Record<string, unknown>[]>(url)
      return res.data.map((r) => mapItem(r, t))
    }),
  )
  let items = results.flat()

  // 2. 客户端关键字过滤
  if (keyword) {
    items = items.filter((i) => matchKeyword(i, keyword))
  }

  // 3. 客户端排序
  items.sort((a, b) => {
    const va = (a as any)[sortBy] ?? 0
    const vb = (b as any)[sortBy] ?? 0
    if (typeof va === 'string') return sortDir * va.localeCompare(String(vb))
    return sortDir * (Number(va) - Number(vb))
  })

  return items
}

/** 获取单条详情（需要显式传入 type） */
export function getItem(type: ItemType, id: string): Promise<CampusItem> {
  const col = CollectionNames[type]
  return http.get<Record<string, unknown>>(`/${col}/${id}`).then(res => mapItem(res.data, type))
}

/** 通用创建（stores 内部使用） */
export async function createItem(
  item: Omit<CampusItem, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<CampusItem> {
  const col = CollectionNames[item.type]
  const now = new Date().toISOString()
  const body: Record<string, unknown> = {
    ...item,
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

/** 更新（需要显式传入 type） */
export function updateItem(
  type: ItemType,
  id: string,
  partial: Partial<CampusItem>,
): Promise<CampusItem> {
  const col = CollectionNames[type]
  return http.patch<Record<string, unknown>>(`/${col}/${id}`, {
    ...partial,
    updatedAt: new Date().toISOString(),
  }).then(res => mapItem(res.data, type))
}

/** 删除（需要显式传入 type） */
export function deleteItem(type: ItemType, id: string): Promise<void> {
  const col = CollectionNames[type]
  return http.delete(`/${col}/${id}`).then(() => undefined)
}

/** 递增浏览量 */
export function incrementViewCount(
  type: ItemType,
  id: string,
  current: number,
): Promise<CampusItem> {
  const col = CollectionNames[type]
  return http.patch<Record<string, unknown>>(`/${col}/${id}`, {
    viewCount: current + 1,
  }).then(res => mapItem(res.data, type))
}
