import { get, post, put, del, patch } from './index'
import type { CampusItem, ItemFilters } from '@/types'

export function getItems(params?: Partial<ItemFilters>): Promise<CampusItem[]> {
  let url = '/items?'
  const queries: string[] = []

  if (params?.type) {
    queries.push(`type=${params.type}`)
  }
  if (params?.campus) {
    queries.push(`campus=${encodeURIComponent(params.campus)}`)
  }
  if (params?.status) {
    queries.push(`status=${params.status}`)
  }
  if (params?.keyword) {
    queries.push(`q=${encodeURIComponent(params.keyword)}`)
  }
  // 排序参数
  if (params?.sortBy) {
    queries.push(`_sort=${params.sortBy}`)
    queries.push(`_order=${params.sortOrder || 'desc'}`)
  }

  return get<CampusItem[]>(url + queries.join('&'))
}

export function getItem(id: string): Promise<CampusItem> {
  return get<CampusItem>(`/items/${id}`)
}

export function createItem(item: Omit<CampusItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<CampusItem> {
  return post<CampusItem>('/items', {
    ...item,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

export function updateItem(id: string, item: Partial<CampusItem>): Promise<CampusItem> {
  return patch<CampusItem>(`/items/${id}`, {
    ...item,
    updatedAt: new Date().toISOString(),
  })
}

export function deleteItem(id: string): Promise<void> {
  return del(`/items/${id}`)
}

export function incrementViewCount(id: string, current: number): Promise<CampusItem> {
  return patch<CampusItem>(`/items/${id}`, { viewCount: current + 1 })
}
