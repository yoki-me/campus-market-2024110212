<script setup lang="ts">
import type { ItemType } from '@/types'
import { ItemTypeLabels } from '@/types'

defineProps<{ type: ItemType }>()

const bg: Record<ItemType, string> = { secondhand: '#8b6914', lostfound: '#2d5a27', groupbuy: '#5b5ea6', errand: '#6b705c' }
</script>

<template>
  <span class="tt" :style="{ background: bg[type] }">{{ ItemTypeLabels[type] }}</span>
</template>

<style scoped>
.tt { display: inline-block; padding: 2px 10px; border-radius: 999px; color: #fff; font-size: var(--fs-xs); font-weight: 600; }
</style>
