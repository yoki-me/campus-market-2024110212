import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Favorite, CampusItem } from '@/types'
import {
  getFavorites,
  getFavoriteByUserAndItem,
  addFavorite,
  removeFavorite,
  getFavoritesWithItems,
} from '@/api/favorites'
import { updateItem } from '@/api/items'
import { useUserStore } from './user'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref<Favorite[]>([])
  const favoriteItems = ref<(Favorite & { item: CampusItem })[]>([])
  const loading = ref(false)

  const favoriteIds = computed(() => new Set(favorites.value.map((f) => f.itemId)))
  const favoriteCount = computed(() => favorites.value.length)

  function isFavorited(itemId: string): boolean {
    return favoriteIds.value.has(itemId)
  }

  async function fetchFavorites() {
    const userStore = useUserStore()
    if (!userStore.userId) return

    loading.value = true
    try {
      favorites.value = await getFavorites(userStore.userId)
    } finally {
      loading.value = false
    }
  }

  async function fetchFavoritesWithItems() {
    const userStore = useUserStore()
    if (!userStore.userId) return

    loading.value = true
    try {
      favoriteItems.value = await getFavoritesWithItems(userStore.userId)
    } finally {
      loading.value = false
    }
  }

  async function toggleFavorite(itemId: string): Promise<boolean> {
    const userStore = useUserStore()
    if (!userStore.userId) return false

    const existing = await getFavoriteByUserAndItem(userStore.userId, itemId)
    if (existing.length > 0) {
      await removeFavorite(existing[0].id)
      favorites.value = favorites.value.filter((f) => f.itemId !== itemId)
      // 更新 items 中的 favoriteCount
      return false
    } else {
      const fav = await addFavorite({
        userId: userStore.userId,
        itemId,
      })
      favorites.value.push(fav)
      return true
    }
  }

  return {
    favorites,
    favoriteItems,
    loading,
    favoriteIds,
    favoriteCount,
    isFavorited,
    fetchFavorites,
    fetchFavoritesWithItems,
    toggleFavorite,
  }
})
