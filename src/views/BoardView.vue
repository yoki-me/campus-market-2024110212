<script setup lang="ts">
const stats = [
  { label: '商品总数', value: '1,286' },
  { label: '活跃用户', value: '3,452' },
  { label: '今日交易', value: '128' },
  { label: '待处理', value: '42' },
]
</script>

<template>
  <div class="board">
    <h1>看板页</h1>
    <div class="stats">
      <div v-for="item in stats" :key="item.label" class="stat-item">
        <span class="stat-value">{{ item.value }}</span>
        <span class="stat-label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board {
  padding: 20px;
}

.stats {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}
</style>