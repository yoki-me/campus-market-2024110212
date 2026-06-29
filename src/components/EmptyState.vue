<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>

<template>
  <div class="empty-state">
    <span class="empty-icon">—</span>
    <span class="empty-text">{{ text }}</span>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-2);
  padding: var(--s-16) var(--s-6);
}

.empty-icon {
  font-size: var(--fs-xl);
  color: var(--c-text-3);
}

.empty-text {
  font-size: var(--fs-sm);
  color: var(--c-text-3);
}
</style>
