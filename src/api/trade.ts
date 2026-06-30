import http, { nextId } from './http'

export interface TradeItem {
  id: string
  title: string
  description: string
  price: number
  originalPrice: number
  condition: string
  campus: string
  location: string
  tags: string[]
  images: string[]
  publisherId: string
  publisherName: string
  status: 'open' | 'closed'
  allowBargain: boolean
  viewCount: number
  favoriteCount: number
  createdAt: string
  updatedAt: string
}

/** 获取全部二手交易列表 */
export function getTrades() {
  return http.get<TradeItem[]>('/trades')
}

/** 获取单条二手交易详情 */
export function getTradeById(id: string) {
  return http.get<TradeItem>(`/trades/${id}`)
}

/** 新增二手交易（生成带前缀的顺序 id） */
export async function createTrade(data: Omit<TradeItem, 'id' | 'createdAt' | 'updatedAt'>) {
  const id = await nextId('trades', 't')
  return http.post<TradeItem>('/trades', {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

/** 更新二手交易 */
export function updateTrade(id: string, data: Partial<TradeItem>) {
  return http.patch<TradeItem>(`/trades/${id}`, {
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

/** 删除二手交易 */
export function deleteTrade(id: string) {
  return http.delete(`/trades/${id}`)
}
