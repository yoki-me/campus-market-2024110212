import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CampusItem, ItemFilters } from '@/types'
import { getItems, getItem, createItem, updateItem, incrementViewCount } from '@/api/items'
import { useUserStore } from './user'

export const useItemsStore = defineStore('items', () => {
  const items = ref<CampusItem[]>([])
  const currentItem = ref<CampusItem | null>(null)
  const loading = ref(false)
  const totalCount = computed(() => items.value.length)

  const filters = ref<ItemFilters>({
    keyword: '',
    type: '',
    campus: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  // 搜索 + 筛选 + 排序
  async function fetchItems(params?: Partial<ItemFilters>) {
    loading.value = true
    try {
      const merged = { ...filters.value, ...params }
      if (params !== undefined) {
        filters.value = merged
      }
      items.value = await getItems(merged)
    } finally {
      loading.value = false
    }
  }

  // 获取详情
  async function fetchItem(id: string) {
    loading.value = true
    try {
      currentItem.value = await getItem(id)
      // 增加浏览次数
      if (currentItem.value) {
        incrementViewCount(id, currentItem.value.viewCount).then((updated) => {
          currentItem.value = updated
        })
      }
      return currentItem.value
    } finally {
      loading.value = false
    }
  }

  // 发布
  async function publish(item: Omit<CampusItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const userStore = useUserStore()
    const newItem = await createItem({
      ...item,
      publisherId: userStore.userId,
      publisherName: userStore.currentUser?.nickname || '匿名用户',
    })
    // 重新加载列表
    await fetchItems()
    return newItem
  }

  // 更新状态
  async function updateStatus(id: string, status: CampusItem['status']) {
    const updated = await updateItem(id, { status })
    if (currentItem.value?.id === id) {
      currentItem.value = updated
    }
    // 更新列表中的数据
    const index = items.value.findIndex((i) => i.id === id)
    if (index !== -1) {
      items.value[index] = updated
    }
    return updated
  }

  // 获取发布者的物品
  async function fetchByUser(userId: string) {
    loading.value = true
    try {
      return await getItems()
        .then((all) => all.filter((i) => i.publisherId === userId))
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    currentItem,
    loading,
    totalCount,
    filters,
    fetchItems,
    fetchItem,
    publish,
    updateStatus,
    fetchByUser,
  }
})
