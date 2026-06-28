<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMessagesStore } from '@/stores/messages'

const route = useRoute()
const messagesStore = useMessagesStore()

const tabs = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/list', label: '集市', icon: '🛒' },
  { path: '/publish', label: '发布', icon: '➕' },
  { path: '/message', label: '消息', icon: '💬', badge: true },
  { path: '/profile', label: '我的', icon: '👤' },
]

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="app-nav">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      class="nav-item"
      :class="{ active: isActive(tab.path) }"
    >
      <span class="nav-icon">
        {{ tab.icon }}
        <span v-if="tab.badge && messagesStore.totalUnreadCount > 0" class="nav-badge">
          {{ messagesStore.totalUnreadCount > 99 ? '99+' : messagesStore.totalUnreadCount }}
        </span>
      </span>
      <span class="nav-label">{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.app-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  color: #999;
  font-size: 11px;
  padding: 4px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  min-width: 56px;
}

.nav-item:hover {
  color: #667eea;
}

.nav-item.active {
  color: #667eea;
}

.nav-item.active .nav-label {
  font-weight: 600;
}

.nav-icon {
  position: relative;
  font-size: 22px;
  line-height: 1;
}

.nav-badge {
  position: absolute;
  top: -6px;
  right: -10px;
  background: #ff4d4f;
  color: white;
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  font-weight: bold;
}

.nav-label {
  font-size: 11px;
}
</style>
