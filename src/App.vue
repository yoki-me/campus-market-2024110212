<script setup lang="ts"></script>

<template>
  <main class="app">
    <h1>校园轻集市</h1>
    <p>AI 辅助前端工程实践种子项目</p>
    <nav class="nav">
      <RouterLink to="/">首页</RouterLink>
      <RouterLink to="/list">列表页</RouterLink>
      <RouterLink to="/publish">发布页</RouterLink>
      <RouterLink to="/message">消息页</RouterLink>
      <RouterLink to="/profile">个人中心</RouterLink>
    </nav>
    <RouterView />
  </main>
</template>

<style scoped>
.app {
  padding: 32px;
}

.nav {
  display: flex;
  gap: 16px;
  margin: 16px 0;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.nav a {
  text-decoration: none;
  color: #333;
  padding: 8px 16px;
  border-radius: 4px;
}

.nav a:hover {
  background-color: #f8f3f3;
}

.nav a.router-link-active {
  background-color: #1890ff;
  color: white;
}
</style>
