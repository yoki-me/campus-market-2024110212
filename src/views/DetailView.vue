<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const itemId = route.params.id
</script>

<template>
  <div class="detail">
    <h1>详情页</h1>
    <p>商品ID: {{ itemId }}</p>
    <p>商品名称: 二手笔记本电脑</p>
    <p>价格: ¥2500</p>
    <RouterLink to="/list" class="back-link">← 返回列表</RouterLink>
  </div>
</template>

<style scoped>
.detail {
  padding: 20px;
}

.back-link {
  display: inline-block;
  margin-top: 20px;
  color: #1890ff;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}
</style>