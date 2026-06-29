import http from './http'
import type { Favorite, CampusItem, ItemType } from '@/types'
import { CollectionNames, getCollectionFromId } from '@/types'

export async function getFavorites(userId: string): Promise<Favorite[]> {
  const res = await http.get<Favorite[]>(`/favorites?userId=${userId}`)
  return res.data
}

export async function getFavoriteByUserAndItem(
  userId: string,
  itemId: string,
): Promise<Favorite[]> {
  const res = await http.get<Favorite[]>(`/favorites?userId=${userId}&itemId=${itemId}`)
  return res.data
}

export async function addFavorite(
  favorite: Omit<Favorite, 'id' | 'createdAt'>,
): Promise<Favorite> {
  const res = await http.post<Favorite>('/favorites', {
    ...favorite,
    createdAt: new Date().toISOString(),
  })
  return res.data
}

export async function removeFavorite(id: string): Promise<void> {
  await http.delete(`/favorites/${id}`)
}

export async function getFavoritesWithItems(
  userId: string,
): Promise<(Favorite & { item: CampusItem })[]> {
  const favRes = await http.get<Favorite[]>(`/favorites?userId=${userId}`)
  const favorites = favRes.data
  const results: (Favorite & { item: CampusItem })[] = []

  for (const fav of favorites) {
    const col: ItemType = fav.collection || getCollectionFromId(fav.itemId)
    const raw = await http.get<Record<string, unknown>>(
      `/${CollectionNames[col]}/${fav.itemId}`,
    )
    const item: Record<string, unknown> = { ...raw.data, type: col }
    if (col === 'lostFounds' && 'type' in item) {
      item.lostOrFound = item.type as string
      item.type = col
    }
    results.push({ ...fav, item: item as unknown as CampusItem })
  }
  return results
}
