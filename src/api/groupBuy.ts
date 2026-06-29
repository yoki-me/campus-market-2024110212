import http from './http'

export interface GroupBuyItem {
  id: string
  title: string
  description: string
  targetCount: number
  currentCount: number
  campus: string
  location: string
  deadline: string
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

/** 获取全部拼单搭子列表 */
export function getGroupBuys() {
  return http.get<GroupBuyItem[]>('/groupBuys')
}

/** 获取单条拼单搭子详情 */
export function getGroupBuyById(id: string) {
  return http.get<GroupBuyItem>(`/groupBuys/${id}`)
}

/** 新增拼单搭子 */
export function createGroupBuy(data: Omit<GroupBuyItem, 'id' | 'createdAt' | 'updatedAt'>) {
  return http.post<GroupBuyItem>('/groupBuys', {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

/** 更新拼单搭子 */
export function updateGroupBuy(id: string, data: Partial<GroupBuyItem>) {
  return http.patch<GroupBuyItem>(`/groupBuys/${id}`, {
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

/** 删除拼单搭子 */
export function deleteGroupBuy(id: string) {
  return http.delete(`/groupBuys/${id}`)
}
