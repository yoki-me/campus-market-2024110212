<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useItemsStore } from '@/stores/items'
import { useFavoritesStore } from '@/stores/favorites'
import { useMessagesStore } from '@/stores/messages'
import { getNotices } from '@/api/notices'
import type { Notice, ItemType, CampusItem } from '@/types'
import SafetyNotice from '@/components/SafetyNotice.vue'
import { ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const itemsStore = useItemsStore()
const favoritesStore = useFavoritesStore()
const messagesStore = useMessagesStore()
const notices = ref<Notice[]>([])
const loading = ref(true)

const heroImgs = [
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=85',
  'https://images.unsplash.com/photo-1568667256549-094345857637?w=1200&q=85',
  'https://images.unsplash.com/photo-1592066212433-3e66de2ab57c?w=1200&q=85',
]
const heroIdx = ref(0)

const entries: { key: ItemType; label: string; desc: string }[] = [
  { key: 'secondhand', label: '二手交易', desc: '闲置物品买卖，物尽其用' },
  { key: 'lostfound', label: '失物招领', desc: '遗失与拾获，互帮互助' },
  { key: 'groupbuy', label: '拼单搭子', desc: '一起拼一起学，不再孤单' },
  { key: 'errand', label: '跑腿委托', desc: '代取代办，校园互助' },
]

const statCards = [
  { val: 0, label: '集市信息', to: '/list' },
  { val: 0, label: '我的收藏', to: '/profile' },
  { val: 0, label: '未读消息', to: '/message' },
]

onMounted(async () => {
  if (!userStore.isLoggedIn) { router.push('/login'); return }
  try {
    const [nd] = await Promise.all([
      getNotices().catch(() => [] as Notice[]),
      itemsStore.fetchItems(),
      favoritesStore.fetchFavorites(),
      messagesStore.fetchConversations(),
    ])
    notices.value = nd as Notice[]
    statCards[0].val = itemsStore.totalCount
    statCards[1].val = favoritesStore.favoriteCount
    statCards[2].val = messagesStore.totalUnreadCount
  } finally { loading.value = false }
  setInterval(() => { heroIdx.value = (heroIdx.value + 1) % heroImgs.length }, 6000)
})

function fmt(dateStr: string) {
  const d = new Date(dateStr); const now = new Date()
  const h = Math.floor((now.getTime() - d.getTime()) / 3600000)
  if (h < 1) return '刚刚'
  if (h < 24) return `${h}小时前`
  if (h < 168) return `${Math.floor(h / 24)}天前`
  return d.toLocaleDateString('zh-CN')
}

function summary(item: CampusItem): string {
  switch (item.type) {
    case 'secondhand': return `¥${item.price}`
    case 'lostfound': return item.lostOrFound === 'lost' ? '寻物' : '招领'
    case 'groupbuy': return `${item.currentCount}/${item.targetCount}人`
    case 'errand': return item.reward ? `¥${item.reward}` : '面议'
    default: return ''
  }
}
</script>

<template>
  <div class="home anim-up">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg" :style="{ backgroundImage: `url(${heroImgs[heroIdx]})` }"></div>
      <div class="hero-ov"></div>
      <div class="hero-inner">
        <p class="hero-eyebrow">SICHUAN NORMAL UNIVERSITY</p>
        <h1>校园轻集市</h1>
        <p class="hero-desc">二手交易 · 失物招领 · 拼单搭子 · 跑腿委托 — 让校园生活更简单</p>
        <div class="hero-acts">
          <button class="btn btn--primary btn--lg" @click="router.push('/list')">浏览集市</button>
          <button class="btn btn--ghost btn--lg" style="color:#fff;border-color:rgba(255,255,255,.3)" @click="router.push('/publish')">发布信息</button>
        </div>
        <div class="hero-dots">
          <span v-for="(_,i) in heroImgs" :key="i" class="dot" :class="{ on: i === heroIdx }"></span>
        </div>
      </div>
    </section>

    <div class="page">
      <!-- Stats -->
      <div class="stats-row">
        <div v-for="s in statCards" :key="s.label" class="stat-card card" @click="router.push(s.to)">
          <span class="stat-val">{{ s.val }}</span>
          <span class="stat-label">{{ s.label }}</span>
        </div>
        <div class="stat-card card" @click="router.push('/board')">
          <span class="stat-val">{{ userStore.currentUser?.creditScore || 100 }}</span>
          <span class="stat-label">信用分</span>
        </div>
      </div>

      <!-- Body: 2-col -->
      <div class="home-grid">
        <div class="home-main">
          <!-- Quick entries -->
          <section class="section">
            <div class="section-head"><h2>功能入口</h2></div>
            <div class="quick-grid">
              <button v-for="e in entries" :key="e.key" class="quick-card card" @click="router.push({ path: '/list', query: { type: e.key } })">
                <span class="qc-label">{{ e.label }}</span>
                <span class="qc-desc">{{ e.desc }}</span>
                <el-icon :size="14"><ArrowRight /></el-icon>
              </button>
            </div>
          </section>

          <!-- Latest -->
          <section class="section">
            <div class="section-head">
              <h2>最新发布</h2>
              <button class="link" @click="router.push('/list')">查看全部 →</button>
            </div>
            <div v-if="loading" class="loading-box"><div class="spinner"></div></div>
            <div v-else-if="!itemsStore.items.length" class="empty-box">暂无信息</div>
            <div v-else class="latest-grid">
              <div v-for="item in itemsStore.items.slice(0,6)" :key="item.id" class="latest-card card" @click="router.push(`/detail/${item.id}`)">
                <div class="lc-img" :style="{ backgroundImage: item.images?.[0] ? `url(${item.images[0]})` : 'none' }"></div>
                <div class="lc-body">
                  <h3>{{ item.title }}</h3>
                  <span class="lc-price">{{ summary(item) }}</span>
                  <span class="lc-meta">{{ item.campus }} · {{ fmt(item.createdAt) }}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside class="home-side">
          <!-- User card -->
          <div class="card user-card">
            <div class="uc-top">
              <div class="uc-av">{{ (userStore.currentUser?.nickname || '用')[0] }}</div>
              <div>
                <div class="uc-name">{{ userStore.currentUser?.nickname }}</div>
                <div class="uc-college">{{ userStore.currentUser?.college }}</div>
              </div>
            </div>
            <div class="uc-stats">
              <div class="ucs"><span>{{ itemsStore.items.filter(i => i.publisherId === userStore.userId).length }}</span><span>发布</span></div>
              <div class="ucs"><span>{{ favoritesStore.favoriteCount }}</span><span>收藏</span></div>
              <div class="ucs"><span>{{ userStore.currentUser?.creditScore || 100 }}</span><span>信用</span></div>
            </div>
            <button class="btn btn--primary btn--sm" style="width:100%" @click="router.push('/profile')">个人中心</button>
          </div>

          <SafetyNotice :notices="notices" />

          <div class="card" style="padding:var(--s-5)">
            <h4 style="font-size:var(--fs-sm);font-weight:600;margin:0 0 var(--s-3)">热门标签</h4>
            <div class="tag-cloud">
              <span class="tcloud">考研</span><span class="tcloud">电子产品</span><span class="tcloud">书籍</span>
              <span class="tcloud">奶茶</span><span class="tcloud">运动</span><span class="tcloud">快递</span>
              <span class="tcloud">自行车</span><span class="tcloud">水果</span><span class="tcloud">证件</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hero */
.hero { position: relative; height: 420px; overflow: hidden; }
.hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center; transition: background-image 1.2s ease; }
.hero-ov { position: absolute; inset: 0; background: linear-gradient(160deg, rgba(28,28,28,.8) 0%, rgba(28,28,28,.45) 100%); }
.hero-inner { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: var(--s-6); color: #fff; }
.hero-eyebrow { font-size: 10px; letter-spacing: 4px; opacity: .5; margin: 0 0 var(--s-4); font-weight: 600; }
.hero-inner h1 { font-size: var(--fs-3xl); font-weight: 700; margin: 0 0 var(--s-3); letter-spacing: -.04em; }
.hero-desc { font-size: var(--fs-md); opacity: .7; margin: 0 0 var(--s-8); }
.hero-acts { display: flex; gap: var(--s-3); }
.hero-dots { display: flex; gap: var(--s-2); position: absolute; bottom: var(--s-6); }
.dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,.3); transition: all .3s; }
.dot.on { background: #fff; width: 24px; border-radius: 4px; }

/* Stats */
.stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: var(--s-4); margin-bottom: var(--s-8); }
.stat-card { padding: var(--s-5); text-align: center; cursor: pointer; transition: all .15s ease; display: flex; flex-direction: column; align-items: center; gap: var(--s-1); }
.stat-card:hover { box-shadow: var(--shadow-md); }
.stat-val { font-size: var(--fs-xl); font-weight: 700; }
.stat-label { font-size: var(--fs-xs); color: var(--c-text-3); }

