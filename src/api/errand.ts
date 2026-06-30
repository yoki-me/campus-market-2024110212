import http, { nextId } from './http'

export interface ErrandItem {
  id: string
  title: string
  description: string
  reward: number
  taskPlace: string
  campus: string
  expectedTime: string
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

/** 获取全部跑腿委托列表 */
export function getErrands() {
  return http.get<ErrandItem[]>('/errands')
}

/** 获取单条跑腿委托详情 */
export function getErrandById(id: string) {
  return http.get<ErrandItem>(`/errands/${id}`)
}

/** 新增跑腿委托（生成带前缀的顺序 id） */
export async function createErrand(data: Omit<ErrandItem, 'id' | 'createdAt' | 'updatedAt'>) {
  const id = await nextId('errands', 'e')
  return http.post<ErrandItem>('/errands', {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

/** 更新跑腿委托 */
export function updateErrand(id: string, data: Partial<ErrandItem>) {
  return http.patch<ErrandItem>(`/errands/${id}`, {
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

/** 删除跑腿委托 */
export function deleteErrand(id: string) {
  return http.delete(`/errands/${id}`)
}
