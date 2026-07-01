<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useItemsStore } from '@/stores/items'
import { useFavoritesStore } from '@/stores/favorites'
import type { CampusItem, ItemStatus } from '@/types'
import { ItemTypeLabels, ItemStatusLabels } from '@/types'
import { Edit, Star, List, Switch } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const itemsStore = useItemsStore()
const favoritesStore = useFavoritesStore()
const tab = ref<'published'|'favorites'>('published')
const loading = ref(true)
const myItems = ref<CampusItem[]>([])

const statusOpts: ItemStatus[] = ['open', 'closed']

onMounted(async () => {
  if (!userStore.isLoggedIn) { router.push('/login'); return }
  loading.value = true
  try {
    await Promise.all([itemsStore.fetchItems(), favoritesStore.fetchFavoritesWithItems()])
    myItems.value = itemsStore.items.filter(i => i.publisherId === userStore.userId)
  } finally { loading.value = false }
})

async function updateStatus(item: CampusItem, status: ItemStatus) {
  await itemsStore.updateStatus(item.type, item.id, status)
  const idx = myItems.value.findIndex(i => i.id === item.id)
  if (idx !== -1 && myItems.value[idx]) myItems.value[idx]!.status = status
}
async function removeFav(item: CampusItem) { await favoritesStore.toggleFavorite(item.id, item.type); await favoritesStore.fetchFavoritesWithItems() }
function fmt(dateStr: string) { return new Date(dateStr).toLocaleDateString('zh-CN') }