/* Grid */
.home-grid { display: grid; grid-template-columns: 1fr 280px; gap: var(--s-6); align-items: start; }
.home-main { min-width: 0; }
.home-side { position: sticky; top: 68px; display: flex; flex-direction: column; gap: var(--s-5); }

/* Sections */
.section { margin-bottom: var(--s-8); }
.section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--s-5); }
.section-head h2 { font-size: var(--fs-lg); font-weight: 700; margin: 0; letter-spacing: -.02em; }
.link { background: none; border: none; font-size: var(--fs-sm); color: var(--c-text-3); cursor: pointer; font-family: var(--font); }
.link:hover { color: var(--c-text); }

/* Quick entries */
.quick-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: var(--s-3); }
.quick-card { display: flex; align-items: center; gap: var(--s-4); padding: var(--s-5) var(--s-5); cursor: pointer; transition: all .15s ease; }
.quick-card:hover { border-color: var(--c-text-3); }
.qc-label { font-weight: 600; font-size: var(--fs-base); }
.qc-desc { font-size: var(--fs-xs); color: var(--c-text-3); margin-left: auto; margin-right: var(--s-3); }
.quick-card .el-icon { color: var(--c-text-3); flex-shrink: 0; }

/* Latest */
.latest-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: var(--s-4); }
.latest-card { overflow: hidden; cursor: pointer; transition: all .15s ease; }
.latest-card:hover { box-shadow: var(--shadow-md); }
.lc-img { height: 120px; background-size: cover; background-position: center; background-color: #f0eee9; }
.lc-body { padding: var(--s-4); display: flex; flex-direction: column; gap: var(--s-1); }
.lc-body h3 { font-size: var(--fs-sm); font-weight: 600; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.lc-price { font-weight: 700; font-size: var(--fs-base); }
.lc-meta { font-size: var(--fs-xs); color: var(--c-text-3); }

/* User card */
.user-card { padding: var(--s-5); display: flex; flex-direction: column; gap: var(--s-4); }
.uc-top { display: flex; align-items: center; gap: var(--s-3); }
.uc-av { width: 40px; height: 40px; background: var(--c-accent); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: var(--fs-md); font-weight: 700; }
.uc-name { font-weight: 600; font-size: var(--fs-base); }
.uc-college { font-size: var(--fs-xs); color: var(--c-text-3); }
.uc-stats { display: flex; justify-content: space-around; border-top: 1px solid var(--c-border-2); border-bottom: 1px solid var(--c-border-2); padding: var(--s-3) 0; }
.ucs { text-align: center; display: flex; flex-direction: column; }
.ucs span:first-child { font-weight: 700; font-size: var(--fs-md); }
.ucs span:last-child { font-size: var(--fs-xs); color: var(--c-text-3); }

/* Tag cloud */
.tag-cloud { display: flex; flex-wrap: wrap; gap: var(--s-1); }
.tcloud { padding: 3px 10px; background: var(--c-bg); border-radius: 999px; font-size: var(--fs-xs); color: var(--c-text-2); cursor: pointer; transition: all .15s; }
.tcloud:hover { background: var(--c-accent); color: #fff; }

@media (max-width: 900px) {
  .home-grid { grid-template-columns: 1fr; }
  .home-side { position: static; }
  .latest-grid { grid-template-columns: repeat(2,1fr); }
  .stats-row { grid-template-columns: repeat(4,1fr); }
  .hero { height: 300px; }
  .hero-inner h1 { font-size: var(--fs-2xl); }
}
</style>
