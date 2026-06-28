import { get, post, del } from './index'
import type { Favorite, CampusItem } from '@/types'

export function getFavorites(userId: string): Promise<Favorite[]> {
  return get<Favorite[]>(`/favorites?userId=${userId}`)
}

export function getFavoriteByUserAndItem(userId: string, itemId: string): Promise<Favorite[]> {
  return get<Favorite[]>(`/favorites?userId=${userId}&itemId=${itemId}`)
}

export function addFavorite(favorite: Omit<Favorite, 'id' | 'createdAt'>): Promise<Favorite> {
  return post<Favorite>('/favorites', {
    ...favorite,
    createdAt: new Date().toISOString(),
  })
}

export function removeFavorite(id: string): Promise<void> {
  return del(`/favorites/${id}`)
}

// 获取收藏列表并附带 item 信息
export async function getFavoritesWithItems(userId: string): Promise<(Favorite & { item: CampusItem })[]> {
  const favorites = await getFavorites(userId)
  const results: (Favorite & { item: CampusItem })[] = []
  for (const fav of favorites) {
    const item = await get<CampusItem>(`/items/${fav.itemId}`)
    results.push({ ...fav, item })
  }
  return results
}