function doLogout() {
  userStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="page anim-up">
    <div class="breadcrumb"><RouterLink to="/">首页</RouterLink> / <span>个人中心</span></div>

    <!-- Banner -->
    <div class="profile-banner">
      <div class="pb-left">
        <div class="pb-av">{{ (userStore.currentUser?.nickname||'用')[0] }}</div>
        <div>
          <h1>{{ userStore.currentUser?.nickname }}</h1>
          <p>{{ userStore.currentUser?.college }} · {{ userStore.currentUser?.campus }} · {{ userStore.currentUser?.role }}</p>
        </div>
      </div>
      <div class="pb-right">
        <div class="pb-stat"><span>{{ userStore.currentUser?.creditScore || 100 }}</span><span>信用分</span></div>
      </div>
    </div>

    <!-- Layout -->
    <div class="prof-layout">
      <aside class="prof-side">
        <div class="card menu-card">
          <button class="mi" :class="{ on: tab === 'published' }" @click="tab='published'">
            <el-icon :size="14"><List /></el-icon> 我的发布
          </button>
          <button class="mi" :class="{ on: tab === 'favorites' }" @click="tab='favorites'">
            <el-icon :size="14"><Star /></el-icon> 我的收藏
          </button>
          <button class="mi mi--logout" @click="doLogout">
            <el-icon :size="14"><Switch /></el-icon> 退出登录
          </button>
        </div>
      </aside>
      <div class="prof-main">
        <template v-if="tab === 'published'">
          <div v-if="loading" class="loading-box"><div class="spinner"></div></div>
          <div v-else-if="!myItems.length" class="card" style="padding:var(--s-8);text-align:center">
            <p style="color:var(--c-text-3);margin:0 0 var(--s-3)">还没有发布任何信息</p>
            <button class="btn btn--primary btn--sm" @click="router.push('/publish')">去发布</button>
          </div>
          <div v-else class="card">
            <table class="dtbl">
              <thead><tr><th>标题</th><th>类型</th><th>状态</th><th>时间</th><th>更新状态</th></tr></thead>
              <tbody>
                <tr v-for="item in myItems" :key="item.id">
                  <td class="td-title" @click="router.push(`/detail/${item.type}/${item.id}`)">{{ item.title }}</td>
                  <td>{{ ItemTypeLabels[item.type] }}</td>
                  <td><span class="st-badge">{{ ItemStatusLabels[item.status] }}</span></td>
                  <td class="td-time">{{ fmt(item.createdAt) }}</td>
                  <td>
                    <select class="input" style="font-size:var(--fs-xs);padding:4px 8px" :value="item.status" @change="updateStatus(item, ($event.target as HTMLSelectElement).value as ItemStatus)">
                      <option v-for="s in statusOpts" :key="s" :value="s">{{ ItemStatusLabels[s] }}</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <template v-else>
          <div v-if="loading" class="loading-box"><div class="spinner"></div></div>
          <div v-else-if="!favoritesStore.favoriteItems.length" class="card" style="padding:var(--s-8);text-align:center">
            <p style="color:var(--c-text-3);margin:0 0 var(--s-3)">还没有收藏任何信息</p>
            <button class="btn btn--primary btn--sm" @click="router.push('/list')">去逛逛</button>
          </div>
          <div v-else class="card">
            <table class="dtbl">
              <thead><tr><th>标题</th><th>类型</th><th>状态</th><th>操作</th></tr></thead>
              <tbody>
                <tr v-for="fav in favoritesStore.favoriteItems" :key="fav.id">
                  <td class="td-title" @click="router.push(`/detail/${fav.item.type}/${fav.item.id}`)">{{ fav.item.title }}</td>
                  <td>{{ ItemTypeLabels[fav.item.type] }}</td>
                  <td><span class="st-badge">{{ ItemStatusLabels[fav.item.status] }}</span></td>
                  <td><button class="btn btn--danger btn--sm" @click="removeFav(fav.item)">取消收藏</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-banner { display: flex; justify-content: space-between; align-items: center; padding: var(--s-6) var(--s-8); background: var(--c-surface); border: 1px solid var(--c-border); border-radius: var(--r-lg); margin-bottom: var(--s-6); }
.pb-left { display: flex; align-items: center; gap: var(--s-4); }
.pb-av { width: 56px; height: 56px; background: var(--c-accent); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: var(--fs-xl); font-weight: 700; }
.pb-left h1 { font-size: var(--fs-xl); font-weight: 700; margin: 0; }
.pb-left p { font-size: var(--fs-sm); color: var(--c-text-3); margin: var(--s-1) 0 0; }
.pb-right { text-align: center; }
.pb-stat span { display: block; }
.pb-stat span:first-child { font-size: var(--fs-2xl); font-weight: 700; }

.prof-layout { display: grid; grid-template-columns: 180px 1fr; gap: var(--s-6); align-items: start; }
.prof-side { position: sticky; top: 68px; }
.menu-card { padding: var(--s-1); display: flex; flex-direction: column; gap: 2px; }
.mi { display: flex; align-items: center; gap: var(--s-2); width: 100%; padding: 10px 14px; border: none; background: none; border-radius: var(--r-sm); font-family: var(--font); font-size: var(--fs-sm); color: var(--c-text-2); cursor: pointer; transition: all .1s; }
.mi:hover { background: var(--c-bg); }
.mi.on { background: var(--c-accent); color: #fff; }
.mi--logout { color: var(--c-text-3); }
.mi--logout:hover { background: #fef0f0; color: var(--c-red); }
.prof-main { min-width: 0; }

.dtbl { width: 100%; border-collapse: collapse; }
.dtbl th { text-align: left; padding: 10px 16px; font-size: var(--fs-xs); font-weight: 600; color: var(--c-text-3); text-transform: uppercase; letter-spacing: .04em; background: var(--c-bg); border-bottom: 1px solid var(--c-border); }
.dtbl td { padding: 10px 16px; font-size: var(--fs-sm); border-bottom: 1px solid var(--c-border-2); color: var(--c-text-2); }
.td-title { cursor: pointer; font-weight: 500; color: var(--c-text); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.td-title:hover { text-decoration: underline; }
.td-time { font-size: var(--fs-xs); white-space: nowrap; color: var(--c-text-3); }
.st-badge { display: inline-block; padding: 1px 8px; border-radius: 999px; font-size: var(--fs-xs); background: #f0eee9; }

@media (max-width: 768px) { .prof-layout { grid-template-columns: 1fr; } .prof-side { position: static; } .profile-banner { flex-direction: column; gap: var(--s-4); text-align: center; padding: var(--s-5); } }
</style>
