<script setup lang="ts">
import type { ItemStatus } from '@/types'
import { ItemStatusLabels } from '@/types'

defineProps<{ status: ItemStatus }>()

const colorMap: Record<ItemStatus, string> = {
  active: '#2d5a27', in_progress: '#8b6914', completed: '#1c1c1c',
  closed: '#8c8c8c', found: '#2d5a27', claimed: '#2d5a27',
}
</script>

<template>
  <span class="stag" :style="{ background: colorMap[status] + '12', color: colorMap[status] }">
    {{ ItemStatusLabels[status] }}
  </span>
</template>

<style scoped>
.stag {
  display: inline-block; padding: 2px 10px; border-radius: 999px;
  font-size: var(--fs-xs); font-weight: 600; letter-spacing: 0;
}
</style>
