<script setup lang="ts">
import { ref } from 'vue'

const items = ref([
  { id: 1, title: '二手笔记本电脑', price: 2500 },
])
</script>

<template>
  <div class="list">
    <h1>列表页</h1>
    <div class="item-list">
      <div v-for="item in items" :key="item.id" class="item">
        <div class="item-info">
          <h3>{{ item.title }}</h3>
          <p class="price">¥{{ item.price }}</p>
        </div>
        <RouterLink :to="`/detail/${item.id}`" class="detail-link">
          查看详情
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list {
  padding: 20px;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #dcdcdc;
  border-radius: 8px;
}

.item-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.price {
  margin: 0;
  color: #ff0000;
  font-weight: bold;
}

.detail-link {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;
}

.detail-link:hover {
  background: #40a9ff;
}
</style>
