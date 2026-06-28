<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'

const router = useRouter()
const itemsStore = useItemsStore()
const loading = ref(true)

onMounted(async () => {
  try { await itemsStore.fetchItems() } catch { /* silent */ }
  finally { loading.value = false }
})

const statCards = computed(() => [
  { label: '信息总数', val: itemsStore.items.length },
  { label: '进行中', val: itemsStore.items.filter(i => ['active','in_progress'].includes(i.status)).length },
  { label: '已完成', val: itemsStore.items.filter(i => ['completed','found','claimed'].includes(i.status)).length },
  { label: '总浏览',   val: itemsStore.items.reduce((s,i) => s + i.viewCount, 0) },
])

const typeLabels: Record<string,string> = { secondhand:'二手交易', lostfound:'失物招领', groupbuy:'拼单搭子', errand:'跑腿委托' }
const typeColors: Record<string,string> = { secondhand:'#8b6914', lostfound:'#2d5a27', groupbuy:'#5b5ea6', errand:'#6b705c' }

const typeData = computed(() => {
  const m: Record<string,number> = {}
  itemsStore.items.forEach(i => { m[i.type] = (m[i.type]||0)+1 })
  const total = Object.values(m).reduce((s,v) => s+v, 0) || 1
  return Object.entries(m).map(([k,v]) => ({ name: typeLabels[k]||k, count: v, pct: Math.round(v/total*100), color: typeColors[k]||'#8c8c8c' }))
})

const campusData = computed(() => {
  const m: Record<string,number> = {}
  itemsStore.items.forEach(i => { const c = i.campus.replace('校区',''); m[c] = (m[c]||0)+1 })
  const max = Math.max(1, ...Object.values(m))
  return Object.entries(m).map(([k,v]) => ({ name: k, count: v, pct: Math.round(v/max*100) }))
})

const statusLabels: Record<string,string> = { active:'进行中', in_progress:'处理中', completed:'已完成', closed:'已关闭', found:'已找回', claimed:'已认领' }
const statusColors: Record<string,string> = { active:'#2d5a27', in_progress:'#8b6914', completed:'#1c1c1c', closed:'#8c8c8c', found:'#5b5ea6', claimed:'#6b705c' }

const statusData = computed(() => {
  const m: Record<string,number> = {}
  itemsStore.items.forEach(i => { m[i.status] = (m[i.status]||0)+1 })
  const total = Object.values(m).reduce((s,v) => s+v, 0) || 1
  return Object.entries(m).map(([k,v]) => ({ name: statusLabels[k]||k, count: v, pct: Math.round(v/total*100), color: statusColors[k]||'#8c8c8c' }))
})

const topItems = computed(() =>
  [...itemsStore.items].sort((a,b) => b.viewCount - a.viewCount).slice(0, 5)
)
</script>

<template>
  <div class="page anim-up">
    <div class="breadcrumb"><RouterLink to="/">首页</RouterLink> / <span>趋势看板</span></div>
    <div class="page-header">
      <h1 class="page-title">数据概览</h1>
      <p class="page-sub">校园集市数据统计与分析</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div v-for="s in statCards" :key="s.label" class="card sc">
        <span class="sc-val">{{ s.val }}</span>
        <span class="sc-label">{{ s.label }}</span>
      </div>
    </div>

    <div v-if="loading" class="loading-box"><div class="spinner"></div><span>加载数据中...</span></div>

    <div v-else class="charts-grid">
      <!-- 类型占比 -->
      <div class="card chart-card">
        <h3>信息类型占比</h3>
        <div class="pie-viz">
          <div class="pie-ring" :style="{
            background: `conic-gradient(${typeData.map((d,i,a) => {
              const start = a.slice(0,i).reduce((s,x)=>s+x.pct,0)
              return `${d.color} ${start}% ${start+d.pct}%`
            }).join(',')})`
          }">
            <span class="pie-inner">{{ itemsStore.items.length }}</span>
          </div>
        </div>
        <div class="legend">
          <div v-for="d in typeData" :key="d.name" class="legend-item">
            <span class="leg-dot" :style="{ background: d.color }"></span>
            <span>{{ d.name }}</span>
            <span class="leg-val">{{ d.count }}</span>
          </div>
        </div>
      </div>

      <!-- 校区分布 -->
      <div class="card chart-card">
        <h3>校区信息分布</h3>
        <div class="bar-viz">
          <div v-for="d in campusData" :key="d.name" class="bar-item">
            <span class="bar-label">{{ d.name }}</span>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: d.pct + '%' }"></div>
            </div>
            <span class="bar-val">{{ d.count }}</span>
          </div>
        </div>
      </div>

      <!-- 状态统计 -->
      <div class="card chart-card">
        <h3>信息状态统计</h3>
        <div class="status-bars">
          <div v-for="d in statusData" :key="d.name" class="status-row">
            <span class="st-name">{{ d.name }}</span>
            <div class="st-track">
              <div class="st-fill" :style="{ width: d.pct + '%', background: d.color }"></div>
            </div>
            <span class="st-val">{{ d.count }}</span>
          </div>
        </div>
      </div>

      <!-- 热门 TOP 5 -->
      <div class="card chart-card">
        <h3>热门信息 TOP 5</h3>
        <div v-if="!topItems.length" class="empty-note">暂无数据</div>
        <div v-else class="top-list">
          <div v-for="(item,idx) in topItems" :key="item.id" class="top-row" @click="router.push(`/detail/${item.id}`)">
            <span class="top-num" :class="{ top: idx < 3 }">{{ idx + 1 }}</span>
            <span class="top-title">{{ item.title }}</span>
            <span class="top-views">{{ item.viewCount }} 次</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: var(--s-4); margin-bottom: var(--s-8); }
