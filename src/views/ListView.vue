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
const sort = ref<'createdAt' | 'viewCount' | 'price'>('createdAt')
const campuses = ['狮子山校区', '成龙校区', '遂宁校区']

// 搜索防抖
let timer: ReturnType<typeof setTimeout> | null = null
const DEBOUNCE_MS = 300

onMounted(async () => {
  const tp = route.query.type as ItemType | undefined
  if (tp) selType.value = tp
  try {
    await apply()
    await favoritesStore.fetchFavorites()
  } finally {
    loading.value = false
  }
})

async function apply() {
  loading.value = true
  try {
    const f: Partial<ItemFilters> = {
      keyword: keyword.value || undefined,
      type: selType.value || undefined,
      campus: selCampus.value || undefined,
      status: selStatus.value || undefined,
      sortBy: sort.value,
      sortOrder: 'desc',
    }
    await itemsStore.fetchItems(f)
  } finally {
    loading.value = false
  }
}

/** 切换类型筛选 */
function toggleType(t: ItemType) {
  selType.value = selType.value === t ? '' : t
  apply()
}

/** 切换校区筛选 */
function toggleCampus(c: string) {
  selCampus.value = selCampus.value === c ? '' : c
  apply()
}

/** 切换状态筛选 */
function toggleStatus(s: ItemStatus) {
  selStatus.value = selStatus.value === s ? '' : s
  apply()
}

/** 切换排序 */
function setSort(s: 'createdAt' | 'viewCount' | 'price') {
  sort.value = s
  apply()
}

/** 搜索输入防抖 */
function onKeywordInput() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(apply, DEBOUNCE_MS)
}

function clearAll() {
  keyword.value = ''
  selType.value = ''
  selCampus.value = ''
  selStatus.value = ''
  sort.value = 'createdAt'
  apply()
}

const hasFilters = computed(
  () => !!(keyword.value || selType.value || selCampus.value || selStatus.value),
)

function isFav(id: string) {
  return favoritesStore.favoriteIds.has(id)
}
async function toggleFav(item: CampusItem) {
  await favoritesStore.toggleFavorite(item.id, item.type)
}
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
            <input v-model="keyword" class="search-inp" placeholder="搜索标题、描述、标签、地点..." @input="onKeywordInput" />
          </div>
        </div>
        <div class="card sb-block">
          <h4>类型</h4>
          <button
            v-for="(label, key) in ItemTypeLabels"
            :key="key"
            class="chip"
            :class="{ on: selType === key }"
            @click="toggleType(key)"
          >
            {{ label }}
          </button>
        </div>
        <div class="card sb-block">
          <h4>校区</h4>
          <button
            v-for="c in campuses"
            :key="c"
            class="chip"
            :class="{ on: selCampus === c }"
            @click="toggleCampus(c)"
          >
            {{ c.replace('校区', '') }}
          </button>
        </div>
        <div class="card sb-block">
          <h4>状态</h4>
          <button
            v-for="(label, key) in ItemStatusLabels"
            :key="key"
            class="chip"
            :class="{ on: selStatus === key }"
            @click="toggleStatus(key)"
          >
            {{ label }}
          </button>
        </div>
        <button v-if="hasFilters" class="btn btn--ghost btn--sm" style="width:100%" @click="clearAll">清除筛选</button>
      </aside>

      <!-- main -->
      <div class="main-col">
        <div class="toolbar">
          <span class="t-count"><strong>{{ itemsStore.items.length }}</strong> 条结果</span>
          <div class="sort-row">
            <button class="sbtn" :class="{ on: sort === 'createdAt' }" @click="setSort('createdAt')">最新</button>
            <button class="sbtn" :class="{ on: sort === 'viewCount' }" @click="setSort('viewCount')">最热</button>
            <button class="sbtn" :class="{ on: sort === 'price' }" @click="setSort('price')">价格</button>
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
            <ItemCard :item="item" @click="router.push(`/detail/${item.type}/${item.id}`)" />
            <button class="fav-dot" :class="{ on: isFav(item.id) }" @click.stop="toggleFav(item)">
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
