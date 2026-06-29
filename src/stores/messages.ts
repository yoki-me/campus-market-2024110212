import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Conversation, Message } from '@/types'
import { getCollectionFromId } from '@/types'
import { getConversations, getConversationByItemAndUser, createConversation, updateConversation } from '@/api/conversations'
import { getMessages, sendMessage as sendMessageApi, markAsRead } from '@/api/messages'
import { useUserStore } from './user'
import { getItem } from '@/api/items'

// 模拟回复模板
const AUTO_REPLIES = [
  '好的，我看到了，请问有什么可以帮您？',
  '在的，详情可以私聊哦~',
  '不好意思刚看到消息，还在的',
  '可以的，具体可以约个时间面谈',
  '已经有人联系我了，不过还没确定，你可以先看看',
  '好的，价格可以商量',
  '抱歉，已经出了，忘记更新状态了',
  '在的在的，你是哪个校区的？',
  '没问题，你定个时间？',
  '好的！',
]

export const useMessagesStore = defineStore('messages', () => {
  const conversations = ref<Conversation[]>([])
  const currentMessages = ref<Message[]>([])
  const currentConversation = ref<Conversation | null>(null)
  const loading = ref(false)

  const totalUnreadCount = computed(() =>
    conversations.value.reduce((sum, c) => sum + c.unreadCount, 0),
  )

  // 加载会话列表
  async function fetchConversations() {
    const userStore = useUserStore()
    if (!userStore.userId) return

    loading.value = true
    try {
      conversations.value = await getConversations(userStore.userId)
    } finally {
      loading.value = false
    }
  }

  // 加载某个会话的消息
  async function fetchMessages(conversationId: string) {
    loading.value = true
    try {
      currentMessages.value = await getMessages(conversationId)
      // 获取完整会话信息
      const conv = conversations.value.find((c) => c.id === conversationId)
      if (conv) {
        currentConversation.value = conv
        // 标记已读
        if (conv.unreadCount > 0) {
          for (const msg of currentMessages.value) {
            if (!msg.read) {
              await markAsRead(msg.id)
            }
          }
          conv.unreadCount = 0
          await updateConversation(conversationId, { unreadCount: 0 })
        }
      }
    } finally {
      loading.value = false
    }
  }

  // 发送消息
  async function sendMessage(content: string, messageType: Message['messageType'] = 'text') {
    const userStore = useUserStore()
    if (!userStore.userId || !currentConversation.value) return null

    const msg = await sendMessageApi({
      conversationId: currentConversation.value.id,
      senderId: userStore.userId,
      receiverId: currentConversation.value.publisherId,
      content,
      messageType,
    })
    currentMessages.value.push(msg)

    // 更新会话最后消息
    await updateConversation(currentConversation.value.id, {
      lastMessage: content,
      updatedAt: new Date().toISOString(),
      unreadCount: 1,
    })

    // 1秒后模拟回复
    if (messageType === 'text') {
      setTimeout(async () => {
        await simulateReply()
      }, 1000)
    }

    return msg
  }

  // 模拟回复
  async function simulateReply() {
    if (!currentConversation.value) return

    const reply =
      AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)] || '好的，收到！'
    const replyMsg = await sendMessageApi({
      conversationId: currentConversation.value.id,
      senderId: currentConversation.value.publisherId,
      receiverId: currentConversation.value.buyerId,
      content: reply,
      messageType: 'text',
    })
    currentMessages.value.push(replyMsg)

    await updateConversation(currentConversation.value.id, {
      lastMessage: reply,
      updatedAt: new Date().toISOString(),
    })
  }

  // 创建会话
  async function openConversation(itemId: string, publisherId: string): Promise<Conversation> {
    const userStore = useUserStore()
    // 检查是否已有会话
    const existing = conversations.value.find(
      (c) => c.itemId === itemId && c.buyerId === userStore.userId,
    )
    if (existing) return existing

    // 获取物品信息
    const item = await getItem(itemId)
    const collection = getCollectionFromId(itemId)
    const conv = await createConversation({
      itemId,
      collection,
      buyerId: userStore.userId,
      publisherId,
      lastMessage: '',
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
      itemTitle: item.title,
      otherUserName: item.publisherName || '用户',
    })
    conversations.value.unshift(conv)
    return conv
  }

  return {
    conversations,
    currentMessages,
    currentConversation,
    loading,
    totalUnreadCount,
    fetchConversations,
    fetchMessages,
    sendMessage,
    openConversation,
  }
})
