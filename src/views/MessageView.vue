<script setup lang="ts">
import { ref, onMounted, onActivated, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessagesStore } from '@/stores/messages'
import { ChatDotRound, Bell, Warning, InfoFilled, Present } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const messagesStore = useMessagesStore()
const loading = ref(true)
const filter = ref<'all'|'unread'|'read'>('all')

// ==================== 静态系统消息（Day6 铺垫） ====================
interface SystemMessage {
  id: number
  title: string
  content: string
  type: 'welcome' | 'tip' | 'safety' | 'notice'
  time: string
}

const systemMessages: SystemMessage[] = [
  {
    id: 1,
    title: '👋 欢迎来到校园集市',
    content: '校园集市是专为本校同学打造的互助平台，你可以在这里发布二手交易、失物招领、拼单搭子和跑腿委托信息，让校园生活更便利。',
    type: 'welcome',
    time: '2026-06-28 10:00',
  },
  {
    id: 2,
    title: '📢 发布功能已上线',
    content: '现在你可以自由发布四种类型的信息：二手交易、失物招领、拼单搭子和跑腿委托。发布后会自动关联到你的个人主页，方便管理和追踪。',
    type: 'tip',
    time: '2026-06-29 14:30',
  },
  {
    id: 3,
    title: '🔒 交易安全须知',
    content: '请尽量选择校园公共场所（如图书馆、食堂）进行线下交易。贵重物品当面验货后再付款，警惕异常低价和提前转账要求。遇到可疑行为请及时举报。',
    type: 'safety',
    time: '2026-06-30 09:00',
  },
  {
    id: 4,
    title: '💬 即时聊天即将上线',
    content: '我们正在开发即时聊天功能，届时你可以直接在平台上与买卖双方沟通，无需切换到其他聊天工具。所有聊天记录将保存在平台内，方便随时回溯。',
    type: 'notice',
    time: '2026-07-01 08:00',
  },
  {
    id: 5,
    title: '🎁 更多功能敬请期待',
    content: '收藏夹同步、消息推送通知、评价体系等功能正在紧锣密鼓地开发中，敬请期待 Day6 的全面升级！',
    type: 'notice',
    time: '2026-07-01 12:00',
  },
]

const typeIcon: Record<SystemMessage['type'], typeof Bell> = {
  welcome: Present,
  tip: Bell,
  safety: Warning,
  notice: InfoFilled,
}

const typeLabel: Record<SystemMessage['type'], string> = {
  welcome: '欢迎',
  tip: '提示',
  safety: '安全',
  notice: '公告',
}

async function loadConversations() {
  loading.value = true
  try {
    await messagesStore.fetchConversations()
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadConversations()
})

onActivated(async () => {
  await loadConversations()
})

const list = computed(() => {
  if (filter.value === 'unread') return messagesStore.conversations.filter(c => c.unreadCount)
  if (filter.value === 'read') return messagesStore.conversations.filter(c => c.unreadCount === 0)
  return messagesStore.conversations
})
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
          <button class="mtab" :class="{ on: filter === 'read' }" @click="filter='read'">已读</button>
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
        <div class="sys-msg-area">
          <div class="sys-msg-header">
            <h3><el-icon :size="16"><Bell /></el-icon> 系统消息</h3>
            <span class="sys-msg-sub">为你推送平台通知与使用指南</span>
          </div>
          <div class="sys-msg-list">
            <div
              v-for="msg in systemMessages"
              :key="msg.id"
              class="sys-card"
              :class="'sys-card--' + msg.type"
            >
              <div class="sys-card-icon">
                <el-icon :size="18"><component :is="typeIcon[msg.type]" /></el-icon>
              </div>
              <div class="sys-card-body">
                <div class="sys-card-head">
                  <span class="sys-card-tag" :class="'tag--' + msg.type">{{ typeLabel[msg.type] }}</span>
                  <span class="sys-card-title">{{ msg.title }}</span>
                  <span class="sys-card-time">{{ msg.time }}</span>
                </div>
                <p class="sys-card-text">{{ msg.content }}</p>
              </div>
            </div>
          </div>
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

/* ====== 系统消息区域 ====== */
.sys-msg-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 640px;
  width: 100%;
  padding: var(--s-8);
}
.sys-msg-header {
  margin-bottom: var(--s-6);
}
.sys-msg-header h3 {
  font-size: var(--fs-lg);
  font-weight: 700;
  margin: 0 0 var(--s-1);
  display: flex;
  align-items: center;
  gap: var(--s-2);
  color: var(--c-text);
}
.sys-msg-sub {
  font-size: var(--fs-xs);
  color: var(--c-text-3);
}
.sys-msg-list {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  overflow-y: auto;
  flex: 1;
}

/* 卡片 */
.sys-card {
  display: flex;
  gap: var(--s-4);
  padding: var(--s-5);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  transition: box-shadow 0.2s, transform 0.2s;
}
.sys-card:hover {
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.sys-card--welcome {
  border-left: 3px solid #667eea;
}
.sys-card--tip {
  border-left: 3px solid #67c23a;
}
.sys-card--safety {
  border-left: 3px solid #e6a23c;
}
.sys-card--notice {
  border-left: 3px solid #909399;
}

/* 图标 */
.sys-card-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.sys-card--welcome .sys-card-icon { background: #eef0ff; color: #667eea; }
.sys-card--tip .sys-card-icon      { background: #edf7e7; color: #67c23a; }
.sys-card--safety .sys-card-icon   { background: #fdf3e4; color: #e6a23c; }
.sys-card--notice .sys-card-icon   { background: #f0f0f0; color: #909399; }

/* 内容 */
.sys-card-body {
  flex: 1;
  min-width: 0;
}
.sys-card-head {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  margin-bottom: var(--s-2);
  flex-wrap: wrap;
}
.sys-card-tag {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}
.tag--welcome { background: #eef0ff; color: #667eea; }
.tag--tip     { background: #edf7e7; color: #67c23a; }
.tag--safety  { background: #fdf3e4; color: #e6a23c; }
.tag--notice  { background: #f0f0f0; color: #909399; }

.sys-card-title {
  font-weight: 600;
  font-size: var(--fs-sm);
  color: var(--c-text);
}
.sys-card-time {
  margin-left: auto;
  font-size: var(--fs-xs);
  color: var(--c-text-3);
  white-space: nowrap;
}
.sys-card-text {
  margin: 0;
  font-size: var(--fs-sm);
  color: var(--c-text-2);
  line-height: 1.7;
}

@media (max-width: 768px) { .msg-layout { grid-template-columns: 1fr; } .msg-main { display: none; } }
</style>
