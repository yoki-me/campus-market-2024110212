<script setup lang="ts">
import { ref } from 'vue'
import type { Notice } from '@/types'
import { Warning } from '@element-plus/icons-vue'

defineProps<{ notices: Notice[] }>()
const open = ref(false)
</script>

<template>
  <div v-if="notices.length" class="safety">
    <button class="safety-trigger" @click="open = !open">
      <el-icon :size="14"><Warning /></el-icon>
      <span>安全须知</span>
      <span class="chevron" :class="{ up: open }">▾</span>
    </button>
    <div v-show="open" class="safety-body">
      <div v-for="n in notices" :key="n.id" class="safety-item">
        <div class="safety-title">{{ n.title }}</div>
        <div class="safety-text">{{ n.content }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.safety { background: var(--c-surface); border: 1px solid var(--c-border); border-radius: var(--r-lg); }
.safety-trigger {
  display: flex; align-items: center; gap: var(--s-2); width: 100%;
  padding: var(--s-4) var(--s-5); border: none; background: none;
  font-family: var(--font); font-size: var(--fs-sm); font-weight: 600;
  color: var(--c-text); cursor: pointer;
}
.chevron { margin-left: auto; transition: transform .2s ease; font-size: var(--fs-xs); color: var(--c-text-3); }
.chevron.up { transform: rotate(180deg); }
.safety-body { padding: 0 var(--s-5) var(--s-4); display: flex; flex-direction: column; gap: var(--s-3); }
.safety-item { padding: var(--s-3) var(--s-4); background: var(--c-bg); border-radius: var(--r-sm); }
.safety-title { font-weight: 600; font-size: var(--fs-sm); margin-bottom: var(--s-1); }
.safety-text { font-size: var(--fs-xs); color: var(--c-text-2); line-height: 1.6; }
</style>
