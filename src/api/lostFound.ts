import http from './http'

export interface LostFoundItem {
  id: string
  title: string
  description: string
  type: 'lost' | 'found'
  campus: string
  location: string
  eventTime: string
  itemFeature: string
  tags: string[]
  images: string[]
  publisherId: string
  publisherName: string
  status: 'open' | 'closed'
  viewCount: number
  favoriteCount: number
  createdAt: string
  updatedAt: string
}

/** 获取全部失物招领列表 */
export function getLostFounds() {
  return http.get<LostFoundItem[]>('/lostFounds')
}

/** 获取单条失物招领详情 */
export function getLostFoundById(id: string) {
  return http.get<LostFoundItem>(`/lostFounds/${id}`)
}

/** 新增失物招领 */
export function createLostFound(data: Omit<LostFoundItem, 'id' | 'createdAt' | 'updatedAt'>) {
  return http.post<LostFoundItem>('/lostFounds', {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

/** 更新失物招领 */
export function updateLostFound(id: string, data: Partial<LostFoundItem>) {
  return http.patch<LostFoundItem>(`/lostFounds/${id}`, {
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

/** 删除失物招领 */
export function deleteLostFound(id: string) {
  return http.delete(`/lostFounds/${id}`)
}