.sc { padding: var(--s-5); text-align: center; }
.sc-val { font-size: var(--fs-2xl); font-weight: 700; display: block; margin-bottom: var(--s-1); }
.sc-label { font-size: var(--fs-xs); color: var(--c-text-3); }

.charts-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: var(--s-5); }
.chart-card { padding: var(--s-5); }
.chart-card h3 { font-size: var(--fs-sm); font-weight: 700; margin: 0 0 var(--s-5); text-align: center; }

/* Pie ring */
.pie-viz { display: flex; justify-content: center; margin-bottom: var(--s-4); }
.pie-ring {
  width: 140px; height: 140px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.pie-inner {
  width: 76px; height: 76px; border-radius: 50%;
  background: var(--c-surface); display: flex; align-items: center; justify-content: center;
  font-size: var(--fs-xl); font-weight: 700;
}
.legend { display: flex; flex-direction: column; gap: var(--s-2); }
.legend-item { display: flex; align-items: center; gap: var(--s-2); font-size: var(--fs-xs); }
.leg-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.leg-val { margin-left: auto; font-weight: 600; color: var(--c-text); }

/* Bar viz */
.bar-viz { display: flex; flex-direction: column; gap: var(--s-4); }
.bar-item { display: flex; align-items: center; gap: var(--s-3); }
.bar-label { width: 48px; font-size: var(--fs-xs); color: var(--c-text-2); flex-shrink: 0; }
.bar-track { flex: 1; height: 10px; background: var(--c-border-2); border-radius: 5px; overflow: hidden; }
.bar-fill { height: 100%; background: var(--c-accent); border-radius: 5px; transition: width .6s ease; min-width: 4px; }
.bar-val { width: 24px; text-align: right; font-size: var(--fs-xs); font-weight: 600; flex-shrink: 0; }

/* Status bars */
.status-bars { display: flex; flex-direction: column; gap: var(--s-3); }
.status-row { display: flex; align-items: center; gap: var(--s-3); }
.st-name { width: 52px; font-size: var(--fs-xs); color: var(--c-text-2); flex-shrink: 0; }
.st-track { flex: 1; height: 8px; background: var(--c-border-2); border-radius: 4px; overflow: hidden; }
.st-fill { height: 100%; border-radius: 4px; transition: width .6s ease; min-width: 4px; }
.st-val { width: 24px; text-align: right; font-size: var(--fs-xs); font-weight: 600; flex-shrink: 0; }

/* Top list */
.empty-note { text-align: center; color: var(--c-text-3); padding: var(--s-8); font-size: var(--fs-sm); }
.top-list { display: flex; flex-direction: column; gap: var(--s-3); }
.top-row { display: flex; align-items: center; gap: var(--s-3); cursor: pointer; padding: var(--s-1) 0; transition: opacity .15s; }
.top-row:hover { opacity: .7; }
.top-num { width: 22px; height: 22px; border-radius: var(--r-sm); display: flex; align-items: center; justify-content: center; font-size: var(--fs-xs); font-weight: 700; background: var(--c-bg); color: var(--c-text-3); flex-shrink: 0; }
.top-num.top { background: var(--c-accent); color: #fff; }
.top-title { flex: 1; font-size: var(--fs-sm); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.top-views { font-size: var(--fs-xs); color: var(--c-text-3); white-space: nowrap; flex-shrink: 0; }

/* Empty / loading */
.empty-box { display: flex; flex-direction: column; align-items: center; gap: var(--s-2); padding: var(--s-16); color: var(--c-text-3); font-size: var(--fs-sm); }
.loading-box { display: flex; flex-direction: column; align-items: center; gap: var(--s-3); padding: var(--s-16); color: var(--c-text-3); font-size: var(--fs-sm); }
.spinner { width: 20px; height: 20px; border: 2px solid var(--c-border); border-top-color: var(--c-text-3); border-radius: 50%; animation: spin .6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) { .charts-grid { grid-template-columns: 1fr; } .stats-row { grid-template-columns: repeat(2,1fr); } }
</style>
