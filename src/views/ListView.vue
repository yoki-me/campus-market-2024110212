<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { useFavoritesStore } from '@/stores/favorites'
import type { CampusItem, ItemType, ItemStatus, ItemFilters } from '@/types'
import { ItemTypeLabels, ItemStatusLabels } from '@/types'
import ItemCard from '@/components/ItemCard.vue'
import { Search } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const itemsStore = useItemsStore()
const favoritesStore = useFavoritesStore()

const loading = ref(true)
const keyword = ref('')
const selType = ref<ItemType | ''>('')
const selCampus = ref('')
const selStatus = ref<ItemStatus | ''>('')
const sort = ref<'createdAt'|'viewCount'|'price'>('createdAt')
const campuses = ['狮子山校区','成龙校区','遂宁校区']

onMounted(async () => {
  const tp = route.query.type as ItemType | undefined
  if (tp) selType.value = tp
  loading.value = true
  try { await apply(); await favoritesStore.fetchFavorites() } finally { loading.value = false }
})

async function apply() {
  const f: Partial<ItemFilters> = { keyword: keyword.value, type: selType.value, campus: selCampus.value, status: selStatus.value, sortBy: sort.value, sortOrder: 'desc' }
  await itemsStore.fetchItems(f)
}

function clearAll() { keyword.value=''; selType.value=''; selCampus.value=''; selStatus.value=''; sort.value='createdAt'; apply() }
const hasFilters = computed(() => keyword.value || selType.value || selCampus.value || selStatus.value)

function isFav(id: string) { return favoritesStore.favoriteIds.has(id) }
async function toggle(item: CampusItem) { await favoritesStore.toggleFavorite(item.id) }
</script>

<template>
  <div class="page anim-up">
    <div class="breadcrumb"><RouterLink to="/">首页</RouterLink> / <span>集市浏览</span></div>
    <div class="list-layout">
      <!-- sidebar -->
      <aside class="sidebar">
        <div class="card sb-block">
          <div class="search-wrap">
            <el-icon :size="14" style="color:var(--c-text-3)"><Search /></el-icon>
            <input v-model="keyword" class="search-inp" placeholder="搜索..." @input="apply" />
          </div>
        </div>
        <div class="card sb-block">
          <h4>类型</h4>
          <button v-for="[k,v] in Object.entries(ItemTypeLabels) as [ItemType,string][]" :key="k"
            class="chip" :class="{ on: selType === k }" @click="selType = selType === k ? '' : k; apply()">{{ v }}</button>
        </div>
        <div class="card sb-block">
          <h4>校区</h4>
          <button v-for="c in campuses" :key="c"
            class="chip" :class="{ on: selCampus === c }" @click="selCampus = selCampus === c ? '' : c; apply()">{{ c.replace('校区','') }}</button>
        </div>
        <div class="card sb-block">
          <h4>状态</h4>
          <button v-for="[k,v] in Object.entries(ItemStatusLabels) as [ItemStatus,string][]" :key="k"
            class="chip" :class="{ on: selStatus === k }" @click="selStatus = selStatus === k ? '' : k; apply()">{{ v }}</button>
        </div>
        <button v-if="hasFilters" class="btn btn--ghost btn--sm" style="width:100%" @click="clearAll">清除筛选</button>
      </aside>

      <!-- main -->
      <div class="main-col">
        <div class="toolbar">
          <span class="t-count"><strong>{{ itemsStore.items.length }}</strong> 条结果</span>
          <div class="sort-row">
            <button class="sbtn" :class="{ on: sort === 'createdAt' }" @click="sort='createdAt';apply()">最新</button>
            <button class="sbtn" :class="{ on: sort === 'viewCount' }" @click="sort='viewCount';apply()">最热</button>
            <button class="sbtn" :class="{ on: sort === 'price' }" @click="sort='price';apply()">价格</button>
          </div>
        </div>

        <div v-if="loading" class="loading-box"><div class="spinner"></div></div>
        <div v-else-if="!itemsStore.items.length" class="empty-box">
          <span style="font-size:var(--fs-xl)">—</span>
          <span>没有找到相关信息</span>
          <button v-if="hasFilters" class="btn btn--ghost btn--sm" @click="clearAll">清除筛选条件</button>
        </div>
        <div v-else class="items-grid">
          <div v-for="item in itemsStore.items" :key="item.id" style="position:relative">
            <ItemCard :item="item" @click="router.push(`/detail/${item.id}`)" />
            <button class="fav-dot" :class="{ on: isFav(item.id) }" @click.stop="toggle(item)">
              {{ isFav(item.id) ? '★' : '☆' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-layout { display: grid; grid-template-columns: 200px 1fr; gap: var(--s-6); align-items: start; }

/* Sidebar */
.sidebar { position: sticky; top: 68px; display: flex; flex-direction: column; gap: var(--s-3); }
.sb-block { padding: var(--s-4); display: flex; flex-direction: column; gap: var(--s-2); }
.sb-block h4 { font-size: var(--fs-xs); font-weight: 600; color: var(--c-text-2); margin: 0; text-transform: uppercase; letter-spacing: .04em; }
.search-wrap { display: flex; align-items: center; gap: var(--s-2); }
.search-inp { border: none; background: none; font-family: var(--font); font-size: var(--fs-sm); width: 100%; color: var(--c-text); outline: none; }

.chip {
  display: block; width: 100%; text-align: left; padding: 5px 10px; border: none; background: none;
  border-radius: var(--r-sm); font-family: var(--font); font-size: var(--fs-sm); color: var(--c-text-2);
  cursor: pointer; transition: all .1s ease;
}
.chip:hover { background: var(--c-bg); }
.chip.on { background: var(--c-accent); color: #fff; font-weight: 500; }

/* Toolbar */
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--s-5); }
.t-count { font-size: var(--fs-sm); color: var(--c-text-3); }
.t-count strong { color: var(--c-text); }
.sort-row { display: flex; gap: 2px; }
.sbtn { padding: 4px 12px; border: none; background: none; border-radius: var(--r-sm); font-family: var(--font); font-size: var(--fs-xs); color: var(--c-text-3); cursor: pointer; transition: all .1s; }
.sbtn:hover { background: var(--c-border-2); }
.sbtn.on { background: var(--c-accent); color: #fff; }

.items-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--s-4); }

.fav-dot {
  position: absolute; top: var(--s-3); right: var(--s-3); z-index: 2;
  width: 30px; height: 30px; border-radius: 50%; border: none; background: rgba(255,255,255,.9);
  font-size: 16px; cursor: pointer; color: var(--c-text-3); transition: all .15s;
  display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
}
.fav-dot:hover { transform: scale(1.1); }
.fav-dot.on { color: #b8860b; }

@media (max-width: 960px) {
  .list-layout { grid-template-columns: 1fr; }
  .sidebar { position: static; flex-direction: row; flex-wrap: wrap; }
  .sb-block { flex: 1; min-width: 150px; }
  .items-grid { grid-template-columns: repeat(2,1fr); }
}
@media (max-width: 560px) { .items-grid { grid-template-columns: 1fr; } }
</style>
