import { get, post, patch } from './index'
import type { Conversation } from '@/types'

export function getConversations(userId: string): Promise<Conversation[]> {
  return get<Conversation[]>(`/conversations?buyerId=${userId}&_sort=updatedAt&_order=desc`)
}

export function getConversation(id: string): Promise<Conversation> {
  return get<Conversation>(`/conversations/${id}`)
}

export function getConversationByItemAndUser(
  itemId: string,
  buyerId: string,
): Promise<Conversation[]> {
  return get<Conversation[]>(
    `/conversations?itemId=${itemId}&buyerId=${buyerId}`,
  )
}

export function createConversation(
  conversation: Omit<Conversation, 'id'>,
): Promise<Conversation> {
  return post<Conversation>('/conversations', conversation)
}

export function updateConversation(
  id: string,
  conversation: Partial<Conversation>,
): Promise<Conversation> {
  return patch<Conversation>(`/conversations/${id}`, conversation)
}
