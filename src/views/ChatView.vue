<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessagesStore } from '@/stores/messages'
import { useUserStore } from '@/stores/user'
import { ArrowLeft, Promotion } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const messagesStore = useMessagesStore()
const userStore = useUserStore()
const inputText = ref('')
const loading = ref(true)
const bodyRef = ref<HTMLElement | null>(null)
const convId = route.params.conversationId as string

onMounted(async () => {
  loading.value = true
  try { await messagesStore.fetchConversations(); await messagesStore.fetchMessages(convId) }
  finally { loading.value = false; scroll() }
})

watch(() => messagesStore.currentMessages.length, () => nextTick(() => scroll()))
function scroll() { if (bodyRef.value) bodyRef.value.scrollTop = bodyRef.value.scrollHeight }

async function send() {
  const t = inputText.value.trim(); if (!t) return; inputText.value = ''; await messagesStore.sendMessage(t)
}
function isMine(senderId: string) { return senderId === userStore.userId }
function fmt(dateStr: string) { return new Date(dateStr).toLocaleString('zh-CN', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) }
</script>

<template>
  <div class="chat-root">
    <div class="chat-card">
      <div class="chat-top">
        <button class="back" @click="router.push('/message')"><el-icon :size="14"><ArrowLeft /></el-icon></button>
        <div class="chat-top-info">
          <strong>{{ messagesStore.currentConversation?.otherUserName || '对话' }}</strong>
          <span v-if="messagesStore.currentConversation?.itemTitle" class="ct-sub">{{ messagesStore.currentConversation.itemTitle }}</span>
        </div>
      </div>
      <div v-if="loading" class="loading-box" style="flex:1"><div class="spinner"></div></div>
      <div ref="bodyRef" class="chat-body" v-else>
        <div v-if="!messagesStore.currentMessages.length" class="empty-box"><span>发送第一条消息</span></div>
        <div v-for="m in messagesStore.currentMessages" :key="m.id" class="msg-row" :class="{ mine: isMine(m.senderId) }">
          <div class="bubble" :class="{ mine: isMine(m.senderId), sys: m.messageType !== 'text' }">
            <span class="b-text">{{ m.content }}</span>
            <span class="b-time">{{ fmt(m.createdAt) }}</span>
          </div>
        </div>
      </div>
      <div class="chat-bar">
        <input v-model="inputText" class="input" placeholder="输入消息..." @keyup.enter="send" />
        <button class="btn btn--primary btn--sm" :disabled="!inputText.trim()" @click="send">
          <el-icon :size="14"><Promotion /></el-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-root { height: calc(100vh - 48px); display: flex; align-items: center; justify-content: center; background: var(--c-bg); padding: var(--s-4); }
.chat-card { width: 100%; max-width: 680px; height: 100%; background: var(--c-surface); border: 1px solid var(--c-border); border-radius: var(--r-lg); display: flex; flex-direction: column; overflow: hidden; }
.chat-top { display: flex; align-items: center; gap: var(--s-3); padding: var(--s-4) var(--s-5); border-bottom: 1px solid var(--c-border); flex-shrink: 0; }
.back { width: 32px; height: 32px; border: none; background: none; border-radius: var(--r-sm); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--c-text-2); }
.back:hover { background: var(--c-bg); }
.chat-top-info strong { font-size: var(--fs-base); display: block; }
.ct-sub { font-size: var(--fs-xs); color: var(--c-text-3); }
.chat-body { flex: 1; overflow-y: auto; padding: var(--s-5); display: flex; flex-direction: column; gap: var(--s-2); }
.msg-row { display: flex; }
.msg-row.mine { justify-content: flex-end; }
.bubble { max-width: 70%; padding: 10px 16px; border-radius: 16px; font-size: var(--fs-sm); line-height: 1.5; background: var(--c-bg); }
.bubble.mine { background: var(--c-accent); color: #fff; }
.bubble.sys { background: #fafaf7; border: 1px solid var(--c-border); color: var(--c-text-2); }
.b-text { display: block; word-break: break-word; }
.b-time { display: block; font-size: 10px; margin-top: 4px; opacity: .45; }
.bubble.mine .b-time { text-align: right; }
.chat-bar { display: flex; gap: var(--s-2); padding: var(--s-4) var(--s-5); border-top: 1px solid var(--c-border); flex-shrink: 0; }
.chat-bar .input { flex: 1; }
</style>
