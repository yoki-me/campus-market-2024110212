<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { useFavoritesStore } from '@/stores/favorites'
import { useMessagesStore } from '@/stores/messages'
import { useUserStore } from '@/stores/user'
import type { CampusItem } from '@/types'
import { ItemTypeLabels, ItemStatusLabels } from '@/types'
import { Star, ChatDotRound, Coin } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const itemsStore = useItemsStore()
const favoritesStore = useFavoritesStore()
const messagesStore = useMessagesStore()
const userStore = useUserStore()

const item = ref<CampusItem | null>(null)
const loading = ref(true)
const bargainOpen = ref(false)
const bargainPrice = ref('')
const bargainReply = ref('')
const bargainLoading = ref(false)

const itemId = computed(() => route.params.id as string)
const isFav = computed(() => favoritesStore.isFavorited(itemId.value))

onMounted(async () => {
  loading.value = true
  try { const r = await itemsStore.fetchItem(itemId.value); item.value = r; await favoritesStore.fetchFavorites() }
  finally { loading.value = false }
})

async function toggleFav() { if (item.value) await favoritesStore.toggleFavorite(item.value.id) }
async function goChat() {
  if (!item.value) return
  const c = await messagesStore.openConversation(item.value.id, item.value.publisherId)
  router.push(`/chat/${c.id}`)
}
function submitBargain() {
  const p = parseFloat(bargainPrice.value)
  if (!p || p <= 0 || !item.value) return
  if (p >= (item.value.price || 0)) { bargainReply.value = '出价应低于商品价格'; return }
  bargainLoading.value = true
  const orig = item.value.price || 0; const r = p / orig
  setTimeout(() => {
    if (r >= .9) bargainReply.value = `¥${p} 可以的，差不多就这个价。`
    else if (r >= .7) bargainReply.value = `¥${p} 有点低了，最低 ¥${Math.round(orig*.85)}。`
    else if (r >= .5) bargainReply.value = `这个价格太低，最低 ¥${Math.round(orig*.75)}，诚心要的话。`
    else bargainReply.value = `不太现实，你再考虑一下？`
    bargainLoading.value = false
  }, 1200)
}
function fmt(dateStr: string) { return new Date(dateStr).toLocaleString('zh-CN', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) }
</script>

<template>
  <div class="page anim-up">
    <div class="breadcrumb"><RouterLink to="/">首页</RouterLink> / <RouterLink to="/list">集市</RouterLink> / <span>{{ item?.title || '详情' }}</span></div>
    <div v-if="loading" class="loading-box"><div class="spinner"></div></div>
    <template v-else-if="item">
      <div class="dt-layout">
        <!-- Left -->
        <div class="dt-main">
          <div class="dt-img card" :style="{ backgroundImage: item.images?.[0] ? `url(${item.images[0]})` : 'none' }">
            <span class="dt-type" :style="{ background: {trades:'#8b6914',lostFounds:'#2d5a27',groupBuys:'#5b5ea6',errands:'#6b705c'}[item.type] }">{{ ItemTypeLabels[item.type] }}</span>
          </div>
          <section class="card" style="padding:var(--s-6);margin-bottom:var(--s-5)">
            <h2 class="sec-title">详细描述</h2>
            <p class="desc-text">{{ item.description }}</p>
          </section>
          <section v-if="item.tags?.length" class="card" style="padding:var(--s-6)">
            <h2 class="sec-title">标签</h2>
            <div class="tags-row"><span v-for="t in item.tags" :key="t" class="tag" style="background:var(--c-bg);color:var(--c-text-2)">{{ t }}</span></div>
          </section>
        </div>

        <!-- Right sidebar -->
        <aside class="dt-side">
          <div class="card" style="padding:var(--s-6)">
            <span class="st-badge">{{ ItemStatusLabels[item.status] }}</span>
            <h1 class="dt-title">{{ item.title }}</h1>

            <!-- type-specific -->
            <div v-if="item.type==='trades'" class="typed">
              <div class="big-price">¥{{ item.price }}</div>
              <span class="typed-sub">{{ item.condition }}</span>
              <button v-if="item.allowBargain !== false" class="btn btn--ghost btn--sm" style="margin-top:var(--s-3)" @click="bargainOpen=!bargainOpen">
                <el-icon :size="12"><Coin /></el-icon> {{ bargainOpen ? '收起砍价' : '我要砍价' }}
              </button>
            </div>
            <div v-else-if="item.type==='lostFounds'" class="typed">
              <strong>{{ item.lostOrFound === 'lost' ? '寻物启事' : '失物招领' }}</strong>
              <span class="typed-sub">时间：{{ item.eventTime }}</span>
              <span v-if="item.itemFeature" class="typed-sub">特征：{{ item.itemFeature }}</span>
            </div>
            <div v-else-if="item.type==='groupBuys'" class="typed">
              <div class="big-price">{{ item.currentCount }}/{{ item.targetCount }} 人</div>
              <div class="pg-bar"><div class="pg-fill" :style="{ width: `${((item.currentCount||0)/(item.targetCount||1))*100}%` }"></div></div>
              <span class="typed-sub">截止：{{ item.deadline ? new Date(item.deadline).toLocaleDateString('zh-CN') : '' }}</span>
            </div>
            <div v-else-if="item.type==='errands'" class="typed">
              <div class="big-price">{{ item.reward ? `¥${item.reward}` : '面议' }}</div>
              <span class="typed-sub">{{ item.taskPlace || item.location }}</span>
            </div>

            <!-- Bargain -->
            <div v-if="bargainOpen && item.type==='trades'" class="bargain-box">
              <div class="bargain-row">
                <span>¥</span><input v-model="bargainPrice" type="number" class="input" placeholder="你的出价" />
                <button class="btn btn--primary btn--sm" :disabled="!bargainPrice || bargainLoading" @click="submitBargain">出价</button>
              </div>
              <p v-if="bargainReply" class="bargain-reply">{{ bargainReply }}</p>
            </div>

            <!-- Info rows -->
            <div class="info-rows">
              <div class="ir"><span class="ir-l">地点</span><span class="ir-v">{{ item.location }}</span></div>
              <div class="ir"><span class="ir-l">校区</span><span class="ir-v">{{ item.campus }}</span></div>
              <div class="ir"><span class="ir-l">发布者</span><span class="ir-v">{{ item.publisherName }}</span></div>
              <div class="ir"><span class="ir-l">时间</span><span class="ir-v">{{ fmt(item.createdAt) }}</span></div>
              <div class="ir"><span class="ir-l">浏览</span><span class="ir-v">{{ item.viewCount }}</span></div>
              <div class="ir"><span class="ir-l">收藏</span><span class="ir-v">{{ item.favoriteCount }}</span></div>
            </div>

            <div class="dt-actions">
              <button class="btn btn--primary btn--lg" style="flex:1" @click="goChat">
                <el-icon :size="14"><ChatDotRound /></el-icon> 联系发布者
              </button>
              <button class="btn btn--ghost btn--lg" @click="toggleFav">
                <el-icon :size="14"><Star /></el-icon> {{ isFav ? '已收藏' : '收藏' }}
              </button>
            </div>
          </div>

          <div class="card" style="padding:var(--s-4);margin-top:var(--s-4);display:flex;align-items:center;gap:var(--s-3)">
            <div style="width:36px;height:36px;background:var(--c-accent);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:var(--fs-sm)">{{ (item.publisherName||'用')[0] }}</div>
            <div><div style="font-weight:600;font-size:var(--fs-sm)">{{ item.publisherName }}</div><div style="font-size:var(--fs-xs);color:var(--c-text-3)">信用良好</div></div>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dt-layout { display: grid; grid-template-columns: 1fr 380px; gap: var(--s-6); align-items: start; }
