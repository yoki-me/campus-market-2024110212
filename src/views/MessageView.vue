<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessagesStore } from '@/stores/messages'
import { ChatDotRound } from '@element-plus/icons-vue'

const router = useRouter()
const messagesStore = useMessagesStore()
const loading = ref(true)
const filter = ref<'all'|'unread'>('all')

onMounted(async () => { loading.value = true; try { await messagesStore.fetchConversations() } finally { loading.value = false } })

const list = computed(() => filter.value === 'unread' ? messagesStore.conversations.filter(c => c.unreadCount) : messagesStore.conversations)
const unreadCount = computed(() => messagesStore.totalUnreadCount)

function fmt(dateStr: string) {
  const d = new Date(dateStr); const now = new Date()
  const h = Math.floor((now.getTime() - d.getTime()) / 3600000)
  if (h < 1) return '刚刚'
  if (h < 24) return `${h}小时前`
  if (h < 168) return `${Math.floor(h/24)}天前`
  return d.toLocaleDateString('zh-CN')
}
</script>

<template>
  <div class="page anim-up">
    <div class="breadcrumb"><RouterLink to="/">首页</RouterLink> / <span>消息中心</span></div>
    <div class="msg-layout">
      <div class="msg-side">
        <div class="msg-side-head">
          <h2>消息</h2>
          <span v-if="unreadCount" class="badge-count">{{ unreadCount }}</span>
        </div>
        <div class="msg-tabs">
          <button class="mtab" :class="{ on: filter === 'all' }" @click="filter='all'">全部</button>
          <button class="mtab" :class="{ on: filter === 'unread' }" @click="filter='unread'">未读</button>
        </div>
        <div v-if="loading" class="loading-box"><div class="spinner"></div></div>
        <div v-else-if="!list.length" class="empty-box" style="padding:var(--s-8)">暂无消息</div>
        <div v-else class="conv-list">
          <div v-for="c in list" :key="c.id" class="conv-item" :class="{ unread: c.unreadCount }" @click="router.push(`/chat/${c.id}`)">
            <div class="ci-av">{{ (c.otherUserName||'用')[0] }}</div>
            <div class="ci-body">
              <div class="ci-top"><span class="ci-name">{{ c.otherUserName }}</span><span class="ci-time">{{ fmt(c.updatedAt) }}</span></div>
              <div class="ci-bottom"><span class="ci-msg">{{ c.lastMessage || '暂无消息' }}</span><span v-if="c.unreadCount" class="ci-badge">{{ c.unreadCount }}</span></div>
              <div v-if="c.itemTitle" class="ci-ref">{{ c.itemTitle }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="msg-main">
        <div class="msg-placeholder">
          <el-icon :size="48" style="color:var(--c-border)"><ChatDotRound /></el-icon>
          <span style="font-weight:600;color:var(--c-text)">选择一条会话</span>
          <span style="font-size:var(--fs-sm);color:var(--c-text-3)">从左侧选择会话查看聊天详情</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.msg-layout { display: grid; grid-template-columns: 340px 1fr; background: var(--c-surface); border: 1px solid var(--c-border); border-radius: var(--r-lg); min-height: 640px; overflow: hidden; }
.msg-side { border-right: 1px solid var(--c-border); display: flex; flex-direction: column; }
.msg-side-head { display: flex; align-items: center; gap: var(--s-2); padding: var(--s-5) var(--s-5); border-bottom: 1px solid var(--c-border); }
.msg-side-head h2 { font-size: var(--fs-lg); font-weight: 700; margin: 0; }
.badge-count { background: var(--c-red); color: #fff; padding: 1px 8px; border-radius: 10px; font-size: var(--fs-xs); font-weight: 600; }
.msg-tabs { display: flex; padding: var(--s-3) var(--s-4); gap: var(--s-2); border-bottom: 1px solid var(--c-border); }
.mtab { flex: 1; padding: 6px 0; border: none; background: none; border-radius: var(--r-sm); font-family: var(--font); font-size: var(--fs-sm); color: var(--c-text-2); cursor: pointer; transition: all .1s; }
.mtab:hover { background: var(--c-bg); }
.mtab.on { background: var(--c-accent); color: #fff; }
.conv-list { flex: 1; overflow-y: auto; }
.conv-item { display: flex; gap: var(--s-3); padding: var(--s-4) var(--s-5); cursor: pointer; transition: background .1s; border-bottom: 1px solid var(--c-border-2); }
.conv-item:hover { background: var(--c-bg); }
.conv-item.unread { background: #fafaf8; }
.ci-av { width: 40px; height: 40px; background: #f0eee9; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: var(--fs-md); color: var(--c-text-2); flex-shrink: 0; }
.ci-body { flex: 1; min-width: 0; }
.ci-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
.ci-name { font-weight: 600; font-size: var(--fs-sm); }
.ci-time { font-size: var(--fs-xs); color: var(--c-text-3); }
.ci-bottom { display: flex; justify-content: space-between; align-items: center; }
.ci-msg { font-size: var(--fs-xs); color: var(--c-text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
.ci-badge { min-width: 18px; height: 18px; padding: 0 5px; background: var(--c-red); color: #fff; border-radius: 9px; font-size: 10px; display: flex; align-items: center; justify-content: center; margin-left: var(--s-2); }
.ci-ref { font-size: 10px; color: var(--c-text-3); margin-top: 2px; }
.msg-main { display: flex; align-items: center; justify-content: center; background: var(--c-bg); }
.msg-placeholder { display: flex; flex-direction: column; align-items: center; gap: var(--s-3); }

@media (max-width: 768px) { .msg-layout { grid-template-columns: 1fr; } .msg-main { display: none; } }
</style>
