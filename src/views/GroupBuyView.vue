<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getGroupBuys, type GroupBuyItem } from '@/api/groupBuy'
import type { CampusItem } from '@/types'
import ItemCard from '@/components/ItemCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useFavoritesStore } from '@/stores/favorites'

const router = useRouter()
const favoritesStore = useFavoritesStore()
const items = ref<CampusItem[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getGroupBuys()
    items.value = res.data.map((gb: GroupBuyItem) => ({ ...gb, type: 'groupBuys' } as CampusItem))
    await favoritesStore.fetchFavorites()
  } finally {
    loading.value = false
  }
})

function isFav(id: string) { return favoritesStore.favoriteIds.has(id) }
async function toggle(id: string) { await favoritesStore.toggleFavorite(id, 'groupBuys') }
</script>

<template>
  <div class="page anim-up">
    <div class="breadcrumb"><RouterLink to="/">首页</RouterLink> / <span>拼单搭子</span></div>
    <div class="page-header">
      <h1 class="page-title">拼单搭子</h1>
      <p class="page-sub">一起拼一起学，不再孤单</p>
    </div>

    <div v-if="loading" class="loading-box"><div class="spinner"></div></div>
    <div v-else-if="!items.length" class="empty-box">
      <EmptyState text="暂无拼单搭子信息" />
      <RouterLink to="/publish" class="btn btn--primary btn--sm">发布信息</RouterLink>
    </div>
    <div v-else class="items-grid">
      <div v-for="item in items" :key="item.id" style="position:relative">
        <ItemCard :item="item" @click="router.push(`/detail/groupBuys/${item.id}`)" />
        <button class="fav-dot" :class="{ on: isFav(item.id) }" @click.stop="toggle(item.id)">
          {{ isFav(item.id) ? '★' : '☆' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.items-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--s-4); }

.fav-dot {
  position: absolute; top: var(--s-3); right: var(--s-3); z-index: 2;
  width: 30px; height: 30px; border-radius: 50%; border: none; background: rgba(255,255,255,.9);
  font-size: 16px; cursor: pointer; color: var(--c-text-3); transition: all .15s;
  display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
}
.fav-dot:hover { transform: scale(1.1); }
.fav-dot.on { color: #b8860b; }

@media (max-width: 900px) { .items-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .items-grid { grid-template-columns: 1fr; } }
</style>
