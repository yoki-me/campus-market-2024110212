<script setup lang="ts">
import type { CampusItem } from '@/types'
import { ItemTypeLabels, ItemStatusLabels } from '@/types'

defineProps<{ item: CampusItem }>()
const emit = defineEmits<{ click: [item: CampusItem]; toggleFav: [item: CampusItem] }>()

const typeStyle: Record<string, string> = {
  trades: 'var(--c-amber)',
  lostFounds: 'var(--c-green)',
  groupBuys: '#5b5ea6',
  errands: '#6b705c',
}

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
    case 'trades': return `¥${item.price}`
    case 'lostFounds': return item.lostOrFound === 'lost' ? '寻物' : '招领'
    case 'groupBuys': return `${item.currentCount}/${item.targetCount}人`
    case 'errands': return item.reward ? `¥${item.reward}` : '面议'
    default: return ''
  }
}
</script>

<template>
  <div class="ic" @click="emit('click', item)">
    <div class="ic-img">
      <img v-if="item.images?.[0]" :src="item.images[0]" :alt="item.title" />
      <div v-else class="ic-img-placeholder"></div>
      <span class="ic-type" :style="{ background: typeStyle[item.type] }">{{ ItemTypeLabels[item.type] }}</span>
    </div>
    <div class="ic-body">
      <h3 class="ic-title">{{ item.title }}</h3>
      <p class="ic-desc">{{ item.description }}</p>
      <div class="ic-meta">
        <span class="ic-price">{{ summary(item) }}</span>
        <span class="ic-status">{{ ItemStatusLabels[item.status] }}</span>
      </div>
      <div class="ic-foot">
        <span>{{ item.campus }}</span>
        <span>{{ fmt(item.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ic {
  background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-lg); overflow: hidden; cursor: pointer;
  transition: all .2s ease;
}
.ic:hover { box-shadow: var(--shadow-md); }
.ic-img {
  height: 160px; position: relative; overflow: hidden; background-color: var(--c-border-2);
}
.ic-img img { width: 100%; height: 100%; object-fit: cover; }
.ic-img-placeholder { width: 100%; height: 100%; }
.ic-type {
  position: absolute; top: var(--s-3); left: var(--s-3);
  padding: 3px 10px; border-radius: 999px; color: #fff;
  font-size: var(--fs-xs); font-weight: 600;
}
.ic-body { padding: var(--s-4); display: flex; flex-direction: column; gap: var(--s-2); }
.ic-title {
  font-size: var(--fs-base); font-weight: 600; color: var(--c-text);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  line-height: 1.4;
}
.ic-desc {
  font-size: var(--fs-xs); color: var(--c-text-3); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.ic-meta { display: flex; justify-content: space-between; align-items: center; }
.ic-price { font-size: var(--fs-md); font-weight: 700; color: var(--c-text); }
.ic-status { font-size: var(--fs-xs); color: var(--c-text-3); }
.ic-foot {
  display: flex; justify-content: space-between; font-size: var(--fs-xs);
  color: var(--c-text-3); padding-top: var(--s-2); border-top: 1px solid var(--c-border-2);
}
</style>