.dt-main { min-width: 0; }
.dt-side { position: sticky; top: 68px; display: flex; flex-direction: column; gap: var(--s-4); }
.dt-img { height: 340px; background-size: cover; background-position: center; border-radius: var(--r-lg); position: relative; background-color: #f0eee9; }
.dt-type { position: absolute; top: var(--s-4); left: var(--s-4); padding: 4px 14px; border-radius: 999px; color: #fff; font-size: var(--fs-xs); font-weight: 600; }
.sec-title { font-size: var(--fs-md); font-weight: 700; margin: 0 0 var(--s-4); }
.desc-text { font-size: var(--fs-base); color: var(--c-text-2); line-height: 1.8; margin: 0; }
.tags-row { display: flex; flex-wrap: wrap; gap: var(--s-2); }

.st-badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: var(--fs-xs); font-weight: 600; background: #f0eee9; margin-bottom: var(--s-3); }
.dt-title { font-size: var(--fs-xl); font-weight: 700; margin: 0 0 var(--s-5); line-height: 1.3; letter-spacing: -.02em; }

.typed { padding: var(--s-5); background: var(--c-bg); border-radius: var(--r-md); margin-bottom: var(--s-5); }
.big-price { font-size: 32px; font-weight: 700; color: var(--c-text); letter-spacing: -.03em; }
.typed-sub { display: block; font-size: var(--fs-sm); color: var(--c-text-2); margin-top: var(--s-1); }

.pg-bar { height: 4px; background: var(--c-border); border-radius: 2px; margin: var(--s-2) 0; overflow: hidden; }
.pg-fill { height: 100%; background: var(--c-accent); border-radius: 2px; transition: width .5s; }

.bargain-box { background: #fafaf7; border: 1px solid var(--c-border); border-radius: var(--r-md); padding: var(--s-4); margin-bottom: var(--s-4); }
.bargain-row { display: flex; gap: var(--s-2); align-items: center; }
.bargain-row span { font-weight: 700; }
.bargain-reply { margin: var(--s-3) 0 0; font-size: var(--fs-sm); color: var(--c-text-2); }

.info-rows { display: flex; flex-direction: column; gap: var(--s-3); margin: var(--s-5) 0; }
.ir { display: flex; justify-content: space-between; padding: var(--s-2) 0; border-bottom: 1px solid var(--c-border-2); }
.ir-l { font-size: var(--fs-sm); color: var(--c-text-3); }
.ir-v { font-size: var(--fs-sm); font-weight: 500; }

.dt-actions { display: flex; gap: var(--s-3); }

@media (max-width: 900px) { .dt-layout { grid-template-columns: 1fr; } .dt-side { position: static; } }
</style>
